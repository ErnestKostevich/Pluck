import { describe, it, expect, beforeEach } from 'vitest';
import { extractWithSchema } from '@/lib/selector-validation';
import type { InferResponse } from '@pluck/shared';

describe('extractWithSchema', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('extracts text columns from a repeating list', () => {
    document.body.innerHTML = `
      <ul class="products">
        <li class="product"><h3>Widget A</h3><span class="price">$10</span></li>
        <li class="product"><h3>Widget B</h3><span class="price">$15</span></li>
        <li class="product"><h3>Widget C</h3><span class="price">$20</span></li>
      </ul>
    `;
    const schema: InferResponse = {
      containerSelector: '.product',
      columns: [
        { label: 'name', selector: 'h3' },
        { label: 'price', selector: '.price' },
      ],
      confidence: 0.9,
      sampleRows: [],
    };
    const result = extractWithSchema(schema);
    expect(result.containerMatches).toBe(3);
    expect(result.rows).toHaveLength(3);
    expect(result.rows[0]).toEqual({ name: 'Widget A', price: '$10' });
    expect(result.rows[2]).toEqual({ name: 'Widget C', price: '$20' });
  });

  it('extracts href attribute and resolves relative URLs', () => {
    // Set base URI via a <base> tag (jsdom respects this).
    document.head.innerHTML = '<base href="https://example.com/products/">';
    document.body.innerHTML = `
      <div class="card"><a href="/item/1">A</a></div>
      <div class="card"><a href="item/2">B</a></div>
    `;
    const schema: InferResponse = {
      containerSelector: '.card',
      columns: [{ label: 'url', selector: 'a', attribute: 'href' }],
      confidence: 1,
      sampleRows: [],
    };
    const result = extractWithSchema(schema);
    expect(result.rows[0]!.url).toBe('https://example.com/item/1');
    expect(result.rows[1]!.url).toBe('https://example.com/products/item/2');
  });

  it('returns 0 matches when the container selector is invalid', () => {
    document.body.innerHTML = '<div>nothing</div>';
    const schema: InferResponse = {
      containerSelector: '>>>invalid>>>',
      columns: [{ label: 'x', selector: 'a' }],
      confidence: 0.1,
      sampleRows: [],
    };
    const result = extractWithSchema(schema);
    expect(result.containerMatches).toBe(0);
    expect(result.rows).toHaveLength(0);
  });

  it('tracks per-column missing stats', () => {
    document.body.innerHTML = `
      <div class="row"><span class="a">1</span><span class="b">x</span></div>
      <div class="row"><span class="a">2</span></div>
      <div class="row"><span class="a">3</span><span class="b">z</span></div>
    `;
    const schema: InferResponse = {
      containerSelector: '.row',
      columns: [
        { label: 'a', selector: '.a' },
        { label: 'b', selector: '.b' },
      ],
      confidence: 1,
      sampleRows: [],
    };
    const result = extractWithSchema(schema);
    expect(result.columnStats.a).toEqual({ matched: 3, missing: 0 });
    expect(result.columnStats.b).toEqual({ matched: 2, missing: 1 });
    expect(result.rows[1]).toEqual({ a: '2', b: '' });
  });

  it('applies the number transform', () => {
    document.body.innerHTML = `
      <div class="row"><span>Price: $1,234.50</span></div>
    `;
    const schema: InferResponse = {
      containerSelector: '.row',
      columns: [{ label: 'price', selector: 'span', transform: 'number' }],
      confidence: 1,
      sampleRows: [],
    };
    const result = extractWithSchema(schema);
    expect(result.rows[0]!.price).toBe('1234.50');
  });

  it('supports selector="" for the container itself', () => {
    document.body.innerHTML = `
      <span class="tag">JS</span>
      <span class="tag">TS</span>
    `;
    const schema: InferResponse = {
      containerSelector: '.tag',
      columns: [{ label: 'name', selector: '' }],
      confidence: 1,
      sampleRows: [],
    };
    const result = extractWithSchema(schema);
    expect(result.rows.map((r) => r.name)).toEqual(['JS', 'TS']);
  });
});
