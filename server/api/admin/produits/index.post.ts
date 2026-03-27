// server/api/admin/produits/index.post.ts
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({
  nom:         z.string().min(2),
  description: z.string().min(5),
  emoji:       z.string().default('📦'),
  categorie:   z.enum(['MASTICATION', 'NUTRITION', 'JOUET', 'SOIN', 'ACCESSOIRE']),
  tailles:     z.array(z.enum(['XS', 'S', 'M', 'L'])).min(1),
  stock:       z.number().int().min(0).default(0),
  estInvendu:  z.boolean().default(false),
  actif:       z.boolean().default(true),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const body = await parseBody(event, bodySchema)
    const { tailles, ...rest } = body

    const produit = await prisma.produit.create({
      data: {
        ...rest,
        tailles: { create: tailles.map((taille) => ({ taille })) },
      },
      include: { tailles: { select: { taille: true } } },
    })

    return apiSuccess(produit, 'Produit créé avec succès')
  })
})
