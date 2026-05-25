/**
 * Generate the ECDSA P-256 keypair used to sign Pluck Pro licenses.
 *
 * Run once when preparing for launch:
 *
 *     pnpm gen-license-keys
 *
 * Writes:
 *   - `apps/extension/src/lib/license.ts` — replaces LICENSE_PUBLIC_KEY with
 *     the new public JWK (the rest of the file is left untouched).
 *   - `apps/web/.env.local` — appends LICENSE_PRIVATE_KEY (JWK JSON, escaped).
 *
 * After running:
 *   - Commit the change to license.ts (the public key is fine to commit).
 *   - NEVER commit .env.local. Add the private key to your hosting provider's
 *     secret store (Vercel env var) when deploying the web app.
 *   - Re-sign any existing test licenses; they're now invalid.
 */

import { webcrypto } from 'node:crypto';
import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const LICENSE_TS_PATH = resolve(REPO_ROOT, 'apps/extension/src/lib/license.ts');
const WEB_ENV_PATH = resolve(REPO_ROOT, 'apps/web/.env.local');

async function main() {
  console.log('Generating ECDSA P-256 keypair...');

  const { publicKey, privateKey } = await webcrypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify'],
  );

  const pubJwk = await webcrypto.subtle.exportKey('jwk', publicKey);
  const privJwk = await webcrypto.subtle.exportKey('jwk', privateKey);

  // Add metadata.
  pubJwk.alg = 'ES256';
  pubJwk.use = 'sig';
  privJwk.alg = 'ES256';
  privJwk.use = 'sig';

  // ── Write the public key into license.ts ──────────────────────────────────
  const licenseTs = await readFile(LICENSE_TS_PATH, 'utf-8');
  const newPubKeyLiteral = `const LICENSE_PUBLIC_KEY: JsonWebKey = ${JSON.stringify(pubJwk, null, 2)};`;
  const updated = licenseTs.replace(
    /const LICENSE_PUBLIC_KEY: JsonWebKey = \{[\s\S]*?\};/,
    newPubKeyLiteral,
  );
  if (updated === licenseTs) {
    throw new Error(
      'Could not find LICENSE_PUBLIC_KEY block in license.ts. Did the file change shape?',
    );
  }
  await writeFile(LICENSE_TS_PATH, updated, 'utf-8');
  console.log(`✓ Updated ${LICENSE_TS_PATH}`);

  // ── Append the private key to apps/web/.env.local ─────────────────────────
  const envLine = `\nLICENSE_PRIVATE_KEY=${JSON.stringify(JSON.stringify(privJwk))}\n`;
  await appendFile(WEB_ENV_PATH, envLine).catch(async () => {
    // .env.local didn't exist — create it with just this line.
    await writeFile(WEB_ENV_PATH, envLine.trimStart(), 'utf-8');
  });
  console.log(`✓ Appended LICENSE_PRIVATE_KEY to ${WEB_ENV_PATH}`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Commit apps/extension/src/lib/license.ts');
  console.log('  2. NEVER commit apps/web/.env.local');
  console.log('  3. When deploying the web app, add LICENSE_PRIVATE_KEY to your hosting secrets');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
