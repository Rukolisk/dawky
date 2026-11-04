// server/api/boxes/index.get.ts
// Formules (Box Surprise, Compose ta box, saisonnières en vente) avec prix
// par taille et contenu prévu par catégorie (F-36, US-06, US-07, US-53)
import prisma from '~/server/utils/prisma'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'
import { getReglages } from '~/server/utils/reglages'
import { serialiserFormule } from '~/server/utils/formules'

export default defineEventHandler(async () => {
  return withErrorHandling(async () => {
    const now = new Date()
    const reglages = await getReglages()
    const formules = await prisma.formulaBox.findMany({
      where: {
        actif: true,
        OR: [
          { type: { in: ['SURPRISE', 'COMPOSE'] } },
          { type: 'SAISONNIERE', dateDebutVente: { lte: now }, OR: [{ dateFinVente: null }, { dateFinVente: { gte: now } }] },
        ],
      },
      include: { prix: true },
      orderBy: [{ type: 'asc' }, { createdAt: 'asc' }],
    })

    return apiSuccess({
      formules: formules.map(serialiserFormule),
      seuilsTaille: { S: reglages['taille.seuilS'], M: reglages['taille.seuilM'] },
      fraisPort: reglages['livraison.fraisPort'],
      fraisPortOffertDes: reglages['livraison.fraisPortOffertDes'],
      dureesCadeau: reglages['cadeau.dureesMois'],
      pauseMaxMois: reglages['abonnement.pauseMaxMois'],
    })
  })
})
