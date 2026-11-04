<!-- components/ui/VisuelChien.vue
     Photo de chien sur fond uni (photos dans public/images/photos/).
     Sans `src`, affiche un aplat gris aux bonnes proportions.
     La photo remplit son cadre (recadrage) : `position` règle le point
     focal ("50% 20%" pour garder la tête d'un chien cadré haut). -->
<template>
  <div class="visuel" :style="ratio ? { aspectRatio: ratio } : undefined">
    <img
      v-if="src" :src="src" :alt="alt"
      :loading="prioritaire ? 'eager' : 'lazy'"
      :fetchpriority="prioritaire ? 'high' : undefined"
      decoding="async"
      :style="position ? { objectPosition: position } : undefined"
    />
    <span v-else class="sr-only">{{ alt }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  src?: string
  alt?: string
  ratio?: string
  position?: string
  // Image principale visible dès l'arrivée (accueil) : chargée en priorité
  prioritaire?: boolean
}>(), { alt: '' })
</script>

<style scoped>
/* Le cadre fixe la taille (ligne de grille ou aspect-ratio de la page),
   la photo le remplit sans jamais l'agrandir. */
.visuel {
  width: 100%;
  min-height: 1px;
}
.visuel img {
  position: absolute;
  inset: 0;
}
</style>
