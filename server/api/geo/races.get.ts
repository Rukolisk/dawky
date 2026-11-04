// server/api/geo/races.get.ts
// Autocomplétion des races de chiens
// GET /api/geo/races?q=lab

import { z } from 'zod'
import { rechercherRaces } from '~/server/utils/races'
import { parseQuery, withErrorHandling } from '~/server/utils/api'

const querySchema = z.object({
  q: z.string().default(''),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { q } = parseQuery(event, querySchema)
    return rechercherRaces(q)
  })
})
