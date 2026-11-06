// server/api/abonnements/[id]/resiliation.post.ts
// Résiliation en ligne (US-10) : plus de prélèvement, la période payée
// en cours reste servie jusqu'à `dateFin`.
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, parseBody, requireParam, withErrorHandling } from '~/server/utils/api'
import { exigerStripe, getAbonnementDuClient } from '~/server/utils/abonnements'
import { finPeriodeStripe, getStripe } from '~/server/utils/stripe'
import { sendAbonnementResiliation } from '~/server/utils/email'

const bodySchema = z.object({
  // Confirmation explicite demandée à l'écran
  confirmation: z.literal(true, { error: 'Confirmation requise' }),
  raison:       z.string().trim().max(500).optional(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const id = requireParam(event, 'id')
    const { raison } = await parseBody(event, bodySchema)
    const abonnement = await getAbonnementDuClient(id, client.id)

    if (!['ACTIF', 'PAUSE', 'IMPAYE'].includes(abonnement.statut)) {
      throw createError({ statusCode: 400, statusMessage: 'Cet abonnement est déjà résilié' })
    }

    const sub = await getStripe().subscriptions.update(exigerStripe(abonnement), {
      cancel_at_period_end: true,
      // Une pause en cours n'a plus de sens
      pause_collection: '',
    })
    const dateFin = finPeriodeStripe(sub) ?? abonnement.finPeriode ?? new Date()

    const updated = await prisma.abonnement.update({
      where: { id },
      data: { statut: 'RESILIE', dateFin, pauseJusquau: null, raisonResiliation: raison },
    })

    sendAbonnementResiliation(client.email, { prenom: client.prenom, nomChien: abonnement.chien.nom, dateFin })
      .catch(err => console.error('[Email] Résiliation non envoyée :', err.message))

    return apiSuccess(updated, 'Abonnement résilié')
  })
})
