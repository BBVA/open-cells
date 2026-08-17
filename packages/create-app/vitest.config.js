import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['src/templates/**', 'node_modules/**'],
  },
});
