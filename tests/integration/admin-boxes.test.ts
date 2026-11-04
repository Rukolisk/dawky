// tests/integration/admin-boxes.test.ts
// Cycle de la box du mois : verrouillage, contrôle allergènes, clôture
import { describe, it, expect } from "vitest";
import sauvegarder from "../../server/api/admin/boxes-mensuelles/index.post";
import valider from "../../server/api/admin/boxes-mensuelles/valider.post";
import cloturer from "../../server/api/admin/boxes-mensuelles/cloturer.post";
import { prismaMock } from "../setup";
import { expectH3Error, mockAdmin, mockAdminEvent, mockClient } from "../helper";

function box(taille: string, statut = "BROUILLON", allergenes: Array<{ allergeneId: string; presence: string; nom: string }> = []) {
  return {
    id: `box-${taille}`, mois: "2026-12", taille, statut,
    items: [{
      produitId: `prod-${taille}`, quantite: 1,
      produit: {
        nom: `Friandise ${taille}`,
        allergenes: allergenes.map(a => ({ allergeneId: a.allergeneId, presence: a.presence, allergene: { nom: a.nom } })),
      },
    }],
  };
}

describe("admin — accès", () => {
  it("refuse un client non admin (403)", async () => {
    prismaMock.client.findUnique.mockResolvedValue(mockClient);
    await expectH3Error(() => valider(mockAdminEvent({ mois: "2026-12" })), 403);
  });
});

describe("POST /api/admin/boxes-mensuelles", () => {
  it("refuse de modifier une box validée", async () => {
    prismaMock.client.findUnique.mockResolvedValue(mockAdmin);
    prismaMock.boxMensuelle.findUnique.mockResolvedValue({ statut: "VALIDEE" });
    await expectH3Error(
      () => sauvegarder(mockAdminEvent({ mois: "2026-12", taille: "S", items: [{ produitId: "p1" }] })),
      409, "verrouillée",
    );
    expect(prismaMock.boxMensuelle.upsert).not.toHaveBeenCalled();
  });

  it("refuse un produit qui n'existe pas dans la taille", async () => {
    prismaMock.client.findUnique.mockResolvedValue(mockAdmin);
    prismaMock.boxMensuelle.findUnique.mockResolvedValue(null);
    prismaMock.produit.findMany.mockResolvedValue([{ id: "p1", nom: "Anneau L", actif: true, tailles: [{ taille: "L" }] }]);
    await expectH3Error(
      () => sauvegarder(mockAdminEvent({ mois: "2026-12", taille: "S", items: [{ produitId: "p1" }] })),
      400, "Anneau L",
    );
  });
});

describe("POST /api/admin/boxes-mensuelles/valider", () => {
  it("exige les 3 tailles", async () => {
    prismaMock.client.findUnique.mockResolvedValue(mockAdmin);
    prismaMock.boxMensuelle.findMany.mockResolvedValue([box("S"), box("M")]);
    await expectH3Error(() => valider(mockAdminEvent({ mois: "2026-12" })), 400, "L");
  });

  it("bloque si un abonné reçoit son allergène, sauf validation forcée", async () => {
    prismaMock.client.findUnique.mockResolvedValue(mockAdmin);
    prismaMock.boxMensuelle.findMany.mockResolvedValue([
      box("S", "BROUILLON", [{ allergeneId: "alg-poulet", presence: "CONTIENT", nom: "Poulet" }]),
      box("M"), box("L"),
    ]);
    prismaMock.abonnement.findMany.mockResolvedValue([{
      taille: "S",
      client: { prenom: "Thomas", nom: "Bernaud", email: "thomas@example.com" },
      chien: { nom: "Pixel", allergenes: [{ allergeneId: "alg-poulet" }], allergiesAutres: null, sensibleTraces: false, profilAllergieValide: true },
    }]);
    prismaMock.lotStock.groupBy.mockResolvedValue([
      { produitId: "prod-S", _sum: { quantite: 100 } },
      { produitId: "prod-M", _sum: { quantite: 100 } },
      { produitId: "prod-L", _sum: { quantite: 100 } },
    ]);

    try {
      await valider(mockAdminEvent({ mois: "2026-12" }));
      throw new Error("aurait dû échouer");
    } catch (err: any) {
      expect(err.statusCode).toBe(409);
      expect(err.data.conflitsAllergie[0]).toMatchObject({ chien: "Pixel", produits: [{ produit: "Friandise S", allergenes: ["Poulet"] }] });
    }
    expect(prismaMock.boxMensuelle.updateMany).not.toHaveBeenCalled();

    await valider(mockAdminEvent({ mois: "2026-12", forcer: true }));
    expect(prismaMock.boxMensuelle.updateMany).toHaveBeenCalledWith({
      where: { mois: "2026-12", statut: "BROUILLON" }, data: { statut: "VALIDEE" },
    });
  });
});

describe("POST /api/admin/boxes-mensuelles/cloturer", () => {
  it("exige une confirmation", async () => {
    prismaMock.client.findUnique.mockResolvedValue(mockAdmin);
    await expectH3Error(() => cloturer(mockAdminEvent({ mois: "2026-12" })), 400);
  });

  it("refuse tant que les box ne sont pas expédiées", async () => {
    prismaMock.client.findUnique.mockResolvedValue(mockAdmin);
    prismaMock.boxMensuelle.findMany.mockResolvedValue([box("S", "VALIDEE"), box("M", "VALIDEE"), box("L", "VALIDEE")]);
    await expectH3Error(() => cloturer(mockAdminEvent({ mois: "2026-12", confirmation: true })), 400, "expédiées");
  });

  it("transforme le stock courant restant en lots invendus du mois", async () => {
    prismaMock.client.findUnique.mockResolvedValue(mockAdmin);
    prismaMock.boxMensuelle.findMany.mockResolvedValue([box("S", "EXPEDIEE"), box("M", "EXPEDIEE"), box("L", "EXPEDIEE")]);
    prismaMock.boxMensuelle.updateMany.mockResolvedValue({ count: 3 });
    prismaMock.lotStock.findMany.mockResolvedValueOnce([
      { id: "lot-1", quantite: 7, produit: { nom: "Friandise S", emoji: "🍪" } },
    ]);

    const res = await cloturer(mockAdminEvent({ mois: "2026-12", confirmation: true }));

    expect(prismaMock.lotStock.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["lot-1"] } }, data: { moisOrigine: "2026-12" },
    });
    expect(res.data.invendus).toEqual([{ produit: "🍪 Friandise S", quantite: 7 }]);
  });
});
