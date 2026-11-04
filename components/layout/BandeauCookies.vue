<!-- components/layout/BandeauCookies.vue — affiché à la première visite -->
<template>
  <ClientOnly>
    <div v-if="!aChoisi && route.path !== '/cookies' && !route.path.startsWith('/admin')" class="bandeau" role="region" aria-label="Cookies">
      <p class="petit">Dawky utilise des cookies pour le site, la mesure d'audience et le marketing. À vous de choisir.</p>
      <div class="actions">
        <NuxtLink to="/cookies" class="btn btn-secondaire">Personnaliser</NuxtLink>
        <button type="button" class="btn btn-secondaire" @click="enregistrer(false, false)">Tout refuser</button>
        <button type="button" class="btn btn-noir" @click="enregistrer(true, true)">Tout accepter</button>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const route = useRoute()
const { aChoisi, enregistrer } = useConsentement()
</script>

<style scoped>
.bandeau {
  position: fixed;
  left: var(--e2);
  right: var(--e2);
  bottom: var(--e2);
  z-index: 90;
  max-width: 1100px;
  margin-inline: auto;
  background: var(--blanc);
  border: 1px solid var(--noir);
  padding: var(--e2) var(--e3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--e3);
  flex-wrap: wrap;
}
.bandeau p {
  flex: 1 1 320px;
}
.actions {
  display: flex;
  gap: var(--e1);
  flex-wrap: wrap;
}
@media (max-width: 600px) {
  .actions,
  .actions .btn {
    width: 100%;
  }
}
</style>
