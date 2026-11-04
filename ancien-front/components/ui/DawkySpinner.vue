<!-- components/ui/DawkySpinner.vue -->
<template>
  <div :class="['spinner-wrap', { 'spinner-wrap--full': full }]">
    <div class="spinner" :style="{ width: size, height: size }" />
    <p v-if="label" class="spinner-label">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ size?: string; label?: string; full?: boolean }>()
</script>

<style scoped>
.spinner-wrap {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: .8rem;
  padding: 2rem;
}
.spinner-wrap--full { min-height: 40vh; }
.spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--brume);
  border-top-color: var(--bleu-vif);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.spinner-label { font-size: .88rem; color: var(--muted); }
</style>
