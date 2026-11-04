<!-- pages/concept.vue -->
<template>
  <div>
    <!-- Header -->
    <section class="concept-header container">
      <p class="section-tag">Notre Philosophie</p>
      <h1 class="section-title">Un concept pensé<br />pour chaque chien.</h1>
      <p class="section-desc">
        Dawky repose sur un modèle dual et intelligent : découverte et personnalisation au service
        du bien-être animal, avec un impact environnemental minimal.
      </p>
    </section>

    <!-- Cards grid -->
    <section class="concept-grid container">
      <div
        v-for="card in cards"
        :key="card.title"
        class="concept-card card"
      >
        <div class="concept-card__accent" :style="{ background: card.color }" />
        <div class="concept-card__icon">{{ card.icon }}</div>
        <h3>{{ card.title }}</h3>
        <p>{{ card.desc }}</p>
      </div>
    </section>

    <!-- Anatomie box -->
    <div class="anatomy">
      <div class="anatomy__inner container">
        <p class="section-tag" style="color:var(--bleu-vif)">Anatomie d'une Box Dawky</p>
        <h2 class="section-title" style="color:var(--neige)">5 catégories,<br />un bien-être complet.</h2>

        <div class="anatomy__rows">
          <div v-for="row in anatomy" :key="row.label" class="anatomy__row">
            <span class="anatomy__emoji">{{ row.icon }} {{ row.label }}</span>
            <span class="anatomy__produit">{{ row.produit }}</span>
            <span class="anatomy__objectif">{{ row.objectif }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Le Concept — DAWKY', description: 'Découvrez le concept dual et éco-responsable de DAWKY, la box premium pour chiens.' })

const cards = [
  { icon: '🎁', color: 'var(--bleu-vif)', title: 'La Box Surprise', desc: 'Une sélection thématique exclusive chaque mois. Le rendez-vous de la nouveauté pour tester des produits inédits et surprendre votre animal avec des découvertes soigneusement choisies par nos experts.' },
  { icon: '🛒', color: 'var(--menthe)',  title: 'Le Bar à Produits', desc: 'Composez vous-même votre box parmi nos références issues des mois précédents. Le système de "slots" vous permet de cibler précisément les besoins de votre chien tout en atteignant le zéro invendu.' },
  { icon: '📏', color: 'var(--danger)',  title: 'Segmentation S, M, L', desc: 'Parce qu\'un Chihuahua et un Berger Allemand n\'ont ni les mêmes besoins, ni la même puissance de mâchoire, chaque box est calibrée selon le gabarit. Taille des jouets et densité rigoureusement adaptées.' },
  { icon: '🌿', color: 'var(--nuit)',  title: 'Éco-Responsabilité', desc: 'Cartons recyclés certifiés FSC, zéro plastique, papier de soie ou frison de calage naturel. Notre logistique optimisée évite le gaspillage en fin de cycle et réduit notre empreinte globale.' },
]

const anatomy = [
  { icon: '🦌', label: 'Mastication',  produit: 'Bois de cerf, sabot, racine',      objectif: 'Hygiène dentaire et apaisement naturel' },
  { icon: '🍖', label: 'Nutrition',    produit: '1 à 2 paquets de friandises',       objectif: 'Récompense positive et éducation' },
  { icon: '🎾', label: 'Interaction',  produit: 'Jouet robuste (balle, corde…)',     objectif: 'Stimulation physique et complicité' },
  { icon: '🧴', label: 'Soin & Hygiène', produit: 'Baume, lotion, shampoing sec',   objectif: 'Entretien régulier et confort' },
  { icon: '🎀', label: 'Accessoire',   produit: 'Bandana, gadget, objet lifestyle',  objectif: 'Style et praticité au quotidien' },
]
</script>

<style scoped>
.concept-header { padding: 5rem 0 2rem; }
.concept-grid {
  display: grid; grid-template-columns: repeat(2,1fr);
  gap: 1.8rem; padding-bottom: 5rem;
}
.concept-card { padding: 2.5rem; }
.concept-card__accent { height: 4px; margin: -2.5rem -2.5rem 1.6rem; }
.concept-card__icon { font-size: 2.4rem; margin-bottom: 1rem; }
.concept-card h3 {
  font-family: var(--font-display);
  font-size: 1.4rem; font-weight: 700; margin-bottom: .7rem;
}
.concept-card p { font-size: .95rem; color: var(--muted); line-height: 1.65; }

.anatomy { background: var(--nuit); padding: 5rem 0; }
.anatomy__inner { max-width: 900px; }
.anatomy__rows { margin-top: 2.5rem; display: flex; flex-direction: column; gap: 1rem; }
.anatomy__row {
  display: grid; grid-template-columns: 200px 220px 1fr;
  gap: 1.5rem; align-items: center;
  background: rgba(245,239,224,.05); border-radius: 16px;
  padding: 1.3rem 2rem;
}
.anatomy__emoji { color: var(--neige); font-size: .95rem; }
.anatomy__produit { color: var(--bleu-vif); font-size: .88rem; }
.anatomy__objectif { color: rgba(245,239,224,.5); font-size: .88rem; }

@media (max-width: 900px) {
  .concept-grid { grid-template-columns: 1fr; }
  .anatomy__row { grid-template-columns: 1fr; gap: .4rem; padding: 1rem 1.2rem; }
}
</style>
