// server/api/admin/produits/index.post.ts
// Création d'un produit, avec un premier lot de stock facultatif
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'
import { adminProduitInclude, allergenesDepuisCodes, produitChampsSchema, verifierComposition } from '~/server/utils/admin-produits'

const bodySchema = produitChampsSchema.extend({
  stockInitial: z.object({
    quantite:   z.number().int().min(1),
    dateLimite: z.coerce.date().optional().nullable(),
  }).optional(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const { tailles, allergenes, stockInitial, ...data } = await parseBody(event, bodySchema)
    verifierComposition(data.categorie, data.ingredients)

    const produit = await prisma.produit.create({
      data: {
        ...data,
        tailles: { create: tailles.map(taille => ({ taille })) },
        allergenes: { create: await allergenesDepuisCodes(allergenes) },
        ...(stockInitial ? { lots: { create: [stockInitial] } } : {}),
      },
      include: adminProduitInclude,
    })

    return apiSuccess(produit, 'Produit créé')
  })
})
