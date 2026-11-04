<!-- components/boxes/BoxCard.vue -->
<template>
  <div :class="['box-card card', `box-card--${box.type.toLowerCase()}`]">
    <div class="box-card__header">
      <div class="box-card__type-icon">{{ box.type === 'SURPRISE' ? '🎁' : '♻️' }}</div>
      <div class="box-card__type-label">{{ box.type === 'SURPRISE' ? 'Abonnement mensuel' : 'Commande unique · Invendus' }}</div>
      <h2 class="box-card__nom">{{ box.nom }}</h2>
      <p class="box-card__desc">{{ box.description }}</p>
      <div class="box-card__prix">
        {{ box.prix.toFixed(2).replace('.',',') }}€<span>{{ box.type === 'SURPRISE' ? '/mois' : '/commande' }}</span>
      </div>
    </div>
    <div class="box-card__body">
      <ul class="box-card__features">
        <li v-for="f in featuresFor(box.type)" :key="f">{{ f }}</li>
      </ul>
      <div class="box-card__taille-note">
        📏 Tailles disponibles : <strong>XS, S, M, L</strong> — même prix, contenu adapté.
      </div>
      <NuxtLink to="/abonnement" :class="['btn btn-full btn-lg', box.type === 'SURPRISE' ? 'btn-primary' : 'btn-green']">
        {{ box.type === 'SURPRISE' ? 'S\'abonner →' : 'Commander →' }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormulaBox } from '~/composables/useApi'
defineProps<{ box: FormulaBox }>()
function featuresFor(type: 'SURPRISE' | 'CARTE') {
  if (type === 'SURPRISE') return [
    'Sélection thématique mensuelle par nos experts',
    'Contenu adapté XS, S, M ou L',
    'Engagement 12 mois résiliable à tout moment',
    'Livraison offerte chaque mois 🌱',
    'Thèmes et produits exclusifs',
  ]
  return [
    'Composé des invendus des mois précédents',
    'Produits de qualité identique, rien ne se perd',
    'Aucun engagement — achat ponctuel',
    'Idéal pour tester ou compléter',
    'Livraison offerte 🌱',
  ]
}
</script>

<style scoped>
.box-card { overflow: hidden; }
.box-card__header { padding: 2.5rem 2.5rem 1.5rem; }
.box-card--surprise .box-card__header { background: linear-gradient(135deg,#FFF8EE,#FFE4C0); }
.box-card--carte    .box-card__header { background: linear-gradient(135deg,#EEF4EE,#D8EDD8); }
.box-card__type-icon { font-size: 2.5rem; margin-bottom: .8rem; }
.box-card__type-label {
  display: inline-block; font-size: .72rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: .08em;
  padding: .25rem .8rem; border-radius: var(--r-full);
  background: rgba(255,255,255,.7); color: var(--ardoise); margin-bottom: .8rem;
}
.box-card__nom { font-family: var(--font-display); font-size: 1.8rem; font-weight: 900; color: var(--nuit); margin-bottom: .5rem; }
.box-card__desc { font-size: .9rem; color: var(--muted); line-height: 1.65; margin-bottom: 1rem; }
.box-card__prix { font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; color: var(--nuit); }
.box-card__prix span { font-size: .9rem; color: var(--muted); font-family: var(--font-body); font-weight: 400; margin-left: .2rem; }
.box-card__body { padding: 2rem 2.5rem 2.5rem; }
.box-card__features { list-style: none; margin-bottom: 1.2rem; }
.box-card__features li {
  display: flex; align-items: center; gap: .6rem;
  font-size: .88rem; color: var(--muted); padding: .45rem 0;
  border-bottom: 1px solid var(--neige);
}
.box-card__features li::before { content: '✓'; color: var(--menthe); font-weight: 700; flex-shrink: 0; }
.box-card__taille-note {
  background: var(--neige); border-radius: var(--r-md);
  padding: .8rem 1rem; font-size: .82rem; color: var(--ardoise);
  margin-bottom: 1.2rem; line-height: 1.5;
}
.box-card__taille-note strong { color: var(--bleu-vif); }
@media (max-width:700px) { .box-card__header, .box-card__body { padding-left: 1.5rem; padding-right: 1.5rem; } }
</style>
