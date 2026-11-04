// server/api/admin/avis/index.get.ts
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseQuery, withErrorHandling } from '~/server/utils/api'

const querySchema = z.object({ statut: z.enum(['EN_ATTENTE', 'PUBLIE', 'REFUSE']).default('EN_ATTENTE') })

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const { statut } = parseQuery(event, querySchema)
    const avis = await prisma.avis.findMany({
      where: { statut },
      include: { client: { select: { prenom: true, nom: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return apiSuccess(avis)
  })
})
