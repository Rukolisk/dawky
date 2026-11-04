<!-- components/ui/LogoDawky.vue
     Logo vectoriel (extrait de la maquette). Prend la couleur du texte
     parent : noir sur fond clair, blanc sur fond burgundy / noir. -->
<template>
  <NuxtLink :to="lien" class="logo" aria-label="Dawky, retour à l'accueil">
    <span class="logo-svg" :style="{ height: `${hauteur}px` }" aria-hidden="true" v-html="svg" />
  </NuxtLink>
</template>

<script setup lang="ts">
import svg from '~/public/images/logo-dawky.svg?raw'

withDefaults(defineProps<{ hauteur?: number; lien?: string }>(), { hauteur: 44, lien: '/' })
</script>

<style scoped>
.logo {
  display: inline-flex;
  color: inherit;
}
.logo-svg {
  display: block;
  aspect-ratio: 222 / 98;
}
.logo-svg :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
