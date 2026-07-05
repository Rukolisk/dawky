<template>
  <div class="error-page">
    <div class="container text-center error-inner">
      <img :src="images.mascotte_5" alt="" class="error-mascot animate-float" />
      <h1 class="display-xl error-code">{{ error?.statusCode }}</h1>
      <h2 class="display-md mt-2 mb-4">
        {{ error?.statusCode === 404 ? 'Page introuvable 🐾' : 'Oups, une erreur s\'est produite' }}
      </h2>
      <p class="text-lg text-soft mb-7">
        {{ error?.statusCode === 404
          ? 'Il semble que cette page s\'est enfuie comme un chien sans laisse…'
          : error?.message || 'Quelque chose a mal tourné. Réessayez !' }}
      </p>
      <div class="error-actions">
        <NuxtLink to="/" class="btn btn-primary btn-lg">🏠 Retour à l'accueil</NuxtLink>
        <button class="btn btn-outline btn-lg" @click="handleError">Réessayer</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { dawkyImages } from '~/composables/useDawkyImages'
const images = dawkyImages

const props = defineProps<{ error: { statusCode: number; message?: string } | null }>()
const handleError = () => clearError({ redirect: '/' })
</script>

<style scoped>
.error-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cream);
}
.error-inner { padding: var(--space-9) 0; }
.error-mascot { width: 200px; margin: 0 auto var(--space-5); }
.error-code {
  font-family: var(--font-display);
  font-size: clamp(6rem, 15vw, 12rem);
  font-weight: 900;
  color: var(--blue);
  opacity: 0.15;
  line-height: 1;
  margin-bottom: -var(--space-5);
}
.error-actions { display: flex; gap: var(--space-3); justify-content: center; flex-wrap: wrap; }
</style>
