// tests/unit/promo.test.ts
// Résolution des réductions : code promo, parrainage, récompenses
import { describe, it, expect } from "vitest";
import { resoudreReduction } from "../../server/utils/promo";
import { prismaMock } from "../setup";
import { expectH3Error, mockClient } from "../helper";

describe("resoudreReduction", () => {
  it("applique un code promo valide", async () => {
    prismaMock.codePromo.findUnique.mockResolvedValue({
      id: "promo-1", code: "BIENVENUE10", type: "POURCENTAGE", valeur: 10, actif: true,
      dateDebut: null, dateFin: null, utilisationsMax: null, utilisations: 0,
    });
    const r = await resoudreReduction(mockClient, 3000, "bienvenue10");
    expect(r).toMatchObject({ remise: 300, source: "promo", codePromoId: "promo-1" });
  });

  it("refuse un code épuisé", async () => {
    prismaMock.codePromo.findUnique.mockResolvedValue({
      id: "promo-1", code: "X", type: "MONTANT", valeur: 500, actif: true,
      dateDebut: null, dateFin: null, utilisationsMax: 5, utilisations: 5,
    });
    prismaMock.client.findUnique.mockResolvedValue(null);
    await expectH3Error(() => resoudreReduction(mockClient, 3000, "X"), 400, "invalide");
  });

  it("refuse son propre code de parrainage", async () => {
    prismaMock.codePromo.findUnique.mockResolvedValue(null);
    prismaMock.client.findUnique.mockResolvedValue({ id: "client-001" });
    await expectH3Error(() => resoudreReduction(mockClient, 3000, "CAMILL7K2P"), 400, "propre code");
  });

  it("code de parrainage d'un autre client au 1er achat → réduction filleul", async () => {
    prismaMock.codePromo.findUnique.mockResolvedValue(null);
    prismaMock.client.findUnique.mockResolvedValue({ id: "parrain-1" });
    prismaMock.parrainage.findUnique.mockResolvedValue(null);
    const r = await resoudreReduction(mockClient, 3000, "THOMAS1234");
    expect(r).toMatchObject({ remise: 300, source: "filleul" });
    expect(prismaMock.parrainage.create).toHaveBeenCalledWith({ data: { parrainId: "parrain-1", filleulId: "client-001" } });
  });

  it("code de parrainage refusé après un premier achat", async () => {
    prismaMock.codePromo.findUnique.mockResolvedValue(null);
    prismaMock.client.findUnique.mockResolvedValue({ id: "parrain-1" });
    prismaMock.abonnement.count.mockResolvedValue(1);
    await expectH3Error(() => resoudreReduction(mockClient, 3000, "THOMAS1234"), 400, "première commande");
  });

  it("sans code, utilise une récompense de parrain disponible", async () => {
    prismaMock.parrainage.findUnique.mockResolvedValue(null);
    const r = await resoudreReduction({ ...mockClient, recompensesParrainage: 1 }, 2000, undefined);
    expect(r).toMatchObject({ remise: 200, source: "parrain" });
  });

  it("aucune réduction par défaut", async () => {
    prismaMock.parrainage.findUnique.mockResolvedValue(null);
    expect(await resoudreReduction(mockClient, 2000, undefined)).toBeNull();
  });
});
