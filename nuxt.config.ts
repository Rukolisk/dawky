// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@vueuse/nuxt'],

  components: {
    dirs: [{ path: '~/components', pathPrefix: false }],
  },

  ignore: ['ancien-front/**'],

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Dawky — La box surprise qui s\'adapte à votre chien',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Chaque mois, une box surprise adaptée à la taille de votre chien : friandise, mastication, jouet et accessoire. Sans engagement, livraison offerte.' },
        { name: 'theme-color', content: '#4F0926' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/images/logo-dawky.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Titres : Playfair en attendant les fichiers de Bonny Variable Thin
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700&family=Playfair:ital,opsz,wght@0,5..1200,300;1,5..1200,300&display=swap' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  // L'espace client et le back-office dépendent de la session Supabase,
  // stockée dans le navigateur : rendu côté client uniquement.
  routeRules: {
    '/mon-compte/**': { ssr: false },
    // Réponses du quiz conservées dans le sessionStorage du navigateur
    '/quiz': { ssr: false },
    '/quiz/**': { ssr: false },
    // La session de récupération arrive dans l'URL (#access_token=…)
    '/mot-de-passe/**': { ssr: false },
    '/admin/**': { ssr: false },
    '/commande': { ssr: false },
    '/commande/**': { ssr: false },
    '/offrir/commande': { ssr: false },
    '/paiement/**': { ssr: false },
  },

  css: ['~/assets/css/main.css', '~/assets/css/auth.css', '~/assets/css/admin.css'],

  runtimeConfig: {
    // Serveur uniquement
    databaseUrl:       process.env.DATABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    resendApiKey:      process.env.RESEND_API_KEY,
    emailFrom:         process.env.EMAIL_FROM    ?? 'Dawky <onboarding@resend.dev>',
    emailReplyTo:      process.env.EMAIL_REPLY_TO ?? 'contact.dawky@gmail.com',
    // Destinataire des notifications internes (allergies, contact)
    emailEquipe:       process.env.EMAIL_EQUIPE ?? '',
    stripeSecretKey:     process.env.STRIPE_SECRET_KEY ?? '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',

    public: {
  supabaseUrl:      process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  supabaseAnonKey:  process.env.NUXT_PUBLIC_SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY,
  supabaseKey:      process.env.NUXT_PUBLIC_SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY, // <--- AJOUTE CETTE LIGNE
  appUrl:           process.env.APP_URL ?? 'http://localhost:3000',
  // Clé publiable Stripe (pk_test_… / pk_live_…), sans danger côté navigateur
  stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || '',
  // Code enseigne Mondial Relay (« BDTEST » = test, à remplacer en production)
  mondialRelayBrand: process.env.NUXT_PUBLIC_MONDIAL_RELAY_BRAND || process.env.MONDIAL_RELAY_BRAND || 'BDTEST  ',
  brandName:        'Dawky',
},
  },

  // Tâches planifiées (server/tasks/**) — heure du serveur
  nitro: {
    experimental: { tasks: true },
    scheduledTasks: {
      // Tous les jours à 6h : retrait des invendus à J-30, reprise des
      // pauses, rappels de fin de cadeau, anniversaires
      '0 6 * * *': ['invendus:retrait', 'abonnements:quotidien', 'chiens:anniversaires'],
    },
  },

  typescript: { strict: true, typeCheck: false },

  vite: {
    // Supprime le faux positif "#app-manifest" en pre-transform (bug Nuxt 3.13)
    optimizeDeps: {
      exclude: ['#app-manifest'],
    },
  },
  compatibilityDate: '2024-11-01',
})
