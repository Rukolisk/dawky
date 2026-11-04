// server/api/contact/index.post.ts
// Formulaire de contact : message enregistré pour l'équipe, accusé de
// réception à l'expéditeur (US-15)
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { getOptionalClient } from '~/server/utils/auth'
import { sendContactAccuse, sendNouveauContactEquipe } from '~/server/utils/email'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({
  prenom:  z.string().trim().min(1, 'Prénom requis').max(80),
  nom:     z.string().trim().min(1, 'Nom requis').max(80),
  email:   z.string().trim().toLowerCase().email('Email invalide'),
  sujet:   z.string().trim().min(3, 'Sujet requis').max(150),
  message: z.string().trim().min(10, 'Message trop court (10 caractères minimum)').max(5000),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    // Le message n'est rattaché à un compte que si l'auteur est connecté
    const client = await getOptionalClient(event)
    const body = await parseBody(event, bodySchema)

    const contact = await prisma.contact.create({ data: { ...body, clientId: client?.id ?? null } })

    sendContactAccuse(body.email, body.prenom, body.sujet)
      .catch(err => console.error('[Email] Accusé contact non envoyé :', err.message))
    sendNouveauContactEquipe(body)
      .catch(err => console.error('[Email] Notification contact non envoyée :', err.message))

    return apiSuccess({ id: contact.id }, 'Message envoyé ! Notre équipe vous répond sous 48 h ouvrées.')
  })
})
