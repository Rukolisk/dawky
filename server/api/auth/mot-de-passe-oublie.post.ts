// server/api/auth/mot-de-passe-oublie.post.ts
// Mot de passe oublié (F-03, US-41).
//
// Le lien de réinitialisation est généré par Supabase (admin.generateLink)
// mais envoyé par nos soins via Resend : email en français aux couleurs de
// Dawky, sans dépendre du SMTP configuré dans Supabase.
//
// La réponse est toujours la même, que le compte existe ou non, pour ne pas
// révéler quelles adresses sont inscrites.
import { z } from 'zod'
import { createError } from 'h3'
import { getSupabaseAdmin } from '~/server/utils/auth'
import { apiSuccess, parseBody, withErrorHandling } from '~/server/utils/api'
import { sendReinitialisationMotDePasse } from '~/server/utils/email'

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email('Adresse email invalide'),
})

const MESSAGE = 'Si un compte existe pour cette adresse, un email vient de partir avec un lien pour choisir un nouveau mot de passe.'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { email } = await parseBody(event, bodySchema)
    const appUrl = useRuntimeConfig().public.appUrl as string

    const { data, error } = await getSupabaseAdmin().auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${appUrl}/mot-de-passe/nouveau` },
    })

    // Compte inexistant : même réponse, aucun email
    if (error || !data?.properties?.action_link) {
      if (error && !/not found|no user/i.test(error.message)) {
        console.error('[Auth] Lien de réinitialisation non généré :', error.message)
      }
      return apiSuccess(null, MESSAGE)
    }

    // L'envoi peut échouer (Resend indisponible) : on le journalise et on
    // le signale, sinon le client attendrait un email qui n'arrivera pas.
    try {
      await sendReinitialisationMotDePasse(email, data.properties.action_link)
    } catch (err) {
      console.error('[Email] Réinitialisation non envoyée :', (err as Error).message)
      throw createError({
        statusCode: 502,
        statusMessage: 'Nous n\'avons pas pu envoyer l\'email pour le moment. Réessayez plus tard ou écrivez-nous depuis la page Aide.',
      })
    }

    return apiSuccess(null, MESSAGE)
  })
})
