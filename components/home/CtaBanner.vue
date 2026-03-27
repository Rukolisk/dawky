<template>
  <div class="cta">
    <div class="cta__inner container">
      <h2>Prêt à gâter <em>votre chien ?</em></h2>
      <p>Résiliable à tout moment · Livraison offerte dès le premier mois</p>
      <div class="cta__btns">
        <NuxtLink to="/abonnement" class="btn btn-yellow btn-xl">Commencer maintenant 🐾</NuxtLink>
        <NuxtLink to="/boxes" class="btn btn-outline-yellow btn-xl">Voir les formules</NuxtLink>
      </div>
    </div>
  </div>
</template>
<style scoped>
.cta { background:linear-gradient(135deg, var(--bleu), var(--nuit)); padding:5rem 0; position:relative; overflow:hidden; }
.cta::before { content:'🐾🦴🐾🦴🐾🦴🐾🦴'; position:absolute; top:1rem; width:100%; text-align:center; font-size:1.4rem; opacity:.06; letter-spacing:2.5rem; pointer-events:none; }
.cta__inner { text-align:center; position:relative; z-index:1; }
.cta__inner h2 { font-family:var(--font-display); font-size:clamp(2rem,4vw,3rem); font-weight:900; color:white; margin-bottom:.8rem; }
.cta__inner h2 em { font-style:italic; color:var(--jaune-vif); }
.cta__inner p  { color:rgba(255,255,255,.7); font-size:1rem; margin-bottom:2rem; }
.cta__btns { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; }
</style>
