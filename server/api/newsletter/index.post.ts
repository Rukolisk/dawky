// server/api/newsletter/index.post.ts
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { sendNewsletterConfirmation } from '~/server/utils/email'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({
  email:  z.string().email('Email invalide'),
  prenom: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const body = await parseBody(event, bodySchema)

    const entry = await prisma.newsletter.upsert({
      where:  { email: body.email },
      update: { actif: true, prenom: body.prenom },
      create: { email: body.email, prenom: body.prenom, actif: true },
    })

    // Email de confirmation (non bloquant)
    sendNewsletterConfirmation(body.email, body.prenom)
      .catch(err => console.error('[Email] Newsletter non envoyé :', err.message))

    return apiSuccess(
      { id: entry.id },
      'Inscription confirmée ! Vous recevrez nos actualités Dawky 🐾',
    )
  })
})
