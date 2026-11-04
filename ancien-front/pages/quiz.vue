<template>
  <div class="quiz-page">

    <!-- Header décoratif -->
    <div class="quiz-hero">
      <div class="quiz-hero-pattern">
        <img :src="images.fond_motif_bleu" alt="" />
      </div>
      <div class="container quiz-hero-inner">
        <div class="quiz-hero-text">
          <span class="badge badge-yellow">🐾 Quiz gratuit</span>
          <h1 class="display-md text-white mt-3">Trouve la box parfaite<br/>pour ton chien</h1>
          <p class="quiz-hero-sub">2 minutes · Sans engagement · 100% personnalisé</p>
        </div>
        <img :src="images.mascotte_5" alt="" class="quiz-hero-mascot animate-float" />
      </div>
    </div>

    <!-- Progress bar -->
    <div class="quiz-progress-wrap">
      <div class="container">
        <div class="quiz-progress-bar">
          <div
            v-for="i in totalSteps" :key="i"
            class="quiz-progress-step"
            :class="{ done: i < step, active: i === step }"
          >
            <div class="quiz-progress-dot">
              <span v-if="i < step">✓</span>
              <span v-else>{{ i }}</span>
            </div>
            <span class="quiz-progress-label">{{ stepLabels[i - 1] }}</span>
          </div>
          <div class="quiz-progress-line" :style="{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }" />
        </div>
      </div>
    </div>

    <!-- Corps du quiz -->
    <div class="container quiz-body" v-if="!result">
      <div class="quiz-card">

        <!-- ÉTAPE 1 — Profil du chien -->
        <div v-if="step === 1" class="quiz-step animate-fade-in-up">
          <h2 class="quiz-step-title">Parle-moi de ton chien 🐶</h2>
          <div class="quiz-fields">
            <div class="form-group">
              <label class="form-label">Prénom de ton chien *</label>
              <input v-model="form.nomChien" type="text" class="form-input" placeholder="Ex: Luna, Max, Gribouille…" />
            </div>
            <div class="quiz-row">
              <div class="form-group">
                <label class="form-label">Race</label>
                <input v-model="form.race" type="text" class="form-input" placeholder="Ex: Labrador, Beagle…" />
              </div>
              <div class="form-group">
                <label class="form-label">Âge (années) *</label>
                <input v-model.number="form.age" type="number" class="form-input" min="0" max="25" step="0.5" placeholder="Ex: 3" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Poids (kg) *</label>
              <div class="weight-selector">
                <button
                  v-for="w in weightOptions"
                  :key="w.value"
                  type="button"
                  class="weight-btn"
                  :class="{ active: selectedWeightRange === w.value }"
                  @click="selectWeight(w)"
                >
                  <span class="weight-icon">{{ w.icon }}</span>
                  <span class="weight-size">{{ w.size }}</span>
                  <span class="weight-label">{{ w.label }}</span>
                </button>
              </div>
              <p v-if="selectedWeightRange" class="quiz-taille-hint">
                Taille estimée : <strong class="text-blue">{{ tailleEstimee }}</strong>
              </p>
            </div>
          </div>
          <p v-if="errors.step1" class="form-error mt-2">{{ errors.step1 }}</p>
        </div>

        <!-- ÉTAPE 2 — Habitudes -->
        <div v-if="step === 2" class="quiz-step animate-fade-in-up">
          <h2 class="quiz-step-title">Les habitudes de {{ form.nomChien || 'ton chien' }} 🎾</h2>

          <div class="quiz-fields">
            <!-- Niveau activité -->
            <div class="form-group">
              <label class="form-label">Niveau d'activité</label>
              <div class="option-cards">
                <button
                  v-for="a in activiteOptions"
                  :key="a.value"
                  type="button"
                  class="option-card"
                  :class="{ active: form.niveauActivite === a.value }"
                  @click="form.niveauActivite = a.value"
                >
                  <span class="option-icon">{{ a.icon }}</span>
                  <span class="option-label">{{ a.label }}</span>
                  <span class="option-desc">{{ a.desc }}</span>
                </button>
              </div>
            </div>

            <!-- Mâcheur -->
            <div class="form-group">
              <label class="form-label">Ton chien est-il un grand mâcheur ?</label>
              <div class="bool-cards">
                <button type="button" class="bool-card" :class="{ active: form.estMacheur === true }" @click="form.estMacheur = true">
                  <span>🦷</span> <span>Oui, il adore mâcher</span>
                </button>
                <button type="button" class="bool-card" :class="{ active: form.estMacheur === false }" @click="form.estMacheur = false">
                  <span>😌</span> <span>Non, plutôt calme</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ÉTAPE 3 — Santé / Allergies -->
        <div v-if="step === 3" class="quiz-step animate-fade-in-up">
          <h2 class="quiz-step-title">Santé & alimentation de {{ form.nomChien || 'ton chien' }} 🌿</h2>

          <div class="quiz-fields">
            <div class="form-group">
              <label class="form-label">A-t-il des allergies ou intolérances ?</label>
              <div class="bool-cards">
                <button type="button" class="bool-card" :class="{ active: form.aDesAllergies === true }" @click="form.aDesAllergies = true">
                  <span>⚠️</span> <span>Oui</span>
                </button>
                <button type="button" class="bool-card" :class="{ active: form.aDesAllergies === false }" @click="form.aDesAllergies = false">
                  <span>✅</span> <span>Non, il mange tout</span>
                </button>
              </div>
            </div>

            <div v-if="form.aDesAllergies" class="form-group">
              <label class="form-label">Précise les allergènes à éviter</label>
              <input v-model="form.allergies" type="text" class="form-input" placeholder="Ex: poulet, céréales, lactose…" />
              <p class="text-sm text-soft mt-1">💡 Nous te recommanderons la Box À la Carte pour plus de contrôle.</p>
            </div>

            <div class="form-group">
              <label class="form-label">Ton e-mail (pour recevoir ta recommandation)</label>
              <input v-model="form.email" type="email" class="form-input" placeholder="toi@email.fr" />
              <p class="text-sm text-soft mt-1">🔒 On ne spam jamais.</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="quiz-nav">
          <button v-if="step > 1" type="button" class="btn btn-ghost" @click="step--">← Retour</button>
          <div v-else />
          <button
            v-if="step < totalSteps"
            type="button"
            class="btn btn-primary"
            :disabled="!canProceed"
            @click="nextStep"
          >
            Suivant →
          </button>
          <button
            v-else
            type="button"
            class="btn btn-primary btn-lg"
            :disabled="loading || !canProceed"
            @click="submitQuiz"
          >
            <span v-if="loading">Analyse en cours…</span>
            <span v-else>🐾 Voir ma recommandation</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ═══ RÉSULTAT ═══════════════════════════════════ -->
    <div class="container quiz-result animate-fade-in-up" v-if="result">
      <div class="result-header text-center">
        <img :src="result.typeBoxRecommande === 'SURPRISE' ? images.picto_truffe_bleu : images.picto_truffe_jaune" alt="" class="result-picto animate-float" />
        <span class="badge" :class="result.typeBoxRecommande === 'SURPRISE' ? 'badge-blue' : 'badge-yellow'">
          Box {{ result.typeBoxRecommande === 'SURPRISE' ? 'Surprise' : 'À la Carte' }}
        </span>
        <h2 class="display-md mt-3 mb-3">Notre recommandation<br/>pour <em class="text-blue">{{ form.nomChien }}</em> 🐾</h2>
        <p class="text-lg text-soft">{{ result.message }}</p>
      </div>

      <div class="result-grid">
        <!-- Taille -->
        <div class="result-box result-size-card">
          <div class="result-size-badge">{{ result.taille }}</div>
          <h3>Taille détectée</h3>
          <p class="text-soft">{{ sizeDescriptions[result.taille] }}</p>
        </div>

        <!-- Contenu -->
        <div class="result-box result-contenu-card">
          <h3>📦 Ce que contiendra ta box</h3>
          <ul class="result-items">
            <li v-for="item in result.contenu" :key="item">
              <span class="result-check">✓</span>
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>

        <!-- Prix -->
        <div class="result-box result-price-card">
          <div class="result-price-tag">
            <span class="result-price-amount">{{ result.formula?.prix?.toFixed(2) ?? '27,90' }}&nbsp;€</span>
            <span class="result-price-period">{{ result.typeBoxRecommande === 'SURPRISE' ? '/mois' : 'par box' }}</span>
          </div>
          <h3>{{ result.formula?.nom }}</h3>
          <NuxtLink to="/offres" class="btn btn-primary w-full mt-4">
            Je commande ma box 🐾
          </NuxtLink>
          <button class="btn btn-ghost w-full mt-2" @click="resetQuiz">
            Refaire le quiz
          </button>
        </div>
      </div>

      <!-- Mascotte célébration -->
      <div class="result-celebration">
        <img :src="images.mascotte_6" alt="" class="celebrate-mascot animate-float" />
        <img :src="images.all_image" alt="Produits Dawky" class="celebrate-products" />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { dawkyImages } from '~/composables/useDawkyImages'
const images = dawkyImages

useSeoMeta({
  title: 'Quiz 🐾 — Trouve ta box | Dawky',
  description: 'Réponds à quelques questions sur ton chien et découvre la box Dawky parfaite pour lui.',
})

const step = ref(1)
const totalSteps = 3
const stepLabels = ['Mon chien', 'Habitudes', 'Santé']
const loading = ref(false)
const result = ref<any>(null)
const errors = reactive({ step1: '' })

const form = reactive({
  nomChien: '',
  race: '',
  age: null as number | null,
  poids: null as number | null,
  niveauActivite: 'MODERE' as 'FAIBLE' | 'MODERE' | 'ELEVE',
  estMacheur: null as boolean | null,
  aDesAllergies: null as boolean | null,
  allergies: '',
  email: '',
})

const selectedWeightRange = ref<string>('')

const weightOptions = [
  { value: 'xs', icon: '🐭', size: 'XS', label: '< 5 kg', poids: 3 },
  { value: 's',  icon: '🐕',  size: 'S',  label: '5–10 kg', poids: 7 },
  { value: 'm',  icon: '🐕‍🦺', size: 'M',  label: '10–25 kg', poids: 15 },
  { value: 'l',  icon: '🦮',  size: 'L',  label: '> 25 kg', poids: 32 },
]

function selectWeight(w: typeof weightOptions[0]) {
  selectedWeightRange.value = w.value
  form.poids = w.poids
}

const tailleEstimee = computed(() => {
  if (!form.poids) return ''
  if (form.poids <= 5) return 'XS'
  if (form.poids <= 10) return 'S'
  if (form.poids <= 25) return 'M'
  return 'L'
})

const activiteOptions = [
  { value: 'FAIBLE', icon: '😴', label: 'Faible', desc: 'Promenades courtes' },
  { value: 'MODERE', icon: '🚶', label: 'Modéré', desc: 'Balades quotidiennes' },
  { value: 'ELEVE',  icon: '🏃', label: 'Élevé',  desc: 'Sport & jeux intenses' },
]

const sizeDescriptions: Record<string, string> = {
  XS: 'Moins de 5 kg — produits ultra-adaptés pour les petits gabarits.',
  S:  'Entre 5 et 10 kg — taille petite, jouets et friandises ajustés.',
  M:  'Entre 10 et 25 kg — la taille la plus populaire !',
  L:  'Plus de 25 kg — produits robustes et genereux.',
}

const canProceed = computed(() => {
  if (step.value === 1) return form.nomChien.trim() && form.age !== null && form.poids !== null
  if (step.value === 2) return form.niveauActivite && form.estMacheur !== null
  if (step.value === 3) return form.aDesAllergies !== null
  return false
})

function nextStep() {
  errors.step1 = ''
  if (step.value === 1 && !form.nomChien) {
    errors.step1 = 'Le prénom de ton chien est requis.'
    return
  }
  step.value++
}

async function submitQuiz() {
  loading.value = true
  try {
    const { profile } = useAuth()
    const data = await $fetch('/api/quiz', {
      method: 'POST',
      body: {
        nomChien: form.nomChien,
        race: form.race || undefined,
        poids: form.poids,
        age: form.age,
        estMacheur: form.estMacheur,
        aDesAllergies: form.aDesAllergies,
        allergies: form.allergies || undefined,
        niveauActivite: form.niveauActivite,
        email: form.email || undefined,
        clientId: profile.value?.id,
      },
    })
    result.value = (data as any).data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function resetQuiz() {
  result.value = null
  step.value = 1
  Object.assign(form, { nomChien: '', race: '', age: null, poids: null, niveauActivite: 'MODERE', estMacheur: null, aDesAllergies: null, allergies: '', email: '' })
  selectedWeightRange.value = ''
}
</script>

<style scoped>
/* Hero */
.quiz-hero {
  background: var(--blue);
  position: relative;
  overflow: hidden;
  padding: var(--space-8) 0 var(--space-7);
}
.quiz-hero-pattern {
  position: absolute; inset: 0; opacity: 0.06; pointer-events: none;
}
.quiz-hero-pattern img { width: 100%; height: 100%; object-fit: cover; }
.quiz-hero-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  position: relative;
}
.quiz-hero-text { flex: 1; }
.quiz-hero-sub { color: rgba(255,255,255,0.7); margin-top: var(--space-3); font-size: 1.0625rem; }
.quiz-hero-mascot { height: 180px; flex-shrink: 0; filter: drop-shadow(0 10px 30px rgba(0,0,0,0.2)); }

/* Progress */
.quiz-progress-wrap {
  background: white;
  border-bottom: 1px solid var(--border);
  padding: var(--space-4) 0;
  position: sticky;
  top: 72px;
  z-index: 100;
}
.quiz-progress-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  position: relative;
  max-width: 480px;
  margin: 0 auto;
}
.quiz-progress-line {
  position: absolute;
  top: 50%;
  left: 0;
  height: 2px;
  background: var(--blue);
  transition: width 0.4s var(--ease-out);
  z-index: 0;
  transform: translateY(-50%);
}
.quiz-progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  position: relative;
  z-index: 1;
}
.quiz-progress-dot {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--cream);
  border: 2px solid rgba(4,172,227,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--ink-muted);
  transition: all 0.3s;
}
.quiz-progress-step.done .quiz-progress-dot {
  background: var(--blue);
  border-color: var(--blue);
  color: white;
}
.quiz-progress-step.active .quiz-progress-dot {
  background: white;
  border-color: var(--blue);
  color: var(--blue);
  box-shadow: 0 0 0 4px rgba(4,172,227,0.15);
}
.quiz-progress-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ink-muted);
}
.quiz-progress-step.active .quiz-progress-label { color: var(--blue); }
.quiz-progress-step.done .quiz-progress-label { color: var(--ink-soft); }

/* Body */
.quiz-body {
  padding: var(--space-7) 0 var(--space-9);
  max-width: 680px;
}
.quiz-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-7);
  box-shadow: var(--shadow-md);
  border: 2px solid var(--border);
}
.quiz-step-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: var(--space-6);
}
.quiz-fields { display: flex; flex-direction: column; gap: var(--space-5); }
.quiz-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

/* Weight selector */
.weight-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
}
.weight-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--space-4) var(--space-3);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--cream);
  cursor: pointer;
  transition: all var(--duration-fast);
  font-family: var(--font-body);
}
.weight-btn:hover { border-color: var(--blue); background: rgba(4,172,227,0.05); }
.weight-btn.active { border-color: var(--blue); background: rgba(4,172,227,0.08); }
.weight-icon { font-size: 1.75rem; }
.weight-size { font-family: var(--font-display); font-size: 1.25rem; font-weight: 900; color: var(--blue); }
.weight-label { font-size: 0.75rem; color: var(--ink-soft); font-weight: 500; }
.quiz-taille-hint { font-size: 0.9rem; margin-top: var(--space-2); color: var(--ink-soft); }

/* Activity options */
.option-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}
.option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--cream);
  cursor: pointer;
  transition: all var(--duration-fast);
  font-family: var(--font-body);
}
.option-card:hover { border-color: var(--blue); }
.option-card.active { border-color: var(--blue); background: rgba(4,172,227,0.08); }
.option-icon { font-size: 2rem; }
.option-label { font-weight: 700; font-size: 0.9375rem; }
.option-desc { font-size: 0.8rem; color: var(--ink-muted); }

/* Bool cards */
.bool-cards { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
.bool-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--cream);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all var(--duration-fast);
}
.bool-card span:first-child { font-size: 1.5rem; }
.bool-card:hover { border-color: var(--blue); }
.bool-card.active { border-color: var(--blue); background: rgba(4,172,227,0.08); color: var(--blue); font-weight: 600; }

/* Nav */
.quiz-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-7);
  padding-top: var(--space-5);
  border-top: 1px solid var(--border);
}

/* ── RÉSULTAT ── */
.quiz-result { padding: var(--space-8) 0 var(--space-9); }

.result-picto { width: 80px; margin: 0 auto var(--space-3); }

.result-grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1.2fr;
  gap: var(--space-5);
  margin-top: var(--space-7);
  align-items: start;
}

.result-box {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  border: 2px solid var(--border);
  box-shadow: var(--shadow-card);
}

.result-size-card { text-align: center; }
.result-size-badge {
  font-family: var(--font-display);
  font-size: 5rem;
  font-weight: 900;
  color: var(--blue);
  line-height: 1;
  margin-bottom: var(--space-3);
}

.result-contenu-card h3 { margin-bottom: var(--space-4); }
.result-items { list-style: none; display: flex; flex-direction: column; gap: var(--space-3); }
.result-items li { display: flex; align-items: flex-start; gap: var(--space-3); }
.result-check { color: var(--blue); font-weight: 700; flex-shrink: 0; margin-top: 2px; }

.result-price-card { text-align: center; background: var(--cream); }
.result-price-tag { display: flex; align-items: baseline; justify-content: center; gap: 4px; margin-bottom: var(--space-3); }
.result-price-amount { font-family: var(--font-display); font-size: 3rem; font-weight: 900; color: var(--blue); }
.result-price-period { font-size: 0.9rem; color: var(--ink-muted); }

.result-celebration {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: var(--space-6);
  margin-top: var(--space-7);
}
.celebrate-mascot { height: 200px; filter: drop-shadow(0 10px 30px rgba(4,172,227,0.2)); }
.celebrate-products { height: 160px; object-fit: contain; }

@media (max-width: 768px) {
  .quiz-body { padding: var(--space-5) 0 var(--space-8); }
  .quiz-card { padding: var(--space-5); border-radius: var(--radius-lg); }
  .quiz-row { grid-template-columns: 1fr; }
  .weight-selector { grid-template-columns: repeat(2, 1fr); }
  .option-cards { grid-template-columns: 1fr; }
  .result-grid { grid-template-columns: 1fr; }
  .quiz-hero-mascot { display: none; }
  .result-celebration { flex-direction: column; align-items: center; }
}
</style>
