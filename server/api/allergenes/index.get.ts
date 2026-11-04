// server/api/allergenes/index.get.ts
// Liste des allergènes courants (quiz, fiche chien, filtres)
import prisma from '~/server/utils/prisma'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'

export default defineEventHandler(async () => {
  return withErrorHandling(async () => {
    const allergenes = await prisma.allergene.findMany({ orderBy: { nom: 'asc' }, select: { code: true, nom: true } })
    return apiSuccess(allergenes)
  })
})
