// server/api/chiens/index.post.ts
// Crée la fiche chien. Le consentement RGPD est obligatoire.
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'
import { calculerTaille } from '~/server/utils/metier'
import { getReglages } from '~/server/utils/reglages'
import { chienInclude, idsAllergenes, serialiserChien } from '~/server/utils/chiens'
import { chienChampsSchema } from '~/server/utils/chiens-schema'

const bodySchema = chienChampsSchema.extend({
  consentementRgpd: z.literal(true, {
    errorMap: () => ({ message: 'Votre accord est nécessaire pour enregistrer la fiche de votre chien' }),
  }),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const { allergenes, consentementRgpd: _c, taille, ...data } = await parseBody(event, bodySchema)
    const reglages = await getReglages()
    const allergeneIds = await idsAllergenes(allergenes)

    const chien = await prisma.chien.create({
      data: {
        ...data,
        clientId: client.id,
        taille: taille ?? calculerTaille(data.poids, { seuilS: reglages['taille.seuilS'], seuilM: reglages['taille.seuilM'] }, data.race),
        consentementRgpdLe: new Date(),
        allergenes: { create: allergeneIds.map(allergeneId => ({ allergeneId })) },
      },
      include: chienInclude,
    })

    return apiSuccess(await serialiserChien(chien), `Fiche de ${chien.nom} enregistrée`)
  })
})
