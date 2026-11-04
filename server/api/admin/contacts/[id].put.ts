// server/api/admin/contacts/[id].put.ts
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseBody, requireParam, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({ lu: z.boolean() })

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const id = requireParam(event, 'id')
    const { lu } = await parseBody(event, bodySchema)
    return apiSuccess(await prisma.contact.update({ where: { id }, data: { lu } }))
  })
})
