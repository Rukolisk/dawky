// server/api/commandes/[id].get.ts
// Détail d'une commande du client, avec le lien de facture (US-47)
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, requireParam, withErrorHandling } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const id = requireParam(event, 'id')

    const commande = await prisma.commande.findFirst({
      where: { id, clientId: client.id },
      include: {
        chien: { select: { nom: true } },
        formula: { select: { nom: true, type: true } },
        boxMensuelle: { select: { mois: true, theme: true } },
        selections: {
          include: {
            produit: {
              select: {
                nom: true, emoji: true, ingredients: true,
                allergenes: { include: { allergene: { select: { code: true, nom: true } } } },
              },
            },
          },
        },
      },
    })
    if (!commande) throw createError({ statusCode: 404, statusMessage: 'Commande introuvable' })

    return apiSuccess(commande)
  })
})
