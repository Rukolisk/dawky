// server/utils/expedition.ts
// Destinataires de la Box Surprise d'un mois donné
import type { Prisma } from '@prisma/client'
import prisma from './prisma'
import { premierJourDuMois } from './metier'

/**
 * Abonnements qui reçoivent la box expédiée le 1er du mois :
 * actifs, en pause terminée à cette date, ou résiliés dont la période
 * payée court encore. L'abonnement doit avoir démarré avant.
 */
export function filtreAbonnementsDuMois(mois: string): Prisma.AbonnementWhereInput {
  const date = premierJourDuMois(mois)
  return {
    dateDebut: { not: null },
    OR: [
      { statut: 'ACTIF' },
      { statut: 'PAUSE', pauseJusquau: { lte: date } },
      { statut: 'RESILIE', dateFin: { gt: date } },
    ],
  }
}

/**
 * Cadeaux payés dont toutes les box n'ont pas encore été envoyées.
 */
export function filtreCadeauxDuMois(): Prisma.AbonnementCadeauWhereInput {
  return { statut: 'ACTIF' }
}

export async function nombreDestinatairesParTaille(mois: string): Promise<Record<'S' | 'M' | 'L', number>> {
  const [abos, cadeaux] = await Promise.all([
    prisma.abonnement.groupBy({ by: ['taille'], where: filtreAbonnementsDuMois(mois), _count: { _all: true } }),
    prisma.abonnementCadeau.groupBy({ by: ['taille'], where: filtreCadeauxDuMois(), _count: { _all: true } }),
  ])
  const total = { S: 0, M: 0, L: 0 }
  for (const r of [...abos, ...cadeaux]) total[r.taille] += r._count._all
  return total
}
