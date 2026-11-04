// server/utils/stripe.ts
// ─────────────────────────────────────────
// Paiement Stripe (Checkout intégré à la page).
//
// Les montants sont TOUJOURS calculés côté serveur à partir de la base et
// passés à Stripe en `price_data` : pas de prix à recréer dans le
// dashboard Stripe quand l'admin change un tarif.
//
// Chaque session porte `metadata.kind` + `metadata.id` pour que le
// webhook retrouve l'entité à mettre à jour.
// ─────────────────────────────────────────
import Stripe from 'stripe'
import { createError } from 'h3'
import prisma from './prisma'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (_stripe) return _stripe
  const config = useRuntimeConfig()
  if (!config.stripeSecretKey) {
    throw createError({ statusCode: 503, statusMessage: 'Paiement indisponible : STRIPE_SECRET_KEY manquant' })
  }
  _stripe = new Stripe(config.stripeSecretKey as string)
  return _stripe
}

export type KindPaiement = 'abonnement' | 'commande' | 'cadeau'

interface ClientStripe {
  id: string
  email: string
  prenom: string
  nom: string
  stripeCustomerId: string | null
}

/**
 * Retourne le customer Stripe du client, en le créant au besoin.
 */
export async function getOrCreateCustomer(client: ClientStripe): Promise<string> {
  if (client.stripeCustomerId) return client.stripeCustomerId

  const customer = await getStripe().customers.create({
    email: client.email,
    name: `${client.prenom} ${client.nom}`,
    metadata: { clientId: client.id },
  })
  await prisma.client.update({
    where: { id: client.id },
    data: { stripeCustomerId: customer.id },
  })
  return customer.id
}

/**
 * Coupon à usage unique pour une remise déjà calculée côté serveur.
 */
async function creerCoupon(remise: number, libelle: string): Promise<string> {
  const coupon = await getStripe().coupons.create({
    amount_off: remise,
    currency: 'eur',
    duration: 'once',
    name: libelle.slice(0, 40),
    max_redemptions: 1,
  })
  return coupon.id
}

// Checkout intégré à la page de commande (Stripe Embedded Checkout) :
// le formulaire de carte s'affiche chez nous mais reste hébergé par Stripe.
// Après paiement, Stripe redirige vers la page de confirmation.
function modeIntegre() {
  const appUrl = useRuntimeConfig().public.appUrl as string
  return {
    ui_mode: 'embedded_page' as const,
    return_url: `${appUrl}/paiement/confirmation?session_id={CHECKOUT_SESSION_ID}`,
  }
}

export interface LigneCheckout { libelle: string; montant: number; quantite?: number }

/**
 * Session Checkout pour un paiement unique (Compose ta box, saisonnière,
 * abonnement cadeau prépayé). Une facture est générée par Stripe.
 */
export async function creerSessionPaiement(opts: {
  kind: Exclude<KindPaiement, 'abonnement'>
  id: string
  client: ClientStripe
  lignes: LigneCheckout[]
  remise: number
  libelleRemise?: string
  // Origine de la remise ("promo", "filleul", "parrain"), relue par le webhook
  sourceRemise?: string
}) {
  const customer = await getOrCreateCustomer(opts.client)
  const discounts = opts.remise > 0
    ? [{ coupon: await creerCoupon(opts.remise, opts.libelleRemise ?? 'Réduction') }]
    : undefined
  const metadata = { kind: opts.kind, id: opts.id, sourceRemise: opts.sourceRemise ?? '' }

  return getStripe().checkout.sessions.create({
    mode: 'payment',
    customer,
    locale: 'fr',
    line_items: opts.lignes.map(l => ({
      quantity: l.quantite ?? 1,
      price_data: {
        currency: 'eur',
        unit_amount: l.montant,
        product_data: { name: l.libelle },
      },
    })),
    discounts,
    invoice_creation: { enabled: true },
    metadata,
    payment_intent_data: { metadata },
    // La réservation de stock est libérée à l'expiration (webhook)
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    ...modeIntegre(),
  })
}

/**
 * Session Checkout pour l'abonnement mensuel Box Surprise.
 * La remise éventuelle (code promo, parrainage) porte sur le 1er mois.
 */
export async function creerSessionAbonnement(opts: {
  abonnementId: string
  client: ClientStripe
  libelle: string
  prixMensuel: number
  remise: number
  libelleRemise?: string
  sourceRemise?: string
}) {
  const customer = await getOrCreateCustomer(opts.client)
  const discounts = opts.remise > 0
    ? [{ coupon: await creerCoupon(opts.remise, opts.libelleRemise ?? 'Réduction') }]
    : undefined
  const metadata = { kind: 'abonnement', id: opts.abonnementId, sourceRemise: opts.sourceRemise ?? '' }

  return getStripe().checkout.sessions.create({
    mode: 'subscription',
    customer,
    locale: 'fr',
    line_items: [{
      quantity: 1,
      price_data: {
        currency: 'eur',
        unit_amount: opts.prixMensuel,
        recurring: { interval: 'month' },
        product_data: { name: opts.libelle },
      },
    }],
    discounts,
    metadata,
    subscription_data: { metadata },
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    ...modeIntegre(),
  })
}

/**
 * Change le prix mensuel d'un abonnement Stripe sans prorata :
 * le nouveau tarif s'applique à la prochaine échéance.
 */
export async function changerPrixAbonnement(stripeSubscriptionId: string, prixMensuel: number) {
  const stripe = getStripe()
  const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId)
  const item = sub.items.data[0]
  if (!item) throw createError({ statusCode: 500, statusMessage: 'Abonnement Stripe sans ligne' })

  const product = typeof item.price.product === 'string' ? item.price.product : item.price.product.id
  await stripe.subscriptions.update(stripeSubscriptionId, {
    items: [{
      id: item.id,
      price_data: {
        currency: 'eur',
        product,
        unit_amount: prixMensuel,
        recurring: { interval: 'month' },
      },
    }],
    proration_behavior: 'none',
  })
}

/**
 * Applique une réduction de X % sur la prochaine échéance d'un abonnement
 * (récompense de parrainage).
 */
export async function appliquerReductionAbonnement(stripeSubscriptionId: string, pourcentage: number) {
  const stripe = getStripe()
  const coupon = await stripe.coupons.create({
    percent_off: pourcentage,
    duration: 'once',
    name: 'Parrainage Dawky',
  })
  await stripe.subscriptions.update(stripeSubscriptionId, { discounts: [{ coupon: coupon.id }] })
}

/**
 * Fin de la période en cours d'un abonnement Stripe.
 * Depuis l'API 2025-03, la période est portée par les items.
 */
export function finPeriodeStripe(sub: Stripe.Subscription): Date | null {
  const fin = sub.items.data[0]?.current_period_end
  return fin ? new Date(fin * 1000) : null
}
