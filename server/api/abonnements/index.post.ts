// server/api/abonnements/index.post.ts
// Souscription à la Box Surprise pour un chien.
// Crée l'abonnement en attente de paiement puis renvoie le clientSecret
// de la session Stripe Checkout (formulaire intégré à la page) ; il devient ACTIF à la réception du webhook de paiement.
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'
import { cgvSchema, livraisonSchema, tailleSchema } from '~/server/utils/schemas'
import { getChienDuClient, notifierAllergieSiBesoin } from '~/server/utils/chiens'
import { getAdresseDuClient } from '~/server/utils/livraison'
import { resoudreReduction } from '~/server/utils/promo'
import { creerSessionAbonnement, getStripe } from '~/server/utils/stripe'

const bodySchema = z.object({
  chienId:    z.string().min(1),
  // Par défaut : la taille de la fiche chien. Le client garde le dernier mot.
  taille:     tailleSchema.optional(),
  livraison:  livraisonSchema,
  codePromo:  z.string().trim().max(30).optional(),
  accepteCgv: cgvSchema,
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const body = await parseBody(event, bodySchema)

    const chien = await getChienDuClient(body.chienId, client.id)
    if (!chien.consentementRgpdLe) {
      throw createError({ statusCode: 400, statusMessage: 'La fiche de votre chien doit être complétée avant la souscription' })
    }
    await getAdresseDuClient(body.livraison.adresseId, client.id)

    // F-22 : un seul abonnement en cours par chien
    const enCours = await prisma.abonnement.findFirst({
      where: {
        chienId: chien.id,
        OR: [
          { statut: { in: ['ACTIF', 'PAUSE', 'IMPAYE'] } },
          { statut: 'RESILIE', dateFin: { gt: new Date() } },
        ],
      },
    })
    if (enCours) {
      throw createError({
        statusCode: 409,
        statusMessage: `${chien.nom} a déjà un abonnement en cours. Vous pouvez le modifier depuis votre espace client.`,
      })
    }

    const formula = await prisma.formulaBox.findFirst({
      where: { type: 'SURPRISE', actif: true },
      include: { prix: true },
    })
    const taille = body.taille ?? chien.taille
    const prixMensuel = formula?.prix.find(p => p.taille === taille)?.prix
    if (!formula || !prixMensuel) {
      throw createError({ statusCode: 503, statusMessage: 'La Box Surprise n\'est pas disponible pour le moment' })
    }

    // Une souscription abandonnée précédemment pour ce chien est annulée
    const enAttente = await prisma.abonnement.findMany({ where: { chienId: chien.id, statut: 'EN_ATTENTE_PAIEMENT' } })
    for (const abo of enAttente) {
      if (abo.stripeCheckoutId) {
        await getStripe().checkout.sessions.expire(abo.stripeCheckoutId).catch(() => { /* déjà expirée */ })
      }
    }
    await prisma.abonnement.updateMany({
      where: { id: { in: enAttente.map(a => a.id) } },
      data: { statut: 'ANNULE' },
    })

    const reduction = await resoudreReduction(client, prixMensuel, body.codePromo)

    const abonnement = await prisma.abonnement.create({
      data: {
        clientId:           client.id,
        chienId:            chien.id,
        formulaId:          formula.id,
        adresseId:          body.livraison.adresseId,
        modeLivraison:      body.livraison.modeLivraison,
        pointRelaisId:      body.livraison.pointRelaisId,
        pointRelaisLibelle: body.livraison.pointRelaisLibelle,
        taille,
        prixMensuel,
        codePromoId:        reduction?.codePromoId,
      },
    })

    const session = await creerSessionAbonnement({
      abonnementId:  abonnement.id,
      client,
      libelle:       `Box Surprise Dawky taille ${taille} — ${chien.nom}`,
      prixMensuel,
      remise:        reduction?.remise ?? 0,
      libelleRemise: reduction?.libelle,
      sourceRemise:  reduction?.source,
    })
    await prisma.abonnement.update({ where: { id: abonnement.id }, data: { stripeCheckoutId: session.id } })

    // L'équipe est prévenue dès la souscription pour avoir le temps de
    // contacter le client avant la prochaine expédition.
    await notifierAllergieSiBesoin(chien, client)

    return apiSuccess({
      abonnementId: abonnement.id,
      clientSecret:  session.client_secret,
      recapitulatif: {
        chien: chien.nom,
        taille,
        prixMensuel,
        remisePremierMois: reduction?.remise ?? 0,
        libelleRemise: reduction?.libelle ?? null,
      },
    })
  })
})
