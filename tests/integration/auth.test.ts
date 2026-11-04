// tests/integration/auth.test.ts
// Création du profil après inscription Supabase : idempotence et
// rattachement d'un profil existant au même email.
import { describe, it, expect } from "vitest";
import register from "../../server/api/auth/register.post";
import motDePasseOublie from "../../server/api/auth/mot-de-passe-oublie.post";
import { prismaMock, supabaseAuthMock } from "../setup";
import { sendReinitialisationMotDePasse } from "../../server/utils/email";
import { expectH3Error, mockAuthEvent, mockClient, mockEvent } from "../helper";
import { vi } from "vitest";

describe("POST /api/auth/mot-de-passe-oublie", () => {
  it("envoie le lien généré par Supabase via notre email", async () => {
    supabaseAuthMock.admin.generateLink.mockResolvedValue({
      data: { properties: { action_link: "https://supabase.test/verify?token=abc" } },
      error: null,
    });
    const res = await motDePasseOublie(mockEvent({ body: { email: "Camille@Example.com" } }));

    expect(supabaseAuthMock.admin.generateLink).toHaveBeenCalledWith(expect.objectContaining({
      type: "recovery",
      email: "camille@example.com",
      options: { redirectTo: "https://dawky.test/mot-de-passe/nouveau" },
    }));
    expect(sendReinitialisationMotDePasse).toHaveBeenCalledWith("camille@example.com", "https://supabase.test/verify?token=abc");
    expect(res.success).toBe(true);
  });

  it("répond pareil pour une adresse inconnue, sans envoyer d'email", async () => {
    supabaseAuthMock.admin.generateLink.mockResolvedValue({ data: null, error: { message: "User not found" } });
    const res = await motDePasseOublie(mockEvent({ body: { email: "inconnu@example.com" } }));
    expect(res.success).toBe(true);
    expect(sendReinitialisationMotDePasse).not.toHaveBeenCalled();
  });

  it("signale clairement un échec d'envoi", async () => {
    supabaseAuthMock.admin.generateLink.mockResolvedValue({
      data: { properties: { action_link: "https://supabase.test/verify?token=abc" } },
      error: null,
    });
    vi.mocked(sendReinitialisationMotDePasse).mockRejectedValueOnce(new Error("Resend : domaine non vérifié"));
    await expectH3Error(() => motDePasseOublie(mockEvent({ body: { email: "camille@example.com" } })), 502, "pas pu envoyer");
  });
});

const body = { prenom: "Camille", nom: "Morel" };

describe("POST /api/auth/register", () => {
  it("renvoie le profil existant si le compte en a déjà un", async () => {
    prismaMock.client.findUnique.mockResolvedValueOnce(mockClient);
    const res = await register(mockAuthEvent(body));
    expect(res.data.id).toBe("client-001");
    expect(prismaMock.client.create).not.toHaveBeenCalled();
  });

  it("rattache un profil au même email qui n'a plus de compte de connexion", async () => {
    prismaMock.client.findUnique
      .mockResolvedValueOnce(null) // par supabaseUid
      .mockResolvedValueOnce({ ...mockClient, supabaseUid: null }); // par email
    prismaMock.client.update.mockResolvedValue({ ...mockClient, supabaseUid: "user-uid-456" });

    await register(mockAuthEvent(body));

    expect(prismaMock.client.update).toHaveBeenCalledWith({
      where: { id: "client-001" },
      data: { supabaseUid: "user-uid-456" },
    });
    expect(prismaMock.client.create).not.toHaveBeenCalled();
  });

  it("ne reprend jamais un profil rattaché à un autre compte", async () => {
    prismaMock.client.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...mockClient, supabaseUid: "autre-compte" });

    await expectH3Error(() => register(mockAuthEvent(body)), 409);
    expect(prismaMock.client.update).not.toHaveBeenCalled();
  });

  it("crée le profil d'un nouveau compte", async () => {
    prismaMock.client.findUnique.mockResolvedValue(null);
    prismaMock.codePromo.findUnique.mockResolvedValue(null);
    prismaMock.client.create.mockResolvedValue({ id: "nouveau", email: "camille@example.com" });

    const res = await register(mockAuthEvent(body));

    expect(prismaMock.client.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ supabaseUid: "user-uid-456", email: "camille@example.com", prenom: "Camille" }),
    });
    expect(res.data.id).toBe("nouveau");
  });
});
