// server/api/cadeaux/index.post.ts
// Offrir un abonnement prépayé de X mois (US-36 à US-38).
// Paiement unique du total (durée × prix de la taille), aucun
// renouvellement automatique.
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'
import { cgvSchema, codePostalSchema, tailleSchema } from '~/server/utils/schemas'
import { getReglages } from '~/server/utils/reglages'
import { resoudreReduction } from '~/server/utils/promo'
import { creerSessionPaiement } from '~/server/utils/stripe'
import { prochaineExpedition } from '~/server/utils/metier'

const bodySchema = z.object({
  taille:    tailleSchema,
  dureeMois: z.number().int().min(1),
  destinataire: z.object({
    prenom:     z.string().trim().min(1).max(80),
    nom:        z.string().trim().min(1).max(80),
    email:      z.string().trim().toLowerCase().email().optional(),
    ligne1:     z.string().trim().min(5).max(200),
    ligne2:     z.string().trim().max(200).optional(),
    codePostal: codePostalSchema,
    ville:      z.string().trim().min(2).max(100),
    pays:       z.string().trim().default('France'),
    telephone:  z.string().trim().max(20).optional(),
  }),
  nomChien:   z.string().trim().max(50).optional(),
  message:    z.string().trim().max(500).optional(),
  // Prévenir la destinataire par email (sans dévoiler le contenu)
  annoncer:   z.boolean().default(false),
  codePromo:  z.string().trim().max(30).optional(),
  accepteCgv: cgvSchema,
}).refine(d => !d.annoncer || d.destinataire.email, {
  message: 'Email de la destinataire requis pour la prévenir',
  path: ['destinataire', 'email'],
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const body = await parseBody(event, bodySchema)
    const reglages = await getReglages()

    const durees = reglages['cadeau.dureesMois']
    if (!durees.includes(body.dureeMois)) {
      throw createError({ statusCode: 400, statusMessage: `Durées proposées : ${durees.join(', ')} mois` })
    }

    const prix = await prisma.prixTaille.findFirst({
      where: { taille: body.taille, formula: { type: 'SURPRISE', actif: true } },
    })
    if (!prix) throw createError({ statusCode: 503, statusMessage: 'Les abonnements cadeaux ne sont pas disponibles pour le moment' })

    const sousTotal = prix.prix * body.dureeMois
    const reduction = await resoudreReduction(client, sousTotal, body.codePromo)
    const remise = reduction?.remise ?? 0
    const d = body.destinataire

    const cadeau = await prisma.abonnementCadeau.create({
      data: {
        acheteurId:     client.id,
        taille:         body.taille,
        dureeMois:      body.dureeMois,
        prixMensuel:    prix.prix,
        total:          sousTotal - remise,
        remise,
        destPrenom:     d.prenom,
        destNom:        d.nom,
        destEmail:      d.email,
        destLigne1:     d.ligne1,
        destLigne2:     d.ligne2,
        destCodePostal: d.codePostal,
        destVille:      d.ville,
        destPays:       d.pays,
        destTelephone:  d.telephone,
        nomChien:       body.nomChien,
        message:        body.message,
        annoncer:       body.annoncer,
        codePromoId:    reduction?.codePromoId,
      },
    })

    const session = await creerSessionPaiement({
      kind: 'cadeau',
      id: cadeau.id,
      client,
      lignes: [{
        libelle: `Abonnement Dawky offert — ${body.dureeMois} mois, taille ${body.taille}`,
        montant: prix.prix,
        quantite: body.dureeMois,
      }],
      remise,
      libelleRemise: reduction?.libelle,
      sourceRemise: reduction?.source,
    })
    await prisma.abonnementCadeau.update({ where: { id: cadeau.id }, data: { stripeCheckoutId: session.id } })

    return apiSuccess({
      cadeauId: cadeau.id,
      clientSecret: session.client_secret,
      recapitulatif: {
        taille: body.taille,
        dureeMois: body.dureeMois,
        prixMensuel: prix.prix,
        sousTotal,
        remise,
        total: sousTotal - remise,
        libelleRemise: reduction?.libelle ?? null,
        destinataire: `${d.prenom} ${d.nom}`,
        adresse: [d.ligne1, d.ligne2, `${d.codePostal} ${d.ville}`].filter(Boolean).join(', '),
        premiereLivraison: prochaineExpedition(),
      },
    })
  })
})
