// server/api/admin/alertes-allergie/[id].put.ts
// A_TRAITER → CONTACTE → VALIDEE. La validation marque le profil du
// chien comme "sans allergènes validé" (requis avant expédition).
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseBody, requireParam, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({
  statut: z.enum(['A_TRAITER', 'CONTACTE', 'VALIDEE']),
  note:   z.string().trim().max(2000).optional(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const admin = await requireAdmin(event)
    const id = requireParam(event, 'id')
    const body = await parseBody(event, bodySchema)

    const alerte = await prisma.$transaction(async (tx) => {
      const a = await tx.alerteAllergie.update({
        where: { id },
        data: { ...body, traiteParId: admin.id, traiteLe: new Date() },
      })
      await tx.chien.update({ where: { id: a.chienId }, data: { profilAllergieValide: body.statut === 'VALIDEE' } })
      return a
    })

    return apiSuccess(alerte, 'Alerte mise à jour')
  })
})
