// middleware/admin.ts — back-office : rôle ADMIN + double authentification
// (l'API revérifie les deux : ce middleware ne fait que guider l'admin)
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const { isLoggedIn, isAdmin, etatMfa } = useAuth()
  if (!isLoggedIn.value) {
    return navigateTo({ path: '/connexion', query: { redirect: to.fullPath } })
  }
  if (!isAdmin.value) return navigateTo('/mon-compte')

  // Code de double authentification pas encore validé dans cette session
  const { niveau } = await etatMfa()
  if (niveau !== 'aal2') {
    return navigateTo({ path: '/securite-admin', query: { redirect: to.fullPath } })
  }
})
