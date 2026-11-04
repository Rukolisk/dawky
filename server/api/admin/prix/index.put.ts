// server/api/admin/prix/index.put.ts
// Prix S / M / L d'une formule (US-54). S'applique aux nouvelles
// souscriptions et commandes uniquement : chaque abonnement garde le prix
// figé à sa souscription.
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'

const prixSchema = z.number().int().min(100, 'Prix minimum 1 €')

const bodySchema = z.object({
  formulaId: z.string().min(1),
  prix: z.object({ S: prixSchema, M: prixSchema, L: prixSchema }),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const { formulaId, prix } = await parseBody(event, bodySchema)
    await prisma.formulaBox.findUniqueOrThrow({ where: { id: formulaId } })

    await prisma.$transaction(
      (['S', 'M', 'L'] as const).map(taille => prisma.prixTaille.upsert({
        where: { formulaId_taille: { formulaId, taille } },
        update: { prix: prix[taille] },
        create: { formulaId, taille, prix: prix[taille] },
      })),
    )

    return apiSuccess({ formulaId, prix }, 'Prix mis à jour pour les nouvelles commandes')
  })
})
