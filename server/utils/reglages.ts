// server/utils/reglages.ts
// ─────────────────────────────────────────
// Paramètres métier modifiables depuis le back-office (table `reglages`).
// Chaque clé a une valeur par défaut et un schéma de validation : une
// valeur absente ou invalide en base retombe sur le défaut.
// ─────────────────────────────────────────
import { z } from 'zod'
import prisma from './prisma'

export const REGLAGES = {
  // Seuils de poids (kg) : S ≤ seuilS < M ≤ seuilM < L
  'taille.seuilS':            { schema: z.number().positive(), defaut: 10 },
  'taille.seuilM':            { schema: z.number().positive(), defaut: 25 },
  // Retrait des lots invendus N jours avant leur date limite
  'invendus.delaiRetraitJours': { schema: z.number().int().min(0), defaut: 30 },
  // Compose ta box : prix fixe par box (cf. prix de la formule COMPOSE)
  // pour un nombre d'articles compris entre min et max
  'compose.minArticles':      { schema: z.number().int().min(1), defaut: 5 },
  'compose.maxArticles':      { schema: z.number().int().min(1), defaut: 5 },
  // Livraison offerte par défaut (maquette)
  'livraison.fraisPort':      { schema: z.number().int().min(0), defaut: 0 },         // centimes
  'livraison.fraisPortOffertDes': { schema: z.number().int().min(0), defaut: 4000 }, // centimes
  // Abonnement
  'abonnement.pauseMaxMois':  { schema: z.number().int().min(1).max(6), defaut: 2 },
  'cadeau.dureesMois':        { schema: z.array(z.number().int().min(1).max(24)).min(1), defaut: [3, 6, 12] },
  // Parrainage : réduction (en %) pour le parrain et le filleul
  'parrainage.pourcentage':   { schema: z.number().int().min(1).max(100), defaut: 10 },
} as const

export type CleReglage = keyof typeof REGLAGES
export type Reglages = { [K in CleReglage]: z.infer<(typeof REGLAGES)[K]['schema']> }

export const CLES_REGLAGES = Object.keys(REGLAGES) as CleReglage[]

/**
 * Lit tous les réglages (une requête), avec repli sur les valeurs par défaut.
 */
export async function getReglages(): Promise<Reglages> {
  const rows = await prisma.reglage.findMany()
  const enBase = new Map(rows.map(r => [r.cle, r.valeur]))

  const result = {} as Record<string, unknown>
  for (const cle of CLES_REGLAGES) {
    const def = REGLAGES[cle]
    const parsed = def.schema.safeParse(enBase.get(cle))
    result[cle] = parsed.success ? parsed.data : def.defaut
  }
  return result as Reglages
}
