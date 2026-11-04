// tests/unit/metier.test.ts
// Règles métier pures : taille, recommandation, allergènes, remises, dates
import { describe, it, expect } from "vitest";
import {
  ajouterMois,
  ageEnMois,
  allergenesEnConflit,
  calculerFraisPort,
  calculerRemise,
  calculerTaille,
  formatPrix,
  moisDe,
  premierJourDuMois,
  prochaineExpedition,
  recommanderFormule,
} from "../../server/utils/metier";
import { gabaritRace, rechercherRaces } from "../../server/utils/races";
import { esc } from "../../server/utils/email";

const SEUILS = { seuilS: 10, seuilM: 25 };

describe("calculerTaille", () => {
  it.each([
    [2, "S"], [10, "S"], [10.1, "M"], [25, "M"], [25.1, "L"], [60, "L"],
  ])("%s kg → %s", (poids, attendu) => {
    expect(calculerTaille(poids, SEUILS)).toBe(attendu);
  });

  it("respecte des seuils modifiés par l'admin", () => {
    expect(calculerTaille(12, { seuilS: 15, seuilM: 30 })).toBe("S");
  });

  it("ne descend pas sous le gabarit adulte de la race (chiot de grande race)", () => {
    expect(calculerTaille(8, SEUILS, "Labrador Retriever")).toBe("L");
  });

  it("ne remonte pas une petite race au-dessus de son poids", () => {
    expect(calculerTaille(30, SEUILS, "Chihuahua")).toBe("L");
    expect(calculerTaille(2, SEUILS, "Chihuahua")).toBe("S");
  });

  it("ignore une race inconnue ou trop variable", () => {
    expect(calculerTaille(5, SEUILS, "Croisé")).toBe("S");
    expect(calculerTaille(5, SEUILS, "Race imaginaire")).toBe("S");
  });
});

describe("recommanderFormule", () => {
  it("allergies → Compose ta box", () => {
    expect(recommanderFormule({ aDesAllergies: true, estMacheur: false, niveauActivite: "FAIBLE" })).toBe("COMPOSE");
  });
  it("gros mâcheur très actif → Compose ta box", () => {
    expect(recommanderFormule({ aDesAllergies: false, estMacheur: true, niveauActivite: "ELEVE" })).toBe("COMPOSE");
  });
  it("sinon → Box Surprise", () => {
    expect(recommanderFormule({ aDesAllergies: false, estMacheur: true, niveauActivite: "MODERE" })).toBe("SURPRISE");
  });
});

describe("allergenesEnConflit", () => {
  const produit = [
    { allergeneId: "poulet", presence: "CONTIENT" as const },
    { allergeneId: "boeuf", presence: "TRACES" as const },
  ];

  it("détecte un allergène contenu", () => {
    expect(allergenesEnConflit(produit, ["poulet"], false)).toEqual(["poulet"]);
  });
  it("ignore les traces si le chien n'y est pas sensible", () => {
    expect(allergenesEnConflit(produit, ["boeuf"], false)).toEqual([]);
  });
  it("compte les traces si le chien y est sensible", () => {
    expect(allergenesEnConflit(produit, ["boeuf"], true)).toEqual(["boeuf"]);
  });
  it("aucun conflit sans allergie", () => {
    expect(allergenesEnConflit(produit, [], true)).toEqual([]);
  });
});

describe("calculerRemise", () => {
  it("pourcentage arrondi au centime", () => {
    expect(calculerRemise(2990, { type: "POURCENTAGE", valeur: 10 })).toBe(299);
  });
  it("montant fixe", () => {
    expect(calculerRemise(2990, { type: "MONTANT", valeur: 500 })).toBe(500);
  });
  it("jamais supérieure à la base", () => {
    expect(calculerRemise(300, { type: "MONTANT", valeur: 500 })).toBe(300);
    expect(calculerRemise(300, { type: "POURCENTAGE", valeur: 150 })).toBe(300);
  });
  it("0 sans réduction", () => {
    expect(calculerRemise(2990, null)).toBe(0);
  });
});

describe("calculerFraisPort", () => {
  it("frais appliqués sous le seuil", () => expect(calculerFraisPort(3000, 490, 4000)).toBe(490));
  it("offerts à partir du seuil", () => expect(calculerFraisPort(4000, 490, 4000)).toBe(0));
  it("seuil 0 = jamais offerts", () => expect(calculerFraisPort(10000, 490, 0)).toBe(490));
});

describe("dates", () => {
  it("ageEnMois compte les mois révolus", () => {
    expect(ageEnMois(new Date(2024, 2, 15), new Date(2026, 2, 14))).toBe(23);
    expect(ageEnMois(new Date(2024, 2, 15), new Date(2026, 2, 15))).toBe(24);
  });
  it("ajouterMois reste en fin de mois", () => {
    const d = ajouterMois(new Date(2026, 0, 31), 1);
    expect([d.getMonth(), d.getDate()]).toEqual([1, 28]);
  });
  it("prochaineExpedition = 1er du mois suivant, y compris en décembre", () => {
    const d = prochaineExpedition(new Date(2026, 11, 15));
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2027, 0, 1]);
  });
  it("moisDe / premierJourDuMois", () => {
    expect(moisDe(new Date(2026, 8, 3))).toBe("2026-09");
    expect(premierJourDuMois("2026-09").getMonth()).toBe(8);
  });
  it("formatPrix", () => {
    expect(formatPrix(2990)).toBe("29,90 €");
  });
});

describe("races", () => {
  it("recherche insensible aux accents et à la casse", () => {
    expect(rechercherRaces("epagneul")).toContain("Épagneul Breton");
    expect(rechercherRaces("LAB")).toContain("Labrador Retriever");
  });
  it("gabarit d'une race connue", () => {
    expect(gabaritRace("bichon frise")).toBe("S");
  });
});

describe("esc (emails)", () => {
  it("échappe le HTML saisi par un utilisateur", () => {
    expect(esc('<img src=x onerror="alert(1)">')).toBe("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  });
});
