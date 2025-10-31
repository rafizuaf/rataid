import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    exclude: ['**/node_modules/**', '**/e2e/**', '**/.{idea,git,cache,output,temp}/**'],
    pool: 'threads',
    poolOptions: {
      threads: {
        isolate: true,
      },
    },
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  esbuild: {
    target: 'node18',
    include: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  },
});

