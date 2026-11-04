// server/api/admin/invendus/index.get.ts
// Lots invendus par mois d'origine (US-19), total consolidé, et lots
// retirés à donner aux associations.
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)

    const [disponibles, aDonner] = await Promise.all([
      prisma.lotStock.findMany({
        where: { moisOrigine: { not: null }, statut: 'DISPONIBLE', quantite: { gt: 0 } },
        include: { produit: { select: { id: true, nom: true, emoji: true, categorie: true, prix: true, actif: true } } },
        orderBy: [{ moisOrigine: 'desc' }, { dateLimite: { sort: 'asc', nulls: 'last' } }],
      }),
      prisma.lotStock.findMany({
        where: { statut: 'RETIRE', quantite: { gt: 0 } },
        include: { produit: { select: { id: true, nom: true, emoji: true } } },
        orderBy: { retireLe: 'asc' },
      }),
    ])

    const parMois: Record<string, typeof disponibles> = {}
    for (const lot of disponibles) (parMois[lot.moisOrigine!] ??= []).push(lot)

    return apiSuccess({
      parMois,
      stockTotal: disponibles.reduce((s, l) => s + l.quantite, 0),
      aDonner,
      // Pastille de notification dans l'onglet
      notification: disponibles.length > 0 || aDonner.length > 0,
    })
  })
})
