// server/api/abonnements/index.post.ts
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { sendAbonnementConfirmation } from '~/server/utils/email'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({
  prenom: z.string().min(2), nom: z.string().min(2),
  email: z.string().email(), telephone: z.string().optional(),
  adresse: z.string().min(5), ville: z.string().min(2),
  codePostal: z.string().min(4), pays: z.string().default('France'),
  taille: z.enum(['XS', 'S', 'M', 'L']),
  clientId: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const body = await parseBody(event, bodySchema)

    const formula = await prisma.formulaBox.findFirst({ where: { type: 'SURPRISE', actif: true } })
    if (!formula) throw createError({ statusCode: 404, statusMessage: 'Formule Surprise introuvable' })

    const client = await prisma.client.upsert({
      where: { email: body.email },
      update: { prenom: body.prenom, nom: body.nom, telephone: body.telephone, adresse: body.adresse, ville: body.ville, codePostal: body.codePostal, pays: body.pays },
      create: { prenom: body.prenom, nom: body.nom, email: body.email, telephone: body.telephone, adresse: body.adresse, ville: body.ville, codePostal: body.codePostal, pays: body.pays, role: 'USER' },
    })

    const existing = await prisma.abonnement.findFirst({ where: { clientId: client.id, statut: 'ACTIF' } })
    if (existing) throw createError({ statusCode: 409, statusMessage: 'Vous avez déjà un abonnement actif. Gérez-le depuis votre profil.' })

    const prochainePeriode = new Date()
    prochainePeriode.setMonth(prochainePeriode.getMonth() + 1)

    const abonnement = await prisma.abonnement.create({
      data: { clientId: client.id, formulaId: formula.id, taille: body.taille, engagement: 12, prochainePeriode, statut: 'ACTIF' },
    })

    await prisma.commande.create({
      data: { clientId: client.id, formulaId: formula.id, abonnementId: abonnement.id, taille: body.taille, total: formula.prix, adresseLivr: `${body.adresse}, ${body.codePostal} ${body.ville}, ${body.pays}`, statut: 'EN_ATTENTE' },
    })

    // Email de confirmation (non bloquant)
    sendAbonnementConfirmation(body.email, body.prenom, body.taille, formula.prix)
      .catch(err => console.error('[Email] Abonnement non envoyé :', err.message))

    return apiSuccess(
      { abonnement: { id: abonnement.id, taille: abonnement.taille, prochainePeriode }, formula: { nom: formula.nom, prix: formula.prix } },
      `Abonnement Box Surprise créé ! Votre box taille ${body.taille} arrive bientôt 🐾`,
    )
  })
})
