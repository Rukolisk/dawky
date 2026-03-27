// server/api/quiz/index.post.ts
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'

const bodySchema = z.object({
  nomChien: z.string().min(1), race: z.string().optional(),
  poids: z.number().positive(), age: z.number().positive(),
  estMacheur: z.boolean(), aDesAllergies: z.boolean(),
  allergies: z.string().optional(),
  niveauActivite: z.enum(['FAIBLE', 'MODERE', 'ELEVE']),
  email: z.string().email().optional(),
  clientId: z.string().optional(),
})

function calculerTaille(poids: number): 'XS' | 'S' | 'M' | 'L' {
  if (poids <= 5)  return 'XS'
  if (poids <= 5)  return 'XS'
  if (poids <= 10) return 'S'
  if (poids <= 25) return 'M'
  return 'L'
}

function recommanderBox(d: { estMacheur: boolean; niveauActivite: string; aDesAllergies: boolean }): 'SURPRISE' | 'CARTE' {
  if (d.aDesAllergies) return 'CARTE'
  if (d.estMacheur && d.niveauActivite === 'ELEVE') return 'CARTE'
  return 'SURPRISE'
}

// Ce que contient la box selon la taille (même valeur totale)
function contenuBox(taille: 'XS' | 'S' | 'M' | 'L', type: 'SURPRISE' | 'CARTE') {
  const items: Record<'XS' | 'S' | 'M' | 'L', string[]> = {
    XS: ['2 mini jouets ultra-doux', '2 sachets friandises nano', '1 mini bois de mastication', '1 soin coussinets', '1 accessoire mignon'],
    XS: ['2 jouets ultra-légers', '1 sachet friandises mini', '1 bâton mastication XS', '1 soin coussinets', '1 accessoire mignon'],
    S: ['2 petits jouets adaptés', '2 sachets de friandises mini', '1 bois de mastication S', '1 soin coussinets', '1 accessoire'],
    M: ['1 jouet robuste moyen', '2 sachets de friandises', '1 mastication taille M', '1 soin ou lotion', '1 accessoire'],
    L: ['1 grand jouet haute résistance', '1 grand sachet de friandises', '1 mastication XXL', '1 kit soin', '1 accessoire premium'],
  }
  return items[taille]
}

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const body = await parseBody(event, bodySchema)
    const taille = calculerTaille(body.poids)
    const typeBoxRecommande = recommanderBox(body)

    const formula = await prisma.formulaBox.findFirst({
      where: { type: typeBoxRecommande, actif: true },
    })

    const result = await prisma.quizResult.create({
      data: {
        nomChien: body.nomChien, race: body.race,
        poids: body.poids, age: body.age, taille,
        estMacheur: body.estMacheur, aDesAllergies: body.aDesAllergies,
        allergies: body.allergies, niveauActivite: body.niveauActivite,
        typeBoxRecommande, formulaId: formula?.id,
        email: body.email, clientId: body.clientId,
      },
    })

    return apiSuccess({
      id: result.id, taille, typeBoxRecommande,
      contenu: contenuBox(taille, typeBoxRecommande),
      formula: formula ? { id: formula.id, nom: formula.nom, prix: formula.prix } : null,
      message: typeBoxRecommande === 'CARTE'
        ? `La Box À la Carte est parfaite pour ${body.nomChien} — vous contrôlez chaque produit.`
        : `La Box Surprise est idéale pour ${body.nomChien} — une sélection soignée chaque mois !`,
    })
  })
})
