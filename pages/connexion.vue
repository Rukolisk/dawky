<!-- pages/connexion.vue (US-02) -->
<template>
  <div class="auth">
    <LogoDawky :hauteur="44" />
    <h1 class="titre-2">Bon retour <em>parmi nous.</em></h1>

    <p v-if="route.query.confirme" class="info" role="status">Votre email est confirmé : connectez-vous pour continuer.</p>
    <p v-if="route.query.reinitialise" class="info" role="status">Votre mot de passe est modifié : connectez-vous.</p>

    <form class="auth-form" novalidate @submit.prevent="connecter">
      <div class="champ">
        <label for="c-email">Email</label>
        <input id="c-email" v-model.trim="email" class="input" type="email" autocomplete="email" required />
      </div>
      <div class="champ">
        <label for="c-mdp">Mot de passe</label>
        <input id="c-mdp" v-model="motDePasse" class="input" type="password" autocomplete="current-password" required />
        <NuxtLink to="/mot-de-passe-oublie" class="lien petit">Mot de passe oublié&nbsp;?</NuxtLink>
      </div>
      <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>
      <button class="btn btn-principal btn-grand btn-bloc" :disabled="envoi">
        {{ envoi ? 'Connexion…' : 'Se connecter' }}
      </button>
    </form>

    <p class="petit">Pas encore de compte&nbsp;? <NuxtLink :to="{ path: '/inscription', query: route.query.redirect ? { redirect: route.query.redirect } : {} }" class="lien">Créer un compte</NuxtLink></p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'scinde', visuelADroite: true, visuel: '/images/photos/connexion.jpg' })
useSeoMeta({ title: 'Connexion — Dawky' })

const route = useRoute()
const { signIn, isAdmin, profilManquant } = useAuth()
const email = ref('')
const motDePasse = ref('')
const erreur = ref('')
const envoi = ref(false)

async function connecter() {
  erreur.value = ''
  if (!email.value || !motDePasse.value) {
    erreur.value = 'Saisissez votre email et votre mot de passe.'
    return
  }
  envoi.value = true
  try {
    await signIn(email.value, motDePasse.value)
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : null
    // Compte sans profil Dawky (profil effacé) : on le complète d'abord
    if (profilManquant.value) {
      await navigateTo({ path: '/inscription', query: { completer: '1', ...(redirect ? { redirect } : {}) } })
      return
    }
    await navigateTo(redirect ?? (isAdmin.value ? '/admin' : '/mon-compte'))
  } catch (err) {
    erreur.value = (err as Error).message
  } finally {
    envoi.value = false
  }
}
</script>
