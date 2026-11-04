// server/api/admin/boxes-mensuelles/index.post.ts
// Sauvegarde en brouillon de la box d'un mois pour une taille.
// Une box validée est verrouillée.
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'
import { moisSchema, tailleSchema } from '~/server/utils/schemas'
import { premierJourDuMois } from '~/server/utils/metier'

const bodySchema = z.object({
  mois:        moisSchema,
  taille:      tailleSchema,
  theme:       z.string().trim().max(100).optional().nullable(),
  description: z.string().trim().max(1000).optional().nullable(),
  items: z.array(z.object({
    produitId: z.string().min(1),
    quantite:  z.number().int().min(1).max(10).default(1),
  })).min(1, 'Ajoutez au moins un produit'),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const body = await parseBody(event, bodySchema)

    const existante = await prisma.boxMensuelle.findUnique({
      where: { mois_taille: { mois: body.mois, taille: body.taille } },
    })
    if (existante && existante.statut !== 'BROUILLON') {
      throw createError({ statusCode: 409, statusMessage: `La box ${body.taille} de ${body.mois} est verrouillée (${existante.statut})` })
    }

    const produitIds = body.items.map(i => i.produitId)
    if (new Set(produitIds).size !== produitIds.length) {
      throw createError({ statusCode: 400, statusMessage: 'Un produit apparaît deux fois' })
    }
    const produits = await prisma.produit.findMany({
      where: { id: { in: produitIds } },
      include: { tailles: true },
    })
    const problemes = produitIds.flatMap((id) => {
      const p = produits.find(x => x.id === id)
      if (!p) return [`produit ${id} introuvable`]
      if (!p.actif) return [`${p.nom} est désactivé`]
      if (!p.tailles.some(t => t.taille === body.taille)) return [`${p.nom} n'existe pas en taille ${body.taille}`]
      return []
    })
    if (problemes.length > 0) throw createError({ statusCode: 400, statusMessage: problemes.join(' ; ') })

    const items = body.items.map(i => ({ produitId: i.produitId, quantite: i.quantite }))
    const champs = {
      theme: body.theme,
      description: body.description,
      dateExpedition: premierJourDuMois(body.mois),
    }

    const box = await prisma.boxMensuelle.upsert({
      where: { mois_taille: { mois: body.mois, taille: body.taille } },
      update: { ...champs, items: { deleteMany: {}, create: items } },
      create: { ...champs, mois: body.mois, taille: body.taille, items: { create: items } },
      include: { items: { include: { produit: { select: { nom: true, emoji: true } } } } },
    })

    return apiSuccess(box, `Box ${body.taille} de ${body.mois} enregistrée en brouillon`)
  })
})
