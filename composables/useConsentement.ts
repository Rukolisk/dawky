// composables/useConsentement.ts
// Choix cookies du visiteur (gardés 6 mois). Aujourd'hui, Dawky ne dépose
// aucun cookie de mesure d'audience ni de marketing : ces choix seront lus
// par les scripts correspondants le jour où ils seront ajoutés.
export interface Consentement {
  audience: boolean
  marketing: boolean
  date: string
}

const DUREE_MS = 1000 * 60 * 60 * 24 * 182

export function useConsentement() {
  const choix = useLocalStorage<Consentement | null>('dawky-consentement', null, {
    serializer: { read: v => (v ? JSON.parse(v) : null), write: v => JSON.stringify(v) },
  })

  const aChoisi = computed(() => !!choix.value && Date.now() - new Date(choix.value.date).getTime() < DUREE_MS)

  function enregistrer(audience: boolean, marketing: boolean) {
    choix.value = { audience, marketing, date: new Date().toISOString() }
  }

  return { choix, aChoisi, enregistrer }
}
