// server/api/admin/boxes-mensuelles/index.post.ts
// POST /api/admin/boxes-mensuelles
// Crée ou met à jour une box mensuelle pour un mois+taille donné

import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/adminGuard'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({
  mois:        z.string().regex(/^\d{4}-\d{2}$/, 'Format attendu: YYYY-MM'),
  taille:      z.enum(['XS', 'S', 'M', 'L']),
  theme:       z.string().optional(),
  description: z.string().optional(),
  // Liste des produits à inclure avec leur quantité
  items: z.array(z.object({
    produitId: z.string(),
    quantite:  z.number().int().min(1).default(1),
  })).min(1, 'Ajoutez au moins un produit'),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const body = await parseBody(event, bodySchema)

    // Calculer la date d'expédition = 1er du mois
    const [year, month] = body.mois.split('-').map(Number)
    const dateExpedition = new Date(year, month - 1, 1, 8, 0, 0) // 8h du matin

    // Upsert de la box mensuelle
    const boxMensuelle = await prisma.boxMensuelle.upsert({
      where: { mois_taille: { mois: body.mois, taille: body.taille } },
      update: {
        theme:       body.theme,
        description: body.description,
        dateExpedition,
        statut:      'BROUILLON',
        // Remplacer tous les items
        items: {
          deleteMany: {},
          create: body.items.map(item => ({
            produitId: item.produitId,
            quantite:  item.quantite,
          })),
        },
      },
      create: {
        mois:          body.mois,
        taille:        body.taille,
        theme:         body.theme,
        description:   body.description,
        dateExpedition,
        statut:        'BROUILLON',
        items: {
          create: body.items.map(item => ({
            produitId: item.produitId,
            quantite:  item.quantite,
          })),
        },
      },
      include: {
        items: {
          include: { produit: { select: { nom: true, emoji: true } } },
        },
      },
    })

    return apiSuccess(boxMensuelle, `Box ${body.taille} de ${body.mois} sauvegardée`)
  })
})
