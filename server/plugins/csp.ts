// server/plugins/csp.ts
// ─────────────────────────────────────────
// Politique de sécurité du contenu (CSP) des pages HTML.
//
// Un nonce aléatoire est généré à chaque requête et ajouté aux balises
// <script> rendues par Nuxt. Avec 'strict-dynamic', seuls ces scripts —
// et ceux qu'ils chargent eux-mêmes (Stripe.js, widget Mondial Relay,
// Leaflet) — peuvent s'exécuter : un script injecté dans la page par une
// faille XSS est bloqué par le navigateur.
//
// Désactivée en développement (le rechargement à chaud de Vite utilise
// des scripts et des websockets que la CSP bloquerait).
// ─────────────────────────────────────────
import { randomBytes } from 'node:crypto'
import { setHeader } from 'h3'

export function politiqueCsp(nonce: string, supabaseUrl: string): string {
  const supabase = supabaseUrl ? new URL(supabaseUrl).origin : ''
  const supabaseWs = supabase.replace(/^https:/, 'wss:')
  return [
    `default-src 'self'`,
    // 'unsafe-inline' et https: ne servent qu'aux vieux navigateurs : ils sont
    // ignorés dès que le navigateur comprend le nonce et 'strict-dynamic'
    `script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https:`,
    // Styles inline nécessaires aux liaisons :style de Vue et au widget relais
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com https://widget.mondialrelay.com`,
    `font-src 'self' data: https://fonts.gstatic.com`,
    // Photos d'avis (Supabase), tuiles de carte, images Stripe et Mondial Relay
    `img-src 'self' data: blob: ${supabase} https://*.stripe.com https://*.tile.openstreetmap.org https://unpkg.com https://*.mondialrelay.com https://*.mondialrelay.fr`,
    `connect-src 'self' ${supabase} ${supabaseWs} https://api.stripe.com https://*.stripe.com https://widget.mondialrelay.com`,
    // Formulaire de paiement Stripe (iframes)
    `frame-src https://js.stripe.com https://*.stripe.com https://checkout.stripe.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ')
}

// Ajoute le nonce à chaque balise <script> qui n'en a pas déjà
export function ajouterNonce(html: string, nonce: string): string {
  return html.replace(/<script(?![^>]*\snonce=)/g, `<script nonce="${nonce}"`)
}

export default defineNitroPlugin((nitroApp) => {
  if (import.meta.dev) return

  nitroApp.hooks.hook('render:html', (html, { event }) => {
    const nonce = randomBytes(16).toString('base64')
    html.head = html.head.map(h => ajouterNonce(h, nonce))
    html.bodyPrepend = html.bodyPrepend.map(h => ajouterNonce(h, nonce))
    html.body = html.body.map(h => ajouterNonce(h, nonce))
    html.bodyAppend = html.bodyAppend.map(h => ajouterNonce(h, nonce))

    const supabaseUrl = (useRuntimeConfig().public.supabaseUrl as string) || ''
    setHeader(event, 'Content-Security-Policy', politiqueCsp(nonce, supabaseUrl))
  })
})
