// server/api/adresses/[id].put.ts
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, parseBody, requireParam, withErrorHandling } from '~/server/utils/api'
import { adresseSchema } from '~/server/utils/schemas'

const bodySchema = adresseSchema.partial().extend({
  parDefaut: z.literal(true).optional(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const id = requireParam(event, 'id')
    const { parDefaut, ...data } = await parseBody(event, bodySchema)

    const existante = await prisma.adresse.findFirst({ where: { id, clientId: client.id } })
    if (!existante) throw createError({ statusCode: 404, statusMessage: 'Adresse introuvable' })

    // Les commandes déjà passées gardent l'adresse figée au moment de la
    // commande ; les abonnements utilisent l'adresse à jour.
    const adresse = await prisma.$transaction(async (tx) => {
      if (parDefaut) {
        await tx.adresse.updateMany({ where: { clientId: client.id }, data: { parDefaut: false } })
      }
      return tx.adresse.update({ where: { id }, data: { ...data, ...(parDefaut ? { parDefaut: true } : {}) } })
    })

    return apiSuccess(adresse, 'Adresse mise à jour')
  })
})
