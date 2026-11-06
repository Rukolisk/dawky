// server/utils/api.ts
// ─────────────────────────────────────────
// Helpers partagés pour les routes API
// ─────────────────────────────────────────
import { H3Event, createError, readBody, getQuery, getRouterParam } from 'h3'
import { z, ZodError } from 'zod'

// Messages de validation par défaut en français (champ manquant, type…)
z.config(z.locales.fr())

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
export async function parseBody<S extends z.ZodType>(event: H3Event, schema: S): Promise<z.output<S>> {
  const body = await readBody(event)
  try {
    return schema.parse(body)
  } catch (err) {
    if (err instanceof ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation échouée',
        data: z.flattenError(err).fieldErrors,
      })
    }
    throw err
  }
}

/**
 * Parse les query params avec un schéma Zod.
 */
export function parseQuery<S extends z.ZodType>(event: H3Event, schema: S): z.output<S> {
  const query = getQuery(event)
  try {
    return schema.parse(query)
  } catch (err) {
    if (err instanceof ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Paramètres invalides',
        data: z.flattenError(err).fieldErrors,
      })
    }
    throw err
  }
}

/**
 * Paramètre de route obligatoire (ex: :id). 400 s'il est absent.
 */
export function requireParam(event: H3Event, name: string): string {
  const value = getRouterParam(event, name)
  if (!value) throw createError({ statusCode: 400, statusMessage: `Paramètre "${name}" manquant` })
  return value
}

/**
 * Booléen de query string. `z.coerce.boolean()` transforme "false" en true
 * (toute chaîne non vide est truthy), on accepte donc explicitement
 * "true"/"1" et "false"/"0".
 */
export const queryBool = z
  .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
  .transform(v => v === true || v === 'true' || v === '1')

/**
 * Liste séparée par des virgules dans la query string ("poulet,boeuf").
 */
export const queryList = z
  .string()
  .transform(v => v.split(',').map(s => s.trim()).filter(Boolean))

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
      if (prismaErr.code === 'P2003') {
        throw createError({ statusCode: 400, statusMessage: 'Référence invalide : un élément lié est introuvable.' })
      }
    }

    console.error('[API Error]', err)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur interne.' })
  }
}
