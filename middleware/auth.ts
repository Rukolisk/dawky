// middleware/auth.ts
// Protège les routes nécessitant une connexion
export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn, authLoading } = useAuth()

  // Attendre que l'auth soit initialisée
  if (authLoading.value) return

  if (!isLoggedIn.value) {
    return navigateTo(`/connexion?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
