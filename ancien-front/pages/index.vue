<template>
  <div class="home">

    <!-- ═══ HERO ═══════════════════════════════════════ -->
    <section class="hero">
      <!-- Fond motif -->
      <div class="hero-pattern">
        <img :src="images.fond_motif_bleu" alt="" class="pattern-img" />
      </div>

      <div class="container hero-inner">
        <div class="hero-text animate-fade-in-up">
          <div class="hero-badge">
            <span class="badge badge-blue">🐾 Box premium pour chiens</span>
          </div>
          <h1 class="display-xl hero-title">
            La box qui fait<br />
            <em class="text-blue">vraiment</em> la queue<br />
            frétiller 🐕
          </h1>
          <p class="hero-desc text-xl text-soft">
            Box Surprise mensuelle ou À la Carte — adaptée à la taille et aux besoins de votre chien. 5 produits soigneusement sélectionnés dès <strong class="text-ink">27,90&nbsp;€/mois</strong>.
          </p>

          <div class="hero-ctas">
            <NuxtLink to="/quiz" class="btn btn-primary btn-lg">
              🐾 Faire le quiz gratuit
            </NuxtLink>
            <NuxtLink to="/offres" class="btn btn-outline btn-lg">
              Voir les offres
            </NuxtLink>
          </div>

          <!-- Trust badges -->
          <div class="hero-trust">
            <span class="trust-item">✅ Sans engagement</span>
            <span class="trust-item">🚚 Livraison offerte</span>
            <span class="trust-item">💛 Adapté à votre chien</span>
          </div>
        </div>

        <div class="hero-visual animate-fade-in-up delay-200">
          <div class="hero-mascot-wrap">
            <img :src="images.mascotte_3" alt="Mascotte Dawky" class="hero-mascot animate-float" />
            <!-- Produits flottants -->
            <div class="hero-floating hero-floating-1 animate-float-slow delay-100">
              <img :src="images.balle" alt="" />
            </div>
            <div class="hero-floating hero-floating-2 animate-float delay-300">
              <img :src="images.ble" alt="" />
            </div>
            <div class="hero-floating hero-floating-3 animate-float-slow delay-500">
              <img :src="images.paillette" alt="" />
            </div>
          </div>
        </div>
      </div>

      <!-- Courbe bas -->
      <div class="hero-curve">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,0 C360,80 1080,80 1440,0 L1440,80 L0,80 Z" fill="#FFFBF4"/>
        </svg>
      </div>
    </section>

    <!-- ═══ OFFRES ══════════════════════════════════════ -->
    <section class="section offers-section">
      <div class="container">
        <div class="section-header text-center animate-fade-in-up">
          <span class="badge badge-yellow mb-3">Nos formules</span>
          <h2 class="display-md">Deux façons d'aimer son chien</h2>
          <p class="text-lg text-soft mt-2">Une box pour chaque chien, chaque envie.</p>
        </div>

        <div class="offers-grid">
          <!-- Box Surprise -->
          <div class="offer-card animate-fade-in-up delay-100">
            <div class="offer-card-inner">
              <div class="offer-icon">
                <img :src="images.picto_truffe_bleu" alt="" />
              </div>
              <div class="offer-badge-top">
                <span class="badge badge-blue">⭐ La plus populaire</span>
              </div>
              <h3 class="offer-title">Box Surprise</h3>
              <p class="offer-desc">
                Chaque mois, nos experts sélectionnent 5 produits adaptés à la taille de votre chien. Jouets, friandises, soins… la surprise garantie !
              </p>
              <div class="offer-price">
                <span class="offer-price-amount">27,90&nbsp;€</span>
                <span class="offer-price-period">/mois</span>
              </div>
              <ul class="offer-features">
                <li v-for="item in surpriseFeatures" :key="item">
                  <span class="offer-check">✓</span> {{ item }}
                </li>
              </ul>
              <div class="offer-sizes">
                <span v-for="s in ['XS','S','M','L']" :key="s" class="size-chip">{{ s }}</span>
              </div>
              <NuxtLink to="/quiz" class="btn btn-primary w-full">
                Commencer le quiz 🐾
              </NuxtLink>
            </div>
          </div>

          <!-- Box À la Carte -->
          <div class="offer-card offer-card-yellow animate-fade-in-up delay-200">
            <div class="offer-card-inner">
              <div class="offer-icon">
                <img :src="images.picto_truffe_jaune" alt="" />
              </div>
              <h3 class="offer-title">Box À la Carte</h3>
              <p class="offer-desc">
                Vous choisissez vos 5 produits parmi notre sélection. Idéale pour les chiens allergiques ou les maîtres qui savent ce qu'ils veulent !
              </p>
              <div class="offer-price">
                <span class="offer-price-amount">24,90&nbsp;€</span>
                <span class="offer-price-period">par box</span>
              </div>
              <ul class="offer-features">
                <li v-for="item in carteFeatures" :key="item">
                  <span class="offer-check">✓</span> {{ item }}
                </li>
              </ul>
              <div class="offer-sizes">
                <span v-for="s in ['XS','S','M','L']" :key="s" class="size-chip size-chip-yellow">{{ s }}</span>
              </div>
              <NuxtLink to="/offres" class="btn btn-outline w-full">
                Composer ma box
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ COMMENT ÇA MARCHE ══════════════════════════ -->
    <section class="section how-section">
      <div class="how-bg">
        <img :src="images.fond_motif_jaune" alt="" class="how-pattern" />
      </div>
      <div class="container">
        <div class="section-header text-center">
          <span class="badge badge-blue mb-3">Simple comme bonjour</span>
          <h2 class="display-md">Comment ça marche ?</h2>
        </div>

        <div class="steps-grid">
          <div v-for="(step, i) in steps" :key="i" class="step-card animate-fade-in-up" :class="`delay-${(i+1)*100}`">
            <div class="step-number">{{ String(i + 1).padStart(2, '0') }}</div>
            <div class="step-emoji">{{ step.emoji }}</div>
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-desc text-soft">{{ step.desc }}</p>
          </div>
        </div>

        <div class="how-cta text-center">
          <NuxtLink to="/quiz" class="btn btn-primary btn-lg">
            Je commence maintenant
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ═══ PRODUITS APERÇU ════════════════════════════ -->
    <section class="section products-section">
      <div class="container">
        <div class="section-header text-center">
          <span class="badge badge-rose mb-3">Dans vos box</span>
          <h2 class="display-md">Des produits pensés pour eux</h2>
          <p class="text-lg text-soft mt-2">Naturels, sûrs, adaptés à chaque taille.</p>
        </div>

        <div class="categories-grid">
          <div v-for="cat in categories" :key="cat.label" class="category-card animate-fade-in-up">
            <div class="category-emoji">{{ cat.emoji }}</div>
            <img :src="cat.img" alt="" class="category-img" />
            <h4 class="category-label">{{ cat.label }}</h4>
            <p class="category-desc text-sm text-soft">{{ cat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ MASCOTTES / AMBIANCE ═══════════════════════ -->
    <section class="section mascots-section">
      <div class="container mascots-inner">
        <div class="mascots-text animate-fade-in-up">
          <span class="badge badge-green mb-3">Notre promesse</span>
          <h2 class="display-md">Pour chaque chien,<br/>une box qui lui ressemble</h2>
          <p class="text-lg text-soft mt-3 mb-5">
            Taille XS, S, M ou L — chaque box est composée selon le gabarit de votre compagnon. Pas de compromis : les friandises, les jouets et les soins sont toujours parfaitement adaptés.
          </p>
          <div class="mascots-sizes">
            <div v-for="s in sizes" :key="s.label" class="size-card">
              <span class="size-label">{{ s.label }}</span>
              <span class="size-weight text-sm text-muted">{{ s.poids }}</span>
            </div>
          </div>
        </div>
        <div class="mascots-images">
          <img :src="images.mascotte_1" alt="" class="mascot-img m1 animate-float" />
          <img :src="images.mascotte2" alt="" class="mascot-img m2 animate-float-slow delay-200" />
          <img :src="images.mascotte_4" alt="" class="mascot-img m3 animate-float delay-400" />
        </div>
      </div>
    </section>

    <!-- ═══ TÉMOIGNAGES ════════════════════════════════ -->
    <section class="section testimonials-section">
      <div class="container">
        <div class="section-header text-center">
          <span class="badge badge-blue mb-3">Ils nous font confiance</span>
          <h2 class="display-md">La communauté Dawky 🐾</h2>
        </div>

        <div class="testimonials-grid">
          <div v-for="t in testimonials" :key="t.name" class="testimonial-card animate-fade-in-up">
            <div class="testimonial-stars">⭐⭐⭐⭐⭐</div>
            <p class="testimonial-text">"{{ t.text }}"</p>
            <div class="testimonial-author">
              <div class="testimonial-avatar">{{ t.name[0] }}</div>
              <div>
                <p class="font-semibold">{{ t.name }}</p>
                <p class="text-sm text-muted">{{ t.dog }} • {{ t.size }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ CTA FINAL ═══════════════════════════════════ -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-card">
          <div class="cta-pattern">
            <img :src="images.fond_motif_bleu" alt="" />
          </div>
          <div class="cta-content text-center">
            <img :src="images.sachet_patoune" alt="" class="cta-sachet animate-float" />
            <h2 class="display-md text-white">Prêt à faire plaisir<br/>à votre chien ?</h2>
            <p class="text-lg cta-sub">Faites le quiz en 2 minutes — c'est gratuit et sans engagement.</p>
            <div class="cta-buttons">
              <NuxtLink to="/quiz" class="btn btn-yellow btn-lg">
                🐾 Faire le quiz maintenant
              </NuxtLink>
              <NuxtLink to="/offres" class="btn btn-white btn-lg">
                Voir les offres
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { dawkyImages } from '~/composables/useDawkyImages'
const images = dawkyImages

useSeoMeta({
  title: 'Dawky — La box premium pour chiens',
  description: 'Box Surprise mensuelle ou À la Carte, adaptée à la taille de votre chien. 5 produits soignés dès 27,90€.',
})

const surpriseFeatures = [
  '5 produits sélectionnés par nos experts',
  'Adapté à la taille de votre chien',
  'Livraison le 1er du mois',
  'Sans engagement (résiliation en 1 clic)',
]

const carteFeatures = [
  '5 produits au choix dans notre catalogue',
  'Idéal en cas d\'allergies',
  'Commande ponctuelle',
  'Prix réduits sur les invendus',
]

const steps = [
  { emoji: '🐾', title: 'Faites le quiz', desc: 'Parlez-nous de votre chien : race, poids, goûts… en 2 minutes.' },
  { emoji: '📦', title: 'On prépare votre box', desc: 'Nos experts composent une sélection adaptée à votre compagnon.' },
  { emoji: '🚚', title: 'Livraison à domicile', desc: 'Votre box arrive le 1er du mois, directement chez vous.' },
  { emoji: '🎉', title: 'Profitez !', desc: 'Votre chien découvre ses surprises — et vous aussi !' },
]

const categories = [
  { emoji: '🦌', label: 'Mastication', desc: 'Bois de cerf, sabots naturels…', img: images.mastication },
  { emoji: '🍖', label: 'Nutrition', desc: 'Friandises saines, sans céréales', img: images.ble },
  { emoji: '🎾', label: 'Jouets', desc: 'Résistants, stimulants, sécurisés', img: images.balle },
  { emoji: '🌿', label: 'Soins', desc: 'Coussinets, pelage, hygiène', img: images.collier },
  { emoji: '🎀', label: 'Accessoires', desc: 'Bandanas, médailles, surprises', img: images.gamelle },
]

const sizes = [
  { label: 'XS', poids: '< 5 kg' },
  { label: 'S', poids: '5–10 kg' },
  { label: 'M', poids: '10–25 kg' },
  { label: 'L', poids: '> 25 kg' },
]

const testimonials = [
  { name: 'Sophie M.', dog: 'Luna', size: 'Border Collie • M', text: 'Luna attend sa box avec impatience chaque mois. Les produits sont vraiment de qualité et bien adaptés à sa taille !' },
  { name: 'Thomas L.', dog: 'Rocky', size: 'Chihuahua • XS', text: 'J\'adore la Box À la Carte pour Rocky qui est allergique au poulet. Enfin une box qui s\'adapte à ses besoins !' },
  { name: 'Marie D.', dog: 'Max', size: 'Labrador • L', text: 'Les jouets résistent enfin au niveau de Max 😂 Et les friandises sont parties en 5 secondes. Dawky c\'est top !' },
]
</script>

<style scoped>
/* ── HERO ────────────────────────────────── */
.hero {
  min-height: 90vh;
  background: linear-gradient(135deg, #e8f9ff 0%, #f0fdf4 50%, #fffbf4 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.hero-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.06;
  pointer-events: none;
}
.hero-pattern .pattern-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
  align-items: center;
  flex: 1;
  padding-top: var(--space-8);
  padding-bottom: var(--space-10);
}

.hero-badge { margin-bottom: var(--space-4); }

.hero-title {
  margin-bottom: var(--space-5);
  em { font-style: italic; }
}

.hero-desc {
  margin-bottom: var(--space-6);
  max-width: 480px;
}

.hero-ctas {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-bottom: var(--space-5);
}

.hero-trust {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.trust-item {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ink-soft);
}

.hero-visual { position: relative; display: flex; justify-content: center; }

.hero-mascot-wrap {
  position: relative;
  width: 100%;
  max-width: 420px;
}

.hero-mascot {
  width: 100%;
  max-width: 380px;
  margin: 0 auto;
  filter: drop-shadow(0 20px 60px rgba(4,172,227,0.2));
}

.hero-floating {
  position: absolute;
  width: 80px;
  background: white;
  border-radius: var(--radius-lg);
  padding: 10px;
  box-shadow: var(--shadow-md);
}
.hero-floating img { width: 100%; border-radius: 8px; }
.hero-floating-1 { top: 10%; left: -5%; }
.hero-floating-2 { top: 50%; right: -5%; }
.hero-floating-3 { bottom: 15%; left: 10%; }

.hero-curve {
  line-height: 0;
  margin-top: -1px;
}
.hero-curve svg { width: 100%; display: block; }

/* ── OFFERS ──────────────────────────────── */
.offers-section { background: var(--cream); }

.section-header { margin-bottom: var(--space-8); }
.section-header .mb-3 { margin-bottom: var(--space-3); }

.offers-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}

.offer-card {
  background: white;
  border-radius: var(--radius-xl);
  border: 2px solid var(--border);
  overflow: hidden;
  transition: transform var(--duration-base) var(--ease-out), box-shadow var(--duration-base);
}

.offer-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); }

.offer-card-yellow { background: var(--yellow-pale); border-color: rgba(255,187,51,0.25); }

.offer-card-inner { padding: var(--space-7); }

.offer-icon { width: 64px; height: 64px; margin-bottom: var(--space-4); }
.offer-icon img { width: 100%; }

.offer-badge-top { margin-bottom: var(--space-3); }

.offer-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: var(--space-3);
}

.offer-desc {
  color: var(--ink-soft);
  margin-bottom: var(--space-5);
  line-height: 1.6;
}

.offer-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: var(--space-5);
}

.offer-price-amount {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 900;
  color: var(--blue);
  line-height: 1;
}

.offer-price-period {
  font-size: 0.9rem;
  color: var(--ink-muted);
}

.offer-features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}

.offer-features li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  font-size: 0.9375rem;
  color: var(--ink-soft);
}

.offer-check {
  color: var(--blue);
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 2px;
}

.offer-sizes {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}

.size-chip {
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.8125rem;
  font-weight: 700;
  background: rgba(4,172,227,0.1);
  color: var(--blue);
}

.size-chip-yellow {
  background: rgba(255,187,51,0.15);
  color: #9A6500;
}

/* ── HOW ─────────────────────────────────── */
.how-section {
  background: white;
  position: relative;
  overflow: hidden;
}

.how-bg {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  pointer-events: none;
}
.how-pattern { width: 100%; height: 100%; object-fit: cover; }

.steps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-5);
  margin-bottom: var(--space-8);
}

.step-card {
  background: var(--cream);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  text-align: center;
  border: 2px solid var(--border);
  transition: transform var(--duration-base) var(--ease-out);
}

.step-card:hover { transform: translateY(-4px); }

.step-number {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 900;
  color: var(--blue);
  opacity: 0.15;
  line-height: 1;
  margin-bottom: -8px;
}

.step-emoji { font-size: 2.5rem; margin-bottom: var(--space-3); }

.step-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: var(--space-3);
}

.step-desc { font-size: 0.9rem; color: var(--ink-soft); line-height: 1.5; }

.how-cta { margin-top: var(--space-2); }

/* ── CATEGORIES ─────────────────────────── */
.products-section { background: var(--cream); }

.categories-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-4);
}

.category-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-5) var(--space-4);
  text-align: center;
  border: 2px solid var(--border);
  transition: transform var(--duration-base) var(--ease-out);
}

.category-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }

.category-emoji { font-size: 2rem; margin-bottom: var(--space-3); }

.category-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin: 0 auto var(--space-3);
}

.category-label {
  font-weight: 700;
  margin-bottom: var(--space-1);
}

.category-desc { font-size: 0.8125rem; color: var(--ink-muted); }

/* ── MASCOTTES ───────────────────────────── */
.mascots-section { background: white; overflow: hidden; }

.mascots-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
  align-items: center;
}

.mascots-sizes {
  display: flex;
  gap: var(--space-3);
}

.size-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(4,172,227,0.06);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
}

.size-label {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--blue);
}

.size-weight { color: var(--ink-muted); }

.mascots-images {
  position: relative;
  height: 400px;
}

.mascot-img {
  position: absolute;
  filter: drop-shadow(0 10px 30px rgba(4,172,227,0.15));
}
.m1 { width: 160px; top: 0; left: 0; }
.m2 { width: 200px; bottom: 0; right: 10%; }
.m3 { width: 140px; top: 20%; right: 0; }

/* ── TESTIMONIALS ────────────────────────── */
.testimonials-section { background: var(--cream); }

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
}

.testimonial-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  border: 2px solid var(--border);
  transition: transform var(--duration-base);
}

.testimonial-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }

.testimonial-stars { font-size: 1.125rem; margin-bottom: var(--space-3); }

.testimonial-text {
  font-size: 0.9375rem;
  color: var(--ink-soft);
  line-height: 1.7;
  font-style: italic;
  margin-bottom: var(--space-5);
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.testimonial-avatar {
  width: 44px; height: 44px;
  background: var(--blue-light);
  color: var(--blue-deep);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
  flex-shrink: 0;
}

/* ── CTA FINAL ───────────────────────────── */
.cta-section { padding: 0 0 var(--space-9); }

.cta-card {
  background: var(--blue);
  border-radius: var(--radius-xl);
  padding: var(--space-9) var(--space-6);
  position: relative;
  overflow: hidden;
}

.cta-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.06;
  pointer-events: none;
}
.cta-pattern img { width: 100%; height: 100%; object-fit: cover; }

.cta-content { position: relative; z-index: 1; }

.cta-sachet {
  width: 120px;
  margin: 0 auto var(--space-4);
  filter: drop-shadow(0 10px 30px rgba(0,0,0,0.2));
}

.cta-sub {
  color: rgba(255,255,255,0.75);
  margin: var(--space-3) 0 var(--space-6);
}

.cta-buttons {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  flex-wrap: wrap;
}

/* ── RESPONSIVE ──────────────────────────── */
@media (max-width: 1024px) {
  .categories-grid { grid-template-columns: repeat(3, 1fr); }
  .steps-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .hero-inner { grid-template-columns: 1fr; text-align: center; }
  .hero-visual { display: none; }
  .hero-ctas { justify-content: center; }
  .hero-trust { justify-content: center; }
  .hero-desc { margin: 0 auto var(--space-6); }
  .offers-grid { grid-template-columns: 1fr; }
  .steps-grid { grid-template-columns: 1fr; }
  .categories-grid { grid-template-columns: repeat(2, 1fr); }
  .testimonials-grid { grid-template-columns: 1fr; }
  .mascots-inner { grid-template-columns: 1fr; }
  .mascots-images { height: 200px; }
}

@media (max-width: 480px) {
  .categories-grid { grid-template-columns: 1fr 1fr; }
  .mascots-sizes { flex-wrap: wrap; }
}
</style>
