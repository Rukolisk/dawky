// server/api/admin/reglages/index.put.ts
// Paramètres métier (seuils de taille, délai de retrait, frais de port…)
// Body : { "taille.seuilS": 10, "livraison.fraisPort": 490, … }
import { z } from 'zod'
import { createError, readBody } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'
import { CLES_REGLAGES, getReglages, REGLAGES, type CleReglage } from '~/server/utils/reglages'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const body = z.record(z.unknown()).parse(await readBody(event))

    const erreurs: Record<string, string> = {}
    const valeurs: Array<[CleReglage, unknown]> = []
    for (const [cle, valeur] of Object.entries(body)) {
      if (!(CLES_REGLAGES as string[]).includes(cle)) { erreurs[cle] = 'Réglage inconnu'; continue }
      const parsed = REGLAGES[cle as CleReglage].schema.safeParse(valeur)
      if (!parsed.success) { erreurs[cle] = parsed.error.issues[0]?.message ?? 'Valeur invalide'; continue }
      valeurs.push([cle as CleReglage, parsed.data])
    }
    if (Object.keys(erreurs).length > 0) {
      throw createError({ statusCode: 400, statusMessage: 'Réglages invalides', data: erreurs })
    }

    const actuels = await getReglages()
    const seuilS = (valeurs.find(([c]) => c === 'taille.seuilS')?.[1] as number | undefined) ?? actuels['taille.seuilS']
    const seuilM = (valeurs.find(([c]) => c === 'taille.seuilM')?.[1] as number | undefined) ?? actuels['taille.seuilM']
    if (seuilS >= seuilM) throw createError({ statusCode: 400, statusMessage: 'Le seuil S doit être inférieur au seuil M' })

    await prisma.$transaction(valeurs.map(([cle, valeur]) => prisma.reglage.upsert({
      where: { cle },
      update: { valeur: valeur as object },
      create: { cle, valeur: valeur as object },
    })))

    return apiSuccess(await getReglages(), 'Réglages enregistrés')
  })
})
