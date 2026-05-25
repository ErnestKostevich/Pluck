import { NextResponse } from 'next/server';
import { verifyLicense } from '@/lib/license-keys';

export const runtime = 'nodejs';

/**
 * POST /api/license/verify
 *
 * Stateless license verification for non-extension consumers (admin tools,
 * support scripts). The extension itself verifies licenses offline using the
 * bundled public key — this endpoint exists for cases where Web Crypto isn't
 * available client-side.
 *
 * Request:  { "license": "<jwt>" }
 * Response: { "valid": true, "payload": { sub, plan, iat, ... } }
 *      OR:  { "valid": false, "reason": "..." }
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ valid: false, reason: 'invalid json' }, { status: 400 });
  }

  const license = (body as { license?: unknown })?.license;
  if (typeof license !== 'string') {
    return NextResponse.json(
      { valid: false, reason: 'body.license must be a string' },
      { status: 400 },
    );
  }

  try {
    const result = await verifyLicense(license);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        valid: false,
        reason: `verification failed: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
