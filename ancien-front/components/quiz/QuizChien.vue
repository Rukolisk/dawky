<!-- components/quiz/QuizChien.vue -->
<template>
  <div class="quiz">

    <!-- ─── RÉSULTAT ─── -->
    <Transition name="quiz-fade" mode="out-in">
      <div v-if="result" key="result" class="quiz-result">
        <div class="quiz-result__confetti">🎉</div>
        <h3>Parfait pour <em>{{ form.nomChien }}</em> !</h3>

        <div :class="['quiz-result__card', result.typeBoxRecommande === 'SURPRISE' ? 'card-surprise' : 'card-carte']">
          <div class="quiz-result__type">
            {{ result.typeBoxRecommande === 'SURPRISE' ? '🎁 Box Surprise' : '🛒 Box À la Carte' }}
          </div>
          <div class="quiz-result__taille-badge">
            Taille <strong>{{ result.taille }}</strong>
          </div>
          <div v-if="result.formula" class="quiz-result__prix">
            {{ result.formula.prix.toFixed(2).replace('.', ',') }}€<span>/mois</span>
          </div>
          <p class="quiz-result__msg">{{ result.message }}</p>

          <!-- Contenu détaillé par taille -->
          <div class="quiz-result__contenu">
            <p class="quiz-result__contenu-title">Ce que contiendra votre box :</p>
            <ul>
              <li v-for="item in result.contenu" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>

        <div class="quiz-result__actions">
          <a href="#commander" class="btn btn-primary btn-lg" @click="$emit('done')">
            Je m'abonne maintenant →
          </a>
          <button class="btn btn-outline" @click="reset">Refaire le quiz</button>
        </div>
      </div>

      <!-- ─── QUIZ STEPS ─── -->
      <div v-else key="quiz">
        <!-- Progress -->
        <div class="quiz-progress">
          <div
            v-for="i in totalSteps"
            :key="i"
            :class="['quiz-progress__dot', { active: i === step, done: i < step }]"
          />
        </div>

        <!-- ─── STEP 1 : Infos chien ─── -->
        <Transition name="step-slide" mode="out-in">
          <div v-if="step === 1" key="s1" class="quiz-step">
            <div class="quiz-step__num">1 / {{ totalSteps }}</div>
            <div class="quiz-step__icon">🐕</div>
            <h3>Votre chien</h3>

            <div class="form-group">
              <label class="form-label">Prénom de votre chien *</label>
              <input v-model="form.nomChien" type="text" class="form-input quiz-input-big" placeholder="Rex, Luna, Bella…" />
            </div>

            <div class="form-group">
              <label class="form-label">Race</label>
              <RaceAutocomplete v-model="form.race" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Poids (kg) *</label>
                <input v-model.number="form.poids" type="number" step="0.5" min="0.5" max="100" class="form-input" placeholder="12" />
              </div>
              <div class="form-group">
                <label class="form-label">Âge *</label>
                <select v-model="form.age" class="form-select">
                  <option value="">— Sélectionner —</option>
                  <option value="0.5">Chiot (- de 6 mois)</option>
                  <option value="1">6 mois – 1 an</option>
                  <option value="2">1 – 3 ans</option>
                  <option value="5">3 – 7 ans</option>
                  <option value="9">7 – 10 ans</option>
                  <option value="12">+ de 10 ans</option>
                </select>
              </div>
            </div>

            <!-- Taille auto-calculée — visible et mise en avant -->
            <div v-if="form.poids > 0" class="taille-preview">
              <div class="taille-preview__letter">{{ tailleCalculee }}</div>
              <div>
                <strong>Taille {{ tailleCalculee }}</strong>
                <span>{{ tailleLabels[tailleCalculee] }}</span>
              </div>
              <div class="taille-preview__check">✓ Calculée automatiquement</div>
            </div>
          </div>

          <!-- ─── STEP 2 : Comportement ─── -->
          <div v-else-if="step === 2" key="s2" class="quiz-step">
            <div class="quiz-step__num">2 / {{ totalSteps }}</div>
            <div class="quiz-step__icon">🎾</div>
            <h3>{{ form.nomChien || 'Votre chien' }}, c'est plutôt…</h3>

            <p class="quiz-step__sub">Niveau d'activité</p>
            <div class="quiz-options-3">
              <button
                v-for="a in activites" :key="a.value"
                :class="['quiz-option', { active: form.niveauActivite === a.value }]"
                type="button"
                @click="form.niveauActivite = a.value"
              >
                <span class="quiz-option__icon">{{ a.icon }}</span>
                <span class="quiz-option__label">{{ a.label }}</span>
                <span class="quiz-option__sub">{{ a.sub }}</span>
              </button>
            </div>

            <p class="quiz-step__sub" style="margin-top:1.5rem">Comportement</p>
            <div class="quiz-checks">
              <label :class="['quiz-check', { active: form.estMacheur }]">
                <input v-model="form.estMacheur" type="checkbox" />
                <span class="quiz-check__icon">🦷</span>
                <div>
                  <strong>Grand mâcheur</strong>
                  <p>Détruit ses jouets rapidement, aime mâcher longuement</p>
                </div>
              </label>
            </div>
          </div>

          <!-- ─── STEP 3 : Santé ─── -->
          <div v-else-if="step === 3" key="s3" class="quiz-step">
            <div class="quiz-step__num">3 / {{ totalSteps }}</div>
            <div class="quiz-step__icon">🏥</div>
            <h3>Santé & préférences</h3>

            <div class="quiz-checks">
              <label :class="['quiz-check', { active: form.aDesAllergies }]">
                <input v-model="form.aDesAllergies" type="checkbox" />
                <span class="quiz-check__icon">⚠️</span>
                <div>
                  <strong>Allergies alimentaires</strong>
                  <p>{{ form.nomChien || 'Mon chien' }} est sensible à certains ingrédients</p>
                </div>
              </label>
            </div>

            <Transition name="quiz-fade">
              <div v-if="form.aDesAllergies" class="form-group allergy-input">
                <label class="form-label">Précisez les allergies</label>
                <input v-model="form.allergies" type="text" class="form-input" placeholder="Poulet, gluten, poisson…" />
              </div>
            </Transition>

            <div class="form-group" style="margin-top:1.5rem">
              <label class="form-label">Votre email pour recevoir votre recommandation</label>
              <input v-model="form.email" type="email" class="form-input" placeholder="vous@exemple.fr" />
            </div>
          </div>
        </Transition>

        <!-- Navigation -->
        <div class="quiz-nav">
          <button v-if="step > 1" type="button" class="btn btn-outline quiz-nav__back" @click="step--">
            ← Retour
          </button>
          <div v-else />
          <button
            v-if="step < totalSteps"
            type="button"
            class="btn btn-primary"
            :disabled="!canNext"
            @click="step++"
          >
            Suivant →
          </button>
          <button
            v-else
            type="button"
            class="btn btn-primary"
            :disabled="!canNext || loading"
            @click="submitQuiz"
          >
            <span v-if="loading">Analyse…</span>
            <span v-else>Voir ma recommandation 🐾</span>
          </button>
        </div>

        <div v-if="error" class="alert alert-error" style="margin-top:1rem">{{ error }}</div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ done: [] }>()

const totalSteps = 3
const step    = ref(1)
const loading = ref(false)
const error   = ref('')

const form = reactive({
  nomChien: '', race: '', poids: 0, age: '' as string | number,
  niveauActivite: 'MODERE' as 'FAIBLE' | 'MODERE' | 'ELEVE',
  estMacheur: false, aDesAllergies: false, allergies: '', email: '',
})

const result = ref<{
  taille: 'XS' | 'S' | 'M' | 'L'; typeBoxRecommande: 'SURPRISE' | 'CARTE'
  message: string; contenu: string[]
  formula: { id: string; nom: string; prix: number } | null
} | null>(null)

const tailleLabels: Record<string, string> = {
  S: '— jusqu\'à 10 kg', M: '— 10 à 25 kg', L: '— plus de 25 kg',
}

const tailleCalculee = computed<'XS' | 'S' | 'M' | 'L'>(() => {
  if (!form.poids) return 'S'
  return form.poids <= 5 ? 'XS' : form.poids <= 10 ? 'S' : form.poids <= 25 ? 'M' : 'L'
})

const activites = [
  { value: 'FAIBLE', icon: '🛋️', label: 'Calme',     sub: 'Préfère les câlins' },
  { value: 'MODERE', icon: '🚶', label: 'Équilibré', sub: 'Balade quotidienne' },
  { value: 'ELEVE',  icon: '🏃', label: 'Très actif', sub: 'Court, saute, joue' },
]

const canNext = computed(() => {
  if (step.value === 1) return !!form.nomChien && form.poids > 0 && !!form.age
  return true
})

async function submitQuiz() {
  loading.value = true; error.value = ''
  try {
    const res = await $fetch<{ data: typeof result.value }>('/api/quiz', {
      method: 'POST',
      body: { ...form, age: Number(form.age) },
    })
    result.value = res.data
  } catch (e: any) {
    error.value = e?.data?.statusMessage ?? 'Erreur lors de l\'analyse'
  } finally { loading.value = false }
}

function reset() {
  result.value = null; step.value = 1
  Object.assign(form, { nomChien: '', race: '', poids: 0, age: '', niveauActivite: 'MODERE', estMacheur: false, aDesAllergies: false, allergies: '', email: '' })
}
</script>

<style scoped>
.quiz { max-width: 540px; margin: 0 auto; }

/* Progress dots */
.quiz-progress { display: flex; justify-content: center; gap: .5rem; margin-bottom: 2rem; }
.quiz-progress__dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--brume); transition: all .3s;
}
.quiz-progress__dot.active { background: var(--bleu-vif); transform: scale(1.3); }
.quiz-progress__dot.done   { background: var(--menthe); }

/* Step */
.quiz-step__num  { font-size: .75rem; color: var(--muted); text-align: center; margin-bottom: .5rem; letter-spacing: .1em; text-transform: uppercase; }
.quiz-step__icon { font-size: 2.8rem; text-align: center; margin-bottom: .8rem; }
.quiz-step h3    { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; text-align: center; margin-bottom: 1.8rem; }
.quiz-step__sub  { font-size: .78rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .1em; margin-bottom: .8rem; }
.quiz-input-big  { font-size: 1.1rem; font-weight: 500; }
.form-row        { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.allergy-input   { margin-top: .8rem; }

/* Taille preview */
.taille-preview {
  display: flex; align-items: center; gap: 1rem;
  background: linear-gradient(135deg, #FFF4E6, #FFE4C4);
  border: 2px solid var(--bleu-vif); border-radius: 16px;
  padding: 1rem 1.4rem; margin-top: 1rem;
}
.taille-preview__letter {
  font-family: var(--font-display);
  font-size: 2.8rem; font-weight: 900; color: var(--bleu-vif); line-height: 1;
}
.taille-preview strong { display: block; font-size: 1rem; color: var(--nuit); }
.taille-preview span   { font-size: .82rem; color: var(--muted); }
.taille-preview__check {
  margin-left: auto; font-size: .75rem; font-weight: 600;
  color: var(--menthe); background: rgba(122,140,110,.15);
  padding: .25rem .7rem; border-radius: 40px; white-space: nowrap;
}

/* Options */
.quiz-options-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: .8rem; }
.quiz-option {
  display: flex; flex-direction: column; align-items: center; gap: .3rem;
  padding: 1.1rem .8rem; border-radius: 18px;
  border: 2px solid var(--brume); background: white; cursor: pointer;
  transition: all .2s; font-family: var(--font-body);
}
.quiz-option.active { border-color: var(--bleu-vif); background: #FFF4E6; transform: translateY(-2px); box-shadow: 0 4px 16px rgba(212,136,59,.2); }
.quiz-option__icon  { font-size: 2rem; }
.quiz-option__label { font-weight: 700; font-size: .9rem; color: var(--nuit); }
.quiz-option__sub   { font-size: .72rem; color: var(--muted); text-align: center; }

/* Checks */
.quiz-checks { display: flex; flex-direction: column; gap: .8rem; }
.quiz-check {
  display: flex; align-items: flex-start; gap: .9rem;
  padding: 1.1rem 1.3rem; border-radius: 16px;
  border: 2px solid var(--brume); background: white; cursor: pointer;
  transition: all .2s;
}
.quiz-check.active { border-color: var(--bleu-vif); background: #FFF4E6; }
.quiz-check input  { display: none; }
.quiz-check__icon  { font-size: 1.5rem; flex-shrink: 0; }
.quiz-check strong { display: block; font-weight: 600; font-size: .92rem; color: var(--nuit); margin-bottom: .2rem; }
.quiz-check p      { font-size: .78rem; color: var(--muted); line-height: 1.4; }

/* Navigation */
.quiz-nav { display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; gap: 1rem; }

/* Résultat */
.quiz-result { text-align: center; }
.quiz-result__confetti { font-size: 3rem; margin-bottom: .8rem; }
.quiz-result h3 { font-family: var(--font-display); font-size: 1.6rem; font-weight: 900; margin-bottom: 1.5rem; }
.quiz-result h3 em { color: var(--bleu-vif); font-style: normal; }

.quiz-result__card {
  border-radius: 24px; padding: 1.8rem; margin-bottom: 1.5rem;
  border: 2px solid transparent; text-align: left;
}
.card-surprise { background: linear-gradient(135deg,#FFF4E6,#FFE4C4); border-color: var(--bleu-vif); }
.card-carte    { background: linear-gradient(135deg,#EDF2E8,#D4E2C8); border-color: var(--menthe); }

.quiz-result__type { font-size: 1.1rem; font-weight: 700; color: var(--nuit); margin-bottom: .5rem; }
.quiz-result__taille-badge {
  display: inline-flex; align-items: center; gap: .4rem;
  background: var(--nuit); color: var(--neige);
  padding: .25rem .9rem; border-radius: 40px; font-size: .8rem; font-weight: 600;
  margin-bottom: .8rem;
}
.quiz-result__taille-badge strong { font-size: 1rem; }
.quiz-result__prix {
  font-family: var(--font-display); font-size: 2rem; font-weight: 900;
  color: var(--nuit); margin-bottom: .5rem;
}
.quiz-result__prix span { font-size: .9rem; color: var(--muted); font-family: var(--font-body); font-weight: 400; margin-left: .2rem; }
.quiz-result__msg { font-size: .9rem; color: var(--muted); line-height: 1.6; margin-bottom: 1rem; }

.quiz-result__contenu { background: rgba(255,255,255,.6); border-radius: 12px; padding: 1rem; }
.quiz-result__contenu-title { font-size: .78rem; font-weight: 600; color: var(--nuit); text-transform: uppercase; letter-spacing: .08em; margin-bottom: .6rem; }
.quiz-result__contenu ul { list-style: none; display: flex; flex-direction: column; gap: .35rem; }
.quiz-result__contenu li { font-size: .85rem; color: var(--text); display: flex; align-items: center; gap: .5rem; }
.quiz-result__contenu li::before { content: '✦'; color: var(--bleu-vif); font-size: .55rem; flex-shrink: 0; }

.quiz-result__actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 1.5rem; }

/* Transitions */
.quiz-fade-enter-active, .quiz-fade-leave-active { transition: opacity .3s; }
.quiz-fade-enter-from, .quiz-fade-leave-to { opacity: 0; }
.step-slide-enter-active, .step-slide-leave-active { transition: opacity .25s, transform .25s; }
.step-slide-enter-from { opacity: 0; transform: translateX(30px); }
.step-slide-leave-to   { opacity: 0; transform: translateX(-30px); }
</style>
