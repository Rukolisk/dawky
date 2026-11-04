// composables/useCompose.ts
// Sélection en cours dans Compose ta box (gardée pendant la session,
// jusqu'au paiement).
import type { Allergene, Categorie, Taille } from './types'

export interface ProduitPublic {
  id: string
  nom: string
  description: string
  emoji: string
  imageUrl: string | null
  categorie: Categorie
  ingredients: string | null
  tailles: Taille[]
  allergenes: Allergene[]
  traces: Allergene[]
}

export interface LotCompose {
  lotId: string
  quantiteDisponible: number
  moisOrigine: string
  dateLimite: string | null
  produit: ProduitPublic
  compatibleChien: boolean | null
}

export interface SelectionCompose {
  taille: Taille | null
  chienId: string | null
  sansAllergenes: string[]
  traces: boolean
  lots: Array<Pick<LotCompose, 'lotId'> & { nom: string; allergenes: string[]; traces: string[] }>
}

export function useCompose() {
  const selection = useSessionStorage<SelectionCompose>('dawky-compose', {
    taille: null,
    chienId: null,
    sansAllergenes: [],
    traces: false,
    lots: [],
  }, { mergeDefaults: true })

  function vider() {
    selection.value.lots = []
  }

  return { selection, vider }
}
