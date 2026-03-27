// prisma/seed.ts — npm run db:seed
import path from 'node:path'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import prismaClientPkg from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env') })
const { PrismaClient } = prismaClientPkg

function createClient() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL manquant')
  const pool = new Pool({ connectionString: url })
  return new PrismaClient({ adapter: new PrismaPg(pool) })
}
const prisma = createClient()

async function createProduit(data: {
  nom: string; description: string; emoji: string
  categorie: 'MASTICATION' | 'NUTRITION' | 'JOUET' | 'SOIN' | 'ACCESSOIRE'
  tailles: ('XS' | 'S' | 'M' | 'L')[]; stock: number; estInvendu?: boolean
}) {
  const { tailles, ...rest } = data
  return prisma.produit.create({
    data: { ...rest, tailles: { create: tailles.map(t => ({ taille: t })) } },
  })
}

async function main() {
  console.log('🌱 Seed Dawky...')

  await prisma.quizResult.deleteMany()
  await prisma.newsletter.deleteMany()
  await prisma.selectionItem.deleteMany()
  await prisma.commande.deleteMany()
  await prisma.abonnement.deleteMany()
  await prisma.boxMensuelleItem.deleteMany()
  await prisma.boxMensuelle.deleteMany()
  await prisma.boxProduit.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.client.deleteMany()
  await prisma.produitTaille.deleteMany()
  await prisma.produit.deleteMany()
  await prisma.formulaBox.deleteMany()
  console.log('Tables nettoyées')

  // XS - Très petites races (< 5 kg)
  await createProduit({ nom: 'Mini Bois de Cerf XS',  description: 'Format miniature pour les tout petits mâcheurs.',          emoji: '🦌', categorie: 'MASTICATION', tailles: ['XS'],          stock: 60 })
  await createProduit({ nom: 'Mini Friandises XS',     description: 'Bouchées micro pour petites bouches. Sans céréales.',       emoji: '🍖', categorie: 'NUTRITION',   tailles: ['XS', 'S'],     stock: 100 })
  await createProduit({ nom: 'Peluche Mini XS',        description: 'Ultra douce taille poche. Parfaite pour les toy dogs.',     emoji: '🐾', categorie: 'JOUET',       tailles: ['XS'],          stock: 80 })
  await createProduit({ nom: 'Baume Coussinets XS',    description: 'Format mini pour coussinets délicats.',                     emoji: '🌿', categorie: 'SOIN',        tailles: ['XS', 'S'],     stock: 70 })
  await createProduit({ nom: 'Foulard Mini',           description: 'Foulard coton bio XS. Motif exclusif Dawky.',               emoji: '🎀', categorie: 'ACCESSOIRE',  tailles: ['XS', 'S'],     stock: 90 })

  // S - Petites races (5-10 kg)
  await createProduit({ nom: 'Bois de Cerf S',         description: 'Nettoyage dentaire naturel.',                               emoji: '🦌', categorie: 'MASTICATION', tailles: ['S'],           stock: 50 })
  await createProduit({ nom: 'Balle Résistante S',      description: 'Caoutchouc naturel vulcanisé.',                             emoji: '🎾', categorie: 'JOUET',       tailles: ['S', 'M'],      stock: 45 })
  await createProduit({ nom: 'Peluche Squeaky S',       description: 'Rembourrage recyclé. Grinçant.',                            emoji: '🧸', categorie: 'JOUET',       tailles: ['XS', 'S'],     stock: 40 })
  await createProduit({ nom: 'Shampoing Sec',           description: 'Sans rinçage. Neutralise les odeurs.',                      emoji: '🧴', categorie: 'SOIN',        tailles: ['XS','S','M','L'], stock: 55 })
  await createProduit({ nom: 'Bandana Saisonnier S',    description: 'Coton bio. Motif exclusif Dawky.',                          emoji: '🎀', categorie: 'ACCESSOIRE',  tailles: ['S'],           stock: 60 })

  // M - Races moyennes (10-25 kg)
  await createProduit({ nom: 'Bois de Cerf M',         description: 'Pour races moyennes.',                                      emoji: '🦌', categorie: 'MASTICATION', tailles: ['M'],           stock: 40 })
  await createProduit({ nom: 'Sabot Naturel',          description: 'Apaisement naturel. Boeuf élevé en plein air.',             emoji: '🐄', categorie: 'MASTICATION', tailles: ['M', 'L'],      stock: 35 })
  await createProduit({ nom: 'Corde Coton Bio',        description: 'Traction interactive. Coton bio certifié.',                 emoji: '🪢', categorie: 'JOUET',       tailles: ['M', 'L'],      stock: 30 })
  await createProduit({ nom: 'Friandises Poulet M',    description: 'Sans céréales. Protéine unique.',                           emoji: '🍗', categorie: 'NUTRITION',   tailles: ['S', 'M'],      stock: 65 })
  await createProduit({ nom: 'Snacks Saumon',          description: 'Oméga-3. Pelage brillant.',                                 emoji: '🐟', categorie: 'NUTRITION',   tailles: ['XS','S','M','L'], stock: 55 })

  // L - Grandes races (> 25 kg)
  await createProduit({ nom: 'Bois de Cerf L',         description: 'Grand format pour grosses mâchoires.',                      emoji: '🦌', categorie: 'MASTICATION', tailles: ['L'],           stock: 30 })
  await createProduit({ nom: 'Balle Résistante L',     description: 'Format XXL grandes races.',                                 emoji: '🎾', categorie: 'JOUET',       tailles: ['L'],           stock: 35 })
  await createProduit({ nom: 'Friandises Poulet L',    description: 'Grand format, même recette naturelle.',                     emoji: '🍖', categorie: 'NUTRITION',   tailles: ['L'],           stock: 50 })
  await createProduit({ nom: 'Baume Coussinets',       description: 'Karité et cire d\'abeille.',                                emoji: '🌿', categorie: 'SOIN',        tailles: ['M', 'L'],      stock: 45 })
  await createProduit({ nom: 'Bandana Saisonnier L',   description: 'Coton bio. Motif exclusif Dawky.',                          emoji: '🎀', categorie: 'ACCESSOIRE',  tailles: ['M', 'L'],      stock: 50 })
  await createProduit({ nom: 'Médaille Gravée Dawky',  description: 'Acier inox. Personnalisable.',                              emoji: '🏷️', categorie: 'ACCESSOIRE',  tailles: ['XS','S','M','L'], stock: 80 })

  console.log('20 produits créés')

  // Formules : UNE Box Surprise (mensuelle), Une Box À la Carte (invendus uniquement)
  await prisma.formulaBox.create({ data: {
    nom: 'Box Surprise',
    description: 'Sélection mensuelle surprise par nos experts. Contenu adapté à la taille de votre chien.',
    type: 'SURPRISE', prix: 27.90, slots: 5,
  }})
  await prisma.formulaBox.create({ data: {
    nom: 'Box À la Carte',
    description: 'Composez votre box avec les produits invendus des mois précédents. Commande ponctuelle sans engagement.',
    type: 'CARTE', prix: 24.90, slots: 5,
  }})
  console.log('2 formules créées')
  console.log('\n Seed terminé !')
  console.log('Pour créer un Admin: inscrivez-vous sur /connexion puis changez role=ADMIN dans Supabase > Table Editor > clients')
}

main()
  .catch(e => { console.error('Erreur:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
