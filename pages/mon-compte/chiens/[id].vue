<!-- pages/mon-compte/chiens/[id].vue — fiche chien (F-08, US-20, US-21)
     /mon-compte/chiens/nouveau pour en créer une. -->
<template>
  <div class="fiche">
    <h1 class="titre-2">{{ estNouveau ? 'Ajouter mon chien' : `Fiche de ${chienInitial?.nom ?? ''}` }}</h1>

    <p v-if="!estNouveau && !chienInitial" class="texte-secondaire">Chargement…</p>
    <form v-else class="formulaire" novalidate @submit.prevent="enregistrer">
      <div class="ligne">
        <div class="champ">
          <label for="ch-nom">Prénom</label>
          <input id="ch-nom" v-model.trim="f.nom" class="input" required maxlength="50" />
        </div>
        <div class="champ">
          <label for="ch-race">Race</label>
          <RaceAutocomplete id="ch-race" v-model="f.race" />
        </div>
      </div>
      <div class="ligne">
        <div class="champ">
          <label for="ch-naissance">Date de naissance <span class="texte-secondaire">approximative si besoin</span></label>
          <input id="ch-naissance" v-model="f.dateNaissance" class="input" type="date" :max="aujourdhui" />
        </div>
        <div class="champ">
          <label for="ch-poids">Poids (kg)</label>
          <input id="ch-poids" v-model.number="f.poids" class="input" type="number" min="0.5" max="120" step="0.1" required />
        </div>
      </div>

      <fieldset class="groupe">
        <legend class="libelle-groupe">Taille de sa box</legend>
        <div class="options-ligne">
          <ChoixOption v-for="t in INFOS_TAILLES" :key="t.taille" v-model="f.taille" :valeur="t.taille" nom="taille">
            {{ t.taille }} <span class="petit texte-secondaire">· {{ t.poids.toLowerCase() }}</span>
          </ChoixOption>
        </div>
        <p class="petit texte-secondaire">Calculée d'après son poids, vous pouvez la changer. La taille d'un abonnement en cours se modifie depuis « Ma box ».</p>
      </fieldset>

      <fieldset class="groupe">
        <legend class="libelle-groupe">Son niveau d'activité</legend>
        <div class="options-ligne options-3">
          <ChoixOption v-for="(libelle, n) in LIBELLES_ACTIVITE" :key="n" v-model="f.niveauActivite" :valeur="n" nom="activite">{{ libelle }}</ChoixOption>
        </div>
      </fieldset>
      <fieldset class="groupe">
        <legend class="libelle-groupe">Est-ce un gros mâcheur&nbsp;?</legend>
        <div class="options-ligne">
          <ChoixOption v-model="f.estMacheur" :valeur="true" nom="macheur">Oui</ChoixOption>
          <ChoixOption v-model="f.estMacheur" :valeur="false" nom="macheur">Non</ChoixOption>
        </div>
      </fieldset>

      <fieldset class="groupe">
        <legend class="libelle-groupe">Allergies</legend>
        <div class="options-ligne options-3">
          <ChoixOption v-for="a in allergenes" :key="a.code" v-model="f.allergenes" :valeur="a.code" nom="allergenes" multiple>{{ a.nom }}</ChoixOption>
        </div>
        <div class="champ">
          <label for="ch-autres">Autre allergène</label>
          <input id="ch-autres" v-model.trim="f.allergiesAutres" class="input" maxlength="300" />
        </div>
        <label class="case-simple">
          <input v-model="f.sensibleTraces" type="checkbox" /> Sensible aux traces
        </label>
        <p v-if="chienInitial?.allergenes.length && !chienInitial.profilAllergieValide" class="petit texte-secondaire">
          Notre équipe vous contacte pour valider son profil sans allergènes avant la prochaine expédition.
        </p>
      </fieldset>

      <div class="champ">
        <label for="ch-comportement">Son caractère, ses habitudes <span class="texte-secondaire">facultatif</span></label>
        <textarea id="ch-comportement" v-model.trim="f.comportement" class="input" rows="3" maxlength="500" />
      </div>

      <label v-if="estNouveau" class="case-simple">
        <input v-model="consentement" type="checkbox" />
        <span>J'accepte que Dawky enregistre la fiche de mon chien pour adapter sa box. Je peux la supprimer à tout moment.</span>
      </label>

      <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>
      <div class="actions">
        <button class="btn btn-principal btn-grand" :disabled="envoi">Enregistrer</button>
        <button v-if="!estNouveau" type="button" class="lien" @click="suppression = true">Supprimer la fiche</button>
      </div>
    </form>

    <ModaleDawky :ouverte="suppression" titre="Supprimer la fiche" @fermer="suppression = false">
      <p>Les informations de {{ chienInitial?.nom }} seront effacées. Impossible s'il a un abonnement en cours.</p>
      <p v-if="erreurSuppression" class="message-erreur" role="alert">{{ erreurSuppression }}</p>
      <button type="button" class="btn btn-principal btn-bloc" :disabled="envoi" @click="supprimer">Supprimer définitivement</button>
    </ModaleDawky>
  </div>
</template>

<script setup lang="ts">
import type { Allergene, Chien, NiveauActivite, Taille } from '~/composables/types'

definePageMeta({ layout: 'compte', middleware: 'auth' })

const route = useRoute()
const { profile, fetchProfile } = useAuth()
const toast = useToast()
const estNouveau = computed(() => route.params.id === 'nouveau')
const chienInitial = computed<Chien | undefined>(() => profile.value?.chiens.find(c => c.id === route.params.id))
useSeoMeta({ title: () => `${chienInitial.value?.nom ?? 'Mon chien'} — Dawky`, robots: 'noindex' })

const aujourdhui = new Date().toISOString().slice(0, 10)
const f = reactive({
  nom: '',
  race: '',
  dateNaissance: '',
  poids: null as number | null,
  taille: 'M' as Taille,
  niveauActivite: 'MODERE' as NiveauActivite,
  estMacheur: false,
  allergenes: [] as string[],
  allergiesAutres: '',
  sensibleTraces: false,
  comportement: '',
})
const consentement = ref(false)
const envoi = ref(false)
const erreur = ref('')
const suppression = ref(false)
const erreurSuppression = ref('')
const tailleManuelle = ref(false)

const { data: allergenes } = await useFetch('/api/allergenes', {
  transform: (r: { data: Allergene[] }) => r.data,
  default: () => [] as Allergene[],
})

watch(chienInitial, (c) => {
  if (!c) return
  Object.assign(f, {
    nom: c.nom,
    race: c.race ?? '',
    dateNaissance: c.dateNaissance?.slice(0, 10) ?? '',
    poids: c.poids,
    taille: c.taille,
    niveauActivite: c.niveauActivite,
    estMacheur: c.estMacheur,
    allergenes: c.allergenes.map(a => a.code),
    allergiesAutres: c.allergiesAutres ?? '',
    sensibleTraces: c.sensibleTraces,
    comportement: c.comportement ?? '',
  })
  tailleManuelle.value = true
}, { immediate: true })

// Taille suggérée d'après le poids tant que l'utilisateur ne l'a pas choisie
watch(() => f.poids, (p) => {
  if (!p || (tailleManuelle.value && !estNouveau.value)) return
  f.taille = p <= 10 ? 'S' : p <= 25 ? 'M' : 'L'
})

async function enregistrer() {
  erreur.value = ''
  if (!f.nom || !f.poids) return (erreur.value = 'Indiquez au moins son prénom et son poids.')
  if (estNouveau.value && !consentement.value) return (erreur.value = 'Votre accord est nécessaire pour enregistrer la fiche.')
  envoi.value = true
  const corps = {
    ...f,
    race: f.race || null,
    dateNaissance: f.dateNaissance || null,
    allergiesAutres: f.allergiesAutres || null,
    comportement: f.comportement || null,
  }
  try {
    if (estNouveau.value) {
      const c = await api<{ id: string }>('/api/chiens', { method: 'POST', body: { ...corps, consentementRgpd: true } })
      await fetchProfile()
      toast.success(`Fiche de ${f.nom} enregistrée`)
      await navigateTo(`/mon-compte/chiens/${c.id}`)
    } else {
      await api(`/api/chiens/${route.params.id}`, { method: 'PUT', body: corps })
      await fetchProfile()
      toast.success('Fiche mise à jour')
    }
  } catch (err) {
    erreur.value = versApiError(err).message
  } finally {
    envoi.value = false
  }
}

async function supprimer() {
  envoi.value = true
  erreurSuppression.value = ''
  try {
    await api(`/api/chiens/${route.params.id}`, { method: 'DELETE' })
    await fetchProfile()
    toast.success('Fiche supprimée')
    await navigateTo('/mon-compte')
  } catch (err) {
    erreurSuppression.value = versApiError(err).message
  } finally {
    envoi.value = false
  }
}
</script>

<style scoped>
.fiche {
  display: flex;
  flex-direction: column;
  gap: var(--e4);
  max-width: 760px;
}
.formulaire {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}
.ligne,
.options-ligne {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--e2);
}
.options-ligne {
  grid-template-columns: repeat(3, 1fr);
}
.groupe {
  border: 0;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.libelle-groupe {
  font-size: 16px;
  font-weight: 700;
  padding: 0;
  margin-bottom: 8px;
}
.champ label .texte-secondaire {
  font-weight: 400;
  font-size: 14px;
}
.case-simple {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 15px;
  cursor: pointer;
}
.case-simple input {
  width: 20px;
  height: 20px;
  margin-top: 2px;
  accent-color: var(--burgundy);
  flex-shrink: 0;
}
.actions {
  display: flex;
  align-items: center;
  gap: var(--e3);
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .ligne,
  .options-ligne {
    grid-template-columns: 1fr 1fr;
  }
  .ligne {
    grid-template-columns: 1fr;
  }
}
</style>
