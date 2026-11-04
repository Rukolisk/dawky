// middleware/admin.ts — back-office (le rôle est revérifié par l'API)
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  const { isLoggedIn, isAdmin } = useAuth()
  if (!isLoggedIn.value) {
    return navigateTo({ path: '/connexion', query: { redirect: to.fullPath } })
  }
  if (!isAdmin.value) return navigateTo('/mon-compte')
})
