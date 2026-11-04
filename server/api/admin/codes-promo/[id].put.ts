// server/api/admin/codes-promo/[id].put.ts
// Modification / désactivation d'un code (le code lui-même ne change pas)
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseBody, requireParam, withErrorHandling } from '~/server/utils/api'
import { codePromoSchema, verifierValeur } from '~/server/utils/admin-codes'

const bodySchema = codePromoSchema.omit({ code: true }).extend({
  actif: codePromoSchema.shape.actif.removeDefault(),
}).partial()

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const id = requireParam(event, 'id')
    const body = await parseBody(event, bodySchema)

    const avant = await prisma.codePromo.findUniqueOrThrow({ where: { id } })
    if (!verifierValeur(body.type ?? avant.type, body.valeur ?? avant.valeur)) {
      throw createError({ statusCode: 400, statusMessage: 'Pourcentage supérieur à 100' })
    }

    const promo = await prisma.codePromo.update({ where: { id }, data: body })
    return apiSuccess(promo, 'Code mis à jour')
  })
})
