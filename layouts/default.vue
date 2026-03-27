<!-- layouts/default.vue -->
<template>
  <div class="layout">
    <AppNav />
    <main class="layout-main">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.layout { display: flex; flex-direction: column; min-height: 100vh; }
.layout-main { flex: 1; padding-top: 72px; }
</style>
