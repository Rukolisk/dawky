<!-- pages/admin/parrainage-prix.vue — codes promo et parrainages (US-50),
     prix par taille (US-54), réglages métier, box saisonnières -->
<template>
  <div class="a-page">
    <h1 class="a-titre">Parrainage et prix</h1>

    <!-- Codes promo -->
    <section class="bloc">
      <div class="a-entete">
        <h2 class="a-sous-titre">Codes promo</h2>
        <button type="button" class="btn btn-principal a-btn-petit" @click="ouvrirCreation">Créer un code</button>
      </div>
      <div class="a-table-defilante">
        <table class="a-table">
          <thead><tr><th>Code</th><th>Avantage</th><th>Utilisations</th><th>Validité</th><th>Action</th></tr></thead>
          <tbody>
            <tr v-for="c in codes" :key="c.id">
              <td><strong>{{ c.code }}</strong><br /><span class="petit texte-secondaire">{{ c.description }}</span></td>
              <td>{{ c.type === 'POURCENTAGE' ? `${c.valeur} %` : formatPrix(c.valeur) }}</td>
              <td>{{ c.utilisations }}{{ c.utilisationsMax ? ` / ${c.utilisationsMax}` : '' }}</td>
              <td class="petit">{{ c.dateFin ? `jusqu'au ${dateLongue(c.dateFin)}` : 'Sans limite' }}</td>
              <td>
                <button type="button" class="lien petit" :disabled="envoi" @click="basculerCode(c)">{{ c.actif ? 'Désactiver' : 'Réactiver' }}</button>
              </td>
            </tr>
            <tr v-if="!codes.length"><td colspan="5" class="a-vide">Aucun code.</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Parrainages -->
    <section class="bloc">
      <h2 class="a-sous-titre">Parrainages</h2>
      <p class="petit texte-secondaire">Chaque client a son code personnel. Réduction de {{ reglages?.['parrainage.pourcentage'] ?? 10 }} % pour le parrain et le filleul.</p>
      <div class="a-table-defilante">
        <table class="a-table">
          <thead><tr><th>Parrain</th><th>Code</th><th>Filleul</th><th>Statut</th></tr></thead>
          <tbody>
            <tr v-for="p in parrainages" :key="p.id">
              <td>{{ p.parrain.prenom }} {{ p.parrain.nom }}</td>
              <td>{{ p.parrain.codeParrainage }}</td>
              <td>{{ p.filleul.prenom }} {{ p.filleul.nom }}</td>
              <td><span class="a-statut" :class="{ 'a-statut-fort': p.statut === 'VALIDE' }">{{ p.statut === 'VALIDE' ? 'Validé' : 'En attente' }}</span></td>
            </tr>
            <tr v-if="!parrainages.length"><td colspan="4" class="a-vide">Aucun parrainage pour le moment.</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Prix -->
    <section class="a-encart">
      <h2 class="a-sous-titre">Prix des box</h2>
      <p class="petit">Le changement s'applique aux nouvelles commandes uniquement : les abonnés gardent leur prix.</p>
      <form class="a-formulaire" novalidate @submit.prevent="enregistrerPrix">
        <div class="a-ligne">
          <div v-for="t in ['S', 'M', 'L'] as const" :key="t" class="champ">
            <label :for="`prix-${t}`">Box Surprise {{ t }} (€)</label>
            <input :id="`prix-${t}`" v-model.number="prix.surprise[t]" class="input" type="number" min="1" step="0.01" />
          </div>
          <div class="champ">
            <label for="prix-compose">Compose ta box (€)</label>
            <input id="prix-compose" v-model.number="prix.compose" class="input" type="number" min="1" step="0.01" />
          </div>
        </div>
        <button class="btn btn-secondaire a-btn-petit" :disabled="envoi">Enregistrer les prix</button>
      </form>
    </section>

    <!-- Réglages -->
    <section v-if="reglages" class="a-encart">
      <h2 class="a-sous-titre">Réglages</h2>
      <form class="a-formulaire" novalidate @submit.prevent="enregistrerReglages">
        <div class="a-ligne">
          <div class="champ"><label for="r-s">Taille S jusqu'à (kg)</label><input id="r-s" v-model.number="reglages['taille.seuilS']" class="input" type="number" min="1" /></div>
          <div class="champ"><label for="r-m">Taille M jusqu'à (kg)</label><input id="r-m" v-model.number="reglages['taille.seuilM']" class="input" type="number" min="1" /></div>
          <div class="champ"><label for="r-retrait">Retrait des restes (jours avant la date limite)</label><input id="r-retrait" v-model.number="reglages['invendus.delaiRetraitJours']" class="input" type="number" min="0" /></div>
          <div class="champ"><label for="r-compose">Produits par Compose ta box</label><input id="r-compose" v-model.number="nbCompose" class="input" type="number" min="1" /></div>
          <div class="champ"><label for="r-port">Frais de port (€, 0 = offerts)</label><input id="r-port" v-model.number="fraisPortEuros" class="input" type="number" min="0" step="0.01" /></div>
          <div class="champ"><label for="r-pause">Pause maximale (mois)</label><input id="r-pause" v-model.number="reglages['abonnement.pauseMaxMois']" class="input" type="number" min="1" max="6" /></div>
          <div class="champ"><label for="r-parrain">Réduction de parrainage (%)</label><input id="r-parrain" v-model.number="reglages['parrainage.pourcentage']" class="input" type="number" min="1" max="100" /></div>
          <div class="champ"><label for="r-cadeau">Durées de cadeau (mois)</label><input id="r-cadeau" v-model="dureesCadeau" class="input" placeholder="3, 6, 12" /></div>
        </div>
        <button class="btn btn-secondaire a-btn-petit" :disabled="envoi">Enregistrer les réglages</button>
      </form>
    </section>

    <!-- Box saisonnières -->
    <section class="bloc">
      <div class="a-entete">
        <h2 class="a-sous-titre">Box saisonnières</h2>
        <button type="button" class="btn btn-secondaire a-btn-petit" @click="ouvrirSaison">Nouvelle box saisonnière</button>
      </div>
      <table class="a-table">
        <thead><tr><th>Nom</th><th>Vente</th><th>Stock</th><th>Prix S / M / L</th><th>Action</th></tr></thead>
        <tbody>
          <tr v-for="f in saisonnieres" :key="f.id">
            <td>{{ f.nom }}</td>
            <td class="petit">{{ dateLongue(f.dateDebutVente) }}{{ f.dateFinVente ? ` → ${dateLongue(f.dateFinVente)}` : '' }}</td>
            <td>{{ f.stock ?? '∞' }}</td>
            <td>{{ ['S', 'M', 'L'].map(t => formatPrix(f.prix[t as 'S'])).join(' / ') }}</td>
            <td><button type="button" class="lien petit" :disabled="envoi" @click="basculerSaison(f)">{{ f.actif ? 'Désactiver' : 'Réactiver' }}</button></td>
          </tr>
          <tr v-if="!saisonnieres.length"><td colspan="5" class="a-vide">Aucune box saisonnière.</td></tr>
        </tbody>
      </table>
    </section>

    <ModaleDawky :ouverte="creation" titre="Créer un code" @fermer="creation = false">
      <form class="a-formulaire" novalidate @submit.prevent="creerCode">
        <div class="champ"><label for="c-code">Code</label><input id="c-code" v-model.trim="nouveauCode.code" class="input" placeholder="NOEL2026" /></div>
        <div class="champ"><label for="c-desc">Description</label><input id="c-desc" v-model.trim="nouveauCode.description" class="input" /></div>
        <div class="a-ligne">
          <div class="champ">
            <label for="c-type">Type</label>
            <select id="c-type" v-model="nouveauCode.type" class="input">
              <option value="POURCENTAGE">Pourcentage</option>
              <option value="MONTANT">Montant (€)</option>
            </select>
          </div>
          <div class="champ"><label for="c-val">Valeur</label><input id="c-val" v-model.number="nouveauCode.valeur" class="input" type="number" min="1" step="0.01" /></div>
        </div>
        <div class="a-ligne">
          <div class="champ"><label for="c-fin">Fin de validité</label><input id="c-fin" v-model="nouveauCode.dateFin" class="input" type="date" /></div>
          <div class="champ"><label for="c-max">Utilisations max</label><input id="c-max" v-model.number="nouveauCode.utilisationsMax" class="input" type="number" min="1" /></div>
        </div>
        <button class="btn btn-principal btn-bloc" :disabled="envoi">Créer</button>
      </form>
    </ModaleDawky>

    <ModaleDawky :ouverte="saison" titre="Nouvelle box saisonnière" @fermer="saison = false">
      <form class="a-formulaire" novalidate @submit.prevent="creerSaison">
        <div class="champ"><label for="s-nom">Nom</label><input id="s-nom" v-model.trim="nouvelleSaison.nom" class="input" placeholder="Box de Noël" /></div>
        <div class="champ"><label for="s-desc">Description</label><textarea id="s-desc" v-model.trim="nouvelleSaison.description" class="input" rows="2" /></div>
        <div class="a-ligne">
          <div class="champ"><label for="s-debut">Début de vente</label><input id="s-debut" v-model="nouvelleSaison.dateDebutVente" class="input" type="date" /></div>
          <div class="champ"><label for="s-fin">Fin de vente</label><input id="s-fin" v-model="nouvelleSaison.dateFinVente" class="input" type="date" /></div>
          <div class="champ"><label for="s-stock">Stock</label><input id="s-stock" v-model.number="nouvelleSaison.stock" class="input" type="number" min="0" /></div>
        </div>
        <div class="a-ligne">
          <div v-for="t in ['S', 'M', 'L'] as const" :key="t" class="champ">
            <label :for="`s-prix-${t}`">Prix {{ t }} (€)</label>
            <input :id="`s-prix-${t}`" v-model.number="nouvelleSaison.prix[t]" class="input" type="number" min="1" step="0.01" />
          </div>
        </div>
        <button class="btn btn-principal btn-bloc" :disabled="envoi">Créer</button>
      </form>
    </ModaleDawky>
  </div>
</template>

<script setup lang="ts">
import type { Formule } from '~/composables/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Parrainage et prix — Back-office Dawky', robots: 'noindex' })

interface Code {
  id: string; code: string; description: string | null; type: 'POURCENTAGE' | 'MONTANT'; valeur: number
  actif: boolean; dateFin: string | null; utilisationsMax: number | null; utilisations: number
}
interface Parrainage {
  id: string; statut: string
  parrain: { prenom: string; nom: string; codeParrainage: string }
  filleul: { prenom: string; nom: string }
}
type FormuleAdmin = Formule & { actif: boolean; stock: number | null }

const { envoi, executer } = useActionAdmin()
const codes = ref<Code[]>([])
const parrainages = ref<Parrainage[]>([])
const formules = ref<FormuleAdmin[]>([])
const reglages = ref<Record<string, any> | null>(null)
const prix = reactive({ surprise: { S: 0, M: 0, L: 0 }, compose: 0 })

const saisonnieres = computed(() => formules.value.filter(f => f.type === 'SAISONNIERE'))

async function charger() {
  const [c, f, r] = await Promise.all([
    executer(() => api<{ codes: Code[]; parrainages: Parrainage[] }>('/api/admin/codes-promo')),
    executer(() => api<Array<FormuleAdmin & { prix: Array<{ taille: 'S' | 'M' | 'L'; prix: number }> }>>('/api/admin/formules')),
    executer(() => api<Record<string, any>>('/api/admin/reglages')),
  ])
  if (c) {
    codes.value = c.codes
    parrainages.value = c.parrainages
  }
  if (f) {
    formules.value = f.map(x => ({ ...x, prix: Object.fromEntries(x.prix.map(p => [p.taille, p.prix])) }))
    const surprise = formules.value.find(x => x.type === 'SURPRISE')
    const compose = formules.value.find(x => x.type === 'COMPOSE')
    prix.surprise = { S: (surprise?.prix.S ?? 0) / 100, M: (surprise?.prix.M ?? 0) / 100, L: (surprise?.prix.L ?? 0) / 100 }
    prix.compose = (compose?.prix.M ?? compose?.prix.S ?? 0) / 100
  }
  if (r) reglages.value = r
}
onMounted(charger)

const enCentimes = (e: number) => Math.round(e * 100)

async function enregistrerPrix() {
  const surprise = formules.value.find(x => x.type === 'SURPRISE')
  const compose = formules.value.find(x => x.type === 'COMPOSE')
  await executer(async () => {
    if (surprise) {
      await api('/api/admin/prix', {
        method: 'PUT',
        body: { formulaId: surprise.id, prix: { S: enCentimes(prix.surprise.S), M: enCentimes(prix.surprise.M), L: enCentimes(prix.surprise.L) } },
      })
    }
    if (compose) {
      const p = enCentimes(prix.compose)
      await api('/api/admin/prix', { method: 'PUT', body: { formulaId: compose.id, prix: { S: p, M: p, L: p } } })
    }
  }, 'Prix enregistrés pour les nouvelles commandes')
  await charger()
}

// Réglages exprimés autrement à l'écran (euros, liste)
const fraisPortEuros = computed({
  get: () => (reglages.value?.['livraison.fraisPort'] ?? 0) / 100,
  set: (v: number) => { reglages.value!['livraison.fraisPort'] = enCentimes(v || 0) },
})
const nbCompose = computed({
  get: () => reglages.value?.['compose.maxArticles'] ?? 5,
  set: (v: number) => {
    reglages.value!['compose.minArticles'] = v
    reglages.value!['compose.maxArticles'] = v
  },
})
const dureesCadeau = computed({
  get: () => (reglages.value?.['cadeau.dureesMois'] ?? []).join(', '),
  set: (v: string) => { reglages.value!['cadeau.dureesMois'] = v.split(',').map(x => Number(x.trim())).filter(n => n > 0) },
})

async function enregistrerReglages() {
  const r = await executer(() => api<Record<string, any>>('/api/admin/reglages', { method: 'PUT', body: reglages.value }), 'Réglages enregistrés')
  if (r) reglages.value = r
}

// ─── Codes ───
const creation = ref(false)
const nouveauCode = reactive({ code: '', description: '', type: 'POURCENTAGE' as Code['type'], valeur: 10, dateFin: '', utilisationsMax: null as number | null })
function ouvrirCreation() {
  Object.assign(nouveauCode, { code: '', description: '', type: 'POURCENTAGE', valeur: 10, dateFin: '', utilisationsMax: null })
  creation.value = true
}
async function creerCode() {
  const ok = await executer(() => api('/api/admin/codes-promo', {
    method: 'POST',
    body: {
      code: nouveauCode.code,
      description: nouveauCode.description || null,
      type: nouveauCode.type,
      valeur: nouveauCode.type === 'MONTANT' ? enCentimes(nouveauCode.valeur) : Math.round(nouveauCode.valeur),
      dateFin: nouveauCode.dateFin || null,
      utilisationsMax: nouveauCode.utilisationsMax || null,
    },
  }), 'Code créé')
  if (!ok) return
  creation.value = false
  await charger()
}
async function basculerCode(c: Code) {
  if (await executer(() => api(`/api/admin/codes-promo/${c.id}`, { method: 'PUT', body: { actif: !c.actif } }), c.actif ? 'Code désactivé' : 'Code réactivé')) await charger()
}

// ─── Saisonnières ───
const saison = ref(false)
const nouvelleSaison = reactive({ nom: '', description: '', dateDebutVente: '', dateFinVente: '', stock: null as number | null, prix: { S: 29.9, M: 29.9, L: 29.9 } })
function ouvrirSaison() {
  Object.assign(nouvelleSaison, { nom: '', description: '', dateDebutVente: new Date().toISOString().slice(0, 10), dateFinVente: '', stock: null })
  saison.value = true
}
function slugifier(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
async function creerSaison() {
  const s = nouvelleSaison
  const ok = await executer(() => api('/api/admin/formules', {
    method: 'POST',
    body: {
      slug: `${slugifier(s.nom)}-${s.dateDebutVente.slice(0, 4)}`,
      nom: s.nom,
      description: s.description,
      dateDebutVente: s.dateDebutVente,
      dateFinVente: s.dateFinVente || null,
      stock: s.stock ?? null,
      prix: { S: enCentimes(s.prix.S), M: enCentimes(s.prix.M), L: enCentimes(s.prix.L) },
    },
  }), 'Box saisonnière créée')
  if (!ok) return
  saison.value = false
  await charger()
}
async function basculerSaison(f: FormuleAdmin) {
  if (await executer(() => api(`/api/admin/formules/${f.id}`, { method: 'PUT', body: { actif: !f.actif } }))) await charger()
}
</script>

<style scoped>
.bloc {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}
</style>
