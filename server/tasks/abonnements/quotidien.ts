// server/tasks/abonnements/quotidien.ts
// Tous les jours :
//   - les abonnements dont la pause est terminée redeviennent actifs
//     (Stripe reprend lui-même les prélèvements via resumes_at)
//   - rappel à l'acheteur d'un cadeau 7 jours avant l'envoi de la
//     dernière box (US-42), sans reconduction
import prisma from '~/server/utils/prisma'
import { prochaineExpedition } from '~/server/utils/metier'
import { sendCadeauRappelFin } from '~/server/utils/email'

export default defineTask({
  meta: { name: 'abonnements:quotidien', description: 'Fin des pauses et rappels de fin de cadeau' },
  async run() {
    const maintenant = new Date()

    const { count: reprises } = await prisma.abonnement.updateMany({
      where: { statut: 'PAUSE', pauseJusquau: { lte: maintenant } },
      data: { statut: 'ACTIF', pauseJusquau: null },
    })

    let rappels = 0
    const derniereBox = prochaineExpedition(maintenant)
    const joursAvant = (derniereBox.getTime() - maintenant.getTime()) / 86_400_000
    if (joursAvant <= 7) {
      const cadeaux = await prisma.abonnementCadeau.findMany({
        where: { statut: 'ACTIF', rappelFinEnvoyeLe: null },
        include: { acheteur: true },
      })
      for (const c of cadeaux.filter(c => c.moisEnvoyes === c.dureeMois - 1)) {
        if (c.acheteur.anonymiseLe) continue
        try {
          await sendCadeauRappelFin(c.acheteur.email, {
            prenom: c.acheteur.prenom,
            destinataire: `${c.destPrenom} ${c.destNom}`,
            dateDerniereBox: derniereBox,
          })
          await prisma.abonnementCadeau.update({ where: { id: c.id }, data: { rappelFinEnvoyeLe: maintenant } })
          rappels++
        } catch (err) {
          console.error('[Email] Rappel fin de cadeau non envoyé :', err)
        }
      }
    }

    return { result: { reprises, rappels } }
  },
})
