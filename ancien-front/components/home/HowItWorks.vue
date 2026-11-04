<template>
  <section class="hiw container">
    <div class="text-center">
      <p class="section-tag">Comment ça marche</p>
      <h2 class="section-title">Simple comme <em>bonjour</em> 🐾</h2>
    </div>
    <div class="hiw__grid">
      <div v-for="(s,i) in steps" :key="s.num" class="hiw__step">
        <div class="hiw__arrow" v-if="i < steps.length-1" />
        <div class="hiw__circle" :class="s.cls"><span>{{ s.emoji }}</span></div>
        <div class="hiw__num">Étape {{ s.num }}</div>
        <h3>{{ s.title }}</h3>
        <p>{{ s.desc }}</p>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
const steps = [
  { num:1, emoji:'📏', cls:'circ-yellow', title:'Choisissez le gabarit', desc:'XS, S, M ou L selon le poids de votre chien. Le contenu s\'adapte automatiquement.' },
  { num:2, emoji:'🎁', cls:'circ-blue',   title:'Sélectionnez la box',  desc:'Box Surprise mensuelle ou Box À la Carte avec les invendus. Un seul prix pour tous.' },
  { num:3, emoji:'🚚', cls:'circ-menthe', title:'Recevez & profitez',   desc:'Livraison offerte dans un packaging éco. Votre chien mâche, joue et s\'amuse !' },
]
</script>
<style scoped>
.hiw { padding: 6rem 0; }
.text-center { text-align:center; margin-bottom:3.5rem; }
.hiw__grid { display:grid; grid-template-columns:repeat(3,1fr); gap:3rem; position:relative; }
.hiw__step { text-align:center; position:relative; }
.hiw__arrow { position:absolute; top:36px; left:62%; right:-38%; height:2px; background:repeating-linear-gradient(90deg,var(--brume) 0,var(--brume) 6px,transparent 6px,transparent 14px); z-index:0; }
.hiw__circle { width:72px; height:72px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto 1rem; box-shadow:var(--shadow-md); position:relative; z-index:1; }
.circ-yellow { background:linear-gradient(135deg, var(--jaune-vif), var(--jaune)); }
.circ-blue   { background:linear-gradient(135deg, var(--bleu-ciel), var(--bleu)); }
.circ-menthe { background:linear-gradient(135deg, #85C9B9, var(--menthe)); }
.hiw__num { font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:var(--bleu); margin-bottom:.5rem; }
.hiw__step h3 { font-family:var(--font-display); font-size:1.2rem; font-weight:700; margin-bottom:.5rem; color:var(--nuit); }
.hiw__step p  { font-size:.9rem; color:var(--muted); line-height:1.65; }
@media(max-width:700px) { .hiw__grid { grid-template-columns:1fr; } .hiw__arrow { display:none; } }
</style>
