// server/api/alertes-stock/index.post.ts
// "Prévenez-moi quand c'est de retour" (US-52) pour une taille donnée
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'
import { tailleSchema } from '~/server/utils/schemas'

const bodySchema = z.object({ taille: tailleSchema })

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const { taille } = await parseBody(event, bodySchema)

    // Réarme une alerte déjà notifiée
    const alerte = await prisma.alerteStock.upsert({
      where: { clientId_taille: { clientId: client.id, taille } },
      update: { notifieeLe: null },
      create: { clientId: client.id, taille },
    })
    return apiSuccess(alerte, 'Nous vous préviendrons par email dès le retour de produits')
  })
})
