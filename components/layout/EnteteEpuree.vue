<!-- components/layout/EnteteEpuree.vue
     En-tête réduit (résultat du quiz, commande) : logo + une action -->
<template>
  <header class="entete">
    <div class="conteneur entete-barre">
      <LogoDawky :hauteur="44" />
      <slot />
    </div>
  </header>
</template>

<style scoped>
.entete {
  border-bottom: 1px solid var(--filet);
  background: var(--blanc);
}
.entete-barre {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--e2);
  min-height: 84px;
  font-size: 16px;
  font-weight: 500;
}
</style>
