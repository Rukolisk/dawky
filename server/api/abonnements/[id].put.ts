// server/api/abonnements/[id].put.ts
// Changement de taille (F-24, prise en compte à la prochaine échéance)
// et/ou de livraison (F-27).
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, parseBody, requireParam, withErrorHandling } from '~/server/utils/api'
import { livraisonSchema, tailleSchema } from '~/server/utils/schemas'
import { exigerStripe, getAbonnementDuClient } from '~/server/utils/abonnements'
import { getAdresseDuClient } from '~/server/utils/livraison'
import { changerPrixAbonnement } from '~/server/utils/stripe'
import { sendAbonnementChangementTaille } from '~/server/utils/email'

const bodySchema = z.object({
  taille:    tailleSchema.optional(),
  livraison: livraisonSchema.optional(),
}).refine(d => d.taille || d.livraison, { message: 'Rien à modifier' })

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const id = requireParam(event, 'id')
    const body = await parseBody(event, bodySchema)
    const abonnement = await getAbonnementDuClient(id, client.id)

    if (!['ACTIF', 'PAUSE', 'IMPAYE'].includes(abonnement.statut)) {
      throw createError({ statusCode: 400, statusMessage: 'Cet abonnement ne peut plus être modifié' })
    }

    const data: Record<string, unknown> = {}

    if (body.livraison) {
      await getAdresseDuClient(body.livraison.adresseId, client.id)
      Object.assign(data, {
        adresseId:          body.livraison.adresseId,
        modeLivraison:      body.livraison.modeLivraison,
        pointRelaisId:      body.livraison.modeLivraison === 'POINT_RELAIS' ? body.livraison.pointRelaisId : null,
        pointRelaisLibelle: body.livraison.modeLivraison === 'POINT_RELAIS' ? body.livraison.pointRelaisLibelle : null,
      })
    }

    const changeTaille = body.taille && body.taille !== abonnement.taille
    if (changeTaille) {
      const prix = await prisma.prixTaille.findFirst({
        where: { taille: body.taille, formula: { id: abonnement.formulaId } },
      })
      if (!prix) throw createError({ statusCode: 503, statusMessage: 'Taille indisponible pour le moment' })

      // Nouveau tarif = tarif actuel de la nouvelle taille
      await changerPrixAbonnement(exigerStripe(abonnement), prix.prix)
      Object.assign(data, { taille: body.taille, prixMensuel: prix.prix })
    }

    const updated = await prisma.abonnement.update({ where: { id }, data })

    if (changeTaille) {
      sendAbonnementChangementTaille(client.email, {
        prenom: client.prenom,
        nomChien: abonnement.chien.nom,
        ancienneTaille: abonnement.taille,
        nouvelleTaille: updated.taille,
        prixMensuel: updated.prixMensuel,
      }).catch(err => console.error('[Email] Changement de taille non envoyé :', err.message))
    }

    return apiSuccess(updated, changeTaille
      ? `Taille ${updated.taille} enregistrée, appliquée dès la prochaine période`
      : 'Livraison mise à jour')
  })
})
