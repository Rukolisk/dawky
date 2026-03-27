// composables/useApi.ts
// ─────────────────────────────────────────
// Types et helpers API Dawky
// ─────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ProduitTaille {
  taille: 'XS' | 'S' | 'M' | 'L'
}

export interface Produit {
  id: string
  nom: string
  description: string
  emoji: string
  categorie: 'MASTICATION' | 'NUTRITION' | 'JOUET' | 'SOIN' | 'ACCESSOIRE'
  tailles: ProduitTaille[]
  stock: number
  estInvendu?: boolean
}

// FormulaBox n'a plus de champ taille depuis le refactoring "prix unique"
export interface FormulaBox {
  id: string
  nom: string
  description: string
  type: 'SURPRISE' | 'CARTE'
  prix: number
  slots: number
  actif: boolean
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Produits ───
export function useProduits(params?: Ref<Record<string, string | undefined>>) {
  return useFetch<ApiResponse<{ produits: Produit[]; pagination: Pagination }>>(
    '/api/produits',
    {
      query: params,
      default: () => ({
        success: false, message: '',
        data: { produits: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } },
      }),
    },
  )
}

export function useProduit(id: string) {
  return useFetch<ApiResponse<Produit>>(`/api/produits/${id}`)
}

// ─── Boxes ───
export function useBoxes(params?: Ref<Record<string, string | undefined>>) {
  return useFetch<ApiResponse<FormulaBox[]>>('/api/boxes', {
    query: params,
    default: () => ({ success: false, message: '', data: [] }),
  })
}

export function useBox(id: string) {
  return useFetch<ApiResponse<FormulaBox>>(`/api/boxes/${id}`)
}

// ─── Abonnement (Box Surprise uniquement — récurrent mensuel) ───
export async function submitAbonnement(payload: {
  prenom: string; nom: string; email: string; telephone?: string
  adresse: string; ville: string; codePostal: string; pays?: string
  taille: 'XS' | 'S' | 'M' | 'L'; clientId?: string
}) {
  return $fetch<ApiResponse<{ abonnement: object; formula: object }>>('/api/abonnements', {
    method: 'POST',
    body: payload,
  })
}

// ─── Commande ponctuelle (Box À la Carte — achat unique) ───
export async function submitCommande(payload: {
  prenom: string; nom: string; email: string; telephone?: string
  adresse: string; ville: string; codePostal: string; pays?: string
  taille: 'XS' | 'S' | 'M' | 'L'
  selectionProduitIds: string[]
  clientId?: string
}) {
  return $fetch<ApiResponse<{ commande: object }>>('/api/commandes', {
    method: 'POST',
    body: payload,
  })
}

// ─── Contact ───
export async function submitContact(payload: Record<string, unknown>) {
  return $fetch<ApiResponse<{ id: string }>>('/api/contact', {
    method: 'POST',
    body: payload,
  })
}
