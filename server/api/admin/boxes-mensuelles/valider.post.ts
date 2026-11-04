// server/api/admin/boxes-mensuelles/valider.post.ts
// Validation des 3 box d'un mois (BROUILLON → VALIDEE).
//
// Contrôles avant validation (US-18, US-27) :
//   - les tailles S, M et L sont configurées et non vides (bloquant)
//   - aucun abonné ne reçoit un produit contenant un de ses allergènes
//   - les profils allergiques ont été validés par l'équipe
//   - le stock courant couvre le nombre de destinataires
// Les trois derniers points sont des avertissements : la validation
// est refusée (409 + détail) tant que l'admin ne passe pas `forcer: true`.
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'
import { moisSchema } from '~/server/utils/schemas'
import { allergenesEnConflit, TAILLES } from '~/server/utils/metier'
import { filtreAbonnementsDuMois, nombreDestinatairesParTaille } from '~/server/utils/expedition'
import { stockCourantParProduit } from '~/server/utils/stock'

const bodySchema = z.object({
  mois:   moisSchema,
  forcer: z.boolean().default(false),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const { mois, forcer } = await parseBody(event, bodySchema)

    const boxes = await prisma.boxMensuelle.findMany({
      where: { mois },
      include: { items: { include: { produit: { include: { allergenes: { include: { allergene: true } } } } } } },
    })

    const manquantes = TAILLES.filter(t => !boxes.some(b => b.taille === t))
    if (manquantes.length > 0) {
      throw createError({ statusCode: 400, statusMessage: `Box manquante(s) pour ${mois} : ${manquantes.join(', ')}` })
    }
    const vides = boxes.filter(b => b.items.length === 0)
    if (vides.length > 0) {
      throw createError({ statusCode: 400, statusMessage: `Box sans produit : ${vides.map(b => b.taille).join(', ')}` })
    }
    const nonBrouillon = boxes.filter(b => b.statut !== 'BROUILLON')
    if (nonBrouillon.length === boxes.length) {
      throw createError({ statusCode: 400, statusMessage: `Les box de ${mois} sont déjà ${nonBrouillon[0]?.statut}` })
    }

    // ── Allergènes des abonnés ──
    const abonnements = await prisma.abonnement.findMany({
      where: filtreAbonnementsDuMois(mois),
      include: {
        client: { select: { prenom: true, nom: true, email: true } },
        chien: { include: { allergenes: true } },
      },
    })
    const conflitsAllergie = []
    const profilsNonValides = []
    for (const abo of abonnements) {
      const chien = abo.chien
      if (chien.allergenes.length === 0 && !chien.allergiesAutres) continue
      if (!chien.profilAllergieValide) {
        profilsNonValides.push({ client: `${abo.client.prenom} ${abo.client.nom}`, chien: chien.nom, taille: abo.taille })
      }
      const box = boxes.find(b => b.taille === abo.taille)!
      const produits = box.items.flatMap((item) => {
        const conflits = allergenesEnConflit(item.produit.allergenes, chien.allergenes.map(a => a.allergeneId), chien.sensibleTraces)
        if (conflits.length === 0) return []
        const noms = item.produit.allergenes.filter(a => conflits.includes(a.allergeneId)).map(a => a.allergene.nom)
        return [{ produit: item.produit.nom, allergenes: noms }]
      })
      if (produits.length > 0) {
        conflitsAllergie.push({
          client: `${abo.client.prenom} ${abo.client.nom}`,
          email: abo.client.email,
          chien: chien.nom,
          taille: abo.taille,
          produits,
        })
      }
    }

    // ── Stock ──
    const destinataires = await nombreDestinatairesParTaille(mois)
    const besoin = new Map<string, { nom: string; quantite: number }>()
    for (const box of boxes) {
      for (const item of box.items) {
        const b = besoin.get(item.produitId) ?? { nom: item.produit.nom, quantite: 0 }
        b.quantite += item.quantite * destinataires[box.taille]
        besoin.set(item.produitId, b)
      }
    }
    const stock = await stockCourantParProduit([...besoin.keys()])
    const ruptures = [...besoin.entries()]
      .filter(([id, b]) => (stock.get(id) ?? 0) < b.quantite)
      .map(([id, b]) => ({ produit: b.nom, besoin: b.quantite, stock: stock.get(id) ?? 0 }))

    const avertissements = { conflitsAllergie, profilsNonValides, ruptures }
    if (!forcer && (conflitsAllergie.length || profilsNonValides.length || ruptures.length)) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Points à vérifier avant validation',
        data: avertissements,
      })
    }

    await prisma.boxMensuelle.updateMany({ where: { mois, statut: 'BROUILLON' }, data: { statut: 'VALIDEE' } })

    return apiSuccess({ mois, destinataires, avertissements }, `Box de ${mois} validées et verrouillées`)
  })
})
