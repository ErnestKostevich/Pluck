import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow the Chrome extension origin to call our API in dev.
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  transpilePackages: ['@pluck/shared'],
  // Avoid spawning a worker-per-page during static generation. On some
  // Windows + Node 24 combos the worker spawn fails ("spawn UNKNOWN") — a
  // single-process build sidesteps that without changing what gets shipped.
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
