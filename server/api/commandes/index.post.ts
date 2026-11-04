// server/api/commandes/index.post.ts
// Commande ponctuelle : Compose ta box (lots invendus) ou box saisonnière.
//
// Le stock est réservé dans une transaction AVANT le paiement (pas de
// survente) puis libéré si la session Stripe expire sans paiement.
// Les montants sont calculés ici, jamais repris du front.
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'
import { cgvSchema, livraisonSchema, tailleSchema } from '~/server/utils/schemas'
import { getReglages } from '~/server/utils/reglages'
import { allergenesEnConflit, calculerFraisPort } from '~/server/utils/metier'
import { filtreLotsVendables, reserverLot } from '~/server/utils/stock'
import { annulerCommandeNonPayee } from '~/server/utils/commandes'
import { getChienDuClient } from '~/server/utils/chiens'
import { getAdresseDuClient, snapshotLivraison } from '~/server/utils/livraison'
import { resoudreReduction } from '~/server/utils/promo'
import { creerSessionPaiement, type LigneCheckout } from '~/server/utils/stripe'

const communSchema = z.object({
  chienId:    z.string().optional(),
  taille:     tailleSchema,
  livraison:  livraisonSchema,
  codePromo:  z.string().trim().max(30).optional(),
  accepteCgv: cgvSchema,
})

const bodySchema = z.discriminatedUnion('type', [
  communSchema.extend({
    type: z.literal('COMPOSE'),
    items: z.array(z.object({
      lotId:    z.string().min(1),
      quantite: z.number().int().min(1).max(10).default(1),
    })).min(1),
    // Le client a vu l'avertissement allergène et commande quand même
    confirmerRisqueAllergie: z.boolean().default(false),
  }),
  communSchema.extend({
    type: z.literal('SAISONNIERE'),
    formulaId: z.string().min(1),
  }),
])

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)
    const body = await parseBody(event, bodySchema)
    const reglages = await getReglages()

    const chien = body.chienId ? await getChienDuClient(body.chienId, client.id) : null
    const adresse = await getAdresseDuClient(body.livraison.adresseId, client.id)
    const livraison = snapshotLivraison(adresse, body.livraison.modeLivraison, {
      id: body.livraison.pointRelaisId,
      libelle: body.livraison.pointRelaisLibelle,
    })

    let lignes: LigneCheckout[]
    let sousTotal: number
    let titreCommande: string
    let composeFormulaId: string | undefined

    if (body.type === 'COMPOSE') {
      const quantiteTotale = body.items.reduce((s, i) => s + i.quantite, 0)
      const min = reglages['compose.minArticles']
      const max = reglages['compose.maxArticles']
      if (quantiteTotale < min || quantiteTotale > max) {
        throw createError({ statusCode: 400, statusMessage: `Votre box doit contenir entre ${min} et ${max} articles` })
      }
      const lotIds = body.items.map(i => i.lotId)
      if (new Set(lotIds).size !== lotIds.length) {
        throw createError({ statusCode: 400, statusMessage: 'Un même produit apparaît deux fois dans la sélection' })
      }

      const lots = await prisma.lotStock.findMany({
        where: { id: { in: lotIds }, ...filtreLotsVendables(reglages['invendus.delaiRetraitJours']) },
        include: { produit: { include: { tailles: true, allergenes: { include: { allergene: true } } } } },
      })
      if (lots.length !== lotIds.length) {
        throw createError({ statusCode: 409, statusMessage: 'Un ou plusieurs produits ne sont plus disponibles' })
      }

      const incompatibles = lots.filter(l => !l.produit.tailles.some(t => t.taille === body.taille))
      if (incompatibles.length > 0) {
        throw createError({
          statusCode: 400,
          statusMessage: `Non disponible en taille ${body.taille} : ${incompatibles.map(l => l.produit.nom).join(', ')}`,
        })
      }

      // Vérification allergènes du panier (parcours Thomas)
      if (chien && !body.confirmerRisqueAllergie) {
        const allergenesChien = chien.allergenes.map(a => a.allergeneId)
        const risques = lots
          .map(l => ({
            produit: l.produit.nom,
            allergenes: l.produit.allergenes
              .filter(a => allergenesEnConflit([a], allergenesChien, chien.sensibleTraces).length > 0)
              .map(a => `${a.allergene.nom}${a.presence === 'TRACES' ? ' (traces)' : ''}`),
          }))
          .filter(r => r.allergenes.length > 0)
        if (risques.length > 0) {
          throw createError({
            statusCode: 409,
            statusMessage: `Attention : certains produits ne conviennent pas à ${chien.nom}`,
            data: { risquesAllergie: risques },
          })
        }
      }

      // Prix fixe de la box selon sa taille, quel que soit le choix des produits
      const prixBox = await prisma.prixTaille.findFirst({
        where: { taille: body.taille, formula: { type: 'COMPOSE', actif: true } },
      })
      if (!prixBox) throw createError({ statusCode: 503, statusMessage: 'Compose ta box n\'est pas disponible pour le moment' })

      const parLot = new Map(lots.map(l => [l.id, l]))
      const noms = body.items.map(i => parLot.get(i.lotId)!.produit.nom).join(', ')
      lignes = [{ libelle: `Compose ta box — taille ${body.taille} (${noms})`.slice(0, 250), montant: prixBox.prix }]
      sousTotal = prixBox.prix
      titreCommande = 'Compose ta box'
      composeFormulaId = prixBox.formulaId
    } else {
      const now = new Date()
      const formula = await prisma.formulaBox.findFirst({
        where: {
          id: body.formulaId,
          type: 'SAISONNIERE',
          actif: true,
          dateDebutVente: { lte: now },
          OR: [{ dateFinVente: null }, { dateFinVente: { gte: now } }],
        },
        include: { prix: true },
      })
      const prix = formula?.prix.find(p => p.taille === body.taille)?.prix
      if (!formula || !prix) throw createError({ statusCode: 404, statusMessage: 'Cette box n\'est pas disponible' })

      lignes = [{ libelle: `${formula.nom} — taille ${body.taille}`, montant: prix }]
      sousTotal = prix
      titreCommande = formula.nom
    }

    const fraisPort = calculerFraisPort(sousTotal, reglages['livraison.fraisPort'], reglages['livraison.fraisPortOffertDes'])
    const reduction = await resoudreReduction(client, sousTotal, body.codePromo)
    const remise = reduction?.remise ?? 0
    const total = sousTotal + fraisPort - remise

    const commande = await prisma.$transaction(async (tx) => {
      if (body.type === 'COMPOSE') {
        for (const item of body.items) {
          if (!(await reserverLot(tx, item.lotId, item.quantite))) {
            throw createError({ statusCode: 409, statusMessage: 'Stock insuffisant pour un produit, actualisez la page.' })
          }
        }
      } else {
        const { count } = await tx.formulaBox.updateMany({
          where: { id: body.formulaId, OR: [{ stock: null }, { stock: { gt: 0 } }] },
          data: { stock: { decrement: 1 } },
        })
        if (count === 0) throw createError({ statusCode: 409, statusMessage: 'Cette box est épuisée' })
        // Le décrément sur stock null laisse null : rien à corriger
      }

      const lots = body.type === 'COMPOSE'
        ? await tx.lotStock.findMany({ where: { id: { in: body.items.map(i => i.lotId) } }, include: { produit: true } })
        : []
      const parLot = new Map(lots.map(l => [l.id, l]))

      return tx.commande.create({
        data: {
          type:        body.type,
          clientId:    client.id,
          chienId:     chien?.id,
          formulaId:   body.type === 'SAISONNIERE' ? body.formulaId : composeFormulaId,
          taille:      body.taille,
          sousTotal,
          fraisPort,
          remise,
          total,
          codePromoId: reduction?.codePromoId,
          ...livraison,
          selections: body.type === 'COMPOSE'
            ? {
                create: body.items.map(i => ({
                  lotId:        i.lotId,
                  produitId:    parLot.get(i.lotId)!.produitId,
                  quantite:     i.quantite,
                  prixUnitaire: parLot.get(i.lotId)!.produit.prix,
                })),
              }
            : undefined,
        },
      })
    })

    if (fraisPort > 0) lignes.push({ libelle: 'Frais de port', montant: fraisPort })

    let session
    try {
      session = await creerSessionPaiement({
        kind: 'commande',
        id: commande.id,
        client,
        lignes,
        remise,
        libelleRemise: reduction?.libelle,
        sourceRemise: reduction?.source,
      })
    } catch (err) {
      // Paiement impossible : on rend le stock immédiatement
      await annulerCommandeNonPayee(commande.id)
      throw err
    }
    await prisma.commande.update({ where: { id: commande.id }, data: { stripeCheckoutId: session.id } })

    return apiSuccess({
      commandeId: commande.id,
      numero: commande.numero,
      clientSecret: session.client_secret,
      recapitulatif: { titre: titreCommande, taille: body.taille, sousTotal, fraisPort, remise, total, libelleRemise: reduction?.libelle ?? null },
    })
  })
})
