// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@vueuse/nuxt'],

  components: {
    dirs: [{ path: '~/components', pathPrefix: false }],
  },

  app: {
    head: {
      title: 'DAWKY — La Box Premium pour Chiens',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Dawky — la box pour chiens qui s\'adapte à votre compagnon. Box Surprise mensuelle ou À la Carte, tailles XS, S, M, L.' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Serveur uniquement
    databaseUrl:       process.env.DATABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    resendApiKey:      process.env.RESEND_API_KEY,
    emailFrom:         process.env.EMAIL_FROM    ?? 'Dawky <onboarding@resend.dev>',
    emailReplyTo:      process.env.EMAIL_REPLY_TO ?? 'contact.dawky@gmail.com',

    public: {
      supabaseUrl:      process.env.SUPABASE_URL,
      supabaseAnonKey:  process.env.SUPABASE_ANON_KEY,
      appUrl:           process.env.APP_URL ?? 'http://localhost:3000',
      brandName:        'Dawky',
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
