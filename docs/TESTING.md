# Testing Pluck end-to-end

This is the manual test plan for verifying Pluck works on your machine before you ever publish. Follow it top-to-bottom. Each section says **what to check** and **what success looks like**.

## Prerequisites

- Node.js ≥ 20
- pnpm ≥ 11 (install: `npm i -g pnpm`)
- Chrome ≥ 127 (the on-device AI path needs it; BYOK works on any Chrome)
- One of:
  - **Option A — Free path:** Chrome built-in AI enabled and Gemini Nano downloaded.
    - Visit `chrome://flags/#prompt-api-for-gemini-nano` → set to **Enabled**.
    - Visit `chrome://flags/#optimization-guide-on-device-model` → set to **Enabled BypassPerfRequirement**.
    - Restart Chrome.
    - Visit `chrome://components` → find **Optimization Guide On Device Model** → click **Check for update**. Wait for the version to be non-empty (a couple of GB; first time only).
  - **Option B — Paid path:** an Anthropic API key from <https://console.anthropic.com/settings/keys>. You start with $5 of free credit, plenty for tests.

## 1 · Install + build

```bash
git clone https://github.com/ErnestKostevich/Project-3.git pluck
cd pluck
pnpm install
pnpm -r typecheck
pnpm -r test
pnpm -r build
```

**Success:** all green. `pnpm -r test` shows ~45 passing tests. `pnpm -r build` produces:

- `apps/extension/.output/chrome-mv3/` (the unpacked extension)
- `apps/web/.next/` (the marketing site)

## 2 · Run the dev servers

In one terminal:

```bash
pnpm dev:extension
```

This rebuilds the extension to `apps/extension/.output/chrome-mv3/` on every save.

In another terminal:

```bash
pnpm dev:web
```

Open <http://localhost:3000>. **Success:** landing page renders with "Click anything. Get a clean table.", navigation works (Home → Pricing → FAQ).

## 3 · Load the extension into Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select `apps/extension/.output/chrome-mv3-dev/` (created by `pnpm dev:extension`).
5. Pluck icon appears in the toolbar (you may need to pin it).

**Success:** clicking the icon opens a popup labeled "🍒 Pluck" with a "Start picker on this tab" button.

## 4 · Configure your AI provider

1. Click the popup's **Settings** link (top right).
2. Choose a provider:
   - **Chrome built-in AI** — click **Test availability**. Expected: ✓ Available. If not, follow the chrome://flags steps in Prerequisites and retry.
   - **Anthropic Claude (BYOK)** — paste your `sk-ant-…` key, click **Test**. Expected: ✓ Available.
3. The provider you click last is the active one (selected card has the indigo border).

**Success:** the selected provider's test button shows ✓ Available.

## 5 · First scrape: a list page

A good test target is a list-shaped public page. Suggestions:

- <https://news.ycombinator.com>
- <https://blog.cloudflare.com>
- Any e-commerce category page
- A directory like <https://www.indiehackers.com/products>

Steps:

1. Open the test page in a normal tab.
2. Click the Pluck icon → **Start picker on this tab**.
3. The picker overlay appears in the top-right corner.
4. Click on **one** example of each thing you want — for HN, that might be: a title, a points number, a username link.
5. (Optional) Type a column name into the input next to each pick.
6. Click **Infer pattern**.
7. Wait ~3–8 seconds. The overlay swaps to the validation view:
   - All matching rows on the page should be outlined in dashed green.
   - The result panel shows a table with REAL extracted data (not made-up samples).
   - Confidence percentage is shown.

**Success:** the green outlines cover the rows you expected (e.g. every story on the HN front page). The preview table looks right.

If it doesn't:

- Click **← Refine picks** to go back. Add another example (the AI sometimes needs 2–3 examples from different rows to generalize).
- Re-run **Infer pattern**.

## 6 · Save the job

1. From the validation view, click **Save as job**.
2. The picker shows a name field pre-filled with the page title. Edit if you like.
3. Click **Save**.
4. The picker shows ✓ Saved and closes.

**Success:** open the popup again — the job appears in the **Saved jobs** list with `0 rows · Never run` or the latest run summary.

## 7 · Re-run the job

1. In the popup, click the **▶** button next to the saved job.
2. The button shows `…` while running. The popup may close — re-open it.
3. Within ~10–20 seconds the job row updates to `N rows · just now`.

**Success:** the new row count matches what's on the live page (some variance is fine if the page is dynamic).

## 8 · Export CSV

1. Click the **⬇** button on the saved job.
2. A CSV file downloads.
3. Open it. **Success:** columns match what you picked. Rows match what was on the page.

## 9 · License (Pro features)

1. Generate a dev keypair (only ever do this once locally; the result is committed to source):

   ```bash
   pnpm gen-license-keys
   ```

   This rewrites `apps/extension/src/lib/license.ts` with the new public key and appends `LICENSE_PRIVATE_KEY` to `apps/web/.env.local`.

2. **Rebuild the extension** so the new public key is bundled:

   ```bash
   pnpm dev:extension
   ```

   (Or `pnpm --filter @pluck/extension build` if you stopped dev mode.)

3. Reload the unpacked extension in `chrome://extensions` (refresh icon on the Pluck card).

4. Sign a test license:

   ```bash
   pnpm sign-test-license you@example.com
   ```

   This prints a JWT to stdout. Copy it.

5. Open Settings in the extension → paste the JWT into the License field → click **Apply license**.

**Success:** the page shows ✓ Valid Pro license for `you@example.com · lifetime`. The badge in the popup switches from FREE to PRO. The free-tier job cap goes away.

## 10 · /api/license/verify (web endpoint)

Verifies the server-side equivalent works too:

```bash
# Replace JWT with the one you signed above
curl -s -X POST -H "Content-Type: application/json" \
  -d "{\"license\":\"YOUR_JWT_HERE\"}" \
  http://localhost:3000/api/license/verify
```

**Success:** `{ "valid": true, "payload": { "sub": "you@example.com", "plan": "pro", "iat": ..., "v": 1 } }`.

If you pass `"license": "garbage"`, you get `{ "valid": false, "reason": "malformed JWT" }`.

## 11 · Scheduled runs (Pro only)

> Not yet wired into the popup UI in this build. To exercise the scheduling code manually:

In Chrome DevTools for the popup or background page:

```js
await chrome.alarms.create('pluck:job:<your-job-id>', {
  periodInMinutes: 1,
  delayInMinutes: 1,
});
```

Wait 60 seconds. The job's `lastRun` should update with a new succeeded run.

**Caveats:**

- Chrome must stay open for alarms to fire.
- Background service workers go idle after ~30 seconds; the alarm wakes them.

## What's deliberately not in this MVP

- Scheduled-runs UI in the popup (the scheduling layer works; the UI panel is Phase 3 polish).
- Google Sheets / webhook export (Phase 3).
- Polar.sh checkout flow (Phase 3 — the webhook endpoint is stubbed; payments aren't wired live).
- Gemini / OpenAI providers (Phase 1 — Anthropic + Chrome built-in are enough to validate the architecture).
- Pagination follower (Phase 2 — currently extracts the first page only).
- A cloud worker for "Chrome doesn't have to be open" scheduling (Phase 5 — Business tier, after revenue).

See `docs/ROADMAP.md` for the full sequence.

## If something breaks

- **Picker doesn't appear:** reload the target page. Content scripts inject on `document_idle`; very long pages can race.
- **Infer button errors out:** open the **Settings** page — test your provider. If the test passes but inference fails, check Chrome DevTools console on the page for the actual error.
- **Run-job opens a tab but no rows:** the page probably renders the data lazily. Bump the dwell time in `apps/extension/src/lib/runner.ts` (`POST_LOAD_DWELL_MS`).
- **License shows "public key has not been committed":** you haven't run `pnpm gen-license-keys` yet. That's the placeholder-key safeguard refusing to verify anything until a real key is bundled.
