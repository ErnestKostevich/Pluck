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

## Phase 1 — Client-side AI inference (weeks 2–3)

**Goal:** AI calls move from a server we'd pay for into the extension itself, using either Chrome built-in AI (free) or the user's own API key.

- [ ] `lib/ai/types.ts` — `AIProvider` interface
- [ ] `lib/ai/prompt.ts` — prompt template + page-HTML sanitization tuned for token budget
- [ ] `lib/ai/providers/chrome-builtin.ts` — Gemini Nano via `window.ai`, with availability detection
- [ ] `lib/ai/providers/anthropic.ts` — direct call to `api.anthropic.com` with user's BYOK key + prompt caching
- [ ] `lib/ai/providers/gemini.ts` — Google AI Studio API with user's BYOK key
- [ ] `lib/settings.ts` — typed `chrome.storage.local` wrapper for provider choice + API keys
- [ ] `entrypoints/options/` — settings page: pick provider, paste keys, test connection
- [ ] Background routes inference through chosen provider (no more server fetch)
- [ ] Repurpose `apps/web` `/api/infer` as marketing-demo mock (rate-limited)
- [ ] Selector-validation in extension (highlight matches before user confirms)
- [ ] "Refine pick" loop (add/remove examples, re-infer)

**Exit criteria:** on 5 real-world sites, the AI proposes a usable schema on the first or second iteration. Founder pays $0 in API costs because every call uses either the user's machine (Chrome built-in) or the user's key.

## Phase 2 — Save and re-run jobs (weeks 4–5)

**Goal:** jobs persist in browser storage; user can re-run on demand.

- [ ] `lib/storage.ts` — `chrome.storage.local` wrapper for `SavedJob` and `RunRecord`
- [ ] `entrypoints/popup/` — jobs list, "New scrape", recent runs
- [ ] "Save as job" flow from the picker overlay
- [ ] "Re-run" flow — opens target URL in a background tab, executes saved schema, captures rows
- [ ] Pagination: next-link follower + "load more" clicker
- [ ] Per-job storage cap enforcement (last 50 runs, rolling)
- [ ] CSV download from the popup

**Exit criteria:** a user creates a job today, comes back tomorrow, hits "run", and gets a fresh CSV. All without leaving the browser. Still $0 founder cost.

## Phase 3 — Pro tier + monetization (weeks 6–8)

**Goal:** Pro features behind a $29 one-time license sold via Polar.sh. Free tier remains fully functional.

- [ ] Free-tier gating: max 3 saved jobs, manual runs only, CSV export only
- [ ] `chrome.alarms`-based scheduled runs (Pro feature)
- [ ] Google Sheets export (OAuth, append-on-run) — Pro feature
- [ ] Webhook delivery with HMAC signing — Pro feature
- [ ] Polar.sh checkout integration (link from popup → Polar hosted page)
- [ ] `apps/web` `/api/polar/webhook` — receive purchase, sign JWT, email license to buyer
- [ ] `apps/web` `/api/license/verify` — stateless JWT verification (Vercel free function)
- [ ] `lib/license.ts` — offline JWT validation; unlock Pro features
- [ ] License entry UI in settings page
- [ ] Pricing page on the landing site

**Exit criteria:** end-to-end flow works — user installs free extension, hits the 3-job cap, clicks "Upgrade", pays $29 on Polar, receives JWT by email, pastes into extension, Pro features unlock. $0 monthly cost still; Polar takes its cut per sale.

## Phase 4 — Launch (week 9–10)

**Goal:** first 100 paying customers.

- [ ] Polish landing page (hero, demo video, pricing, FAQ, link to Chrome Web Store)
- [ ] Chrome Web Store submission (1–2 weeks review; submit early)
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
