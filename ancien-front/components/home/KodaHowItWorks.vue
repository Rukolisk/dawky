<!-- components/home/HowItWorks.vue -->
<template>
  <section class="hiw container">
    <p class="section-tag">Comment ça marche</p>
    <h2 class="section-title">Trois étapes,<br />un chien comblé.</h2>

    <div class="hiw__grid">
      <div v-for="step in steps" :key="step.num" class="hiw__step">
        <div class="hiw__num" :style="{ background: step.color }">{{ step.num }}</div>
        <h3>{{ step.title }}</h3>
        <p>{{ step.desc }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const steps = [
  {
    num: '1', color: 'var(--amber)',
    title: 'Choisissez votre box',
    desc: 'Surprise mensuelle ou personnalisée selon vos envies et les besoins de votre chien.',
  },
  {
    num: '2', color: 'var(--sage)',
    title: 'Indiquez le gabarit',
    desc: 'S, M ou L — chaque produit est dimensionné pour la sécurité et le plaisir de votre animal.',
  },
  {
    num: '3', color: 'var(--bark)',
    title: 'Recevez & profitez',
    desc: 'Livraison soignée dans notre packaging éco-conçu. Votre chien découvre, joue, se régale.',
  },
]
</script>

<style scoped>
.hiw { padding: 6rem 0; }
.hiw__grid {
  display: grid; grid-template-columns: repeat(3,1fr);
  gap: 2rem; margin-top: 3rem;
}
.hiw__step { text-align: center; padding: 2rem 1.5rem; }
.hiw__num {
  width: 60px; height: 60px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 900;
  color: white; margin: 0 auto 1.2rem;
}
.hiw__num[style*="amber"] { color: var(--dark) !important; }
.hiw__step h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem; margin-bottom: .6rem;
}
.hiw__step p { font-size: .92rem; color: var(--muted); line-height: 1.65; }

@media (max-width: 700px) {
  .hiw__grid { grid-template-columns: 1fr; gap: 1.5rem; }
}
</style>
