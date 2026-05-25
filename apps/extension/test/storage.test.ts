import { describe, it, expect } from 'vitest';
import {
  saveJob,
  listJobs,
  getJob,
  deleteJob,
  appendRun,
  listRuns,
  getJobCount,
  FREE_TIER_MAX_JOBS,
} from '@/lib/storage';
import type { InferResponse } from '@pluck/shared';

const SAMPLE_SCHEMA: InferResponse = {
  containerSelector: '.item',
  columns: [{ label: 'name', selector: 'h1' }],
  confidence: 0.9,
  sampleRows: [],
};

describe('storage — jobs', () => {
  it('saves and retrieves a job', async () => {
    const job = await saveJob({
      name: 'Test job',
      url: 'https://example.com',
      schema: SAMPLE_SCHEMA,
    });
    expect(job.id).toBeTruthy();
    expect(job.createdAt).toBeGreaterThan(0);
    const fetched = await getJob(job.id);
    expect(fetched?.name).toBe('Test job');
  });

  it('updates an existing job by id', async () => {
    const a = await saveJob({ name: 'A', url: 'https://example.com', schema: SAMPLE_SCHEMA });
    const b = await saveJob({
      id: a.id,
      name: 'A renamed',
      url: 'https://example.com',
      schema: SAMPLE_SCHEMA,
    });
    expect(b.id).toBe(a.id);
    expect(b.createdAt).toBe(a.createdAt);
    expect(b.updatedAt).toBeGreaterThanOrEqual(a.updatedAt);
    const all = await listJobs();
    expect(all).toHaveLength(1);
    expect(all[0]!.name).toBe('A renamed');
  });

  it('lists jobs newest-first', async () => {
    await saveJob({ name: 'first', url: 'https://x', schema: SAMPLE_SCHEMA });
    await new Promise((r) => setTimeout(r, 5));
    await saveJob({ name: 'second', url: 'https://x', schema: SAMPLE_SCHEMA });
    const all = await listJobs();
    expect(all.map((j) => j.name)).toEqual(['second', 'first']);
  });

  it('deletes a job and its runs', async () => {
    const job = await saveJob({ name: 'D', url: 'https://x', schema: SAMPLE_SCHEMA });
    await appendRun({
      id: 'run-1',
      jobId: job.id,
      startedAt: Date.now(),
      finishedAt: Date.now(),
      status: 'succeeded',
      rowCount: 5,
    });
    await deleteJob(job.id);
    expect(await getJob(job.id)).toBeNull();
    expect(await listRuns(job.id)).toHaveLength(0);
  });

  it('counts jobs correctly for the free-tier gate', async () => {
    for (let i = 0; i < 5; i++) {
      await saveJob({ name: `J${i}`, url: 'https://x', schema: SAMPLE_SCHEMA });
    }
    const count = await getJobCount();
    expect(count).toBe(5);
    expect(count > FREE_TIER_MAX_JOBS).toBe(true);
  });
});

describe('storage — runs', () => {
  it('appends runs and updates job lastRun snapshot', async () => {
    const job = await saveJob({ name: 'R', url: 'https://x', schema: SAMPLE_SCHEMA });
    await appendRun({
      id: 'run-1',
      jobId: job.id,
      startedAt: Date.now() - 1000,
      finishedAt: Date.now(),
      status: 'succeeded',
      rowCount: 12,
      rows: [{ name: 'foo' }, { name: 'bar' }],
    });

    const refreshed = await getJob(job.id);
    expect(refreshed?.lastRun).toBeDefined();
    expect(refreshed?.lastRun?.status).toBe('succeeded');
    expect(refreshed?.lastRun?.rowCount).toBe(12);
  });

  it('only keeps row data on the most recent successful run per job', async () => {
    const job = await saveJob({ name: 'R2', url: 'https://x', schema: SAMPLE_SCHEMA });
    await appendRun({
      id: 'r-old',
      jobId: job.id,
      startedAt: Date.now() - 10_000,
      finishedAt: Date.now() - 9000,
      status: 'succeeded',
      rowCount: 1,
      rows: [{ x: '1' }],
    });
    await appendRun({
      id: 'r-new',
      jobId: job.id,
      startedAt: Date.now(),
      finishedAt: Date.now(),
      status: 'succeeded',
      rowCount: 2,
      rows: [{ x: 'a' }, { x: 'b' }],
    });

    const runs = await listRuns(job.id);
    const newest = runs.find((r) => r.id === 'r-new');
    const older = runs.find((r) => r.id === 'r-old');
    expect(newest?.rows).toBeDefined();
    expect(older?.rows).toBeUndefined();
  });
});
