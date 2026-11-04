// server/api/alertes-stock/index.delete.ts
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, parseQuery, withErrorHandling } from '~/server/utils/api'
import { tailleSchema } from '~/server/utils/schemas'

const querySchema = z.object({ taille: tailleSchema })

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const { taille } = parseQuery(event, querySchema)
    await prisma.alerteStock.deleteMany({ where: { clientId: client.id, taille } })
    return apiSuccess(null, 'Alerte supprimée')
  })
})
