import { describe, it, expect, beforeEach } from 'vitest';
import { computeDomPath, elementSampleText, elementSampleHtml } from '@/lib/dom-path';

describe('computeDomPath', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('returns the element tag for a simple element', () => {
    document.body.innerHTML = '<div><p>hi</p></div>';
    const el = document.querySelector('p')!;
    const path = computeDomPath(el);
    expect(path).toContain('p');
  });

  it('short-circuits at a unique id', () => {
    document.body.innerHTML = '<div id="unique"><span class="inner">x</span></div>';
    const el = document.querySelector('.inner')!;
    const path = computeDomPath(el);
    expect(path.startsWith('#unique')).toBe(true);
  });

  it('disambiguates same-tag siblings with :nth-of-type', () => {
    document.body.innerHTML = '<ul><li>a</li><li>b</li><li class="target">c</li></ul>';
    const el = document.querySelectorAll('li')[2]!;
    const path = computeDomPath(el);
    expect(path).toMatch(/li.*:nth-of-type\(3\)/);
  });

  it('skips hashed / auto-generated class names', () => {
    document.body.innerHTML = '<div><p class="css-abc123def">hi</p></div>';
    const el = document.querySelector('p')!;
    const path = computeDomPath(el);
    expect(path).not.toContain('css-abc123def');
  });

  it('keeps human-written class names', () => {
    document.body.innerHTML = '<div><p class="title">hi</p></div>';
    const el = document.querySelector('p')!;
    const path = computeDomPath(el);
    expect(path).toContain('.title');
  });
});

describe('elementSampleText', () => {
  it('returns trimmed innerText', () => {
    document.body.innerHTML = '<div>  hello   world   </div>';
    const text = elementSampleText(document.querySelector('div')!);
    expect(text).toBe('hello world');
  });

  it('truncates at max length with ellipsis', () => {
    document.body.innerHTML = `<div>${'x'.repeat(700)}</div>`;
    const text = elementSampleText(document.querySelector('div')!, 100);
    expect(text.length).toBe(101);
    expect(text.endsWith('…')).toBe(true);
  });
});

describe('elementSampleHtml', () => {
  it('returns outerHTML', () => {
    document.body.innerHTML = '<a href="/x">link</a>';
    const html = elementSampleHtml(document.querySelector('a')!);
    expect(html).toContain('href="/x"');
    expect(html).toContain('>link<');
  });

  it('truncates with ellipsis when exceeding max', () => {
    document.body.innerHTML = `<div>${'x'.repeat(5000)}</div>`;
    const html = elementSampleHtml(document.querySelector('div')!, 500);
    expect(html.length).toBeLessThanOrEqual(501);
    expect(html.endsWith('…')).toBe(true);
  });
});
