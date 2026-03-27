// server/api/auth/profile.get.ts
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const uid = getHeader(event, 'x-supabase-uid')
    if (!uid) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })

    const client = await prisma.client.findUnique({
      where: { supabaseUid: uid },
      select: {
        id: true,
        // On retourne aussi supabaseUid pour que le client puisse le stocker
        supabaseUid: true,
        email: true,
        prenom: true,
        nom: true,
        telephone: true,
        adresse: true,
        ville: true,
        codePostal: true,
        pays: true,
        role: true,
      },
    })

    // 404 explicite — le composable useAuth gère ce cas sans crasher
    if (!client) {
      throw createError({ statusCode: 404, statusMessage: 'Profil introuvable en base' })
    }

    return apiSuccess(client)
  })
})
