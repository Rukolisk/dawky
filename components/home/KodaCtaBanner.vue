<!-- components/home/CtaBanner.vue -->
<template>
  <div class="cta-banner">
    <h2>Prêt à faire plaisir à votre chien ?</h2>
    <p>Résiliable à tout moment. Livraison offerte dès le premier mois.</p>
    <NuxtLink to="/abonnement" class="btn btn-lg" style="background:white;color:var(--bark);">
      Voir les abonnements
    </NuxtLink>
  </div>
</template>

<style scoped>
.cta-banner {
  background: linear-gradient(135deg, var(--amber), var(--rust));
  padding: 5rem 4rem; text-align: center;
}
.cta-banner h2 {
  font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 900;
  color: white; margin-bottom: 1rem;
}
.cta-banner p { color: rgba(255,255,255,.85); font-size: 1.05rem; margin-bottom: 2rem; }
</style>
