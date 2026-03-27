// server/api/boxes/index.get.ts
// GET /api/boxes?type=SURPRISE
// FormulaBox n'a plus de champ taille (supprimé dans le nouveau schema)

import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { apiSuccess, parseQuery, withErrorHandling } from '~/server/utils/api'

const querySchema = z.object({
  type: z.enum(['SURPRISE', 'CARTE']).optional(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { type } = parseQuery(event, querySchema)

    const boxes = await prisma.formulaBox.findMany({
      where: {
        actif: true,
        ...(type ? { type } : {}),
      },
      orderBy: { type: 'asc' },
    })

    return apiSuccess(boxes)
  })
})
