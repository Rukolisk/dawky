<!-- pages/securite-admin.vue — double authentification des administrateurs.
     1re fois : configuration d'une application (QR code) ; ensuite : code
     à 6 chiffres à chaque connexion au back-office. -->
<template>
  <div class="auth">
    <LogoDawky :hauteur="44" />
    <h1 class="titre-2">Double <em>authentification</em></h1>

    <p v-if="chargement" class="texte-secondaire">Un instant…</p>

    <!-- Première configuration -->
    <template v-else-if="configuration">
      <p>
        Le back-office donne accès aux données des clients : il est protégé par un code temporaire, en plus du mot de passe.
        Scannez ce QR code avec une application d'authentification (Google Authenticator, Microsoft Authenticator, Authy…).
      </p>
      <img :src="configuration.qrCode" alt="QR code à scanner avec votre application d'authentification" class="qr" width="200" height="200" />
      <details class="secret">
        <summary class="petit">Impossible de scanner ? Saisir la clé à la main</summary>
        <code>{{ configuration.secret }}</code>
      </details>
    </template>
    <p v-else>Saisissez le code à 6 chiffres affiché dans votre application d'authentification.</p>

    <form v-if="!chargement" class="auth-form" novalidate @submit.prevent="valider">
      <div class="champ">
        <label for="mfa-code">Code à 6 chiffres</label>
        <input
          id="mfa-code" v-model="code" class="input code" inputmode="numeric" autocomplete="one-time-code"
          maxlength="6" pattern="[0-9]{6}" required
        />
      </div>
      <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>
      <button class="btn btn-principal btn-grand btn-bloc" :disabled="envoi || code.length !== 6">
        {{ configuration ? 'Activer la double authentification' : 'Valider' }}
      </button>
    </form>

    <button type="button" class="lien petit" @click="signOut">Se déconnecter</button>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'scinde', visuelADroite: true, visuel: '/images/photos/connexion.jpg' })
useSeoMeta({ title: 'Double authentification — Dawky', robots: 'noindex' })

const route = useRoute()
const { isLoggedIn, isAdmin, signOut, etatMfa, demarrerMfa, validerCodeMfa } = useAuth()
const toast = useToast()

const chargement = ref(true)
const facteurId = ref<string | null>(null)
const configuration = ref<{ qrCode: string; secret: string } | null>(null)
const code = ref('')
const erreur = ref('')
const envoi = ref(false)

const destination = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/admin') ? r : '/admin'
})

onMounted(async () => {
  if (!isLoggedIn.value) return navigateTo({ path: '/connexion', query: { redirect: '/admin' } })
  if (!isAdmin.value) return navigateTo('/mon-compte')
  try {
    const etat = await etatMfa()
    if (etat.niveau === 'aal2') return navigateTo(destination.value)
    if (etat.facteurId) {
      facteurId.value = etat.facteurId
    } else {
      const c = await demarrerMfa()
      facteurId.value = c.facteurId
      configuration.value = { qrCode: c.qrCode, secret: c.secret }
    }
  } catch (err) {
    erreur.value = (err as Error).message
  } finally {
    chargement.value = false
  }
})

async function valider() {
  erreur.value = ''
  if (!facteurId.value) return
  envoi.value = true
  try {
    await validerCodeMfa(facteurId.value, code.value.trim())
    if (configuration.value) toast.success('Double authentification activée')
    await navigateTo(destination.value)
  } catch (err) {
    erreur.value = (err as Error).message
    code.value = ''
  } finally {
    envoi.value = false
  }
}
</script>

<style scoped>
.qr {
  width: 200px;
  height: 200px;
  border: 1px solid var(--filet);
  padding: 8px;
  background: var(--blanc);
}
.secret code {
  display: block;
  margin-top: 8px;
  font-size: 15px;
  letter-spacing: 0.1em;
  word-break: break-all;
  background: var(--fond-gris);
  padding: 8px 12px;
}
.code {
  font-size: 24px;
  letter-spacing: 0.3em;
  text-align: center;
  max-width: 220px;
}
</style>
