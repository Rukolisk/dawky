// server/api/abonnements/index.get.ts
// Abonnements du client avec la prochaine box (F-26), l'historique des
// box reçues (F-28) et un conseil de taille si le chien a changé (F-10).
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'
import { calculerTaille, moisDe, prochaineExpedition } from '~/server/utils/metier'
import { getReglages } from '~/server/utils/reglages'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const reglages = await getReglages()

    const abonnements = await prisma.abonnement.findMany({
      where: { clientId: client.id, statut: { notIn: ['ANNULE'] } },
      include: {
        chien: { select: { id: true, nom: true, poids: true, race: true } },
        adresse: true,
        commandes: {
          where: { type: 'BOX_MENSUELLE' },
          include: { boxMensuelle: { select: { mois: true, theme: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const dateProchaine = prochaineExpedition()
    const boxesProchainMois = await prisma.boxMensuelle.findMany({
      where: { mois: moisDe(dateProchaine), statut: { in: ['VALIDEE', 'EXPEDIEE'] } },
      select: { taille: true, theme: true },
    })

    const data = abonnements.map((abo) => {
      const recoit = abo.statut === 'ACTIF'
        || (abo.statut === 'RESILIE' && !!abo.dateFin && abo.dateFin > dateProchaine)
        || (abo.statut === 'PAUSE' && !!abo.pauseJusquau && abo.pauseJusquau <= dateProchaine)
      const tailleConseillee = calculerTaille(
        abo.chien.poids,
        { seuilS: reglages['taille.seuilS'], seuilM: reglages['taille.seuilM'] },
        abo.chien.race,
      )
      const { commandes, ...reste } = abo
      return {
        ...reste,
        prochaineBox: recoit
          ? {
              date: dateProchaine,
              taille: abo.taille,
              theme: boxesProchainMois.find(b => b.taille === abo.taille)?.theme ?? null,
            }
          : null,
        tailleConseillee,
        changementTailleConseille: tailleConseillee !== abo.taille,
        historique: commandes.map(c => ({
          id: c.id,
          mois: c.boxMensuelle?.mois ?? null,
          theme: c.boxMensuelle?.theme ?? null,
          taille: c.taille,
          statut: c.statut,
          dateExpedition: c.dateExpedition,
          dateLivraison: c.dateLivraison,
          numeroSuivi: c.numeroSuivi,
        })),
      }
    })

    return apiSuccess(data)
  })
})
