// server/api/quiz/index.post.ts
// Quiz "Trouve la box de ton chien" (3 étapes) → taille, formule, contenu, prix.
// Public ; si l'utilisateur est connecté, le résultat lui est rattaché et la
// fiche chien peut être créée directement (enregistrerChien = consentement).
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { getOptionalClient } from '~/server/utils/auth'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'
import { calculerTaille, recommanderFormule } from '~/server/utils/metier'
import { getReglages } from '~/server/utils/reglages'
import { idsAllergenes } from '~/server/utils/chiens'
import { creerChienDepuisQuiz } from '~/server/utils/quiz'
import { sendQuizRecommandation } from '~/server/utils/email'
import { niveauActiviteSchema, tailleSchema } from '~/server/utils/schemas'

const bodySchema = z.object({
  // Étape 1 — profil
  nomChien:        z.string().trim().min(1).max(50),
  race:            z.string().trim().max(80).optional(),
  poids:           z.number().positive().max(120),
  ageMois:         z.number().int().min(0).max(300).optional(),
  // Taille choisie par le client s'il veut forcer la recommandation
  taille:          tailleSchema.optional(),
  // Étape 2 — comportement
  niveauActivite:  niveauActiviteSchema,
  estMacheur:      z.boolean(),
  // Étape 3 — santé
  allergenes:      z.array(z.string()).max(20).default([]),
  allergiesAutres: z.string().trim().max(300).optional(),
  sensibleTraces:  z.boolean().default(false),
  email:           z.string().trim().toLowerCase().email().optional(),
  accepteEmail:    z.boolean().default(false),
  // Connecté uniquement : créer la fiche chien (consentement RGPD)
  enregistrerChien: z.boolean().default(false),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const client = await getOptionalClient(event)
    const body = await parseBody(event, bodySchema)
    const reglages = await getReglages()

    // Vérifie les codes avant d'enregistrer quoi que ce soit
    const allergeneIds = await idsAllergenes(body.allergenes)
    const allergenes = await prisma.allergene.findMany({ where: { id: { in: allergeneIds } } })

    const tailleCalculee = calculerTaille(
      body.poids,
      { seuilS: reglages['taille.seuilS'], seuilM: reglages['taille.seuilM'] },
      body.race,
    )
    const taille = body.taille ?? tailleCalculee
    const formule = recommanderFormule({
      aDesAllergies: allergeneIds.length > 0 || !!body.allergiesAutres,
      estMacheur: body.estMacheur,
      niveauActivite: body.niveauActivite,
    })

    const email = body.email ?? client?.email
    const result = await prisma.quizResult.create({
      data: {
        clientId:           client?.id,
        email,
        accepteEmail:       body.accepteEmail,
        nomChien:           body.nomChien,
        race:               body.race,
        poids:              body.poids,
        ageMois:            body.ageMois,
        taille,
        niveauActivite:     body.niveauActivite,
        estMacheur:         body.estMacheur,
        allergenes:         allergenes.map(a => a.code),
        allergiesAutres:    body.allergiesAutres,
        sensibleTraces:     body.sensibleTraces,
        formuleRecommandee: formule,
      },
    })

    const chien = client && body.enregistrerChien
      ? await creerChienDepuisQuiz(result.id, client.id)
      : null

    const surprise = await prisma.formulaBox.findFirst({
      where: { type: 'SURPRISE', actif: true },
      include: { prix: true },
    })
    const prixSurprise = surprise?.prix.find(p => p.taille === taille)?.prix ?? null
    const prixCompose = (await prisma.prixTaille.findFirst({
      where: { taille, formula: { type: 'COMPOSE', actif: true } },
    }))?.prix ?? null
    const contenu = (surprise?.contenu as Record<string, Record<string, number>> | null)?.[taille] ?? null

    if (email && body.accepteEmail) {
      sendQuizRecommandation(email, {
        nomChien: body.nomChien,
        taille,
        formule,
        prix: formule === 'SURPRISE' ? prixSurprise : prixCompose,
        allergenes: allergenes.map(a => a.nom),
      }).catch(err => console.error('[Email] Recommandation quiz non envoyée :', err.message))
    }

    return apiSuccess({
      id: result.id,
      chienId: chien?.id ?? null,
      taille,
      tailleCalculee,
      formuleRecommandee: formule,
      // Contenu prévu par catégorie (sans révéler les produits)
      contenu,
      prixSurpriseMensuel: prixSurprise,
      prixCompose,
      fraisPort: reglages['livraison.fraisPort'],
      allergenesExclus: allergenes.map(a => ({ code: a.code, nom: a.nom })),
      message: formule === 'COMPOSE'
        ? `Compose ta box est idéale pour ${body.nomChien} : vous choisissez chaque produit, les allergènes signalés sont filtrés automatiquement.`
        : `La Box Surprise est idéale pour ${body.nomChien} : une sélection taille ${taille} chaque mois.`,
    })
  })
})
