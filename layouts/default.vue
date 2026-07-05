<template>
  <div class="layout-default">
    <TheNav />
    <main class="main-content">
      <slot />
    </main>
    <TheFooter />
  </div>
</template>

<style scoped>
.layout-default {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}
</style>
