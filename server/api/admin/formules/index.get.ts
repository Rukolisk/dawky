// server/api/admin/formules/index.get.ts
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const formules = await prisma.formulaBox.findMany({
      include: { prix: true, _count: { select: { commandes: true, abonnements: true } } },
      orderBy: [{ type: 'asc' }, { createdAt: 'desc' }],
    })
    return apiSuccess(formules)
  })
})
