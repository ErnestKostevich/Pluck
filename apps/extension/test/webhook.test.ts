import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dispatchWebhook, generateWebhookSecret } from '@/lib/integrations/webhook';
import type { SavedJob, RunRecord, WebhookConfig } from '@/lib/storage';

const SAMPLE_JOB: SavedJob = {
  id: 'job-1',
  name: 'Test Job',
  url: 'https://example.com',
  schema: {
    containerSelector: '.row',
    columns: [{ label: 'a', selector: '.a' }],
    confidence: 1,
    sampleRows: [],
  },
  createdAt: 0,
  updatedAt: 0,
};

const SAMPLE_RUN: RunRecord = {
  id: 'run-1',
  jobId: 'job-1',
  startedAt: 100,
  finishedAt: 200,
  status: 'succeeded',
  rowCount: 2,
  rows: [{ a: 'x' }, { a: 'y' }],
};

describe('dispatchWebhook', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('no-ops when disabled', async () => {
    const config: WebhookConfig = { enabled: false, url: 'https://x', secret: 's' };
    const res = await dispatchWebhook(config, SAMPLE_JOB, SAMPLE_RUN);
    expect(res.ok).toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('errors when url is empty', async () => {
    const config: WebhookConfig = { enabled: true, url: '', secret: 's' };
    const res = await dispatchWebhook(config, SAMPLE_JOB, SAMPLE_RUN);
    expect(res.ok).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('POSTs JSON body with HMAC signature header', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    vi.stubGlobal('fetch', mockFetch);

    const config: WebhookConfig = {
      enabled: true,
      url: 'https://hooks.example.com/in',
      secret: 'test-secret',
    };
    const res = await dispatchWebhook(config, SAMPLE_JOB, SAMPLE_RUN);
    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0]!;
    expect(url).toBe('https://hooks.example.com/in');
    expect(opts.method).toBe('POST');
    expect(opts.headers['Content-Type']).toBe('application/json');
    expect(opts.headers['x-pluck-job-id']).toBe('job-1');
    expect(opts.headers['x-pluck-run-id']).toBe('run-1');
    expect(opts.headers['x-pluck-signature']).toMatch(/^[A-Za-z0-9+/=]+$/);
    const body = JSON.parse(opts.body);
    expect(body.rows).toHaveLength(2);
    expect(body.jobName).toBe('Test Job');
  });

  it('reports HTTP failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('Unauthorized', { status: 401 })),
    );
    const config: WebhookConfig = {
      enabled: true,
      url: 'https://hooks.example.com/in',
      secret: 's',
    };
    const res = await dispatchWebhook(config, SAMPLE_JOB, SAMPLE_RUN);
    expect(res.ok).toBe(false);
    expect(res.status).toBe(401);
    expect(res.error).toContain('Unauthorized');
  });

  it('reports network errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connection refused')));
    const config: WebhookConfig = {
      enabled: true,
      url: 'https://hooks.example.com/in',
      secret: 's',
    };
    const res = await dispatchWebhook(config, SAMPLE_JOB, SAMPLE_RUN);
    expect(res.ok).toBe(false);
    expect(res.error).toContain('connection refused');
  });
});

describe('generateWebhookSecret', () => {
  it('generates a random base64 string', () => {
    const a = generateWebhookSecret();
    const b = generateWebhookSecret();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9+/=]+$/);
    expect(a.length).toBeGreaterThan(30);
  });
});
