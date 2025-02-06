/// <reference types="vitest" />
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
// import dts from 'vite-plugin-dts'
import camelCase from 'camelcase'
import packageJson from './package.json'

const packageName = packageJson.name.split('/').pop() || packageJson.name

export default defineConfig({
  build: {
    rollupOptions: {
      input: 'src/index.js',
    },
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs', 'umd', 'iife'],
      name: camelCase(packageName, { pascalCase: true }),
      fileName: packageName,
    },
  },
  // plugins: [
  //   dts({ rollupTypes: true }),
  // ],
  test: {
    globals: true,
    browser: {
      provider: 'playwright',
      enabled: true,
      name: 'chromium',
    },
    coverage: {
      enabled: true,
      provider: 'istanbul',
      reportOnFailure: true,
      reporter: [
        ['lcov', { 'projectRoot': './src' }],
        ['json', { 'file': 'coverage.json' }],
        ['text']
      ]
    }
  },
})
