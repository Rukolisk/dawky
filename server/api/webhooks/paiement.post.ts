// server/api/webhooks/paiement.post.ts
// Webhook Stripe. La signature est vérifiée sur le corps brut ; un
// événement déjà traité est ignoré (table webhook_events).
import { createError, getHeader, readRawBody } from 'h3'
import prisma from '~/server/utils/prisma'
import { getStripe } from '~/server/utils/stripe'
import {
  traiterAbonnementSupprime,
  traiterCheckoutComplete,
  traiterCheckoutExpire,
  traiterFactureAVenir,
  traiterFactureEchouee,
  traiterFacturePayee,
} from '~/server/utils/paiement'

export default defineEventHandler(async (event) => {
  const secret = useRuntimeConfig().stripeWebhookSecret as string
  const signature = getHeader(event, 'stripe-signature')
  const raw = await readRawBody(event, false)
  if (!secret || !signature || !raw) {
    throw createError({ statusCode: 400, statusMessage: 'Requête webhook invalide' })
  }

  let stripeEvent
  try {
    stripeEvent = getStripe().webhooks.constructEvent(raw, signature, secret)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Signature invalide' })
  }

  const dejaTraite = await prisma.webhookEvent.findUnique({ where: { id: stripeEvent.id } })
  if (dejaTraite) return { received: true, duplicate: true }

  switch (stripeEvent.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      await traiterCheckoutComplete(stripeEvent.data.object)
      break
    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed':
      await traiterCheckoutExpire(stripeEvent.data.object)
      break
    case 'invoice.paid':
      await traiterFacturePayee(stripeEvent.data.object)
      break
    case 'invoice.payment_failed':
      await traiterFactureEchouee(stripeEvent.data.object)
      break
    case 'invoice.upcoming':
      await traiterFactureAVenir(stripeEvent.data.object)
      break
    case 'customer.subscription.deleted':
      await traiterAbonnementSupprime(stripeEvent.data.object)
      break
    default:
      // Événement non utilisé : on l'acquitte quand même
      break
  }

  // Une erreur de traitement ci-dessus renvoie une 500 : Stripe réessaiera,
  // et l'événement n'étant pas encore enregistré, il sera retraité.
  await prisma.webhookEvent.create({ data: { id: stripeEvent.id, type: stripeEvent.type } }).catch(() => {})
  return { received: true }
})
