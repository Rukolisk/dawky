// server/api/paiement/portail.post.ts
// Portail client Stripe : mettre à jour sa carte après un prélèvement
// refusé, consulter ses factures. Renvoie l'URL du portail.
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'
import { getStripe } from '~/server/utils/stripe'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const { stripeCustomerId } = await prisma.client.findUniqueOrThrow({ where: { id: client.id } })
    if (!stripeCustomerId) throw createError({ statusCode: 404, statusMessage: 'Aucun moyen de paiement enregistré' })

    const session = await getStripe().billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${useRuntimeConfig().public.appUrl}/mon-compte`,
    })
    return apiSuccess({ url: session.url })
  })
})
