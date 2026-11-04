// server/api/admin/alertes-allergie/index.get.ts
// Allergies à traiter : contact du client puis validation du profil
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseQuery, withErrorHandling } from '~/server/utils/api'

const querySchema = z.object({
  statut: z.enum(['A_TRAITER', 'CONTACTE', 'VALIDEE']).optional(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const { statut } = parseQuery(event, querySchema)

    const alertes = await prisma.alerteAllergie.findMany({
      where: statut ? { statut } : { statut: { in: ['A_TRAITER', 'CONTACTE'] } },
      include: {
        chien: {
          include: {
            allergenes: { include: { allergene: { select: { nom: true } } } },
            client: { select: { prenom: true, nom: true, email: true, telephone: true } },
          },
        },
        traitePar: { select: { prenom: true } },
      },
      orderBy: { createdAt: 'asc' },
    })
    return apiSuccess(alertes)
  })
})
