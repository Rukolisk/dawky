<!-- pages/admin/index.vue -->
<template>
  <div class="admin-layout">

    <!-- ═══ SIDEBAR ═══ -->
    <aside class="sidebar">
      <div class="sidebar__brand">
        <div class="sidebar__logo">DAWKY</div>
        <div class="sidebar__badge">Admin</div>
      </div>

      <nav class="sidebar__nav">
        <button v-for="tab in tabs" :key="tab.id"
          :class="['sidebar__item', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id">
          <span>{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
          <span v-if="tab.badge" class="sidebar__badge-count">{{ tab.badge }}</span>
        </button>
      </nav>

      <div class="sidebar__footer">
        <div class="sidebar__user">{{ authUser?.prenom }} {{ authUser?.nom }}</div>
        <NuxtLink to="/" class="sidebar__back">← Site</NuxtLink>
      </div>
    </aside>

    <!-- ═══ CONTENU ═══ -->
    <main class="admin-main">

      <!-- ════════════════ PRODUITS ════════════════ -->
      <section v-if="activeTab === 'produits'" class="admin-section">
        <div class="section-head">
          <h1>Catalogue Produits</h1>
          <button class="btn btn-primary" @click="openCreate">+ Nouveau produit</button>
        </div>

        <div class="chips-row">
          <button v-for="f in catFilters" :key="String(f.value)"
            :class="['chip', { active: filterCat === f.value }]"
            @click="filterCat = f.value">{{ f.label }}</button>
          <label class="check-filter">
            <input v-model="onlyInvendus" type="checkbox" /> Invendus seulement
          </label>
        </div>

        <DawkySpinner v-if="produitsLoading" />

        <div v-else class="table-wrap">
          <table class="dtable">
            <thead><tr>
              <th>Produit</th><th>Catégorie</th><th>Tailles</th>
              <th>Stock</th><th>Invendu</th><th>Actif</th><th></th>
            </tr></thead>
            <tbody>
              <tr v-for="p in filteredProduits" :key="p.id"
                :class="{ 'tr-invendu': p.estInvendu, 'tr-off': !p.actif }">
                <td>
                  <span class="p-emoji">{{ p.emoji }}</span>
                  <div style="display:inline-block;vertical-align:middle">
                    <div class="p-nom">{{ p.nom }}</div>
                    <div v-if="p.moisOrigine" class="p-origine">{{ p.moisOrigine }}</div>
                  </div>
                </td>
                <td><span class="cat-chip">{{ catLabels[p.categorie] }}</span></td>
                <td>
                  <span v-for="t in p.tailles" :key="t.taille" class="size-pill">{{ t.taille }}</span>
                </td>
                <td>
                  <input type="number" min="0" :value="p.stock" class="stock-input"
                    @change="patchStock(p.id, Number(($event.target as HTMLInputElement).value))" />
                </td>
                <td>
                  <button :class="['inv-btn', p.estInvendu ? 'inv-on' : 'inv-off']"
                    @click="patchProduit(p.id, { estInvendu: !p.estInvendu })">
                    {{ p.estInvendu ? '✓' : '—' }}
                  </button>
                </td>
                <td><span :class="p.actif ? 'dot-on' : 'dot-off'">●</span></td>
                <td>
                  <button class="icon-btn" @click="openEdit(p)">✏️</button>
                  <button class="icon-btn icon-btn-del" @click="deleteProduit(p.id)">🗑</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ════════════════ BOX DU MOIS ════════════════ -->
      <section v-if="activeTab === 'boxes'" class="admin-section">
        <div class="section-head">
          <h1>Box du Mois</h1>
          <div style="display:flex;gap:.8rem;align-items:center">
            <select v-model="selectedMois" class="mois-select">
              <option v-for="m in moisList" :key="m" :value="m">{{ fmtMois(m) }}</option>
            </select>
            <button class="btn btn-outline btn-sm" @click="addNextMonth">+ Mois suivant</button>
          </div>
        </div>

        <!-- Info mois -->
        <div class="mois-info-bar">
          <span>📅 Expédition le <strong>1er {{ fmtMois(selectedMois) }}</strong></span>
          <span v-for="(n, t) in abonnesMap" :key="t">
            Taille <strong>{{ t }}</strong> : {{ n }} abonné(s)
          </span>
          <div style="margin-left:auto;display:flex;gap:.6rem;align-items:center">
            <button v-if="peutValider" class="btn btn-primary btn-sm" @click="validerMois">
              ✓ Valider les 3 boxes
            </button>
            <button v-if="peutCloturer" class="btn btn-sm" style="background:var(--danger);color:white" @click="showCloture=true">
              Clôturer ce mois
            </button>
            <span v-if="statutGlobal !== 'BROUILLON'" :class="['statut-badge', `sbadge-${statutGlobal.toLowerCase()}`]">
              {{ statutLabels[statutGlobal] }}
            </span>
          </div>
        </div>

        <!-- 3 colonnes S / M / L -->
        <div class="box-editor-grid">
          <div v-for="taille in (['XS','S','M','L'] as const)" :key="taille" class="box-col">

            <!-- En-tête colonne -->
            <div class="box-col__head">
              <span class="box-col__letter">{{ taille }}</span>
              <div>
                <div class="box-col__poids">{{ tailleDesc[taille] }}</div>
                <div class="box-col__abonnes">{{ abonnesMap[taille] ?? 0 }} abonné(s)</div>
              </div>
            </div>

            <!-- Thème -->
            <div class="box-col__body">
              <label class="field-label">Thème du mois</label>
              <input
                v-model="forms[taille].theme"
                type="text"
                class="form-input"
                placeholder="Ex: Printemps en forêt 🌸"
                :disabled="estVerrouille"
              />
            </div>

            <!-- Liste des produits ajoutés -->
            <div class="box-col__items">
              <div class="box-col__items-title">
                Produits dans la box
                <span class="items-count">{{ forms[taille].items.length }}</span>
              </div>

              <div v-if="forms[taille].items.length === 0" class="items-empty">
                Aucun produit — utilisez le sélecteur ci-dessous
              </div>

              <div v-for="(item, i) in forms[taille].items" :key="i" class="item-row">
                <span class="item-emoji">{{ getProduit(item.produitId)?.emoji ?? '📦' }}</span>
                <span class="item-nom">{{ getProduit(item.produitId)?.nom ?? item.produitId }}</span>
                <input v-model.number="item.quantite" type="number" min="1" class="item-qty" :disabled="estVerrouille" />
                <button v-if="!estVerrouille" class="item-del" @click="removeItem(taille, i)">✕</button>
              </div>
            </div>

            <!-- ─── SÉLECTEUR DE PRODUIT ─── -->
            <div v-if="!estVerrouille" class="box-col__add">
              <div class="add-label">
                ➕ Ajouter un produit dans la box {{ taille }}
              </div>

              <!-- Filtre catégorie pour le picker -->
              <div class="add-cat-filter">
                <button v-for="f in catFiltersShort" :key="String(f.value)"
                  :class="['cat-chip-btn', { active: pickerCat[taille] === f.value }]"
                  @click="pickerCat[taille] = f.value">
                  {{ f.label }}
                </button>
              </div>

              <!-- Liste de produits filtrés par taille ET catégorie -->
              <div class="add-produits-list">
                <div v-if="pickerProduits(taille).length === 0" class="picker-empty">
                  Aucun produit disponible pour la taille {{ taille }}
                </div>
                <button
                  v-for="p in pickerProduits(taille)"
                  :key="p.id"
                  :class="['picker-row', { 'picker-row--added': forms[taille].items.some(i => i.produitId === p.id), 'picker-row--invendu': p.estInvendu }]"
                  :disabled="forms[taille].items.some(i => i.produitId === p.id)"
                  @click="addItem(taille, p.id)"
                >
                  <span>{{ p.emoji }}</span>
                  <span class="picker-row__nom">{{ p.nom }}</span>
                  <span v-if="p.estInvendu" class="picker-row__inv-badge">♻️ invendu</span>
                  <span class="picker-row__stock">{{ p.stock }} en stock</span>
                  <span v-if="forms[taille].items.some(i => i.produitId === p.id)" class="picker-row__check">✓</span>
                  <span v-else class="picker-row__plus">+</span>
                </button>
              </div>
            </div>

            <!-- Bouton sauvegarder -->
            <div class="box-col__footer" v-if="!estVerrouille">
              <button class="btn btn-primary btn-full"
                :disabled="saving[taille] || forms[taille].items.length === 0"
                @click="saveBox(taille)">
                {{ saving[taille] ? 'Sauvegarde…' : '💾 Sauvegarder la box ' + taille }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ════════════════ INVENDUS ════════════════ -->
      <section v-if="activeTab === 'invendus'" class="admin-section">
        <div class="section-head">
          <h1>Invendus</h1>
          <span v-if="invendusData" class="count-badge">{{ invendusData.stockTotal }} unités</span>
        </div>

        <div class="alert alert-info" style="margin-bottom:1.5rem">
          Ces produits sont automatiquement proposés dans la <strong>Box À la Carte</strong>.
          Ils proviennent des mois précédents après clôture.
        </div>

        <DawkySpinner v-if="!invendusData" />

        <div v-else>
          <div v-if="invendusData.stockTotal === 0" class="empty-state">
            🎉 Aucun invendu — tout le stock est écoulé !
          </div>
          <div v-for="(items, mois) in invendusData.parMois" :key="mois" class="inv-groupe">
            <h3 class="inv-groupe__title">📦 {{ fmtMois(String(mois)) }}</h3>
            <div class="inv-grid">
              <div v-for="p in items" :key="p.id" class="inv-card">
                <span class="inv-card__emoji">{{ p.emoji }}</span>
                <div class="inv-card__info">
                  <div class="inv-card__nom">{{ p.nom.replace(/ \[Invendu.*\]/, '') }}</div>
                  <div style="display:flex;gap:.3rem;margin-top:.2rem">
                    <span v-for="t in p.tailles" :key="t.taille" class="size-pill">{{ t.taille }}</span>
                  </div>
                </div>
                <div class="inv-card__right">
                  <input type="number" min="0" :value="p.stock" class="stock-input"
                    @change="patchStock(p.id, Number(($event.target as HTMLInputElement).value))" />
                  <span class="inv-card__label">en stock</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ════════════════ COMMANDES ════════════════ -->
      <section v-if="activeTab === 'commandes'" class="admin-section">
        <div class="section-head"><h1>Commandes récentes</h1></div>
        <div class="table-wrap">
          <table class="dtable">
            <thead><tr><th>Client</th><th>Formule</th><th>Taille</th><th>Total</th><th>Statut</th><th>Date</th></tr></thead>
            <tbody>
              <tr v-for="c in commandes" :key="c.id">
                <td>
                  <div class="p-nom">{{ c.client.prenom }} {{ c.client.nom }}</div>
                  <div class="p-origine">{{ c.client.email }}</div>
                </td>
                <td>{{ c.formula?.nom ?? '—' }}</td>
                <td><span class="size-pill">{{ c.taille }}</span></td>
                <td style="font-weight:700;color:var(--bleu-vif)">{{ c.total.toFixed(2) }}€</td>
                <td><span :class="['s-chip', `s-${c.statut.toLowerCase()}`]">{{ statutCmd[c.statut] }}</span></td>
                <td style="color:var(--muted);font-size:.8rem">{{ new Date(c.createdAt).toLocaleDateString('fr-FR') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </main>

    <!-- ═══ MODAL PRODUIT ═══ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="modal.open" class="modal-bg" @click.self="modal.open = false">
          <div class="modal-box card">
            <div class="modal-head">
              <h2>{{ modal.mode === 'create' ? 'Nouveau produit' : 'Modifier le produit' }}</h2>
              <button @click="modal.open = false">✕</button>
            </div>
            <form @submit.prevent="saveProduit">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Emoji</label>
                  <input v-model="modal.f.emoji" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Nom *</label>
                  <input v-model="modal.f.nom" class="form-input" required />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Description *</label>
                <textarea v-model="modal.f.description" class="form-textarea" required />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Catégorie *</label>
                  <select v-model="modal.f.categorie" class="form-select" required>
                    <option v-for="c in categories" :key="c.v" :value="c.v">{{ c.l }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Stock</label>
                  <input v-model.number="modal.f.stock" type="number" min="0" class="form-input" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Tailles disponibles *</label>
                <div style="display:flex;gap:1.2rem;margin-top:.3rem">
                  <label v-for="t in ['XS','S','M','L']" :key="t" style="display:flex;align-items:center;gap:.35rem;font-weight:500;cursor:pointer">
                    <input v-model="modal.f.tailles" type="checkbox" :value="t" /> {{ t }}
                  </label>
                </div>
              </div>
              <div style="display:flex;gap:1.5rem;margin-top:.5rem">
                <label style="display:flex;align-items:center;gap:.35rem;font-size:.88rem;cursor:pointer">
                  <input v-model="modal.f.estInvendu" type="checkbox" /> Marquer invendu
                </label>
                <label style="display:flex;align-items:center;gap:.35rem;font-size:.88rem;cursor:pointer">
                  <input v-model="modal.f.actif" type="checkbox" /> Actif
                </label>
              </div>
              <div v-if="modal.err" class="alert alert-error" style="margin-top:1rem">{{ modal.err }}</div>
              <div class="modal-foot">
                <button type="button" class="btn btn-outline" @click="modal.open = false">Annuler</button>
                <button type="submit" class="btn btn-primary" :disabled="modal.saving">
                  {{ modal.saving ? '…' : 'Enregistrer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>

      <!-- Modal clôture -->
      <Transition name="modal">
        <div v-if="showCloture" class="modal-bg" @click.self="showCloture = false">
          <div class="modal-box card" style="max-width:460px">
            <div class="modal-head">
              <h2>Clôturer {{ fmtMois(selectedMois) }}</h2>
              <button @click="showCloture = false">✕</button>
            </div>
            <p style="color:var(--muted);line-height:1.7;margin-bottom:1.2rem">
              La clôture calcule les invendus et les ajoute au catalogue <strong>Box À la Carte</strong>.
              Cette action est irréversible.
            </p>
            <div v-if="clotureErr" class="alert alert-error">{{ clotureErr }}</div>
            <div class="modal-foot">
              <button class="btn btn-outline" @click="showCloture = false">Annuler</button>
              <button class="btn btn-primary" style="background:var(--danger)" :disabled="cloturing" @click="cloturerMois">
                {{ cloturing ? 'Clôture…' : 'Confirmer' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <DawkyToast />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: false })
useSeoMeta({ title: 'Admin — Dawky' })

const { user: authUser } = useAuth()
const { success: ok, error: nok } = useToast()

function H() { return { 'x-supabase-uid': (authUser.value as any)?.supabaseUid ?? '' } }

// ─── Tabs ───
const activeTab = ref<'produits'|'boxes'|'invendus'|'commandes'>('produits')
const tabs = computed(() => [
  { id: 'produits'  as const, icon: '📦', label: 'Produits' },
  { id: 'boxes'     as const, icon: '🗓️', label: 'Box du Mois' },
  { id: 'invendus'  as const, icon: '♻️', label: 'Invendus', badge: invendusBadge.value },
  { id: 'commandes' as const, icon: '🛒', label: 'Commandes' },
])

// ─── Constantes ───
const catFilters = [
  { value: undefined, label: 'Tous' },
  { value: 'MASTICATION', label: '🦌 Mastication' },
  { value: 'NUTRITION',   label: '🍖 Nutrition' },
  { value: 'JOUET',       label: '🎾 Jouets' },
  { value: 'SOIN',        label: '🧴 Soins' },
  { value: 'ACCESSOIRE',  label: '🎀 Accessoires' },
]
const catFiltersShort = [
  { value: undefined,     label: 'Tous' },
  { value: 'MASTICATION', label: '🦌' },
  { value: 'NUTRITION',   label: '🍖' },
  { value: 'JOUET',       label: '🎾' },
  { value: 'SOIN',        label: '🧴' },
  { value: 'ACCESSOIRE',  label: '🎀' },
]
const catLabels: Record<string,string> = { MASTICATION:'🦌 Mast.', NUTRITION:'🍖 Nutr.', JOUET:'🎾 Jouet', SOIN:'🧴 Soin', ACCESSOIRE:'🎀 Acc.' }
const categories = [ {v:'MASTICATION',l:'🦌 Mastication'},{v:'NUTRITION',l:'🍖 Nutrition'},{v:'JOUET',l:'🎾 Jouets'},{v:'SOIN',l:'🧴 Soins'},{v:'ACCESSOIRE',l:'🎀 Accessoires'} ]
const tailleDesc: Record<string,string> = { XS:'≤ 4 kg', S:'4–10 kg', M:'10–25 kg', L:'> 25 kg' }
const statutLabels: Record<string,string> = { BROUILLON:'Brouillon', VALIDEE:'✓ Validée', EXPEDIEE:'🚚 Expédiée', CLOTUREE:'Clôturée' }
const statutCmd: Record<string,string> = { EN_ATTENTE:'⏳', CONFIRMEE:'✓', PREPAREE:'📦', EXPEDIEE:'🚚', LIVREE:'✅', ANNULEE:'❌' }

// ══════════════ PRODUITS ══════════════
type Produit = { id:string; nom:string; description:string; emoji:string; categorie:string; stock:number; estInvendu:boolean; actif:boolean; moisOrigine:string|null; tailles:{taille:string}[] }

const produits        = ref<Produit[]>([])
const produitsLoading = ref(true)
const filterCat       = ref<string|undefined>(undefined)
const onlyInvendus    = ref(false)

const filteredProduits = computed(() =>
  produits.value.filter(p => {
    if (filterCat.value && p.categorie !== filterCat.value) return false
    if (onlyInvendus.value && !p.estInvendu) return false
    return true
  })
)

const modal = reactive({
  open: false, mode: 'create' as 'create'|'edit', editId: '',
  saving: false, err: '',
  f: { nom:'', description:'', emoji:'📦', categorie:'JOUET', tailles:[] as string[], stock:0, estInvendu:false, actif:true },
})

function openCreate() {
  modal.mode = 'create'
  modal.f = { nom:'', description:'', emoji:'📦', categorie:'JOUET', tailles:[], stock:0, estInvendu:false, actif:true }
  modal.err = ''; modal.open = true
}
function openEdit(p: Produit) {
  modal.mode = 'edit'; modal.editId = p.id
  modal.f = { nom:p.nom, description:p.description, emoji:p.emoji, categorie:p.categorie, tailles:p.tailles.map(t=>t.taille), stock:p.stock, estInvendu:p.estInvendu, actif:p.actif }
  modal.err = ''; modal.open = true
}
async function saveProduit() {
  modal.saving = true; modal.err = ''
  try {
    if (modal.mode === 'create') {
      const r = await $fetch<any>('/api/admin/produits', { method:'POST', body:modal.f, headers:H() })
      produits.value.unshift(r.data); ok('Produit créé ✓')
    } else {
      const r = await $fetch<any>(`/api/admin/produits/${modal.editId}`, { method:'PUT', body:modal.f, headers:H() })
      const i = produits.value.findIndex(p=>p.id===modal.editId)
      if (i !== -1) produits.value[i] = r.data; ok('Mis à jour ✓')
    }
    modal.open = false
  } catch(e:any) { modal.err = e?.data?.statusMessage ?? 'Erreur' }
  finally { modal.saving = false }
}
async function patchProduit(id:string, data:Partial<Produit>) {
  try {
    const r = await $fetch<any>(`/api/admin/produits/${id}`, { method:'PUT', body:data, headers:H() })
    const i = produits.value.findIndex(p=>p.id===id)
    if (i !== -1) produits.value[i] = r.data
    if ('estInvendu' in data) await loadInvendus()
  } catch { nok('Erreur') }
}
async function patchStock(id:string, stock:number) {
  await patchProduit(id, { stock } as any)
}
async function deleteProduit(id:string) {
  if (!confirm('Désactiver ?')) return
  await patchProduit(id, { actif:false } as any)
  ok('Désactivé')
}

// ══════════════ BOX DU MOIS ══════════════
type BoxData = { id:string; mois:string; taille:'XS'|'S'|'M'|'L'; theme:string|null; statut:string; items:{id:string;produitId:string;quantite:number}[] }

function nowMois() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}
function fmtMois(m:string) {
  if (!m) return ''
  const [y,mo] = m.split('-')
  return new Date(Number(y), Number(mo)-1).toLocaleDateString('fr-FR', {month:'long',year:'numeric'})
}

const moisList      = ref<string[]>([nowMois()])
const selectedMois  = ref(nowMois())
const boxesData     = ref<BoxData[]>([])
const abonnesMap    = ref<Record<string,number>>({})
const saving        = reactive<Record<string,boolean>>({ S:false, M:false, L:false })
const pickerCat     = reactive<Record<string,string|undefined>>({ S:undefined, M:undefined, L:undefined })

// Formulaires des 3 boxes
const forms = reactive<Record<'XS'|'S'|'M'|'L',{theme:string;items:{produitId:string;quantite:number}[]}>>({
  XS: { theme:'', items:[] },
  S: { theme:'', items:[] },
  M: { theme:'', items:[] },
  L: { theme:'', items:[] },
})

const statutGlobal = computed(() => {
  const ss = boxesData.value.map(b=>b.statut)
  if (ss.includes('CLOTUREE')) return 'CLOTUREE'
  if (ss.includes('EXPEDIEE')) return 'EXPEDIEE'
  if (ss.length === 4 && ss.every(s=>s==='VALIDEE')) return 'VALIDEE'
  return 'BROUILLON'
})
const estVerrouille = computed(() => ['VALIDEE','EXPEDIEE','CLOTUREE'].includes(statutGlobal.value))
const peutValider   = computed(() => statutGlobal.value === 'BROUILLON' && boxesData.value.length === 4 && boxesData.value.every(b=>b.items.length > 0))
const peutCloturer  = computed(() => ['BROUILLON','VALIDEE','EXPEDIEE'].includes(statutGlobal.value) && boxesData.value.length > 0)

// Produits disponibles pour une taille + filtre catégorie
function pickerProduits(taille:'XS'|'S'|'M'|'L') {
  const filtered = produits.value.filter(p => {
    if (!p.actif || p.stock <= 0) return false
    if (!p.tailles.some(t=>t.taille===taille)) return false
    if (pickerCat[taille]) return p.categorie === pickerCat[taille]
    return true
  })
  // Invendus en tête de liste pour les retrouver facilement
  return [
    ...filtered.filter(p => p.estInvendu),
    ...filtered.filter(p => !p.estInvendu),
  ]
}

function getProduit(id:string) { return produits.value.find(p=>p.id===id) }

function addItem(taille:'XS'|'S'|'M'|'L', produitId:string) {
  if (forms[taille].items.find(i=>i.produitId===produitId)) return
  forms[taille].items.push({ produitId, quantite:1 })
}
function removeItem(taille:'XS'|'S'|'M'|'L', idx:number) {
  forms[taille].items.splice(idx, 1)
}

async function saveBox(taille:'XS'|'S'|'M'|'L') {
  if (forms[taille].items.length === 0) { nok('Ajoutez au moins un produit'); return }
  saving[taille] = true
  try {
    await $fetch('/api/admin/boxes-mensuelles', {
      method:'POST', headers:H(),
      body: { mois:selectedMois.value, taille, theme:forms[taille].theme||undefined, items:forms[taille].items },
    })
    ok(`Box ${taille} sauvegardée ✓`)
    await loadBoxes()
  } catch(e:any) { nok(e?.data?.statusMessage ?? 'Erreur') }
  finally { saving[taille] = false }
}

async function validerMois() {
  try {
    const r = await $fetch<any>('/api/admin/boxes-mensuelles/valider', { method:'POST', headers:H(), body:{ mois:selectedMois.value } })
    ok(r.message)
    await loadBoxes()
  } catch(e:any) { nok(e?.data?.statusMessage ?? 'Erreur') }
}

const showCloture = ref(false)
const cloturing   = ref(false)
const clotureErr  = ref('')
async function cloturerMois() {
  cloturing.value = true; clotureErr.value = ''
  try {
    const r = await $fetch<any>('/api/admin/boxes-mensuelles/cloturer', { method:'POST', headers:H(), body:{ mois:selectedMois.value } })
    ok(r.message)
    showCloture.value = false
    // Recharger les produits : les nouvelles entrées inv_... doivent apparaître dans le picker
    const pd = await $fetch<any>('/api/admin/produits', { headers:H() })
    produits.value = pd.data
    await loadBoxes()
    await loadInvendus()
    activeTab.value = 'invendus'
  } catch(e:any) { clotureErr.value = e?.data?.statusMessage ?? 'Erreur' }
  finally { cloturing.value = false }
}

function addNextMonth() {
  const last = moisList.value[moisList.value.length - 1]
  const [y,m] = last.split('-').map(Number)
  const next = m===12 ? `${y+1}-01` : `${y}-${String(m+1).padStart(2,'0')}`
  if (!moisList.value.includes(next)) moisList.value.push(next)
  selectedMois.value = next
}

async function loadBoxes() {
  try {
    const r = await $fetch<any>('/api/admin/boxes-mensuelles', { params:{ mois:selectedMois.value }, headers:H() })
    boxesData.value = r.data.boxes
    abonnesMap.value = r.data.abonnesMap

    for (const t of ['XS','S','M','L'] as const) {
      const box = boxesData.value.find(b=>b.taille===t)
      if (box) {
        forms[t].theme = box.theme ?? ''
        forms[t].items = box.items.map(i=>({ produitId:i.produitId, quantite:i.quantite }))
      } else {
        forms[t].theme = ''; forms[t].items = []
      }
    }
  } catch { /* silencieux */ }
}

watch(selectedMois, loadBoxes)

// ══════════════ INVENDUS ══════════════
type InvData = { invendus:any[]; parMois:Record<string,any[]>; stockTotal:number }
const invendusData  = ref<InvData|null>(null)
const invendusBadge = computed(() => invendusData.value?.stockTotal ? String(invendusData.value.stockTotal) : undefined)

async function loadInvendus() {
  try {
    const r = await $fetch<any>('/api/admin/invendus', { headers:H() })
    invendusData.value = r.data
  } catch { /* silencieux */ }
}

// ══════════════ COMMANDES ══════════════
const commandes = ref<any[]>([])

// ══════════════ INIT ══════════════
// Attendre que l'auth soit prête avant de charger
watch(() => authUser.value?.id, async (uid) => {
  if (!uid) return
  produitsLoading.value = true
  try {
    const r = await $fetch<any>('/api/admin/produits', { headers:H() })
    produits.value = r.data
  } catch { nok('Erreur chargement produits') }
  finally { produitsLoading.value = false }

  await Promise.all([loadBoxes(), loadInvendus()])

  try {
    const r = await $fetch<any>('/api/admin/commandes', { headers:H() })
    commandes.value = r.data
  } catch { /* silencieux */ }

  // Récupérer les mois existant en base
  try {
    const r = await $fetch<any>('/api/admin/boxes-mensuelles', { headers:H() })
    const ms = [...new Set(r.data.boxes.map((b:any) => b.mois) as string[])].sort()
    for (const m of ms) if (!moisList.value.includes(m)) moisList.value.push(m)
    moisList.value.sort()
  } catch { /* silencieux */ }
}, { immediate: true })
</script>

<style scoped>
/* Layout */
.admin-layout { display:flex; min-height:100vh; font-family:var(--font-body); background:#F5F2EC; }

/* Sidebar */
.sidebar { width:210px;flex-shrink:0;background:var(--nuit);color:var(--neige);display:flex;flex-direction:column;padding:1.5rem 1rem;position:sticky;top:0;height:100vh;overflow-y:auto; }
.sidebar__brand { margin-bottom:1.5rem; }
.sidebar__logo { font-family:var(--font-display);font-size:1.5rem;font-weight:900;color:var(--bleu-vif); }
.sidebar__badge { font-size:.63rem;background:rgba(212,136,59,.25);color:var(--bleu-vif);padding:.1rem .5rem;border-radius:40px;display:inline-block;letter-spacing:.1em;text-transform:uppercase;font-weight:600;margin-top:.3rem; }
.sidebar__nav { display:flex;flex-direction:column;gap:.3rem;flex:1; }
.sidebar__item { display:flex;align-items:center;gap:.65rem;padding:.65rem .9rem;border-radius:10px;border:none;background:transparent;color:rgba(245,239,224,.5);font-size:.87rem;font-weight:500;cursor:pointer;transition:all .2s;text-align:left;font-family:var(--font-body); }
.sidebar__item:hover { background:rgba(255,255,255,.07);color:var(--neige); }
.sidebar__item.active { background:var(--bleu-vif);color:var(--nuit); }
.sidebar__badge-count { margin-left:auto;background:var(--danger);color:white;font-size:.63rem;font-weight:700;padding:.15rem .45rem;border-radius:40px;min-width:18px;text-align:center; }
.sidebar__item.active .sidebar__badge-count { background:var(--nuit); }
.sidebar__footer { border-top:1px solid rgba(255,255,255,.1);padding-top:1rem; }
.sidebar__user { font-size:.78rem;color:rgba(245,239,224,.45);margin-bottom:.35rem; }
.sidebar__back { font-size:.78rem;color:var(--bleu-vif); }

/* Main */
.admin-main { flex:1;overflow-y:auto; }
.admin-section { padding:2rem 2.5rem; }

/* Section head */
.section-head { display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem; }
.section-head h1 { font-family:var(--font-display);font-size:1.7rem;font-weight:900;color:var(--nuit); }
.count-badge { background:var(--bleu-vif);color:var(--nuit);padding:.3rem .9rem;border-radius:40px;font-size:.82rem;font-weight:600; }
.empty-state { text-align:center;padding:3rem;color:var(--muted);font-size:1rem; }

/* Chips filters */
.chips-row { display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;margin-bottom:1.2rem; }
.chip { padding:.32rem .85rem;border-radius:40px;border:1.5px solid var(--brume);background:white;font-size:.8rem;color:var(--muted);cursor:pointer;font-family:var(--font-body);transition:all .15s; }
.chip.active, .chip:hover { background:var(--nuit);color:var(--neige);border-color:var(--nuit); }
.check-filter { display:flex;align-items:center;gap:.4rem;font-size:.82rem;color:var(--muted);cursor:pointer;margin-left:.5rem; }

/* Table */
.table-wrap { background:white;border-radius:18px;border:1.5px solid var(--brume);overflow:hidden;overflow-x:auto; }
.dtable { width:100%;border-collapse:collapse;font-size:.87rem; }
.dtable thead { background:var(--neige); }
.dtable th { padding:.8rem 1.2rem;text-align:left;font-size:.72rem;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);font-weight:500; }
.dtable td { padding:.8rem 1.2rem;border-top:1px solid var(--neige);vertical-align:middle; }
.dtable tbody tr:hover { background:#FDFAF4; }
.tr-invendu { background:#FFFBF0 !important; }
.tr-off { opacity:.5; }
.p-emoji { font-size:1.4rem;vertical-align:middle;margin-right:.5rem; }
.p-nom { font-weight:500;color:var(--nuit);font-size:.87rem; }
.p-origine { font-size:.7rem;color:var(--bleu-vif);background:rgba(212,136,59,.12);padding:.1rem .5rem;border-radius:40px;display:inline-block;margin-top:.2rem; }
.cat-chip { background:var(--brume);padding:.2rem .6rem;border-radius:20px;font-size:.74rem;color:var(--nuit); }
.size-pill { background:var(--brume);padding:.15rem .5rem;border-radius:4px;font-size:.7rem;font-weight:700;color:var(--nuit);margin-right:.2rem; }
.stock-input { width:62px;padding:.3rem .45rem;border-radius:8px;border:1.5px solid var(--brume);background:var(--neige);font-size:.85rem;text-align:center;font-family:var(--font-body); }
.inv-btn { padding:.2rem .65rem;border-radius:20px;border:none;font-size:.75rem;font-weight:600;cursor:pointer;font-family:var(--font-body); }
.inv-on { background:#EDF4E5;color:#2D6A1F; }
.inv-off { background:var(--brume);color:var(--muted); }
.dot-on { color:var(--menthe);font-size:1rem; }
.dot-off { color:var(--muted);font-size:1rem; }
.icon-btn { width:30px;height:30px;border-radius:8px;border:1.5px solid var(--brume);background:white;cursor:pointer;font-size:.85rem;transition:background .15s;margin-right:.3rem; }
.icon-btn:hover { background:var(--neige); }
.icon-btn-del:hover { background:#FBE9E7; }
.s-chip { padding:.2rem .7rem;border-radius:20px;font-size:.75rem;font-weight:500; }
.s-en_attente{background:#FFF8E7;color:#8A6200}.s-confirmee{background:#EDF4E5;color:#2D6A1F}.s-expediee{background:#E5EDF4;color:#1A4A7A}.s-livree{background:#EDF4E5;color:#2D6A1F}.s-annulee{background:#FBE9E7;color:#9B2C2C}

/* Mois info bar */
.mois-select { padding:.5rem .9rem;border-radius:8px;border:1.5px solid var(--brume);background:white;font-family:var(--font-body);font-size:.88rem; }
.mois-info-bar { display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;background:white;border-radius:14px;border:1.5px solid var(--brume);padding:1rem 1.5rem;margin-bottom:1.5rem;font-size:.88rem;color:var(--muted); }
.mois-info-bar strong { color:var(--nuit); }
.statut-badge { padding:.28rem .85rem;border-radius:40px;font-size:.78rem;font-weight:600; }
.sbadge-validee{background:#EDF4E5;color:#2D6A1F}.sbadge-expediee{background:#E5EDF4;color:#1A4A7A}.sbadge-cloturee{background:var(--brume);color:var(--nuit)}

/* Box editor */
.box-editor-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem; }
.box-col { background:white;border-radius:18px;border:1.5px solid var(--brume);overflow:hidden;display:flex;flex-direction:column; }
.box-col__head { display:flex;align-items:center;gap:.7rem;background:var(--nuit);color:var(--neige);padding:.9rem 1.2rem; }
.box-col__letter { font-family:var(--font-display);font-size:1.8rem;font-weight:900;color:var(--bleu-vif);line-height:1; }
.box-col__poids { font-size:.75rem;opacity:.7; }
.box-col__abonnes { font-size:.7rem;background:rgba(212,136,59,.3);color:var(--bleu-vif);padding:.12rem .5rem;border-radius:40px;margin-top:.2rem;display:inline-block; }
.box-col__body { padding:.8rem 1rem; }
.field-label { font-size:.75rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;display:block;margin-bottom:.4rem; }

/* Items list */
.box-col__items { padding:.5rem 1rem;flex:1; }
.box-col__items-title { font-size:.75rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem; }
.items-count { background:var(--bleu-vif);color:var(--nuit);font-size:.68rem;font-weight:700;padding:.1rem .5rem;border-radius:40px; }
.items-empty { font-size:.8rem;color:var(--muted);text-align:center;padding:.8rem 0;background:var(--neige);border-radius:8px; }
.item-row { display:flex;align-items:center;gap:.5rem;padding:.4rem 0;border-bottom:1px solid var(--neige);font-size:.83rem; }
.item-emoji { font-size:1.2rem;flex-shrink:0; }
.item-nom { flex:1;font-weight:500;color:var(--nuit); }
.item-qty { width:46px;padding:.2rem .4rem;border-radius:6px;border:1px solid var(--brume);text-align:center;font-family:var(--font-body);font-size:.8rem; }
.item-del { width:20px;height:20px;border-radius:50%;border:none;background:#FBE9E7;color:var(--danger);cursor:pointer;font-size:.7rem;flex-shrink:0; }

/* Picker de produit */
.box-col__add { border-top:2px dashed var(--bleu-vif);margin:.5rem 0;padding:.8rem 1rem; }
.add-label { font-size:.78rem;font-weight:700;color:var(--bleu-vif);text-transform:uppercase;letter-spacing:.07em;margin-bottom:.6rem; }
.add-cat-filter { display:flex;gap:.35rem;flex-wrap:wrap;margin-bottom:.6rem; }
.cat-chip-btn { padding:.25rem .55rem;border-radius:40px;border:1.5px solid var(--brume);background:white;font-size:.8rem;cursor:pointer;font-family:var(--font-body);transition:all .15s; }
.cat-chip-btn.active { background:var(--nuit);color:var(--neige);border-color:var(--nuit); }
.add-produits-list { max-height:200px;overflow-y:auto;display:flex;flex-direction:column;gap:.3rem; }
.picker-empty { font-size:.8rem;color:var(--muted);text-align:center;padding:.5rem; }
.picker-row { display:flex;align-items:center;gap:.55rem;padding:.5rem .7rem;border-radius:8px;border:1.5px solid var(--brume);background:white;cursor:pointer;font-family:var(--font-body);font-size:.83rem;transition:all .15s;text-align:left;width:100%; }
.picker-row:hover:not(:disabled) { border-color:var(--bleu-vif);background:#FFF4E6; }
.picker-row--added { background:#EDF4E5;border-color:var(--menthe);cursor:default; }
.picker-row--invendu { border-color:#D4883B;background:#FFFBF0; }
.picker-row--invendu:hover:not(:disabled) { background:#FFF4E6;border-color:var(--bleu-vif); }
.picker-row__inv-badge { font-size:.68rem;background:rgba(212,136,59,.2);color:var(--bleu-vif);padding:.1rem .4rem;border-radius:40px;flex-shrink:0; }
.picker-row:disabled { opacity:.6;cursor:default; }
.picker-row__nom { flex:1;font-weight:500;color:var(--nuit); }
.picker-row__stock { font-size:.72rem;color:var(--muted); }
.picker-row__check { color:var(--menthe);font-weight:700; }
.picker-row__plus { color:var(--bleu-vif);font-weight:700;font-size:1.1rem; }

.box-col__footer { padding:.8rem 1rem;border-top:1px solid var(--neige); }

/* Invendus */
.inv-groupe { margin-bottom:2rem; }
.inv-groupe__title { font-family:var(--font-display);font-size:1.1rem;font-weight:700;margin-bottom:1rem;color:var(--nuit); }
.inv-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem; }
.inv-card { background:white;border-radius:14px;border:1.5px solid var(--brume);padding:.9rem 1rem;display:flex;align-items:center;gap:.8rem; }
.inv-card__emoji { font-size:1.8rem;flex-shrink:0; }
.inv-card__nom { font-weight:600;font-size:.87rem;color:var(--nuit);margin-bottom:.25rem; }
.inv-card__info { flex:1; }
.inv-card__right { display:flex;flex-direction:column;align-items:center;gap:.2rem; }
.inv-card__label { font-size:.68rem;color:var(--muted); }

/* Modal */
.modal-bg { position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:1000;padding:1rem; }
.modal-box { width:100%;max-width:520px;padding:2rem;max-height:90vh;overflow-y:auto;background:white;border-radius:24px; }
.modal-head { display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem; }
.modal-head h2 { font-family:var(--font-display);font-size:1.3rem;font-weight:700; }
.modal-head button { width:30px;height:30px;border-radius:50%;border:1.5px solid var(--brume);background:white;cursor:pointer; }
.modal-foot { display:flex;gap:1rem;justify-content:flex-end;margin-top:1.5rem; }
.form-row { display:grid;grid-template-columns:1fr 1fr;gap:1rem; }
.modal-enter-active,.modal-leave-active{transition:opacity .2s}
.modal-enter-from,.modal-leave-to{opacity:0}

@media(max-width:1000px){.box-editor-grid{grid-template-columns:1fr}.sidebar{display:none}}
</style>
