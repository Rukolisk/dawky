<!-- pages/mon-compte/compte.vue — infos personnelles, adresses (US-03, US-04),
     mot de passe, droits RGPD (export, suppression) -->
<template>
  <div class="page">
    <h1 class="titre-2">Mon compte</h1>

    <!-- Informations -->
    <section class="bloc-compte">
      <h2 class="titre-section">Mes informations</h2>
      <form class="formulaire" novalidate @submit.prevent="enregistrerInfos">
        <div class="ligne">
          <div class="champ">
            <label for="p-prenom">Prénom</label>
            <input id="p-prenom" v-model.trim="infos.prenom" class="input" autocomplete="given-name" />
          </div>
          <div class="champ">
            <label for="p-nom">Nom</label>
            <input id="p-nom" v-model.trim="infos.nom" class="input" autocomplete="family-name" />
          </div>
        </div>
        <div class="ligne">
          <div class="champ">
            <label for="p-email">Email</label>
            <input id="p-email" :value="profile?.email" class="input" disabled />
          </div>
          <div class="champ">
            <label for="p-tel">Téléphone</label>
            <input id="p-tel" v-model.trim="infos.telephone" class="input" type="tel" autocomplete="tel" />
          </div>
        </div>
        <button class="btn btn-secondaire" :disabled="envoi">Enregistrer</button>
      </form>
    </section>

    <!-- Adresses -->
    <section id="adresses" class="bloc-compte">
      <h2 class="titre-section">Mes adresses</h2>
      <p v-if="!profile?.adresseComplete" class="info">Adresse incomplète : ajoutez une adresse pour recevoir vos box.</p>
      <ul class="adresses">
        <li v-for="a in profile?.adresses ?? []" :key="a.id" class="adresse">
          <div>
            <p><strong>{{ a.prenom }} {{ a.nom }}</strong> <span v-if="a.parDefaut" class="etiquette">Par défaut</span></p>
            <p class="petit">{{ adresseSurUneLigne(a) }}</p>
          </div>
          <div class="adresse-actions">
            <button type="button" class="lien petit" @click="editer(a)">Modifier</button>
            <button v-if="!a.parDefaut" type="button" class="lien petit" @click="parDefaut(a.id)">Par défaut</button>
            <button type="button" class="lien petit" @click="supprimerAdresse(a.id)">Supprimer</button>
          </div>
        </li>
      </ul>
      <button v-if="!edition" type="button" class="btn btn-secondaire" @click="editer(null)">Ajouter une adresse</button>
      <form v-else class="formulaire edition" novalidate @submit.prevent="enregistrerAdresse">
        <FormulaireAdresse v-model="adresseEditee" prefixe="compte" />
        <div class="actions">
          <button class="btn btn-principal" :disabled="envoi">Enregistrer l'adresse</button>
          <button type="button" class="lien" @click="edition = null">Annuler</button>
        </div>
      </form>
    </section>

    <!-- Mot de passe -->
    <section class="bloc-compte">
      <h2 class="titre-section">Mot de passe</h2>
      <form class="formulaire ligne-mdp" novalidate @submit.prevent="changerMdp">
        <div class="champ">
          <label for="p-mdp">Nouveau mot de passe</label>
          <input id="p-mdp" v-model="motDePasse" class="input" type="password" autocomplete="new-password" minlength="6" />
        </div>
        <button class="btn btn-secondaire" :disabled="envoi || motDePasse.length < 6">Changer</button>
      </form>
    </section>

    <!-- RGPD -->
    <section class="bloc-compte">
      <h2 class="titre-section">Mes données</h2>
      <p class="petit">Téléchargez toutes les données que Dawky conserve sur vous, ou supprimez votre compte.</p>
      <div class="actions">
        <button type="button" class="btn btn-secondaire" :disabled="envoi" @click="exporter">Télécharger mes données</button>
        <button type="button" class="lien" @click="suppression = true">Supprimer mon compte</button>
      </div>
    </section>

    <ModaleDawky :ouverte="suppression" titre="Supprimer mon compte" @fermer="suppression = false">
      <p>
        Vos abonnements sont arrêtés immédiatement, sans nouveau prélèvement. Vos données personnelles, celles de vos chiens
        et vos adresses sont effacées. Les factures sont conservées anonymement (obligation légale).
      </p>
      <div class="champ">
        <label for="confirmation">Pour confirmer, saisissez SUPPRIMER</label>
        <input id="confirmation" v-model="confirmation" class="input" autocomplete="off" />
      </div>
      <p v-if="erreurSuppression" class="message-erreur" role="alert">{{ erreurSuppression }}</p>
      <button
        type="button" class="btn btn-principal btn-bloc"
        :disabled="envoi || confirmation.trim().toUpperCase() !== 'SUPPRIMER'" @click="supprimerCompte"
      >Supprimer définitivement</button>
    </ModaleDawky>
  </div>
</template>

<script setup lang="ts">
import type { Adresse } from '~/composables/types'

definePageMeta({ layout: 'compte', middleware: 'auth' })
useSeoMeta({ title: 'Mon compte — Dawky', robots: 'noindex' })

const { profile, fetchProfile, changerMotDePasse, signOut } = useAuth()
const toast = useToast()
const envoi = ref(false)

const infos = reactive({ prenom: '', nom: '', telephone: '' })
watch(profile, (p) => {
  if (!p) return
  Object.assign(infos, { prenom: p.prenom, nom: p.nom, telephone: p.telephone ?? '' })
}, { immediate: true })

async function avecEnvoi(fn: () => Promise<unknown>, succes?: string) {
  envoi.value = true
  try {
    await fn()
    if (succes) toast.success(succes)
    return true
  } catch (err) {
    toast.error(err instanceof Error && !(err as { statusCode?: number }).statusCode ? err.message : versApiError(err).message)
    return false
  } finally {
    envoi.value = false
  }
}

const enregistrerInfos = () => avecEnvoi(async () => {
  await api('/api/auth/profile', { method: 'PUT', body: { ...infos, telephone: infos.telephone || null } })
  await fetchProfile()
}, 'Informations enregistrées')

// ─── Adresses ───
const edition = ref<'nouvelle' | string | null>(null)
const adresseEditee = ref(adresseVide())

function editer(a: Adresse | null) {
  edition.value = a?.id ?? 'nouvelle'
  adresseEditee.value = a
    ? { prenom: a.prenom, nom: a.nom, ligne1: a.ligne1, ligne2: a.ligne2 ?? '', codePostal: a.codePostal, ville: a.ville, telephone: a.telephone ?? '' }
    : { ...adresseVide(), prenom: profile.value?.prenom ?? '', nom: profile.value?.nom ?? '' }
}

async function enregistrerAdresse() {
  if (!adresseComplete(adresseEditee.value)) {
    toast.error('Complétez le nom, l\'adresse, le code postal et la ville.')
    return
  }
  const ok = await avecEnvoi(async () => {
    const corps = versApiAdresse(adresseEditee.value)
    if (edition.value === 'nouvelle') await api('/api/adresses', { method: 'POST', body: corps })
    else await api(`/api/adresses/${edition.value}`, { method: 'PUT', body: corps })
    await fetchProfile()
  }, 'Adresse enregistrée')
  if (ok) edition.value = null
}

const parDefaut = (id: string) => avecEnvoi(async () => {
  await api(`/api/adresses/${id}`, { method: 'PUT', body: { parDefaut: true } })
  await fetchProfile()
}, 'Adresse par défaut modifiée')

const supprimerAdresse = (id: string) => avecEnvoi(async () => {
  await api(`/api/adresses/${id}`, { method: 'DELETE' })
  await fetchProfile()
}, 'Adresse supprimée')

// ─── Mot de passe ───
const motDePasse = ref('')
const changerMdp = () => avecEnvoi(async () => {
  await changerMotDePasse(motDePasse.value)
  motDePasse.value = ''
}, 'Mot de passe modifié')

// ─── RGPD ───
const exporter = () => avecEnvoi(async () => {
  const donnees = await $fetch('/api/auth/export')
  const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' })
  const lien = document.createElement('a')
  lien.href = URL.createObjectURL(blob)
  lien.download = 'dawky-mes-donnees.json'
  lien.click()
  URL.revokeObjectURL(lien.href)
})

const suppression = ref(false)
const confirmation = ref('')
const erreurSuppression = ref('')
async function supprimerCompte() {
  envoi.value = true
  erreurSuppression.value = ''
  try {
    await api('/api/auth/profile', { method: 'DELETE' })
    toast.success('Votre compte a été supprimé.')
    await signOut()
  } catch (err) {
    erreurSuppression.value = versApiError(err).message
  } finally {
    envoi.value = false
  }
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--e5);
  max-width: 760px;
}
.bloc-compte {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--e2);
}
.titre-section {
  font-family: var(--font-texte);
  font-size: 20px;
  font-weight: 700;
}
.formulaire {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--e2);
  width: 100%;
}
.ligne {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--e2);
  width: 100%;
}
.ligne-mdp {
  flex-direction: row;
  align-items: flex-end;
}
.ligne-mdp .champ {
  flex: 1;
  max-width: 360px;
}
.adresses {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  border-top: 1px solid var(--filet);
}
.adresse {
  display: flex;
  justify-content: space-between;
  gap: var(--e2);
  padding-block: 14px;
  border-bottom: 1px solid var(--filet);
}
.adresse-actions {
  display: flex;
  gap: var(--e2);
  flex-shrink: 0;
}
.edition {
  border: 1px solid var(--noir);
  padding: var(--e3);
}
.edition > :first-child {
  width: 100%;
}
.actions {
  display: flex;
  align-items: center;
  gap: var(--e3);
  flex-wrap: wrap;
}
.info {
  background: var(--fond-gris);
  border-left: 3px solid var(--burgundy);
  padding: 12px 16px;
  font-size: 15px;
  width: 100%;
}

@media (max-width: 900px) {
  .ligne {
    grid-template-columns: 1fr;
  }
  .adresse {
    flex-direction: column;
  }
  .ligne-mdp {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
