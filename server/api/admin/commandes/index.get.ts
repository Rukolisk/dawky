// server/api/admin/commandes/index.get.ts
// Suivi des commandes (filtres statut, type, mois de box ; pagination)
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseQuery, withErrorHandling } from '~/server/utils/api'
import { moisSchema } from '~/server/utils/schemas'

const querySchema = z.object({
  statut: z.enum(['EN_ATTENTE_PAIEMENT', 'PAYEE', 'PREPAREE', 'EXPEDIEE', 'LIVREE', 'ANNULEE']).optional(),
  type:   z.enum(['BOX_MENSUELLE', 'COMPOSE', 'SAISONNIERE']).optional(),
  mois:   moisSchema.optional(),
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(200).default(50),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const q = parseQuery(event, querySchema)

    const where = {
      ...(q.statut ? { statut: q.statut } : { statut: { not: 'EN_ATTENTE_PAIEMENT' as const } }),
      ...(q.type ? { type: q.type } : {}),
      ...(q.mois ? { boxMensuelle: { mois: q.mois } } : {}),
    }

    const [total, commandes] = await Promise.all([
      prisma.commande.count({ where }),
      prisma.commande.findMany({
        where,
        include: {
          client: { select: { prenom: true, nom: true, email: true } },
          chien: { select: { nom: true } },
          cadeau: { select: { destPrenom: true, destNom: true } },
          boxMensuelle: { select: { mois: true } },
          selections: { include: { produit: { select: { nom: true, emoji: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
    ])

    return apiSuccess({ commandes, pagination: { total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) } })
  })
})
