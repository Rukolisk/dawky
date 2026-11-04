// plugins/api.client.ts
// ─────────────────────────────────────────
// DAWKY — Injecte automatiquement le token Supabase dans tous les
// appels `$fetch`/`useFetch` vers /api/**.
//
// Sans ce plugin, AUCUN appel du front n'envoyait le moindre header
// d'authentification : toutes les routes protégées (profil, admin…)
// répondaient 401/403 même pour un utilisateur connecté. C'est le
// pendant obligatoire de la vérification JWT ajoutée côté serveur
// (server/utils/auth.ts).
// ─────────────────────────────────────────
import { getSupabase } from '~/composables/useAuth'

export default defineNuxtPlugin(() => {
  const authedFetch = $fetch.create({
    async onRequest({ request, options }) {
      // On ne touche qu'aux appels vers notre propre API
      const url = typeof request === 'string' ? request : request.url
      if (!url.startsWith('/api/')) return

      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.access_token) {
        options.headers = new Headers(options.headers)
        options.headers.set('Authorization', `Bearer ${session.access_token}`)
      }
    },
  })

  // Remplace l'instance globale utilisée par tous les $fetch(...) auto-importés
  // (pages, composables) sans avoir à modifier chaque appel existant.
  globalThis.$fetch = authedFetch as typeof $fetch
})
