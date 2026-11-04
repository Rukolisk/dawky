<!-- pages/compose-ta-box.vue — Compose ta box (US-11, US-12, US-51, US-52)
     Seuls les produits des mois passés, de la taille du chien, sans ses
     allergènes. Prix fixe par box. -->
<template>
  <div class="conteneur page">
    <header class="entete">
      <p v-if="selection.taille" class="surtitre">
        Box adaptée {{ chienChoisi ? `à ${chienChoisi.nom}, ` : '' }}taille {{ selection.taille }}
      </p>
      <h1 class="titre-1">Compose ta box</h1>
      <p>Les pépites des mois passés. Ces produits viennent des box des mois précédents. Rien ne se perd chez Dawky&nbsp;!</p>
    </header>

    <ClientOnly>
    <!-- Pour quel chien / quelle taille -->
    <div class="reglages">
      <div v-if="chiens.length" class="reglage">
        <p class="libelle-groupe">Pour</p>
        <div class="pilules" role="group" aria-label="Choisir le chien">
          <button
            v-for="c in chiens" :key="c.id" type="button" class="pilule"
            :aria-pressed="selection.chienId === c.id" @click="choisirChien(c.id)"
          >{{ c.nom }}</button>
        </div>
      </div>
      <div class="reglage">
        <p class="libelle-groupe">Taille</p>
        <div class="pilules" role="group" aria-label="Taille de la box">
          <button
            v-for="t in INFOS_TAILLES" :key="t.taille" type="button" class="pilule"
            :aria-pressed="selection.taille === t.taille" @click="choisirTaille(t.taille)"
          >{{ t.taille }} <span class="pilule-detail">{{ t.poids.toLowerCase() }}</span></button>
        </div>
      </div>
    </div>

    <div v-if="!selection.taille" class="choisir-taille">
      <p class="sous-titre">Choisissez la taille de votre chien pour voir les produits adaptés.</p>
      <NuxtLink to="/quiz" class="lien">Je ne sais pas : faire le quiz</NuxtLink>
    </div>

    <div v-else class="mise-en-page">
      <section class="catalogue" aria-label="Produits disponibles">
        <!-- Filtres -->
        <div class="filtres">
          <button
            v-for="code in selection.sansAllergenes" :key="code" type="button" class="filtre filtre-allergene"
            :aria-label="`Retirer le filtre sans ${nomAllergene(code)}`" @click="retirerAllergene(code)"
          >Sans {{ nomAllergene(code).toLowerCase() }} <Icone nom="fermer" :taille="14" /></button>
          <button type="button" class="filtre" :aria-pressed="!categorie" @click="categorie = null">Tous les produits</button>
          <button
            v-for="(libelle, c) in LIBELLES_CATEGORIE" :key="c" type="button" class="filtre"
            :aria-pressed="categorie === c" @click="categorie = categorie === c ? null : c"
          >{{ libelle }}</button>
          <label class="ajout-allergene">
            <span class="sr-only">Exclure un allergène</span>
            <select class="input select-allergene" :value="''" @change="ajouterAllergene">
              <option value="" disabled>+ Exclure un allergène</option>
              <option v-for="a in allergenesDisponibles" :key="a.code" :value="a.code">Sans {{ a.nom.toLowerCase() }}</option>
            </select>
          </label>
        </div>
        <label v-if="selection.sansAllergenes.length" class="case-traces">
          <input v-model="selection.traces" type="checkbox" /> Exclure aussi les produits pouvant contenir des traces
        </label>

        <p v-if="pending && !donnees" class="texte-secondaire">Chargement des produits…</p>
        <p v-else-if="erreur" class="message-erreur">{{ erreur }}</p>

        <!-- Aucun produit (F-41) -->
        <div v-else-if="lotsAffiches.length === 0" class="vide fond-gris">
          <p class="sous-titre">Aucun produit disponible pour l'instant en taille {{ selection.taille }}{{ selection.sansAllergenes.length ? ` sans ${selection.sansAllergenes.map(nomAllergene).join(', ').toLowerCase()}` : '' }}.</p>
          <p>De nouvelles pépites arrivent à la fin de chaque mois.</p>
          <p v-if="alerteCreee" role="status"><strong>C'est noté&nbsp;: nous vous écrivons dès leur retour.</strong></p>
          <button v-else type="button" class="btn btn-principal" @click="creerAlerte">Prévenez-moi quand c'est de retour</button>
        </div>

        <div v-else class="grille">
          <CarteLot
            v-for="lot in lotsAffiches" :key="lot.lotId"
            :lot="lot" :choisi="estChoisi(lot.lotId)" :complet="complet"
            :sans-allergenes="selection.sansAllergenes.map(nomAllergene)"
            @basculer="basculer(lot)" @composition="ficheOuverte = lot"
          />
        </div>

        <aside class="explication petit texte-secondaire">
          <strong>Les pépites des mois passés&nbsp;?</strong> À la fin de chaque mois, les produits qui n'ont pas trouvé
          leur box rejoignent Compose ta box. Même qualité, même composition : rien ne se perd chez Dawky.
          Les produits alimentaires sont retirés un mois avant leur date limite puis donnés à des associations.
        </aside>
      </section>

      <!-- Panier -->
      <aside class="panier fond-noir" aria-label="Ma box">
        <h2 class="titre-panier">Ma box</h2>
        <p class="panier-compteur" aria-live="polite">{{ selection.lots.length }} produit{{ selection.lots.length > 1 ? 's' : '' }} sur {{ nbArticles }}</p>
        <div class="panier-progression"><span :style="{ width: `${Math.min(100, (selection.lots.length / nbArticles) * 100)}%` }" /></div>
        <ul class="panier-liste">
          <li v-for="l in selection.lots" :key="l.lotId">
            <span>{{ l.nom }}</span>
            <button type="button" class="panier-retirer" :aria-label="`Retirer ${l.nom}`" @click="retirer(l.lotId)">
              <Icone nom="fermer" :taille="16" />
            </button>
          </li>
        </ul>
        <p v-if="selection.lots.length" class="petit verification">{{ verificationAllergies }}</p>
        <p class="panier-prix">{{ formatPrix(prixBox) }}</p>
        <p class="petit">Commande unique, livraison offerte.</p>
        <button
          type="button" class="btn btn-clair btn-grand btn-bloc" :disabled="!complet"
          @click="navigateTo('/commande?formule=compose')"
        >Valider ma box</button>
        <p v-if="!complet" class="petit panier-aide">Ajoutez encore {{ nbArticles - selection.lots.length }} produit{{ nbArticles - selection.lots.length > 1 ? 's' : '' }}.</p>
      </aside>
    </div>

    </ClientOnly>

    <ModaleDawky :ouverte="!!ficheOuverte" :titre="ficheOuverte?.produit.nom ?? ''" @fermer="ficheOuverte = null">
      <FicheComposition v-if="ficheOuverte" :produit="ficheOuverte.produit" />
    </ModaleDawky>
  </div>
</template>

<script setup lang="ts">
import type { Allergene, Categorie, Taille } from '~/composables/types'
import type { LotCompose } from '~/composables/useCompose'

useSeoMeta({
  title: 'Compose ta box — produits sans allergène, anti-gaspi | Dawky',
  description: 'Choisissez 5 produits parmi les pépites des mois passés, filtrez les allergènes et consultez la composition de chaque produit.',
})

const route = useRoute()
const { profile, isLoggedIn } = useAuth()
const { selection } = useCompose()
const toast = useToast()

const categorie = ref<Categorie | null>(null)
const ficheOuverte = ref<LotCompose | null>(null)
const alerteCreee = ref(false)
const chiens = computed(() => profile.value?.chiens ?? [])
const chienChoisi = computed(() => chiens.value.find(c => c.id === selection.value.chienId) ?? null)

const { data: allergenes } = await useFetch('/api/allergenes', {
  transform: (r: { data: Allergene[] }) => r.data,
  default: () => [] as Allergene[],
})
const nomAllergene = (code: string) => allergenes.value.find(a => a.code === code)?.nom ?? code
const allergenesDisponibles = computed(() => allergenes.value.filter(a => !selection.value.sansAllergenes.includes(a.code)))

// Paramètres d'URL (depuis le résultat du quiz) puis chien du compte
onMounted(() => {
  const t = route.query.taille
  if (t === 'S' || t === 'M' || t === 'L') changerReglages({ taille: t })
  if (typeof route.query.sansAllergenes === 'string') {
    selection.value.sansAllergenes = route.query.sansAllergenes.split(',').filter(Boolean)
  }
  if (!selection.value.chienId && chiens.value.length === 1 && !route.query.taille) choisirChien(chiens.value[0]!.id)
})

function changerReglages(r: Partial<Pick<typeof selection.value, 'taille' | 'chienId'>>) {
  // Les produits dépendent de la taille : un changement vide la box
  if (r.taille && r.taille !== selection.value.taille && selection.value.lots.length) {
    selection.value.lots = []
    toast.info('Votre box a été vidée : les produits dépendent de la taille.')
  }
  Object.assign(selection.value, r)
}

function choisirChien(id: string) {
  const c = chiens.value.find(x => x.id === id)
  if (!c) return
  changerReglages({ chienId: id, taille: c.taille })
  selection.value.sansAllergenes = c.allergenes.map(a => a.code)
  selection.value.traces = c.sensibleTraces
}

function choisirTaille(t: Taille) {
  changerReglages({ taille: t })
}

function ajouterAllergene(e: Event) {
  const code = (e.target as HTMLSelectElement).value
  if (code) selection.value.sansAllergenes = [...selection.value.sansAllergenes, code]
  ;(e.target as HTMLSelectElement).value = ''
}
function retirerAllergene(code: string) {
  selection.value.sansAllergenes = selection.value.sansAllergenes.filter(c => c !== code)
}

const requete = computed(() => ({
  taille: selection.value.taille ?? undefined,
  sansAllergenes: selection.value.sansAllergenes.join(',') || undefined,
  traces: String(selection.value.traces),
  chienId: selection.value.chienId && isLoggedIn.value ? selection.value.chienId : undefined,
}))

const { data: donnees, pending, error } = await useFetch('/api/compose', {
  query: requete,
  immediate: !!selection.value.taille,
  watch: [requete],
  server: false,
  transform: (r: { data: { lots: LotCompose[]; prix: Partial<Record<Taille, number>>; minArticles: number; maxArticles: number } }) => r.data,
})
const erreur = computed(() => (error.value ? versApiError(error.value).message : ''))

const lotsAffiches = computed(() => (donnees.value?.lots ?? []).filter(l => !categorie.value || l.produit.categorie === categorie.value))
const nbArticles = computed(() => donnees.value?.maxArticles ?? 5)
const prixBox = computed(() => (selection.value.taille ? donnees.value?.prix[selection.value.taille] : undefined))
const complet = computed(() => selection.value.lots.length >= nbArticles.value)

const estChoisi = (lotId: string) => selection.value.lots.some(l => l.lotId === lotId)
function basculer(lot: LotCompose) {
  if (estChoisi(lot.lotId)) return retirer(lot.lotId)
  if (complet.value) return
  selection.value.lots = [...selection.value.lots, {
    lotId: lot.lotId,
    nom: lot.produit.nom,
    allergenes: lot.produit.allergenes.map(a => a.code),
    traces: lot.produit.traces.map(a => a.code),
  }]
}
function retirer(lotId: string) {
  selection.value.lots = selection.value.lots.filter(l => l.lotId !== lotId)
}

// Vérification du panier (parcours Thomas)
const verificationAllergies = computed(() => {
  const exclus = selection.value.sansAllergenes
  if (!exclus.length) return 'Composition et traces consultables sur chaque produit.'
  const contient = selection.value.lots.filter(l => l.allergenes.some(a => exclus.includes(a)))
  const traces = selection.value.lots.filter(l => l.traces.some(a => exclus.includes(a)))
  const noms = exclus.map(nomAllergene).join(', ').toLowerCase()
  if (contient.length) return `Attention : ${contient.map(l => l.nom).join(', ')} contient ${noms}.`
  if (traces.length) return `Vérification allergies : aucun ${noms}, mais des traces possibles dans ${traces.map(l => l.nom).join(', ')}.`
  return `Vérification allergies : aucun ${noms} ni trace dans votre sélection.`
})

async function creerAlerte() {
  if (!isLoggedIn.value) {
    return navigateTo({ path: '/connexion', query: { redirect: route.fullPath } })
  }
  try {
    await api('/api/alertes-stock', { method: 'POST', body: { taille: selection.value.taille } })
    alerteCreee.value = true
  } catch (err) {
    toast.error(versApiError(err).message)
  }
}
</script>

<style scoped>
.page {
  padding-block: var(--e5) var(--e7);
}
.entete {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
  margin-bottom: var(--e4);
}
.entete p:last-child {
  max-width: 560px;
}
.reglages {
  display: flex;
  gap: var(--e4);
  flex-wrap: wrap;
  margin-bottom: var(--e4);
}
.libelle-groupe {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: var(--e1);
}
.pilules,
.filtres {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e1);
}
.pilule,
.filtre {
  min-height: var(--tactile);
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid var(--noir);
  background: var(--blanc);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.pilule[aria-pressed='true'],
.filtre[aria-pressed='true'] {
  background: var(--noir);
  color: var(--blanc);
}
.pilule-detail {
  font-size: 13px;
  font-weight: 400;
  opacity: 0.8;
}
.filtre-allergene {
  background: var(--burgundy);
  border-color: var(--burgundy);
  color: var(--blanc);
}
.select-allergene {
  min-height: var(--tactile);
  border-radius: 999px;
  padding-inline: 16px;
  font-size: 15px;
  width: auto;
}
.case-traces {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  margin-top: var(--e2);
  cursor: pointer;
}
.case-traces input {
  width: 18px;
  height: 18px;
  accent-color: var(--burgundy);
}
.choisir-taille {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--e2);
  padding: var(--e4);
  background: var(--fond-gris);
}
.mise-en-page {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 40px;
  align-items: start;
}
.catalogue {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}
.grille {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--e2);
}
.vide {
  padding: var(--e4);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--e2);
}
.explication {
  max-width: 640px;
}
.panier {
  position: sticky;
  top: 110px;
  padding: var(--e3);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.titre-panier {
  font-size: 40px;
}
.panier-compteur {
  font-weight: 700;
  font-size: 16px;
}
.panier-progression {
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
}
.panier-progression span {
  display: block;
  height: 100%;
  background: var(--blanc);
  transition: width 0.2s;
}
.panier-liste {
  list-style: none;
  margin: 0;
  padding: 0;
}
.panier-liste li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  padding-block: 8px;
  font-size: 15px;
}
.panier-retirer {
  background: none;
  border: 0;
  color: inherit;
  cursor: pointer;
  min-width: 32px;
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.panier-prix {
  font-family: var(--font-titre);
  font-weight: 300;
  font-size: 40px;
  line-height: 1;
  margin-top: var(--e2);
}
.panier-aide {
  text-align: center;
  opacity: 0.8;
}

@media (max-width: 1100px) {
  .grille { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 900px) {
  .mise-en-page { grid-template-columns: 1fr; }
  .panier {
    position: sticky;
    top: auto;
    bottom: 0;
    z-index: 20;
    margin-inline: calc(-1 * var(--marge));
    padding: var(--e2) var(--marge);
  }
  .titre-panier,
  .panier-liste,
  .panier-progression,
  .verification,
  .panier .petit:not(.panier-aide) { display: none; }
  .panier-prix { font-size: 32px; margin-top: 0; }
  .grille { grid-template-columns: 1fr 1fr; }
}
</style>
