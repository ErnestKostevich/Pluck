/**
 * Email delivery via Resend (https://resend.com).
 *
 * Picked over Postmark / SendGrid because:
 *   - $0 fixed cost (free up to 100 emails/day, 3k/month)
 *   - Single-API-key install — no DNS dance to start
 *   - Modern DX
 *
 * Gated on RESEND_API_KEY. If unset, send() no-ops and returns a clear
 * status — useful for local dev and for keeping the Polar webhook from
 * failing when email isn't yet configured.
 */

const RESEND_API_URL = 'https://api.resend.com/emails';
// Default sender: Resend's `onboarding@resend.dev` works without a verified
// domain. Override with RESEND_FROM env var once a custom domain is verified
// in Resend.
const DEFAULT_FROM = 'Pluck <onboarding@resend.dev>';
// Replies on the license email land in the founder's inbox.
const DEFAULT_REPLY_TO = 'ernest2011kostevich@gmail.com';

export interface SendArgs {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export type SendResult =
  | { sent: true; id: string }
  | { sent: false; reason: string };

export async function sendEmail(args: SendArgs): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, reason: 'RESEND_API_KEY not set; email delivery skipped' };
  }

  const body = {
    from: args.from ?? process.env.RESEND_FROM ?? DEFAULT_FROM,
    to: args.to,
    reply_to: process.env.RESEND_REPLY_TO ?? DEFAULT_REPLY_TO,
    subject: args.subject,
    html: args.html,
  };

  let res: Response;
  try {
    res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return {
      sent: false,
      reason: `network error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return { sent: false, reason: `Resend HTTP ${res.status}: ${text || res.statusText}` };
  }

  const data = (await res.json()) as { id?: string };
  return { sent: true, id: data.id ?? 'unknown' };
}

// ── Email templates ─────────────────────────────────────────────────────────

export function licenseDeliveryEmail(email: string, license: string): { subject: string; html: string } {
  return {
    subject: 'Your Pluck Pro license',
    html: `<!doctype html>
<html>
<body style="font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; line-height: 1.5; color: #0a0a0a; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h1 style="font-size: 24px; font-weight: 600;">🍒 Welcome to Pluck Pro</h1>
  <p>Thanks for buying Pluck Pro, ${escapeHtml(email)}. Your lifetime license is below — paste it into the extension's <strong>Settings → License</strong> panel to unlock unlimited saved jobs, scheduled runs, pagination, and integrations.</p>
  <pre style="background: #fafafa; border: 1px solid #e5e5e5; padding: 12px; border-radius: 8px; font-family: ui-monospace, monospace; font-size: 12px; overflow-wrap: break-word; word-break: break-all; white-space: pre-wrap;">${escapeHtml(license)}</pre>
  <p>Three things worth knowing:</p>
  <ol>
    <li>The license is verified <strong>offline</strong> by the extension — it never phones home. Use Pluck without internet (as long as your AI provider works offline too).</li>
    <li>It's tied to your email, but works on every machine you sign in on. Lose access? Forward this email back to <a href="mailto:ernest2011kostevich@gmail.com">ernest2011kostevich@gmail.com</a> and we'll re-issue.</li>
    <li>Future updates are free forever. Buy once, use forever — that's the deal.</li>
  </ol>
  <p>14-day full refund: just reply to this email. After that the license is yours for life.</p>
  <p style="color: #737373; font-size: 12px; margin-top: 32px;">— Ernest, building Pluck solo</p>
</body>
</html>`,
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
