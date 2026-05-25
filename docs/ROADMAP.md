# Roadmap

Phased build plan, re-sequenced 2026-05-25 for the zero-cost-to-founder model (see [`memory/constraints.md`](../MEMORY.md)). Milestones matter more than calendar dates.

## Phase 0 — Foundation ✅ (week 1)

**Goal:** repo is buildable, both apps boot, scaffolding is in place. **Done 2026-05-25.**

- [x] Monorepo (pnpm workspaces, shared tsconfig, prettier)
- [x] Project docs (vision, architecture, roadmap)
- [x] `apps/extension` — WXT + React skeleton, popup + content script + background
- [x] `apps/web` — Next.js 15 skeleton, landing + dashboard placeholder + `/api/infer` mock
- [x] `packages/shared` — type definitions for API contracts
- [x] End-to-end mock flow: picker → POST `/api/infer` (mocked) → results in overlay

## Phase 1 — Client-side AI inference ✅

**Goal:** AI calls move from a server we'd pay for into the extension itself, using either Chrome built-in AI (free) or the user's own API key.

- [x] `lib/ai/types.ts` — `AIProvider` interface
- [x] `lib/ai/prompt.ts` — prompt template + page-HTML sanitization tuned for token budget
- [x] `lib/ai/providers/chrome-builtin.ts` — Gemini Nano via `window.ai`, with availability detection
- [x] `lib/ai/providers/anthropic.ts` — direct call to `api.anthropic.com` with user's BYOK key + prompt caching
- [x] `lib/ai/providers/gemini.ts` — Google AI Studio API with user's BYOK key
- [x] `lib/settings.ts` — typed `chrome.storage.local` wrapper for provider choice + API keys
- [x] `entrypoints/options/` — settings page: pick provider, paste keys, test connection
- [x] Background routes inference through chosen provider (no more server fetch)
- [x] Repurpose `apps/web` `/api/infer` as marketing-demo mock (rate-limited)
- [x] Selector-validation in extension (highlight matches before user confirms)
- [x] "Refine pick" loop (add/remove examples, re-infer)
- [ ] OpenAI provider — deferred; current three cover the architecture

## Phase 2 — Save and re-run jobs ✅

**Goal:** jobs persist in browser storage; user can re-run on demand.

- [x] `lib/storage.ts` — `chrome.storage.local` wrapper for `SavedJob` and `RunRecord`
- [x] `entrypoints/popup/` — jobs list, "New scrape", recent runs
- [x] "Save as job" flow from the picker overlay
- [x] "Re-run" flow — opens target URL in a background tab, executes saved schema, captures rows
- [x] Pagination: next-link follower (page-numbers handled too)
- [ ] "Load more" infinite-scroll clicker — deferred; most sites we test use next-link
- [x] Per-job storage cap enforcement (last 20 runs per job, last 1000 globally, rows kept only on most-recent succeeded)
- [x] CSV download from the popup

## Phase 3 — Pro tier + monetization ✅ (code-complete; awaits Polar account setup)

**Goal:** Pro features behind a $29 one-time license sold via Polar.sh. Free tier remains fully functional.

- [x] Free-tier gating: max 3 saved jobs, manual runs only, CSV export only
- [x] `chrome.alarms`-based scheduled runs (Pro feature, surfaced in popup edit form)
- [ ] Google Sheets export — deferred (needs OAuth verification flow with Google; ~1 week of work). Webhook covers the use case for most users.
- [x] Webhook delivery with HMAC-SHA256 signing — Pro feature, configured per-job in the popup edit form
- [ ] Polar.sh checkout link — landing page links to `https://buy.polar.sh/pluck-pro` (placeholder URL until product is created in Polar)
- [x] `apps/web` `/api/polar/webhook` — Standard Webhooks signature verification, mints JWT, hands off to email
- [x] `apps/web` `/api/license/verify` — stateless JWT verification
- [x] `lib/license.ts` — offline JWT validation; unlocks Pro features
- [x] License entry UI in options page
- [x] Pricing page on the landing site
- [x] Resend integration for license-delivery email (gated on `RESEND_API_KEY`)

## Phase 4 — Launch (next)

**Goal:** first 100 paying customers.

All product work is done. This phase is **operations** — accounts, accounts, content.

- [x] Polish landing page (hero, pricing, FAQ — demo video TBD)
- [ ] Create Polar.sh account + product, swap `https://buy.polar.sh/pluck-pro` link with the real one
- [ ] Add `POLAR_WEBHOOK_SECRET` + `LICENSE_PRIVATE_KEY` + `RESEND_API_KEY` to Vercel project secrets
- [ ] Run `pnpm gen-license-keys` to replace placeholder; rebuild extension; commit
- [ ] Verify domain in Resend; set `RESEND_FROM` to `licenses@pluck.app` (or whatever domain we register)
- [ ] Register `pluck.app` (or accept `vercel.app` subdomain — $0 path)
- [ ] Chrome Web Store submission ($5 dev fee, 1–2 weeks review; submit early)
- [ ] Product Hunt launch
- [ ] X / LinkedIn / Indie Hackers launch post
- [ ] Outreach: 50 cold emails to recruiters, e-commerce operators
- [ ] 3 case-study posts: "I built a list of 500 [X] with Pluck in 10 minutes"

**Exit criteria:** $3k+ in cumulative one-time sales (≈100 Pro licenses).

## Phase 5+ — After product-market fit

Not commitments. Ordered by gut-feel ROI. Only build when revenue justifies the time:

- **Business tier ($99/year subscription)**: real cloud worker, scheduled runs without Chrome open, residential proxies, anti-bot handling. This is when we finally take on per-user variable costs — funded by the subscription, never by us at idle.
- Team plans (seat-based, shared jobs)
- Notion / HubSpot / Pipedrive integrations
- API access (programmatic job creation)
- Firefox + Edge support
- Public job-template marketplace
- Self-serve enterprise tier (SSO, audit log, SLA)

## What we are explicitly NOT building

- A general-purpose browser-automation tool (Replit Agent / Bardeen own that)
- A no-code workflow builder (Zapier owns that; we'll integrate with them instead)
- A data marketplace (separate business model, separate problem)
- A multi-step "AI agent" — too broad, loses the wedge
- **Anything that requires us to pay for the user's usage before they pay us.**
