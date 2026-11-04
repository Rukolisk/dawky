<!-- components/layout/NewsletterForm.vue — inscription newsletter (US-14) -->
<template>
  <form class="newsletter" novalidate @submit.prevent="envoyer">
    <template v-if="!envoye">
      <div class="champ">
        <label for="nl-prenom">Prénom</label>
        <input id="nl-prenom" v-model.trim="prenom" class="input" autocomplete="given-name" />
      </div>
      <div class="champ">
        <label for="nl-email">Email</label>
        <input
          id="nl-email" v-model.trim="email" class="input" type="email" autocomplete="email" required
          :aria-invalid="!!erreur" aria-describedby="nl-erreur"
        />
      </div>
      <button class="btn btn-clair" :disabled="envoi">Recevoir la newsletter</button>
    </template>
    <p v-else class="sous-titre" role="status">Merci, c'est noté ! Un email de confirmation vient de partir.</p>
    <p v-if="erreur" id="nl-erreur" class="erreur-newsletter" role="alert">{{ erreur }}</p>
  </form>
</template>

<script setup lang="ts">
const prenom = ref('')
const email = ref('')
const envoi = ref(false)
const envoye = ref(false)
const erreur = ref('')

async function envoyer() {
  erreur.value = ''
  if (!/^\S+@\S+\.\S+$/.test(email.value)) {
    erreur.value = 'Saisissez une adresse email valide.'
    return
  }
  envoi.value = true
  try {
    await api('/api/newsletter', { method: 'POST', body: { email: email.value, prenom: prenom.value || undefined } })
    envoye.value = true
  } catch (err) {
    erreur.value = versApiError(err).message
  } finally {
    envoi.value = false
  }
}
</script>

<style scoped>
.newsletter {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}
.newsletter .champ {
  flex: 1 1 220px;
}
.newsletter .champ label {
  font-size: 15px;
  font-weight: 400;
}
.newsletter .input {
  background: transparent;
  border-color: var(--blanc);
  color: var(--blanc);
}
.newsletter .input:focus {
  border-color: var(--blanc);
  box-shadow: 0 0 0 1px var(--blanc);
}
.erreur-newsletter {
  flex-basis: 100%;
  font-size: 15px;
}
</style>
