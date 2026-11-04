// server/utils/chiens.ts
// ─────────────────────────────────────────
// Fiche chien : sérialisation, allergènes, notification de l'équipe
// ─────────────────────────────────────────
import { createError } from 'h3'
import type { Prisma } from '@prisma/client'
import prisma from './prisma'
import { ageEnMois, calculerTaille } from './metier'
import { getReglages } from './reglages'
import { sendAlerteAllergieEquipe } from './email'

export const chienInclude = {
  allergenes: { include: { allergene: true } },
} satisfies Prisma.ChienInclude

export type ChienComplet = Prisma.ChienGetPayload<{ include: typeof chienInclude }>

export function aDesAllergies(chien: { allergenes: unknown[]; allergiesAutres: string | null }): boolean {
  return chien.allergenes.length > 0 || !!chien.allergiesAutres?.trim()
}

/**
 * Forme renvoyée au front : âge calculé, allergènes à plat, et taille
 * recalculée pour conseiller un changement si le chien a grandi (F-10).
 */
export async function serialiserChien(chien: ChienComplet) {
  const reglages = await getReglages()
  const tailleConseillee = calculerTaille(
    chien.poids,
    { seuilS: reglages['taille.seuilS'], seuilM: reglages['taille.seuilM'] },
    chien.race,
  )
  return {
    id: chien.id,
    nom: chien.nom,
    race: chien.race,
    dateNaissance: chien.dateNaissance,
    ageMois: chien.dateNaissance ? ageEnMois(chien.dateNaissance) : null,
    poids: chien.poids,
    taille: chien.taille,
    tailleConseillee,
    changementTailleConseille: tailleConseillee !== chien.taille,
    niveauActivite: chien.niveauActivite,
    estMacheur: chien.estMacheur,
    comportement: chien.comportement,
    sensibleTraces: chien.sensibleTraces,
    allergenes: chien.allergenes.map(a => ({ code: a.allergene.code, nom: a.allergene.nom })),
    allergiesAutres: chien.allergiesAutres,
    consentementRgpdLe: chien.consentementRgpdLe,
    profilAllergieValide: chien.profilAllergieValide,
  }
}

/**
 * Convertit des codes d'allergènes ("poulet") en ids. 400 si un code
 * est inconnu, pour ne jamais ignorer silencieusement une allergie.
 */
export async function idsAllergenes(codes: string[]): Promise<string[]> {
  if (codes.length === 0) return []
  const uniques = [...new Set(codes.map(c => c.trim().toLowerCase()))]
  const allergenes = await prisma.allergene.findMany({ where: { code: { in: uniques } } })
  if (allergenes.length !== uniques.length) {
    const connus = new Set(allergenes.map(a => a.code))
    const inconnus = uniques.filter(c => !connus.has(c))
    throw createError({ statusCode: 400, statusMessage: `Allergène(s) inconnu(s) : ${inconnus.join(', ')}` })
  }
  return allergenes.map(a => a.id)
}

/**
 * Charge un chien appartenant au client (404 sinon).
 */
export async function getChienDuClient(chienId: string, clientId: string): Promise<ChienComplet> {
  const chien = await prisma.chien.findFirst({ where: { id: chienId, clientId }, include: chienInclude })
  if (!chien) throw createError({ statusCode: 404, statusMessage: 'Chien introuvable' })
  return chien
}

/**
 * Prévient l'équipe qu'un chien abonné a des allergies, si aucune alerte
 * n'est déjà en cours et que son profil n'a pas déjà été validé.
 */
export async function notifierAllergieSiBesoin(
  chien: ChienComplet,
  client: { prenom: string; nom: string; email: string; telephone: string | null },
) {
  if (!aDesAllergies(chien) || chien.profilAllergieValide) return

  const enCours = await prisma.alerteAllergie.findFirst({
    where: { chienId: chien.id, statut: { in: ['A_TRAITER', 'CONTACTE'] } },
  })
  if (enCours) return

  await prisma.alerteAllergie.create({ data: { chienId: chien.id } })
  sendAlerteAllergieEquipe({
    client,
    chien: { nom: chien.nom, taille: chien.taille, race: chien.race },
    allergenes: chien.allergenes.map(a => a.allergene.nom),
    allergiesAutres: chien.allergiesAutres,
    sensibleTraces: chien.sensibleTraces,
  }).catch(err => console.error('[Email] Alerte allergie non envoyée :', err.message))
}
