<!-- components/ui/FaqListe.vue — accordéon accessible (details/summary) -->
<template>
  <div class="faq">
    <details v-for="q in questions" :key="q.question" class="faq-item">
      <summary>
        <span>{{ q.question }}</span>
        <Icone nom="plus" class="faq-icone" />
      </summary>
      <p class="faq-reponse texte-secondaire">{{ q.reponse }}</p>
    </details>
  </div>
</template>

<script setup lang="ts">
defineProps<{ questions: Array<{ question: string; reponse: string }> }>()
</script>

<style scoped>
.faq {
  border-top: 1px solid var(--noir);
}
.faq-item {
  border-bottom: 1px solid var(--noir);
}
summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--e2);
  min-height: 64px;
  padding: var(--e2) 20px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  list-style: none;
}
summary::-webkit-details-marker {
  display: none;
}
.faq-icone {
  flex-shrink: 0;
  transition: transform var(--transition);
}
details[open] .faq-icone {
  transform: rotate(45deg);
}
.faq-reponse {
  padding: 0 20px var(--e3);
  font-size: 16px;
  max-width: 64ch;
}
</style>
