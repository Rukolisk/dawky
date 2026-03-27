// server/api/admin/boxes-mensuelles/cloturer.post.ts
// POST /api/admin/boxes-mensuelles/cloturer
//
// Logique métier :
//   Quand on clôture un mois, TOUT le stock restant de chaque produit
//   qui était dans les boxes de ce mois est transféré en "invendu".
//   Ces invendus sont ensuite disponibles dans la Box À la Carte.
//
//   Les produits originaux restent dans le catalogue normal (estInvendu=false)
//   mais leur stock est mis à 0 (épuisé pour ce mois).
//   Des entrées séparées "inv_..." sont créées avec estInvendu=true.

import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/adminGuard'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({
  mois: z.string().regex(/^\d{4}-\d{2}$/, 'Format attendu: YYYY-MM'),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const { mois } = await parseBody(event, bodySchema)

    // Récupérer toutes les boxes du mois (validées ou expédiées)
    const boxes = await prisma.boxMensuelle.findMany({
      where: {
        mois,
        statut: { in: ['VALIDEE', 'EXPEDIEE'] },
      },
      include: {
        items: {
          include: {
            produit: {
              include: { tailles: { select: { taille: true } } },
            },
          },
        },
      },
    })

    if (boxes.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `Aucune box validée pour ${mois}. Validez les boxes avant de clôturer.`,
      })
    }

    // Collecter tous les produits uniques dans les boxes de ce mois
    // (un même produit peut apparaître dans S, M et L)
    const produitsVus = new Map<string, typeof boxes[0]['items'][0]['produit']>()
    for (const box of boxes) {
      for (const item of box.items) {
        if (!produitsVus.has(item.produitId)) {
          produitsVus.set(item.produitId, item.produit)
        }
      }
    }

    const invendusCreés: string[] = []

    for (const [produitId, produit] of produitsVus) {
      // Lire le stock ACTUEL du produit
      const produitActuel = await prisma.produit.findUnique({
        where: { id: produitId },
        select: { stock: true, nom: true },
      })

      const stockActuel = produitActuel?.stock ?? 0

      if (stockActuel <= 0) {
        // Stock déjà épuisé — pas d'invendu à créer
        continue
      }

      // ID déterministe pour l'entrée invendu de ce produit pour ce mois
      const invId = `inv_${produitId}_${mois}`.substring(0, 30)

      // Vérifier si une entrée invendu existe déjà (ex: clôture partielle)
      const existingInv = await prisma.produit.findUnique({
        where: { id: invId },
        select: { stock: true },
      })

      if (existingInv) {
        // Ajouter au stock invendu existant
        await prisma.produit.update({
          where: { id: invId },
          data:  { stock: existingInv.stock + stockActuel },
        })
      } else {
        // Créer une nouvelle entrée invendu
        await prisma.produit.create({
          data: {
            id:          invId,
            nom:         produit.nom,
            description: produit.description,
            emoji:       produit.emoji,
            categorie:   produit.categorie,
            stock:       stockActuel,
            estInvendu:  true,
            moisOrigine: mois,
            actif:       true,
            tailles: {
              create: produit.tailles.map(t => ({ taille: t.taille })),
            },
          },
        })
      }

      // Remettre le stock du produit original à 0 (épuisé pour ce cycle)
      await prisma.produit.update({
        where: { id: produitId },
        data:  { stock: 0 },
      })

      invendusCreés.push(
        `${produit.emoji} ${produit.nom} — ${stockActuel} unité(s) transférée(s)`
      )
    }

    // Marquer les boxes du mois comme clôturées
    await prisma.boxMensuelle.updateMany({
      where: { mois },
      data:  { statut: 'CLOTUREE' },
    })

    return apiSuccess(
      { mois, invendus: invendusCreés },
      invendusCreés.length > 0
        ? `Mois ${mois} clôturé — ${invendusCreés.length} produit(s) transféré(s) en invendus dans la Box À la Carte.`
        : `Mois ${mois} clôturé — aucun stock restant, tout a été épuisé ! 🎉`,
    )
  })
})
