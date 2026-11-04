<!-- error.vue — pages introuvables et erreurs -->
<template>
  <NuxtLayout>
    <section class="conteneur erreur">
      <p class="surtitre">Erreur {{ error?.statusCode }}</p>
      <h1 class="titre-2">{{ est404 ? 'Cette page s\'est fait la malle.' : 'Oups, quelque chose s\'est mal passé.' }}</h1>
      <p>{{ est404 ? 'Elle n\'existe pas ou plus. Pas de panique, la box de votre chien vous attend toujours.' : 'Réessayez dans un instant. Si le problème persiste, écrivez-nous.' }}</p>
      <div class="actions">
        <button class="btn btn-principal btn-grand" @click="clearError({ redirect: '/' })">Retour à l'accueil</button>
        <NuxtLink to="/aide" class="lien" @click="clearError()">Besoin d'aide&nbsp;?</NuxtLink>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const est404 = computed(() => props.error?.statusCode === 404)
useSeoMeta({ title: () => (est404.value ? 'Page introuvable — Dawky' : 'Erreur — Dawky') })
</script>

<style scoped>
.erreur {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--e3);
  padding-block: var(--e7);
  min-height: 60vh;
}
.erreur h1 {
  max-width: 900px;
}
.actions {
  display: flex;
  align-items: center;
  gap: var(--e3);
  flex-wrap: wrap;
}
</style>
