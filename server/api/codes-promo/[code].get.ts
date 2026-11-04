// server/api/codes-promo/[code].get.ts
// Vérifie un code (promo ou parrainage) pour l'afficher dans le
// récapitulatif (US-31). Le montant réel est recalculé au paiement.
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { apiSuccess, requireParam, withErrorHandling } from '~/server/utils/api'
import { normaliserCode, trouverCodePromo } from '~/server/utils/promo'
import { getReglages } from '~/server/utils/reglages'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const code = normaliserCode(requireParam(event, 'code'))

    const promo = await trouverCodePromo(code)
    if (promo) {
      return apiSuccess({ code: promo.code, type: promo.type, valeur: promo.valeur, parrainage: false })
    }

    const parrain = await prisma.client.findUnique({ where: { codeParrainage: code }, select: { prenom: true } })
    if (parrain) {
      const { 'parrainage.pourcentage': pourcentage } = await getReglages()
      return apiSuccess({
        code,
        type: 'POURCENTAGE',
        valeur: pourcentage,
        parrainage: true,
        parrain: parrain.prenom,
      })
    }

    throw createError({ statusCode: 404, statusMessage: 'Code invalide ou expiré' })
  })
})
