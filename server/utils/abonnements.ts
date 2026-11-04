// server/utils/abonnements.ts
import { createError } from 'h3'
import prisma from './prisma'

/**
 * Charge un abonnement appartenant au client (404 sinon).
 */
export async function getAbonnementDuClient(id: string, clientId: string) {
  const abonnement = await prisma.abonnement.findFirst({
    where: { id, clientId },
    include: { chien: true, adresse: true },
  })
  if (!abonnement) throw createError({ statusCode: 404, statusMessage: 'Abonnement introuvable' })
  return abonnement
}

export function exigerStripe(abonnement: { stripeSubscriptionId: string | null }): string {
  if (!abonnement.stripeSubscriptionId) {
    throw createError({ statusCode: 400, statusMessage: 'Cet abonnement n\'est pas encore actif' })
  }
  return abonnement.stripeSubscriptionId
}
