// server/api/adresses/[id].delete.ts
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, requireParam, withErrorHandling } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const id = requireParam(event, 'id')

    const adresse = await prisma.adresse.findFirst({ where: { id, clientId: client.id } })
    if (!adresse) throw createError({ statusCode: 404, statusMessage: 'Adresse introuvable' })

    const utilisee = await prisma.abonnement.count({
      where: { adresseId: id, statut: { in: ['ACTIF', 'PAUSE', 'IMPAYE', 'RESILIE', 'EN_ATTENTE_PAIEMENT'] } },
    })
    if (utilisee > 0) {
      throw createError({ statusCode: 409, statusMessage: 'Cette adresse est utilisée par un abonnement : changez d\'abord l\'adresse de l\'abonnement.' })
    }

    await prisma.$transaction(async (tx) => {
      await tx.adresse.delete({ where: { id } })
      if (adresse.parDefaut) {
        const suivante = await tx.adresse.findFirst({ where: { clientId: client.id }, orderBy: { createdAt: 'asc' } })
        if (suivante) await tx.adresse.update({ where: { id: suivante.id }, data: { parDefaut: true } })
      }
    })

    return apiSuccess(null, 'Adresse supprimée')
  })
})
