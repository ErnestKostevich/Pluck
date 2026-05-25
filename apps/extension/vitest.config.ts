import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: false,
    include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@pluck/shared': resolve(__dirname, '../../packages/shared/src'),
    },
  },
});
