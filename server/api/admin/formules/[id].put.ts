// server/api/admin/formules/[id].put.ts
// Modification d'une formule (textes, contenu prévu, fenêtre de vente,
// stock). Les prix se modifient via /api/admin/prix.
import { Prisma } from '@prisma/client'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseBody, requireParam, withErrorHandling } from '~/server/utils/api'
import { formuleChampsSchema } from '~/server/utils/admin-formules'

const bodySchema = formuleChampsSchema.extend({
  actif: formuleChampsSchema.shape.actif.removeDefault(),
}).partial()

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const id = requireParam(event, 'id')
    const { contenu, ...data } = await parseBody(event, bodySchema)

    const formule = await prisma.formulaBox.update({
      where: { id },
      data: {
        ...data,
        ...(contenu !== undefined ? { contenu: contenu ?? Prisma.JsonNull } : {}),
      },
      include: { prix: true },
    })
    return apiSuccess(formule, 'Formule mise à jour')
  })
})
