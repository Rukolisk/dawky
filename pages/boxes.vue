<!-- pages/boxes.vue -->
<template>
  <div>
    <section class="boxes-header container">
      <p class="section-tag">Nos Formules</p>
      <h1 class="section-title">Surprise ou À la Carte ?</h1>
      <p class="section-desc">
        Deux façons de recevoir Dawky. Un seul prix, quel que soit le gabarit de votre chien.
      </p>
    </section>

    <DawkySpinner v-if="pending" label="Chargement…" />

    <div v-if="!pending" class="boxes-grid container">
      <div
        v-for="box in boxes"
        :key="box.id"
        :class="['box-card card', box.type === 'SURPRISE' ? 'box-card--surprise' : 'box-card--carte']"
      >
        <div class="box-card__header">
          <div class="box-card__icon">{{ box.type === 'SURPRISE' ? '🎁' : '🛒' }}</div>
          <div class="box-card__type-badge">{{ box.type === 'SURPRISE' ? 'Abonnement mensuel' : 'Commande ponctuelle' }}</div>
          <h2 class="box-card__nom">{{ box.nom }}</h2>
          <p class="box-card__desc">{{ box.description }}</p>
          <div class="box-card__prix">
            {{ box.prix.toFixed(2).replace('.', ',') }}€<span>/mois</span>
          </div>
        </div>
        <div class="box-card__body">
          <ul class="box-card__features">
            <li v-for="f in featuresFor(box.type)" :key="f">{{ f }}</li>
          </ul>
          <div class="box-card__taille-note">
            📏 Le contenu s'adapte à la taille de votre chien — XS, S, M ou L — même prix.
          </div>
          <NuxtLink to="/abonnement" class="btn btn-full" :class="box.type === 'SURPRISE' ? 'btn-primary' : 'btn-outline'">
            {{ box.type === 'SURPRISE' ? 'S\'abonner →' : 'Commander →' }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="boxes-eco container">
      🌱 Toutes les boxes sont expédiées dans un packaging 100% éco-conçu, certifié FSC, sans plastique.
    </div>

    <UiDawkyToast />
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Nos Formules — DAWKY' })

const { data, pending } = useBoxes()
const boxes = computed(() => data.value?.data ?? [])

function featuresFor(type: 'SURPRISE' | 'CARTE') {
  if (type === 'SURPRISE') return [
    'Sélection thématique mensuelle',
    'Contenu adapté S, M ou L',
    'Engagement 12 mois résiliable',
    'Livraison offerte chaque mois',
    'Nouveautés en avant-première',
  ]
  return [
    'Choix libre dans le catalogue',
    'Produits adaptés à votre chien',
    'Aucun engagement — commande unique',
    'Idéal si allergies ou besoins précis',
    'Livraison offerte',
  ]
}
</script>

<style scoped>
.boxes-header { padding: 5rem 0 3rem; }
.boxes-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 2rem; padding-bottom: 2rem;
}
.box-card { overflow: hidden; }
.box-card__header { padding: 2.5rem 2.5rem 1.5rem; }
.box-card--surprise .box-card__header { background: linear-gradient(135deg,#FFF4E6,#FFE4C4); }
.box-card--carte    .box-card__header { background: linear-gradient(135deg,#EDF2E8,#D4E2C8); }
.box-card__icon { font-size: 2.8rem; margin-bottom: .8rem; }
.box-card__type-badge {
  display: inline-block; font-size: .72rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: .08em; padding: .25rem .8rem; border-radius: 40px;
  background: rgba(255,255,255,.7); color: var(--nuit); margin-bottom: .8rem;
}
.box-card__nom  { font-family: 'Playfair Display',serif; font-size: 1.8rem; font-weight: 900; margin-bottom: .5rem; }
.box-card__desc { font-size: .9rem; color: var(--muted); line-height: 1.65; margin-bottom: 1rem; }
.box-card__prix { font-family:var(--font-display); font-size:2rem; font-weight:900; color:var(--nuit); }
.box-card__prix span { font-size:.88rem; color:var(--muted); font-family:var(--font-body); font-weight:400; }
.box-card__body { padding: 2rem 2.5rem 2.5rem; }
.box-card__features { list-style:none; margin-bottom:1.2rem; }
.box-card__features li { display:flex; align-items:center; gap:.6rem; font-size:.9rem; color:var(--muted); padding:.4rem 0; border-bottom:1px solid var(--neige); }
.box-card__features li::before { content:'✓'; color:var(--menthe); font-weight:700; flex-shrink:0; }
.box-card__taille-note { background:var(--neige); border-radius:12px; padding:.8rem 1rem; font-size:.82rem; color:var(--nuit); margin-bottom:1.2rem; line-height:1.5; }
.boxes-eco { text-align:center; padding:2.5rem 0 4rem; font-size:.9rem; color:var(--muted); }
@media (max-width:700px) { .boxes-grid { grid-template-columns:1fr; } }
</style>
