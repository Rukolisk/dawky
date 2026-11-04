// tests/integration/paiement.test.ts
// Webhook Stripe : signature, idempotence, activation de l'abonnement
import { describe, it, expect } from "vitest";
import { getHeader, readRawBody } from "h3";
import { vi } from "vitest";
import webhook from "../../server/api/webhooks/paiement.post";
import { traiterCheckoutComplete, traiterCheckoutExpire } from "../../server/utils/paiement";
import { prismaMock, stripeMock } from "../setup";
import { sendAbonnementConfirmation } from "../../server/utils/email";
import { expectH3Error, mockChien, mockClient } from "../helper";

const sessionAbonnement = {
  id: "cs_1",
  payment_status: "paid",
  subscription: "sub_1",
  metadata: { kind: "abonnement", id: "abo-001", sourceRemise: "" },
} as any;

describe("POST /api/webhooks/paiement", () => {
  it("rejette une signature invalide", async () => {
    vi.mocked(getHeader).mockReturnValue("t=1,v1=faux");
    vi.mocked(readRawBody).mockResolvedValue(Buffer.from("{}") as any);
    stripeMock.webhooks.constructEvent.mockImplementation(() => { throw new Error("bad sig"); });
    await expectH3Error(() => webhook({} as any), 400, "Signature");
  });

  it("ignore un événement déjà traité", async () => {
    vi.mocked(getHeader).mockReturnValue("t=1,v1=ok");
    vi.mocked(readRawBody).mockResolvedValue(Buffer.from("{}") as any);
    stripeMock.webhooks.constructEvent.mockReturnValue({ id: "evt_1", type: "checkout.session.completed", data: { object: sessionAbonnement } });
    prismaMock.webhookEvent.findUnique.mockResolvedValue({ id: "evt_1" });

    const res = await webhook({} as any);
    expect(res).toEqual({ received: true, duplicate: true });
    expect(prismaMock.abonnement.updateMany).not.toHaveBeenCalled();
  });
});

describe("traiterCheckoutComplete (abonnement)", () => {
  it("active l'abonnement et envoie la confirmation", async () => {
    stripeMock.subscriptions.retrieve.mockResolvedValue({ items: { data: [{ current_period_end: 1_800_000_000 }] } });
    prismaMock.abonnement.findUniqueOrThrow.mockResolvedValue({
      id: "abo-001", clientId: "client-001", taille: "L", prixMensuel: 3490, codePromoId: null,
      modeLivraison: "DOMICILE", client: mockClient, chien: { ...mockChien, allergenes: [] },
      adresse: { prenom: "Camille", nom: "Morel", ligne1: "12 rue des Lilas", ligne2: null, codePostal: "75011", ville: "Paris", pays: "France" },
    });
    prismaMock.parrainage.findUnique.mockResolvedValue(null);

    await traiterCheckoutComplete(sessionAbonnement);

    expect(prismaMock.abonnement.updateMany).toHaveBeenCalledWith({
      where: { id: "abo-001", statut: "EN_ATTENTE_PAIEMENT" },
      data: expect.objectContaining({ statut: "ACTIF", stripeSubscriptionId: "sub_1", finPeriode: new Date(1_800_000_000_000) }),
    });
    expect(sendAbonnementConfirmation).toHaveBeenCalledWith("camille@example.com", expect.objectContaining({ nomChien: "Max", prixMensuel: 3490 }));
  });

  it("est idempotent : un 2e passage n'envoie pas de 2e email", async () => {
    stripeMock.subscriptions.retrieve.mockResolvedValue({ items: { data: [] } });
    prismaMock.abonnement.updateMany.mockResolvedValue({ count: 0 });
    await traiterCheckoutComplete(sessionAbonnement);
    expect(sendAbonnementConfirmation).not.toHaveBeenCalled();
  });
});

describe("traiterCheckoutExpire (commande)", () => {
  it("rend le stock réservé d'une commande non payée", async () => {
    prismaMock.commande.findUnique.mockResolvedValue({ id: "cmd-1", statut: "EN_ATTENTE_PAIEMENT", type: "COMPOSE", formulaId: null });
    prismaMock.selectionItem.findMany.mockResolvedValue([{ lotId: "lot-a", quantite: 2 }]);

    await traiterCheckoutExpire({ metadata: { kind: "commande", id: "cmd-1" } } as any);

    expect(prismaMock.lotStock.update).toHaveBeenCalledWith({ where: { id: "lot-a" }, data: { quantite: { increment: 2 } } });
    expect(prismaMock.commande.update).toHaveBeenCalledWith({ where: { id: "cmd-1" }, data: { statut: "ANNULEE" } });
  });
});
