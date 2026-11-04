// plugins/02.auth.client.ts
// Restaure la session avant la première navigation (cf. useAuth)
export default defineNuxtPlugin(async () => {
  await useAuth().init()
})
