// server/tasks/chiens/anniversaires.ts
// Tous les jours : email d'anniversaire aux propriétaires des chiens
// abonnés nés ce jour-là.
import prisma from '~/server/utils/prisma'
import { ageEnMois } from '~/server/utils/metier'
import { sendAnniversaire } from '~/server/utils/email'

export default defineTask({
  meta: { name: 'chiens:anniversaires', description: 'Emails d\'anniversaire des chiens' },
  async run() {
    const aujourdhui = new Date()
    const mois = aujourdhui.getMonth() + 1
    const jour = aujourdhui.getDate()

    const ids = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "chiens"
      WHERE "dateNaissance" IS NOT NULL
        AND EXTRACT(MONTH FROM "dateNaissance") = ${mois}
        AND EXTRACT(DAY FROM "dateNaissance") = ${jour}`

    const chiens = await prisma.chien.findMany({
      where: {
        id: { in: ids.map(r => r.id) },
        consentementRgpdLe: { not: null },
        abonnements: { some: { statut: { in: ['ACTIF', 'PAUSE'] } } },
      },
      include: { client: true },
    })

    let envoyes = 0
    for (const chien of chiens) {
      const age = Math.floor(ageEnMois(chien.dateNaissance!, aujourdhui) / 12)
      if (age < 1) continue
      try {
        await sendAnniversaire(chien.client.email, { prenom: chien.client.prenom, nomChien: chien.nom, age })
        envoyes++
      } catch (err) {
        console.error('[Email] Anniversaire non envoyé :', err)
      }
    }
    return { result: { envoyes } }
  },
})
