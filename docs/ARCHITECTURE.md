# Architecture

> **Hard constraint:** zero recurring cost to the founder. AI inference runs on the user's compute (Chrome built-in AI or user's own API key). Persistent state lives in `chrome.storage`. No managed database, no always-on workers. See [`memory/constraints.md`](../MEMORY.md).

## High-level

```
┌───────────────────────────────────────┐         ┌──────────────────────────┐
│  Chrome Extension (the product)       │         │  Web App (marketing)     │
│  apps/extension                       │         │  apps/web                │
│                                       │         │                          │
│  ┌─────────────────────────────────┐  │         │  - Landing page          │
│  │  Element picker (content/)      │  │         │  - "Try without install" │
│  │  Pattern inference (lib/ai/)    │  │         │    demo (mock /api/infer)│
│  │  Saved jobs (chrome.storage)    │  │         │  - /api/license/verify   │
│  │  Scheduled runs (chrome.alarms) │  │         │    (Vercel function,     │
│  │  Settings/BYOK (chrome.storage) │  │         │     free tier)           │
│  │  License check (offline JWT)    │  │         │                          │
│  └─────────────────────────────────┘  │         └──────────────────────────┘
│                  │                    │                       ▲
│                  │ direct call        │                       │
│                  ▼                    │                       │ purchase
│  ┌─────────────────────────────────┐  │                       │ webhook
│  │  AI Provider Adapters           │  │         ┌──────────────────────────┐
│  │  - ChromeBuiltinAI (local)      │  │         │  Polar.sh                │
│  │  - Anthropic (BYOK)             │  │         │  (payments, JWT issuer)  │
│  │  - Gemini API (BYOK)            │  │         └──────────────────────────┘
│  │  - OpenAI (BYOK, later)         │  │
│  └─────────────────────────────────┘  │
│                  │                    │
│                  │ HTTPS (user's key) │
│                  ▼                    │
│         ┌────────────────────┐        │
│         │ LLM provider API   │        │
│         │ (user pays)        │        │
│         └────────────────────┘        │
└───────────────────────────────────────┘
```

There is **no Pluck-operated server in the runtime path**. The web app only serves the landing page and a stateless license-verification endpoint. The extension can function entirely offline of our infrastructure.

## Components

### `apps/extension` — Chrome Extension (the product)

- **Framework:** [WXT](https://wxt.dev) + React + TypeScript.
- **Manifest:** MV3.
- **Permissions (minimal):** `activeTab`, `storage`, `alarms`, `scripting`; host permissions granted at runtime per-site.

**Entrypoints:**
| File                            | Purpose                                                          |
| ------------------------------- | ---------------------------------------------------------------- |
| `entrypoints/popup/`            | Toolbar UI — start picker, manage jobs, open settings            |
| `entrypoints/content.ts`        | Injected into pages; hosts the picker overlay                    |
| `entrypoints/background.ts`     | Service worker — dispatch AI calls, run scheduled jobs           |
| `entrypoints/options/` (todo)   | Settings page — choose AI provider, paste BYOK keys, license     |
| `picker/overlay.ts`             | Shadow-DOM element picker                                        |
| `lib/ai/`                       | AI provider abstraction + adapters (Chrome built-in, Anthropic…) |
| `lib/settings.ts`               | Typed `chrome.storage.local` wrapper                             |
| `lib/scheduling.ts` (todo)      | `chrome.alarms` wrapper for scheduled runs                       |
| `lib/license.ts` (todo)         | Offline JWT validation for Pro features                          |

### `apps/web` — Marketing site + license endpoint

- **Framework:** Next.js 15 (App Router) + Tailwind v4.
- **What it serves:**
  - `/` — landing page (positioning, demo video, pricing, link to Chrome Web Store).
  - `/api/infer` — **demo-only mock** for the "try without installing" CTA on the landing page. Returns fake data, rate-limited. Never used by the production extension.
  - `/api/license/verify` — stateless. Receives a JWT, verifies signature against a hardcoded public key, returns `{ valid, expires_at, plan }`. Free tier on Vercel handles 100k requests/mo.
  - `/api/polar/webhook` (todo) — receives Polar purchase webhook, signs and emails the JWT license to the buyer.
- **Deployment:** Vercel free tier. Domain optional (vercel.app subdomain works until we want branding).

### AI provider adapter pattern

All providers implement the same interface:

```ts
interface AIProvider {
  readonly name: string;
  /** Whether this provider is available in the current environment (e.g. Chrome built-in needs a recent Chrome). */
  isAvailable(): Promise<boolean>;
  /** Run pattern inference on a sanitized page + user picks. */
  infer(req: InferRequest): Promise<InferResponse>;
}
```

Adapters:

- `ChromeBuiltinAI` — uses `window.ai` / Chrome Prompt API. Runs Gemini Nano locally. Free, no key, but smaller-model quality.
- `Anthropic` — POST to `https://api.anthropic.com/v1/messages` with the user's BYOK key. Highest quality.
- `Gemini` — POST to the Google Generative Language API with the user's BYOK key. Has a meaningful free tier on the user's side.
- `OpenAI` — added in a later phase.

`lib/ai/index.ts` picks the adapter based on user settings, with a fallback chain: chosen → first available.

### `packages/shared`

Pure TypeScript types for the `InferRequest`/`InferResponse` contract. Imported by both apps. No runtime deps.

## Data model

**No relational database.** Everything that needs to persist lives in `chrome.storage.local`:

```ts
type Settings = {
  provider: 'chrome-builtin' | 'anthropic' | 'gemini' | 'openai';
  apiKeys: {
    anthropic?: string;
    gemini?: string;
    openai?: string;
  };
  license?: string; // signed JWT from Polar
};

type SavedJob = {
  id: string;
  name: string;
  url: string;
  schema: InferResponse;
  schedule?: { cron: string; nextRunAt: number };
  createdAt: number;
};

type RunRecord = {
  id: string;
  jobId: string;
  startedAt: number;
  finishedAt?: number;
  status: 'running' | 'succeeded' | 'failed';
  rowCount: number;
  rows?: Record<string, string>[]; // last N runs only — cap storage
  error?: string;
};
```

Storage caps: keep only the most recent 50 runs per job, capped at 10 MB total (chrome.storage.local quota is 10 MB by default).

## Scheduling

`chrome.alarms.create({ name: jobId, periodInMinutes: ... })` per scheduled job. The background script's `chrome.alarms.onAlarm` listener triggers the run.

**Limitation:** alarms only fire while Chrome is open. We surface this in the UI ("Pluck runs jobs while Chrome is open. Keep a tab pinned to your dashboard, or upgrade to Business [coming later] for cloud scheduling.").

A future Business tier introduces a real cloud worker. Out of scope for MVP — we do not write code or pay for it until revenue justifies it.

## License flow

```
1. User clicks "Upgrade to Pro" in the extension
   → opens Polar.sh checkout link with their email as metadata

2. User pays $29 → Polar webhook fires
   → POST /api/polar/webhook (apps/web)
   → server signs JWT with our private key: { sub: email, plan: 'pro', exp: never }
   → emails JWT to the user

3. User pastes JWT into extension settings
   → extension verifies signature with bundled public key (offline)
   → unlocks Pro features

4. No server check at runtime. Token revocation = ship an extension update with a blocklist of compromised tokens (rare).
```

This is intentionally low-friction DRM. Cracking it is trivial; we don't care at MVP — adoption beats locks.

## Sanitization, prompt budget, rate limits

The inference flow lives entirely in the extension:

1. **Content script** picks → `sanitizePageHtml()` (strips scripts/styles/comments/event handlers) → clipped to 80k chars.
2. **Background** receives picks + sanitized HTML → routes to the chosen `AIProvider`.
3. **Adapter** builds the prompt (`lib/ai/prompt.ts`), calls the provider directly using the user's key, parses + validates the response.
4. **Picker overlay** renders the proposed schema; user confirms/refines.

Prompt caching for Anthropic: cache the page HTML so each refinement iteration is cheap (small delta). The user pays for the first request fully, then ~$0.001 per refinement.

## Open questions

- **Chrome built-in AI availability**: as of mid-2026 the Prompt API requires Chrome ≥ 127 and either a flag or origin trial. Need to detect gracefully and fall back to BYOK with a clear UI.
- **OAuth for Google Sheets export**: requires a verified OAuth client (free, but a one-time Google review). Defer until Phase 3.
- **Polar vs Lemon Squeezy vs Gumroad**: leaning Polar for the API + DX; final pick when wiring up payments in Phase 3.
- **Anti-bot**: out of scope until we have a cloud worker. For MVP, Pluck works on sites the user can already browse (no anti-bot delegation).
