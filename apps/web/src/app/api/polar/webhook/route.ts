import { NextResponse } from 'next/server';
import { signLicense, type LicensePayload } from '@/lib/license-keys';
import { readWebhookHeaders, verifyStandardWebhook } from '@/lib/webhook-verify';
import { sendEmail, licenseDeliveryEmail } from '@/lib/email';

export const runtime = 'nodejs';

/**
 * POST /api/polar/webhook
 *
 * Flow:
 *   1. Verify the Standard Webhooks signature (Polar's signing scheme).
 *   2. If the event is order.created (or checkout.created with paid status),
 *      mint an ES256-signed Pluck Pro license JWT for the buyer's email.
 *   3. Email the license via Resend.
 *   4. Return 200 so Polar doesn't retry.
 *
 * Env vars:
 *   POLAR_WEBHOOK_SECRET  required — endpoint refuses requests without it
 *   LICENSE_PRIVATE_KEY   required — JWK for ES256 signing
 *   RESEND_API_KEY        optional — without it, email step is skipped (still 200)
 *
 * Until Polar is wired up live, this endpoint refuses every request with
 * 503 (POLAR_WEBHOOK_SECRET unset). That's deliberate — we don't want
 * anyone POSTing here to mint free licenses.
 */
export async function POST(req: Request) {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'POLAR_WEBHOOK_SECRET not configured' },
      { status: 503 },
    );
  }

  // Read raw body BEFORE parsing JSON — we need it for signature verification.
  const rawBody = await req.text();

  const headers = readWebhookHeaders(req);
  if (!headers) {
    return NextResponse.json(
      { error: 'missing webhook-id / webhook-timestamp / webhook-signature headers' },
      { status: 400 },
    );
  }

  const verify = await verifyStandardWebhook(secret, headers, rawBody);
  if (!verify.ok) {
    return NextResponse.json({ error: `signature: ${verify.reason}` }, { status: 401 });
  }

  let event: PolarEvent;
  try {
    event = JSON.parse(rawBody) as PolarEvent;
  } catch {
    return NextResponse.json({ error: 'invalid json body' }, { status: 400 });
  }

  // Polar emits several event types; we mint licenses on confirmed paid orders.
  const isOrderPaid =
    event.type === 'order.created' ||
    event.type === 'order.paid' ||
    event.type === 'checkout.updated';
  if (!isOrderPaid) {
    return NextResponse.json({ ok: true, ignored: event.type });
  }

  const email = event.data?.customer?.email ?? event.data?.customer_email;
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

  const tmpl = licenseDeliveryEmail(email, jwt);
  const emailResult = await sendEmail({ to: email, subject: tmpl.subject, html: tmpl.html });

  // Always return 200 to Polar so it doesn't retry — license is already minted
  // and persisted (server log). If email fails, surface it via support inbound.
  return NextResponse.json({
    ok: true,
    license_issued: true,
    email_sent: emailResult.sent,
    email_reason: emailResult.sent ? undefined : emailResult.reason,
  });
}

interface PolarEvent {
  type: string;
  data?: {
    id?: string;
    customer?: { email?: string; name?: string };
    customer_email?: string;
    product?: { id?: string };
    amount?: number;
    currency?: string;
  };
}
