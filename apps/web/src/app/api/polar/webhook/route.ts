import { NextResponse } from 'next/server';
import { signLicense, type LicensePayload } from '@/lib/license-keys';

export const runtime = 'nodejs';

/**
 * POST /api/polar/webhook
 *
 * Receives purchase-completed events from Polar.sh. Verifies the webhook
 * signature, signs a Pluck Pro license JWT for the buyer, and emails it to
 * them.
 *
 * Status: stub. The signing logic is real; the Polar webhook signature
 * verification and email delivery are placeholders to be wired up when Polar
 * integration goes live (Phase 3 of the roadmap).
 *
 * Polar webhook payload shape (current as of 2026-05):
 *   {
 *     "type": "order.created",
 *     "data": {
 *       "id": "order_xxx",
 *       "customer": { "email": "buyer@example.com", "name": "..." },
 *       "product": { "id": "prod_pluck_pro_lifetime" },
 *       "amount": 2900,
 *       "currency": "USD"
 *     }
 *   }
 */
export async function POST(req: Request) {
  // TODO: verify the `polar-webhook-signature` header against POLAR_WEBHOOK_SECRET.
  // Without verification, this endpoint must be left disabled in production —
  // we don't want to issue free licenses to whoever can POST here.
  if (process.env.POLAR_WEBHOOK_SECRET == null) {
    return NextResponse.json(
      { error: 'webhook is not configured (POLAR_WEBHOOK_SECRET missing)' },
      { status: 503 },
    );
  }

  let event: PolarEvent;
  try {
    event = (await req.json()) as PolarEvent;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (event.type !== 'order.created') {
    return NextResponse.json({ ok: true, ignored: event.type });
  }

  const email = event.data?.customer?.email;
  if (!email) {
    return NextResponse.json({ error: 'missing customer email' }, { status: 400 });
  }

  const payload: LicensePayload = {
    sub: email,
    plan: 'pro',
    iat: Math.floor(Date.now() / 1000),
    v: 1,
  };

  let jwt: string;
  try {
    jwt = await signLicense(payload);
  } catch (err) {
    return NextResponse.json(
      { error: `signing failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 },
    );
  }

  // TODO: send the email. For now, log + return so we have a record during
  // testing. Email transport will be added when payments go live.
  console.log('[polar webhook] would email', email, 'license:', jwt);

  return NextResponse.json({ ok: true, license_issued: true });
}

interface PolarEvent {
  type: string;
  data?: {
    id?: string;
    customer?: { email?: string; name?: string };
    product?: { id?: string };
    amount?: number;
    currency?: string;
  };
}
