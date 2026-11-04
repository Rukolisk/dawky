// server/api/abonnements/[id]/reprise.post.ts
// Reprise anticipée d'un abonnement en pause
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, requireParam, withErrorHandling } from '~/server/utils/api'
import { exigerStripe, getAbonnementDuClient } from '~/server/utils/abonnements'
import { getStripe } from '~/server/utils/stripe'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const id = requireParam(event, 'id')
    const abonnement = await getAbonnementDuClient(id, client.id)

    if (abonnement.statut !== 'PAUSE') {
      throw createError({ statusCode: 400, statusMessage: 'Cet abonnement n\'est pas en pause' })
    }

    await getStripe().subscriptions.update(exigerStripe(abonnement), { pause_collection: '' })
    const updated = await prisma.abonnement.update({
      where: { id },
      data: { statut: 'ACTIF', pauseJusquau: null },
    })

    return apiSuccess(updated, 'Abonnement repris')
  })
})
