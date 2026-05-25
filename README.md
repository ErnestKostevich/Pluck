# Pluck

> **AI-powered visual web scraper.** Click anything on any page, get structured data — no selectors, no code.

Pluck is a Chrome extension that lets non-technical users extract structured data from any website by clicking on the data they want. AI figures out the pattern, handles pagination, and exports to Sheets, CSV, or webhooks.

## How it stays cheap

Pluck runs **AI inference in the user's browser** — either via Chrome's built-in AI (Gemini Nano, free, no key) or the user's own API key (Anthropic / Gemini / OpenAI). Pluck never holds an LLM key on a server we pay for. There is no managed database; jobs and settings live in `chrome.storage`. Scheduled runs use `chrome.alarms` while the browser is open.

This is a deliberate constraint — see [`docs/VISION.md`](docs/VISION.md) and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — so the founder's fixed monthly cost is **$0** and the product is bootstrappable without funding.

## Why Pluck?

The existing web-scraping market (Octoparse, ParseHub, Apify, Bright Data) was built for engineers. Pluck is built for the marketer, recruiter, researcher, or operator who needs data but shouldn't have to learn CSS selectors or XPath.

## Status

🚧 **Pre-alpha.** Building the MVP. Not yet usable.

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the build plan and [`docs/VISION.md`](docs/VISION.md) for the long-form pitch.

## Repository layout

This is a pnpm workspace monorepo:

```
.
├── apps/
│   ├── extension/   Chrome extension (WXT + React + TypeScript)
│   └── web/         Landing + dashboard + API (Next.js 15)
├── packages/
│   └── shared/      Shared types and utilities
└── docs/            Vision, architecture, roadmap
```

## Getting started

**Prerequisites:** Node.js ≥ 20, pnpm ≥ 11.

```bash
pnpm install
```

Run the Chrome extension in dev mode:

```bash
pnpm dev:extension
```

Then load `apps/extension/.output/chrome-mv3` as an unpacked extension in `chrome://extensions`.

Run the web app (landing + API):

```bash
pnpm dev:web
```

Open <http://localhost:3000>.

## Scripts

| Script                  | What it does                            |
| ----------------------- | --------------------------------------- |
| `pnpm dev:extension`    | Run Chrome extension in dev mode (HMR)  |
| `pnpm dev:web`          | Run Next.js dev server                  |
| `pnpm build`            | Build all packages                      |
| `pnpm typecheck`        | Type-check all packages                 |
| `pnpm lint`             | Lint all packages                       |
| `pnpm format`           | Format with Prettier                    |

## Docs

- [`docs/VISION.md`](docs/VISION.md) — what we're building and for whom
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system design
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — phased build plan

## License

All rights reserved (proprietary). License terms to be finalized before public launch.
