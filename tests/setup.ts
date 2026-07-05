// tests/setup.ts
// ─────────────────────────────────────────────────────────────
// Setup global Vitest — mocks partagés entre tous les tests
// ─────────────────────────────────────────────────────────────

import { vi, beforeEach } from "vitest";

// ── Mock Prisma ───────────────────────────────────────────────
// On ne touche jamais la vraie BDD dans les tests unitaires
vi.mock("~/server/utils/prisma", () => ({
  default: {
    client: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    produit: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      updateMany: vi.fn(),
    },
    formulaBox: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    abonnement: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    commande: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    boxMensuelle: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    newsletter: {
      upsert: vi.fn(),
    },
    quizResult: {
      create: vi.fn(),
    },
    contact: {
      create: vi.fn(),
    },
  },
}));

// ── Mock Email (Resend) ───────────────────────────────────────
vi.mock("~/server/utils/email", () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
  sendAbonnementConfirmation: vi.fn().mockResolvedValue(undefined),
  sendCommandeConfirmation: vi.fn().mockResolvedValue(undefined),
  sendNewsletterConfirmation: vi.fn().mockResolvedValue(undefined),
}));

// ── Mock h3 helpers (Nuxt server) ────────────────────────────
vi.mock("h3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("h3")>();
  return {
    ...actual,
    readBody: vi.fn(),
    getQuery: vi.fn(),
    getHeader: vi.fn(),
    createError: actual.createError,
  };
});

// ── Mock $fetch (Nuxt auto-import) ───────────────────────────
vi.stubGlobal("$fetch", vi.fn());

// ── Reset tous les mocks avant chaque test ───────────────────
beforeEach(() => {
  vi.clearAllMocks();
});
