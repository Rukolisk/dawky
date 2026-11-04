// server/utils/promo.ts
// ─────────────────────────────────────────
// Codes promo et parrainage
//
// Ordre de résolution d'une réduction au moment du paiement :
//   1. code saisi = code promo valide        → réduction du code
//   2. code saisi = code parrainage d'un autre client, et c'est le
//      1er achat du client                    → réduction filleul
//   3. aucun code, mais le client est arrivé par un lien de parrainage
//      et c'est son 1er achat                 → réduction filleul
//   4. le client a des récompenses de parrain → réduction parrain
// Une seule réduction par paiement.
// ─────────────────────────────────────────
import { createError } from 'h3'
import prisma from './prisma'
import { calculerRemise, type Reduction } from './metier'
import { getReglages } from './reglages'
import { appliquerReductionAbonnement } from './stripe'
import { sendParrainageValide } from './email'

export type SourceRemise = 'promo' | 'filleul' | 'parrain'

export interface ReductionResolue {
  remise: number
  libelle: string
  source: SourceRemise
  codePromoId?: string
}

export function normaliserCode(code: string): string {
  return code.trim().toUpperCase()
}

/**
 * Code de parrainage unique : prénom (sans accents, 6 lettres max) + 4
 * caractères aléatoires, ex. "CAMILL7K2P".
 */
export async function genererCodeParrainage(prenom: string): Promise<string> {
  const base = prenom.normalize('NFD').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6) || 'DAWKY'
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sans 0/O/1/I ambigus
  for (let essai = 0; essai < 10; essai++) {
    let suffixe = ''
    for (let i = 0; i < 4; i++) suffixe += alphabet[Math.floor(Math.random() * alphabet.length)]
    const code = base + suffixe
    const [client, promo] = await Promise.all([
      prisma.client.findUnique({ where: { codeParrainage: code } }),
      prisma.codePromo.findUnique({ where: { code } }),
    ])
    if (!client && !promo) return code
  }
  throw createError({ statusCode: 500, statusMessage: 'Impossible de générer un code de parrainage' })
}

/**
 * Code promo actif et utilisable aujourd'hui, ou null.
 */
export async function trouverCodePromo(code: string) {
  const now = new Date()
  const promo = await prisma.codePromo.findUnique({ where: { code: normaliserCode(code) } })
  if (!promo || !promo.actif) return null
  if (promo.dateDebut && promo.dateDebut > now) return null
  if (promo.dateFin && promo.dateFin < now) return null
  if (promo.utilisationsMax !== null && promo.utilisations >= promo.utilisationsMax) return null
  return promo
}

/**
 * Le client a-t-il déjà effectué un paiement ?
 */
export async function aDejaPaye(clientId: string): Promise<boolean> {
  const [commandes, abonnements, cadeaux] = await Promise.all([
    prisma.commande.count({
      where: { clientId, type: { not: 'BOX_MENSUELLE' }, statut: { notIn: ['EN_ATTENTE_PAIEMENT', 'ANNULEE'] } },
    }),
    prisma.abonnement.count({ where: { clientId, dateDebut: { not: null } } }),
    prisma.abonnementCadeau.count({ where: { acheteurId: clientId, statut: { in: ['ACTIF', 'TERMINE'] } } }),
  ])
  return commandes + abonnements + cadeaux > 0
}

/**
 * Calcule la réduction applicable à un paiement de `base` centimes.
 * Lance une 400 si un code est saisi mais invalide (le client doit le savoir).
 */
export async function resoudreReduction(
  client: { id: string; codeParrainage: string; recompensesParrainage: number },
  base: number,
  code?: string | null,
): Promise<ReductionResolue | null> {
  const { 'parrainage.pourcentage': pourcentage } = await getReglages()
  const reductionParrainage: Reduction = { type: 'POURCENTAGE', valeur: pourcentage }

  if (code) {
    const promo = await trouverCodePromo(code)
    if (promo) {
      return {
        remise: calculerRemise(base, promo),
        libelle: `Code ${promo.code}`,
        source: 'promo',
        codePromoId: promo.id,
      }
    }

    const parrain = await prisma.client.findUnique({ where: { codeParrainage: normaliserCode(code) } })
    if (!parrain) throw createError({ statusCode: 400, statusMessage: 'Code promo invalide ou expiré' })
    if (parrain.id === client.id) {
      throw createError({ statusCode: 400, statusMessage: 'Vous ne pouvez pas utiliser votre propre code de parrainage' })
    }
    if (await aDejaPaye(client.id)) {
      throw createError({ statusCode: 400, statusMessage: 'Le code de parrainage est réservé à la première commande' })
    }
    const existant = await prisma.parrainage.findUnique({ where: { filleulId: client.id } })
    if (existant && existant.parrainId !== parrain.id) {
      throw createError({ statusCode: 400, statusMessage: 'Vous avez déjà été parrainé(e) par un autre client' })
    }
    if (!existant) {
      await prisma.parrainage.create({ data: { parrainId: parrain.id, filleulId: client.id } })
    }
    return {
      remise: calculerRemise(base, reductionParrainage),
      libelle: `Parrainage ${pourcentage} %`,
      source: 'filleul',
    }
  }

  const parrainage = await prisma.parrainage.findUnique({ where: { filleulId: client.id } })
  if (parrainage?.statut === 'EN_ATTENTE' && !(await aDejaPaye(client.id))) {
    return {
      remise: calculerRemise(base, reductionParrainage),
      libelle: `Parrainage ${pourcentage} %`,
      source: 'filleul',
    }
  }

  if (client.recompensesParrainage > 0) {
    return {
      remise: calculerRemise(base, reductionParrainage),
      libelle: `Récompense parrainage ${pourcentage} %`,
      source: 'parrain',
    }
  }

  return null
}

/**
 * Effets d'un paiement réussi sur les réductions (appelé par le webhook) :
 * compteur du code promo, consommation d'une récompense de parrain, et
 * validation du parrainage au 1er paiement du filleul.
 */
export async function apresPaiement(clientId: string, source: string | undefined, codePromoId: string | null) {
  if (source === 'promo' && codePromoId) {
    await prisma.codePromo.update({ where: { id: codePromoId }, data: { utilisations: { increment: 1 } } })
  }
  if (source === 'parrain') {
    await prisma.client.updateMany({
      where: { id: clientId, recompensesParrainage: { gt: 0 } },
      data: { recompensesParrainage: { decrement: 1 } },
    })
  }

  // Le parrainage est validé au premier paiement du filleul, quelle que
  // soit la réduction utilisée pour ce paiement.
  const parrainage = await prisma.parrainage.findUnique({
    where: { filleulId: clientId },
    include: { parrain: true, filleul: true },
  })
  if (!parrainage || parrainage.statut !== 'EN_ATTENTE') return

  const { count } = await prisma.parrainage.updateMany({
    where: { id: parrainage.id, statut: 'EN_ATTENTE' },
    data: { statut: 'VALIDE', valideLe: new Date() },
  })
  if (count === 0) return // déjà traité par un événement concurrent

  const { 'parrainage.pourcentage': pourcentage } = await getReglages()

  // Récompense du parrain : directement sur sa prochaine échéance s'il est
  // abonné, sinon mise de côté pour son prochain paiement.
  const aboParrain = await prisma.abonnement.findFirst({
    where: { clientId: parrainage.parrainId, statut: 'ACTIF', stripeSubscriptionId: { not: null } },
  })
  let appliquee = false
  if (aboParrain?.stripeSubscriptionId) {
    try {
      await appliquerReductionAbonnement(aboParrain.stripeSubscriptionId, pourcentage)
      appliquee = true
    } catch (err) {
      console.error('[Parrainage] Réduction Stripe non appliquée :', err)
    }
  }
  if (!appliquee) {
    await prisma.client.update({
      where: { id: parrainage.parrainId },
      data: { recompensesParrainage: { increment: 1 } },
    })
  }

  sendParrainageValide(parrainage.parrain.email, parrainage.parrain.prenom, parrainage.filleul.prenom, pourcentage, appliquee)
    .catch(err => console.error('[Email] Parrainage non envoyé :', err.message))
}
