# Pre-launch checklist

Everything code-related is done as of v0.3 (2026-05-25). What follows is the operational work to put Pluck on sale.

## 0 · Verify everything passes on your machine

```bash
pnpm install
pnpm -r typecheck
pnpm -r test         # expect 56 passing
pnpm -r build
```

If anything is red, **stop** and fix before moving on. Don't ship from a non-green tree.

Then follow [`docs/TESTING.md`](TESTING.md) end-to-end on a real page (Hacker News front page is a good first target). If the picker → infer → validate → save → re-run → CSV-export loop works, you're ready.

## 1 · Generate the production license keypair

```bash
pnpm gen-license-keys
```

This rewrites `apps/extension/src/lib/license.ts` with the new public JWK and appends `LICENSE_PRIVATE_KEY` to `apps/web/.env.local`.

- ✅ Commit the change to `license.ts` (public key is fine in git)
- 🚫 **Never** commit `.env.local` — `.gitignore` keeps it out, but double-check
- 📋 Copy the `LICENSE_PRIVATE_KEY` value somewhere safe (1Password / Bitwarden / etc.). If you lose it, every license you ever issue becomes invalid

Rebuild the extension so it bundles the new public key:

```bash
pnpm --filter @pluck/extension build
```

## 2 · Set up NOWPayments

1. Sign up at <https://nowpayments.io>
2. **API keys** tab → create an API key → copy it → set Vercel env:
   `vercel env add NOWPAYMENTS_API_KEY production`
3. **Store settings → IPN** → set IPN callback URL to:
   `https://your-vercel-url.vercel.app/api/nowpayments/ipn`
4. Same panel → generate an **IPN secret** → set Vercel env:
   `vercel env add NOWPAYMENTS_IPN_SECRET production`
5. (Optional) **Customize payout addresses** — add wallets for the cryptos you
   want to actually receive funds in (NOWPayments auto-converts everything to
   your preferred currency).

After setting both env vars, redeploy. The `/checkout` and IPN endpoints
will start working immediately.

## 3 · Set up Resend (license-delivery email)

1. Sign up at <https://resend.com>
2. Add and verify a sending domain (or use Resend's `onresend.com` subdomain for testing)
3. Create an API key with **Send Access**
4. Pluck uses `licenses@pluck.app` by default — change `RESEND_FROM` if you're using a different domain

## 4 · Deploy `apps/web` to Vercel

```bash
# From the repo root
pnpm install -g vercel
vercel link    # link to your account; pick "apps/web" as the project root
vercel env add LICENSE_PRIVATE_KEY  # paste the JWK JSON
vercel env add POLAR_WEBHOOK_SECRET # paste whsec_...
vercel env add RESEND_API_KEY       # paste re_...
vercel env add RESEND_FROM          # e.g. "Pluck <licenses@pluck.app>" (optional)
vercel --prod
```

After deploy, smoke-test:

```bash
# Should return 401 "signature: ..." because we're sending without a signed payload — proves the env vars loaded and the verifier ran
curl -X POST https://your-deployment.vercel.app/api/polar/webhook \
  -H "webhook-id: test" -H "webhook-timestamp: $(date +%s)" -H "webhook-signature: v1,wrong" \
  -d '{"type":"order.created"}'
```

Update the Polar webhook URL to point at the production deploy.

## 5 · Chrome Web Store submission

1. Pay the **$5 one-time developer fee** at <https://chrome.google.com/webstore/devconsole>
2. Build the production extension:
   ```bash
   pnpm --filter @pluck/extension zip
   ```
   Output: `apps/extension/.output/pluck-<version>-chrome.zip`
3. Upload as a new item
4. Fill in:
   - **Description:** lift from the landing-page hero + pricing teaser
   - **Privacy policy:** required. Pluck's is trivially short ("AI inference runs on user's machine / API key; no data is sent to Pluck servers; license check is offline"). Host it at `pluck.app/privacy`
   - **Permissions justifications:**
     - `activeTab` + `scripting`: required to inject the picker
     - `storage`: saved jobs + API keys
     - `alarms`: scheduled runs
     - `<all_urls>` host permission: necessary because the user can pick on any site
5. Submit. Review takes **1–2 weeks**, sometimes more. While you wait, link the side-load build from the landing page (already in `index.tsx`)

## 6 · Domain (optional, $10–15/year)

If you want `pluck.app` (or similar):

1. Register at Namecheap / Porkbun / Cloudflare Registrar
2. Add the domain to your Vercel project
3. Update DNS as Vercel instructs
4. Update `WEB_APP_URL` in `apps/extension/src/lib/config.ts` to the new domain
5. Rebuild + re-upload the extension to the Chrome Web Store

Skip if you want absolute $0 — `<deployment>.vercel.app` works for everything.

## 7 · Launch comms

Once Chrome Web Store approves:

1. **Product Hunt** — schedule a Tuesday launch (highest traffic day historically). Hero image of the picker in action over a real site (HN, e-commerce, LinkedIn). Tag line: "Click anything on any page. Get a clean table."
2. **X / Twitter** — short thread: problem (manual copy-paste), solution (AI-powered picker), pricing ($29 lifetime, no subscription, BYOK or free on-device), demo GIF
3. **Indie Hackers** + **Hacker News (Show HN)** — same message, longer-form. Lead with the architecture story: "I built a Chrome extension that costs me $0 to run, even at scale, because users pay their own AI usage"
4. **Outreach** — 50 hand-written cold emails to recruiters / SDRs / e-com operators. Lead with a specific use-case ("Here's how to pull all 500 SaaS startups from `<directory>` in 5 minutes")

## 8 · Watch your inbox

- **support@pluck.app** — email forwarder set up wherever you host email
- Refund requests within 14 days: process them, no questions
- License-not-arriving: check Resend logs, the Polar webhook responses (return value contains `email_sent` and `email_reason` if it failed), and manually re-send via `pnpm sign-test-license <email>`

## 9 · After launch

When you hit ~$3k+ MRR equivalent, the Business tier becomes worth building:

- Real cloud worker so scheduling runs without Chrome open
- Residential proxies for sites that Cloudflare-block based on IP
- Team plans (multi-seat, shared jobs)

By then you'll have revenue to fund the variable costs — which is the whole point of the architecture.
