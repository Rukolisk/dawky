// server/utils/stock.ts
// ─────────────────────────────────────────
// Stock par lots (cf. LotStock dans le schéma)
//   - stock courant  : lots DISPONIBLE sans moisOrigine → box du mois
//   - lots invendus  : lots DISPONIBLE avec moisOrigine → Compose ta box
// ─────────────────────────────────────────
import type { Prisma } from '@prisma/client'
import prisma from './prisma'

type Tx = Prisma.TransactionClient

/**
 * Date en deçà de laquelle un lot daté n'est plus vendable
 * (retrait N jours avant la date limite).
 */
export function dateLimiteMinimale(delaiRetraitJours: number, aLaDate = new Date()): Date {
  const d = new Date(aLaDate)
  d.setDate(d.getDate() + delaiRetraitJours)
  return d
}

/**
 * Filtre Prisma des lots invendus proposables dans Compose ta box.
 */
export function filtreLotsVendables(delaiRetraitJours: number): Prisma.LotStockWhereInput {
  return {
    statut: 'DISPONIBLE',
    moisOrigine: { not: null },
    quantite: { gt: 0 },
    produit: { actif: true },
    OR: [
      { dateLimite: null },
      { dateLimite: { gt: dateLimiteMinimale(delaiRetraitJours) } },
    ],
  }
}

/**
 * Stock courant (hors invendus) par produit.
 */
export async function stockCourantParProduit(produitIds: string[]): Promise<Map<string, number>> {
  const rows = await prisma.lotStock.groupBy({
    by: ['produitId'],
    where: { produitId: { in: produitIds }, statut: 'DISPONIBLE', moisOrigine: null },
    _sum: { quantite: true },
  })
  return new Map(rows.map(r => [r.produitId, r._sum.quantite ?? 0]))
}

/**
 * Décrémente le stock courant d'un produit en consommant d'abord les lots
 * dont la date limite est la plus proche. Retourne la quantité qui n'a
 * pas pu être servie (0 si tout est servi).
 */
export async function consommerStockCourant(tx: Tx, produitId: string, quantite: number): Promise<number> {
  let reste = quantite
  const lots = await tx.lotStock.findMany({
    where: { produitId, statut: 'DISPONIBLE', moisOrigine: null, quantite: { gt: 0 } },
    orderBy: [{ dateLimite: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
  })
  for (const lot of lots) {
    if (reste <= 0) break
    const pris = Math.min(lot.quantite, reste)
    await tx.lotStock.update({ where: { id: lot.id }, data: { quantite: { decrement: pris } } })
    reste -= pris
  }
  return reste
}

/**
 * Réserve une quantité sur un lot précis, de façon atomique : échoue si
 * le stock a été pris entre-temps par une autre commande.
 */
export async function reserverLot(tx: Tx, lotId: string, quantite: number): Promise<boolean> {
  const { count } = await tx.lotStock.updateMany({
    where: { id: lotId, statut: 'DISPONIBLE', quantite: { gte: quantite } },
    data: { quantite: { decrement: quantite } },
  })
  return count === 1
}

/**
 * Remet en stock les lots d'une commande annulée / non payée.
 */
export async function libererLotsCommande(tx: Tx, commandeId: string) {
  const items = await tx.selectionItem.findMany({ where: { commandeId } })
  for (const item of items) {
    await tx.lotStock.update({ where: { id: item.lotId }, data: { quantite: { increment: item.quantite } } })
  }
}
