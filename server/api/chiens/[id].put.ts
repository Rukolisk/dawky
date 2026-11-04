// server/api/chiens/[id].put.ts
// Modifie la fiche chien. Si le poids ou la race change sans taille
// explicite, la taille est recalculée. La taille d'un abonnement en cours
// n'est jamais modifiée automatiquement : le client reçoit un conseil
// (cf. tailleConseillee dans GET /api/abonnements).
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, parseBody, requireParam, withErrorHandling } from '~/server/utils/api'
import { calculerTaille } from '~/server/utils/metier'
import { getReglages } from '~/server/utils/reglages'
import { chienInclude, getChienDuClient, idsAllergenes, notifierAllergieSiBesoin, serialiserChien } from '~/server/utils/chiens'
import { chienChampsSchema } from '~/server/utils/chiens-schema'

// .partial() conserverait les .default() : on les retire pour ne pas
// écraser des champs absents du body
const bodySchema = chienChampsSchema.extend({
  niveauActivite: chienChampsSchema.shape.niveauActivite.removeDefault(),
  estMacheur:     chienChampsSchema.shape.estMacheur.removeDefault(),
  allergenes:     chienChampsSchema.shape.allergenes.removeDefault(),
  sensibleTraces: chienChampsSchema.shape.sensibleTraces.removeDefault(),
}).partial()

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const id = requireParam(event, 'id')
    const { allergenes, taille, ...data } = await parseBody(event, bodySchema)
    const avant = await getChienDuClient(id, client.id)

    let nouvelleTaille = taille
    if (!nouvelleTaille && (data.poids !== undefined || data.race !== undefined)) {
      const reglages = await getReglages()
      nouvelleTaille = calculerTaille(
        data.poids ?? avant.poids,
        { seuilS: reglages['taille.seuilS'], seuilM: reglages['taille.seuilM'] },
        data.race !== undefined ? data.race : avant.race,
      )
    }

    const allergeneIds = allergenes ? await idsAllergenes(allergenes) : null
    const anciens = new Set(avant.allergenes.map(a => a.allergeneId))
    const allergiesModifiees =
      (allergeneIds !== null && (allergeneIds.length !== anciens.size || allergeneIds.some(a => !anciens.has(a))))
      || (data.allergiesAutres !== undefined && (data.allergiesAutres ?? '') !== (avant.allergiesAutres ?? ''))
      || (data.sensibleTraces !== undefined && data.sensibleTraces !== avant.sensibleTraces)

    const chien = await prisma.chien.update({
      where: { id },
      data: {
        ...data,
        ...(nouvelleTaille ? { taille: nouvelleTaille } : {}),
        // Toute modification des allergies doit être revue par l'équipe
        ...(allergiesModifiees ? { profilAllergieValide: false } : {}),
        ...(allergeneIds !== null
          ? { allergenes: { deleteMany: {}, create: allergeneIds.map(allergeneId => ({ allergeneId })) } }
          : {}),
      },
      include: chienInclude,
    })

    if (allergiesModifiees) {
      const abonne = await prisma.abonnement.count({ where: { chienId: id, statut: { in: ['ACTIF', 'PAUSE', 'IMPAYE'] } } })
      if (abonne > 0) await notifierAllergieSiBesoin(chien, client)
    }

    return apiSuccess(await serialiserChien(chien), 'Fiche mise à jour')
  })
})
