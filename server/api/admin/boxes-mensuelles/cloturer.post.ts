// server/api/admin/boxes-mensuelles/cloturer.post.ts
// Clôture du mois (EXPEDIEE → CLOTUREE).
//
// Le stock courant restant de chaque produit des box du mois devient un
// lot invendu (moisOrigine = mois) : mêmes ingrédients et allergènes (on
// ne recopie pas le produit), chaque lot garde sa date limite. Ces lots
// apparaissent aussitôt dans Compose ta box.
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'
import { moisSchema } from '~/server/utils/schemas'
import { notifierAlertesStock } from '~/server/utils/alertes'

const bodySchema = z.object({
  mois: moisSchema,
  // Confirmation obligatoire côté interface
  confirmation: z.literal(true, { errorMap: () => ({ message: 'Confirmation requise' }) }),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const { mois } = await parseBody(event, bodySchema)

    const boxes = await prisma.boxMensuelle.findMany({ where: { mois }, include: { items: true } })
    if (boxes.length === 0 || boxes.some(b => b.statut !== 'EXPEDIEE')) {
      throw createError({ statusCode: 400, statusMessage: `Les box de ${mois} doivent être expédiées avant la clôture` })
    }
    const produitIds = [...new Set(boxes.flatMap(b => b.items.map(i => i.produitId)))]

    const transferes = await prisma.$transaction(async (tx) => {
      const { count } = await tx.boxMensuelle.updateMany({ where: { mois, statut: 'EXPEDIEE' }, data: { statut: 'CLOTUREE' } })
      if (count !== boxes.length) throw createError({ statusCode: 409, statusMessage: 'Mois déjà clôturé' })

      const lots = await tx.lotStock.findMany({
        where: { produitId: { in: produitIds }, moisOrigine: null, statut: 'DISPONIBLE', quantite: { gt: 0 } },
        include: { produit: { select: { nom: true, emoji: true } } },
      })
      await tx.lotStock.updateMany({
        where: { id: { in: lots.map(l => l.id) } },
        data: { moisOrigine: mois },
      })
      return lots
    })

    if (transferes.length > 0) {
      notifierAlertesStock().catch(err => console.error('[Alertes stock]', err))
    }

    const parProduit = new Map<string, number>()
    for (const l of transferes) {
      const cle = `${l.produit.emoji} ${l.produit.nom}`
      parProduit.set(cle, (parProduit.get(cle) ?? 0) + l.quantite)
    }

    return apiSuccess(
      { mois, invendus: [...parProduit.entries()].map(([produit, quantite]) => ({ produit, quantite })) },
      transferes.length > 0
        ? `Mois ${mois} clôturé : ${parProduit.size} produit(s) disponible(s) dans Compose ta box`
        : `Mois ${mois} clôturé : aucun stock restant`,
    )
  })
})
