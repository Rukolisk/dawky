// tests/setup.ts
// ─────────────────────────────────────────────────────────────
// Setup global Vitest — mocks partagés entre tous les tests
// ─────────────────────────────────────────────────────────────

import { vi, beforeEach } from "vitest";

// ── Mock Prisma ───────────────────────────────────────────────
// Mock générique : `prisma.<modele>.<methode>` est un vi.fn créé à la
// demande, recréé à chaque test (pas de fuite d'implémentation entre
// tests). Valeurs par défaut neutres : listes vides, compteurs à 0,
// updateMany qui touche 1 ligne.
const METHODES_PAR_DEFAUT: Record<string, () => unknown> = {
  findMany: () => [],
  count: () => 0,
  groupBy: () => [],
  updateMany: () => ({ count: 1 }),
  deleteMany: () => ({ count: 0 }),
  createMany: () => ({ count: 0 }),
};

let modeles = new Map<string, Record<string, ReturnType<typeof vi.fn>>>();

function modele(nom: string) {
  if (!modeles.has(nom)) {
    const methodes: Record<string, ReturnType<typeof vi.fn>> = {};
    modeles.set(
      nom,
      new Proxy(methodes, {
        get(cible, methode: string) {
          if (!cible[methode]) {
            const defaut = METHODES_PAR_DEFAUT[methode];
            cible[methode] = vi.fn(async () => defaut?.());
          }
          return cible[methode];
        },
      }),
    );
  }
  return modeles.get(nom)!;
}

export const prismaMock: any = new Proxy(
  {},
  {
    get(_cible, prop: string) {
      if (prop === "$transaction") {
        return vi.fn(async (arg: unknown) =>
          typeof arg === "function" ? arg(prismaMock) : Promise.all(arg as Promise<unknown>[]),
        );
      }
      if (prop === "$queryRaw") return vi.fn(async () => []);
      if (prop === "then") return undefined;
      return modele(prop);
    },
  },
);

vi.mock("~/server/utils/prisma", () => ({ default: prismaMock }));

// ── Mock Email (Resend) ───────────────────────────────────────
// Chaque fonction d'envoi devient un vi.fn résolu.
vi.mock("~/server/utils/email", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const mocks: Record<string, unknown> = { ...actual };
  for (const [nom, valeur] of Object.entries(actual)) {
    if (nom.startsWith("send") && typeof valeur === "function") {
      mocks[nom] = vi.fn().mockResolvedValue(undefined);
    }
  }
  return mocks;
});

// ── Mock Stripe ───────────────────────────────────────────────
export const stripeMock = {
  checkout: { sessions: { create: vi.fn(), retrieve: vi.fn(), expire: vi.fn() } },
  subscriptions: { retrieve: vi.fn(), update: vi.fn(), cancel: vi.fn() },
  customers: { create: vi.fn() },
  coupons: { create: vi.fn() },
  invoices: { retrieve: vi.fn(), list: vi.fn() },
  webhooks: { constructEvent: vi.fn() },
};

vi.mock("stripe", () => ({
  default: vi.fn(function () {
    return stripeMock;
  }),
}));

// ── Mock h3 helpers (Nuxt server) ────────────────────────────
vi.mock("h3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("h3")>();
  return {
    ...actual,
    readBody: vi.fn(),
    readRawBody: vi.fn(),
    readMultipartFormData: vi.fn(),
    getQuery: vi.fn(),
    getHeader: vi.fn(),
    getRouterParam: vi.fn(),
    setHeader: vi.fn(),
    createError: actual.createError,
  };
});

// ── Auto-imports Nuxt / Nitro ────────────────────────────────
vi.stubGlobal("$fetch", vi.fn());
// Les routes s'exportent via defineEventHandler(fn) : on récupère fn
vi.stubGlobal("defineEventHandler", (fn: unknown) => fn);
vi.stubGlobal("defineTask", (def: unknown) => def);

export const runtimeConfig = {
  public: { supabaseUrl: "https://test.supabase.co", supabaseAnonKey: "anon-key", appUrl: "https://dawky.test" },
  supabaseServiceKey: "test-service-role-key",
  databaseUrl: "postgres://test",
  resendApiKey: "test-resend-key",
  emailFrom: "Dawky <test@dawky.fr>",
  emailReplyTo: "contact@dawky.fr",
  emailEquipe: "equipe@dawky.fr",
  stripeSecretKey: "sk_test_123",
  stripeWebhookSecret: "whsec_test",
};
vi.stubGlobal("useRuntimeConfig", () => runtimeConfig);

// ── Mock Supabase (vérification JWT côté serveur) ────────────
export const supabaseAuthMock = {
  getUser: vi.fn(),
  admin: {
    deleteUser: vi.fn(),
    updateUserById: vi.fn(),
    generateLink: vi.fn(),
  },
};

// Stockage (photos d'avis)
export const storageMock = {
  upload: vi.fn(),
  getPublicUrl: vi.fn(),
};

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ auth: supabaseAuthMock, storage: { from: vi.fn(() => storageMock) } })),
}));

// ── Reset avant chaque test ──────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  modeles = new Map();
});
