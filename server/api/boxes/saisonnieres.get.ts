// server/api/boxes/saisonnieres.get.ts
// Box saisonnières ouvertes à la vente (achat sans abonnement)
import prisma from '~/server/utils/prisma'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'
import { serialiserFormule } from '~/server/utils/formules'

export default defineEventHandler(async () => {
  return withErrorHandling(async () => {
    const now = new Date()
    const formules = await prisma.formulaBox.findMany({
      where: {
        type: 'SAISONNIERE',
        actif: true,
        dateDebutVente: { lte: now },
        OR: [{ dateFinVente: null }, { dateFinVente: { gte: now } }],
      },
      include: { prix: true },
      orderBy: { dateDebutVente: 'desc' },
    })
    return apiSuccess(formules.map(serialiserFormule))
  })
})
