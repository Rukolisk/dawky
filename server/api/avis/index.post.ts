// server/api/avis/index.post.ts
// Dépôt d'un avis avec photo facultative (F-55). Publié après modération.
// Multipart : champs `note`, `commentaire`, fichier `photo` (jpeg/png/webp, 5 Mo max)
import { z } from 'zod'
import { createError, readMultipartFormData } from 'h3'
import prisma from '~/server/utils/prisma'
import { getSupabaseAdmin, requireAuth } from '~/server/utils/auth'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'

const champsSchema = z.object({
  note:        z.coerce.number().int().min(1).max(5),
  commentaire: z.string().trim().min(10, 'Commentaire trop court').max(1000),
})

const TYPES_IMAGE: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const TAILLE_MAX = 5 * 1024 * 1024
const BUCKET = 'avis'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)

    // Réservé aux clients ayant reçu au moins une box
    const aRecu = await prisma.commande.count({ where: { clientId: client.id, statut: { in: ['EXPEDIEE', 'LIVREE'] } } })
    if (aRecu === 0) throw createError({ statusCode: 403, statusMessage: 'Vous pourrez donner votre avis après réception de votre première box' })

    const parts = (await readMultipartFormData(event)) ?? []
    const champs = Object.fromEntries(parts.filter(p => !p.filename).map(p => [p.name, p.data.toString('utf8')]))
    const parsed = champsSchema.safeParse(champs)
    if (!parsed.success) {
      throw createError({ statusCode: 400, statusMessage: 'Validation échouée', data: parsed.error.flatten().fieldErrors })
    }

    let photoUrl: string | null = null
    const photo = parts.find(p => p.name === 'photo' && p.filename)
    if (photo) {
      const ext = photo.type ? TYPES_IMAGE[photo.type] : undefined
      if (!ext) throw createError({ statusCode: 400, statusMessage: 'Format de photo accepté : JPEG, PNG ou WebP' })
      if (photo.data.length > TAILLE_MAX) throw createError({ statusCode: 400, statusMessage: 'Photo trop lourde (5 Mo maximum)' })

      const chemin = `${client.id}/${Date.now()}.${ext}`
      const storage = getSupabaseAdmin().storage.from(BUCKET)
      const { error } = await storage.upload(chemin, photo.data, { contentType: photo.type })
      if (error) {
        console.error('[Avis] Upload photo échoué :', error.message)
        throw createError({ statusCode: 502, statusMessage: 'Envoi de la photo impossible, réessayez plus tard' })
      }
      photoUrl = storage.getPublicUrl(chemin).data.publicUrl
    }

    const avis = await prisma.avis.create({
      data: { clientId: client.id, note: parsed.data.note, commentaire: parsed.data.commentaire, photoUrl },
    })
    return apiSuccess({ id: avis.id }, 'Merci ! Votre avis sera publié après relecture.')
  })
})
