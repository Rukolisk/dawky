// server/api/chiens/[id].delete.ts
// Supprime la fiche chien (retrait du consentement RGPD).
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, requireParam, withErrorHandling } from '~/server/utils/api'
import { getChienDuClient } from '~/server/utils/chiens'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const id = requireParam(event, 'id')
    await getChienDuClient(id, client.id)

    const abonnements = await prisma.abonnement.count({ where: { chienId: id } })
    if (abonnements > 0) {
      const enCours = await prisma.abonnement.count({
        where: { chienId: id, statut: { in: ['ACTIF', 'PAUSE', 'IMPAYE', 'RESILIE', 'EN_ATTENTE_PAIEMENT'] } },
      })
      if (enCours > 0) {
        throw createError({ statusCode: 409, statusMessage: 'Ce chien a un abonnement en cours : résiliez-le avant de supprimer sa fiche.' })
      }
      // Historique d'abonnement à conserver : on efface les données du chien
      await prisma.$transaction([
        prisma.chienAllergene.deleteMany({ where: { chienId: id } }),
        prisma.chien.update({
          where: { id },
          data: { nom: 'Supprimé', race: null, dateNaissance: null, comportement: null, allergiesAutres: null, consentementRgpdLe: null },
        }),
      ])
    } else {
      await prisma.chien.delete({ where: { id } })
    }

    return apiSuccess(null, 'Fiche supprimée')
  })
})
