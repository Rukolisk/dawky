// server/api/auth/profile.put.ts
// Rectification des informations personnelles (les adresses ont leurs routes)
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({
  prenom:    z.string().trim().min(1).max(80).optional(),
  nom:       z.string().trim().min(1).max(80).optional(),
  telephone: z.string().trim().max(20).optional().nullable(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const body = await parseBody(event, bodySchema)

    const updated = await prisma.client.update({
      where: { id: client.id },
      data: body,
      select: { id: true, email: true, prenom: true, nom: true, telephone: true, role: true },
    })

    return apiSuccess(updated, 'Profil mis à jour')
  })
})
