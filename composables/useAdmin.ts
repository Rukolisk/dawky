// composables/useAdmin.ts — petit utilitaire des pages du back-office :
// exécute une action, affiche le succès ou l'erreur, gère l'état d'envoi.
export function useActionAdmin() {
  const toast = useToast()
  const envoi = ref(false)

  async function executer<T>(fn: () => Promise<T>, succes?: string): Promise<T | null> {
    envoi.value = true
    try {
      const r = await fn()
      if (succes) toast.success(succes)
      return r
    } catch (err) {
      toast.error(versApiError(err).message)
      return null
    } finally {
      envoi.value = false
    }
  }

  return { envoi, executer }
}

/** "YYYY-MM" du mois prochain (mois des prochaines box) */
export function moisProchain(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
