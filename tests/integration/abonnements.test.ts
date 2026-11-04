// tests/integration/abonnements.test.ts
// Souscription Box Surprise : authentification, propriété des données,
// règle "un abonnement par chien", prix calculé côté serveur.
import { describe, it, expect, vi } from "vitest";
import handler from "../../server/api/abonnements/index.post";
import resiliation from "../../server/api/abonnements/[id]/resiliation.post";
import { prismaMock, stripeMock } from "../setup";
import { sendAlerteAllergieEquipe, sendAbonnementResiliation } from "../../server/utils/email";
import {
  expectH3Error, mockAdresse, mockAuthEvent, mockChien, mockChienAllergique,
  mockClient, mockEvent, mockFormulaSurprise,
} from "../helper";

const body = {
  chienId: "chien-001",
  livraison: { adresseId: "adr-001" },
  accepteCgv: true,
};

function preparerSouscription(chien: typeof mockChien = mockChien) {
  prismaMock.client.findUnique.mockResolvedValue(mockClient);
  prismaMock.chien.findFirst.mockResolvedValue(chien);
  prismaMock.adresse.findFirst.mockResolvedValue(mockAdresse);
  prismaMock.abonnement.findFirst.mockResolvedValue(null);
  prismaMock.formulaBox.findFirst.mockResolvedValue(mockFormulaSurprise);
  prismaMock.abonnement.create.mockResolvedValue({ id: "abo-001" });
  prismaMock.parrainage.findUnique.mockResolvedValue(null);
  stripeMock.checkout.sessions.create.mockResolvedValue({ id: "cs_test_1", client_secret: "cs_test_1_secret" });
}

describe("POST /api/abonnements", () => {
  it("refuse sans connexion (401)", async () => {
    const event = mockEvent({ body });
    await expectH3Error(() => handler(event), 401);
  });

  it("refuse le chien d'un autre client (404)", async () => {
    preparerSouscription();
    prismaMock.chien.findFirst.mockResolvedValue(null);
    await expectH3Error(() => handler(mockAuthEvent(body)), 404, "Chien");
    expect(prismaMock.chien.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "chien-001", clientId: "client-001" } }),
    );
  });

  it("refuse sans acceptation des CGV (400)", async () => {
    preparerSouscription();
    await expectH3Error(() => handler(mockAuthEvent({ ...body, accepteCgv: false })), 400);
  });

  it("bloque un 2e abonnement pour le même chien (409)", async () => {
    preparerSouscription();
    prismaMock.abonnement.findFirst.mockResolvedValue({ id: "abo-existant", statut: "PAUSE" });
    await expectH3Error(() => handler(mockAuthEvent(body)), 409, "déjà un abonnement");
  });

  it("crée l'abonnement au prix de la taille du chien et renvoie le clientSecret du paiement intégré", async () => {
    preparerSouscription();
    const res = await handler(mockAuthEvent(body));

    expect(prismaMock.abonnement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ taille: "L", prixMensuel: 3490, chienId: "chien-001", clientId: "client-001" }),
    });
    const session = stripeMock.checkout.sessions.create.mock.calls[0][0];
    expect(session.mode).toBe("subscription");
    expect(session.line_items[0].price_data.unit_amount).toBe(3490);
    expect(session.metadata).toMatchObject({ kind: "abonnement", id: "abo-001" });
    expect(session.ui_mode).toBe("embedded_page");
    expect(res.data.clientSecret).toBe("cs_test_1_secret");
  });

  it("enregistre le point relais choisi", async () => {
    preparerSouscription();
    await handler(mockAuthEvent({
      ...body,
      livraison: { adresseId: "adr-001", modeLivraison: "POINT_RELAIS", pointRelaisId: "FR-012345", pointRelaisLibelle: "Tabac Presse, 9 rue Blainville, 75005 Paris" },
    }));
    expect(prismaMock.abonnement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ modeLivraison: "POINT_RELAIS", pointRelaisId: "FR-012345", pointRelaisLibelle: "Tabac Presse, 9 rue Blainville, 75005 Paris" }),
    });
  });

  it("refuse le point relais sans point choisi", async () => {
    preparerSouscription();
    await expectH3Error(() => handler(mockAuthEvent({ ...body, livraison: { adresseId: "adr-001", modeLivraison: "POINT_RELAIS" } })), 400);
  });

  it("le client peut choisir une autre taille que celle conseillée", async () => {
    preparerSouscription();
    await handler(mockAuthEvent({ ...body, taille: "M" }));
    expect(prismaMock.abonnement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ taille: "M", prixMensuel: 2990 }),
    });
  });

  it("prévient l'équipe quand le chien a une allergie", async () => {
    preparerSouscription(mockChienAllergique as any);
    prismaMock.alerteAllergie.findFirst.mockResolvedValue(null);
    await handler(mockAuthEvent({ ...body, chienId: "chien-002" }));
    expect(prismaMock.alerteAllergie.create).toHaveBeenCalledWith({ data: { chienId: "chien-002" } });
    expect(sendAlerteAllergieEquipe).toHaveBeenCalled();
  });
});

describe("POST /api/abonnements/:id/resiliation", () => {
  const params = { id: "abo-001" };

  it("exige une confirmation explicite", async () => {
    prismaMock.client.findUnique.mockResolvedValue(mockClient);
    await expectH3Error(() => resiliation(mockAuthEvent({}, { params })), 400);
  });

  it("arrête les prélèvements en fin de période et envoie l'email", async () => {
    prismaMock.client.findUnique.mockResolvedValue(mockClient);
    prismaMock.abonnement.findFirst.mockResolvedValue({
      id: "abo-001", clientId: "client-001", statut: "ACTIF", stripeSubscriptionId: "sub_1", chien: mockChien,
    });
    const fin = Math.floor(new Date("2026-12-04").getTime() / 1000);
    stripeMock.subscriptions.update.mockResolvedValue({ items: { data: [{ current_period_end: fin }] } });
    prismaMock.abonnement.update.mockResolvedValue({ id: "abo-001", statut: "RESILIE" });

    await resiliation(mockAuthEvent({ confirmation: true, raison: "Déménagement" }, { params }));

    expect(stripeMock.subscriptions.update).toHaveBeenCalledWith("sub_1", expect.objectContaining({ cancel_at_period_end: true }));
    expect(prismaMock.abonnement.update).toHaveBeenCalledWith({
      where: { id: "abo-001" },
      data: expect.objectContaining({ statut: "RESILIE", dateFin: new Date(fin * 1000), raisonResiliation: "Déménagement" }),
    });
    expect(sendAbonnementResiliation).toHaveBeenCalled();
  });

  it("ne touche pas à l'abonnement d'un autre client", async () => {
    prismaMock.client.findUnique.mockResolvedValue(mockClient);
    prismaMock.abonnement.findFirst.mockResolvedValue(null);
    await expectH3Error(() => resiliation(mockAuthEvent({ confirmation: true }, { params })), 404);
    expect(stripeMock.subscriptions.update).not.toHaveBeenCalled();
  });
});
