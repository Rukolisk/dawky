// server/api/auth/export.get.ts
// Droit à la portabilité (RGPD) : export JSON de toutes les données du client
import { setHeader } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { withErrorHandling } from '~/server/utils/api'
import { chienInclude } from '~/server/utils/chiens'

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    const { client } = await requireAuth(event)

    const [adresses, chiens, abonnements, cadeaux, commandes, quiz, avis, contacts, newsletter, parrainages] = await Promise.all([
      prisma.adresse.findMany({ where: { clientId: client.id } }),
      prisma.chien.findMany({ where: { clientId: client.id }, include: chienInclude }),
      prisma.abonnement.findMany({ where: { clientId: client.id } }),
      prisma.abonnementCadeau.findMany({ where: { acheteurId: client.id } }),
      prisma.commande.findMany({
        where: { clientId: client.id },
        include: { selections: { include: { produit: { select: { nom: true } } } } },
      }),
      prisma.quizResult.findMany({ where: { clientId: client.id } }),
      prisma.avis.findMany({ where: { clientId: client.id } }),
      prisma.contact.findMany({ where: { clientId: client.id } }),
      prisma.newsletter.findUnique({ where: { email: client.email } }),
      prisma.parrainage.findMany({ where: { parrainId: client.id }, include: { filleul: { select: { prenom: true } } } }),
    ])

    const { supabaseUid: _uid, stripeCustomerId: _stripe, ...profil } = client

    setHeader(event, 'Content-Disposition', 'attachment; filename="dawky-mes-donnees.json"')
    return {
      exporteLe: new Date().toISOString(),
      profil,
      adresses,
      chiens,
      abonnements,
      cadeauxOfferts: cadeaux,
      commandes,
      quiz,
      avis,
      messages: contacts,
      newsletter: newsletter ? { email: newsletter.email, actif: newsletter.actif, consentementLe: newsletter.consentementLe } : null,
      parrainages,
    }
  })
})
