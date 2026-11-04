// server/api/abonnements/[id]/pause.post.ts
// Pause de N mois (F-25) : pas de box ni de prélèvement, reprise automatique.
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, parseBody, requireParam, withErrorHandling } from '~/server/utils/api'
import { exigerStripe, getAbonnementDuClient } from '~/server/utils/abonnements'
import { ajouterMois, prochaineExpedition } from '~/server/utils/metier'
import { getReglages } from '~/server/utils/reglages'
import { getStripe } from '~/server/utils/stripe'
import { sendAbonnementPause } from '~/server/utils/email'

const bodySchema = z.object({
  mois: z.number().int().min(1),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const id = requireParam(event, 'id')
    const { mois } = await parseBody(event, bodySchema)
    const abonnement = await getAbonnementDuClient(id, client.id)

    const { 'abonnement.pauseMaxMois': max } = await getReglages()
    if (mois > max) throw createError({ statusCode: 400, statusMessage: `La pause est limitée à ${max} mois` })
    if (abonnement.statut !== 'ACTIF') {
      throw createError({ statusCode: 400, statusMessage: 'Seul un abonnement actif peut être mis en pause' })
    }

    // Les N prochaines expéditions (le 1er du mois) sont sautées
    const pauseJusquau = ajouterMois(prochaineExpedition(), mois)

    await getStripe().subscriptions.update(exigerStripe(abonnement), {
      pause_collection: { behavior: 'void', resumes_at: Math.floor(pauseJusquau.getTime() / 1000) },
    })

    const updated = await prisma.abonnement.update({
      where: { id },
      data: { statut: 'PAUSE', pauseJusquau },
    })

    sendAbonnementPause(client.email, { prenom: client.prenom, nomChien: abonnement.chien.nom, reprise: pauseJusquau })
      .catch(err => console.error('[Email] Pause non envoyée :', err.message))

    return apiSuccess(updated, `Abonnement en pause jusqu'au ${pauseJusquau.toLocaleDateString('fr-FR')}`)
  })
})
