<!-- pages/inscription.vue (US-01) — session active dès l'inscription
     (sauf si Supabase exige la confirmation de l'email) -->
<template>
  <div class="auth">
    <LogoDawky :hauteur="44" />
    <h1 class="titre-2">Créer mon <em>compte</em></h1>
    <p>Pour suivre vos box et gérer votre abonnement.</p>

    <div v-if="confirmation" class="info" role="status">
      <p><strong>Plus qu'une étape&nbsp;!</strong> Nous avons envoyé un lien de confirmation à {{ email }}. Cliquez dessus, puis connectez-vous.</p>
    </div>

    <form v-else class="auth-form" novalidate @submit.prevent="inscrire">
      <div class="champs-ligne">
        <div class="champ">
          <label for="i-prenom">Prénom</label>
          <input id="i-prenom" v-model.trim="prenom" class="input" autocomplete="given-name" required />
        </div>
        <div class="champ">
          <label for="i-nom">Nom</label>
          <input id="i-nom" v-model.trim="nom" class="input" autocomplete="family-name" required />
        </div>
      </div>
      <div class="champ">
        <label for="i-email">Email</label>
        <input id="i-email" v-model.trim="email" class="input" type="email" autocomplete="email" required />
      </div>
      <div class="champ">
        <label for="i-mdp">Mot de passe</label>
        <input
          id="i-mdp" v-model="motDePasse" class="input" type="password" autocomplete="new-password"
          minlength="6" required aria-describedby="i-mdp-aide"
        />
        <p id="i-mdp-aide" class="aide-champ">6 caractères minimum.</p>
      </div>

      <label v-if="nomChienQuiz" class="case-simple">
        <input v-model="consentementChien" type="checkbox" />
        Enregistrer la fiche de {{ nomChienQuiz }} (issue du quiz) dans mon espace.
      </label>
      <p v-if="codeParrain" class="info">Code de parrainage <strong>{{ codeParrain }}</strong> appliqué : votre réduction sera visible au paiement.</p>

      <label class="case-simple">
        <input v-model="cgv" type="checkbox" required />
        <span>J'accepte les <NuxtLink to="/cgv" class="lien" target="_blank">conditions générales de vente</NuxtLink>
          et la <NuxtLink to="/confidentialite" class="lien" target="_blank">politique de confidentialité</NuxtLink></span>
      </label>

      <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>
      <button class="btn btn-principal btn-grand btn-bloc" :disabled="envoi">
        {{ envoi ? 'Création…' : 'Créer mon compte' }}
      </button>
    </form>

    <p class="petit">Déjà un compte&nbsp;? <NuxtLink :to="{ path: '/connexion', query: route.query }" class="lien">Se connecter</NuxtLink></p>
  </div>
</template>

<script setup lang="ts">
import { CLE_PARRAIN } from '~/plugins/03.parrainage.client'

definePageMeta({ layout: 'scinde', visuelADroite: true })
useSeoMeta({ title: 'Créer un compte — Dawky' })

const route = useRoute()
const { signUp } = useAuth()
const { resultat, reponses } = useQuiz()
const toast = useToast()

const prenom = ref('')
const nom = ref('')
const email = ref('')
const motDePasse = ref('')
const cgv = ref(false)
const consentementChien = ref(true)
const erreur = ref('')
const envoi = ref(false)
const confirmation = ref(false)

const codeParrain = ref<string | null>(null)
onMounted(() => { codeParrain.value = localStorage.getItem(CLE_PARRAIN) })

const nomChienQuiz = computed(() => (resultat.value ? reponses.value.nomChien.trim() : ''))

async function inscrire() {
  erreur.value = ''
  if (!prenom.value || !nom.value) return (erreur.value = 'Indiquez votre prénom et votre nom.')
  if (!/^\S+@\S+\.\S+$/.test(email.value)) return (erreur.value = 'Saisissez une adresse email valide.')
  if (motDePasse.value.length < 6) return (erreur.value = 'Le mot de passe doit contenir au moins 6 caractères.')
  if (!cgv.value) return (erreur.value = 'Acceptez les conditions générales pour créer votre compte.')

  envoi.value = true
  try {
    const { confirmationRequise } = await signUp(email.value, motDePasse.value, {
      prenom: prenom.value,
      nom: nom.value,
      codeParrainage: codeParrain.value ?? undefined,
      quizResultId: resultat.value?.id,
      consentementChien: !!nomChienQuiz.value && consentementChien.value,
    })
    if (confirmationRequise) {
      confirmation.value = true
      return
    }
    localStorage.removeItem(CLE_PARRAIN)
    toast.success(`Bienvenue chez Dawky, ${prenom.value} !`)
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '/mon-compte'
    await navigateTo(redirect)
  } catch (err) {
    erreur.value = err instanceof ApiError ? err.message : (err as Error).message
  } finally {
    envoi.value = false
  }
}
</script>
