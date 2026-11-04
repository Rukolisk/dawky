// server/api/chiens/index.get.ts
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'
import { chienInclude, serialiserChien } from '~/server/utils/chiens'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const chiens = await prisma.chien.findMany({
      // Les fiches supprimées (consentement retiré) ne sont plus listées
      where: { clientId: client.id, consentementRgpdLe: { not: null } },
      include: chienInclude,
      orderBy: { createdAt: 'asc' },
    })
    return apiSuccess(await Promise.all(chiens.map(serialiserChien)))
  })
})
