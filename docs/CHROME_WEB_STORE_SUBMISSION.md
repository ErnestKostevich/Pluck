# Chrome Web Store submission — fill-in guide

Everything is ready. This document is a click-by-click recipe for getting
Pluck on the Chrome Web Store. Open the form, copy the blocks below, upload
the assets, submit. Review takes 1–2 weeks usually.

---

## What you already have

| Asset | Path | Size |
|---|---|---|
| Production zip | `apps/extension/.output/pluckextension-0.0.1-chrome.zip` | 135 KB |
| Icons (auto-bundled) | `.output/chrome-mv3/icon/{16,32,48,96,128}.png` | — |
| Small promo tile (440×280) | `docs/cws-assets/promo-small-440x280.png` | — |
| Marquee tile (1400×560) | `docs/cws-assets/promo-marquee-1400x560.png` | — |
| Privacy policy URL | https://pluck-eight.vercel.app/privacy | live |
| Support URL | https://pluck-eight.vercel.app/faq | live |

---

## Step 1 — Pay the $5 dev fee (one time)

1. Go to <https://chrome.google.com/webstore/devconsole>
2. Sign in with the Google account you want to OWN the extension under
3. If first time: click **Pay registration fee** → **$5** with any card
4. Accept the Developer Program Policies

The $5 covers your entire account, forever. Not per-extension.

---

## Step 2 — Create the new item

1. From the dashboard: **+ New item** (top right)
2. Drag-drop `apps/extension/.output/pluckextension-0.0.1-chrome.zip` into the
   uploader, or click "Browse files"
3. Click **Upload**. Wait ~10 seconds for parsing.
4. You'll land on the listing form. Fill in the sections below.

---

## Step 3 — "Store listing" tab

### Product details

| Field | Value |
|---|---|
| **Title** | `Pluck — AI Visual Web Scraper` |
| **Summary** (132 chars max) | `Click anything on any page, get a clean table. AI-powered web scraper for non-coders. $29 lifetime, free with on-device AI.` |
| **Category** | Productivity |
| **Language** | English |

### Description (paste this whole block into the "Description" field)

```
Pluck turns any webpage into structured data — by clicking on it.

The existing web-scraping tools (Octoparse, ParseHub, Apify) were built for engineers: CSS selectors, XPath, regular expressions, broken scripts when the site changes. Pluck is built for the marketer, recruiter, SDR, or e-commerce operator who needs the data this week, not next sprint.

HOW IT WORKS

1. Click the Pluck icon on any page.
2. Click a few examples of the data you want — a product name, a price, a profile link.
3. Pluck's AI looks at your picks and infers selectors for every other row on the page.
4. It validates the proposal against the live page and highlights every match in green.
5. Save the job, schedule it, or just download as CSV. Re-run any time.

ZERO RECURRING COST

Pluck runs AI inference on YOUR machine, not on a server we pay for. Choose:

• Chrome's built-in AI (free, on-device, no API key required — Chrome 127+)
• Your own Anthropic, Gemini, or OpenAI key (BYOK — your bill, not ours)

That's why Pluck Pro is a one-time $29 lifetime license, not a subscription. We don't have monthly costs to pass on.

PRO FEATURES ($29 lifetime, no recurring)

• Unlimited saved jobs (free is capped at 3)
• Scheduled runs (every 5m to 24h, via chrome.alarms)
• Multi-page pagination (next-link, page-numbers, infinite scroll)
• Webhook delivery with HMAC-SHA256 signatures
• Google Sheets export via Apps Script
• Priority support

GOOD TO KNOW

• Pluck works on any site you can already see in your browser — it doesn't bypass logins, paywalls, or anti-bot systems.
• Scheduled runs fire while Chrome is open (a cloud-worker option is on the roadmap as a paid Business tier).
• CAPTCHA-protected pages are detected and gracefully fail with a clear error.

PRIVACY

Pluck has no server in the data path. Your saved jobs live in chrome.storage. Your API keys never leave your browser. Pro licenses are verified offline — no phone home. Full privacy policy: https://pluck-eight.vercel.app/privacy

14-day full refund, no questions asked.
```

### Graphic assets

| Field | What to upload |
|---|---|
| **Store icon** (128×128) | Already in the zip, auto-filled |
| **Small promo tile** (440×280, optional) | `docs/cws-assets/promo-small-440x280.png` |
| **Marquee promo tile** (1400×560, optional) | `docs/cws-assets/promo-marquee-1400x560.png` |
| **Screenshots** (1280×800 or 640×400, at least 1, up to 5) | You need to capture these — see Step 4 below |

> The promo tiles are optional but **strongly recommended** — without them
> your extension can't appear in featured collections.

### Additional fields

| Field | Value |
|---|---|
| **Official URL** | `https://pluck-eight.vercel.app` |
| **Homepage URL** | `https://pluck-eight.vercel.app` |
| **Support URL** | `https://pluck-eight.vercel.app/faq` |
| **Mature content** | No |

---

## Step 4 — Take screenshots (you must do this yourself)

You need at least **1** screenshot at **1280×800** or **640×400** PNG/JPEG.
Aim for 3–5 for a strong listing.

Open the extension on real sites (load unpacked from
`apps/extension/.output/chrome-mv3/`). Then use Win+Shift+S to snip
1280×800 regions of these scenes:

### Screenshot 1 — the picker in action
- Open https://news.ycombinator.com
- Click Pluck → "Start picker"
- Click 2-3 story titles, see the green pick outlines + toolbar
- Snip: include the toolbar on the right + several outlined rows on the left

### Screenshot 2 — validation result
- Continue from #1, click "Infer pattern"
- After result loads, all rows get dashed green outlines + the preview table
  appears in the toolbar
- Snip: include the dashed-green page + the preview table

### Screenshot 3 — the popup
- Open the extension popup with a saved job (run a job first to get a row count)
- Snip: include the popup UI clean, showing the saved job + Run/Export/Delete

### Screenshot 4 — the Settings page
- Right-click Pluck icon → Options
- Snip: the AI providers section with one selected (Chrome built-in shows ✓)

### Screenshot 5 — Pro / License entry
- In Options, scroll to License section, show the JWT entered + "✓ Valid Pro
  license" message

Save each as PNG. Drag into the screenshot uploader on the listing form.

> **Tip:** for a clean shot, use Chrome's incognito window with no other
> extensions visible, dark mode, 1280×800 window size.

---

## Step 5 — "Privacy practices" tab

This is the section that gets the most rejections. Be **honest and specific**.

### Single Purpose

```
Pluck has a single purpose: extracting structured data from web pages by clicking on the data the user wants. The AI infers selectors for that data and renders it as a table, which the user can export to CSV, Google Sheets, or a webhook.
```

### Permissions justifications

Click **each permission** and paste:

#### `activeTab`

```
Required to inject the picker overlay into the user's current tab when they click "Start picker" in the extension popup. The overlay highlights elements the user hovers and captures their clicks so the AI can infer the scrape pattern.
```

#### `scripting`

```
Required to execute the data-extraction script in a hidden tab when the user re-runs a saved scrape job. The script reads structured data from the page and returns it to the extension for storage and export.
```

#### `storage`

```
Saved scrape jobs, settings, the user's chosen AI provider, BYOK API keys, and the Pro license JWT are persisted in chrome.storage.local. Nothing is sent to any external server controlled by us — the storage is local to the user's browser.
```

#### `alarms`

```
Powers the scheduled-runs feature (Pro tier). The user can set a saved scrape job to re-run every 5 minutes, 1 hour, 24 hours, etc. chrome.alarms fires the trigger, which runs the same extraction logic in a hidden tab.
```

#### `tabs`

```
Re-running a saved scrape job opens the target URL in a hidden background tab to perform the extraction. The tab is automatically closed after the extraction completes.
```

#### Host permission `<all_urls>`

```
The picker must work on whichever website the user chooses to use it on. We cannot know in advance which sites a given user will want to scrape data from. Pluck only injects content scripts and reads data when the user explicitly initiates an action (clicks "Start picker" or "Run now" on a saved job).
```

### Data collection

Check **No** for everything EXCEPT:

- ☑ **Personally identifiable information**: email (collected at purchase time
  via Polar/NOWPayments hosted checkout, used only to deliver the license JWT
  by email; not stored on Pluck servers after issuance)

Or, if the form lets you select **none**: select none, because Pluck genuinely
collects nothing through the extension itself. Email collection happens through
the third-party payment processor, not the extension.

### Privacy policy URL

```
https://pluck-eight.vercel.app/privacy
```

### Certifications

Check all that apply:

- ☑ I do not sell or transfer user data to third parties outside of the approved use cases
- ☑ I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- ☑ I do not use or transfer user data to determine creditworthiness or for lending purposes

---

## Step 6 — "Distribution" tab

| Field | Value |
|---|---|
| **Visibility** | Public |
| **Distribution countries** | All countries |
| **Pricing** | Free *(Pro is sold via crypto on our own checkout, not Chrome's payment system)* |

---

## Step 7 — Submit

1. Top right: **Submit for review**
2. Confirm
3. You'll get an email when the review concludes

### What review typically asks about (be ready)

If they reject, the reason is usually one of:

- **Single Purpose** — clarify if asked
- **Permission justifications too vague** — the ones above should pass; if not,
  add specific examples ("when the user clicks Run Now…")
- **Privacy policy missing or doesn't cover X** — our /privacy is thorough
- **Misleading description** — ours describes exactly what the extension does

You can resubmit immediately after a fix. Second review is faster (~3 days).

---

## After approval

1. The extension appears at `https://chromewebstore.google.com/detail/<id>`
2. Update the landing page in `apps/web/src/app/page.tsx` and `pricing/page.tsx`
   to link **"Add to Chrome"** at this URL instead of the GitHub side-load
3. (Optional) Tweet, post on Product Hunt, write Show HN
4. Watch your inbox

---

## What still needs you (after CWS submission)

- ☐ Take + upload 3-5 screenshots (Step 4)
- ☐ Pay $5 dev fee (Step 1)
- ☐ Click through the form using the copy in Steps 3 + 5
- ☐ Submit
- ☐ While waiting: keep landing page linking to GitHub side-load as fallback
- ☐ When approved: swap landing CTA from GitHub side-load → Chrome Store URL
