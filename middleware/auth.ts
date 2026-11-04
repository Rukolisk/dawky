// middleware/auth.ts — pages réservées aux clients connectés
// (la session est restaurée avant la navigation par 02.auth.client.ts)
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  const { isLoggedIn, profilManquant } = useAuth()
  if (!isLoggedIn.value) {
    return navigateTo({ path: '/connexion', query: { redirect: to.fullPath } })
  }
  // Connecté mais sans profil Dawky : il faut d'abord le compléter
  if (profilManquant.value) {
    return navigateTo({ path: '/inscription', query: { completer: '1', redirect: to.fullPath } })
  }
})
