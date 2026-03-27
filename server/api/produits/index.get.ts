// server/api/produits/index.get.ts
// GET /api/produits?categorie=JOUET&taille=M&page=1&limit=20
//
// Par défaut : retourne les produits du catalogue normal (estInvendu = false)
// Avec ?invendus=true : retourne uniquement les invendus (pour Box À la Carte)

import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { apiSuccess, parseQuery, withErrorHandling } from '~/server/utils/api'

const querySchema = z.object({
  categorie: z
    .enum(['MASTICATION', 'NUTRITION', 'JOUET', 'SOIN', 'ACCESSOIRE'])
    .optional(),
  taille:    z.enum(['XS', 'S', 'M', 'L']).optional(),
  // false (défaut) = catalogue normal | true = invendus disponibles en À la Carte
  invendus:  z.coerce.boolean().default(false),
  page:      z.coerce.number().min(1).default(1),
  limit:     z.coerce.number().min(1).max(50).default(20),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { categorie, taille, invendus, page, limit } = parseQuery(event, querySchema)

    const where = {
      actif:      true,
      // Catalogue normal : exclure les invendus
      // Catalogue À la Carte avec invendus : inclure seulement les invendus
      estInvendu: invendus ? true : false,
      // Stock > 0 pour les invendus (sinon inutile de les proposer)
      ...(invendus ? { stock: { gt: 0 } } : {}),
      ...(categorie ? { categorie } : {}),
      ...(taille ? { tailles: { some: { taille } } } : {}),
    }

    const [total, produits] = await Promise.all([
      prisma.produit.count({ where }),
      prisma.produit.findMany({
        where,
        orderBy: invendus
          ? [{ moisOrigine: 'desc' }, { nom: 'asc' }]
          : [{ categorie: 'asc' }, { nom: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          nom: true,
          description: true,
          emoji: true,
          categorie: true,
          stock: true,
          estInvendu: true,
          moisOrigine: true,
          tailles: { select: { taille: true } },
        },
      }),
    ])

    return apiSuccess({
      produits,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  })
})
