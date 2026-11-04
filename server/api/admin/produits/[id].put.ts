// server/api/admin/produits/[id].put.ts
// Modification d'un produit (le stock se gère par lots : /api/admin/lots)
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseBody, requireParam, withErrorHandling } from '~/server/utils/api'
import { adminProduitInclude, allergenesDepuisCodes, produitChampsSchema, verifierComposition } from '~/server/utils/admin-produits'

const bodySchema = produitChampsSchema.extend({
  emoji:      produitChampsSchema.shape.emoji.removeDefault(),
  allergenes: produitChampsSchema.shape.allergenes.removeDefault(),
  actif:      produitChampsSchema.shape.actif.removeDefault(),
}).partial()

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const id = requireParam(event, 'id')
    const { tailles, allergenes, ...data } = await parseBody(event, bodySchema)

    const avant = await prisma.produit.findUniqueOrThrow({ where: { id } })
    verifierComposition(data.categorie ?? avant.categorie, data.ingredients !== undefined ? data.ingredients : avant.ingredients)

    const produit = await prisma.produit.update({
      where: { id },
      data: {
        ...data,
        ...(tailles ? { tailles: { deleteMany: {}, create: tailles.map(taille => ({ taille })) } } : {}),
        ...(allergenes ? { allergenes: { deleteMany: {}, create: await allergenesDepuisCodes(allergenes) } } : {}),
      },
      include: adminProduitInclude,
    })

    return apiSuccess(produit, 'Produit mis à jour')
  })
})
