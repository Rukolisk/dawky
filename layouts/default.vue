<template>
  <div class="layout">
    <a href="#contenu" class="lien-evitement">Aller au contenu</a>
    <AppHeader />
    <main id="contenu" class="layout-main">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.layout-main {
  flex: 1;
}
.lien-evitement {
  position: absolute;
  left: -9999px;
  z-index: 200;
  background: var(--noir);
  color: var(--blanc);
  padding: 12px 20px;
}
.lien-evitement:focus {
  left: var(--e2);
  top: var(--e2);
}
</style>
