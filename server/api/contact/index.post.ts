// server/api/contact/index.post.ts
// POST /api/contact — Envoyer un message de contact

import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({
  prenom: z.string().min(2, 'Prénom requis'),
  nom: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  sujet: z.string().min(3, 'Sujet requis'),
  chien: z.string().optional(),
  message: z.string().min(10, 'Message trop court (min 10 caractères)'),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const body = await parseBody(event, bodySchema)

    // Chercher si le client existe déjà
    const client = await prisma.client.findUnique({
      where: { email: body.email },
    })

    const contact = await prisma.contact.create({
      data: {
        prenom: body.prenom,
        nom: body.nom,
        email: body.email,
        sujet: body.sujet,
        chien: body.chien,
        message: body.message,
        clientId: client?.id ?? null,
      },
    })

    return apiSuccess(
      { id: contact.id },
      'Message envoyé avec succès ! Notre équipe vous répondra sous 24h.',
    )
  })
})
