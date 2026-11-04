<!-- pages/admin/produits.vue — catalogue (US-16, US-26, F-57)
     Création / modification dans un panneau, composition et allergènes,
     stock géré par lots (modifiable directement), désactivation. -->
<template>
  <div class="a-page">
    <div class="a-entete">
      <h1 class="a-titre">Produits</h1>
      <button type="button" class="btn btn-principal a-btn-petit" @click="nouveau">Nouveau produit</button>
    </div>

    <div class="a-filtres">
      <button type="button" class="a-filtre" :aria-pressed="!categorie" @click="categorie = null">Tous</button>
      <button v-for="(l, c) in LIBELLES_CATEGORIE" :key="c" type="button" class="a-filtre" :aria-pressed="categorie === c" @click="categorie = c">{{ l }}</button>
      <button type="button" class="a-filtre" :aria-pressed="type === 'invendu'" @click="type = type === 'invendu' ? null : 'invendu'">Restes des mois passés</button>
      <label class="a-case"><input v-model="voirInactifs" type="checkbox" /> Afficher les désactivés</label>
    </div>

    <div class="mise-en-page" :class="{ 'avec-panneau': !!edition }">
      <div class="a-table-defilante">
        <table class="a-table">
          <thead>
            <tr><th>Produit</th><th>Catégorie</th><th>Tailles</th><th>Stock</th><th>Restes</th><th>Statut</th></tr>
          </thead>
          <tbody>
            <tr
              v-for="p in produitsAffiches" :key="p.id" class="cliquable"
              :class="{ selectionnee: edition?.id === p.id }" tabindex="0"
              @click="editer(p)" @keydown.enter="editer(p)"
            >
              <td>{{ p.emoji }} {{ p.nom }}</td>
              <td>{{ LIBELLES_CATEGORIE[p.categorie] }}</td>
              <td>{{ p.tailles.join(', ') }}</td>
              <td>{{ p.stockCourant }}</td>
              <td>{{ p.stockInvendu || '—' }}</td>
              <td><span class="a-statut" :class="{ 'a-statut-fort': !p.actif }">{{ p.actif ? 'Actif' : 'Désactivé' }}</span></td>
            </tr>
            <tr v-if="!produitsAffiches.length"><td colspan="6" class="a-vide">Aucun produit.</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Panneau d'édition -->
      <aside v-if="edition" class="panneau a-encart" aria-label="Édition du produit">
        <div class="a-entete">
          <h2 class="a-sous-titre">{{ edition.id ? 'Modifier le produit' : 'Nouveau produit' }}</h2>
          <button type="button" class="lien petit" @click="edition = null">Fermer</button>
        </div>
        <form class="a-formulaire" novalidate @submit.prevent="enregistrer">
          <div class="a-ligne">
            <div class="champ"><label for="p-nom">Nom</label><input id="p-nom" v-model.trim="edition.nom" class="input" /></div>
            <div class="champ"><label for="p-emoji">Emoji</label><input id="p-emoji" v-model="edition.emoji" class="input a-input-court" maxlength="8" /></div>
          </div>
          <div class="champ"><label for="p-desc">Description</label><textarea id="p-desc" v-model.trim="edition.description" class="input" rows="2" /></div>
          <div class="a-ligne">
            <div class="champ">
              <label for="p-cat">Catégorie</label>
              <select id="p-cat" v-model="edition.categorie" class="input">
                <option v-for="(l, c) in LIBELLES_CATEGORIE" :key="c" :value="c">{{ l }}</option>
              </select>
            </div>
            <div class="champ">
              <label for="p-prix">Valeur unitaire (€)</label>
              <input id="p-prix" v-model.number="edition.prixEuros" class="input" type="number" min="0" step="0.01" />
            </div>
          </div>
          <fieldset class="groupe">
            <legend>Tailles</legend>
            <label v-for="t in ['S', 'M', 'L']" :key="t" class="a-case">
              <input v-model="edition.tailles" type="checkbox" :value="t" /> {{ t }}
            </label>
          </fieldset>
          <div class="champ">
            <label for="p-ingr">Ingrédients <span v-if="estAlimentaire" class="obligatoire">obligatoire</span></label>
            <textarea id="p-ingr" v-model.trim="edition.ingredients" class="input" rows="3" />
          </div>
          <fieldset class="groupe groupe-allergenes">
            <legend>Allergènes et traces</legend>
            <div v-for="a in allergenes" :key="a.code" class="allergene">
              <span>{{ a.nom }}</span>
              <select v-model="edition.allergenes[a.code]" class="input a-select" :aria-label="`${a.nom} : présence`">
                <option value="">Absent</option>
                <option value="CONTIENT">Contient</option>
                <option value="TRACES">Traces possibles</option>
              </select>
            </div>
          </fieldset>
          <label class="a-case"><input v-model="edition.actif" type="checkbox" /> Actif (visible et utilisable dans les box)</label>

          <div v-if="!edition.id" class="a-ligne">
            <div class="champ"><label for="p-stock">Stock initial</label><input id="p-stock" v-model.number="edition.stockInitial" class="input" type="number" min="0" /></div>
            <div class="champ"><label for="p-dlc">Date limite du lot</label><input id="p-dlc" v-model="edition.dateLimite" class="input" type="date" /></div>
          </div>

          <button class="btn btn-principal btn-bloc a-btn-petit" :disabled="envoi">Enregistrer</button>
          <button v-if="edition.id && edition.actif" type="button" class="btn btn-secondaire btn-bloc a-btn-petit" :disabled="envoi" @click="desactiver">Désactiver le produit</button>
        </form>

        <!-- Lots de stock -->
        <section v-if="edition.id" class="lots">
          <h3 class="a-sous-titre">Stock par lot</h3>
          <table class="a-table">
            <thead><tr><th>Lot</th><th>Date limite</th><th>Quantité</th></tr></thead>
            <tbody>
              <tr v-for="l in lotsEdition" :key="l.id">
                <td class="petit">{{ l.moisOrigine ? `Reste ${moisLisible(l.moisOrigine, true).toLowerCase()}` : 'Stock courant' }}</td>
                <td class="petit">{{ l.dateLimite ? dateLongue(l.dateLimite) : '—' }}</td>
                <td>
                  <input
                    :value="l.quantite" class="input a-input-court" type="number" min="0" :aria-label="`Quantité du lot`"
                    @change="majLot(l.id, Number(($event.target as HTMLInputElement).value))"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <form class="ajout-lot" novalidate @submit.prevent="ajouterLot">
            <div class="champ"><label for="l-qte">Ajouter</label><input id="l-qte" v-model.number="nouveauLot.quantite" class="input a-input-court" type="number" min="1" /></div>
            <div class="champ"><label for="l-dlc">Date limite</label><input id="l-dlc" v-model="nouveauLot.dateLimite" class="input" type="date" /></div>
            <button class="btn btn-secondaire a-btn-petit" :disabled="envoi || !nouveauLot.quantite">Ajouter le lot</button>
          </form>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Allergene, Categorie, Taille } from '~/composables/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Produits — Back-office Dawky', robots: 'noindex' })

interface Lot { id: string; quantite: number; dateLimite: string | null; moisOrigine: string | null }
interface ProduitAdmin {
  id: string; nom: string; description: string; emoji: string; categorie: Categorie; ingredients: string | null
  prix: number; actif: boolean; tailles: Taille[]; allergenes: Array<{ code: string; presence: 'CONTIENT' | 'TRACES' }>
  lots: Lot[]; stockCourant: number; stockInvendu: number
}
interface Edition {
  id?: string; nom: string; description: string; emoji: string; categorie: Categorie; ingredients: string
  prixEuros: number; actif: boolean; tailles: Taille[]; allergenes: Record<string, '' | 'CONTIENT' | 'TRACES'>
  stockInitial: number; dateLimite: string
}

const { envoi, executer } = useActionAdmin()
const produits = ref<ProduitAdmin[]>([])
const categorie = ref<Categorie | null>(null)
const type = ref<'invendu' | null>(null)
const voirInactifs = ref(false)
const edition = ref<Edition | null>(null)
const nouveauLot = reactive({ quantite: 0, dateLimite: '' })

const { data: allergenes } = await useFetch('/api/allergenes', {
  transform: (r: { data: Allergene[] }) => r.data,
  default: () => [] as Allergene[],
})

async function charger() {
  const r = await executer(() => api<ProduitAdmin[]>('/api/admin/produits'))
  if (r) produits.value = r
}
onMounted(charger)

const produitsAffiches = computed(() => produits.value
  .filter(p => voirInactifs.value || p.actif)
  .filter(p => !categorie.value || p.categorie === categorie.value)
  .filter(p => type.value !== 'invendu' || p.stockInvendu > 0))

const estAlimentaire = computed(() => edition.value && ['FRIANDISE', 'MASTICATION'].includes(edition.value.categorie))
const lotsEdition = computed(() => produits.value.find(p => p.id === edition.value?.id)?.lots ?? [])

function nouveau() {
  edition.value = {
    nom: '', description: '', emoji: '📦', categorie: 'FRIANDISE', ingredients: '', prixEuros: 0, actif: true,
    tailles: ['S', 'M', 'L'], allergenes: {}, stockInitial: 0, dateLimite: '',
  }
}

function editer(p: ProduitAdmin) {
  edition.value = {
    id: p.id, nom: p.nom, description: p.description, emoji: p.emoji, categorie: p.categorie,
    ingredients: p.ingredients ?? '', prixEuros: p.prix / 100, actif: p.actif, tailles: [...p.tailles],
    allergenes: Object.fromEntries(p.allergenes.map(a => [a.code, a.presence])), stockInitial: 0, dateLimite: '',
  }
}

async function enregistrer() {
  const e = edition.value!
  const corps = {
    nom: e.nom,
    description: e.description,
    emoji: e.emoji || '📦',
    categorie: e.categorie,
    ingredients: e.ingredients || null,
    prix: Math.round((e.prixEuros || 0) * 100),
    tailles: e.tailles,
    allergenes: Object.entries(e.allergenes).filter(([, v]) => v).map(([code, presence]) => ({ code, presence })),
    actif: e.actif,
    ...(!e.id && e.stockInitial > 0 ? { stockInitial: { quantite: e.stockInitial, dateLimite: e.dateLimite || null } } : {}),
  }
  const r = await executer(
    () => api<{ id: string }>(e.id ? `/api/admin/produits/${e.id}` : '/api/admin/produits', { method: e.id ? 'PUT' : 'POST', body: corps }),
    e.id ? 'Produit mis à jour' : 'Produit créé',
  )
  if (!r) return
  await charger()
  const p = produits.value.find(x => x.id === r.id)
  if (p) editer(p)
}

async function desactiver() {
  const ok = await executer(() => api(`/api/admin/produits/${edition.value!.id}`, { method: 'DELETE' }), 'Produit désactivé')
  if (ok) {
    edition.value!.actif = false
    await charger()
  }
}

async function majLot(id: string, quantite: number) {
  if (Number.isNaN(quantite) || quantite < 0) return
  const ok = await executer(() => api(`/api/admin/lots/${id}`, { method: 'PUT', body: { quantite } }), 'Stock mis à jour')
  if (ok) await charger()
}

async function ajouterLot() {
  const ok = await executer(() => api(`/api/admin/produits/${edition.value!.id}/lots`, {
    method: 'POST',
    body: { quantite: nouveauLot.quantite, dateLimite: nouveauLot.dateLimite || null },
  }), 'Stock ajouté')
  if (!ok) return
  Object.assign(nouveauLot, { quantite: 0, dateLimite: '' })
  await charger()
}
</script>

<style scoped>
.mise-en-page {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--e3);
  align-items: start;
}
.mise-en-page.avec-panneau {
  grid-template-columns: 1fr 380px;
}
.panneau {
  position: sticky;
  top: var(--e2);
  max-height: calc(100vh - 32px);
  overflow-y: auto;
}
.groupe {
  border: 0;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--e2);
}
.groupe legend {
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 8px;
  width: 100%;
}
.groupe-allergenes {
  flex-direction: column;
  gap: 6px;
}
.allergene {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--e1);
  font-size: 15px;
}
.obligatoire {
  font-size: 13px;
  color: var(--burgundy);
  font-weight: 700;
}
.lots {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
  border-top: 1px solid var(--noir);
  padding-top: var(--e2);
}
.ajout-lot {
  display: flex;
  gap: var(--e1);
  align-items: flex-end;
  flex-wrap: wrap;
}

@media (max-width: 1200px) {
  .mise-en-page.avec-panneau {
    grid-template-columns: 1fr;
  }
  .panneau {
    position: static;
    max-height: none;
  }
}
</style>
