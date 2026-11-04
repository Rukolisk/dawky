<!-- pages/quiz/index.vue — Quiz « Trouve la box de ton chien » (US-05, F-13 à F-15)
     Une question par écran, retour arrière, progression visible. -->
<template>
  <div class="quiz">
    <header class="quiz-entete">
      <LogoDawky :hauteur="40" />
      <p class="quiz-etape" aria-live="polite">Étape {{ ecranCourant.etape }} sur 3 : {{ ecranCourant.libelle }}</p>
    </header>
    <div
      class="progression" role="progressbar" aria-label="Progression du quiz"
      :aria-valuenow="ecran + 1" aria-valuemin="1" :aria-valuemax="ECRANS.length"
    >
      <span :style="{ width: `${((ecran + 1) / ECRANS.length) * 100}%` }" />
    </div>

    <form class="quiz-form" novalidate @submit.prevent="suivant">
      <!-- 1a. Profil -->
      <template v-if="ecran === 0">
        <h1 ref="titre" tabindex="-1" class="titre-quiz">Comment s'appelle votre chien&nbsp;?</h1>
        <div class="champ">
          <label for="q-nom">Son prénom</label>
          <input id="q-nom" v-model="r.nomChien" class="input input-grand" autocomplete="off" maxlength="50" required />
        </div>
        <div class="champs-ligne">
          <div class="champ">
            <label for="q-race">Sa race</label>
            <RaceAutocomplete id="q-race" v-model="r.race" />
          </div>
          <div class="champ">
            <label for="q-age">Son âge, en années</label>
            <input
              id="q-age" v-model.number="r.ageAns" class="input input-grand" type="number"
              inputmode="decimal" min="0" max="25" step="0.5"
            />
          </div>
        </div>
      </template>

      <!-- 1b. Poids -->
      <template v-else-if="ecran === 1">
        <h1 ref="titre" tabindex="-1" class="titre-quiz">Combien pèse {{ nom }}&nbsp;?</h1>
        <p>Cette réponse fixe la taille de sa box. Un poids approximatif suffit.</p>
        <fieldset class="options">
          <legend class="sr-only">Poids de {{ nom }}</legend>
          <ChoixOption
            v-for="t in INFOS_TAILLES" :key="t.taille"
            v-model="r.tranchePoids" :valeur="t.taille" nom="poids"
            @update:model-value="r.poidsExact = null"
          >{{ t.poids }}</ChoixOption>
        </fieldset>
        <div class="champ champ-court">
          <label for="q-poids">Vous connaissez son poids exact&nbsp;? (facultatif)</label>
          <div class="input-unite">
            <input
              id="q-poids" v-model.number="r.poidsExact" class="input input-grand" type="number"
              inputmode="decimal" min="0.5" max="120" step="0.1" @input="trancheDepuisPoids"
            />
            <span aria-hidden="true">kg</span>
          </div>
        </div>
      </template>

      <!-- 2. Habitudes -->
      <template v-else-if="ecran === 2">
        <h1 ref="titre" tabindex="-1" class="titre-quiz">{{ nom }}, c'est plutôt quel genre&nbsp;?</h1>
        <fieldset class="options">
          <legend class="libelle-groupe">Son niveau d'activité</legend>
          <ChoixOption
            v-for="(libelle, niveau) in LIBELLES_ACTIVITE" :key="niveau"
            v-model="r.niveauActivite" :valeur="niveau" nom="activite"
          >{{ libelle }}</ChoixOption>
        </fieldset>
        <fieldset class="options options-ligne">
          <legend class="libelle-groupe">Est-ce un gros mâcheur&nbsp;?</legend>
          <ChoixOption v-model="r.estMacheur" :valeur="true" nom="macheur">Oui</ChoixOption>
          <ChoixOption v-model="r.estMacheur" :valeur="false" nom="macheur">Non</ChoixOption>
        </fieldset>
      </template>

      <!-- 3. Santé -->
      <template v-else>
        <h1 ref="titre" tabindex="-1" class="titre-quiz">{{ nom }} a-t-il une allergie&nbsp;?</h1>
        <p>Cochez tout ce qui s'applique. Vous pourrez le modifier à tout moment.</p>
        <fieldset class="options options-grille">
          <legend class="sr-only">Allergies de {{ nom }}</legend>
          <ChoixOption
            v-for="a in allergenes" :key="a.code"
            v-model="r.allergenes" :valeur="a.code" nom="allergenes" multiple
          >{{ a.nom }}</ChoixOption>
        </fieldset>
        <div class="champ">
          <label for="q-autre">Autre allergène</label>
          <input id="q-autre" v-model="r.allergiesAutres" class="input" placeholder="Saisissez-le ici" maxlength="300" />
        </div>
        <label v-if="aDesAllergies" class="case-simple">
          <input v-model="r.sensibleTraces" type="checkbox" />
          Sensible aux traces
        </label>
        <div class="champ">
          <label for="q-email">Votre email, pour recevoir la recommandation (facultatif)</label>
          <input id="q-email" v-model.trim="r.email" class="input" type="email" autocomplete="email" />
        </div>
        <label v-if="isLoggedIn" class="case-simple">
          <input v-model="enregistrerChien" type="checkbox" />
          Enregistrer la fiche de {{ nom }} dans mon espace (vous pourrez la modifier ou la supprimer)
        </label>
      </template>

      <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>

      <div class="quiz-actions">
        <button type="button" class="lien" @click="precedent">Retour</button>
        <button class="btn btn-principal btn-grand" :disabled="!ecranValide || envoi">
          {{ ecran === ECRANS.length - 1 ? (envoi ? 'Un instant…' : 'Voir sa box') : 'Continuer' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { Allergene } from '~/composables/types'

definePageMeta({ layout: 'scinde', visuel: '/images/photos/quiz.jpg' })
useSeoMeta({ title: 'Trouver sa box — Dawky' })

const ECRANS = [
  { etape: 1, libelle: 'son profil' },
  { etape: 1, libelle: 'son profil' },
  { etape: 2, libelle: 'ses habitudes' },
  { etape: 3, libelle: 'sa santé' },
]

const { isLoggedIn } = useAuth()
const { reponses: r, envoyer } = useQuiz()
const route = useRoute()
const router = useRouter()

// L'écran courant est dans l'URL (?e=2) : le bouton retour du navigateur
// fonctionne comme le bouton « Retour » du quiz.
const ecran = computed(() => Math.min(Math.max(Number(route.query.e) || 0, 0), ECRANS.length - 1))
const ecranCourant = computed(() => ECRANS[ecran.value]!)
const titre = ref<HTMLElement | null>(null)
const erreur = ref('')
const envoi = ref(false)
const enregistrerChien = ref(true)

// Les allergènes les plus fréquents d'abord, puis les autres
const FREQUENTS = ['poulet', 'boeuf', 'ble', 'poisson']
const rang = (code: string) => (FREQUENTS.indexOf(code) + 1 || 99)
const { data: allergenes } = useFetch('/api/allergenes', {
  transform: (res: { data: Allergene[] }) => [...res.data].sort((a, b) => rang(a.code) - rang(b.code)),
  default: () => [] as Allergene[],
})

const nom = computed(() => r.value.nomChien.trim() || 'votre chien')
const aDesAllergies = computed(() => r.value.allergenes.length > 0 || !!r.value.allergiesAutres.trim())

const ecranValide = computed(() => {
  switch (ecran.value) {
    case 0: return r.value.nomChien.trim().length > 0
    case 1: return !!r.value.tranchePoids || (r.value.poidsExact ?? 0) > 0
    case 2: return !!r.value.niveauActivite && r.value.estMacheur !== null
    default: return !r.value.email.trim() || /^\S+@\S+\.\S+$/.test(r.value.email.trim())
  }
})

// Avec un poids exact, la tranche correspondante est cochée
function trancheDepuisPoids() {
  const p = r.value.poidsExact
  if (p && p > 0) r.value.tranchePoids = p <= 10 ? 'S' : p <= 25 ? 'M' : 'L'
}

// Pas d'accès direct à un écran dont les précédents sont vides
onMounted(() => {
  if (ecran.value > 0 && !r.value.nomChien.trim()) router.replace({ query: {} })
})

watch(ecran, async () => {
  erreur.value = ''
  await nextTick()
  titre.value?.focus()
})

async function suivant() {
  if (!ecranValide.value) return
  if (ecran.value < ECRANS.length - 1) {
    await router.push({ query: { e: ecran.value + 1 } })
    return
  }
  envoi.value = true
  erreur.value = ''
  try {
    await envoyer(isLoggedIn.value && enregistrerChien.value)
    await navigateTo('/quiz/resultat')
  } catch (err) {
    erreur.value = versApiError(err).message
  } finally {
    envoi.value = false
  }
}

function precedent() {
  if (ecran.value === 0) return navigateTo('/')
  router.back()
}
</script>

<style scoped>
.quiz {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.quiz-entete {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--e2);
}
.quiz-etape {
  font-size: 16px;
  font-weight: 500;
  text-align: right;
}
.progression {
  height: 3px;
  background: var(--filet);
  margin: var(--e3) 0 var(--e4);
}
.progression span {
  display: block;
  height: 100%;
  background: var(--burgundy);
  transition: width 0.3s ease;
}
.quiz-form {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
  flex: 1;
}
.titre-quiz {
  font-size: clamp(40px, 4.4vw, 64px);
  outline: none;
  margin-bottom: var(--e1);
}
.input-grand {
  min-height: var(--tactile-grand);
}
.champs-ligne {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--e2);
}
.champ-court {
  max-width: 260px;
}
.input-unite {
  display: flex;
  align-items: center;
  gap: var(--e1);
}
.options {
  border: 0;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.options-ligne {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.options-ligne legend {
  grid-column: 1 / -1;
}
.options-grille {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
.libelle-groupe {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
  padding: 0;
}
.case-simple {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  min-height: var(--tactile);
}
.case-simple input {
  width: 20px;
  height: 20px;
  margin-top: 3px;
  accent-color: var(--burgundy);
  flex-shrink: 0;
}
.quiz-actions {
  margin-top: auto;
  padding-top: var(--e4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--e2);
}

@media (max-width: 900px) {
  .champs-ligne,
  .options-grille {
    grid-template-columns: 1fr 1fr;
  }
  .champs-ligne > :first-child {
    grid-column: 1 / -1;
  }
  .quiz-actions {
    position: sticky;
    bottom: 0;
    background: var(--blanc);
    padding-block: var(--e2);
  }
}
</style>
