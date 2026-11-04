// server/api/admin/produits/index.get.ts
// Tous les produits (actifs et désactivés) avec stock courant / invendu
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseQuery, queryBool, withErrorHandling } from '~/server/utils/api'
import { categorieSchema } from '~/server/utils/schemas'
import { adminProduitInclude } from '~/server/utils/admin-produits'

const querySchema = z.object({
  categorie: categorieSchema.optional(),
  actif:     queryBool.optional(),
  // "normal" : produits avec stock courant ; "invendu" : avec lots invendus
  type:      z.enum(['normal', 'invendu']).optional(),
  q:         z.string().trim().optional(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const q = parseQuery(event, querySchema)

    const produits = await prisma.produit.findMany({
      where: {
        ...(q.categorie ? { categorie: q.categorie } : {}),
        ...(q.actif !== undefined ? { actif: q.actif } : {}),
        ...(q.q ? { nom: { contains: q.q, mode: 'insensitive' as const } } : {}),
        ...(q.type === 'invendu'
          ? { lots: { some: { statut: 'DISPONIBLE', moisOrigine: { not: null }, quantite: { gt: 0 } } } }
          : {}),
      },
      include: adminProduitInclude,
      orderBy: [{ categorie: 'asc' }, { nom: 'asc' }],
    })

    return apiSuccess(produits.map(p => ({
      ...p,
      tailles: p.tailles.map(t => t.taille),
      allergenes: p.allergenes.map(a => ({ code: a.allergene.code, nom: a.allergene.nom, presence: a.presence })),
      stockCourant: p.lots.filter(l => !l.moisOrigine).reduce((s, l) => s + l.quantite, 0),
      stockInvendu: p.lots.filter(l => l.moisOrigine).reduce((s, l) => s + l.quantite, 0),
    })))
  })
})
