// server/api/produits/[id].get.ts
// GET /api/produits/:id

import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID manquant' })

    const produit = await prisma.produit.findUnique({
      where: { id },
      include: {
        tailles: { select: { taille: true } },
        boxProduits: {
          include: {
            formula: {
              select: { id: true, nom: true, type: true, taille: true },
            },
          },
        },
      },
    })

    if (!produit) {
      throw createError({ statusCode: 404, statusMessage: 'Produit introuvable' })
    }

    return apiSuccess(produit)
  })
})
