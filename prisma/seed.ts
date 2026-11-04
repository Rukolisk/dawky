// prisma/seed.ts — npm run db:seed
//
// Données de démonstration. ⚠️ Vide toutes les tables avant de les remplir.
// Les prix des formules reprennent la maquette (27,90 € / 24,90 €) (à ajuster dans le back-office,
// onglet Réglages > Prix).
//
// Pour donner le rôle admin à un compte déjà inscrit sur le site :
//   ADMIN_EMAIL=vous@exemple.fr npm run db:seed
import path from 'node:path'
import { PrismaPg } from '@prisma/adapter-pg'
import prismaClientPkg from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env') })
const { PrismaClient } = prismaClientPkg

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL manquant')
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) })

type Taille = 'S' | 'M' | 'L'
type Categorie = 'FRIANDISE' | 'MASTICATION' | 'JOUET' | 'ACCESSOIRE'

const ALLERGENES = [
  ['poulet', 'Poulet'], ['boeuf', 'Bœuf'], ['porc', 'Porc'], ['agneau', 'Agneau'],
  ['poisson', 'Poisson'], ['oeuf', 'Œuf'], ['lait', 'Produits laitiers'], ['ble', 'Blé / gluten'],
  ['mais', 'Maïs'], ['soja', 'Soja'],
] as const

// Mois précédent au format YYYY-MM (pour simuler des invendus)
function moisPrecedent(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function dansMois(n: number): Date {
  const d = new Date()
  d.setMonth(d.getMonth() + n)
  return d
}

async function main() {
  console.log('🌱 Seed Dawky…')

  // Ordre inverse des dépendances
  await prisma.webhookEvent.deleteMany()
  await prisma.don.deleteMany()
  await prisma.selectionItem.deleteMany()
  await prisma.commande.deleteMany()
  await prisma.abonnement.deleteMany()
  await prisma.abonnementCadeau.deleteMany()
  await prisma.boxMensuelleItem.deleteMany()
  await prisma.boxMensuelle.deleteMany()
  await prisma.lotStock.deleteMany()
  await prisma.produitAllergene.deleteMany()
  await prisma.produitTaille.deleteMany()
  await prisma.produit.deleteMany()
  await prisma.prixTaille.deleteMany()
  await prisma.formulaBox.deleteMany()
  await prisma.alerteAllergie.deleteMany()
  await prisma.chienAllergene.deleteMany()
  await prisma.allergene.deleteMany()
  await prisma.codePromo.deleteMany()
  await prisma.reglage.deleteMany()
  console.log('Tables catalogue nettoyées (clients conservés)')

  // ── Allergènes ──
  await prisma.allergene.createMany({ data: ALLERGENES.map(([code, nom]) => ({ code, nom })) })
  const allergenes = new Map((await prisma.allergene.findMany()).map(a => [a.code, a.id]))
  console.log(`${allergenes.size} allergènes`)

  // ── Formules (prix provisoires, en centimes) ──
  await prisma.formulaBox.create({
    data: {
      slug: 'box-surprise',
      nom: 'Box Surprise',
      description: 'Nos experts composent sa box chaque mois, selon sa taille. Vous découvrez tout à l\'ouverture.',
      type: 'SURPRISE',
      contenu: {
        S: { FRIANDISE: 1, MASTICATION: 1, JOUET: 1, ACCESSOIRE: 2 },
        M: { FRIANDISE: 1, MASTICATION: 1, JOUET: 1, ACCESSOIRE: 2 },
        L: { FRIANDISE: 1, MASTICATION: 1, JOUET: 1, ACCESSOIRE: 2 },
      },
      prix: { create: [{ taille: 'S', prix: 2790 }, { taille: 'M', prix: 2790 }, { taille: 'L', prix: 2790 }] },
    },
  })
  await prisma.formulaBox.create({
    data: {
      slug: 'compose-ta-box',
      nom: 'Compose ta box',
      description: 'Les pépites des mois passés : choisissez vous-même 5 produits parmi les box précédentes. Même qualité, rien ne se perd chez Dawky !',
      type: 'COMPOSE',
      prix: { create: [{ taille: 'S', prix: 2490 }, { taille: 'M', prix: 2490 }, { taille: 'L', prix: 2490 }] },
    },
  })
  console.log('Formules créées')

  // ── Produits ──
  const precedent = moisPrecedent()
  const produits: Array<{
    nom: string; description: string; emoji: string; categorie: Categorie; prix: number
    tailles: Taille[]; ingredients?: string
    allergenes?: Array<[string, 'CONTIENT' | 'TRACES']>
    stock: number; invendus?: number; dateLimite?: Date
  }> = [
    // Friandises
    { nom: 'Bouchées saumon', emoji: '🐟', categorie: 'FRIANDISE', prix: 590, tailles: ['S', 'M', 'L'],
      description: 'Petites bouchées au saumon, riches en oméga-3.',
      ingredients: 'Saumon (70 %), patate douce, huile de lin, romarin.',
      allergenes: [['poisson', 'CONTIENT'], ['poulet', 'TRACES']], stock: 120, invendus: 15, dateLimite: dansMois(8) },
    { nom: 'Biscuits agneau & pomme', emoji: '🍪', categorie: 'FRIANDISE', prix: 490, tailles: ['S', 'M'],
      description: 'Biscuits croquants sans céréales.',
      ingredients: 'Agneau (45 %), farine de pois, pomme (10 %), huile de colza.',
      allergenes: [['agneau', 'CONTIENT']], stock: 80, invendus: 10, dateLimite: dansMois(6) },
    { nom: 'Filets de poulet séchés', emoji: '🍗', categorie: 'FRIANDISE', prix: 690, tailles: ['M', 'L'],
      description: 'Filets de poulet séchés lentement, protéine unique.',
      ingredients: 'Filet de poulet (100 %).',
      allergenes: [['poulet', 'CONTIENT']], stock: 90, dateLimite: dansMois(10) },
    { nom: 'Mini cubes de canard', emoji: '🦆', categorie: 'FRIANDISE', prix: 550, tailles: ['S'],
      description: 'Cubes tendres au canard, format petite gueule.',
      ingredients: 'Canard (80 %), glycérine végétale, sel.',
      stock: 60, invendus: 8, dateLimite: dansMois(1) }, // proche de la date limite : sera retiré par la tâche quotidienne
    // Mastication
    { nom: 'Bois de cerf S', emoji: '🦌', categorie: 'MASTICATION', prix: 790, tailles: ['S'],
      description: 'Bois de cerf naturel, mue ramassée en forêt. Nettoie les dents.',
      ingredients: 'Bois de cerf naturel (100 %).', stock: 50, invendus: 6 },
    { nom: 'Bois de cerf L', emoji: '🦌', categorie: 'MASTICATION', prix: 1290, tailles: ['L'],
      description: 'Grand format pour les mâchoires puissantes.',
      ingredients: 'Bois de cerf naturel (100 %).', stock: 40 },
    { nom: 'Bâton de bœuf', emoji: '🦴', categorie: 'MASTICATION', prix: 690, tailles: ['M', 'L'],
      description: 'Bâton à mâcher longue durée, séché à l\'air.',
      ingredients: 'Peau de bœuf (100 %).',
      allergenes: [['boeuf', 'CONTIENT']], stock: 70, invendus: 12, dateLimite: dansMois(12) },
    { nom: 'Racine de bruyère M', emoji: '🌿', categorie: 'MASTICATION', prix: 890, tailles: ['M'],
      description: 'Racine de bruyère qui ne s\'écaille pas, 100 % végétale.',
      ingredients: 'Racine de bruyère (100 %).', stock: 45 },
    // Jouets
    { nom: 'Balle caoutchouc naturel', emoji: '🎾', categorie: 'JOUET', prix: 890, tailles: ['S', 'M'],
      description: 'Rebond imprévisible, caoutchouc naturel non toxique.', stock: 60, invendus: 9 },
    { nom: 'Anneau gros mâcheur', emoji: '⭕', categorie: 'JOUET', prix: 1490, tailles: ['L'],
      description: 'Pensé pour les gros mâcheurs : caoutchouc renforcé haute résistance.', stock: 40, invendus: 5 },
    { nom: 'Peluche renard', emoji: '🦊', categorie: 'JOUET', prix: 990, tailles: ['S'],
      description: 'Peluche douce avec couineur, coutures renforcées.', stock: 55 },
    { nom: 'Corde coton bio', emoji: '🪢', categorie: 'JOUET', prix: 1090, tailles: ['M', 'L'],
      description: 'Corde de traction en coton biologique.', stock: 50 },
    // Accessoires
    { nom: 'Bandana Dawky', emoji: '🎀', categorie: 'ACCESSOIRE', prix: 1290, tailles: ['S', 'M', 'L'],
      description: 'Bandana en coton bio, motif exclusif Dawky.', stock: 100, invendus: 20 },
    { nom: 'Gamelle de voyage pliable', emoji: '🥣', categorie: 'ACCESSOIRE', prix: 990, tailles: ['S', 'M', 'L'],
      description: 'Gamelle en silicone, se plie dans la poche.', stock: 70 },
    { nom: 'Distributeur de sacs', emoji: '🛍️', categorie: 'ACCESSOIRE', prix: 790, tailles: ['S', 'M', 'L'],
      description: 'Distributeur à accrocher à la laisse, sacs compostables inclus.', stock: 80 },
  ]

  for (const p of produits) {
    const lots: Array<{ quantite: number; dateLimite?: Date; moisOrigine?: string }> = [
      { quantite: p.stock, dateLimite: p.dateLimite },
    ]
    if (p.invendus) lots.push({ quantite: p.invendus, dateLimite: p.dateLimite, moisOrigine: precedent })

    await prisma.produit.create({
      data: {
        nom: p.nom,
        description: p.description,
        emoji: p.emoji,
        categorie: p.categorie,
        prix: p.prix,
        ingredients: p.ingredients,
        tailles: { create: p.tailles.map(taille => ({ taille })) },
        allergenes: {
          create: (p.allergenes ?? []).map(([code, presence]) => ({ allergeneId: allergenes.get(code)!, presence })),
        },
        lots: { create: lots },
      },
    })
  }
  console.log(`${produits.length} produits créés (stock courant + invendus de ${precedent})`)

  // ── Code promo de démonstration ──
  await prisma.codePromo.create({
    data: { code: 'BIENVENUE10', description: 'Code de démonstration', type: 'POURCENTAGE', valeur: 10 },
  })

  // ── Admin ──
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  if (adminEmail) {
    const { count } = await prisma.client.updateMany({ where: { email: adminEmail }, data: { role: 'ADMIN' } })
    console.log(count ? `Rôle ADMIN donné à ${adminEmail}` : `⚠️ ${adminEmail} introuvable : inscrivez-vous d'abord sur le site`)
  }

  console.log('✅ Seed terminé')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
