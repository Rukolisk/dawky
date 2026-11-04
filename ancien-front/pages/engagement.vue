<!-- pages/engagement.vue -->
<template>
  <div>
    <!-- Hero dark -->
    <div class="engagement-hero">
      <div class="engagement-hero__pattern" />
      <div class="container" style="position:relative;z-index:2;text-align:center;">
        <p class="section-tag" style="color:var(--bleu-vif)">Notre Engagement</p>
        <h1 class="section-title" style="color:var(--neige);max-width:640px;margin:0 auto 1.2rem;">
          La planète et votre chien<br />méritent le meilleur.
        </h1>
        <p class="section-desc" style="color:rgba(245,239,224,.7);margin:0 auto;">
          Chez Dawky, l'éco-responsabilité n'est pas un argument marketing. C'est une exigence
          fondamentale, inscrite dans chaque décision produit, logistique et opérationnelle.
        </p>
      </div>
    </div>

    <!-- Cards engagements -->
    <section class="container eng-section">
      <div class="eng-grid">
        <div v-for="e in engagements" :key="e.title" class="eng-card card">
          <div class="eng-card__icon" :class="`eng-icon--${e.color}`">{{ e.icon }}</div>
          <h3>{{ e.title }}</h3>
          <p>{{ e.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Zero waste banner -->
    <section class="container">
      <div class="zero-waste">
        <div class="zero-waste__text">
          <h2>Le Modèle Zéro Invendu</h2>
          <p>
            Notre "Bar à Produits" n'est pas qu'une option de personnalisation — c'est notre outil
            anti-gaspillage le plus puissant. En permettant aux clients de composer leur box avec
            d'anciens stocks, nous atteignons un taux d'invendu quasi nul, réduisant drastiquement
            notre impact environnemental.
          </p>
        </div>
        <div class="zero-waste__stats">
          <div v-for="s in stats" :key="s.num" class="zero-stat">
            <div class="zero-stat__num">{{ s.num }}</div>
            <div class="zero-stat__label">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Engagement Éco — DAWKY', description: 'Découvrez les engagements éco-responsables de DAWKY : zéro plastique, packaging FSC, zéro invendu.' })

const engagements = [
  { icon: '♻️', color: 'green', title: 'Packaging Éco-conçu',   desc: 'Utilisation exclusive de cartons recyclés et recyclables, certifiés FSC. Chaque boîte est pensée pour une seconde vie.' },
  { icon: '🚫', color: 'blue',  title: 'Zéro Plastique',        desc: 'Suppression totale du suremballage plastique. Papier de soie ou frison de calage naturel — rien d\'autre.' },
  { icon: '📦', color: 'earth', title: 'Logistique Optimisée',  desc: 'La Box Personnalisée élimine les invendus en fin de cycle. Nos produits ne finissent jamais à la poubelle.' },
  { icon: '🌱', color: 'green', title: 'Produits Naturels',     desc: 'Sélection rigoureuse de fournisseurs éthiques. Priorité aux matières premières biologiques et non traitées.' },
  { icon: '🐾', color: 'blue',  title: 'Bien-être Animal',      desc: 'Chaque produit est validé par des vétérinaires. Aucun produit ne passe sans certification de sécurité.' },
  { icon: '🤝', color: 'earth', title: 'Partenaires Engagés',   desc: 'Nous travaillons exclusivement avec des fournisseurs partageant nos valeurs éthiques et environnementales.' },
]

const stats = [
  { num: '0%',  label: 'Plastique dans nos emballages' },
  { num: '100%', label: 'Cartons certifiés FSC' },
  { num: '≈0',  label: 'Invendu en fin de cycle' },
  { num: 'Bio', label: 'Priorité matières naturelles' },
]
</script>

<style scoped>
.engagement-hero {
  background: var(--nuit); padding: 6rem 0; position: relative; overflow: hidden;
}
.engagement-hero__pattern {
  position: absolute; inset: 0; opacity: .05;
  background-image: radial-gradient(rgba(245,239,224,1) 1.5px, transparent 1.5px);
  background-size: 28px 28px;
}
.eng-section { padding: 5rem 0; }
.eng-grid {
  display: grid; grid-template-columns: repeat(3,1fr); gap: 1.8rem;
}
.eng-card { padding: 2.4rem 2rem; text-align: center; }
.eng-card__icon {
  width: 64px; height: 64px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem; margin: 0 auto 1.2rem;
}
.eng-icon--green { background: #EDF4E5; }
.eng-icon--blue  { background: #E5EDF4; }
.eng-icon--earth { background: #F4EEE5; }
.eng-card h3 {
  font-family: var(--font-display); font-size: 1.15rem;
  font-weight: 700; margin-bottom: .6rem;
}
.eng-card p { font-size: .9rem; color: var(--muted); line-height: 1.65; }

.zero-waste {
  background: linear-gradient(135deg, var(--menthe) 0%, #5A7A4E 100%);
  color: white; border-radius: 32px; padding: 4rem;
  display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;
  align-items: center; margin-bottom: 5rem;
}
.zero-waste__text h2 {
  font-family: var(--font-display); font-size: 2.2rem;
  font-weight: 900; margin-bottom: 1rem;
}
.zero-waste__text p { font-size: 1rem; line-height: 1.75; opacity: .88; }
.zero-waste__stats {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem;
}
.zero-stat {
  background: rgba(255,255,255,.15); border-radius: 16px; padding: 1.4rem;
  border: 1px solid rgba(255,255,255,.2);
}
.zero-stat__num {
  font-family: var(--font-display); font-size: 2rem;
  font-weight: 900; line-height: 1;
}
.zero-stat__label { font-size: .78rem; opacity: .8; margin-top: .3rem; }

@media (max-width: 900px) {
  .eng-grid { grid-template-columns: 1fr; }
  .zero-waste { grid-template-columns: 1fr; }
}
</style>
