// server/api/admin/boxes-mensuelles/index.get.ts
// GET /api/admin/boxes-mensuelles?mois=2026-12
// Les 3 box du mois, le nombre de destinataires par taille et le stock
// courant de chaque produit utilisé.
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseQuery, withErrorHandling } from '~/server/utils/api'
import { moisSchema } from '~/server/utils/schemas'
import { moisDe, prochaineExpedition } from '~/server/utils/metier'
import { nombreDestinatairesParTaille } from '~/server/utils/expedition'
import { stockCourantParProduit } from '~/server/utils/stock'

const querySchema = z.object({
  mois: moisSchema.optional(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const mois = parseQuery(event, querySchema).mois ?? moisDe(prochaineExpedition())

    const boxes = await prisma.boxMensuelle.findMany({
      where: { mois },
      include: {
        items: { include: { produit: { select: { id: true, nom: true, emoji: true, categorie: true } } } },
      },
      orderBy: { taille: 'asc' },
    })

    const produitIds = [...new Set(boxes.flatMap(b => b.items.map(i => i.produitId)))]
    const [destinataires, stock] = await Promise.all([
      nombreDestinatairesParTaille(mois),
      stockCourantParProduit(produitIds),
    ])

    return apiSuccess({
      mois,
      destinataires,
      boxes: boxes.map(b => ({
        ...b,
        items: b.items.map(i => ({ ...i, stockCourant: stock.get(i.produitId) ?? 0 })),
      })),
    })
  })
})
