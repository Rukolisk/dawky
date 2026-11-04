// server/api/admin/codes-promo/index.post.ts
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'
import { codePromoSchema, verifierValeur } from '~/server/utils/admin-codes'
import { normaliserCode } from '~/server/utils/promo'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const body = await parseBody(event, codePromoSchema)
    if (!verifierValeur(body.type, body.valeur)) throw createError({ statusCode: 400, statusMessage: 'Pourcentage supérieur à 100' })

    const code = normaliserCode(body.code)
    // Un code promo ne doit pas masquer un code de parrainage
    if (await prisma.client.findUnique({ where: { codeParrainage: code } })) {
      throw createError({ statusCode: 409, statusMessage: 'Ce code est déjà utilisé comme code de parrainage' })
    }

    const promo = await prisma.codePromo.create({ data: { ...body, code } })
    return apiSuccess(promo, 'Code créé')
  })
})
