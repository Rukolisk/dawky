// server/api/boxes/[id].get.ts
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID manquant' })

    const box = await prisma.formulaBox.findUnique({ where: { id } })
    if (!box) throw createError({ statusCode: 404, statusMessage: 'Box introuvable' })

    return apiSuccess(box)
  })
})
