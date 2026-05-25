# Changelog

All notable changes to Pluck. Format is loose — focus is on what shipped, not strict semver until v1.0.

## v0.3 — 2026-05-25 — "feature-complete MVP"

**Pagination + integrations + extra providers + payment plumbing.** End-to-end multi-page scrapes work, Pro features have UI, license-issuance flow is wired (offline-verifiable JWT minted on Polar purchase webhook, emailed via Resend).

### Added

- **Pagination follower** in the runner — multi-page scrapes follow `next-link` and `page-numbers` selectors with safety caps (default 10 pages / 1k rows, hard cap at 50 pages / 10k rows). Pagination hint comes from the AI's inference.
- **Webhook integration** — per-job HMAC-SHA256-signed POST to a user-configured URL after each successful run. Secret auto-generated per job and visible in the edit form. Receiving server verifies via `x-pluck-signature` header.
- **Gemini AI provider** (BYOK via Google AI Studio) — third LLM option, fully wired in the options page. Free path next to Chrome built-in AI for users with a Google API key.
- **Popup edit-job form** — rename, set/clear schedule (off / 5m / 15m / 1h / 6h / 24h, Pro-gated), configure webhook URL + secret (Pro-gated). Schedule changes sync `chrome.alarms` create/clear.
- **Polar webhook signature verification** — Standard Webhooks spec (HMAC-SHA256 of `id.timestamp.body`), replay-window enforcement, constant-time comparison. Endpoint refuses requests until `POLAR_WEBHOOK_SECRET` is set.
- **Resend email delivery** for licenses — license-key delivery email template, gated on `RESEND_API_KEY` (license still mints even if email fails, surfaced via support).
- **`verifyLicenseWithKey`** — extracted pure-verification function. Tests now generate a real ES256 keypair and round-trip a signed JWT to verify the full crypto path.

### Tests

- 47 extension tests (was 36) — added 5 license tests with a real keypair (signature verification, tamper detection, expiry, alg whitelist, malformed) and 6 webhook tests (signed POST, error paths).
- 9 shared schema tests (unchanged).
- **56 tests, all passing.**

### Fixed / changed

- Vitest pool config uses `forks` + `singleFork: true` to work around a Node 24 / Vitest 2.x crash on Windows.
- Next.js build uses `experimental.cpus: 1` to avoid a `spawn UNKNOWN` failure during static page generation on Windows + Node 24.

## v0.2 — 2026-05-25 — "complete MVP"

End-to-end flow works locally: pick → infer → validate against live DOM → save → re-run → export CSV. Full Pro-license gate via offline JWT verification.

- Storage layer (jobs + runs in `chrome.storage.local`)
- Selector validation in the picker (live DOM highlight + real extracted preview)
- CSV export
- License JWT validation + `pnpm gen-license-keys` + `pnpm sign-test-license`
- `chrome.alarms` scheduling primitives
- Options page (provider, BYOK keys, test connection, license entry)
- Popup with saved-jobs list (Run / Export / Delete)
- Run-job flow via hidden tab + `chrome.scripting.executeScript`
- Landing page polish, `/pricing`, `/faq`
- `/api/license/verify`, `/api/polar/webhook` (stub)
- 45 unit tests

## v0.1 — 2026-05-25 — "zero-cost browser-first pivot"

Architecture rewrite: AI inference moves into the user's browser. No server-side LLM key, no managed DB, no cloud worker.

- `lib/ai/` provider abstraction
- `ChromeBuiltinProvider` (Gemini Nano on-device)
- `AnthropicProvider` (BYOK + prompt caching)
- `lib/settings.ts` (chrome.storage wrapper)
- Docs rewrite (VISION, ARCHITECTURE, ROADMAP)
- `memory/constraints.md` records the hard $0-cost rule

## v0.0 — 2026-05-25 — "initial scaffold"

- pnpm monorepo with `apps/extension`, `apps/web`, `packages/shared`
- WXT + React + TS extension
- Next.js 15 web app with mock `/api/infer`
- End-to-end mock flow demonstrating the picker → API → results loop
