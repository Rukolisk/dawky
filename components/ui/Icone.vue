<!-- components/ui/Icone.vue — pictogrammes au trait (24 × 24) -->
<template>
  <svg
    :width="taille" :height="taille" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="nom === 'camion'">
      <path d="M2 6h11v9H2zM13 9h4l4 4v2h-8z" /><circle cx="6" cy="17" r="1.8" /><circle cx="17" cy="17" r="1.8" />
    </template>
    <template v-else-if="nom === 'check-cercle'">
      <circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" />
    </template>
    <template v-else-if="nom === 'regle'">
      <path d="M2 8h20v8H2zM6 8v3M10 8v4M14 8v3M18 8v4" />
    </template>
    <template v-else-if="nom === 'bouclier'">
      <path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z" /><path d="m9 12 2 2 4-4" />
    </template>
    <template v-else-if="nom === 'menu'">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </template>
    <template v-else-if="nom === 'fermer'">
      <path d="M6 6l12 12M18 6 6 18" />
    </template>
    <template v-else-if="nom === 'check'">
      <path d="m5 12 5 5 9-10" stroke-width="2.5" />
    </template>
    <template v-else-if="nom === 'plus'">
      <path d="M12 5v14M5 12h14" />
    </template>
    <template v-else-if="nom === 'moins'">
      <path d="M5 12h14" />
    </template>
    <template v-else-if="nom === 'fleche-gauche'">
      <path d="M15 6l-6 6 6 6" />
    </template>
    <template v-else-if="nom === 'cadenas'">
      <rect x="5" y="11" width="14" height="10" rx="1" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </template>
    <!-- Catégories de produits (Compose ta box) -->
    <template v-else-if="nom === 'os'">
      <path d="M8.5 6.5a2.5 2.5 0 1 0-3.5 3.5l9 9a2.5 2.5 0 1 0 3.5-3.5 2.5 2.5 0 1 0-3.5-3.5l-9-9" />
    </template>
    <template v-else-if="nom === 'balle'">
      <circle cx="12" cy="12" r="9" /><path d="M5.5 5.8c3 2.5 3 9.9 0 12.4M18.5 5.8c-3 2.5-3 9.9 0 12.4" />
    </template>
    <template v-else-if="nom === 'sachet'">
      <path d="M6 8h12l-1 12H7zM9 8V6a3 3 0 0 1 6 0v2M9 13h6" />
    </template>
    <template v-else-if="nom === 'medaille'">
      <circle cx="12" cy="15" r="5" /><path d="M12 10V7M10 4h4l-2 3z" />
    </template>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ nom: string; taille?: number }>(), { taille: 24 })
</script>
