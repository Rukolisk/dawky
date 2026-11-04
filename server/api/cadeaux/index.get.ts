// server/api/cadeaux/index.get.ts
// Abonnements offerts par le client, avec le suivi des box envoyées
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const cadeaux = await prisma.abonnementCadeau.findMany({
      where: { acheteurId: client.id, statut: { in: ['ACTIF', 'TERMINE'] } },
      include: {
        commandes: {
          include: { boxMensuelle: { select: { mois: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return apiSuccess(cadeaux)
  })
})
