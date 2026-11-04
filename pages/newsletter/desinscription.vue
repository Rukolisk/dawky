<!-- pages/newsletter/desinscription.vue — lien de désinscription des emails
     newsletter (retrait du consentement, RGPD) -->
<template>
  <div class="conteneur page">
    <h1 class="titre-2">Newsletter</h1>
    <p v-if="etat === 'encours'" role="status">Un instant…</p>
    <template v-else-if="etat === 'ok'">
      <p class="sous-titre" role="status">C'est fait, vous ne recevrez plus la newsletter Dawky.</p>
      <p>Vos box, commandes et emails liés à votre compte ne sont pas concernés.</p>
    </template>
    <p v-else class="message-erreur" role="alert">
      Ce lien de désinscription est incomplet ou n'est plus valable. Écrivez-nous depuis la page
      <NuxtLink to="/aide#contact" class="lien">Aide</NuxtLink> et nous vous désinscrirons.
    </p>
    <NuxtLink to="/" class="btn btn-secondaire">Retour à l'accueil</NuxtLink>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Désinscription de la newsletter — Dawky', robots: 'noindex' })

const route = useRoute()
const etat = ref<'encours' | 'ok' | 'erreur'>('encours')

onMounted(async () => {
  const token = route.query.token
  if (typeof token !== 'string' || !token) {
    etat.value = 'erreur'
    return
  }
  try {
    await api('/api/newsletter/desinscription', { method: 'POST', body: { token } })
    etat.value = 'ok'
  } catch {
    etat.value = 'erreur'
  }
})
</script>

<style scoped>
.page {
  padding-block: var(--e6) var(--e7);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--e3);
  min-height: 50vh;
}
</style>
