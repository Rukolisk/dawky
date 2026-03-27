// server/utils/api.ts
// ─────────────────────────────────────────
// Helpers partagés pour les routes API
// ─────────────────────────────────────────

import { H3Event, createError } from 'h3'
import { ZodSchema, ZodError } from 'zod'

/**
 * Réponse de succès normalisée
 */
export function apiSuccess<T>(data: T, message?: string) {
  return {
    success: true,
    message: message ?? 'OK',
    data,
  }
}

/**
 * Parse et valide le body avec un schéma Zod.
 * Lance une H3Error 400 si invalide.
 */
export async function parseBody<T>(event: H3Event, schema: ZodSchema<T>): Promise<T> {
  const body = await readBody(event)
  try {
    return schema.parse(body)
  } catch (err) {
    if (err instanceof ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation échouée',
        data: err.flatten().fieldErrors,
      })
    }
    throw err
  }
}

/**
 * Parse les query params avec un schéma Zod.
 */
export function parseQuery<T>(event: H3Event, schema: ZodSchema<T>): T {
  const query = getQuery(event)
  try {
    return schema.parse(query)
  } catch (err) {
    if (err instanceof ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Paramètres invalides',
        data: err.flatten().fieldErrors,
      })
    }
    throw err
  }
}

/**
 * Wrapper pour capturer les erreurs Prisma / inconnues
 */
export async function withErrorHandling<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err: unknown) {
    // Si c'est déjà une H3Error, on la propage
    if (err && typeof err === 'object' && 'statusCode' in err) throw err

    // Erreur Prisma connue
    if (err && typeof err === 'object' && 'code' in err) {
      const prismaErr = err as { code: string; meta?: Record<string, unknown> }
      if (prismaErr.code === 'P2002') {
        throw createError({ statusCode: 409, statusMessage: 'Conflit : cet enregistrement existe déjà.' })
      }
      if (prismaErr.code === 'P2025') {
        throw createError({ statusCode: 404, statusMessage: 'Enregistrement introuvable.' })
      }
    }

    console.error('[API Error]', err)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur interne.' })
  }
}
