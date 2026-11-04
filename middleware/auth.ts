// middleware/auth.ts — pages réservées aux clients connectés
// (la session est restaurée avant la navigation par 02.auth.client.ts)
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  const { isLoggedIn } = useAuth()
  if (!isLoggedIn.value) {
    return navigateTo({ path: '/connexion', query: { redirect: to.fullPath } })
  }
})
