// server/api/admin/commandes/[id].put.ts
// Statut d'expédition et suivi colis. L'acheteur est prévenu à
// l'expédition et à la livraison, même s'il n'est pas le destinataire (F-50).
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseBody, requireParam, withErrorHandling } from '~/server/utils/api'
import { sendExpedition, sendLivraison } from '~/server/utils/email'

const bodySchema = z.object({
  statut:       z.enum(['PREPAREE', 'EXPEDIEE', 'LIVREE', 'ANNULEE']).optional(),
  transporteur: z.string().trim().max(50).optional().nullable(),
  numeroSuivi:  z.string().trim().max(100).optional().nullable(),
})

// Transitions autorisées
const SUIVANTS: Record<string, string[]> = {
  PAYEE:    ['PREPAREE', 'EXPEDIEE', 'ANNULEE'],
  PREPAREE: ['EXPEDIEE', 'ANNULEE'],
  EXPEDIEE: ['LIVREE'],
  LIVREE:   [],
  ANNULEE:  [],
  EN_ATTENTE_PAIEMENT: [],
}

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const id = requireParam(event, 'id')
    const body = await parseBody(event, bodySchema)

    const avant = await prisma.commande.findUniqueOrThrow({ where: { id } })
    const change = body.statut && body.statut !== avant.statut
    if (change && !(SUIVANTS[avant.statut] ?? []).includes(body.statut!)) {
      throw createError({ statusCode: 400, statusMessage: `Passage de ${avant.statut} à ${body.statut} impossible` })
    }

    const commande = await prisma.commande.update({
      where: { id },
      data: {
        ...body,
        ...(change && body.statut === 'EXPEDIEE' ? { dateExpedition: new Date() } : {}),
        ...(change && body.statut === 'LIVREE' ? { dateLivraison: new Date() } : {}),
      },
      include: { client: true },
    })

    if (change && !commande.client.anonymiseLe) {
      const d = { prenom: commande.client.prenom, numero: commande.numero, destinataire: commande.livNom }
      if (body.statut === 'EXPEDIEE') {
        sendExpedition(commande.client.email, { ...d, transporteur: commande.transporteur, numeroSuivi: commande.numeroSuivi })
          .catch(err => console.error('[Email] Expédition non envoyé :', err.message))
      }
      if (body.statut === 'LIVREE') {
        sendLivraison(commande.client.email, d)
          .catch(err => console.error('[Email] Livraison non envoyé :', err.message))
      }
    }

    const { client: _c, ...data } = commande
    return apiSuccess(data, 'Commande mise à jour')
  })
})
