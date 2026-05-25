/**
 * NOWPayments API client + IPN signature verification.
 *
 * https://documenter.getpostman.com/view/7907941/2s93JusNJt
 *
 * Why NOWPayments: crypto-only checkout means no KYC on the seller (Pluck)
 * side and very low fees (~0.5%). Tradeoff: customers must be willing to pay
 * in crypto.
 *
 * Flow:
 *   1. /api/nowpayments/create-invoice — server creates a hosted-invoice URL
 *      with the buyer's email embedded in order_id
 *   2. Customer pays on NOWPayments-hosted page (picks BTC/ETH/USDT/etc.)
 *   3. NOWPayments POSTs to /api/nowpayments/ipn with HMAC-SHA512 signature
 *   4. We verify the sig, parse email back out of order_id, sign a Pluck Pro
 *      license JWT, email it via Resend
 */

const API_BASE = 'https://api.nowpayments.io/v1';

export interface InvoiceRequest {
  price_amount: number;
  price_currency: 'usd' | 'eur' | string;
  order_id: string;
  order_description?: string;
  ipn_callback_url?: string;
  success_url?: string;
  cancel_url?: string;
}

export interface InvoiceResponse {
  id: string;
  token_id?: string;
  order_id: string;
  order_description?: string;
  price_amount: string;
  price_currency: string;
  pay_currency?: string;
  ipn_callback_url?: string;
  invoice_url: string;
  success_url?: string;
  cancel_url?: string;
  created_at: string;
  updated_at: string;
}

export interface IpnPayload {
  payment_id: number;
  payment_status:
    | 'waiting'
    | 'confirming'
    | 'confirmed'
    | 'sending'
    | 'partially_paid'
    | 'finished'
    | 'failed'
    | 'refunded'
    | 'expired';
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description?: string;
  purchase_id?: string;
  outcome_amount?: number;
  outcome_currency?: string;
  // Plus various others — NOWPayments documents the full list.
  [k: string]: unknown;
}

export async function createInvoice(req: InvoiceRequest): Promise<InvoiceResponse> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    throw new Error('NOWPAYMENTS_API_KEY is not set');
  }
  const res = await fetch(`${API_BASE}/invoice`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`NOWPayments invoice creation failed: ${res.status} ${body}`);
  }
  return (await res.json()) as InvoiceResponse;
}

// ── IPN signature verification ─────────────────────────────────────────────

/**
 * Verify NOWPayments IPN signature.
 *
 * Algorithm: HMAC-SHA512 keyed by IPN_SECRET, message = JSON-stringified
 * payload with keys sorted alphabetically. Signature comes in the
 * `x-nowpayments-sig` header as a hex string.
 */
export async function verifyIpn(
  ipnSecret: string,
  signatureHeader: string,
  rawBody: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return { ok: false, reason: 'body is not valid JSON' };
  }
  const sortedJson = JSON.stringify(sortKeysDeep(parsed));
  const expected = await hmacSha512Hex(ipnSecret, sortedJson);
  if (!constantTimeEqualHex(expected, signatureHeader)) {
    return { ok: false, reason: 'signature mismatch' };
  }
  return { ok: true };
}

async function hmacSha512Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret) as BufferSource,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message) as BufferSource);
  const bytes = new Uint8Array(sig);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function sortKeysDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeysDeep);
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const k of Object.keys(o).sort()) sorted[k] = sortKeysDeep(o[k]);
    return sorted;
  }
  return v;
}

function constantTimeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let acc = 0;
  for (let i = 0; i < a.length; i++) acc |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return acc === 0;
}

// ── Order ID encoding (round-trips email through NOWPayments) ──────────────

/**
 * Build an order_id that round-trips the buyer's email through NOWPayments.
 * order_id can be up to 255 chars; we URL-encode the email to keep it
 * delimiter-safe.
 *
 *   makeOrderId("a@b.com") → "pluck-pro-a%40b.com-1779730000000"
 */
export function makeOrderId(email: string): string {
  return `pluck-pro-${encodeURIComponent(email)}-${Date.now()}`;
}

export function parseEmailFromOrderId(orderId: string): string | null {
  const m = /^pluck-pro-(.+?)-\d+$/.exec(orderId);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]!);
  } catch {
    return null;
  }
}
