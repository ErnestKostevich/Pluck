/**
 * CSV export utilities.
 *
 * Spec: RFC 4180 — fields containing commas, quotes, or newlines are wrapped in
 * double quotes, with embedded quotes doubled.
 */

export function rowsToCsv(rows: Record<string, string>[], columnOrder?: string[]): string {
  if (rows.length === 0) return '';
  const headers = columnOrder ?? extractHeaders(rows);
  const lines: string[] = [headers.map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape(row[h] ?? '')).join(','));
  }
  return lines.join('\r\n');
}

function extractHeaders(rows: Record<string, string>[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const row of rows) {
    for (const k of Object.keys(row)) {
      if (!seen.has(k)) {
        seen.add(k);
        order.push(k);
      }
    }
  }
  return order;
}

function csvEscape(value: string): string {
  if (value == null) return '';
  const needsQuotes = /[",\r\n]/.test(value);
  if (!needsQuotes) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Trigger a download of a CSV file in the user's browser.
 *
 * Called from popup or options page contexts (which have access to document).
 * Returns the blob URL so callers can revoke it after the download is queued.
 */
export function downloadCsv(filename: string, csv: string): string {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Defer revoke so the browser has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return url;
}

/** Slugify a string for use as a filename. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}
