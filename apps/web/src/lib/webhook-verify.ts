/**
 * Verify a Standard Webhooks (https://www.standardwebhooks.com) signed payload.
 *
 * Polar.sh uses the Standard Webhooks signing scheme. The signed string is:
 *
 *   `${webhook-id}.${webhook-timestamp}.${raw-body}`
 *
 * with HMAC-SHA256 keyed by the webhook secret (which is base64-encoded with
 * a `whsec_` prefix). The signature header can carry multiple `v1,<base64>`
 * tokens separated by spaces, for key rotation.
 */

export interface StandardWebhookHeaders {
  id: string;
  timestamp: string;
  signature: string;
}

export function readWebhookHeaders(req: Request): StandardWebhookHeaders | null {
  const id = req.headers.get('webhook-id');
  const timestamp = req.headers.get('webhook-timestamp');
  const signature = req.headers.get('webhook-signature');
  if (!id || !timestamp || !signature) return null;
  return { id, timestamp, signature };
}

export async function verifyStandardWebhook(
  secret: string,
  headers: StandardWebhookHeaders,
  rawBody: string,
  toleranceSeconds = 300,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  // Validate timestamp window to mitigate replay attacks.
  const ts = Number(headers.timestamp);
  if (!Number.isFinite(ts)) return { ok: false, reason: 'invalid timestamp' };
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > toleranceSeconds) {
    return { ok: false, reason: 'timestamp outside tolerance window' };
  }

  // Strip the `whsec_` prefix if present and decode the secret.
  const secretBytes = base64Decode(secret.replace(/^whsec_/, ''));

  const message = `${headers.id}.${headers.timestamp}.${rawBody}`;
  const expected = await hmacSha256Base64(secretBytes, message);

  // Header can contain multiple `v1,<sig>` tokens space-separated.
  const tokens = headers.signature.split(' ');
  for (const token of tokens) {
    const [version, sig] = token.split(',');
    if (version !== 'v1' || !sig) continue;
    if (constantTimeEqual(sig, expected)) return { ok: true };
  }
  return { ok: false, reason: 'no matching signature' };
}

async function hmacSha256Base64(secret: Uint8Array, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    secret as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(message) as BufferSource,
  );
  const bytes = new Uint8Array(sig);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin);
}

function base64Decode(s: string): Uint8Array {
  const padded = s + '='.repeat((4 - (s.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let acc = 0;
  for (let i = 0; i < a.length; i++) acc |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return acc === 0;
}
