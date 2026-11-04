// server/api/admin/avis/[id].put.ts
// Modération (F-66)
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseBody, requireParam, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({ statut: z.enum(['PUBLIE', 'REFUSE']) })

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const id = requireParam(event, 'id')
    const { statut } = await parseBody(event, bodySchema)
    const avis = await prisma.avis.update({ where: { id }, data: { statut } })
    return apiSuccess(avis, statut === 'PUBLIE' ? 'Avis publié' : 'Avis refusé')
  })
})
