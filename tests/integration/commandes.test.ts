// tests/integration/commandes.test.ts
// Compose ta box : bornes du panier, taille, allergènes, réservation du stock
import { describe, it, expect } from "vitest";
import handler from "../../server/api/commandes/index.post";
import { prismaMock, stripeMock } from "../setup";
import { expectH3Error, mockAdresse, mockAuthEvent, mockChienAllergique, mockClient, mockLot } from "../helper";

const base = {
  type: "COMPOSE",
  taille: "S",
  livraison: { adresseId: "adr-001" },
  accepteCgv: true,
};
const items = [{ lotId: "a" }, { lotId: "b" }, { lotId: "c" }, { lotId: "d" }, { lotId: "e" }];
const cinqLots = (opts: Parameters<typeof mockLot>[1] = {}) => ["a", "b", "c", "d", "e"].map(id => mockLot(id, opts));

function preparer(lots: ReturnType<typeof mockLot>[]) {
  prismaMock.client.findUnique.mockResolvedValue(mockClient);
  prismaMock.adresse.findFirst.mockResolvedValue(mockAdresse);
  prismaMock.lotStock.findMany.mockResolvedValue(lots);
  prismaMock.parrainage.findUnique.mockResolvedValue(null);
  prismaMock.commande.create.mockResolvedValue({ id: "cmd-1", numero: 42 });
  prismaMock.prixTaille.findFirst.mockResolvedValue({ formulaId: "formula-compose", taille: "S", prix: 2490 });
  stripeMock.checkout.sessions.create.mockResolvedValue({ id: "cs_1", url: "https://checkout.stripe.test/c" });
}

describe("POST /api/commandes (Compose ta box)", () => {
  it("refuse un panier sous le minimum d'articles", async () => {
    preparer([]);
    await expectH3Error(() => handler(mockAuthEvent({ ...base, items: [{ lotId: "a" }] })), 400, "entre 5 et 5");
  });

  it("refuse un produit qui n'est plus disponible", async () => {
    preparer(cinqLots().slice(0, 4));
    await expectH3Error(() => handler(mockAuthEvent({ ...base, items })), 409, "plus disponibles");
  });

  it("refuse un produit d'une autre taille", async () => {
    preparer([...cinqLots().slice(0, 4), mockLot("e", { nom: "Anneau L", tailles: ["L"] })]);
    await expectH3Error(() => handler(mockAuthEvent({ ...base, items })), 400, "Anneau L");
  });

  it("avertit d'un risque allergène pour le chien", async () => {
    preparer([
      ...cinqLots().slice(0, 4),
      mockLot("e", { nom: "Filets de poulet", allergenes: [{ allergeneId: "alg-poulet", presence: "CONTIENT", nom: "Poulet" }] }),
    ]);
    prismaMock.chien.findFirst.mockResolvedValue(mockChienAllergique);

    try {
      await handler(mockAuthEvent({ ...base, chienId: "chien-002", items }));
      throw new Error("aurait dû échouer");
    } catch (err: any) {
      expect(err.statusCode).toBe(409);
      expect(err.data.risquesAllergie).toEqual([{ produit: "Filets de poulet", allergenes: ["Poulet"] }]);
    }
    expect(prismaMock.commande.create).not.toHaveBeenCalled();
  });

  it("facture le prix fixe de la box, réserve le stock et crée le paiement", async () => {
    preparer(cinqLots());
    const res = await handler(mockAuthEvent({ ...base, items: [{ lotId: "a", quantite: 1 }, { lotId: "b" }, { lotId: "c" }, { lotId: "d" }, { lotId: "e" }] }));

    // Prix de la formule Compose ta box en taille S, livraison offerte
    expect(res.data.recapitulatif).toMatchObject({ sousTotal: 2490, fraisPort: 0, remise: 0, total: 2490 });
    expect(prismaMock.lotStock.updateMany).toHaveBeenCalledWith({
      where: { id: "a", statut: "DISPONIBLE", quantite: { gte: 1 } },
      data: { quantite: { decrement: 1 } },
    });
    const session = stripeMock.checkout.sessions.create.mock.calls[0][0];
    expect(session.mode).toBe("payment");
    expect(session.line_items).toHaveLength(1);
    expect(session.line_items[0].price_data.unit_amount).toBe(2490);
  });

  it("annule tout si un lot a été vendu entre-temps", async () => {
    preparer(cinqLots());
    prismaMock.lotStock.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
    await expectH3Error(() => handler(mockAuthEvent({ ...base, items })), 409, "Stock insuffisant");
    expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
  });
});
