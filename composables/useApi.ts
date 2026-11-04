// composables/useApi.ts
// ─────────────────────────────────────────
// Appels à l'API Dawky. Les réponses sont de la forme
// { success, message, data } : `api()` renvoie directement `data`.
// Les erreurs deviennent des `ApiError` avec un message en français
// prêt à afficher (et le détail par champ pour les formulaires).
// ─────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: Record<string, unknown>,
  ) {
    super(message)
  }
}

type Options = Parameters<typeof $fetch>[1]

export async function api<T>(url: string, options?: Options): Promise<T> {
  try {
    const res = await $fetch<{ data: T }>(url, options)
    return res.data
  } catch (err) {
    throw versApiError(err)
  }
}

export function versApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err
  const e = err as { statusCode?: number; data?: { statusMessage?: string; message?: string; data?: Record<string, unknown> } }
  const statusCode = e.statusCode ?? 0
  const message = e.data?.statusMessage || e.data?.message
    || (statusCode === 0 ? 'Connexion impossible. Vérifiez votre réseau.' : 'Une erreur est survenue. Réessayez dans un instant.')
  return new ApiError(message, statusCode, e.data?.data)
}

/**
 * Message de la 1re erreur de validation d'un champ (ou undefined).
 */
export function erreurChamp(err: ApiError | null, champ: string): string | undefined {
  const valeur = err?.details?.[champ]
  return Array.isArray(valeur) ? String(valeur[0]) : undefined
}
