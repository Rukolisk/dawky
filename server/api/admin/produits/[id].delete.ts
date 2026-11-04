// server/api/admin/produits/[id].delete.ts
// Désactivation sans suppression (F-57) : l'historique des box et
// commandes qui contiennent ce produit reste intact.
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, requireParam, withErrorHandling } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const id = requireParam(event, 'id')
    const produit = await prisma.produit.update({ where: { id }, data: { actif: false } })
    return apiSuccess({ id: produit.id }, 'Produit désactivé')
  })
})
