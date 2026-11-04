// server/utils/commandes.ts
import prisma from './prisma'
import { libererLotsCommande } from './stock'

/**
 * Annule une commande jamais payée et rend le stock réservé
 * (lots Compose ta box ou box saisonnière). Sans effet si la commande
 * a été payée entre-temps.
 */
export async function annulerCommandeNonPayee(commandeId: string) {
  await prisma.$transaction(async (tx) => {
    const commande = await tx.commande.findUnique({ where: { id: commandeId } })
    if (!commande || commande.statut !== 'EN_ATTENTE_PAIEMENT') return
    await libererLotsCommande(tx, commandeId)
    if (commande.formulaId && commande.type === 'SAISONNIERE') {
      await tx.formulaBox.updateMany({ where: { id: commande.formulaId, stock: { not: null } }, data: { stock: { increment: 1 } } })
    }
    await tx.commande.update({ where: { id: commandeId }, data: { statut: 'ANNULEE' } })
  })
}
