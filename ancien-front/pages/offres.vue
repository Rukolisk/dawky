<template>
  <div class="offres-page">

    <!-- Hero -->
    <div class="offres-hero">
      <div class="container offres-hero-inner">
        <div class="text-center">
          <span class="badge badge-blue">📦 Nos formules</span>
          <h1 class="display-lg mt-3 mb-3 text-white">Deux box, un seul objectif :</h1>
          <p class="text-xl offres-hero-sub">Faire frétiller la queue de votre chien 🐾</p>
        </div>
      </div>
    </div>

    <!-- Formulas tabs -->
    <div class="container offres-content">

      <!-- Switcher type box -->
      <div class="type-switcher">
        <button
          class="type-btn"
          :class="{ active: activeType === 'SURPRISE' }"
          @click="activeType = 'SURPRISE'"
        >
          <span>✨</span> Box Surprise
        </button>
        <button
          class="type-btn"
          :class="{ active: activeType === 'CARTE' }"
          @click="activeType = 'CARTE'"
        >
          <span>🛒</span> Box À la Carte
        </button>
      </div>

      <!-- Box Surprise -->
      <div v-if="activeType === 'SURPRISE'" class="box-section animate-fade-in-up">
        <div class="box-explain">
          <div class="box-explain-text">
            <img :src="images.picto_truffe_bleu" alt="" class="box-explain-picto" />
            <div>
              <h2 class="display-md">Box Surprise</h2>
              <p class="text-lg text-soft mt-2">
                Chaque mois, nos experts composent une box de 5 produits adaptée à la taille de votre chien.
                Jouets, friandises, soins et accessoires — la surprise garantie !
              </p>
            </div>
          </div>
          <div class="box-avantages">
            <div v-for="av in surpriseAvantages" :key="av.label" class="avantage-item">
              <span class="avantage-icon">{{ av.icon }}</span>
              <div>
                <p class="font-semibold">{{ av.label }}</p>
                <p class="text-sm text-soft">{{ av.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Taille selector -->
        <div class="taille-section">
          <h3 class="taille-title">Choisissez la taille de votre chien</h3>
          <div class="taille-grid">
            <button
              v-for="t in tailles"
              :key="t.value"
              class="taille-card"
              :class="{ active: selectedTaille === t.value }"
              @click="selectedTaille = t.value"
            >
              <div class="taille-letter">{{ t.value }}</div>
              <div class="taille-name">{{ t.label }}</div>
              <div class="taille-poids">{{ t.poids }}</div>
              <img :src="t.mascot" alt="" class="taille-mascot" />
            </button>
          </div>
        </div>

        <!-- Prix et CTA -->
        <div v-if="selectedTaille" class="price-cta-section animate-fade-in-up">
          <div class="price-cta-card">
            <div class="price-cta-left">
              <div class="price-cta-tag">
                <span class="price-big">{{ selectedFormulaSurprise?.prix?.toFixed(2) ?? '27,90' }}&nbsp;€</span>
                <span class="price-period">/mois</span>
              </div>
              <p class="text-soft">Taille {{ selectedTaille }} · 5 produits sélectionnés · Livraison offerte</p>
            </div>
            <div class="price-cta-actions">
              <NuxtLink to="/quiz" class="btn btn-primary btn-lg">
                🐾 Faire le quiz d'abord
              </NuxtLink>
              <NuxtLink to="/connexion" class="btn btn-outline btn-lg">
                Commander directement
              </NuxtLink>
            </div>
          </div>
          <p class="price-note">🔒 Sans engagement · Résiliation en 1 clic · Livraison le 1er du mois</p>
        </div>
      </div>

      <!-- Box À la Carte -->
      <div v-if="activeType === 'CARTE'" class="box-section animate-fade-in-up">
        <div class="box-explain">
          <div class="box-explain-text">
            <img :src="images.picto_truffe_jaune" alt="" class="box-explain-picto" />
            <div>
              <h2 class="display-md">Box À la Carte</h2>
              <p class="text-lg text-soft mt-2">
                Vous composez vous-même votre box en choisissant 5 produits dans notre catalogue.
                Idéale pour les chiens avec des allergies ou des préférences bien précises !
              </p>
            </div>
          </div>
          <div class="box-avantages">
            <div v-for="av in carteAvantages" :key="av.label" class="avantage-item">
              <span class="avantage-icon">{{ av.icon }}</span>
              <div>
                <p class="font-semibold">{{ av.label }}</p>
                <p class="text-sm text-soft">{{ av.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Catalogue produits -->
        <div class="catalogue-section">
          <div class="catalogue-filters">
            <h3 class="catalogue-title">Notre catalogue</h3>
            <div class="filter-row">
              <!-- Taille -->
              <select v-model="filterTaille" class="form-select filter-select">
                <option value="">Toutes tailles</option>
                <option v-for="t in tailles" :key="t.value" :value="t.value">{{ t.value }} — {{ t.label }}</option>
              </select>
              <!-- Catégorie -->
              <div class="filter-pills">
                <button
                  v-for="cat in categories"
                  :key="cat.value"
                  class="pill pill-blue"
                  :class="{ active: filterCat === cat.value }"
                  @click="filterCat = filterCat === cat.value ? '' : cat.value"
                >
                  {{ cat.icon }} {{ cat.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="produitsLoading" class="catalogue-loading">
            <div class="skeleton-grid">
              <div v-for="i in 6" :key="i" class="skeleton-card" />
            </div>
          </div>

          <!-- Produits grid -->
          <div v-else class="produits-grid">
            <div
              v-for="p in produitsFiltres"
              :key="p.id"
              class="produit-card"
              :class="{ selected: cartSelection.includes(p.id) }"
              @click="toggleCart(p)"
            >
              <div class="produit-emoji">{{ p.emoji }}</div>
              <div class="produit-info">
                <div class="produit-badge-cat">
                  <span class="badge" :class="catColors[p.categorie]">{{ catLabels[p.categorie] }}</span>
                  <span v-if="p.estInvendu" class="badge badge-rose">Promo</span>
                </div>
                <h4 class="produit-nom">{{ p.nom }}</h4>
                <p class="produit-desc text-sm text-soft">{{ p.description }}</p>
                <div class="produit-tailles">
                  <span v-for="t in p.tailles" :key="t.taille" class="size-chip size-chip-sm">{{ t.taille }}</span>
                </div>
              </div>
              <div class="produit-select-icon">
                <span v-if="cartSelection.includes(p.id)" class="select-check">✓</span>
                <span v-else class="select-plus">+</span>
              </div>
            </div>
          </div>

          <p v-if="!produitsLoading && produitsFiltres.length === 0" class="catalogue-empty">
            Aucun produit pour ces filtres.
          </p>
        </div>

        <!-- Panier flottant -->
        <Transition name="slide-up">
          <div v-if="cartSelection.length > 0" class="cart-float">
            <div class="cart-float-inner container">
              <div class="cart-float-info">
                <span class="cart-count-badge">{{ cartSelection.length }}/5</span>
                <span class="font-semibold">produits sélectionnés</span>
                <div class="cart-slots">
                  <div v-for="i in 5" :key="i" class="cart-slot" :class="{ filled: i <= cartSelection.length }" />
                </div>
              </div>
              <div class="cart-float-actions">
                <span class="cart-price">{{ selectedFormulaCart?.prix?.toFixed(2) ?? '24,90' }}&nbsp;€</span>
                <NuxtLink
                  :to="cartSelection.length === 5 ? '/connexion' : '#'"
                  class="btn btn-yellow"
                  :class="{ 'btn-disabled': cartSelection.length < 5 }"
                >
                  {{ cartSelection.length < 5 ? `Encore ${5 - cartSelection.length} produit(s)` : 'Commander ma box 🐾' }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Comparatif -->
      <div class="comparatif-section">
        <h2 class="display-md text-center mb-7">Surprise ou À la Carte ?</h2>
        <div class="comparatif-grid">
          <div class="comparatif-header"><div /><div class="cmp-name cmp-blue">Box Surprise</div><div class="cmp-name cmp-yellow">Box À la Carte</div></div>
          <div v-for="row in comparatif" :key="row.label" class="comparatif-row">
            <div class="cmp-label">{{ row.label }}</div>
            <div class="cmp-cell"><span :class="row.surprise.yes ? 'cmp-yes' : 'cmp-no'">{{ row.surprise.text }}</span></div>
            <div class="cmp-cell"><span :class="row.carte.yes ? 'cmp-yes' : 'cmp-no'">{{ row.carte.text }}</span></div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { dawkyImages } from '~/composables/useDawkyImages'
const images = dawkyImages

useSeoMeta({ title: 'Nos offres — Box Surprise & À la Carte | Dawky' })

const activeType = ref<'SURPRISE' | 'CARTE'>('SURPRISE')
const selectedTaille = ref('')
const filterTaille = ref('')
const filterCat = ref('')
const cartSelection = ref<string[]>([])
const produitsLoading = ref(false)
const produits = ref<any[]>([])

const tailles = [
  { value: 'XS', label: 'Mini',   poids: '< 5 kg',   mascot: images.mascotte_1 },
  { value: 'S',  label: 'Petit',  poids: '5–10 kg',  mascot: images.mascotte2 },
  { value: 'M',  label: 'Moyen',  poids: '10–25 kg', mascot: images.mascotte_3 },
  { value: 'L',  label: 'Grand',  poids: '> 25 kg',  mascot: images.mascotte_4 },
]

const categories = [
  { value: 'MASTICATION', icon: '🦌', label: 'Mastication' },
  { value: 'NUTRITION',   icon: '🍖', label: 'Nutrition' },
  { value: 'JOUET',       icon: '🎾', label: 'Jouets' },
  { value: 'SOIN',        icon: '🌿', label: 'Soins' },
  { value: 'ACCESSOIRE',  icon: '🎀', label: 'Accessoires' },
]

const catColors: Record<string, string> = {
  MASTICATION: 'badge-blue', NUTRITION: 'badge-green', JOUET: 'badge-yellow',
  SOIN: 'badge-rose', ACCESSOIRE: 'badge-blue',
}
const catLabels: Record<string, string> = {
  MASTICATION: '🦌 Mastication', NUTRITION: '🍖 Nutrition', JOUET: '🎾 Jouet',
  SOIN: '🌿 Soin', ACCESSOIRE: '🎀 Accessoire',
}

const surpriseAvantages = [
  { icon: '🎁', label: 'La surprise du mois', desc: 'Sélection exclusive par nos experts' },
  { icon: '💛', label: 'Adapté à votre chien', desc: 'Selon sa taille et ses besoins' },
  { icon: '🚚', label: 'Livraison offerte', desc: 'Le 1er de chaque mois' },
  { icon: '🔓', label: 'Sans engagement', desc: 'Résiliation en 1 clic à tout moment' },
]

const carteAvantages = [
  { icon: '🛒', label: 'Vous choisissez', desc: '5 produits parmi notre catalogue' },
  { icon: '⚠️', label: 'Contrôle des allergènes', desc: 'Idéal pour les chiens sensibles' },
  { icon: '💰', label: 'Invendus à prix réduit', desc: 'Bons produits, moins chers' },
  { icon: '📦', label: 'Sans abonnement', desc: 'Commandez quand vous voulez' },
]

const comparatif = [
  { label: 'Prix',               surprise: { text: '27,90 €/mois', yes: true }, carte: { text: '24,90 € par box', yes: true } },
  { label: 'Livraison',          surprise: { text: '✓ Offerte', yes: true }, carte: { text: '✓ Offerte', yes: true } },
  { label: 'Choix des produits', surprise: { text: 'Non (surprise)', yes: false }, carte: { text: '✓ Oui', yes: true } },
  { label: 'Adapté allergiques', surprise: { text: 'Non recommandé', yes: false }, carte: { text: '✓ Parfait', yes: true } },
  { label: 'Sans engagement',    surprise: { text: '✓ Oui', yes: true }, carte: { text: '✓ Toujours', yes: true } },
  { label: 'Abonnement mensuel', surprise: { text: '✓ Automatique', yes: true }, carte: { text: 'Non (ponctuel)', yes: false } },
]

// Load formulas
const { data: boxesData } = await useFetch('/api/boxes')
const formulas = computed(() => (boxesData.value as any)?.data ?? [])
const selectedFormulaSurprise = computed(() => formulas.value.find((f: any) => f.type === 'SURPRISE'))
const selectedFormulaCart     = computed(() => formulas.value.find((f: any) => f.type === 'CARTE'))

// Load produits
async function fetchProduits() {
  produitsLoading.value = true
  try {
    const params: Record<string, string> = { limit: '50' }
    if (filterTaille.value) params.taille = filterTaille.value
    if (filterCat.value) params.categorie = filterCat.value
    const data = await $fetch('/api/produits', { query: params })
    produits.value = (data as any).data?.produits ?? []
  } finally { produitsLoading.value = false }
}

watch([filterTaille, filterCat, activeType], () => {
  if (activeType.value === 'CARTE') fetchProduits()
})
watch(activeType, (v) => { if (v === 'CARTE') fetchProduits() }, { immediate: true })

const produitsFiltres = computed(() => produits.value)

function toggleCart(p: any) {
  const idx = cartSelection.value.indexOf(p.id)
  if (idx >= 0) {
    cartSelection.value.splice(idx, 1)
  } else if (cartSelection.value.length < 5) {
    cartSelection.value.push(p.id)
  }
}
</script>

<style scoped>
/* Hero */
.offres-hero {
  background: linear-gradient(135deg, var(--blue) 0%, var(--blue-deep) 100%);
  padding: var(--space-9) 0 var(--space-8);
}
.offres-hero-sub { color: rgba(255,255,255,0.8); }

/* Content */
.offres-content { padding: var(--space-7) 0 var(--space-9); }

/* Switcher */
.type-switcher {
  display: inline-flex;
  background: white;
  border: 2px solid var(--border);
  border-radius: var(--radius-pill);
  padding: 4px;
  gap: 4px;
  margin: 0 auto var(--space-8);
  display: flex;
  max-width: 400px;
}
.type-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 12px 24px;
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--ink-muted);
  transition: all var(--duration-base);
}
.type-btn.active { background: var(--blue); color: white; box-shadow: 0 4px 16px rgba(4,172,227,0.3); }

/* Box section */
.box-section { display: flex; flex-direction: column; gap: var(--space-7); }

.box-explain {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-7);
  align-items: center;
}
.box-explain-text { display: flex; gap: var(--space-4); align-items: flex-start; grid-column: 1; }
.box-explain-picto { width: 64px; flex-shrink: 0; }
.box-avantages { display: flex; flex-direction: column; gap: var(--space-4); }
.avantage-item { display: flex; gap: var(--space-3); align-items: flex-start; }
.avantage-icon { font-size: 1.5rem; flex-shrink: 0; }

/* Taille selector */
.taille-section { background: white; border-radius: var(--radius-xl); padding: var(--space-6); border: 2px solid var(--border); }
.taille-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; margin-bottom: var(--space-5); }
.taille-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); }

.taille-card {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-2);
  padding: var(--space-5) var(--space-4); border: 2px solid var(--border);
  border-radius: var(--radius-lg); background: var(--cream);
  cursor: pointer; transition: all var(--duration-base); font-family: var(--font-body);
  position: relative; overflow: hidden;
}
.taille-card:hover { border-color: var(--blue); transform: translateY(-2px); }
.taille-card.active { border-color: var(--blue); background: rgba(4,172,227,0.06); box-shadow: var(--shadow-md); }

.taille-letter { font-family: var(--font-display); font-size: 3rem; font-weight: 900; color: var(--blue); line-height: 1; }
.taille-name { font-weight: 700; }
.taille-poids { font-size: 0.8125rem; color: var(--ink-muted); }
.taille-mascot { width: 70px; object-fit: contain; margin-top: var(--space-2); }

/* Price CTA */
.price-cta-section { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); }
.price-cta-card {
  width: 100%; background: linear-gradient(135deg, var(--blue) 0%, var(--blue-deep) 100%);
  border-radius: var(--radius-xl); padding: var(--space-6) var(--space-7);
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-5);
  flex-wrap: wrap;
}
.price-cta-left { color: white; }
.price-cta-tag { display: flex; align-items: baseline; gap: 4px; }
.price-big { font-family: var(--font-display); font-size: 3rem; font-weight: 900; color: white; }
.price-period { font-size: 1rem; color: rgba(255,255,255,0.7); }
.price-cta-left p { color: rgba(255,255,255,0.7); margin-top: 4px; }
.price-cta-actions { display: flex; gap: var(--space-3); flex-wrap: wrap; }
.price-note { font-size: 0.875rem; color: var(--ink-muted); }

/* Catalogue */
.catalogue-section { display: flex; flex-direction: column; gap: var(--space-5); }
.catalogue-filters { display: flex; flex-direction: column; gap: var(--space-3); }
.catalogue-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; }
.filter-row { display: flex; gap: var(--space-4); align-items: center; flex-wrap: wrap; }
.filter-select { max-width: 200px; }
.filter-pills { display: flex; flex-wrap: wrap; gap: var(--space-2); }

.skeleton-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
.skeleton-card { background: #eee; border-radius: var(--radius-lg); height: 120px; animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

.produits-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
.catalogue-empty { text-align: center; color: var(--ink-muted); padding: var(--space-7); }

.produit-card {
  display: flex; gap: var(--space-4); padding: var(--space-4);
  background: white; border: 2px solid var(--border); border-radius: var(--radius-lg);
  cursor: pointer; transition: all var(--duration-fast); align-items: flex-start;
}
.produit-card:hover { border-color: var(--blue); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
.produit-card.selected { border-color: var(--blue); background: rgba(4,172,227,0.05); }

.produit-emoji { font-size: 2.5rem; flex-shrink: 0; }
.produit-info { flex: 1; min-width: 0; }
.produit-badge-cat { display: flex; gap: var(--space-2); margin-bottom: var(--space-2); flex-wrap: wrap; }
.produit-nom { font-weight: 700; margin-bottom: 4px; }
.produit-desc { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.produit-tailles { display: flex; gap: 4px; margin-top: var(--space-2); flex-wrap: wrap; }
.size-chip-sm { padding: 2px 8px; font-size: 0.7rem; font-weight: 700; background: rgba(4,172,227,0.1); color: var(--blue); border-radius: var(--radius-pill); }

.produit-select-icon { flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid var(--border); transition: all var(--duration-fast); }
.produit-card.selected .produit-select-icon { background: var(--blue); border-color: var(--blue); }
.select-check { color: white; font-weight: 700; font-size: 0.875rem; }
.select-plus { color: var(--ink-muted); font-size: 1.25rem; line-height: 1; }

/* Cart float */
.cart-float {
  position: fixed; bottom: var(--space-5); left: 0; right: 0; z-index: 500;
  pointer-events: none;
}
.cart-float-inner {
  background: var(--ink); color: white; border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-6); display: flex; align-items: center;
  justify-content: space-between; gap: var(--space-4); box-shadow: var(--shadow-lg);
  pointer-events: all; flex-wrap: wrap;
}
.cart-float-info { display: flex; align-items: center; gap: var(--space-3); }
.cart-count-badge {
  background: var(--yellow); color: var(--ink); font-weight: 900; font-size: 1.125rem;
  padding: 4px 14px; border-radius: var(--radius-pill);
}
.cart-slots { display: flex; gap: 6px; }
.cart-slot { width: 20px; height: 6px; border-radius: 3px; background: rgba(255,255,255,0.15); transition: background var(--duration-fast); }
.cart-slot.filled { background: var(--blue); }
.cart-float-actions { display: flex; align-items: center; gap: var(--space-4); }
.cart-price { font-family: var(--font-display); font-size: 1.75rem; font-weight: 900; color: white; }
.btn-disabled { opacity: 0.6; pointer-events: none; }

/* Slide-up transition */
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s var(--ease-spring), opacity 0.3s; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }

/* Comparatif */
.comparatif-section { padding-top: var(--space-9); border-top: 1px solid var(--border); }
.comparatif-grid { border: 2px solid var(--border); border-radius: var(--radius-xl); overflow: hidden; }
.comparatif-header, .comparatif-row {
  display: grid; grid-template-columns: 2fr 1.5fr 1.5fr;
}
.comparatif-header { background: var(--cream); padding: var(--space-4) var(--space-5); }
.cmp-name { font-weight: 700; text-align: center; }
.cmp-blue { color: var(--blue); }
.cmp-yellow { color: #9A6500; }
.comparatif-row { padding: var(--space-4) var(--space-5); border-top: 1px solid var(--border); background: white; }
.comparatif-row:nth-child(odd) { background: var(--cream); }
.cmp-label { font-weight: 500; color: var(--ink-soft); }
.cmp-cell { text-align: center; }
.cmp-yes { color: #2D7A4A; font-weight: 600; }
.cmp-no { color: var(--ink-muted); }

@media (max-width: 768px) {
  .box-explain { grid-template-columns: 1fr; }
  .taille-grid { grid-template-columns: repeat(2, 1fr); }
  .produits-grid { grid-template-columns: 1fr 1fr; }
  .price-cta-card { flex-direction: column; }
  .price-cta-actions { width: 100%; flex-direction: column; }
  .price-cta-actions .btn { width: 100%; }
  .comparatif-header, .comparatif-row { grid-template-columns: 1.5fr 1fr 1fr; }
}

@media (max-width: 480px) {
  .produits-grid { grid-template-columns: 1fr; }
  .taille-grid { grid-template-columns: repeat(2, 1fr); }
  .cart-float-info .font-semibold, .cart-slots { display: none; }
}
</style>
