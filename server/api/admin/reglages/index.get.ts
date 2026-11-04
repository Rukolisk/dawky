// server/api/admin/reglages/index.get.ts
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'
import { getReglages } from '~/server/utils/reglages'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    return apiSuccess(await getReglages())
  })
})
