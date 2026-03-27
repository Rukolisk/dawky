// server/api/admin/commandes/index.get.ts
import prisma from '~/server/utils/prisma'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const commandes = await prisma.commande.findMany({
      include: {
        client:  { select: { prenom: true, nom: true, email: true } },
        formula: { select: { nom: true, type: true } },
        selections: {
          include: { produit: { select: { nom: true, emoji: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return apiSuccess(commandes)
  })
})
