/**
 * Run an inferred schema against the live DOM and extract rows.
 *
 * Called by:
 *   - The picker overlay to validate the AI's proposal before the user saves.
 *   - The runner (background → injected script) when re-executing a saved job.
 */

import type { InferResponse, ColumnSpec } from '@pluck/shared';

export interface ExtractionResult {
  /** Number of containers found by the container selector. */
  containerMatches: number;
  /** Extracted rows, one per matched container. */
  rows: Record<string, string>[];
  /** The actual container Elements, in document order. For picker highlighting. */
  elements: Element[];
  /** Per-column diagnostics so we can surface "5/47 rows missing column X". */
  columnStats: Record<string, { matched: number; missing: number }>;
}

export function extractWithSchema(
  schema: InferResponse,
  root: ParentNode = document,
): ExtractionResult {
  let containers: Element[];
  try {
    containers = Array.from(root.querySelectorAll(schema.containerSelector));
  } catch {
    return {
      containerMatches: 0,
      rows: [],
      elements: [],
      columnStats: Object.fromEntries(
        schema.columns.map((c) => [c.label, { matched: 0, missing: 0 }]),
      ),
    };
  }

  const columnStats: Record<string, { matched: number; missing: number }> = {};
  for (const c of schema.columns) {
    columnStats[c.label] = { matched: 0, missing: 0 };
  }

  const rows: Record<string, string>[] = [];
  for (const container of containers) {
    const row: Record<string, string> = {};
    for (const col of schema.columns) {
      const value = extractColumn(container, col);
      if (value != null && value !== '') {
        row[col.label] = value;
        columnStats[col.label]!.matched++;
      } else {
        row[col.label] = '';
        columnStats[col.label]!.missing++;
      }
    }
    rows.push(row);
  }

  return {
    containerMatches: containers.length,
    rows,
    elements: containers,
    columnStats,
  };
}

function extractColumn(container: Element, col: ColumnSpec): string {
  let el: Element | null;
  try {
    // Selector "" or "." means the container itself.
    el = col.selector === '' || col.selector === '.' ? container : container.querySelector(col.selector);
  } catch {
    return '';
  }
  if (!el) return '';

  let raw: string;
  switch (col.attribute) {
    case undefined:
    case 'text':
      raw = (el as HTMLElement).innerText ?? el.textContent ?? '';
      break;
    case 'href':
      raw = el.getAttribute('href') ?? '';
      // Resolve relative URLs.
      if (raw) {
        try {
          raw = new URL(raw, document.baseURI).href;
        } catch {
          /* leave as-is */
        }
      }
      break;
    case 'src':
      raw = el.getAttribute('src') ?? '';
      if (raw) {
        try {
          raw = new URL(raw, document.baseURI).href;
        } catch {
          /* leave as-is */
        }
      }
      break;
    case 'value':
      raw = (el as HTMLInputElement).value ?? '';
      break;
    default:
      raw = el.getAttribute(col.attribute) ?? '';
  }

  const trimmed = raw.replace(/\s+/g, ' ').trim();
  return applyTransform(trimmed, col.transform);
}

function applyTransform(value: string, transform: ColumnSpec['transform']): string {
  if (!value || !transform) return value;
  switch (transform) {
    case 'trim':
      return value.trim();
    case 'number': {
      const m = value.match(/-?[\d,]+(\.\d+)?/);
      if (!m) return value;
      return m[0].replace(/,/g, '');
    }
    case 'url':
      try {
        return new URL(value, document.baseURI).href;
      } catch {
        return value;
      }
    case 'date': {
      const d = new Date(value);
      return isNaN(d.getTime()) ? value : d.toISOString();
    }
    default:
      return value;
  }
}
