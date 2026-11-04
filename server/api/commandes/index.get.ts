// server/api/commandes/index.get.ts
// Commandes du client connecté (hors paiements abandonnés)
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)

    const commandes = await prisma.commande.findMany({
      where: { clientId: client.id, statut: { notIn: ['EN_ATTENTE_PAIEMENT', 'ANNULEE'] } },
      include: {
        chien: { select: { nom: true } },
        formula: { select: { nom: true, type: true } },
        boxMensuelle: { select: { mois: true, theme: true } },
        selections: { include: { produit: { select: { nom: true, emoji: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return apiSuccess(commandes)
  })
})
