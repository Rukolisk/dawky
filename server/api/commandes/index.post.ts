// server/api/commandes/index.post.ts — Box À la Carte (commande ponctuelle)
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { sendCommandeConfirmation } from '~/server/utils/email'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({
  prenom: z.string().min(2), nom: z.string().min(2),
  email: z.string().email(), telephone: z.string().optional(),
  adresse: z.string().min(5), ville: z.string().min(2),
  codePostal: z.string().min(4), pays: z.string().default('France'),
  taille: z.enum(['XS', 'S', 'M', 'L']),
  selectionProduitIds: z.array(z.string()).min(1),
  clientId: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const body = await parseBody(event, bodySchema)

    const formula = await prisma.formulaBox.findFirst({ where: { type: 'CARTE', actif: true } })
    if (!formula) throw createError({ statusCode: 404, statusMessage: 'Formule À la Carte introuvable' })

    if (body.selectionProduitIds.length > formula.slots) {
      throw createError({ statusCode: 400, statusMessage: `Maximum ${formula.slots} produits par commande` })
    }

    const produits = await prisma.produit.findMany({
      where: { id: { in: body.selectionProduitIds }, actif: true },
      select: { id: true, nom: true, emoji: true },
    })
    if (produits.length !== body.selectionProduitIds.length) {
      throw createError({ statusCode: 400, statusMessage: 'Un ou plusieurs produits sont indisponibles' })
    }

    const client = await prisma.client.upsert({
      where: { email: body.email },
      update: { prenom: body.prenom, nom: body.nom, telephone: body.telephone, adresse: body.adresse, ville: body.ville, codePostal: body.codePostal, pays: body.pays },
      create: { prenom: body.prenom, nom: body.nom, email: body.email, telephone: body.telephone, adresse: body.adresse, ville: body.ville, codePostal: body.codePostal, pays: body.pays, role: 'USER' },
    })

    const commande = await prisma.commande.create({
      data: {
        clientId: client.id, formulaId: formula.id,
        taille: body.taille, total: formula.prix,
        adresseLivr: `${body.adresse}, ${body.codePostal} ${body.ville}, ${body.pays}`,
        statut: 'EN_ATTENTE',
        selections: { create: body.selectionProduitIds.map(produitId => ({ produitId, quantite: 1 })) },
      },
    })

    // Email de confirmation (non bloquant)
    const produitsLabels = produits.map(p => `${p.emoji} ${p.nom}`)
    sendCommandeConfirmation(body.email, body.prenom, body.taille, produitsLabels)
      .catch(err => console.error('[Email] Commande non envoyé :', err.message))

    return apiSuccess(
      { commande: { id: commande.id, total: commande.total, taille: commande.taille, produits: produitsLabels } },
      `Commande confirmée ! Votre Box À la Carte taille ${body.taille} est en préparation 🐾`,
    )
  })
})
