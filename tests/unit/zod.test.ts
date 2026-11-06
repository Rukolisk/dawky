// tests/unit/zod.test.ts
// Comportements de validation qui ont changé entre zod 3 et zod 4 :
// garde-fous pour ne pas réintroduire de régression.
import { describe, it, expect } from "vitest";
import { z } from "zod";
import { queryBool, queryList } from "../../server/utils/api";
import { cgvSchema, livraisonSchema } from "../../server/utils/schemas";
import { formuleChampsSchema } from "../../server/utils/admin-formules";

describe("validation (zod 4)", () => {
  const schema = z.object({ traces: queryBool.default(false) });

  it("booléen de query string absent : valeur par défaut false (et non le texte 'false')", () => {
    expect(schema.parse({}).traces).toBe(false);
  });

  it("booléen de query string : 'false' et '0' donnent false, 'true' et '1' donnent true", () => {
    expect(schema.parse({ traces: "false" }).traces).toBe(false);
    expect(schema.parse({ traces: "0" }).traces).toBe(false);
    expect(schema.parse({ traces: "true" }).traces).toBe(true);
    expect(schema.parse({ traces: "1" }).traces).toBe(true);
  });

  it("liste séparée par des virgules", () => {
    expect(queryList.parse("poulet, boeuf,,")).toEqual(["poulet", "boeuf"]);
  });

  it("CGV non acceptées : message en français", () => {
    const r = cgvSchema.safeParse(false);
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe("Vous devez accepter les conditions générales de vente");
  });

  it("point relais sans identifiant refusé", () => {
    expect(livraisonSchema.safeParse({ adresseId: "a", modeLivraison: "POINT_RELAIS" }).success).toBe(false);
    expect(livraisonSchema.parse({ adresseId: "a" }).modeLivraison).toBe("DOMICILE");
  });

  it("contenu de box : toutes les catégories ne sont pas obligatoires", () => {
    const r = formuleChampsSchema.shape.contenu.safeParse({ S: { JOUET: 1 }, M: { JOUET: 1, FRIANDISE: 2 }, L: {} });
    expect(r.success).toBe(true);
  });
});
