<!-- components/abonnement/FaqItem.vue -->
<template>
  <div class="faq-item">
    <button class="faq-item__q" :aria-expanded="open" @click="open = !open">
      <span>{{ question }}</span>
      <span class="faq-item__icon" :class="{ open }">+</span>
    </button>
    <Transition name="faq">
      <div v-if="open" class="faq-item__a"><p>{{ answer }}</p></div>
    </Transition>
  </div>
</template>
<script setup lang="ts">
defineProps<{ question: string; answer: string }>()
const open = ref(false)
</script>
<style scoped>
.faq-item { border-bottom: 1.5px solid var(--brume); }
.faq-item__q { display:flex;justify-content:space-between;align-items:center;width:100%;padding:1.3rem 0;background:none;border:none;text-align:left;font-size:.97rem;font-weight:600;color:var(--nuit);cursor:pointer;font-family:var(--font-body); }
.faq-item__icon { font-size:1.4rem;color:var(--bleu-vif);transition:transform .25s;flex-shrink:0;margin-left:1rem; }
.faq-item__icon.open { transform: rotate(45deg); }
.faq-item__a { padding-bottom:1.2rem; }
.faq-item__a p { font-size:.92rem;color:var(--muted);line-height:1.7; }
.faq-enter-active, .faq-leave-active { transition: opacity .2s, transform .2s; }
.faq-enter-from, .faq-leave-to { opacity:0;transform:translateY(-6px); }
</style>
