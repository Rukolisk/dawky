// server/api/admin/produits/[id].put.ts
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({
  nom:         z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  emoji:       z.string().optional(),
  categorie:   z.enum(['MASTICATION', 'NUTRITION', 'JOUET', 'SOIN', 'ACCESSOIRE']).optional(),
  tailles:     z.array(z.enum(['XS', 'S', 'M', 'L'])).min(1).optional(),
  stock:       z.number().int().min(0).optional(),
  estInvendu:  z.boolean().optional(),
  actif:       z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID manquant' })

    const body = await parseBody(event, bodySchema)
    const { tailles, ...rest } = body

    const produit = await prisma.produit.update({
      where: { id },
      data: {
        ...rest,
        // Si tailles fourni, on remplace entièrement
        ...(tailles
          ? {
              tailles: {
                deleteMany: {},
                create: tailles.map((taille) => ({ taille })),
              },
            }
          : {}),
      },
      include: { tailles: { select: { taille: true } } },
    })

    return apiSuccess(produit, 'Produit mis à jour')
  })
})
