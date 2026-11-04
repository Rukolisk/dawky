<!-- components/ui/VisuelChien.vue
     Photo de chien sur fond uni. Tant que les photos ne sont pas fournies,
     affiche un aplat gris aux bonnes proportions (comme la maquette).
     Pour ajouter une photo : déposer le fichier dans public/images/ et
     passer `src="/images/…"`. -->
<template>
  <div class="visuel" :style="ratio ? { aspectRatio: ratio } : undefined">
    <img v-if="src" :src="src" :alt="alt" loading="lazy" />
    <span v-else class="sr-only">{{ alt }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ src?: string; alt?: string; ratio?: string }>(), { alt: '' })
</script>

<style scoped>
/* Pas de hauteur imposée : dans une grille, l'élément s'étire sur toute
   la hauteur de la ligne ; ailleurs, la page fixe un aspect-ratio. */
.visuel {
  width: 100%;
}
</style>
