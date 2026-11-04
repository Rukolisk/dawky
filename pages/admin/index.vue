<!-- pages/admin/index.vue — Box du mois (US-17, US-18, US-27)
     Construction des 3 box, validation (contrôle allergènes + stock),
     expédition, puis clôture du mois. -->
<template>
  <div class="a-page">
    <div class="a-entete">
      <div>
        <h1 class="a-titre">Box de {{ moisLisible(mois).toLowerCase() }}</h1>
        <p class="petit texte-secondaire">
          Expédition le 1er {{ moisLisible(mois, true).toLowerCase() }}. <strong>{{ LIBELLE_STATUT[statutMois] }}</strong>
        </p>
      </div>
      <div class="a-actions">
        <label class="sr-only" for="mois">Mois</label>
        <input id="mois" v-model="mois" class="input a-select" type="month" />
        <button v-if="statutMois === 'EXPEDIEE'" type="button" class="btn btn-secondaire a-btn-petit" :disabled="envoi" @click="cloture = true">Clôturer le mois</button>
        <button v-if="statutMois === 'VALIDEE'" type="button" class="btn btn-principal a-btn-petit" :disabled="envoi" @click="expedition = true">Lancer l'expédition</button>
        <button v-if="statutMois === 'BROUILLON'" type="button" class="btn btn-principal a-btn-petit" :disabled="envoi" @click="valider(false)">Valider les 3 box</button>
      </div>
    </div>

    <!-- Contrôle avant validation (US-27) -->
    <div v-if="avertissements" class="a-alerte" role="alert">
      <template v-if="avertissements.conflitsAllergie.length">
        <p><strong>Contrôle allergènes :</strong> {{ avertissements.conflitsAllergie.length }} abonné(s) recevraient un de leurs allergènes.</p>
        <ul>
          <li v-for="c in avertissements.conflitsAllergie" :key="c.email">
            {{ c.client }} ({{ c.chien }}, taille {{ c.taille }}) : {{ c.produits.map(p => `${p.produit} (${p.allergenes.join(', ')})`).join(' ; ') }}
          </li>
        </ul>
      </template>
      <template v-if="avertissements.profilsNonValides.length">
        <p><strong>Profils allergiques non validés :</strong></p>
        <ul><li v-for="p in avertissements.profilsNonValides" :key="p.client + p.chien">{{ p.client }} ({{ p.chien }}, taille {{ p.taille }})</li></ul>
      </template>
      <template v-if="avertissements.ruptures.length">
        <p><strong>Stock insuffisant :</strong></p>
        <ul><li v-for="r in avertissements.ruptures" :key="r.produit">{{ r.produit }} : {{ r.stock }} en stock pour {{ r.besoin }} nécessaires</li></ul>
      </template>
      <div class="a-actions">
        <button type="button" class="btn btn-principal a-btn-petit" :disabled="envoi" @click="valider(true)">Valider quand même</button>
        <button type="button" class="lien" @click="avertissements = null">Corriger les box</button>
      </div>
    </div>

    <p v-if="!donnees" class="a-vide">Chargement…</p>
    <div v-else class="colonnes">
      <section v-for="col in colonnes" :key="col.taille" class="colonne">
        <div class="colonne-entete">
          <span class="lettre">{{ col.taille }}</span>
          <span class="petit">{{ donnees.destinataires[col.taille] }} abonné{{ donnees.destinataires[col.taille] > 1 ? 's' : '' }}</span>
        </div>
        <div class="champ">
          <label :for="`theme-${col.taille}`">Thème du mois</label>
          <input :id="`theme-${col.taille}`" v-model="col.theme" class="input" :disabled="!col.modifiable" placeholder="Ex. Hiver douillet" @input="col.modifie = true" />
        </div>
        <ul class="items">
          <li v-for="(it, i) in col.items" :key="it.produitId" class="item">
            <div>
              <p class="item-nom">{{ it.nom }}</p>
              <p class="petit texte-secondaire">
                {{ LIBELLES_CATEGORIE[it.categorie] }} · stock {{ it.stockCourant }}
                <span v-if="it.stockCourant < donnees.destinataires[col.taille] * it.quantite" class="manque">(insuffisant)</span>
              </p>
            </div>
            <button v-if="col.modifiable" type="button" class="retirer" :aria-label="`Retirer ${it.nom}`" @click="col.items.splice(i, 1); col.modifie = true">
              <Icone nom="fermer" :taille="16" />
            </button>
          </li>
        </ul>
        <button v-if="col.modifiable" type="button" class="btn btn-secondaire btn-bloc a-btn-petit" @click="ouvrirSelecteur(col.taille)">Ajouter un produit</button>
        <p class="petit texte-secondaire">{{ col.items.length }} produit{{ col.items.length > 1 ? 's' : '' }} sur {{ nbProduitsBox }}</p>
        <button
          v-if="col.modifiable" type="button" class="btn btn-noir btn-bloc a-btn-petit"
          :disabled="envoi || !col.items.length" @click="enregistrer(col)"
        >{{ col.id && !col.modifie ? 'Brouillon enregistré' : 'Enregistrer le brouillon' }}</button>
        <span v-else class="a-statut">{{ LIBELLE_STATUT[col.statut] }}</span>
      </section>
    </div>

    <!-- Sélecteur de produits (pépites des mois passés en tête) -->
    <ModaleDawky :ouverte="!!selecteurTaille" :titre="`Ajouter à la box ${selecteurTaille}`" @fermer="selecteurTaille = null">
      <div class="a-filtres">
        <button type="button" class="a-filtre" :aria-pressed="!filtreCategorie" @click="filtreCategorie = null">Tous</button>
        <button
          v-for="(l, c) in LIBELLES_CATEGORIE" :key="c" type="button" class="a-filtre"
          :aria-pressed="filtreCategorie === c" @click="filtreCategorie = c"
        >{{ l }}</button>
      </div>
      <ul class="selecteur">
        <li v-for="p in produitsProposes" :key="p.id">
          <button type="button" class="selecteur-produit" @click="ajouter(p)">
            <span>{{ p.emoji }} {{ p.nom }}</span>
            <span class="petit texte-secondaire">
              {{ LIBELLES_CATEGORIE[p.categorie] }} · stock {{ p.stockCourant }}<template v-if="p.stockInvendu"> · <strong>{{ p.stockInvendu }} des mois passés</strong></template>
            </span>
          </button>
        </li>
        <li v-if="!produitsProposes.length" class="a-vide">Aucun produit actif disponible dans cette taille.</li>
      </ul>
    </ModaleDawky>

    <ModaleDawky :ouverte="expedition" titre="Lancer l'expédition" @fermer="expedition = false">
      <p>
        Une commande sera créée pour chaque abonné et chaque cadeau en cours ({{ totalDestinataires }} box), et le stock
        des produits sera décrémenté. Les box passent ensuite dans l'onglet Expéditions.
      </p>
      <button type="button" class="btn btn-principal btn-bloc" :disabled="envoi" @click="expedier">Confirmer l'expédition</button>
    </ModaleDawky>

    <ModaleDawky :ouverte="cloture" titre="Clôturer le mois" @fermer="cloture = false">
      <p>
        Le stock restant des produits de ces box devient disponible dans Compose ta box (produits restants de
        {{ moisLisible(mois, true).toLowerCase() }}). Cette action est définitive.
      </p>
      <button type="button" class="btn btn-principal btn-bloc" :disabled="envoi" @click="cloturer">Clôturer définitivement</button>
    </ModaleDawky>
  </div>
</template>

<script setup lang="ts">
import type { Categorie, Taille } from '~/composables/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Box du mois — Back-office Dawky', robots: 'noindex' })

type Statut = 'BROUILLON' | 'VALIDEE' | 'EXPEDIEE' | 'CLOTUREE'
const LIBELLE_STATUT: Record<Statut | 'VIDE', string> = {
  VIDE: 'Rien d\'enregistré pour ce mois.',
  BROUILLON: 'Brouillon',
  VALIDEE: 'Validées, prêtes à expédier',
  EXPEDIEE: 'Expédiées',
  CLOTUREE: 'Mois clôturé',
}

interface ItemBox { produitId: string; nom: string; categorie: Categorie; quantite: number; stockCourant: number }
interface Colonne { taille: Taille; id?: string; theme: string; statut: Statut; modifiable: boolean; modifie: boolean; items: ItemBox[] }
interface ProduitAdmin { id: string; nom: string; emoji: string; categorie: Categorie; actif: boolean; tailles: Taille[]; stockCourant: number; stockInvendu: number }
interface Avertissements {
  conflitsAllergie: Array<{ client: string; email: string; chien: string; taille: string; produits: Array<{ produit: string; allergenes: string[] }> }>
  profilsNonValides: Array<{ client: string; chien: string; taille: string }>
  ruptures: Array<{ produit: string; besoin: number; stock: number }>
}

const { envoi, executer } = useActionAdmin()
const mois = ref(moisProchain())
const nbProduitsBox = 5
const donnees = ref<{ destinataires: Record<Taille, number>; boxes: Array<{ id: string; taille: Taille; theme: string | null; statut: Statut; items: Array<{ produitId: string; quantite: number; stockCourant: number; produit: { nom: string; emoji: string; categorie: Categorie } }> }> } | null>(null)
const colonnes = ref<Colonne[]>([])
const produits = ref<ProduitAdmin[]>([])
const avertissements = ref<Avertissements | null>(null)
const selecteurTaille = ref<Taille | null>(null)
const filtreCategorie = ref<Categorie | null>(null)
const expedition = ref(false)
const cloture = ref(false)

const statutMois = computed<Statut | 'VIDE'>(() => {
  const statuts = donnees.value?.boxes.map(b => b.statut) ?? []
  if (!statuts.length) return 'VIDE'
  if (statuts.includes('BROUILLON') || statuts.length < 3) return 'BROUILLON'
  return statuts[0]!
})
const totalDestinataires = computed(() => Object.values(donnees.value?.destinataires ?? {}).reduce((s, n) => s + n, 0))

async function charger() {
  avertissements.value = null
  const [d, p] = await Promise.all([
    executer(() => api<NonNullable<typeof donnees.value>>('/api/admin/boxes-mensuelles', { query: { mois: mois.value } })),
    produits.value.length ? Promise.resolve(produits.value) : executer(() => api<ProduitAdmin[]>('/api/admin/produits', { query: { actif: 'true' } })),
  ])
  if (p) produits.value = p
  if (!d) return
  donnees.value = d
  colonnes.value = (['S', 'M', 'L'] as const).map((taille) => {
    const box = d.boxes.find(b => b.taille === taille)
    return {
      taille,
      id: box?.id,
      theme: box?.theme ?? '',
      statut: box?.statut ?? 'BROUILLON',
      modifiable: !box || box.statut === 'BROUILLON',
      modifie: false,
      items: (box?.items ?? []).map(i => ({
        produitId: i.produitId, nom: i.produit.nom, categorie: i.produit.categorie, quantite: i.quantite, stockCourant: i.stockCourant,
      })),
    }
  })
}
watch(mois, charger, { immediate: true })

const produitsProposes = computed(() => {
  const col = colonnes.value.find(c => c.taille === selecteurTaille.value)
  const deja = new Set(col?.items.map(i => i.produitId))
  return produits.value
    .filter(p => p.actif && p.tailles.includes(selecteurTaille.value!) && !deja.has(p.id))
    .filter(p => !filtreCategorie.value || p.categorie === filtreCategorie.value)
    .sort((a, b) => (b.stockInvendu > 0 ? 1 : 0) - (a.stockInvendu > 0 ? 1 : 0) || a.nom.localeCompare(b.nom))
})

function ouvrirSelecteur(t: Taille) {
  filtreCategorie.value = null
  selecteurTaille.value = t
}

function ajouter(p: ProduitAdmin) {
  const col = colonnes.value.find(c => c.taille === selecteurTaille.value)
  if (!col) return
  col.items.push({ produitId: p.id, nom: p.nom, categorie: p.categorie, quantite: 1, stockCourant: p.stockCourant })
  col.modifie = true
  if (col.items.length >= nbProduitsBox) selecteurTaille.value = null
}

async function enregistrer(col: Colonne) {
  const ok = await executer(() => api('/api/admin/boxes-mensuelles', {
    method: 'POST',
    body: {
      mois: mois.value,
      taille: col.taille,
      theme: col.theme || null,
      items: col.items.map(i => ({ produitId: i.produitId, quantite: i.quantite })),
    },
  }), `Box ${col.taille} enregistrée en brouillon`)
  if (ok) await charger()
}

async function valider(forcer: boolean) {
  if (colonnes.value.some(c => c.modifie)) {
    useToast().error('Enregistrez d\'abord les box modifiées.')
    return
  }
  envoi.value = true
  try {
    await api('/api/admin/boxes-mensuelles/valider', { method: 'POST', body: { mois: mois.value, forcer } })
    useToast().success('Les 3 box sont validées et verrouillées')
    await charger()
  } catch (err) {
    const e = versApiError(err)
    if (e.statusCode === 409 && e.details) avertissements.value = e.details as unknown as Avertissements
    else useToast().error(e.message)
  } finally {
    envoi.value = false
  }
}

async function expedier() {
  const r = await executer(() => api<{ commandesCreees: number; abonnementsSansAdresse: string[]; stockManquant: unknown[] }>(
    '/api/admin/boxes-mensuelles/expedier', { method: 'POST', body: { mois: mois.value } }))
  expedition.value = false
  if (!r) return
  const toast = useToast()
  toast.success(`${r.commandesCreees} box à préparer : voir l'onglet Expéditions`)
  if (r.abonnementsSansAdresse.length) toast.error(`${r.abonnementsSansAdresse.length} abonnement(s) sans adresse n'ont pas été expédiés`)
  if (r.stockManquant.length) toast.error('Stock insuffisant pour certains produits : vérifiez l\'onglet Produits')
  await charger()
}

async function cloturer() {
  const r = await executer(() => api('/api/admin/boxes-mensuelles/cloturer', { method: 'POST', body: { mois: mois.value, confirmation: true } }), 'Mois clôturé : les produits restants sont dans Compose ta box')
  cloture.value = false
  if (r) await navigateTo('/admin/invendus')
}
</script>

<style scoped>
.colonnes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--e2);
}
.colonne {
  border: 1px solid var(--noir);
  padding: var(--e2);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.colonne-entete {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.lettre {
  font-family: var(--font-titre);
  font-size: 40px;
  line-height: 1;
}
.items {
  list-style: none;
  margin: 0;
  padding: 0;
}
.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--e1);
  padding-block: 10px;
  border-bottom: 1px solid var(--filet);
}
.item-nom {
  font-weight: 700;
  font-size: 15px;
}
.manque {
  color: var(--erreur);
  font-weight: 700;
}
.retirer {
  border: 0;
  background: none;
  cursor: pointer;
  min-width: 32px;
  min-height: 32px;
}
.selecteur {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 50vh;
  overflow-y: auto;
}
.selecteur-produit {
  width: 100%;
  text-align: left;
  background: none;
  border: 0;
  border-bottom: 1px solid var(--filet);
  padding: 12px 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
  font-size: 15px;
}
.selecteur-produit:hover {
  background: var(--fond-gris);
}

@media (max-width: 1100px) {
  .colonnes {
    grid-template-columns: 1fr;
  }
}
</style>
