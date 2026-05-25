import { NextResponse } from 'next/server';
import { signLicense, type LicensePayload } from '@/lib/license-keys';
import { verifyIpn, parseEmailFromOrderId, type IpnPayload } from '@/lib/nowpayments';
import { sendEmail, licenseDeliveryEmail } from '@/lib/email';

export const runtime = 'nodejs';

/**
 * POST /api/nowpayments/ipn
 *
 * Receives Instant Payment Notifications from NOWPayments. On payment_status
 * === "finished":
 *
 *   1. Verify the HMAC-SHA512 signature against NOWPAYMENTS_IPN_SECRET
 *   2. Extract the buyer's email from order_id
 *   3. Mint an ES256-signed Pluck Pro lifetime license JWT
 *   4. Email the license via Resend (gracefully skipped if RESEND_API_KEY unset)
 *
 * Always returns 200 to NOWPayments on success so they don't retry —
 * the license is logged server-side as a fallback if email fails.
 *
 * Until NOWPAYMENTS_IPN_SECRET is set, the endpoint refuses every request
 * (503) so it can't be abused to mint free licenses.
 */
export async function POST(req: Request) {
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!ipnSecret) {
    return NextResponse.json(
      { error: 'NOWPAYMENTS_IPN_SECRET is not configured' },
      { status: 503 },
    );
  }

  // Read raw body — required for signature verification.
  const rawBody = await req.text();
  const signature = req.headers.get('x-nowpayments-sig');
  if (!signature) {
    return NextResponse.json({ error: 'missing x-nowpayments-sig header' }, { status: 400 });
  }

  const verify = await verifyIpn(ipnSecret, signature, rawBody);
  if (!verify.ok) {
    return NextResponse.json({ error: `signature: ${verify.reason}` }, { status: 401 });
  }

  let payload: IpnPayload;
  try {
    payload = JSON.parse(rawBody) as IpnPayload;
  } catch {
    return NextResponse.json({ error: 'invalid json body' }, { status: 400 });
  }

  // Only act on confirmed payments.
  if (payload.payment_status !== 'finished') {
    return NextResponse.json({
      ok: true,
      ignored: payload.payment_status,
      reason: 'waiting for finished status',
    });
  }

  const email = parseEmailFromOrderId(payload.order_id);
  if (!email) {
    console.error('[nowpayments ipn] could not parse email from order_id', payload.order_id);
    return NextResponse.json(
      { error: 'order_id is not in the expected format' },
      { status: 400 },
    );
  }

  // Mint the license.
  const license: LicensePayload = {
    sub: email,
    plan: 'pro',
    iat: Math.floor(Date.now() / 1000),
    v: 1,
  };

  let jwt: string;
  try {
    jwt = await signLicense(license);
  } catch (err) {
    console.error('[nowpayments ipn] signing failed', err);
    return NextResponse.json(
      { error: `license signing failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 },
    );
  }

  // Email it (or log if Resend isn't configured).
  const tmpl = licenseDeliveryEmail(email, jwt);
  const emailResult = await sendEmail({ to: email, subject: tmpl.subject, html: tmpl.html });

  if (!emailResult.sent) {
    console.warn(
      '[nowpayments ipn] license minted but email skipped — manual fallback needed',
      { email, payment_id: payload.payment_id, reason: emailResult.reason, license: jwt },
    );
  } else {
    console.log('[nowpayments ipn] license emailed', { email, payment_id: payload.payment_id });
  }

  return NextResponse.json({
    ok: true,
    license_issued: true,
    email_sent: emailResult.sent,
    email_reason: emailResult.sent ? undefined : emailResult.reason,
  });
}
