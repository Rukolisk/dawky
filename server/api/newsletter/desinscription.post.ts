// server/api/newsletter/desinscription.post.ts
// Désinscription depuis le lien de l'email (retrait du consentement)
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({ token: z.string().min(1) })

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { token } = await parseBody(event, bodySchema)
    await prisma.newsletter.updateMany({ where: { tokenDesinscription: token }, data: { actif: false } })
    return apiSuccess(null, 'Vous êtes désinscrit(e) de la newsletter')
  })
})
