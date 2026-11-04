// server/api/produits/[id].get.ts
// Fiche produit : composition complète, allergènes, traces (F-34)
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { apiSuccess, requireParam, withErrorHandling } from '~/server/utils/api'
import { produitInclude, serialiserProduit } from '~/server/utils/produits'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const id = requireParam(event, 'id')
    const produit = await prisma.produit.findFirst({ where: { id, actif: true }, include: produitInclude })
    if (!produit) throw createError({ statusCode: 404, statusMessage: 'Produit introuvable' })
    return apiSuccess(serialiserProduit(produit))
  })
})
