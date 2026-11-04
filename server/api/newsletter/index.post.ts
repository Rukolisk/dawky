// server/api/newsletter/index.post.ts
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { sendNewsletterConfirmation } from '~/server/utils/email'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({
  email:  z.string().trim().toLowerCase().email('Email invalide'),
  prenom: z.string().trim().max(80).optional(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const body = await parseBody(event, bodySchema)

    const existant = await prisma.newsletter.findUnique({ where: { email: body.email } })
    const entry = await prisma.newsletter.upsert({
      where:  { email: body.email },
      update: { actif: true, prenom: body.prenom ?? undefined, ...(existant?.actif ? {} : { consentementLe: new Date() }) },
      create: { email: body.email, prenom: body.prenom },
    })

    // Pas de nouvel email si l'adresse était déjà inscrite
    if (!existant?.actif) {
      sendNewsletterConfirmation(entry.email, entry.prenom ?? undefined, entry.tokenDesinscription)
        .catch(err => console.error('[Email] Newsletter non envoyé :', err.message))
    }

    // Même réponse dans tous les cas : ne révèle pas si l'email était inscrit
    return apiSuccess(null, 'Inscription confirmée ! Vous recevrez nos actualités Dawky')
  })
})
