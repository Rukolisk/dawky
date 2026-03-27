// server/api/admin/produits/[id].delete.ts
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID manquant' })

    // Soft delete : on désactive plutôt que de supprimer
    const produit = await prisma.produit.update({
      where: { id },
      data: { actif: false },
    })

    return apiSuccess({ id: produit.id }, 'Produit désactivé')
  })
})
