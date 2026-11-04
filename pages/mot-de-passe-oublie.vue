<!-- pages/mot-de-passe-oublie.vue (F-03, US-41) -->
<template>
  <div class="auth">
    <LogoDawky :hauteur="44" />
    <h1 class="titre-2">Mot de passe <em>oublié&nbsp;?</em></h1>

    <p v-if="envoye" class="info" role="status">
      Si un compte existe pour {{ email }}, vous allez recevoir un email avec un lien pour choisir un nouveau mot de passe.
      Pensez à regarder vos courriers indésirables.
    </p>
    <form v-else class="auth-form" novalidate @submit.prevent="envoyer">
      <p>Indiquez l'email de votre compte : nous vous envoyons un lien pour choisir un nouveau mot de passe.</p>
      <div class="champ">
        <label for="m-email">Email</label>
        <input id="m-email" v-model.trim="email" class="input" type="email" autocomplete="email" required />
      </div>
      <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>
      <button class="btn btn-principal btn-grand btn-bloc" :disabled="envoi">Recevoir le lien</button>
    </form>

    <NuxtLink to="/connexion" class="lien petit">Retour à la connexion</NuxtLink>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'scinde', visuelADroite: true, visuel: '/images/photos/connexion.jpg' })
useSeoMeta({ title: 'Mot de passe oublié — Dawky' })

const { demanderReinitialisation } = useAuth()
const email = ref('')
const erreur = ref('')
const envoi = ref(false)
const envoye = ref(false)

async function envoyer() {
  erreur.value = ''
  if (!/^\S+@\S+\.\S+$/.test(email.value)) return (erreur.value = 'Saisissez une adresse email valide.')
  envoi.value = true
  try {
    await demanderReinitialisation(email.value)
    envoye.value = true
  } catch (err) {
    erreur.value = (err as Error).message
  } finally {
    envoi.value = false
  }
}
</script>
