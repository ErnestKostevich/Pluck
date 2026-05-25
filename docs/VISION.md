# Vision

## One-liner

Pluck is the AI-native web scraper for people who don't write code.

## The problem

Every week, millions of professionals manually copy-paste data from websites into spreadsheets:

- **Recruiters** building candidate lists from LinkedIn-style profiles
- **Sales teams** prospecting from directories and review sites
- **E-commerce operators** tracking competitor prices and SKUs
- **Marketers** scraping leads from event pages, communities, listings
- **Researchers** collecting structured data for analyses

The tooling that exists today (Octoparse, ParseHub, Apify, Bright Data, web-scraper.io) was built by engineers, for engineers. The user has to:

1. Learn CSS selectors or XPath
2. Configure pagination by hand
3. Debug brittle scrapers when sites change
4. Wire up proxies and CAPTCHAs themselves
5. Glue the output to wherever they actually need it

Result: most non-technical professionals either pay $50–$500 per dataset to a freelancer on Upwork or give up and do it manually.

## The wedge

LLMs make it possible to ship the experience that all the existing tools have been promising but never delivered: **click anything, get a clean table.**

- The user clicks a few example items on a page.
- An LLM, given the DOM and the user's picks, infers the selector pattern, identifies the repeating container, and proposes columns.
- The extension validates the proposal live (highlights all matches on the page).
- The user confirms, names the columns, and the job is saved.
- Pluck runs the scrape on schedule, handles pagination, retries, rotating proxies, and CAPTCHAs in the cloud.
- Output streams to Google Sheets / Airtable / a webhook / a CSV download.

This is a 10x experience compared to today's tools. It is only buildable in 2025+ because the LLM pattern-inference step requires frontier models.

## Target user

**Primary (B2B, paid):** the operator inside a company who today asks an engineer or a freelancer for "a list of X from Y".

Concretely:
- SDR / BDR at a B2B SaaS company
- Recruiter at an agency or in-house TA
- E-commerce manager (Shopify / Amazon seller)
- Marketing ops at a mid-market company
- Indie founder building a directory or aggregator

**Secondary:** academics, journalists, and personal-use power users — lower revenue per user but useful for word-of-mouth and content marketing.

We are **not** targeting:
- Enterprise data engineering teams (they have Diffbot, Bright Data, internal pipelines)
- True consumer (the use case is too B2B-shaped to drive consumer growth)
- Developers who'd rather write Playwright themselves

## Why now

1. **LLMs make UX possible** that wasn't before — natural-language column descriptions, pattern inference from one example, schema cleanup.
2. **Existing tools haven't caught up.** Most were built 2015–2019 and rely on the legacy "you write the selector" mental model.
3. **Browser automation is mature** — Playwright, residential proxy networks, CAPTCHA solvers are commoditized, so the hard plumbing is buyable.
4. **The buyer is now AI-curious.** Heads of growth and ops who two years ago wouldn't try a new AI tool now have a Notion / Cursor / ChatGPT habit. The activation energy for "try this AI scraper" is at an all-time low.

## Business model

**Zero-cost-to-founder, user-pays-own-usage.** The product is engineered so that operating costs scale to zero at idle and per-user variable costs are paid by the user, not us. This is a hard constraint — see [`memory/constraints.md`](../MEMORY.md).

### How it works

- **AI inference runs in the user's browser.** The extension calls the chosen LLM directly:
  - **Chrome's built-in AI** (Gemini Nano via the Prompt API) — runs locally on the user's machine. No API key, no cost to anyone. Default for the free tier.
  - **User's own API key** (BYOK) — Anthropic, Google Gemini, or OpenAI. Stored in `chrome.storage.local`, never transits our servers. The user's bill, not ours.
- **Scheduling**: `chrome.alarms` — runs while the browser is open. No cloud worker, no hosting cost.
- **Storage**: jobs, settings, results live in `chrome.storage.local`. Optional export to user's Google Sheets / webhook / CSV.
- **License check** for paid features: a single Vercel function (free tier) that verifies a signed JWT issued at purchase. Offline-validatable; no DB required.

### Pricing

- **Free** — unlimited rows (cost paid by user via Chrome built-in or BYOK). 3 saved jobs max. Manual runs only. CSV export.
- **Pro — $29 one-time** (lifetime license). Unlimited saved jobs, scheduled runs via browser alarms, Google Sheets + webhook export, multi-provider support, priority support.

One-time over subscription because:

- Friendlier CTA for the self-serve, no-touch sales motion we want.
- No churn to fight.
- Lower cognitive load for the "I'll just buy the tool" buyer.
- Can layer a Business subscription on top later if usage patterns warrant it (e.g. team plans, cloud worker).

### Founder costs at launch

| Item                        | Cost                              |
| --------------------------- | --------------------------------- |
| Chrome Web Store dev fee    | $5 one-time                       |
| Domain (optional)           | $10–15/year                       |
| Hosting (Vercel free tier)  | $0                                |
| Payment processor (Polar)   | $0 setup; ~5% per sale            |
| AI / proxies / CAPTCHAs     | $0 (user pays via their own key)  |
| **Fixed monthly burn**      | **$0**                            |

### Trade-offs we accept

1. **Less moat than a server-side SaaS** — the BYOK model is copyable. We win on UX and speed-to-market, not infra defensibility.
2. **Scheduled runs need Chrome open** — fine for the operator persona who lives in the browser. Revisit when revenue funds a cloud worker.
3. **BYOK friction** — mitigated by Chrome's built-in AI as the zero-friction free path. Anyone on Chrome ≥ 127 with the feature enabled can use Pluck without ever creating an API account.

## North-star metric

**Datasets shipped per week per active user.** The product works when users come back week after week to run jobs that produce data they actually use. Vanity metrics (signups, MAU) come second.

## What success looks like

- **Month 3:** MVP live, 10 paying users, $300 MRR.
- **Month 6:** Product Hunt launch, 100 paying users, $5k MRR.
- **Month 12:** $30k MRR, first hire (support / customer success).
- **Month 24:** $150k+ MRR, profitable, optional VC raise or stay bootstrapped.

These are ambitious but not unrealistic for an AI-native B2B tool in a well-understood category.
