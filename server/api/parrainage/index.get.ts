// server/api/parrainage/index.get.ts
// Code, lien et suivi des parrainages (US-30)
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'
import { getReglages } from '~/server/utils/reglages'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const [parrainages, reglages] = await Promise.all([
      prisma.parrainage.findMany({
        where: { parrainId: client.id },
        include: { filleul: { select: { prenom: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      getReglages(),
    ])
    const appUrl = useRuntimeConfig().public.appUrl as string

    return apiSuccess({
      code: client.codeParrainage,
      lien: `${appUrl}/?parrain=${encodeURIComponent(client.codeParrainage)}`,
      pourcentage: reglages['parrainage.pourcentage'],
      recompensesDisponibles: client.recompensesParrainage,
      parrainages: parrainages.map(p => ({
        prenom: p.filleul.prenom,
        statut: p.statut,
        date: p.createdAt,
        valideLe: p.valideLe,
      })),
    })
  })
})
