import { describe, it, expect } from 'vitest';
import { verifyLicense, isProFeatureAvailable, PRO_FEATURES } from '@/lib/license';

describe('verifyLicense (placeholder-key mode)', () => {
  it('refuses to verify until a real public key is committed', async () => {
    // With the placeholder key bundled, every JWT — even a syntactically valid
    // one — must be rejected with a clear "dev mode" reason.
    const fakeJwt =
      'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicGxhbiI6InBybyJ9.fake-signature';
    const res = await verifyLicense(fakeJwt);
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.reason).toContain('public key has not been committed');
    }
  });
});

describe('isProFeatureAvailable', () => {
  it('returns false with no license', () => {
    expect(isProFeatureAvailable('scheduledRuns', null)).toBe(false);
    expect(isProFeatureAvailable('sheetsExport', null)).toBe(false);
  });

  it('returns true for pro plan + listed feature', () => {
    expect(
      isProFeatureAvailable('scheduledRuns', { sub: 'x', plan: 'pro', iat: 1 }),
    ).toBe(true);
  });

  it('returns false for free plan', () => {
    expect(
      isProFeatureAvailable('scheduledRuns', { sub: 'x', plan: 'free', iat: 1 }),
    ).toBe(false);
  });
});

describe('PRO_FEATURES', () => {
  it('exposes expected feature flags', () => {
    expect(PRO_FEATURES.unlimitedJobs).toBe(true);
    expect(PRO_FEATURES.scheduledRuns).toBe(true);
    expect(PRO_FEATURES.sheetsExport).toBe(true);
    expect(PRO_FEATURES.webhookExport).toBe(true);
  });
});
