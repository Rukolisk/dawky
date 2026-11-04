<template>
  <div :class="['spinner-wrap', {'spinner-wrap--full':full}]">
    <div class="spinner-paw">🐾</div>
    <p v-if="label" class="spinner-label">{{ label }}</p>
  </div>
</template>
<script setup lang="ts">
defineProps<{label?:string;full?:boolean}>()
</script>
