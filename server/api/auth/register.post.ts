// server/api/auth/register.post.ts
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { sendWelcomeEmail } from '~/server/utils/email'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({
  supabaseUid: z.string(),
  email:       z.string().email(),
  prenom:      z.string().min(2),
  nom:         z.string().min(2),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const body = await parseBody(event, bodySchema)

    const client = await prisma.client.upsert({
      where: { email: body.email },
      update: { supabaseUid: body.supabaseUid },
      create: {
        supabaseUid: body.supabaseUid,
        email:       body.email,
        prenom:      body.prenom,
        nom:         body.nom,
        role:        'USER',
      },
    })

    // Email de bienvenue (non bloquant)
    sendWelcomeEmail(body.email, body.prenom).catch(err =>
      console.error('[Email] Bienvenue non envoyé :', err.message)
    )

    return apiSuccess({ id: client.id, email: client.email })
  })
})
