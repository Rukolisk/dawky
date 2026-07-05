<template>
  <div class="how-page">
    <!-- Hero -->
    <section class="how-hero">
      <div class="how-hero-pattern"><img :src="images.fond_motif_bleu" alt="" /></div>
      <div class="container text-center how-hero-inner">
        <span class="badge badge-blue">🐾 Simple & Transparent</span>
        <h1 class="display-lg text-white mt-3 mb-3">Comment ça marche ?</h1>
        <p class="text-xl how-hero-sub">De l'inscription à la livraison, voici tout ce que vous devez savoir.</p>
      </div>
    </section>

    <!-- Étapes principales -->
    <section class="section">
      <div class="container">
        <div class="steps-detailed">
          <div v-for="(step, i) in stepsDetailed" :key="i" class="step-detailed" :class="{ reverse: i % 2 !== 0 }">
            <div class="step-detailed-visual">
              <div class="step-number-big">{{ String(i + 1).padStart(2, '0') }}</div>
              <img :src="step.img" alt="" class="step-illustration animate-float" />
            </div>
            <div class="step-detailed-text animate-fade-in-up">
              <span class="step-emoji-big">{{ step.emoji }}</span>
              <h2 class="display-md step-title">{{ step.title }}</h2>
              <p class="text-lg text-soft mt-3 mb-5">{{ step.desc }}</p>
              <ul class="step-bullets">
                <li v-for="b in step.bullets" :key="b">
                  <span class="bullet-check">✓</span> {{ b }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Box Surprise vs À la Carte -->
    <section class="section boxes-section">
      <div class="container">
        <h2 class="display-md text-center mb-7">Choisissez votre type de box</h2>
        <div class="boxes-compare">
          <div class="box-compare-card box-blue">
            <img :src="images.picto_truffe_bleu" alt="" class="box-compare-picto" />
            <h3>Box Surprise ✨</h3>
            <p class="text-soft mt-2 mb-5">Nos experts composent votre box chaque mois. La surprise est garantie !</p>
            <ul class="box-compare-list">
              <li><span class="bullet-check">✓</span> 5 produits sélectionnés pour vous</li>
              <li><span class="bullet-check">✓</span> Adapté à la taille de votre chien</li>
              <li><span class="bullet-check">✓</span> Expédition le 1er du mois</li>
              <li><span class="bullet-check">✓</span> À partir de 27,90 €/mois</li>
            </ul>
            <NuxtLink to="/quiz" class="btn btn-primary mt-5 w-full">Faire le quiz 🐾</NuxtLink>
          </div>
          <div class="box-compare-card box-yellow">
            <img :src="images.picto_truffe_jaune" alt="" class="box-compare-picto" />
            <h3>Box À la Carte 🛒</h3>
            <p class="text-soft mt-2 mb-5">Vous choisissez vos 5 produits parmi notre catalogue. Idéal pour les allergiques.</p>
            <ul class="box-compare-list">
              <li><span class="bullet-check">✓</span> Sélection libre de 5 produits</li>
              <li><span class="bullet-check">✓</span> Contrôle total des ingrédients</li>
              <li><span class="bullet-check">✓</span> Sans abonnement</li>
              <li><span class="bullet-check">✓</span> À partir de 24,90 €/box</li>
            </ul>
            <NuxtLink to="/offres" class="btn btn-outline mt-5 w-full">Composer ma box</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section faq-section">
      <div class="container-sm">
        <h2 class="display-md text-center mb-7">Questions fréquentes</h2>
        <div class="faq-list">
          <div v-for="faq in faqs" :key="faq.q" class="faq-card">
            <button class="faq-btn" @click="toggleFaq(faq.q)">
              <span class="faq-question">{{ faq.q }}</span>
              <span class="faq-icon" :class="{ open: openFaq === faq.q }">+</span>
            </button>
            <div v-if="openFaq === faq.q" class="faq-answer animate-fade-in-up">{{ faq.a }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA final -->
    <section class="section-sm">
      <div class="container">
        <div class="how-cta-card">
          <img :src="images.all_image" alt="" class="how-cta-img" />
          <div class="how-cta-text">
            <h2 class="display-md text-white">Prêt à vous lancer ?</h2>
            <p class="text-lg mt-2 mb-5" style="color:rgba(255,255,255,0.8)">Faites le quiz gratuit et recevez votre recommandation personnalisée en 2 minutes.</p>
            <NuxtLink to="/quiz" class="btn btn-yellow btn-lg">🐾 Commencer le quiz</NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { dawkyImages } from '~/composables/useDawkyImages'
const images = dawkyImages
useSeoMeta({ title: 'Comment ça marche — Dawky' })

const openFaq = ref('')
function toggleFaq(q: string) { openFaq.value = openFaq.value === q ? '' : q }

const stepsDetailed = [
  {
    emoji: '🐾', title: 'Faites le quiz', img: images.mascotte_3,
    desc: 'Répondez à quelques questions sur votre chien : race, poids, goûts, allergies éventuelles… En 2 minutes, on sait tout ce qu\'il faut pour composer la box parfaite.',
    bullets: ['Quiz 100% gratuit', 'Aucune inscription requise', 'Résultat immédiat avec recommandation'],
  },
  {
    emoji: '📦', title: 'On prépare votre box', img: images.sachet_patoune,
    desc: 'Nos experts sélectionnent 5 produits adaptés à la taille et aux besoins de votre chien. Jouets résistants, friandises saines, soins et surprises… tout est pensé pour lui.',
    bullets: ['Sélection par des passionnés', 'Produits naturels et sûrs', 'Emballage soigné et éco-responsable'],
  },
  {
    emoji: '🚚', title: 'Livraison à domicile', img: images.balle,
    desc: 'Votre box Surprise est expédiée le 1er de chaque mois. Pour la Box À la Carte, l\'expédition se fait sous 3 à 5 jours ouvrés après votre commande.',
    bullets: ['Livraison offerte', 'Suivi de colis inclus', 'Livraison en France, Belgique, Suisse'],
  },
  {
    emoji: '🎉', title: 'C\'est la fête !', img: images.mascotte_6,
    desc: 'Votre chien découvre ses nouvelles surprises ! Et vous, vous profitez du sourire (ou des jappements de joie) de votre compagnon. Rien de mieux 🐾',
    bullets: ['Unboxing inoubliable', 'Produits adaptés à chaque chien', 'Satisfaction ou remboursement'],
  },
]

const faqs = [
  { q: 'Quand suis-je prélevé ?', a: 'Pour la Box Surprise, le prélèvement a lieu le 1er de chaque mois. Vous êtes informé par email avant chaque renouvellement.' },
  { q: 'Puis-je modifier ma box après commande ?', a: 'Pour la Box Surprise, les modifications sont prises en compte pour le mois suivant. Pour la Box À la Carte, vous pouvez modifier votre sélection jusqu\'à la préparation.' },
  { q: 'Que faire si mon chien n\'aime pas un produit ?', a: 'Contactez-nous ! On vous remplace ou rembourse tout produit que votre chien n\'apprécie pas. Notre objectif : 100% de queues frétillantes.' },
  { q: 'La box est-elle adaptée aux chiots ?', a: 'Oui ! Précisez l\'âge de votre chien dans le quiz et nous adaptons la sélection (pas de jouets trop durs, friandises adaptées aux jeunes chiens).' },
  { q: 'Comment fonctionne la résiliation ?', a: 'Vous pouvez résilier à tout moment depuis votre espace client, sans frais. La résiliation prend effet à la fin du mois en cours.' },
  { q: 'Livrez-vous en dehors de la France ?', a: 'Oui ! Nous livrons en Belgique, Suisse et Luxembourg. Les frais de port sont offerts dans tous les pays.' },
]
</script>

<style scoped>
.how-hero { background: var(--blue); padding: var(--space-9) 0 var(--space-8); position: relative; overflow: hidden; }
.how-hero-pattern { position: absolute; inset: 0; opacity: 0.06; pointer-events: none; }
.how-hero-pattern img { width: 100%; height: 100%; object-fit: cover; }
.how-hero-inner { position: relative; }
.how-hero-sub { color: rgba(255,255,255,0.8); }

/* Steps detailed */
.steps-detailed { display: flex; flex-direction: column; gap: var(--space-10); }
.step-detailed {
  display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-8); align-items: center;
}
.step-detailed.reverse { direction: rtl; }
.step-detailed.reverse > * { direction: ltr; }

.step-detailed-visual { position: relative; display: flex; justify-content: center; align-items: center; }
.step-number-big {
  position: absolute; top: -20px; left: -10px;
  font-family: var(--font-display); font-size: 8rem; font-weight: 900;
  color: var(--blue); opacity: 0.07; line-height: 1; z-index: 0; user-select: none;
}
.step-illustration { width: 280px; position: relative; z-index: 1; filter: drop-shadow(0 20px 40px rgba(4,172,227,0.15)); }

.step-emoji-big { font-size: 2.5rem; }
.step-title { margin-top: var(--space-2); }
.step-bullets { list-style: none; display: flex; flex-direction: column; gap: var(--space-3); }
.step-bullets li { display: flex; align-items: flex-start; gap: var(--space-3); font-size: 1rem; color: var(--ink-soft); }
.bullet-check { color: var(--blue); font-weight: 700; flex-shrink: 0; margin-top: 2px; }

/* Boxes compare */
.boxes-section { background: var(--cream); }
.boxes-compare { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-5); }
.box-compare-card { background: white; border-radius: var(--radius-xl); padding: var(--space-7); border: 2px solid var(--border); }
.box-blue { border-color: rgba(4,172,227,0.2); background: rgba(4,172,227,0.03); }
.box-yellow { border-color: rgba(255,187,51,0.2); background: var(--yellow-pale); }
.box-compare-picto { width: 56px; margin-bottom: var(--space-4); }
.box-compare-card h3 { font-family: var(--font-display); font-size: 1.75rem; font-weight: 700; }
.box-compare-list { list-style: none; display: flex; flex-direction: column; gap: var(--space-3); }
.box-compare-list li { display: flex; align-items: flex-start; gap: var(--space-3); font-size: 0.9375rem; color: var(--ink-soft); }

/* FAQ */
.faq-section { background: white; }
.faq-list { display: flex; flex-direction: column; gap: 2px; }
.faq-card { border-bottom: 1px solid var(--border); }
.faq-card:first-child { border-top: 1px solid var(--border); }
.faq-btn {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: var(--space-5) 0;
  background: none; border: none; cursor: pointer; font-family: var(--font-body); gap: var(--space-4);
}
.faq-question { font-size: 1.0625rem; font-weight: 600; text-align: left; }
.faq-icon {
  font-size: 1.5rem; color: var(--blue); flex-shrink: 0;
  transition: transform 0.25s; font-weight: 300; line-height: 1;
}
.faq-icon.open { transform: rotate(45deg); }
.faq-answer { padding-bottom: var(--space-5); font-size: 0.9375rem; color: var(--ink-soft); line-height: 1.7; }

/* CTA */
.how-cta-card {
  background: var(--blue); border-radius: var(--radius-xl); padding: var(--space-8) var(--space-7);
  display: flex; align-items: center; gap: var(--space-8); overflow: hidden;
}
.how-cta-img { width: 200px; flex-shrink: 0; filter: drop-shadow(0 10px 30px rgba(0,0,0,0.2)); }
.how-cta-text { flex: 1; }

@media (max-width: 768px) {
  .step-detailed { grid-template-columns: 1fr; }
  .step-detailed.reverse { direction: ltr; }
  .step-detailed-visual { display: none; }
  .boxes-compare { grid-template-columns: 1fr; }
  .how-cta-card { flex-direction: column; }
  .how-cta-img { width: 140px; }
}
</style>
