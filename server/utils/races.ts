// server/utils/races.ts
// ─────────────────────────────────────────
// Races de chiens (autocomplétion) avec leur gabarit adulte typique.
// Le gabarit sert de garde-fou au calcul de taille (cf. metier.ts).
// null = gabarit trop variable pour en déduire quoi que ce soit.
// ─────────────────────────────────────────

type Gabarit = 'S' | 'M' | 'L' | null

export const RACES: ReadonlyArray<{ nom: string; gabarit: Gabarit }> = [
  { nom: 'Affenpinscher', gabarit: 'S' },
  { nom: 'Airedale Terrier', gabarit: 'M' },
  { nom: 'Akita Américain', gabarit: 'L' },
  { nom: 'Akita Inu', gabarit: 'L' },
  { nom: 'Alaskan Malamute', gabarit: 'L' },
  { nom: 'American Bully', gabarit: 'M' },
  { nom: 'American Staffordshire Terrier', gabarit: 'M' },
  { nom: 'Basenji', gabarit: 'M' },
  { nom: 'Basset Hound', gabarit: 'M' },
  { nom: 'Beagle', gabarit: 'M' },
  { nom: 'Beauceron', gabarit: 'L' },
  { nom: 'Berger Allemand', gabarit: 'L' },
  { nom: 'Berger Australien', gabarit: 'M' },
  { nom: 'Berger Belge Malinois', gabarit: 'L' },
  { nom: 'Berger Belge Tervueren', gabarit: 'L' },
  { nom: 'Berger Blanc Suisse', gabarit: 'L' },
  { nom: 'Berger de Shetland', gabarit: 'S' },
  { nom: 'Berger des Pyrénées', gabarit: 'M' },
  { nom: 'Bichon Frisé', gabarit: 'S' },
  { nom: 'Bichon Havanais', gabarit: 'S' },
  { nom: 'Bichon Maltais', gabarit: 'S' },
  { nom: 'Border Collie', gabarit: 'M' },
  { nom: 'Border Terrier', gabarit: 'S' },
  { nom: 'Boston Terrier', gabarit: 'S' },
  { nom: 'Bouledogue Américain', gabarit: 'L' },
  { nom: 'Bouledogue Anglais', gabarit: 'M' },
  { nom: 'Bouledogue Français', gabarit: 'M' },
  { nom: 'Bouvier Bernois', gabarit: 'L' },
  { nom: 'Bouvier des Flandres', gabarit: 'L' },
  { nom: 'Boxer', gabarit: 'L' },
  { nom: 'Braque de Weimar', gabarit: 'L' },
  { nom: 'Braque Français', gabarit: 'M' },
  { nom: 'Briard', gabarit: 'L' },
  { nom: 'Bull Terrier', gabarit: 'M' },
  { nom: 'Bullmastiff', gabarit: 'L' },
  { nom: 'Cairn Terrier', gabarit: 'S' },
  { nom: 'Cane Corso', gabarit: 'L' },
  { nom: 'Caniche Moyen', gabarit: 'M' },
  { nom: 'Caniche Nain', gabarit: 'S' },
  { nom: 'Caniche Royal', gabarit: 'M' },
  { nom: 'Caniche Toy', gabarit: 'S' },
  { nom: 'Carlin', gabarit: 'S' },
  { nom: 'Cavalier King Charles Spaniel', gabarit: 'S' },
  { nom: 'Chihuahua', gabarit: 'S' },
  { nom: 'Chow-Chow', gabarit: 'M' },
  { nom: 'Cocker Américain', gabarit: 'M' },
  { nom: 'Cocker Anglais', gabarit: 'M' },
  { nom: 'Colley à poil long', gabarit: 'M' },
  { nom: 'Coton de Tuléar', gabarit: 'S' },
  { nom: 'Dalmatien', gabarit: 'L' },
  { nom: 'Dobermann', gabarit: 'L' },
  { nom: 'Dogue Allemand', gabarit: 'L' },
  { nom: 'Dogue de Bordeaux', gabarit: 'L' },
  { nom: 'Épagneul Breton', gabarit: 'M' },
  { nom: 'Épagneul Japonais', gabarit: 'S' },
  { nom: 'Épagneul Tibétain', gabarit: 'S' },
  { nom: 'Eurasier', gabarit: 'M' },
  { nom: 'Flat-Coated Retriever', gabarit: 'L' },
  { nom: 'Fox Terrier', gabarit: 'S' },
  { nom: 'Golden Retriever', gabarit: 'L' },
  { nom: 'Greyhound', gabarit: 'L' },
  { nom: 'Griffon Bruxellois', gabarit: 'S' },
  { nom: 'Husky Sibérien', gabarit: 'M' },
  { nom: 'Jack Russell Terrier', gabarit: 'S' },
  { nom: 'Labrador Retriever', gabarit: 'L' },
  { nom: 'Lagotto Romagnolo', gabarit: 'M' },
  { nom: 'Leonberg', gabarit: 'L' },
  { nom: 'Lévrier Afghan', gabarit: 'L' },
  { nom: 'Lévrier Irlandais', gabarit: 'L' },
  { nom: 'Lhassa Apso', gabarit: 'S' },
  { nom: 'Mastiff Anglais', gabarit: 'L' },
  { nom: 'Montagne des Pyrénées', gabarit: 'L' },
  { nom: 'Norfolk Terrier', gabarit: 'S' },
  { nom: 'Norwich Terrier', gabarit: 'S' },
  { nom: 'Pékinois', gabarit: 'S' },
  { nom: 'Pinscher Nain', gabarit: 'S' },
  { nom: 'Pointer', gabarit: 'L' },
  { nom: 'Rhodesian Ridgeback', gabarit: 'L' },
  { nom: 'Rottweiler', gabarit: 'L' },
  { nom: 'Saint-Bernard', gabarit: 'L' },
  { nom: 'Samoyède', gabarit: 'M' },
  { nom: 'Schnauzer Géant', gabarit: 'L' },
  { nom: 'Schnauzer Moyen', gabarit: 'M' },
  { nom: 'Schnauzer Nain', gabarit: 'S' },
  { nom: 'Scottish Terrier', gabarit: 'S' },
  { nom: 'Setter Anglais', gabarit: 'L' },
  { nom: 'Setter Irlandais', gabarit: 'L' },
  { nom: 'Shiba Inu', gabarit: 'M' },
  { nom: 'Shih Tzu', gabarit: 'S' },
  { nom: 'Spitz Allemand', gabarit: 'S' },
  { nom: 'Spitz Nain (Loulou de Poméranie)', gabarit: 'S' },
  { nom: 'Springer Anglais', gabarit: 'M' },
  { nom: 'Staffordshire Bull Terrier', gabarit: 'M' },
  { nom: 'Teckel', gabarit: 'S' },
  { nom: 'Terre-Neuve', gabarit: 'L' },
  { nom: 'Tosa Inu', gabarit: 'L' },
  { nom: 'Vizsla', gabarit: 'L' },
  { nom: 'Welsh Corgi', gabarit: 'M' },
  { nom: 'West Highland White Terrier', gabarit: 'S' },
  { nom: 'Whippet', gabarit: 'M' },
  { nom: 'Yorkshire Terrier', gabarit: 'S' },
  { nom: 'Croisé', gabarit: null },
  { nom: 'Autre race', gabarit: null },
]

/**
 * Normalise pour une recherche insensible à la casse et aux accents.
 */
export function normaliser(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

const parNom = new Map(RACES.map(r => [normaliser(r.nom), r.gabarit]))

export function gabaritRace(race: string): Gabarit {
  return parNom.get(normaliser(race)) ?? null
}

export function rechercherRaces(q: string, limite = 8): string[] {
  const recherche = normaliser(q)
  if (recherche.length < 2) return RACES.slice(0, limite).map(r => r.nom)
  return RACES
    .filter(r => normaliser(r.nom).includes(recherche))
    .slice(0, limite)
    .map(r => r.nom)
}
