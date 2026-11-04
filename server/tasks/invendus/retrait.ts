// server/tasks/invendus/retrait.ts
// Tous les jours : les lots invendus à moins de N jours de leur date
// limite sont retirés du site (sans réduction) et passent "à donner".
import prisma from '~/server/utils/prisma'
import { getReglages } from '~/server/utils/reglages'
import { dateLimiteMinimale } from '~/server/utils/stock'

export default defineTask({
  meta: { name: 'invendus:retrait', description: 'Retire les lots invendus proches de leur date limite' },
  async run() {
    const { 'invendus.delaiRetraitJours': delai } = await getReglages()
    const { count } = await prisma.lotStock.updateMany({
      where: {
        statut: 'DISPONIBLE',
        moisOrigine: { not: null },
        dateLimite: { lte: dateLimiteMinimale(delai) },
      },
      data: { statut: 'RETIRE', retireLe: new Date() },
    })
    return { result: { lotsRetires: count } }
  },
})
