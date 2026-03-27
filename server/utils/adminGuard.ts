// server/utils/adminGuard.ts
// Vérifie que la requête vient d'un admin via x-supabase-uid
import { createError, H3Event } from 'h3'
import prisma from './prisma'

export async function requireAdmin(event: H3Event) {
  const uid = getHeader(event, 'x-supabase-uid')
  if (!uid) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })

  const client = await prisma.client.findUnique({
    where: { supabaseUid: uid },
    select: { id: true, role: true },
  })

  if (!client || client.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux administrateurs' })
  }

  return client
}
