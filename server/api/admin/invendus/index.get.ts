// server/api/admin/invendus/index.get.ts
// Liste tous les produits invendus avec leur stock restant

import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/adminGuard'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)

    const invendus = await prisma.produit.findMany({
      where: { estInvendu: true },
      include: { tailles: { select: { taille: true } } },
      orderBy: [{ moisOrigine: 'desc' }, { nom: 'asc' }],
    })

    // Regrouper par mois d'origine
    const parMois: Record<string, typeof invendus> = {}
    for (const p of invendus) {
      const mois = p.moisOrigine ?? 'inconnu'
      if (!parMois[mois]) parMois[mois] = []
      parMois[mois].push(p)
    }

    const stockTotal = invendus.reduce((sum, p) => sum + p.stock, 0)

    return apiSuccess({ invendus, parMois, stockTotal })
  })
})
