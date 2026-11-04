<!-- pages/mon-compte/index.vue — Espace client : « Ma box » -->
<template>
  <div class="tableau">
    <h1 class="titre-2">Bonjour {{ profile?.prenom }}</h1>

    <p v-if="chargement" class="texte-secondaire">Chargement…</p>
    <template v-else>
      <CarteAbonnement
        v-for="a in abonnementsEnCours" :key="a.id"
        :abo="a" :prix="prixSurprise" :pause-max-mois="catalogue?.pauseMaxMois ?? 2" @maj="charger"
      />
      <div v-if="!abonnementsEnCours.length" class="sans-abo fond-gris">
        <h2 class="titre-3">Pas encore de box en cours</h2>
        <p>Le quiz trouve la box adaptée à votre chien en 2 minutes.</p>
        <div class="actions">
          <NuxtLink to="/quiz" class="btn btn-principal">Trouver sa box</NuxtLink>
          <NuxtLink to="/compose-ta-box" class="lien">Composer une box</NuxtLink>
        </div>
      </div>

      <div class="cartes">
        <article v-for="c in profile?.chiens ?? []" :key="c.id" class="carte">
          <h2 class="titre-carte">Fiche de {{ c.nom }}</h2>
          <dl>
            <div><dt>Race</dt><dd>{{ c.race || '—' }}</dd></div>
            <div><dt>Âge</dt><dd>{{ ageLisible(c.ageMois) ?? '—' }}</dd></div>
            <div><dt>Poids</dt><dd>{{ String(c.poids).replace('.', ',') }} kg</dd></div>
            <div><dt>Allergies</dt><dd>{{ allergiesDe(c) }}</dd></div>
          </dl>
          <NuxtLink :to="`/mon-compte/chiens/${c.id}`" class="lien petit">Modifier</NuxtLink>
        </article>
        <article v-if="!profile?.chiens.length" class="carte">
          <h2 class="titre-carte">Votre chien</h2>
          <p class="petit">Enregistrez sa fiche pour que sa box soit toujours adaptée.</p>
          <NuxtLink to="/mon-compte/chiens/nouveau" class="lien petit">Ajouter mon chien</NuxtLink>
        </article>

        <article class="carte">
          <h2 class="titre-carte">Adresse de livraison</h2>
          <span class="etiquette">{{ profile?.adresseComplete ? 'Adresse complète' : 'Adresse incomplète' }}</span>
          <p v-if="adresse" class="petit adresse">
            {{ adresse.prenom }} {{ adresse.nom }}<br />
            {{ adresse.ligne1 }}<template v-if="adresse.ligne2"><br />{{ adresse.ligne2 }}</template><br />
            {{ adresse.codePostal }} {{ adresse.ville }}
          </p>
          <p v-else class="petit">Ajoutez une adresse pour recevoir vos box.</p>
          <NuxtLink to="/mon-compte/compte#adresses" class="lien petit">{{ adresse ? 'Modifier l\'adresse' : 'Ajouter une adresse' }}</NuxtLink>
        </article>
      </div>

      <section v-if="commandes.length">
        <h2 class="titre-carte">Mes commandes</h2>
        <TableCommandes :commandes="commandes.slice(0, 3)" />
        <NuxtLink v-if="commandes.length > 3" to="/mon-compte/commandes" class="lien petit">Toutes mes commandes</NuxtLink>
      </section>

      <section class="parrainage fond-burgundy">
        <div>
          <p class="sous-titre">Parrainez un proche</p>
          <p class="petit">Votre code : <strong>{{ profile?.codeParrainage }}</strong>. Vous et votre filleul profitez chacun d'une réduction.</p>
        </div>
        <button type="button" class="btn btn-clair" @click="copierLien">Copier mon lien</button>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { AbonnementClient, Catalogue, Chien, CommandeClient } from '~/composables/types'

definePageMeta({ layout: 'compte', middleware: 'auth' })
useSeoMeta({ title: 'Mon espace — Dawky', robots: 'noindex' })

const { profile, fetchProfile } = useAuth()
const toast = useToast()
const abonnements = ref<AbonnementClient[]>([])
const commandes = ref<CommandeClient[]>([])
const chargement = ref(true)

const { data: catalogue } = await useFetch('/api/boxes', { transform: (r: { data: Catalogue }) => r.data })
const prixSurprise = computed(() => catalogue.value?.formules.find(f => f.type === 'SURPRISE')?.prix)

const abonnementsEnCours = computed(() => abonnements.value.filter(a =>
  ['ACTIF', 'PAUSE', 'IMPAYE', 'EN_ATTENTE_PAIEMENT'].includes(a.statut)
  || (a.statut === 'RESILIE' && a.dateFin && new Date(a.dateFin) > new Date())))

const adresse = computed(() => profile.value?.adresses.find(a => a.parDefaut) ?? profile.value?.adresses[0])

function allergiesDe(c: Chien) {
  const liste = [...c.allergenes.map(a => a.nom), ...(c.allergiesAutres ? [c.allergiesAutres] : [])]
  return liste.length ? liste.join(', ') : 'Aucune'
}

async function charger() {
  try {
    const [abos, cmds] = await Promise.all([
      api<typeof abonnements.value>('/api/abonnements'),
      api<CommandeClient[]>('/api/commandes'),
      fetchProfile(),
    ])
    abonnements.value = abos
    commandes.value = cmds
  } catch (err) {
    toast.error(versApiError(err).message)
  } finally {
    chargement.value = false
  }
}
onMounted(charger)

async function copierLien() {
  const lien = `${window.location.origin}/?parrain=${profile.value?.codeParrainage}`
  try {
    await navigator.clipboard.writeText(lien)
    toast.success('Lien copié : partagez-le à vos proches !')
  } catch {
    toast.info(lien)
  }
}
</script>

<style scoped>
.tableau {
  display: flex;
  flex-direction: column;
  gap: var(--e4);
}
.sans-abo {
  padding: var(--e4);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--e2);
}
.actions {
  display: flex;
  align-items: center;
  gap: var(--e3);
  flex-wrap: wrap;
}
.cartes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--e2);
}
.carte {
  border: 1px solid var(--noir);
  padding: var(--e3);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}
.titre-carte {
  font-family: var(--font-texte);
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}
.carte dl {
  margin: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 15px;
}
.carte dl div {
  display: flex;
  justify-content: space-between;
  gap: var(--e2);
}
.carte dd {
  margin: 0;
  text-align: right;
}
.carte .lien {
  margin-top: auto;
}
.adresse {
  line-height: 1.6;
}
.parrainage {
  padding: var(--e3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--e3);
  flex-wrap: wrap;
}
.parrainage .sous-titre {
  font-size: 17px;
}

@media (max-width: 900px) {
  .cartes {
    grid-template-columns: 1fr;
  }
}
</style>
