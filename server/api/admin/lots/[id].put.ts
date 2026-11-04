// server/api/admin/lots/[id].put.ts
// Modification directe d'un lot : quantité (édition en ligne), date limite,
// statut. Si un lot invendu repasse en stock, les alertes sont notifiées.
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseBody, requireParam, withErrorHandling } from '~/server/utils/api'
import { notifierAlertesStock } from '~/server/utils/alertes'

const bodySchema = z.object({
  quantite:   z.number().int().min(0).optional(),
  dateLimite: z.coerce.date().optional().nullable(),
  statut:     z.enum(['DISPONIBLE', 'RETIRE']).optional(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const id = requireParam(event, 'id')
    const body = await parseBody(event, bodySchema)

    const avant = await prisma.lotStock.findUniqueOrThrow({ where: { id } })
    const lot = await prisma.lotStock.update({
      where: { id },
      data: {
        ...body,
        ...(body.statut === 'RETIRE' && avant.statut !== 'RETIRE' ? { retireLe: new Date() } : {}),
        ...(body.statut === 'DISPONIBLE' ? { retireLe: null } : {}),
      },
    })

    const reapprovisionne = lot.moisOrigine && lot.statut === 'DISPONIBLE' && lot.quantite > 0
      && (avant.quantite === 0 || avant.statut !== 'DISPONIBLE')
    if (reapprovisionne) await notifierAlertesStock()

    return apiSuccess(lot, 'Lot mis à jour')
  })
})
