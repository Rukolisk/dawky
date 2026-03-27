<!-- components/ui/DawkyBadge.vue -->
<template>
  <span :class="['badge', `badge-${color}`]">
    <slot />
  </span>
</template>

<script setup lang="ts">
defineProps<{ color?: 'amber' | 'bark' | 'sage' | 'warm' | 'rust' }>()
</script>

<style scoped>
.badge {
  display: inline-flex; align-items: center; gap: .35rem;
  padding: .28rem .85rem; border-radius: 9999px;
  font-size: .74rem; font-weight: 500; letter-spacing: .05em;
  text-transform: uppercase;
}
.badge-amber { background: var(--bleu-vif); color: var(--nuit); }
.badge-bark  { background: var(--nuit);  color: var(--neige); }
.badge-sage  { background: var(--menthe);  color: white; }
.badge-warm  { background: var(--brume);  color: var(--nuit); }
.badge-rust  { background: var(--danger);  color: white; }
</style>
