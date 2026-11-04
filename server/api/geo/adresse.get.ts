// server/api/geo/adresse.get.ts
// Proxy vers l'API adresse officielle française (data.gouv.fr)
// GET /api/geo/adresse?q=12+rue+de+la+paix&limit=5

import { z } from 'zod'
import { createError } from 'h3'
import { parseQuery, withErrorHandling } from '~/server/utils/api'

const querySchema = z.object({
  q:     z.string().min(3),
  limit: z.coerce.number().min(1).max(10).default(5),
  type:  z.enum(['housenumber', 'street', 'locality', 'municipality']).optional(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { q, limit, type } = parseQuery(event, querySchema)

    const params = new URLSearchParams({ q, limit: String(limit) })
    if (type) params.set('type', type)

    const res = await $fetch<{
      features: Array<{
        properties: {
          label: string
          name: string
          postcode: string
          city: string
          citycode: string
          type: string
          score: number
        }
        geometry: { coordinates: [number, number] }
      }>
    }>(`https://api-adresse.data.gouv.fr/search/?${params.toString()}`, { timeout: 4000 })
      .catch(() => {
        throw createError({ statusCode: 502, statusMessage: 'Service d\'adresses indisponible, saisissez votre adresse manuellement' })
      })

    return res.features.map(f => ({
      label:      f.properties.label,
      nom:        f.properties.name,
      codePostal: f.properties.postcode,
      ville:      f.properties.city,
      citycode:   f.properties.citycode,
      type:       f.properties.type,
      score:      f.properties.score,
      lat:        f.geometry.coordinates[1],
      lng:        f.geometry.coordinates[0],
    }))
  })
})
