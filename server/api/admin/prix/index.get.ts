// server/api/admin/prix/index.get.ts
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'
import { serialiserFormule } from '~/server/utils/formules'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const formules = await prisma.formulaBox.findMany({
      where: { type: { in: ['SURPRISE', 'COMPOSE', 'SAISONNIERE'] } },
      include: { prix: true },
      orderBy: [{ type: 'asc' }, { createdAt: 'desc' }],
    })
    return apiSuccess(formules.map(serialiserFormule))
  })
})
