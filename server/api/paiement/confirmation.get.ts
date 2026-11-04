// server/api/paiement/confirmation.get.ts
// Écran de confirmation après paiement (parcours Michèle) :
// "Votre abonnement est actif à partir du…, livraison estimée au… à…"
// Si le webhook n'est pas encore arrivé, on traite la session ici
// (traitement idempotent).
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, parseQuery, withErrorHandling } from '~/server/utils/api'
import { getStripe } from '~/server/utils/stripe'
import { traiterCheckoutComplete } from '~/server/utils/paiement'
import { adresseUneLigne } from '~/server/utils/livraison'
import { prochaineExpedition } from '~/server/utils/metier'

const querySchema = z.object({ session_id: z.string().startsWith('cs_') })

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const { session_id } = parseQuery(event, querySchema)

    const session = await getStripe().checkout.sessions.retrieve(session_id)
    const { kind, id } = session.metadata ?? {}
    if (!kind || !id) throw createError({ statusCode: 404, statusMessage: 'Paiement introuvable' })

    if (session.status === 'complete') await traiterCheckoutComplete(session)

    if (kind === 'abonnement') {
      const abo = await prisma.abonnement.findFirst({
        where: { id, clientId: client.id },
        include: { chien: { select: { nom: true } }, adresse: true },
      })
      if (!abo) throw createError({ statusCode: 404, statusMessage: 'Paiement introuvable' })
      return apiSuccess({
        type: kind,
        statut: abo.statut,
        actif: abo.statut === 'ACTIF',
        dateDebut: abo.dateDebut,
        livraisonEstimee: prochaineExpedition(),
        pour: abo.chien.nom,
        taille: abo.taille,
        prixMensuel: abo.prixMensuel,
        adresse: abo.modeLivraison === 'POINT_RELAIS'
          ? `Point relais : ${abo.pointRelaisLibelle ?? ''}`
          : abo.adresse ? adresseUneLigne(abo.adresse) : null,
      })
    }

    if (kind === 'cadeau') {
      const c = await prisma.abonnementCadeau.findFirst({ where: { id, acheteurId: client.id } })
      if (!c) throw createError({ statusCode: 404, statusMessage: 'Paiement introuvable' })
      return apiSuccess({
        type: kind,
        statut: c.statut,
        actif: c.statut === 'ACTIF',
        dateDebut: c.dateDebut,
        livraisonEstimee: prochaineExpedition(),
        pour: `${c.destPrenom} ${c.destNom}`,
        taille: c.taille,
        dureeMois: c.dureeMois,
        total: c.total,
        adresse: adresseUneLigne({
          prenom: c.destPrenom, nom: c.destNom, ligne1: c.destLigne1, ligne2: c.destLigne2,
          codePostal: c.destCodePostal, ville: c.destVille, pays: c.destPays,
        }),
      })
    }

    const cmd = await prisma.commande.findFirst({ where: { id, clientId: client.id } })
    if (!cmd) throw createError({ statusCode: 404, statusMessage: 'Paiement introuvable' })
    return apiSuccess({
      type: kind,
      statut: cmd.statut,
      actif: cmd.statut === 'PAYEE',
      numero: cmd.numero,
      total: cmd.total,
      pour: cmd.livNom,
      adresse: `${cmd.livAdresse}, ${cmd.livCodePostal} ${cmd.livVille}`,
    })
  })
})
