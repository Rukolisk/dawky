// server/api/admin/codes-promo/index.get.ts
// Codes promo et suivi des parrainages (US-50)
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const [codes, parrainages] = await Promise.all([
      prisma.codePromo.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.parrainage.findMany({
        include: {
          parrain: { select: { prenom: true, nom: true, email: true, codeParrainage: true } },
          filleul: { select: { prenom: true, nom: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
    ])
    return apiSuccess({ codes, parrainages })
  })
})
