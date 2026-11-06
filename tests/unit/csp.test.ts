// tests/unit/csp.test.ts — politique de sécurité du contenu
import { describe, it, expect, vi } from "vitest";

vi.stubGlobal("defineNitroPlugin", (fn: unknown) => fn);
const { ajouterNonce, politiqueCsp } = await import("../../server/plugins/csp");

describe("CSP", () => {
  it("ajoute le nonce à chaque balise script, une seule fois", () => {
    const html = '<script type="module" src="/a.js"></script><script>window.x=1</script><script nonce="deja">y</script>';
    const r = ajouterNonce(html, "abc");
    expect(r).toBe('<script nonce="abc" type="module" src="/a.js"></script><script nonce="abc">window.x=1</script><script nonce="deja">y</script>');
  });

  it("n'autorise que les scripts portant le nonce (et ceux qu'ils chargent)", () => {
    const p = politiqueCsp("abc", "https://projet.supabase.co");
    expect(p).toContain("script-src 'nonce-abc' 'strict-dynamic'");
    expect(p).toContain("frame-ancestors 'none'");
    expect(p).toContain("object-src 'none'");
    expect(p).toContain("connect-src 'self' https://projet.supabase.co wss://projet.supabase.co");
    expect(p).toContain("frame-src https://js.stripe.com");
  });
});
