// server/api/admin/boxes-mensuelles/valider.post.ts
// POST /api/admin/boxes-mensuelles/valider
// Valide les 3 boxes d'un mois (BROUILLON → VALIDEE)
// Les boxes validées sont prêtes à être expédiées le 1er du mois

import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/adminGuard'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({
  mois: z.string().regex(/^\d{4}-\d{2}$/),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const { mois } = await parseBody(event, bodySchema)

    // Vérifier que les 3 tailles sont configurées
    const boxes = await prisma.boxMensuelle.findMany({
      where: { mois },
      include: { items: true },
    })

    const taillesManquantes = (['XS', 'S', 'M', 'L'] as const).filter(
      t => !boxes.find(b => b.taille === t)
    )
    if (taillesManquantes.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Boxes manquantes pour le mois ${mois} : tailles ${taillesManquantes.join(', ')}`,
      })
    }

    const boxesVides = boxes.filter(b => b.items.length === 0)
    if (boxesVides.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Boxes sans produit : tailles ${boxesVides.map(b => b.taille).join(', ')}`,
      })
    }

    // Valider toutes les boxes du mois
    await prisma.boxMensuelle.updateMany({
      where: { mois, statut: 'BROUILLON' },
      data:  { statut: 'VALIDEE' },
    })

    return apiSuccess({ mois, boxesValidees: boxes.length }, `✓ ${boxes.length} boxes du mois ${mois} validées — prêtes pour le 1er du mois`)
  })
})
