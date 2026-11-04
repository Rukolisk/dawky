// tests/integration/avis.test.ts
// Dépôt d'un avis avec photo : réservé aux clients ayant reçu une box,
// photo contrôlée (format, taille) puis stockée dans Supabase.
import { describe, it, expect, vi } from "vitest";
import { readMultipartFormData } from "h3";
import handler from "../../server/api/avis/index.post";
import { prismaMock, storageMock } from "../setup";
import { expectH3Error, mockAuthEvent, mockClient } from "../helper";

function multipart(parts: Array<{ name: string; data: string | Buffer; filename?: string; type?: string }>) {
  vi.mocked(readMultipartFormData).mockResolvedValue(
    parts.map(p => ({ ...p, data: Buffer.isBuffer(p.data) ? p.data : Buffer.from(p.data) })) as any,
  );
}

describe("POST /api/avis", () => {
  it("refuse un client qui n'a encore reçu aucune box", async () => {
    prismaMock.client.findUnique.mockResolvedValue(mockClient);
    prismaMock.commande.count.mockResolvedValue(0);
    await expectH3Error(() => handler(mockAuthEvent()), 403, "première box");
  });

  it("refuse un commentaire trop court", async () => {
    prismaMock.client.findUnique.mockResolvedValue(mockClient);
    prismaMock.commande.count.mockResolvedValue(1);
    multipart([{ name: "note", data: "5" }, { name: "commentaire", data: "Bien" }]);
    await expectH3Error(() => handler(mockAuthEvent()), 400);
  });

  it("refuse un fichier qui n'est pas une image", async () => {
    prismaMock.client.findUnique.mockResolvedValue(mockClient);
    prismaMock.commande.count.mockResolvedValue(1);
    multipart([
      { name: "note", data: "5" },
      { name: "commentaire", data: "Max a adoré sa box ce mois-ci !" },
      { name: "photo", data: "pas une image", filename: "virus.exe", type: "application/octet-stream" },
    ]);
    await expectH3Error(() => handler(mockAuthEvent()), 400, "Format");
    expect(storageMock.upload).not.toHaveBeenCalled();
  });

  it("stocke la photo et crée l'avis en attente de modération", async () => {
    prismaMock.client.findUnique.mockResolvedValue(mockClient);
    prismaMock.commande.count.mockResolvedValue(1);
    storageMock.upload.mockResolvedValue({ error: null });
    storageMock.getPublicUrl.mockReturnValue({ data: { publicUrl: "https://supabase.test/avis/photo.jpg" } });
    prismaMock.avis.create.mockResolvedValue({ id: "avis-1" });
    multipart([
      { name: "note", data: "5" },
      { name: "commentaire", data: "Max a adoré sa box ce mois-ci !" },
      { name: "photo", data: Buffer.from([0xff, 0xd8, 0xff]), filename: "photo.jpg", type: "image/jpeg" },
    ]);

    await handler(mockAuthEvent());

    expect(storageMock.upload).toHaveBeenCalledWith(expect.stringMatching(/^client-001\/\d+\.jpg$/), expect.any(Buffer), { contentType: "image/jpeg" });
    expect(prismaMock.avis.create).toHaveBeenCalledWith({
      data: { clientId: "client-001", note: 5, commentaire: "Max a adoré sa box ce mois-ci !", photoUrl: "https://supabase.test/avis/photo.jpg" },
    });
  });
});
