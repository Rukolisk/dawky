// server/api/auth/profile.delete.ts
// Droit à l'effacement (RGPD).
//
// Les commandes sont conservées 10 ans (obligation comptable) : on ne
// supprime donc pas la ligne Client, on l'anonymise. Tout le reste
// (chiens, adresses, avis, alertes, quiz, newsletter) est supprimé, les
// abonnements Stripe sont arrêtés immédiatement et le compte Supabase
// Auth est supprimé.
import { createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAuth, getSupabaseAdmin } from '~/server/utils/auth'
import { apiSuccess, withErrorHandling } from '~/server/utils/api'
import { getStripe } from '~/server/utils/stripe'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client, supabaseUser } = await requireAuth(event)

    if (client.role === 'ADMIN') {
      throw createError({ statusCode: 400, statusMessage: 'Un compte administrateur ne peut pas être supprimé depuis l\'espace client.' })
    }

    const cadeauxEnCours = await prisma.abonnementCadeau.count({ where: { acheteurId: client.id, statut: 'ACTIF' } })
    if (cadeauxEnCours > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Un abonnement offert est encore en cours : contactez-nous pour supprimer votre compte avant sa fin.',
      })
    }

    // 1) Arrêter les prélèvements
    const abonnements = await prisma.abonnement.findMany({
      where: { clientId: client.id, stripeSubscriptionId: { not: null }, statut: { notIn: ['TERMINE', 'ANNULE'] } },
    })
    for (const abo of abonnements) {
      try {
        await getStripe().subscriptions.cancel(abo.stripeSubscriptionId!)
      } catch (err) {
        console.error('[RGPD] Annulation Stripe échouée :', err)
        throw createError({ statusCode: 502, statusMessage: 'Impossible d\'arrêter votre abonnement pour le moment, réessayez plus tard.' })
      }
    }

    // 2) Supprimer / anonymiser en base
    await prisma.$transaction([
      prisma.abonnement.updateMany({
        where: { clientId: client.id },
        data: { statut: 'TERMINE', dateFin: new Date(), adresseId: null },
      }),
      prisma.newsletter.deleteMany({ where: { email: client.email } }),
      prisma.quizResult.deleteMany({ where: { OR: [{ clientId: client.id }, { email: client.email }] } }),
      prisma.contact.updateMany({ where: { clientId: client.id }, data: { clientId: null } }),
      prisma.avis.deleteMany({ where: { clientId: client.id } }),
      prisma.alerteStock.deleteMany({ where: { clientId: client.id } }),
      prisma.adresse.deleteMany({ where: { clientId: client.id } }),
      prisma.client.update({
        where: { id: client.id },
        data: {
          supabaseUid: null,
          email:       `supprime+${client.id}@dawky.invalid`,
          prenom:      'Compte',
          nom:         'Supprimé',
          telephone:   null,
          anonymiseLe: new Date(),
        },
      }),
    ])
    // Les chiens sont liés aux abonnements terminés : on efface leurs données
    // personnelles sans casser l'historique.
    await prisma.chienAllergene.deleteMany({ where: { chien: { clientId: client.id } } })
    await prisma.chien.updateMany({
      where: { clientId: client.id },
      data: { nom: 'Supprimé', race: null, dateNaissance: null, comportement: null, allergiesAutres: null, consentementRgpdLe: null },
    })

    // 3) Supprimer le compte de connexion
    const { error } = await getSupabaseAdmin().auth.admin.deleteUser(supabaseUser.id)
    if (error) console.error('[RGPD] Suppression Supabase échouée :', error.message)

    return apiSuccess(null, 'Votre compte a été supprimé')
  })
})
