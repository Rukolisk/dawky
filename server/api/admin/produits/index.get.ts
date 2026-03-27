// server/api/admin/produits/index.get.ts
// Admin : liste tous les produits (actifs + inactifs + invendus)
import prisma from '~/server/utils/prisma'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    // TODO: vérifier le rôle ADMIN via le header supabaseUid
    const produits = await prisma.produit.findMany({
      include: { tailles: { select: { taille: true } } },
      orderBy: [{ estInvendu: 'desc' }, { categorie: 'asc' }, { nom: 'asc' }],
    })
    return apiSuccess(produits)
  })
})
