// server/utils/alertes.ts
import prisma from './prisma'
import { getReglages } from './reglages'
import { filtreLotsVendables } from './stock'
import { TAILLES } from './metier'
import { sendAlerteStock } from './email'

/**
 * Prévient les clients en attente (US-52) pour chaque taille ayant de
 * nouveau des produits dans Compose ta box. Une alerte n'est envoyée
 * qu'une fois ; le client la réarme depuis le site.
 */
export async function notifierAlertesStock() {
  const { 'invendus.delaiRetraitJours': delai } = await getReglages()

  for (const taille of TAILLES) {
    const disponible = await prisma.lotStock.count({
      where: { ...filtreLotsVendables(delai), produit: { actif: true, tailles: { some: { taille } } } },
    })
    if (disponible === 0) continue

    const alertes = await prisma.alerteStock.findMany({
      where: { taille, notifieeLe: null },
      include: { client: { select: { email: true, prenom: true, anonymiseLe: true } } },
    })
    for (const alerte of alertes) {
      if (alerte.client.anonymiseLe) continue
      try {
        await sendAlerteStock(alerte.client.email, alerte.client.prenom, taille)
        await prisma.alerteStock.update({ where: { id: alerte.id }, data: { notifieeLe: new Date() } })
      } catch (err) {
        console.error('[Email] Alerte stock non envoyée :', err)
      }
    }
  }
}
