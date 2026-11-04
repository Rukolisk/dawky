<!-- layouts/scinde.vue
     Écran coupé en deux (quiz, connexion, inscription) : une photo pleine
     hauteur d'un côté, le contenu de l'autre. La photo est masquée sur
     mobile. Les pages passent la photo via le slot "visuel". -->
<template>
  <div class="scinde" :class="{ 'visuel-a-droite': visuelADroite }">
    <div class="scinde-visuel">
      <slot name="visuel"><VisuelChien alt="" /></slot>
    </div>
    <main id="contenu" class="scinde-contenu">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// Le visuel est à gauche pour le quiz, à droite pour la connexion
const route = useRoute()
const visuelADroite = computed(() => route.meta.visuelADroite === true)
</script>

<style scoped>
.scinde {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}
.scinde-visuel {
  position: sticky;
  top: 0;
  height: 100vh;
}
.scinde-visuel > :deep(*) {
  height: 100%;
}
.visuel-a-droite .scinde-visuel {
  order: 2;
}
.scinde-contenu {
  display: flex;
  flex-direction: column;
  padding: var(--e4) var(--e6);
  max-width: 720px;
  width: 100%;
}

@media (max-width: 900px) {
  .scinde {
    grid-template-columns: 1fr;
  }
  .scinde-visuel {
    display: none;
  }
  .scinde-contenu {
    padding: var(--e3) var(--marge);
    max-width: none;
    min-height: 100dvh;
  }
}
</style>
