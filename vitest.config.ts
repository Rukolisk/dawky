// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // Environnement Node (pas browser) pour les tests serveur
    environment: 'node',

    // Dossiers de tests
    include: ['tests/**/*.{test,spec}.ts'],

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['server/**/*.ts'],
      exclude: ['server/utils/prisma.ts', 'node_modules/**'],
      thresholds: {
        lines:       70,
        functions:   70,
        branches:    65,
        statements:  70,
      },
    },

    // Timeout global
    testTimeout: 10_000,

    // Setup global (mocks partagés)
    setupFiles: ['./tests/setup.ts'],

    // Globals (describe, it, expect sans import)
    globals: true,
  },

  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '#imports': resolve(__dirname, '.nuxt/imports.d.ts'),
    },
  },
})