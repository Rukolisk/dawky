// server/api/adresses/index.post.ts
// Ajoute une adresse de livraison. La première devient l'adresse par défaut.
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'
import { adresseSchema } from '~/server/utils/schemas'

const bodySchema = adresseSchema.extend({
  parDefaut: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const { parDefaut, ...data } = await parseBody(event, bodySchema)

    const nb = await prisma.adresse.count({ where: { clientId: client.id } })
    const estParDefaut = nb === 0 || parDefaut === true

    const adresse = await prisma.$transaction(async (tx) => {
      if (estParDefaut) {
        await tx.adresse.updateMany({ where: { clientId: client.id }, data: { parDefaut: false } })
      }
      return tx.adresse.create({ data: { ...data, clientId: client.id, parDefaut: estParDefaut } })
    })

    return apiSuccess(adresse, 'Adresse enregistrée')
  })
})
