<!-- components/compte/CarteAbonnement.vue
     Abonnement Box Surprise : prochaine box (F-26), changement de taille
     (F-24), pause (F-25), résiliation en ligne (US-10), impayé. -->
<template>
  <article class="abo">
    <div class="abo-texte fond-noir">
      <p class="abo-statut">{{ STATUTS_ABONNEMENT[abo.statut] }}</p>

      <template v-if="abo.prochaineBox">
        <h2 class="titre-3">Prochaine box le {{ jourMois(abo.prochaineBox.date) }}</h2>
        <p class="petit">
          Box adaptée à {{ abo.chien.nom }}, taille {{ abo.taille }}.<template v-if="abo.prochaineBox.theme"> Thème du mois : {{ abo.prochaineBox.theme }}.</template>
        </p>
      </template>
      <h2 v-else-if="abo.statut === 'PAUSE'" class="titre-3">En pause jusqu'au {{ jourMois(abo.pauseJusquau!) }}</h2>
      <h2 v-else-if="abo.statut === 'EN_ATTENTE_PAIEMENT'" class="titre-3">Box Surprise {{ abo.taille }} pour {{ abo.chien.nom }}</h2>
      <h2 v-else class="titre-3">Box Surprise {{ abo.taille }} pour {{ abo.chien.nom }}</h2>

      <p v-if="abo.statut === 'ACTIF'" class="petit">{{ formatPrix(abo.prixMensuel) }} prélevés chaque mois avant l'expédition.</p>
      <p v-else-if="abo.statut === 'RESILIE'" class="petit">Plus aucun prélèvement. La période payée court jusqu'au {{ dateLongue(abo.dateFin) }}.</p>
      <p v-else-if="abo.statut === 'IMPAYE'" class="petit">Le dernier prélèvement a été refusé. Mettez à jour votre carte pour que la box parte.</p>
      <p v-else-if="abo.statut === 'EN_ATTENTE_PAIEMENT'" class="petit">Le paiement n'a pas été finalisé.</p>

      <p v-if="['ACTIF', 'PAUSE', 'IMPAYE'].includes(abo.statut)" class="petit">
        Livraison : {{ abo.modeLivraison === 'POINT_RELAIS' ? `point relais ${abo.pointRelaisLibelle ?? ''}` : abo.adresse ? adresseSurUneLigne(abo.adresse) : 'aucune adresse' }}
      </p>

      <!-- Conseil de taille si le chien a grandi (F-10) -->
      <p v-if="abo.changementTailleConseille && ['ACTIF', 'PAUSE'].includes(abo.statut)" class="conseil petit">
        D'après son poids actuel, la taille {{ abo.tailleConseillee }} semble mieux adaptée à {{ abo.chien.nom }}.
      </p>

      <div class="abo-actions">
        <template v-if="abo.statut === 'ACTIF'">
          <button type="button" class="lien" @click="modale = 'taille'">Changer de taille</button>
          <button type="button" class="lien" @click="ouvrirLivraison">Changer la livraison</button>
          <button type="button" class="lien" @click="modale = 'pause'">Mettre en pause</button>
          <button type="button" class="lien" @click="modale = 'resiliation'">Résilier</button>
        </template>
        <template v-else-if="abo.statut === 'PAUSE'">
          <button type="button" class="lien" :disabled="envoi" @click="reprendre">Reprendre dès maintenant</button>
          <button type="button" class="lien" @click="modale = 'resiliation'">Résilier</button>
        </template>
        <template v-else-if="abo.statut === 'IMPAYE'">
          <button type="button" class="btn btn-clair" :disabled="envoi" @click="portail">Mettre à jour ma carte</button>
        </template>
        <template v-else-if="abo.statut === 'EN_ATTENTE_PAIEMENT'">
          <button type="button" class="btn btn-clair" :disabled="envoi" @click="reprendrePaiement">Finaliser le paiement</button>
        </template>
      </div>
    </div>
    <VisuelChien class="abo-visuel" src="/images/photos/texture-dalmatien.jpg" alt="" />

    <!-- Changer la livraison (F-27) -->
    <ModaleDawky :ouverte="modale === 'livraison'" titre="Livraison" @fermer="modale = null">
      <p class="petit">Appliquée dès la prochaine box.</p>
      <fieldset class="options">
        <legend class="sr-only">Adresse</legend>
        <ChoixOption v-for="a in adresses" :key="a.id" v-model="adresseChoisie" :valeur="a.id" nom="adresse-abo">
          {{ a.prenom }} {{ a.nom }}, {{ adresseSurUneLigne(a) }}
        </ChoixOption>
      </fieldset>
      <NuxtLink to="/mon-compte/compte#adresses" class="lien petit">Ajouter ou modifier une adresse</NuxtLink>
      <label class="case-relais">
        <input v-model="enPointRelais" type="checkbox" /> Livrer en point relais
      </label>
      <template v-if="enPointRelais">
        <p v-if="pointRelais" class="petit">Point relais choisi : <strong>{{ pointRelais.libelle }}</strong></p>
        <PointRelaisSelecteur :code-postal="codePostalChoisi" @choisir="pointRelais = $event" />
      </template>
      <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>
      <button
        type="button" class="btn btn-principal btn-grand btn-bloc"
        :disabled="envoi || !adresseChoisie || (enPointRelais && !pointRelais)" @click="changerLivraison"
      >Enregistrer la livraison</button>
    </ModaleDawky>

    <!-- Changer de taille -->
    <ModaleDawky :ouverte="modale === 'taille'" titre="Changer de taille" @fermer="modale = null">
      <p class="petit">Prise en compte dès la prochaine période. Le nouveau prix s'applique à partir de la prochaine échéance.</p>
      <fieldset class="options">
        <legend class="sr-only">Nouvelle taille</legend>
        <ChoixOption v-for="t in INFOS_TAILLES" :key="t.taille" v-model="nouvelleTaille" :valeur="t.taille" nom="taille">
          <strong>{{ t.taille }}</strong> · {{ t.poids }} · {{ formatPrix(prix?.[t.taille]) }}/mois
          <template v-if="t.taille === abo.taille"> (actuelle)</template>
          <template v-else-if="t.taille === abo.tailleConseillee"> (conseillée)</template>
        </ChoixOption>
      </fieldset>
      <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>
      <button
        type="button" class="btn btn-principal btn-grand btn-bloc"
        :disabled="envoi || nouvelleTaille === abo.taille" @click="changerTaille"
      >Passer en taille {{ nouvelleTaille }} à {{ formatPrix(prix?.[nouvelleTaille]) }}/mois</button>
    </ModaleDawky>

    <!-- Pause -->
    <ModaleDawky :ouverte="modale === 'pause'" titre="Mettre en pause" @fermer="modale = null">
      <p class="petit">Aucune box ni aucun prélèvement pendant la pause. L'abonnement reprend tout seul ensuite.</p>
      <fieldset class="options">
        <legend class="sr-only">Durée de la pause</legend>
        <ChoixOption v-for="m in pauseMaxMois" :key="m" v-model="moisPause" :valeur="m" nom="pause">
          {{ m }} mois (reprise le {{ dateLongue(reprisePause(m)) }})
        </ChoixOption>
      </fieldset>
      <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>
      <button type="button" class="btn btn-principal btn-grand btn-bloc" :disabled="envoi" @click="pause">Confirmer la pause</button>
    </ModaleDawky>

    <!-- Résiliation (confirmation demandée) -->
    <ModaleDawky :ouverte="modale === 'resiliation'" titre="Résilier l'abonnement" @fermer="modale = null">
      <p>
        Vous ne serez plus prélevé(e). {{ abo.chien.nom }} recevra encore la box de la période déjà payée.
        Vous pourrez vous réabonner à tout moment.
      </p>
      <div class="champ">
        <label for="raison">Pourquoi partez-vous&nbsp;? <span class="texte-secondaire">facultatif</span></label>
        <textarea id="raison" v-model="raison" class="input" rows="3" maxlength="500" />
      </div>
      <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>
      <button type="button" class="btn btn-principal btn-grand btn-bloc" :disabled="envoi" @click="resilier">Confirmer la résiliation</button>
      <button type="button" class="lien" @click="modale = null">Garder mon abonnement</button>
    </ModaleDawky>

    <ModaleDawky :ouverte="!!clientSecret" titre="Finaliser le paiement" @fermer="clientSecret = null">
      <PaiementStripe v-if="clientSecret" :client-secret="clientSecret" />
    </ModaleDawky>
  </article>
</template>

<script setup lang="ts">
import type { AbonnementClient, Taille } from '~/composables/types'

const props = defineProps<{
  abo: AbonnementClient
  prix?: Partial<Record<Taille, number>>
  pauseMaxMois: number
}>()
const emit = defineEmits<{ maj: [] }>()
const toast = useToast()

const modale = ref<'taille' | 'livraison' | 'pause' | 'resiliation' | null>(null)

// ─── Livraison ───
const { profile } = useAuth()
const adresses = computed(() => profile.value?.adresses ?? [])
const adresseChoisie = ref<string | null>(null)
const enPointRelais = ref(false)
const pointRelais = ref<{ id: string; libelle: string } | null>(null)
const codePostalChoisi = computed(() => adresses.value.find(a => a.id === adresseChoisie.value)?.codePostal ?? '')

function ouvrirLivraison() {
  adresseChoisie.value = props.abo.adresse?.id ?? adresses.value.find(a => a.parDefaut)?.id ?? adresses.value[0]?.id ?? null
  enPointRelais.value = props.abo.modeLivraison === 'POINT_RELAIS'
  pointRelais.value = props.abo.pointRelaisId && props.abo.pointRelaisLibelle
    ? { id: props.abo.pointRelaisId, libelle: props.abo.pointRelaisLibelle }
    : null
  modale.value = 'livraison'
}

const changerLivraison = () => action(() => api(`/api/abonnements/${props.abo.id}`, {
  method: 'PUT',
  body: {
    livraison: enPointRelais.value && pointRelais.value
      ? { adresseId: adresseChoisie.value, modeLivraison: 'POINT_RELAIS', pointRelaisId: pointRelais.value.id, pointRelaisLibelle: pointRelais.value.libelle }
      : { adresseId: adresseChoisie.value, modeLivraison: 'DOMICILE' },
  },
}), 'Livraison mise à jour')
const nouvelleTaille = ref<Taille>(props.abo.changementTailleConseille ? props.abo.tailleConseillee : props.abo.taille)
const moisPause = ref(1)
const raison = ref('')
const envoi = ref(false)
const erreur = ref('')
const clientSecret = ref<string | null>(null)

watch(modale, () => { erreur.value = '' })

function reprisePause(mois: number) {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + 1 + mois, 1)
}

async function action(fn: () => Promise<unknown>, succes: string) {
  envoi.value = true
  erreur.value = ''
  try {
    await fn()
    modale.value = null
    toast.success(succes)
    emit('maj')
  } catch (err) {
    erreur.value = versApiError(err).message
    if (!modale.value) toast.error(erreur.value)
  } finally {
    envoi.value = false
  }
}

const base = `/api/abonnements/${props.abo.id}`
const changerTaille = () => action(
  () => api(base, { method: 'PUT', body: { taille: nouvelleTaille.value } }),
  `Taille ${nouvelleTaille.value} enregistrée, dès la prochaine période`,
)
const pause = () => action(() => api(`${base}/pause`, { method: 'POST', body: { mois: moisPause.value } }), 'Abonnement mis en pause')
const reprendre = () => action(() => api(`${base}/reprise`, { method: 'POST' }), 'Abonnement repris')
const resilier = () => action(
  () => api(`${base}/resiliation`, { method: 'POST', body: { confirmation: true, raison: raison.value || undefined } }),
  'Résiliation enregistrée. Un email de confirmation vient de partir.',
)

async function portail() {
  envoi.value = true
  try {
    const { url } = await api<{ url: string }>('/api/paiement/portail', { method: 'POST' })
    window.location.href = url
  } catch (err) {
    toast.error(versApiError(err).message)
    envoi.value = false
  }
}

async function reprendrePaiement() {
  envoi.value = true
  try {
    clientSecret.value = (await api<{ clientSecret: string }>('/api/paiement/session', {
      method: 'POST',
      body: { type: 'abonnement', id: props.abo.id },
    })).clientSecret
  } catch (err) {
    toast.error(versApiError(err).message)
  } finally {
    envoi.value = false
  }
}
</script>

<style scoped>
.abo {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.abo-texte {
  padding: var(--e4) var(--e3);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--e2);
}
.abo-statut {
  font-weight: 700;
  font-size: 16px;
}
.conseil {
  border-left: 2px solid var(--blanc);
  padding-left: 12px;
}
.abo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e3);
  margin-top: auto;
  padding-top: var(--e2);
}
.abo-actions .lien {
  color: var(--blanc);
  font-size: 15px;
}
.case-relais {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  cursor: pointer;
  min-height: var(--tactile);
}
.case-relais input {
  width: 20px;
  height: 20px;
  accent-color: var(--burgundy);
}
.options {
  border: 0;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 900px) {
  .abo {
    grid-template-columns: 1fr;
  }
  .abo-visuel {
    display: none;
  }
}
</style>
