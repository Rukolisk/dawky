// middleware/admin.ts
// Protège les routes /admin
export default defineNuxtRouteMiddleware(() => {
  const { isAdmin, isLoggedIn } = useAuth()

  if (!isLoggedIn.value) {
    return navigateTo('/connexion?redirect=/admin')
  }
  if (!isAdmin.value) {
    return navigateTo('/')
  }
})
