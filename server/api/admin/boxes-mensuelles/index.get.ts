// server/api/admin/boxes-mensuelles/index.get.ts
// GET /api/admin/boxes-mensuelles?mois=2025-04

import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/adminGuard'
import { apiSuccess, parseQuery, withErrorHandling } from '~/server/utils/api'

const querySchema = z.object({
  mois: z.string().optional(), // format "YYYY-MM"
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const { mois } = parseQuery(event, querySchema)

    const boxes = await prisma.boxMensuelle.findMany({
      where: mois ? { mois } : {},
      include: {
        items: {
          include: {
            produit: {
              select: { id: true, nom: true, emoji: true, categorie: true, stock: true },
            },
          },
        },
      },
      orderBy: [{ mois: 'desc' }, { taille: 'asc' }],
    })

    // Nombre d'abonnés par taille (pour info)
    const abonnesCounts = await prisma.abonnement.groupBy({
      by: ['taille'],
      where: { statut: 'ACTIF' },
      _count: { id: true },
    })
    const abonnesMap = Object.fromEntries(
      abonnesCounts.map(a => [a.taille, a._count.id])
    )

    return apiSuccess({ boxes, abonnesMap })
  })
})
