// server/api/admin/dons/index.get.ts
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const dons = await prisma.don.findMany({
      include: { lot: { include: { produit: { select: { nom: true, emoji: true } } } } },
      orderBy: { donneLe: 'desc' },
    })
    return apiSuccess(dons)
  })
})
