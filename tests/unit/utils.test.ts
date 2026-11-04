// tests/unit/utils.test.ts
// Tests unitaires des utilitaires serveur : apiSuccess, parseBody, parseQuery,
// withErrorHandling, adminGuard

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createError } from "h3";
import { getHeader } from "h3";
import {
  apiSuccess,
  parseBody,
  parseQuery,
  withErrorHandling,
} from "../../server/utils/api";
import { requireAdmin } from "../../server/utils/auth";
import prisma from "../../server/utils/prisma";
import {
  mockEvent,
  mockAdminEvent,
  mockInvalidSupabaseToken,
  expectH3Error,
} from "../helper";
import { z } from "zod";

// ══════════════════════════════════════════════════════════════
// apiSuccess
// ══════════════════════════════════════════════════════════════
describe("apiSuccess", () => {
  it("retourne un objet avec success:true et les données", () => {
    const result = apiSuccess({ id: "1", nom: "Max" });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: "1", nom: "Max" });
    expect(result.message).toBe("OK");
  });

  it("utilise le message personnalisé quand fourni", () => {
    const result = apiSuccess({}, "Abonnement créé !");
    expect(result.message).toBe("Abonnement créé !");
  });

  it("fonctionne avec des données null", () => {
    const result = apiSuccess(null);
    expect(result.data).toBeNull();
    expect(result.success).toBe(true);
  });

  it("fonctionne avec un tableau vide", () => {
    const result = apiSuccess([]);
    expect(result.data).toEqual([]);
  });

  it("fonctionne avec des données numériques", () => {
    const result = apiSuccess(42);
    expect(result.data).toBe(42);
  });
});

// ══════════════════════════════════════════════════════════════
// parseBody
// ══════════════════════════════════════════════════════════════
describe("parseBody", () => {
  const schema = z.object({
    email: z.string().email(),
    prenom: z.string().min(2),
    age: z.number().optional(),
  });

  it("retourne les données validées quand le body est valide", async () => {
    const event = mockEvent({
      body: { email: "test@example.com", prenom: "Alice" },
    });
    const result = await parseBody(event, schema);
    expect(result.email).toBe("test@example.com");
    expect(result.prenom).toBe("Alice");
  });

  it("lance une erreur 400 si email invalide", async () => {
    const event = mockEvent({
      body: { email: "pas-un-email", prenom: "Alice" },
    });
    await expectH3Error(() => parseBody(event, schema), 400, "Validation");
  });

  it("lance une erreur 400 si prenom trop court", async () => {
    const event = mockEvent({
      body: { email: "test@example.com", prenom: "A" },
    });
    await expectH3Error(() => parseBody(event, schema), 400);
  });

  it("lance une erreur 400 si body vide", async () => {
    const event = mockEvent({ body: {} });
    await expectH3Error(() => parseBody(event, schema), 400);
  });

  it("accepte les champs optionnels absents", async () => {
    const event = mockEvent({
      body: { email: "test@example.com", prenom: "Bob" },
    });
    const result = await parseBody(event, schema);
    expect(result.age).toBeUndefined();
  });

  it("accepte les champs optionnels présents", async () => {
    const event = mockEvent({
      body: { email: "test@example.com", prenom: "Bob", age: 30 },
    });
    const result = await parseBody(event, schema);
    expect(result.age).toBe(30);
  });
});

// ══════════════════════════════════════════════════════════════
// parseQuery
// ══════════════════════════════════════════════════════════════
describe("parseQuery", () => {
  const schema = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
    q: z.string().optional(),
  });

  it("parse les query params valides", () => {
    const event = mockEvent({ query: { page: "2", limit: "10" } });
    const result = parseQuery(event, schema);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
  });

  it("applique les valeurs par défaut si params absents", () => {
    const event = mockEvent({ query: {} });
    const result = parseQuery(event, schema);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it("lance 400 si un param est invalide", () => {
    const strictSchema = z.object({
      categorie: z.enum(["JOUET", "SOIN"]),
    });
    const event = mockEvent({ query: { categorie: "INVALID" } });
    expect(() => parseQuery(event, strictSchema)).toThrow();
  });

  it("parse le param q optionnel", () => {
    const event = mockEvent({ query: { q: "labrador" } });
    const result = parseQuery(event, schema);
    expect(result.q).toBe("labrador");
  });
});

// ══════════════════════════════════════════════════════════════
// withErrorHandling
// ══════════════════════════════════════════════════════════════
describe("withErrorHandling", () => {
  it("retourne le résultat de la fonction si pas d'erreur", async () => {
    const result = await withErrorHandling(async () => ({ id: "1" }));
    expect(result).toEqual({ id: "1" });
  });

  it("propage les H3Error sans modification", async () => {
    const h3Err = createError({
      statusCode: 404,
      statusMessage: "Introuvable",
    });
    await expectH3Error(
      () =>
        withErrorHandling(async () => {
          throw h3Err;
        }),
      404,
      "Introuvable",
    );
  });

  it("transforme P2002 (doublon Prisma) en 409", async () => {
    const prismaErr = Object.assign(new Error("Unique constraint"), {
      code: "P2002",
    });
    await expectH3Error(
      () =>
        withErrorHandling(async () => {
          throw prismaErr;
        }),
      409,
      "Conflit",
    );
  });

  it("transforme P2025 (not found Prisma) en 404", async () => {
    const prismaErr = Object.assign(new Error("Record not found"), {
      code: "P2025",
    });
    await expectH3Error(
      () =>
        withErrorHandling(async () => {
          throw prismaErr;
        }),
      404,
    );
  });

  it("transforme les erreurs inconnues en 500", async () => {
    await expectH3Error(
      () =>
        withErrorHandling(async () => {
          throw new Error("Erreur inattendue");
        }),
      500,
      "Erreur serveur",
    );
  });

  it("gère les rejets de promesse", async () => {
    await expectH3Error(
      () => withErrorHandling(() => Promise.reject(new Error("rejet"))),
      500,
    );
  });
});

// ══════════════════════════════════════════════════════════════
// requireAdmin
// ══════════════════════════════════════════════════════════════
describe("requireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourne le client si le token est valide et le rôle ADMIN", async () => {
    const event = mockAdminEvent(); // configure aussi supabaseAuthMock.getUser
    vi.mocked(prisma.client.findUnique).mockResolvedValue({
      id: "admin-001",
      supabaseUid: "admin-uid-123",
      role: "ADMIN",
    } as any);

    const result = await requireAdmin(event);
    expect(result.id).toBe("admin-001");
    expect(result.role).toBe("ADMIN");
  });

  it("lance 401 si le header Authorization est absent", async () => {
    const event = mockEvent({}); // pas de header
    vi.mocked(getHeader).mockReturnValue(undefined);

    await expectH3Error(() => requireAdmin(event), 401, "authentifié");
  });

  it("lance 401 si le token Supabase est invalide/expiré", async () => {
    mockInvalidSupabaseToken();
    const event = mockEvent({
      headers: { authorization: "Bearer token-invalide" },
    });
    vi.mocked(getHeader).mockReturnValue("Bearer token-invalide");

    await expectH3Error(() => requireAdmin(event), 401);
  });

  it("lance 404 si le token est valide mais aucun client ne correspond en base", async () => {
    const event = mockAdminEvent();
    vi.mocked(prisma.client.findUnique).mockResolvedValue(null);
    await expectH3Error(() => requireAdmin(event), 404, "introuvable");
  });

  it("lance 403 si client a le rôle USER", async () => {
    const event = mockAdminEvent();
    vi.mocked(prisma.client.findUnique).mockResolvedValue({
      id: "user-001",
      role: "USER",
    } as any);

    await expectH3Error(() => requireAdmin(event), 403, "administrateurs");
  });

  it("appelle findUnique avec le supabaseUid extrait du token vérifié", async () => {
    const event = mockAdminEvent();
    vi.mocked(prisma.client.findUnique).mockResolvedValue({
      id: "admin-001",
      role: "ADMIN",
    } as any);

    await requireAdmin(event);

    expect(prisma.client.findUnique).toHaveBeenCalledWith({
      where: { supabaseUid: "admin-uid-123" },
    });
  });
});
