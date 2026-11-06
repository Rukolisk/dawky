// server/api/produits/index.get.ts
// Catalogue public (US-13)
// GET /api/produits?categorie=JOUET&taille=M&sansAllergenes=poulet,boeuf&traces=true&page=1
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { apiSuccess, parseQuery, queryBool, queryList, withErrorHandling } from '~/server/utils/api'
import { categorieSchema, tailleSchema } from '~/server/utils/schemas'
import { filtreSansAllergenes, produitInclude, serialiserProduit } from '~/server/utils/produits'

const querySchema = z.object({
  categorie:      categorieSchema.optional(),
  taille:         tailleSchema.optional(),
  sansAllergenes: queryList.optional(),
  traces:         queryBool.default(false),
  page:           z.coerce.number().int().min(1).default(1),
  limit:          z.coerce.number().int().min(1).max(50).default(20),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const q = parseQuery(event, querySchema)

    const where = {
      actif: true,
      ...(q.categorie ? { categorie: q.categorie } : {}),
      ...(q.taille ? { tailles: { some: { taille: q.taille } } } : {}),
      ...(await filtreSansAllergenes(q.sansAllergenes ?? [], q.traces)),
    }

    const [total, produits] = await Promise.all([
      prisma.produit.count({ where }),
      prisma.produit.findMany({
        where,
        include: produitInclude,
        orderBy: [{ categorie: 'asc' }, { nom: 'asc' }],
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
    ])

    return apiSuccess({
      produits: produits.map(serialiserProduit),
      pagination: { total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) },
    })
  })
})
