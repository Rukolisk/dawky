// server/api/admin/produits/[id]/lots.post.ts
// Ajout de stock (nouveau lot courant, avec date limite si alimentaire)
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseBody, requireParam, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({
  quantite:   z.number().int().min(1),
  dateLimite: z.coerce.date().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const produitId = requireParam(event, 'id')
    const body = await parseBody(event, bodySchema)
    const lot = await prisma.lotStock.create({ data: { ...body, produitId } })
    return apiSuccess(lot, 'Stock ajouté')
  })
})
