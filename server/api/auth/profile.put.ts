// server/api/auth/profile.put.ts
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({
  prenom:     z.string().min(2).optional(),
  nom:        z.string().min(2).optional(),
  telephone:  z.string().optional().nullable(),
  adresse:    z.string().optional().nullable(),
  ville:      z.string().optional().nullable(),
  codePostal: z.string().optional().nullable(),
  pays:       z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    // Authentification via supabaseUid (pas le cuid Prisma)
    const uid = getHeader(event, 'x-supabase-uid')
    if (!uid) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })

    const body = await parseBody(event, bodySchema)

    const client = await prisma.client.update({
      where: { supabaseUid: uid },
      data: body,
      select: {
        id: true, supabaseUid: true, email: true,
        prenom: true, nom: true, telephone: true,
        adresse: true, ville: true, codePostal: true,
        pays: true, role: true,
      },
    })

    return apiSuccess(client)
  })
})
