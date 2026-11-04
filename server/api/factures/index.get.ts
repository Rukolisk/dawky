// server/api/factures/index.get.ts
// Factures et reçus du client (abonnements et achats), hébergés par Stripe
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'
import { getStripe } from '~/server/utils/stripe'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const { stripeCustomerId } = await prisma.client.findUniqueOrThrow({ where: { id: client.id } })
    if (!stripeCustomerId) return apiSuccess([])

    const invoices = await getStripe().invoices.list({ customer: stripeCustomerId, limit: 100 })
    return apiSuccess(
      invoices.data
        .filter(i => i.status === 'paid')
        .map(i => ({
          id: i.id,
          numero: i.number,
          date: new Date(i.created * 1000),
          montant: i.amount_paid,
          pdf: i.invoice_pdf,
          lien: i.hosted_invoice_url,
        })),
    )
  })
})
