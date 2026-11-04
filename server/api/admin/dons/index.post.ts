// server/api/admin/dons/index.post.ts
// Enregistre le don d'un lot retiré à une association
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({
  lotId:       z.string().min(1),
  quantite:    z.number().int().min(1),
  association: z.string().trim().min(2).max(150),
  note:        z.string().trim().max(500).optional(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const body = await parseBody(event, bodySchema)

    const don = await prisma.$transaction(async (tx) => {
      const { count } = await tx.lotStock.updateMany({
        where: { id: body.lotId, statut: 'RETIRE', quantite: { gte: body.quantite } },
        data: { quantite: { decrement: body.quantite } },
      })
      if (count === 0) throw createError({ statusCode: 400, statusMessage: 'Lot non retiré ou quantité insuffisante' })

      const lot = await tx.lotStock.findUniqueOrThrow({ where: { id: body.lotId } })
      if (lot.quantite === 0) await tx.lotStock.update({ where: { id: lot.id }, data: { statut: 'DONNE' } })
      return tx.don.create({ data: body })
    })

    return apiSuccess(don, 'Don enregistré')
  })
})
