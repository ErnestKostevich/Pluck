/**
 * Prompt construction for the pattern-inference task.
 *
 * Kept provider-agnostic — adapters pick which slot (system / user / cacheable)
 * each piece goes into. The `page` and `picks` halves are returned separately so
 * adapters that support prompt caching (Anthropic) can cache just the page HTML.
 */

import type { InferRequest } from '@pluck/shared';

export const SYSTEM_PROMPT = `You are a web-scraping pattern-inference assistant.

The user is looking at a web page. They have clicked on a few example data points they want to extract. Your job is to:

1. Identify the repeating container that holds each "row" of data on the page.
2. For each example the user clicked, propose a CSS selector RELATIVE to the container that locates that data point in every row.
3. If the data lives in an attribute (href, src, value, etc.) rather than the element's text, name the attribute.
4. Detect pagination, if any.
5. Return 3-5 example rows extracted using your proposed selectors, so the user can sanity-check.

You MUST respond with valid JSON conforming to this shape:

{
  "containerSelector": string,
  "columns": [
    { "label": string, "selector": string, "attribute": "text" | "href" | "src" | ... }
  ],
  "paginationHint": { "type": "next-link" | "infinite-scroll" | "page-numbers" | "none", "selector"?: string },
  "confidence": number (0..1),
  "sampleRows": [ { "<column.label>": string, ... } ]
}

Rules:
- Selectors must be valid CSS. Prefer attribute selectors and stable class names; avoid auto-generated hash classes (long random strings, "_abc123" / "css-xyz123" patterns).
- "containerSelector" must match all repeated rows on the page, not just one.
- If the user's picks span multiple repeating containers, choose the most specific common ancestor.
- "confidence" is your honest probability the selectors will work on the next page-load too.
- Output ONLY the JSON object. No prose, no markdown fences.`;

export interface PromptParts {
  /** Cacheable portion: the page HTML. */
  pageBlock: string;
  /** Per-request portion: the user's picks. */
  picksBlock: string;
}

export function buildPromptParts(req: InferRequest): PromptParts {
  const pageBlock = `<page url="${escapeXml(req.url)}">\n${req.pageHtml}\n</page>`;

  const picksBlock = `<picks>
${req.picks
  .map(
    (p, i) => `<pick index="${i}"${p.label ? ` label="${escapeXml(p.label)}"` : ''}>
  <domPath>${escapeXml(p.domPath)}</domPath>
  <sampleText>${escapeXml(p.sampleText)}</sampleText>
  <sampleHtml><![CDATA[${p.sampleHtml.replace(/\]\]>/g, ']]]]><![CDATA[>')}]]></sampleHtml>
</pick>`,
  )
  .join('\n')}
</picks>

Infer the schema and respond with JSON only.`;

  return { pageBlock, picksBlock };
}

/** Flat single-string prompt (for providers that don't support multi-part). */
export function buildFlatPrompt(req: InferRequest): string {
  const { pageBlock, picksBlock } = buildPromptParts(req);
  return `${pageBlock}\n\n${picksBlock}`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
