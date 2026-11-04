// server/api/admin/boxes-mensuelles/expedier.post.ts
// Lancement de l'expédition du 1er du mois (VALIDEE → EXPEDIEE) :
//   - une commande BOX_MENSUELLE par abonné et par cadeau en cours,
//     avec l'adresse figée, statut PREPAREE (suivi colis ensuite)
//   - décrément du stock courant des produits envoyés
//   - les cadeaux dont c'était la dernière box passent TERMINE
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'
import { moisSchema } from '~/server/utils/schemas'
import { TAILLES } from '~/server/utils/metier'
import { filtreAbonnementsDuMois, filtreCadeauxDuMois } from '~/server/utils/expedition'
import { snapshotLivraison } from '~/server/utils/livraison'
import { consommerStockCourant } from '~/server/utils/stock'

const bodySchema = z.object({ mois: moisSchema })

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const { mois } = await parseBody(event, bodySchema)

    const boxes = await prisma.boxMensuelle.findMany({ where: { mois }, include: { items: true } })
    if (boxes.length !== TAILLES.length || boxes.some(b => b.statut !== 'VALIDEE')) {
      throw createError({ statusCode: 400, statusMessage: `Les 3 box de ${mois} doivent être validées (et pas déjà expédiées)` })
    }
    const boxParTaille = new Map(boxes.map(b => [b.taille, b]))

    const [abonnements, cadeaux] = await Promise.all([
      prisma.abonnement.findMany({ where: filtreAbonnementsDuMois(mois), include: { adresse: true } }),
      prisma.abonnementCadeau.findMany({ where: filtreCadeauxDuMois() }),
    ])

    const sansAdresse = abonnements.filter(a => !a.adresse)
    const commandes = [
      ...abonnements.filter(a => a.adresse).map(a => ({
        type: 'BOX_MENSUELLE' as const,
        clientId: a.clientId,
        chienId: a.chienId,
        formulaId: a.formulaId,
        abonnementId: a.id,
        boxMensuelleId: boxParTaille.get(a.taille)!.id,
        taille: a.taille,
        statut: 'PREPAREE' as const,
        ...snapshotLivraison(a.adresse!, a.modeLivraison, { id: a.pointRelaisId, libelle: a.pointRelaisLibelle }),
      })),
      ...cadeaux.map(c => ({
        type: 'BOX_MENSUELLE' as const,
        clientId: c.acheteurId,
        cadeauId: c.id,
        boxMensuelleId: boxParTaille.get(c.taille)!.id,
        taille: c.taille,
        statut: 'PREPAREE' as const,
        ...snapshotLivraison({
          prenom: c.destPrenom, nom: c.destNom, ligne1: c.destLigne1, ligne2: c.destLigne2,
          codePostal: c.destCodePostal, ville: c.destVille, pays: c.destPays,
        }),
      })),
    ]

    const parTaille = { S: 0, M: 0, L: 0 }
    for (const c of commandes) parTaille[c.taille]++

    const manques = await prisma.$transaction(async (tx) => {
      // Verrou : un 2e appel concurrent ne trouve plus de box VALIDEE
      const { count } = await tx.boxMensuelle.updateMany({ where: { mois, statut: 'VALIDEE' }, data: { statut: 'EXPEDIEE' } })
      if (count !== TAILLES.length) throw createError({ statusCode: 409, statusMessage: 'Expédition déjà lancée' })

      await tx.commande.createMany({ data: commandes, skipDuplicates: true })

      const manques: Array<{ produitId: string; manquant: number }> = []
      for (const box of boxes) {
        for (const item of box.items) {
          const manquant = await consommerStockCourant(tx, item.produitId, item.quantite * parTaille[box.taille])
          if (manquant > 0) manques.push({ produitId: item.produitId, manquant })
        }
      }

      for (const c of cadeaux) {
        const envoyes = c.moisEnvoyes + 1
        await tx.abonnementCadeau.update({
          where: { id: c.id },
          data: { moisEnvoyes: envoyes, ...(envoyes >= c.dureeMois ? { statut: 'TERMINE' } : {}) },
        })
      }
      return manques
    }, { timeout: 60_000 })

    return apiSuccess({
      mois,
      commandesCreees: commandes.length,
      parTaille,
      abonnementsSansAdresse: sansAdresse.map(a => a.id),
      stockManquant: manques,
    }, `${commandes.length} box à expédier pour ${mois}`)
  })
})
