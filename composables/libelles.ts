// composables/libelles.ts — statuts lisibles (espace client, back-office)

export const STATUTS_COMMANDE: Record<string, string> = {
  EN_ATTENTE_PAIEMENT: 'Paiement en attente',
  PAYEE: 'Payée',
  PREPAREE: 'En préparation',
  EXPEDIEE: 'Expédiée',
  LIVREE: 'Livrée',
  ANNULEE: 'Annulée',
}

export const STATUTS_ABONNEMENT: Record<string, string> = {
  EN_ATTENTE_PAIEMENT: 'Paiement à finaliser',
  ACTIF: 'Abonnement actif',
  PAUSE: 'En pause',
  IMPAYE: 'Paiement refusé',
  RESILIE: 'Résilié',
  TERMINE: 'Terminé',
  ANNULE: 'Annulé',
}

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

/** "2026-12" → "Décembre" (ou "Décembre 2026" avec l'année) */
export function moisLisible(mois: string | null | undefined, avecAnnee = false): string {
  if (!mois) return ''
  const [annee, m] = mois.split('-')
  const nom = MOIS[Number(m) - 1] ?? ''
  const texte = nom.charAt(0).toUpperCase() + nom.slice(1)
  return avecAnnee ? `${texte} ${annee}` : texte
}
