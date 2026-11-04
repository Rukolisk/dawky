// server/api/admin/contacts/index.get.ts
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseQuery, queryBool, withErrorHandling } from '~/server/utils/api'

const querySchema = z.object({ lu: queryBool.optional() })

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const { lu } = parseQuery(event, querySchema)
    const messages = await prisma.contact.findMany({
      where: lu !== undefined ? { lu } : {},
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
    return apiSuccess(messages)
  })
})
