// server/utils/livraison.ts
import { createError } from 'h3'
import prisma from './prisma'

export interface AdresseLivraison {
  prenom: string
  nom: string
  ligne1: string
  ligne2: string | null
  codePostal: string
  ville: string
  pays: string
}

export async function getAdresseDuClient(adresseId: string, clientId: string) {
  const adresse = await prisma.adresse.findFirst({ where: { id: adresseId, clientId } })
  if (!adresse) throw createError({ statusCode: 404, statusMessage: 'Adresse de livraison introuvable' })
  return adresse
}

export function adresseUneLigne(a: AdresseLivraison): string {
  return [a.ligne1, a.ligne2, `${a.codePostal} ${a.ville}`, a.pays !== 'France' ? a.pays : null]
    .filter(Boolean).join(', ')
}

/**
 * Champs d'adresse figés sur une commande (l'adresse du client peut
 * changer ensuite sans modifier les commandes passées).
 */
export function snapshotLivraison(
  a: AdresseLivraison,
  mode: 'DOMICILE' | 'POINT_RELAIS' = 'DOMICILE',
  pointRelais?: { id?: string | null; libelle?: string | null },
) {
  return {
    modeLivraison: mode,
    livNom:        `${a.prenom} ${a.nom}`,
    livAdresse:    mode === 'POINT_RELAIS' && pointRelais?.libelle
      ? `Point relais : ${pointRelais.libelle}`
      : [a.ligne1, a.ligne2].filter(Boolean).join(', '),
    livCodePostal: a.codePostal,
    livVille:      a.ville,
    livPays:       a.pays,
    pointRelaisId: mode === 'POINT_RELAIS' ? pointRelais?.id ?? null : null,
  }
}
