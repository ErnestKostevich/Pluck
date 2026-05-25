import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: false,
    include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
    // Node 24 + vitest 2.x default thread pool crashes on Windows. Forked
    // child process with single worker is the most stable combo we found.
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@pluck/shared': resolve(__dirname, '../../packages/shared/src'),
    },
  },
});
