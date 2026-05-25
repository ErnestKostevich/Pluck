/**
 * License key access for the web app.
 *
 * The private key is held only on the server — never sent to the client. It's
 * stored as a JSON-encoded JWK in the LICENSE_PRIVATE_KEY env var (set by
 * `pnpm gen-license-keys` locally, and added to Vercel project secrets in
 * production).
 *
 * The public key for verification lives bundled in the extension; the
 * verify endpoint here is an optional service for non-extension consumers
 * (e.g. a future admin dashboard).
 */

let cachedPrivateKey: CryptoKey | null = null;
let cachedPublicKey: CryptoKey | null = null;

export async function getPrivateKey(): Promise<CryptoKey> {
  if (cachedPrivateKey) return cachedPrivateKey;
  const raw = process.env.LICENSE_PRIVATE_KEY;
  if (!raw) {
    throw new Error('LICENSE_PRIVATE_KEY env var is not set. Run `pnpm gen-license-keys`.');
  }
  let jwk: JsonWebKey;
  try {
    jwk = JSON.parse(raw);
  } catch {
    throw new Error('LICENSE_PRIVATE_KEY is not valid JSON.');
  }
  cachedPrivateKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );
  return cachedPrivateKey;
}

export async function getPublicKey(): Promise<CryptoKey> {
  if (cachedPublicKey) return cachedPublicKey;
  // Derive the public key from the private JWK. (Or read LICENSE_PUBLIC_KEY
  // if we later split the env vars.)
  const raw = process.env.LICENSE_PRIVATE_KEY;
  if (!raw) {
    throw new Error('LICENSE_PRIVATE_KEY env var is not set.');
  }
  const privJwk = JSON.parse(raw) as JsonWebKey;
  const pubJwk: JsonWebKey = {
    kty: privJwk.kty,
    crv: privJwk.crv,
    x: privJwk.x,
    y: privJwk.y,
    alg: 'ES256',
    use: 'sig',
  };
  cachedPublicKey = await crypto.subtle.importKey(
    'jwk',
    pubJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['verify'],
  );
  return cachedPublicKey;
}

// ── JWT helpers ─────────────────────────────────────────────────────────────

export interface LicensePayload {
  sub: string;
  plan: 'free' | 'pro';
  iat: number;
  exp?: number;
  v?: number;
}

export async function signLicense(payload: LicensePayload): Promise<string> {
  const key = await getPrivateKey();
  const header = { alg: 'ES256', typ: 'JWT' };
  const headerB64 = b64urlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;
  const sig = new Uint8Array(
    await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      key,
      new TextEncoder().encode(signingInput) as BufferSource,
    ),
  );
  return `${signingInput}.${b64urlEncode(sig)}`;
}

export async function verifyLicense(
  jwt: string,
): Promise<{ valid: true; payload: LicensePayload } | { valid: false; reason: string }> {
  const parts = jwt.split('.');
  if (parts.length !== 3) return { valid: false, reason: 'malformed JWT' };
  const [headerB64, payloadB64, sigB64] = parts as [string, string, string];

  let header: { alg?: string };
  try {
    header = JSON.parse(b64urlDecodeString(headerB64));
  } catch {
    return { valid: false, reason: 'invalid header' };
  }
  if (header.alg !== 'ES256') return { valid: false, reason: 'unsupported alg' };

  let payload: LicensePayload;
  try {
    payload = JSON.parse(b64urlDecodeString(payloadB64));
  } catch {
    return { valid: false, reason: 'invalid payload' };
  }

  if (payload.exp != null && payload.exp * 1000 < Date.now()) {
    return { valid: false, reason: 'expired' };
  }

  const key = await getPublicKey();
  const ok = await crypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    b64urlDecodeBytes(sigB64) as BufferSource,
    new TextEncoder().encode(`${headerB64}.${payloadB64}`) as BufferSource,
  );
  if (!ok) return { valid: false, reason: 'invalid signature' };
  return { valid: true, payload };
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecodeBytes(s: string): Uint8Array {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function b64urlDecodeString(s: string): string {
  return new TextDecoder().decode(b64urlDecodeBytes(s));
}
