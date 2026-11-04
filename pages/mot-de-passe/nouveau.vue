<!-- pages/mot-de-passe/nouveau.vue — arrivée depuis le lien de
     réinitialisation : Supabase ouvre une session de récupération. -->
<template>
  <div class="auth">
    <LogoDawky :hauteur="44" />
    <h1 class="titre-2">Nouveau <em>mot de passe</em></h1>

    <p v-if="!isLoggedIn" class="message-erreur">
      Ce lien a expiré ou a déjà servi. <NuxtLink to="/mot-de-passe-oublie" class="lien">Demander un nouveau lien</NuxtLink>
    </p>
    <form v-else class="auth-form" novalidate @submit.prevent="enregistrer">
      <div class="champ">
        <label for="n-mdp">Nouveau mot de passe</label>
        <input id="n-mdp" v-model="motDePasse" class="input" type="password" autocomplete="new-password" minlength="6" required />
        <p class="aide-champ">6 caractères minimum.</p>
      </div>
      <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>
      <button class="btn btn-principal btn-grand btn-bloc" :disabled="envoi">Enregistrer</button>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'scinde', visuelADroite: true, visuel: '/images/photos/connexion.jpg' })
useSeoMeta({ title: 'Nouveau mot de passe — Dawky' })

const { isLoggedIn, changerMotDePasse } = useAuth()
const toast = useToast()
const motDePasse = ref('')
const erreur = ref('')
const envoi = ref(false)

async function enregistrer() {
  erreur.value = ''
  if (motDePasse.value.length < 6) return (erreur.value = 'Le mot de passe doit contenir au moins 6 caractères.')
  envoi.value = true
  try {
    await changerMotDePasse(motDePasse.value)
    toast.success('Mot de passe modifié')
    await navigateTo('/mon-compte')
  } catch (err) {
    erreur.value = (err as Error).message
  } finally {
    envoi.value = false
  }
}
</script>
