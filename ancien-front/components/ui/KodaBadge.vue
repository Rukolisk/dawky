<template>
  <span :class="['badge', `badge-${color??'bleu'}`]"><slot /></span>
</template>
<script setup lang="ts">
defineProps<{color?:'bleu'|'jaune'|'lilas'|'menthe'|'abricot'|'nuit'|'success'|'danger'}>()
</script>
