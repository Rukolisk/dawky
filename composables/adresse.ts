// composables/adresse.ts — adresse en cours de saisie (commande, cadeau, compte)
import type { Adresse } from './types'

export interface AdresseSaisie {
  prenom: string
  nom: string
  ligne1: string
  ligne2: string
  codePostal: string
  ville: string
  telephone: string
}

export function adresseVide(): AdresseSaisie {
  return { prenom: '', nom: '', ligne1: '', ligne2: '', codePostal: '', ville: '', telephone: '' }
}

export function adresseComplete(a: Pick<AdresseSaisie, 'prenom' | 'nom' | 'ligne1' | 'codePostal' | 'ville'>): boolean {
  return !!(a.prenom && a.nom && a.ligne1.trim().length >= 5 && /^\d{5}$/.test(a.codePostal) && a.ville.trim().length >= 2)
}

export function adresseSurUneLigne(a: Pick<Adresse, 'ligne1' | 'ligne2' | 'codePostal' | 'ville'>): string {
  return [a.ligne1, a.ligne2, `${a.codePostal} ${a.ville}`].filter(Boolean).join(', ')
}

/** Corps de requête pour POST /api/adresses */
export function versApiAdresse(a: AdresseSaisie) {
  return {
    prenom: a.prenom,
    nom: a.nom,
    ligne1: a.ligne1,
    ligne2: a.ligne2 || null,
    codePostal: a.codePostal,
    ville: a.ville,
    telephone: a.telephone || null,
  }
}
