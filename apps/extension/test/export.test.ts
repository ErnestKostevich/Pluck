import { describe, it, expect } from 'vitest';
import { rowsToCsv, slugify } from '@/lib/export';

describe('rowsToCsv', () => {
  it('returns empty string for empty input', () => {
    expect(rowsToCsv([])).toBe('');
  });

  it('emits header + rows with CRLF separators', () => {
    const csv = rowsToCsv([
      { name: 'Widget A', price: '$10' },
      { name: 'Widget B', price: '$15' },
    ]);
    expect(csv).toBe('name,price\r\nWidget A,$10\r\nWidget B,$15');
  });

  it('quotes fields containing commas, quotes, or newlines', () => {
    const csv = rowsToCsv([{ a: 'has, comma', b: 'has "quote"', c: 'has\nnewline' }]);
    expect(csv).toContain('"has, comma"');
    expect(csv).toContain('"has ""quote"""');
    expect(csv).toContain('"has\nnewline"');
  });

  it('honors explicit column order', () => {
    const csv = rowsToCsv(
      [
        { c: '3', a: '1', b: '2' },
        { a: '4', b: '5', c: '6' },
      ],
      ['a', 'b', 'c'],
    );
    expect(csv.split('\r\n')[0]).toBe('a,b,c');
    expect(csv.split('\r\n')[1]).toBe('1,2,3');
    expect(csv.split('\r\n')[2]).toBe('4,5,6');
  });

  it('fills missing fields with empty cells', () => {
    const csv = rowsToCsv([{ a: '1' }, { a: '2', b: '3' }]);
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe('a,b');
    expect(lines[1]).toBe('1,');
    expect(lines[2]).toBe('2,3');
  });
});

describe('slugify', () => {
  it('lowercases and replaces spaces with dashes', () => {
    expect(slugify('My Job Name')).toBe('my-job-name');
  });

  it('strips non-word characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('collapses runs of dashes and trims', () => {
    expect(slugify('  -- foo --   bar -- ')).toBe('foo-bar');
  });

  it('caps length at 60 chars', () => {
    expect(slugify('x'.repeat(100)).length).toBe(60);
  });
});
