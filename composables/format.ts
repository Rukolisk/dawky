// composables/format.ts
// Mise en forme partagée (prix en centimes, dates, libellés)
import type { Categorie, NiveauActivite, Taille } from './types'

export function formatPrix(centimes: number | null | undefined): string {
  if (centimes === null || centimes === undefined) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(centimes / 100)
}

export function dateLongue(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** "1er décembre" / "15 décembre" */
export function jourMois(date: string | Date): string {
  const d = new Date(date)
  const jour = d.getDate() === 1 ? '1er' : String(d.getDate())
  return `${jour} ${d.toLocaleDateString('fr-FR', { month: 'long' })}`
}

export function ageLisible(ageMois: number | null | undefined): string | null {
  if (ageMois === null || ageMois === undefined) return null
  if (ageMois < 12) return `${ageMois} mois`
  const ans = Math.floor(ageMois / 12)
  return `${ans} an${ans > 1 ? 's' : ''}`
}

export const LIBELLES_CATEGORIE: Record<Categorie, string> = {
  FRIANDISE: 'Friandise',
  MASTICATION: 'Mastication',
  JOUET: 'Jouet',
  ACCESSOIRE: 'Accessoire',
}

export const LIBELLES_ACTIVITE: Record<NiveauActivite, string> = {
  FAIBLE: 'Plutôt calme',
  MODERE: 'Joueur',
  ELEVE: 'Très sportif',
}

// Textes des 3 tailles (accueil, formules, résultat du quiz)
export const INFOS_TAILLES: Array<{
  taille: Taille
  poids: string
  races: string
  contenu: string
  // Description de chaque catégorie pour cette taille
  categories: Record<Categorie, string>
}> = [
  {
    taille: 'S',
    poids: 'Moins de 10 kg',
    races: 'Chihuahua, bichon, teckel',
    contenu: 'Jouets et friandises petit gabarit',
    categories: {
      FRIANDISE: 'Bouchées pour petites gueules',
      MASTICATION: 'Format adapté aux petites mâchoires',
      JOUET: 'Taille et poids pensés pour lui',
      ACCESSOIRE: 'Et sa carte collector du mois',
    },
  },
  {
    taille: 'M',
    poids: 'De 10 à 25 kg',
    races: 'Beagle, cocker, border collie',
    contenu: 'Jouets et friandises moyen gabarit',
    categories: {
      FRIANDISE: 'Adaptée à son gabarit',
      MASTICATION: 'Pour les mâchoires moyennes',
      JOUET: 'Robuste, pour jouer longtemps',
      ACCESSOIRE: 'Et sa carte collector du mois',
    },
  },
  {
    taille: 'L',
    poids: 'Plus de 25 kg',
    races: 'Golden retriever, labrador, husky',
    contenu: 'Jouets pensés pour gros mâcheurs',
    categories: {
      FRIANDISE: 'Adaptée à son gabarit',
      MASTICATION: 'Pour les grosses mâchoires',
      JOUET: 'Pensé pour gros mâcheurs',
      ACCESSOIRE: 'Et sa carte collector du mois',
    },
  },
]
