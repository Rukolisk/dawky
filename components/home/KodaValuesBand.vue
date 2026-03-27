<!-- components/home/ValuesBand.vue -->
<template>
  <div class="values-band">
    <div v-for="v in values" :key="v.label" class="values-band__item">
      <span class="values-band__icon">{{ v.icon }}</span>
      <div>
        <strong>{{ v.label }}</strong>
        <span>{{ v.sub }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const values = [
  { icon: '🌱', label: 'Éco-responsable',   sub: 'Cartons FSC recyclés' },
  { icon: '🔒', label: 'Sécurité certifiée', sub: 'Adapté à chaque gabarit' },
  { icon: '♻️', label: 'Zéro plastique',     sub: 'Emballage 100% naturel' },
  { icon: '⚡', label: 'Stock optimisé',     sub: 'Zéro invendu garanti' },
]
</script>

<style scoped>
.values-band {
  background: var(--bark); padding: 2.4rem 4rem;
  display: flex; gap: 3rem; justify-content: center; flex-wrap: wrap;
}
.values-band__item {
  display: flex; align-items: center; gap: .9rem; color: var(--cream);
}
.values-band__icon { font-size: 1.5rem; }
.values-band__item strong { font-size: .9rem; display: block; font-weight: 500; }
.values-band__item span  { font-size: .78rem; opacity: .65; }
@media (max-width: 600px) {
  .values-band { padding: 1.5rem; gap: 1.5rem; }
}
</style>
