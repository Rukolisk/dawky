// server/api/compose/index.get.ts
// Compose ta box : lots invendus des mois passés encore vendables (US-11).
//
// GET /api/compose?taille=S&categorie=FRIANDISE&sansAllergenes=poulet&traces=true
// GET /api/compose?chienId=…   (connecté) → taille et allergènes du chien
//                                présélectionnés (US-51)
//
// Chaque lot indique s'il est compatible avec le chien (si chienId).
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { getOptionalClient } from '~/server/utils/auth'
import { apiSuccess, parseQuery, queryBool, queryList, withErrorHandling } from '~/server/utils/api'
import { categorieSchema, tailleSchema } from '~/server/utils/schemas'
import { getReglages } from '~/server/utils/reglages'
import { filtreLotsVendables } from '~/server/utils/stock'
import { filtreSansAllergenes, produitInclude, serialiserProduit } from '~/server/utils/produits'
import { allergenesEnConflit } from '~/server/utils/metier'
import { getChienDuClient } from '~/server/utils/chiens'

const querySchema = z.object({
  chienId:        z.string().optional(),
  taille:         tailleSchema.optional(),
  categorie:      categorieSchema.optional(),
  sansAllergenes: queryList.optional(),
  traces:         queryBool.optional(),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const q = parseQuery(event, querySchema)
    const client = q.chienId ? await getOptionalClient(event) : null
    const chien = client && q.chienId ? await getChienDuClient(q.chienId, client.id) : null

    const taille = q.taille ?? chien?.taille
    const sansAllergenes = q.sansAllergenes ?? chien?.allergenes.map(a => a.allergene.code) ?? []
    const traces = q.traces ?? chien?.sensibleTraces ?? false

    const reglages = await getReglages()
    const formule = await prisma.formulaBox.findFirst({ where: { type: 'COMPOSE', actif: true }, include: { prix: true } })
    const lots = await prisma.lotStock.findMany({
      where: {
        ...filtreLotsVendables(reglages['invendus.delaiRetraitJours']),
        produit: {
          actif: true,
          ...(taille ? { tailles: { some: { taille } } } : {}),
          ...(q.categorie ? { categorie: q.categorie } : {}),
          ...(await filtreSansAllergenes(sansAllergenes, traces)),
        },
      },
      include: { produit: { include: produitInclude } },
      orderBy: [{ moisOrigine: 'desc' }, { produit: { nom: 'asc' } }],
    })

    const allergenesChien = chien?.allergenes.map(a => a.allergeneId) ?? []

    return apiSuccess({
      filtres: { taille: taille ?? null, sansAllergenes, traces },
      // Prix fixe de la box par taille (centimes)
      prix: Object.fromEntries((formule?.prix ?? []).map(p => [p.taille, p.prix])),
      minArticles: reglages['compose.minArticles'],
      maxArticles: reglages['compose.maxArticles'],
      fraisPort: reglages['livraison.fraisPort'],
      fraisPortOffertDes: reglages['livraison.fraisPortOffertDes'],
      lots: lots.map(lot => ({
        lotId: lot.id,
        quantiteDisponible: lot.quantite,
        moisOrigine: lot.moisOrigine,
        dateLimite: lot.dateLimite,
        produit: serialiserProduit(lot.produit),
        compatibleChien: chien
          ? allergenesEnConflit(lot.produit.allergenes, allergenesChien, chien.sensibleTraces).length === 0
          : null,
      })),
      // F-41 : le front propose l'alerte "prévenez-moi" si la liste est vide
      aucunProduit: lots.length === 0,
    })
  })
})
