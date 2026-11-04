// plugins/03.parrainage.client.ts
// Lien de parrainage (https://dawky.fr/?parrain=CODE) : le code est gardé
// pour être appliqué automatiquement à l'inscription (US-31).
export const CLE_PARRAIN = 'dawky-parrain'

export default defineNuxtPlugin(() => {
  const code = useRoute().query.parrain
  if (typeof code === 'string' && /^[A-Za-z0-9_-]{3,30}$/.test(code)) {
    localStorage.setItem(CLE_PARRAIN, code.toUpperCase())
  }
})
