// server/api/avis/index.get.ts
// Avis publiés et note moyenne (preuve sociale, US-33)
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { apiSuccess, parseQuery, queryBool, withErrorHandling } from '~/server/utils/api'

const querySchema = z.object({
  avecPhoto: queryBool.default('false'),
  page:      z.coerce.number().int().min(1).default(1),
  limit:     z.coerce.number().int().min(1).max(50).default(12),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const q = parseQuery(event, querySchema)
    const where = { statut: 'PUBLIE' as const, ...(q.avecPhoto ? { photoUrl: { not: null } } : {}) }

    const [avis, stats] = await Promise.all([
      prisma.avis.findMany({
        where,
        select: { id: true, note: true, commentaire: true, photoUrl: true, createdAt: true, client: { select: { prenom: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      prisma.avis.aggregate({ where: { statut: 'PUBLIE' }, _avg: { note: true }, _count: { _all: true } }),
    ])

    return apiSuccess({
      avis: avis.map(({ client, ...a }) => ({ ...a, prenom: client.prenom })),
      noteMoyenne: stats._avg.note ? Math.round(stats._avg.note * 10) / 10 : null,
      total: stats._count._all,
    })
  })
})
