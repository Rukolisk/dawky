<template>
  <div class="admin-page">

    <!-- Header admin -->
    <div class="admin-header">
      <div class="container admin-header-inner">
        <div class="admin-logo-row">
          <img :src="images.logo_dawky_blanc" alt="Dawky" class="admin-logo" />
          <span class="admin-badge">⚙️ Admin</span>
        </div>
        <div class="admin-user">
          <span class="text-white text-sm">{{ profile?.prenom }} {{ profile?.nom }}</span>
          <button class="btn btn-white btn-sm" @click="signOut">Déconnexion</button>
        </div>
      </div>
    </div>

    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <nav class="admin-nav">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="admin-nav-item"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <span class="admin-nav-icon">{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
            <span v-if="tab.badge" class="admin-nav-badge">{{ tab.badge }}</span>
          </button>
        </nav>
      </aside>

      <!-- Main -->
      <main class="admin-main">

        <!-- ═══ OVERVIEW ═════════════════════════════ -->
        <div v-if="activeTab === 'overview'" class="admin-section animate-fade-in-up">
          <h2 class="admin-section-title">Tableau de bord</h2>
          <div class="kpi-grid">
            <div v-for="kpi in kpis" :key="kpi.label" class="kpi-card">
              <div class="kpi-icon">{{ kpi.icon }}</div>
              <div class="kpi-value">{{ kpi.value }}</div>
              <div class="kpi-label">{{ kpi.label }}</div>
            </div>
          </div>

          <!-- Actions rapides -->
          <h3 class="admin-subtitle">Actions rapides</h3>
          <div class="quick-actions">
            <button class="quick-action" @click="activeTab = 'boxes'">
              <span>📦</span> <span>Gérer les box du mois</span>
            </button>
            <button class="quick-action" @click="activeTab = 'produits'">
              <span>🛒</span> <span>Ajouter un produit</span>
            </button>
            <button class="quick-action" @click="activeTab = 'commandes'">
              <span>📋</span> <span>Voir les commandes</span>
            </button>
            <button class="quick-action" @click="activeTab = 'invendus'">
              <span>🏷️</span> <span>Gérer les invendus</span>
            </button>
          </div>
        </div>

        <!-- ═══ BOX MENSUELLES ════════════════════════ -->
        <div v-if="activeTab === 'boxes'" class="admin-section animate-fade-in-up">
          <div class="admin-section-header">
            <h2 class="admin-section-title">📦 Box Mensuelles</h2>
            <button class="btn btn-primary btn-sm" @click="openCreateBox = true">+ Créer une box</button>
          </div>

          <!-- Filtre mois -->
          <div class="admin-filters">
            <input v-model="filterMois" type="month" class="form-input admin-filter-input" />
          </div>

          <!-- Loading -->
          <div v-if="boxesLoading" class="admin-loading">Chargement…</div>

          <!-- Boxes grid -->
          <div v-else class="boxes-admin-grid">
            <div v-for="box in boxesMensuelles" :key="box.id" class="box-admin-card">
              <div class="box-admin-header">
                <div class="box-admin-taille">{{ box.taille }}</div>
                <span class="badge" :class="statutBoxColor[box.statut]">{{ statutBoxLabel[box.statut] }}</span>
              </div>
              <div class="box-admin-mois">{{ formatMois(box.mois) }}</div>
              <div v-if="box.theme" class="box-admin-theme">🎨 {{ box.theme }}</div>
              <div class="box-admin-items">
                <span v-for="item in box.items?.slice(0, 3)" :key="item.id" class="box-item-chip">
                  {{ item.produit?.emoji }} {{ item.produit?.nom }}
                </span>
                <span v-if="(box.items?.length ?? 0) > 3" class="box-item-more">+{{ box.items.length - 3 }}</span>
              </div>
              <div class="box-admin-actions">
                <button
                  v-if="box.statut === 'BROUILLON'"
                  class="btn btn-primary btn-sm"
                  @click="validerBox(box.id)"
                >
                  ✅ Valider
                </button>
                <button
                  v-if="box.statut === 'VALIDEE'"
                  class="btn btn-yellow btn-sm"
                  @click="cloturerBox(box.id)"
                >
                  🔒 Clôturer
                </button>
              </div>
            </div>
            <div v-if="boxesMensuelles.length === 0" class="admin-empty">
              Aucune box pour ce mois. <button class="link-btn" @click="openCreateBox = true">En créer une ?</button>
            </div>
          </div>
        </div>

        <!-- ═══ PRODUITS ═══════════════════════════════ -->
        <div v-if="activeTab === 'produits'" class="admin-section animate-fade-in-up">
          <div class="admin-section-header">
            <h2 class="admin-section-title">🛒 Produits</h2>
            <button class="btn btn-primary btn-sm" @click="openProduitForm = !openProduitForm">
              {{ openProduitForm ? 'Annuler' : '+ Ajouter' }}
            </button>
          </div>

          <!-- Formulaire ajout -->
          <div v-if="openProduitForm" class="admin-form-panel animate-fade-in-up">
            <h3 class="admin-subtitle">{{ editProduit ? 'Modifier le produit' : 'Nouveau produit' }}</h3>
            <div class="admin-form-grid">
              <div class="form-group">
                <label class="form-label">Nom *</label>
                <input v-model="produitForm.nom" type="text" class="form-input" placeholder="Ex: Bois de cerf taille S" />
              </div>
              <div class="form-group">
                <label class="form-label">Emoji</label>
                <input v-model="produitForm.emoji" type="text" class="form-input" placeholder="🦌" maxlength="4" />
              </div>
              <div class="form-group" style="grid-column:1/-1">
                <label class="form-label">Description *</label>
                <textarea v-model="produitForm.description" class="form-textarea" rows="2" placeholder="Description du produit…" />
              </div>
              <div class="form-group">
                <label class="form-label">Catégorie *</label>
                <select v-model="produitForm.categorie" class="form-select">
                  <option value="">— Choisir —</option>
                  <option v-for="c in categoriesAdmin" :key="c.value" :value="c.value">{{ c.icon }} {{ c.label }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Stock initial</label>
                <input v-model.number="produitForm.stock" type="number" class="form-input" min="0" placeholder="0" />
              </div>
              <div class="form-group" style="grid-column:1/-1">
                <label class="form-label">Tailles disponibles</label>
                <div class="taille-checkboxes">
                  <label v-for="t in ['XS','S','M','L']" :key="t" class="taille-check-label">
                    <input type="checkbox" :value="t" v-model="produitForm.tailles" />
                    {{ t }}
                  </label>
                </div>
              </div>
            </div>
            <div class="admin-form-actions">
              <button class="btn btn-primary" :disabled="produitLoading" @click="saveProduit">
                {{ produitLoading ? 'Sauvegarde…' : editProduit ? '💾 Modifier' : '✅ Ajouter le produit' }}
              </button>
              <button class="btn btn-ghost" @click="resetProduitForm">Annuler</button>
            </div>
          </div>

          <!-- Table produits -->
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Catégorie</th>
                  <th>Tailles</th>
                  <th>Stock</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in produitsAdmin" :key="p.id">
                  <td class="produit-cell">
                    <span class="produit-cell-emoji">{{ p.emoji }}</span>
                    <div>
                      <p class="font-semibold">{{ p.nom }}</p>
                      <p class="text-xs text-muted produit-desc-trunc">{{ p.description }}</p>
                    </div>
                  </td>
                  <td>
                    <span class="badge" :class="catColors[p.categorie]">{{ catLabels[p.categorie] }}</span>
                  </td>
                  <td>
                    <div class="taille-chips">
                      <span v-for="t in p.tailles" :key="t.taille" class="size-chip size-chip-sm">{{ t.taille }}</span>
                    </div>
                  </td>
                  <td>
                    <span :class="p.stock < 5 ? 'text-rose font-semibold' : ''">{{ p.stock }}</span>
                  </td>
                  <td>
                    <span class="badge" :class="p.actif ? 'badge-green' : 'badge-rose'">{{ p.actif ? 'Actif' : 'Inactif' }}</span>
                  </td>
                  <td>
                    <div class="row-actions">
                      <button class="btn btn-ghost btn-sm" @click="startEditProduit(p)">✏️</button>
                      <button class="btn btn-ghost btn-sm" @click="deleteProduit(p.id)">🗑️</button>
                    </div>
                  </td>
                </tr>
                <tr v-if="produitsAdmin.length === 0">
                  <td colspan="6" class="admin-empty">Aucun produit.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ═══ COMMANDES ═══════════════════════════════ -->
        <div v-if="activeTab === 'commandes'" class="admin-section animate-fade-in-up">
          <h2 class="admin-section-title">📋 Commandes</h2>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Client</th>
                  <th>Formule</th>
                  <th>Taille</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in commandesAdmin" :key="c.id">
                  <td class="font-mono text-sm">#{{ c.id.slice(-8).toUpperCase() }}</td>
                  <td>
                    <div>
                      <p class="font-semibold text-sm">{{ c.client?.prenom }} {{ c.client?.nom }}</p>
                      <p class="text-xs text-muted">{{ c.client?.email }}</p>
                    </div>
                  </td>
                  <td class="text-sm">{{ c.formula?.nom }}</td>
                  <td><span class="size-chip">{{ c.taille }}</span></td>
                  <td class="font-semibold">{{ c.total?.toFixed(2) }}&nbsp;€</td>
                  <td><span class="badge" :class="statutColor[c.statut]">{{ statutLabel[c.statut] }}</span></td>
                  <td class="text-sm text-muted">{{ formatDate(c.createdAt) }}</td>
                </tr>
                <tr v-if="commandesAdmin.length === 0">
                  <td colspan="7" class="admin-empty">Aucune commande.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ═══ INVENDUS ══════════════════════════════ -->
        <div v-if="activeTab === 'invendus'" class="admin-section animate-fade-in-up">
          <h2 class="admin-section-title">🏷️ Invendus (Box À la Carte)</h2>
          <p class="text-soft mb-5">Ces produits sont issus des box Surprise non expédiées et sont proposés dans la Box À la Carte.</p>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr><th>Produit</th><th>Catégorie</th><th>Mois d'origine</th><th>Stock restant</th></tr>
              </thead>
              <tbody>
                <tr v-for="p in invendus" :key="p.id">
                  <td class="produit-cell">
                    <span class="produit-cell-emoji">{{ p.emoji }}</span>
                    <span class="font-semibold">{{ p.nom }}</span>
                  </td>
                  <td><span class="badge badge-rose">{{ catLabels[p.categorie] }}</span></td>
                  <td class="text-sm">{{ formatMois(p.moisOrigine) }}</td>
                  <td><span :class="p.stock < 3 ? 'text-rose font-semibold' : ''">{{ p.stock }}</span></td>
                </tr>
                <tr v-if="invendus.length === 0"><td colspan="4" class="admin-empty">Aucun invendu.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { dawkyImages } from '~/composables/useDawkyImages'
const images = dawkyImages

definePageMeta({ layout: false })

const { profile, signOut, isAdmin } = useAuth()
watch(isAdmin, (v) => { if (!v) navigateTo('/') }, { immediate: true })

const activeTab = ref('overview')

const tabs = [
  { key: 'overview',  icon: '📊', label: 'Vue d\'ensemble' },
  { key: 'boxes',     icon: '📦', label: 'Box mensuelles' },
  { key: 'produits',  icon: '🛒', label: 'Produits' },
  { key: 'commandes', icon: '📋', label: 'Commandes' },
  { key: 'invendus',  icon: '🏷️', label: 'Invendus' },
]

// ── KPIs
const kpis = ref([
  { icon: '📦', value: '—', label: 'Box ce mois' },
  { icon: '🛍️', value: '—', label: 'Commandes totales' },
  { icon: '🐾', value: '—', label: 'Abonnés actifs' },
  { icon: '🏷️', value: '—', label: 'Invendus' },
])

// ── BOX MENSUELLES
const filterMois = ref(new Date().toISOString().slice(0, 7))
const boxesLoading = ref(false)
const boxesMensuelles = ref<any[]>([])
const openCreateBox = ref(false)

async function fetchBoxes() {
  boxesLoading.value = true
  try {
    const data = await $fetch('/api/admin/boxes-mensuelles', { query: { mois: filterMois.value } })
    boxesMensuelles.value = (data as any).data ?? []
  } finally { boxesLoading.value = false }
}

watch(filterMois, fetchBoxes, { immediate: true })

async function validerBox(id: string) {
  await $fetch('/api/admin/boxes-mensuelles/valider', { method: 'POST', body: { id } })
  fetchBoxes()
}
async function cloturerBox(id: string) {
  await $fetch('/api/admin/boxes-mensuelles/cloturer', { method: 'POST', body: { id } })
  fetchBoxes()
}

// ── PRODUITS
const produitsAdmin = ref<any[]>([])
const openProduitForm = ref(false)
const produitLoading = ref(false)
const editProduit = ref<any>(null)
const produitForm = reactive({ nom: '', emoji: '📦', description: '', categorie: '', stock: 0, tailles: [] as string[] })

async function fetchProduits() {
  const data = await $fetch('/api/admin/produits')
  produitsAdmin.value = (data as any).data?.produits ?? []
}

watch(() => activeTab.value === 'produits', (v) => { if (v) fetchProduits() }, { immediate: true })

async function saveProduit() {
  produitLoading.value = true
  try {
    if (editProduit.value) {
      await $fetch(`/api/admin/produits/${editProduit.value.id}`, { method: 'PUT', body: produitForm })
    } else {
      await $fetch('/api/admin/produits', { method: 'POST', body: produitForm })
    }
    resetProduitForm()
    fetchProduits()
  } finally { produitLoading.value = false }
}

function startEditProduit(p: any) {
  editProduit.value = p
  Object.assign(produitForm, { nom: p.nom, emoji: p.emoji, description: p.description, categorie: p.categorie, stock: p.stock, tailles: p.tailles?.map((t: any) => t.taille) ?? [] })
  openProduitForm.value = true
}

function resetProduitForm() {
  editProduit.value = null
  openProduitForm.value = false
  Object.assign(produitForm, { nom: '', emoji: '📦', description: '', categorie: '', stock: 0, tailles: [] })
}

async function deleteProduit(id: string) {
  if (!confirm('Supprimer ce produit ?')) return
  await $fetch(`/api/admin/produits/${id}`, { method: 'DELETE' })
  fetchProduits()
}

// ── COMMANDES
const commandesAdmin = ref<any[]>([])
watch(() => activeTab.value === 'commandes', async (v) => {
  if (!v) return
  const data = await $fetch('/api/admin/commandes')
  commandesAdmin.value = (data as any).data ?? []
}, { immediate: true })

// ── INVENDUS
const invendus = ref<any[]>([])
watch(() => activeTab.value === 'invendus', async (v) => {
  if (!v) return
  const data = await $fetch('/api/admin/invendus')
  invendus.value = (data as any).data ?? []
}, { immediate: true })

// ── Helpers
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatMois(m: string) {
  if (!m) return '—'
  const [y, mo] = m.split('-')
  return new Date(+y, +mo - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

const categoriesAdmin = [
  { value: 'MASTICATION', icon: '🦌', label: 'Mastication' },
  { value: 'NUTRITION',   icon: '🍖', label: 'Nutrition' },
  { value: 'JOUET',       icon: '🎾', label: 'Jouet' },
  { value: 'SOIN',        icon: '🌿', label: 'Soin' },
  { value: 'ACCESSOIRE',  icon: '🎀', label: 'Accessoire' },
]
const catColors: Record<string,string> = { MASTICATION:'badge-blue', NUTRITION:'badge-green', JOUET:'badge-yellow', SOIN:'badge-rose', ACCESSOIRE:'badge-blue' }
const catLabels: Record<string,string> = { MASTICATION:'Mastication', NUTRITION:'Nutrition', JOUET:'Jouet', SOIN:'Soin', ACCESSOIRE:'Accessoire' }

const statutBoxColor: Record<string,string> = { BROUILLON:'badge-yellow', VALIDEE:'badge-blue', EXPEDIEE:'badge-green', CLOTUREE:'badge-rose' }
const statutBoxLabel: Record<string,string> = { BROUILLON:'Brouillon', VALIDEE:'Validée', EXPEDIEE:'Expédiée', CLOTUREE:'Clôturée' }
const statutColor: Record<string,string> = { EN_ATTENTE:'badge-yellow', CONFIRMEE:'badge-blue', PREPAREE:'badge-blue', EXPEDIEE:'badge-green', LIVREE:'badge-green', ANNULEE:'badge-rose' }
const statutLabel: Record<string,string> = { EN_ATTENTE:'En attente', CONFIRMEE:'Confirmée', PREPAREE:'Préparée', EXPEDIEE:'Expédiée', LIVREE:'Livrée', ANNULEE:'Annulée' }
</script>

<style scoped>
.admin-page { min-height: 100vh; background: #F4F6FA; display: flex; flex-direction: column; }

.admin-header {
  background: var(--ink);
  padding: var(--space-3) 0;
  border-bottom: 2px solid rgba(255,255,255,0.05);
  position: sticky; top: 0; z-index: 200;
}
.admin-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.admin-logo-row { display: flex; align-items: center; gap: var(--space-3); }
.admin-logo { height: 28px; }
.admin-badge {
  background: rgba(255,255,255,0.1); color: white;
  font-size: 0.75rem; font-weight: 700; padding: 4px 12px;
  border-radius: var(--radius-pill);
}
.admin-user { display: flex; align-items: center; gap: var(--space-3); }

/* Layout */
.admin-layout {
  display: flex;
  flex: 1;
}

/* Sidebar */
.admin-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: white;
  border-right: 1px solid #E5E7EB;
  padding: var(--space-5) var(--space-3);
  position: sticky;
  top: 56px;
  height: calc(100vh - 56px);
  overflow-y: auto;
}
.admin-nav { display: flex; flex-direction: column; gap: 2px; }
.admin-nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--ink-soft);
  cursor: pointer;
  border: none;
  background: transparent;
  text-align: left;
  transition: all var(--duration-fast);
  width: 100%;
}
.admin-nav-item:hover { background: rgba(4,172,227,0.06); color: var(--blue); }
.admin-nav-item.active { background: rgba(4,172,227,0.1); color: var(--blue); font-weight: 600; }
.admin-nav-icon { font-size: 1.125rem; }
.admin-nav-badge {
  margin-left: auto;
  background: var(--blue); color: white;
  font-size: 0.7rem; font-weight: 700;
  padding: 2px 8px; border-radius: var(--radius-pill);
}

/* Main */
.admin-main { flex: 1; padding: var(--space-6); overflow-x: hidden; }

.admin-section { display: flex; flex-direction: column; gap: var(--space-5); }
.admin-section-header { display: flex; align-items: center; justify-content: space-between; }
.admin-section-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; }
.admin-subtitle { font-family: var(--font-display); font-size: 1.125rem; font-weight: 700; color: var(--ink-soft); }

/* KPIs */
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); }
.kpi-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  border: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.kpi-icon { font-size: 1.75rem; }
.kpi-value { font-family: var(--font-display); font-size: 2.5rem; font-weight: 900; color: var(--ink); line-height: 1; }
.kpi-label { font-size: 0.8125rem; color: var(--ink-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }

/* Quick actions */
.quick-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3); }
.quick-action {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast);
}
.quick-action:hover { border-color: var(--blue); background: rgba(4,172,227,0.04); color: var(--blue); }
.quick-action span:first-child { font-size: 1.5rem; }

/* Filters */
.admin-filters { display: flex; gap: var(--space-3); align-items: center; }
.admin-filter-input { max-width: 200px; }

/* Boxes admin */
.boxes-admin-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
.box-admin-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  border: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.box-admin-header { display: flex; align-items: center; justify-content: space-between; }
.box-admin-taille { font-family: var(--font-display); font-size: 2rem; font-weight: 900; color: var(--blue); }
.box-admin-mois { font-weight: 600; text-transform: capitalize; }
.box-admin-theme { font-size: 0.875rem; color: var(--ink-soft); }
.box-admin-items { display: flex; flex-wrap: wrap; gap: 4px; }
.box-item-chip {
  font-size: 0.75rem;
  background: rgba(4,172,227,0.08);
  color: var(--blue);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
}
.box-item-more { font-size: 0.75rem; color: var(--ink-muted); }
.box-admin-actions { display: flex; gap: var(--space-2); }

/* Admin form */
.admin-form-panel {
  background: var(--cream);
  border: 2px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
}
.admin-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
.admin-form-actions { display: flex; gap: var(--space-3); margin-top: var(--space-4); }

.taille-checkboxes { display: flex; gap: var(--space-4); }
.taille-check-label { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-weight: 600; }
.taille-check-label input { accent-color: var(--blue); width: 16px; height: 16px; }

/* Table */
.admin-table-wrap { overflow-x: auto; }
.admin-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid #E5E7EB;
}
.admin-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-muted);
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
}
.admin-table td { padding: 14px 16px; border-bottom: 1px solid #F3F4F6; vertical-align: middle; }
.admin-table tr:last-child td { border-bottom: none; }
.admin-table tr:hover td { background: #FAFBFD; }

.produit-cell { display: flex; align-items: center; gap: var(--space-3); }
.produit-cell-emoji { font-size: 1.75rem; flex-shrink: 0; }
.produit-desc-trunc {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.taille-chips { display: flex; gap: 4px; flex-wrap: wrap; }
.row-actions { display: flex; gap: 4px; }

.admin-empty { text-align: center; padding: var(--space-7); color: var(--ink-muted); }
.link-btn { background: none; border: none; cursor: pointer; color: var(--blue); font-weight: 600; text-decoration: underline; }
.font-mono { font-family: monospace; }
.text-rose { color: #E54747; }

.admin-loading { text-align: center; padding: var(--space-7); color: var(--ink-muted); }

@media (max-width: 1024px) {
  .kpi-grid, .quick-actions { grid-template-columns: repeat(2, 1fr); }
  .boxes-admin-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .admin-sidebar { display: none; }
  .kpi-grid, .quick-actions { grid-template-columns: 1fr 1fr; }
  .boxes-admin-grid { grid-template-columns: 1fr; }
  .admin-form-grid { grid-template-columns: 1fr; }
  .admin-form-grid [style*="grid-column"] { grid-column: 1 / -1; }
}
</style>
