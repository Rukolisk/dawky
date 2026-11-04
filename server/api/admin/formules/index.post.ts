// server/api/admin/formules/index.post.ts
// Création d'une box saisonnière (Surprise et Compose ta box sont uniques
// et créées par le seed)
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'
import { formuleChampsSchema } from '~/server/utils/admin-formules'

const prixSchema = z.number().int().min(100)
const bodySchema = formuleChampsSchema.extend({
  dateDebutVente: z.coerce.date(),
  prix: z.object({ S: prixSchema, M: prixSchema, L: prixSchema }),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const { prix, contenu, ...data } = await parseBody(event, bodySchema)
    if (data.dateFinVente && data.dateFinVente <= data.dateDebutVente) {
      throw createError({ statusCode: 400, statusMessage: 'La fin de vente doit suivre le début' })
    }

    const formule = await prisma.formulaBox.create({
      data: {
        ...data,
        type: 'SAISONNIERE',
        contenu: contenu ?? undefined,
        prix: { create: (['S', 'M', 'L'] as const).map(taille => ({ taille, prix: prix[taille] })) },
      },
      include: { prix: true },
    })
    return apiSuccess(formule, 'Box saisonnière créée')
  })
})
