/**
 * Sign a test Pluck Pro license with the dev private key.
 *
 * Usage:
 *
 *     pnpm sign-test-license <email>
 *
 * Reads LICENSE_PRIVATE_KEY from `apps/web/.env.local` (set by
 * `pnpm gen-license-keys`). Prints the signed JWT to stdout — paste it into
 * the extension's Options page → License field to unlock Pro features.
 */

import { webcrypto } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const ENV_PATH = resolve(REPO_ROOT, 'apps/web/.env.local');

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: pnpm sign-test-license <email>');
    process.exit(1);
  }

  const env = await readFile(ENV_PATH, 'utf-8').catch(() => '');
  const match = env.match(/^LICENSE_PRIVATE_KEY=(.+)$/m);
  if (!match) {
    console.error(
      `LICENSE_PRIVATE_KEY not found in ${ENV_PATH}. Run "pnpm gen-license-keys" first.`,
    );
    process.exit(1);
  }

  const privJwk = JSON.parse(JSON.parse(match[1]!)) as JsonWebKey;
  const key = await webcrypto.subtle.importKey(
    'jwk',
    privJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );

  const header = { alg: 'ES256', typ: 'JWT' };
  const payload = {
    sub: email,
    plan: 'pro',
    iat: Math.floor(Date.now() / 1000),
    v: 1,
  };

  const headerB64 = b64urlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const sig = new Uint8Array(
    await webcrypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      key,
      new TextEncoder().encode(signingInput),
    ),
  );

  const jwt = `${signingInput}.${b64urlEncode(sig)}`;
  console.log(jwt);
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
