// server/utils/paiement.ts
// ─────────────────────────────────────────
// Effets des événements de paiement Stripe.
//
// Toutes les fonctions sont idempotentes (mise à jour conditionnée au
// statut précédent) : Stripe peut renvoyer un même événement plusieurs
// fois, et la page de confirmation peut appeler `traiterCheckoutComplete`
// avant que le webhook n'arrive.
// ─────────────────────────────────────────
import type Stripe from 'stripe'
import prisma from './prisma'
import { finPeriodeStripe, getStripe } from './stripe'
import { apresPaiement } from './promo'
import { annulerCommandeNonPayee } from './commandes'
import { adresseUneLigne } from './livraison'
import { prochaineExpedition } from './metier'
import {
  sendAbonnementConfirmation,
  sendCadeauAnnonce,
  sendCadeauConfirmation,
  sendCommandeConfirmation,
  sendRappelRenouvellement,
} from './email'

function idDe(ref: string | { id: string } | null | undefined): string | null {
  if (!ref) return null
  return typeof ref === 'string' ? ref : ref.id
}

function logEmail(type: string) {
  return (err: Error) => console.error(`[Email] ${type} non envoyé :`, err.message)
}

// ─── Checkout ─────────────────────────────

export async function traiterCheckoutComplete(session: Stripe.Checkout.Session) {
  const { kind, id, sourceRemise } = session.metadata ?? {}
  if (!kind || !id) return
  // Paiement différé (virement…) : on attend async_payment_succeeded
  if (session.payment_status === 'unpaid') return

  if (kind === 'abonnement') await activerAbonnement(id, session, sourceRemise)
  else if (kind === 'commande') await confirmerCommande(id, session, sourceRemise)
  else if (kind === 'cadeau') await activerCadeau(id, sourceRemise)
}

export async function traiterCheckoutExpire(session: Stripe.Checkout.Session) {
  const { kind, id } = session.metadata ?? {}
  if (!kind || !id) return

  if (kind === 'commande') {
    await annulerCommandeNonPayee(id)
  } else if (kind === 'abonnement') {
    await prisma.abonnement.updateMany({ where: { id, statut: 'EN_ATTENTE_PAIEMENT' }, data: { statut: 'ANNULE' } })
  } else if (kind === 'cadeau') {
    await prisma.abonnementCadeau.updateMany({ where: { id, statut: 'EN_ATTENTE_PAIEMENT' }, data: { statut: 'ANNULE' } })
  }
}

async function activerAbonnement(id: string, session: Stripe.Checkout.Session, sourceRemise?: string) {
  const subscriptionId = idDe(session.subscription)
  if (!subscriptionId) return
  const sub = await getStripe().subscriptions.retrieve(subscriptionId)

  const { count } = await prisma.abonnement.updateMany({
    where: { id, statut: 'EN_ATTENTE_PAIEMENT' },
    data: {
      statut: 'ACTIF',
      dateDebut: new Date(),
      finPeriode: finPeriodeStripe(sub),
      stripeSubscriptionId: subscriptionId,
    },
  })
  if (count === 0) return

  const abo = await prisma.abonnement.findUniqueOrThrow({
    where: { id },
    include: { client: true, chien: { include: { allergenes: { include: { allergene: true } } } }, adresse: true },
  })
  await apresPaiement(abo.clientId, sourceRemise, abo.codePromoId)

  sendAbonnementConfirmation(abo.client.email, {
    prenom: abo.client.prenom,
    nomChien: abo.chien.nom,
    taille: abo.taille,
    prixMensuel: abo.prixMensuel,
    premiereLivraison: prochaineExpedition(),
    livraison: abo.modeLivraison === 'POINT_RELAIS'
      ? `Point relais : ${abo.pointRelaisLibelle ?? ''}`
      : abo.adresse ? adresseUneLigne(abo.adresse) : '',
    allergenes: abo.chien.allergenes.map(a => a.allergene.nom),
  }).catch(logEmail('Confirmation abonnement'))
}

async function confirmerCommande(id: string, session: Stripe.Checkout.Session, sourceRemise?: string) {
  const invoiceId = idDe(session.invoice)
  let factureUrl: string | null = null
  if (invoiceId) {
    try {
      const invoice = await getStripe().invoices.retrieve(invoiceId)
      factureUrl = invoice.invoice_pdf ?? invoice.hosted_invoice_url ?? null
    } catch (err) {
      console.error('[Paiement] Facture introuvable :', err)
    }
  }

  const { count } = await prisma.commande.updateMany({
    where: { id, statut: 'EN_ATTENTE_PAIEMENT' },
    data: { statut: 'PAYEE', stripeInvoiceId: invoiceId, factureUrl },
  })
  if (count === 0) return

  const commande = await prisma.commande.findUniqueOrThrow({
    where: { id },
    include: {
      client: true,
      formula: true,
      chien: { include: { allergenes: { include: { allergene: true } } } },
      selections: { include: { produit: true } },
    },
  })
  await apresPaiement(commande.clientId, sourceRemise, commande.codePromoId)

  sendCommandeConfirmation(commande.client.email, {
    prenom: commande.client.prenom,
    numero: commande.numero,
    titreCommande: commande.type === 'COMPOSE' ? 'Compose ta box' : commande.formula?.nom ?? 'box',
    nomChien: commande.chien?.nom,
    taille: commande.taille,
    produits: commande.selections.map(s => `${s.produit.emoji} ${s.produit.nom}${s.quantite > 1 ? ` × ${s.quantite}` : ''}`),
    total: commande.total,
    sansAllergenes: commande.chien?.allergenes.map(a => a.allergene.nom) ?? [],
  }).catch(logEmail('Confirmation commande'))
}

async function activerCadeau(id: string, sourceRemise?: string) {
  const { count } = await prisma.abonnementCadeau.updateMany({
    where: { id, statut: 'EN_ATTENTE_PAIEMENT' },
    data: { statut: 'ACTIF', dateDebut: new Date() },
  })
  if (count === 0) return

  const cadeau = await prisma.abonnementCadeau.findUniqueOrThrow({ where: { id }, include: { acheteur: true } })
  await apresPaiement(cadeau.acheteurId, sourceRemise, cadeau.codePromoId)

  const destinataire = `${cadeau.destPrenom} ${cadeau.destNom}`
  sendCadeauConfirmation(cadeau.acheteur.email, {
    prenom: cadeau.acheteur.prenom,
    dureeMois: cadeau.dureeMois,
    taille: cadeau.taille,
    total: cadeau.total,
    destinataire,
    adresse: adresseUneLigne({
      prenom: cadeau.destPrenom, nom: cadeau.destNom, ligne1: cadeau.destLigne1, ligne2: cadeau.destLigne2,
      codePostal: cadeau.destCodePostal, ville: cadeau.destVille, pays: cadeau.destPays,
    }),
    premiereLivraison: prochaineExpedition(),
  }).catch(logEmail('Confirmation cadeau'))

  if (cadeau.annoncer && cadeau.destEmail) {
    sendCadeauAnnonce(cadeau.destEmail, {
      destPrenom: cadeau.destPrenom,
      acheteurPrenom: cadeau.acheteur.prenom,
      dureeMois: cadeau.dureeMois,
      message: cadeau.message,
    })
      .then(() => prisma.abonnementCadeau.update({ where: { id }, data: { annonceEnvoyeeLe: new Date() } }))
      .catch(logEmail('Annonce cadeau'))
  }
}

// ─── Factures d'abonnement ────────────────

function subscriptionDeFacture(invoice: Stripe.Invoice): string | null {
  return idDe(invoice.parent?.subscription_details?.subscription)
}

export async function traiterFacturePayee(invoice: Stripe.Invoice) {
  const subscriptionId = subscriptionDeFacture(invoice)
  if (!subscriptionId) return
  const finLigne = invoice.lines.data[0]?.period?.end

  await prisma.abonnement.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { ...(finLigne ? { finPeriode: new Date(finLigne * 1000) } : {}) },
  })
  // Un impayé régularisé redevient actif
  await prisma.abonnement.updateMany({
    where: { stripeSubscriptionId: subscriptionId, statut: 'IMPAYE' },
    data: { statut: 'ACTIF' },
  })
}

export async function traiterFactureEchouee(invoice: Stripe.Invoice) {
  const subscriptionId = subscriptionDeFacture(invoice)
  if (!subscriptionId) return
  await prisma.abonnement.updateMany({
    where: { stripeSubscriptionId: subscriptionId, statut: 'ACTIF' },
    data: { statut: 'IMPAYE' },
  })
}

// F-51 : rappel avant renouvellement (Stripe envoie `invoice.upcoming`
// quelques jours avant l'échéance, délai réglable dans le dashboard)
export async function traiterFactureAVenir(invoice: Stripe.Invoice) {
  const subscriptionId = subscriptionDeFacture(invoice)
  if (!subscriptionId) return
  const abo = await prisma.abonnement.findFirst({
    where: { stripeSubscriptionId: subscriptionId, statut: 'ACTIF' },
    include: { client: true },
  })
  if (!abo) return

  const echeance = invoice.next_payment_attempt ?? invoice.period_end
  sendRappelRenouvellement(abo.client.email, {
    prenom: abo.client.prenom,
    date: new Date(echeance * 1000),
    montant: invoice.amount_due,
  }).catch(logEmail('Rappel renouvellement'))
}

export async function traiterAbonnementSupprime(sub: Stripe.Subscription) {
  await prisma.abonnement.updateMany({
    where: { stripeSubscriptionId: sub.id, statut: { not: 'TERMINE' } },
    data: { statut: 'TERMINE', pauseJusquau: null },
  })
  await prisma.abonnement.updateMany({
    where: { stripeSubscriptionId: sub.id, dateFin: null },
    data: { dateFin: new Date() },
  })
}
