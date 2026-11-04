// server/utils/metier.ts
// ─────────────────────────────────────────
// Règles métier pures (sans accès BDD) : taille, recommandation,
// compatibilité allergènes, remises, dates. Testées unitairement.
// ─────────────────────────────────────────
import { gabaritRace } from './races'

export const TAILLES = ['S', 'M', 'L'] as const
export type TailleBox = (typeof TAILLES)[number]

export const CATEGORIES = ['FRIANDISE', 'MASTICATION', 'JOUET', 'ACCESSOIRE'] as const
export type CategorieProduit = (typeof CATEGORIES)[number]

// Catégories alimentaires : composition et allergènes obligatoires
export const CATEGORIES_ALIMENTAIRES: readonly CategorieProduit[] = ['FRIANDISE', 'MASTICATION']

export interface SeuilsTaille { seuilS: number; seuilM: number }

/**
 * Taille de box selon le poids, ajustée par la race si elle est connue.
 *
 * Le poids reste le critère principal. La race sert de garde-fou pour les
 * chiens encore en croissance ou dont le poids est en bordure de seuil :
 * on ne descend jamais sous le gabarit adulte de la race, et un chiot
 * de grande race reçoit d'emblée des jouets adaptés à sa future mâchoire.
 */
export function calculerTaille(poids: number, seuils: SeuilsTaille, race?: string | null): TailleBox {
  let taille: TailleBox = poids <= seuils.seuilS ? 'S' : poids <= seuils.seuilM ? 'M' : 'L'
  const gabarit = race ? gabaritRace(race) : null
  if (gabarit && TAILLES.indexOf(gabarit) > TAILLES.indexOf(taille)) taille = gabarit
  return taille
}

export type FormuleRecommandee = 'SURPRISE' | 'COMPOSE'

/**
 * Formule conseillée par le quiz. Le choix final reste au client.
 *   - allergies → Compose ta box (le client contrôle chaque produit)
 *   - gros mâcheur très actif → Compose ta box (choix des produits robustes)
 *   - sinon → Box Surprise
 */
export function recommanderFormule(d: {
  aDesAllergies: boolean
  estMacheur: boolean
  niveauActivite: 'FAIBLE' | 'MODERE' | 'ELEVE'
}): FormuleRecommandee {
  if (d.aDesAllergies) return 'COMPOSE'
  if (d.estMacheur && d.niveauActivite === 'ELEVE') return 'COMPOSE'
  return 'SURPRISE'
}

/**
 * Âge en mois révolus à une date donnée.
 */
export function ageEnMois(dateNaissance: Date, aLaDate = new Date()): number {
  let mois = (aLaDate.getFullYear() - dateNaissance.getFullYear()) * 12
    + (aLaDate.getMonth() - dateNaissance.getMonth())
  if (aLaDate.getDate() < dateNaissance.getDate()) mois -= 1
  return Math.max(0, mois)
}

/**
 * Date de naissance approximative à partir d'un âge en mois (quiz).
 */
export function dateNaissanceDepuisAge(ageMois: number, aLaDate = new Date()): Date {
  const d = new Date(aLaDate.getFullYear(), aLaDate.getMonth(), 1)
  d.setMonth(d.getMonth() - ageMois)
  return d
}

export interface AllergeneProduit { allergeneId: string; presence: 'CONTIENT' | 'TRACES' }

/**
 * Allergènes d'un produit qui posent problème pour un chien.
 * Les traces ne comptent que si le chien est déclaré "sensible aux traces".
 */
export function allergenesEnConflit(
  produit: AllergeneProduit[],
  allergenesChien: string[],
  sensibleTraces: boolean,
): string[] {
  const chien = new Set(allergenesChien)
  return produit
    .filter(a => chien.has(a.allergeneId) && (a.presence === 'CONTIENT' || sensibleTraces))
    .map(a => a.allergeneId)
}

export interface Reduction { type: 'POURCENTAGE' | 'MONTANT'; valeur: number }

/**
 * Montant de la remise (centimes) appliquée à un montant de base,
 * jamais supérieur à la base.
 */
export function calculerRemise(base: number, reduction: Reduction | null | undefined): number {
  if (!reduction || base <= 0) return 0
  const remise = reduction.type === 'POURCENTAGE'
    ? Math.round(base * reduction.valeur / 100)
    : reduction.valeur
  return Math.min(Math.max(0, remise), base)
}

/**
 * Frais de port Compose ta box / box saisonnière.
 */
export function calculerFraisPort(sousTotal: number, fraisPort: number, offertDes: number): number {
  return offertDes > 0 && sousTotal >= offertDes ? 0 : fraisPort
}

/**
 * "YYYY-MM" du mois contenant la date.
 */
export function moisDe(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/**
 * 1er jour (00:00) du mois "YYYY-MM".
 */
export function premierJourDuMois(mois: string): Date {
  const [annee = 0, m = 1] = mois.split('-').map(Number)
  return new Date(annee, m - 1, 1)
}

/**
 * Date de la prochaine expédition de box (le 1er du mois suivant).
 */
export function prochaineExpedition(aLaDate = new Date()): Date {
  return new Date(aLaDate.getFullYear(), aLaDate.getMonth() + 1, 1)
}

/**
 * Ajoute N mois à une date en restant en fin de mois si besoin
 * (31 janvier + 1 mois = 28/29 février, pas 3 mars).
 */
export function ajouterMois(date: Date, n: number): Date {
  const d = new Date(date)
  const jour = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + n)
  const dernierJour = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(jour, dernierJour))
  return d
}

/**
 * Formate un montant en centimes en euros ("27,90 €").
 */
export function formatPrix(centimes: number): string {
  return `${(centimes / 100).toFixed(2).replace('.', ',')} €`
}
