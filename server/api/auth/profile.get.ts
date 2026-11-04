// server/api/auth/profile.get.ts
// Espace client : profil, adresses, chiens, abonnements, parrainage
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'
import { chienInclude, serialiserChien } from '~/server/utils/chiens'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)

    const [adresses, chiens, abonnementsActifs] = await Promise.all([
      prisma.adresse.findMany({ where: { clientId: client.id }, orderBy: [{ parDefaut: 'desc' }, { createdAt: 'asc' }] }),
      prisma.chien.findMany({ where: { clientId: client.id, consentementRgpdLe: { not: null } }, include: chienInclude, orderBy: { createdAt: 'asc' } }),
      prisma.abonnement.count({ where: { clientId: client.id, statut: { in: ['ACTIF', 'PAUSE', 'IMPAYE'] } } }),
    ])

    const adresseParDefaut = adresses.find(a => a.parDefaut) ?? adresses[0] ?? null

    return apiSuccess({
      id:             client.id,
      email:          client.email,
      prenom:         client.prenom,
      nom:            client.nom,
      telephone:      client.telephone,
      role:           client.role,
      codeParrainage: client.codeParrainage,
      adresses,
      // US-04 : indicateur "adresse complète"
      adresseComplete: !!adresseParDefaut,
      chiens:          await Promise.all(chiens.map(serialiserChien)),
      abonnementsActifs,
    })
  })
})
