// server/utils/quiz.ts
import prisma from './prisma'
import { dateNaissanceDepuisAge } from './metier'
import { idsAllergenes } from './chiens'

/**
 * Crée la fiche chien à partir d'un résultat de quiz rattaché au client.
 * Le consentement RGPD a été donné explicitement par l'appelant.
 */
export async function creerChienDepuisQuiz(quizResultId: string, clientId: string) {
  const quiz = await prisma.quizResult.findFirst({ where: { id: quizResultId, clientId } })
  if (!quiz) return null

  const allergeneIds = await idsAllergenes(quiz.allergenes)
  return prisma.chien.create({
    data: {
      clientId,
      nom:                quiz.nomChien,
      race:               quiz.race,
      poids:              quiz.poids,
      taille:             quiz.taille,
      dateNaissance:      quiz.ageMois !== null ? dateNaissanceDepuisAge(quiz.ageMois, quiz.createdAt) : null,
      niveauActivite:     quiz.niveauActivite,
      estMacheur:         quiz.estMacheur,
      sensibleTraces:     quiz.sensibleTraces,
      allergiesAutres:    quiz.allergiesAutres,
      consentementRgpdLe: new Date(),
      allergenes:         { create: allergeneIds.map(allergeneId => ({ allergeneId })) },
    },
  })
}
