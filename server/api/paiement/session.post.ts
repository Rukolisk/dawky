// server/api/paiement/session.post.ts
// Reprendre un paiement interrompu : renvoie le clientSecret de la session
// Stripe si elle est encore ouverte.
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'
import { getStripe } from '~/server/utils/stripe'

const bodySchema = z.object({
  type: z.enum(['abonnement', 'commande', 'cadeau']),
  id:   z.string().min(1),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const { type, id } = await parseBody(event, bodySchema)

    const entite = type === 'abonnement'
      ? await prisma.abonnement.findFirst({ where: { id, clientId: client.id, statut: 'EN_ATTENTE_PAIEMENT' } })
      : type === 'commande'
        ? await prisma.commande.findFirst({ where: { id, clientId: client.id, statut: 'EN_ATTENTE_PAIEMENT' } })
        : await prisma.abonnementCadeau.findFirst({ where: { id, acheteurId: client.id, statut: 'EN_ATTENTE_PAIEMENT' } })

    if (!entite?.stripeCheckoutId) throw createError({ statusCode: 404, statusMessage: 'Aucun paiement en attente' })

    const session = await getStripe().checkout.sessions.retrieve(entite.stripeCheckoutId)
    if (session.status !== 'open' || !session.client_secret) {
      throw createError({ statusCode: 410, statusMessage: 'Ce paiement a expiré, merci de recommencer votre commande' })
    }
    return apiSuccess({ clientSecret: session.client_secret })
  })
})
