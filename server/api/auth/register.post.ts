// server/api/auth/register.post.ts
// Création du profil Dawky juste après l'inscription Supabase.
//   - l'email vient du token vérifié, jamais du body
//   - `codeParrainage` : code du parrain (lien de parrainage)
//   - `quizResultId` + `consentementChien` : crée la fiche chien à partir
//     du quiz fait avant l'inscription (US-20, F-05)
import { z } from 'zod'
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { getSupabaseUser } from '~/server/utils/auth'
import { sendWelcomeEmail } from '~/server/utils/email'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'
import { genererCodeParrainage, normaliserCode } from '~/server/utils/promo'
import { creerChienDepuisQuiz } from '~/server/utils/quiz'

const bodySchema = z.object({
  prenom:            z.string().trim().min(1).max(80),
  nom:               z.string().trim().min(1).max(80),
  telephone:         z.string().trim().max(20).optional(),
  codeParrainage:    z.string().trim().max(30).optional(),
  quizResultId:      z.string().optional(),
  consentementChien: z.boolean().default(false),
})

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const supabaseUser = await getSupabaseUser(event)
    const body = await parseBody(event, bodySchema)
    const email = supabaseUser.email?.toLowerCase()
    if (!email) throw createError({ statusCode: 400, statusMessage: 'Compte sans email' })

    // Idempotent : un double appel (rechargement…) renvoie le profil existant
    const existant = await prisma.client.findUnique({ where: { supabaseUid: supabaseUser.id } })
    if (existant) return apiSuccess({ id: existant.id, email: existant.email })

    // Profil au même email sans compte de connexion rattaché (compte
    // Supabase recréé) : on le rattache plutôt que d'échouer sur l'email unique.
    // Un profil déjà rattaché à un AUTRE compte n'est jamais repris.
    const memeEmail = await prisma.client.findUnique({ where: { email } })
    if (memeEmail && !memeEmail.supabaseUid) {
      const rattache = await prisma.client.update({
        where: { id: memeEmail.id },
        data: { supabaseUid: supabaseUser.id },
      })
      return apiSuccess({ id: rattache.id, email: rattache.email })
    }
    if (memeEmail) throw createError({ statusCode: 409, statusMessage: 'Un profil existe déjà pour cet email' })

    const client = await prisma.client.create({
      data: {
        supabaseUid:    supabaseUser.id,
        email,
        prenom:         body.prenom,
        nom:            body.nom,
        telephone:      body.telephone,
        codeParrainage: await genererCodeParrainage(body.prenom),
      },
    })

    if (body.codeParrainage) {
      const parrain = await prisma.client.findUnique({ where: { codeParrainage: normaliserCode(body.codeParrainage) } })
      if (parrain && parrain.id !== client.id) {
        await prisma.parrainage.create({ data: { parrainId: parrain.id, filleulId: client.id } })
      }
    }

    if (body.quizResultId) {
      await prisma.quizResult.updateMany({
        where: { id: body.quizResultId, clientId: null },
        data: { clientId: client.id },
      })
      if (body.consentementChien) {
        await creerChienDepuisQuiz(body.quizResultId, client.id)
      }
    }

    sendWelcomeEmail(email, body.prenom).catch(err =>
      console.error('[Email] Bienvenue non envoyé :', err.message),
    )

    return apiSuccess({ id: client.id, email: client.email }, 'Compte créé')
  })
})
