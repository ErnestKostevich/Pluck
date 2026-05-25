import { NextResponse } from 'next/server';
import { createInvoice, makeOrderId } from '@/lib/nowpayments';

export const runtime = 'nodejs';

/**
 * POST /api/nowpayments/create-invoice
 *
 * Request body:  { "email": "buyer@example.com" }
 * Response:      { "invoice_url": "https://nowpayments.io/payment/?iid=..." }
 *
 * The buyer's email is embedded in the NOWPayments `order_id` so we can
 * recover it in the IPN handler and email the license to the right address
 * without needing a database.
 */
export async function POST(req: Request) {
  if (!process.env.NOWPAYMENTS_API_KEY) {
    return NextResponse.json(
      { error: 'NOWPAYMENTS_API_KEY is not configured' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const email = (body as { email?: unknown })?.email;
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: 'body.email must be a valid email address' },
      { status: 400 },
    );
  }

  const origin = new URL(req.url).origin;
  const orderId = makeOrderId(email);

  try {
    const invoice = await createInvoice({
      price_amount: 29,
      price_currency: 'usd',
      order_id: orderId,
      order_description: `Pluck Pro lifetime license for ${email}`,
      ipn_callback_url: `${origin}/api/nowpayments/ipn`,
      success_url: `${origin}/thanks?email=${encodeURIComponent(email)}`,
      cancel_url: `${origin}/pricing`,
    });
    return NextResponse.json({ invoice_url: invoice.invoice_url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
