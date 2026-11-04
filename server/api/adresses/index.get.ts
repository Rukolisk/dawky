// server/api/adresses/index.get.ts
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const adresses = await prisma.adresse.findMany({
      where: { clientId: client.id },
      orderBy: [{ parDefaut: 'desc' }, { createdAt: 'asc' }],
    })
    return apiSuccess(adresses)
  })
})
