import { describe, it, expect } from 'vitest';
import {
  validateInferRequest,
  validateInferResponse,
  ValidationError,
} from '../src/schemas';

describe('validateInferRequest', () => {
  it('accepts a minimal valid request', () => {
    const req = validateInferRequest({
      url: 'https://example.com',
      pageHtml: '<html></html>',
      picks: [{ domPath: 'div', sampleText: 'x', sampleHtml: '<div>x</div>' }],
    });
    expect(req.url).toBe('https://example.com');
    expect(req.picks).toHaveLength(1);
  });

  it('preserves the optional label on picks', () => {
    const req = validateInferRequest({
      url: 'https://x',
      pageHtml: '<x>',
      picks: [
        { domPath: 'h1', sampleText: 'T', sampleHtml: '<h1>T</h1>', label: 'title' },
      ],
    });
    expect(req.picks[0]!.label).toBe('title');
  });

  it('rejects missing fields', () => {
    expect(() =>
      validateInferRequest({ url: 'https://x', pageHtml: '<x>' }),
    ).toThrow(ValidationError);
  });

  it('rejects empty picks array', () => {
    expect(() =>
      validateInferRequest({ url: 'https://x', pageHtml: '<x>', picks: [] }),
    ).toThrow(/≥1/);
  });

  it('rejects more than 20 picks', () => {
    const picks = Array.from({ length: 21 }, () => ({
      domPath: 'a',
      sampleText: '',
      sampleHtml: '',
    }));
    expect(() =>
      validateInferRequest({ url: 'https://x', pageHtml: '<x>', picks }),
    ).toThrow(/≤20/);
  });

  it('rejects too-large pageHtml', () => {
    const huge = 'x'.repeat(200_001);
    expect(() =>
      validateInferRequest({
        url: 'https://x',
        pageHtml: huge,
        picks: [{ domPath: 'a', sampleText: '', sampleHtml: '' }],
      }),
    ).toThrow(/max length/);
  });
});

describe('validateInferResponse', () => {
  it('accepts a well-formed response', () => {
    const res = validateInferResponse({
      containerSelector: '.row',
      columns: [{ label: 'title', selector: 'h2', attribute: 'text' }],
      confidence: 0.85,
      sampleRows: [{ title: 'Example' }],
    });
    expect(res.containerSelector).toBe('.row');
    expect(res.confidence).toBe(0.85);
  });

  it('rejects confidence outside [0, 1]', () => {
    expect(() =>
      validateInferResponse({
        containerSelector: '.row',
        columns: [{ label: 't', selector: 'h2' }],
        confidence: 1.5,
        sampleRows: [],
      }),
    ).toThrow(/\[0,1\]/);
  });

  it('rejects malformed column entries', () => {
    expect(() =>
      validateInferResponse({
        containerSelector: '.row',
        columns: [{ selector: 'h2' }], // missing label
        confidence: 0.5,
        sampleRows: [],
      }),
    ).toThrow();
  });
});
