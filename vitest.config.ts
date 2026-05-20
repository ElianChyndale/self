import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.mts', '.jsx', '.json'],
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
