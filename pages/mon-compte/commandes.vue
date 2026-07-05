<template>
  <div class="commandes-page">
    <div class="commandes-header">
      <h2 class="page-title">🛍️ Mes commandes</h2>
      <div class="commandes-filters">
        <select v-model="filterStatut" class="form-select filter-select">
          <option value="">Tous les statuts</option>
          <option v-for="(label, key) in statutLabel" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="commandes-loading">
      <div v-for="i in 3" :key="i" class="skeleton-commande" />
    </div>

    <div v-else-if="commandesFiltrees.length === 0" class="empty-state">
      <img :src="images.mascotte_1" alt="" class="empty-mascot" />
      <h3>Aucune commande</h3>
      <p class="text-soft">Vos futures commandes apparaîtront ici.</p>
      <NuxtLink to="/offres" class="btn btn-primary mt-4">Voir les offres</NuxtLink>
    </div>

    <div v-else class="commandes-list">
      <div v-for="c in commandesFiltrees" :key="c.id" class="commande-card">
        <div class="commande-card-header">
          <div class="commande-ref">
            <span class="ref-label">Commande</span>
            <span class="ref-value">#{{ c.id.slice(-8).toUpperCase() }}</span>
          </div>
          <span class="badge" :class="statutColor[c.statut]">
            {{ statutIcon[c.statut] }} {{ statutLabel[c.statut] }}
          </span>
          <span class="commande-date text-sm text-muted">{{ formatDate(c.createdAt) }}</span>
        </div>

        <!-- Timeline statut -->
        <div class="statut-timeline">
          <div v-for="(s, idx) in statutSteps" :key="s.key"
            class="timeline-step"
            :class="{ done: stepsDone(c.statut, s.key), active: c.statut === s.key, cancelled: c.statut === 'ANNULEE' }">
            <div class="timeline-dot">
              <span v-if="stepsDone(c.statut, s.key)">✓</span>
              <span v-else-if="c.statut === s.key" class="dot-pulse" />
              <span v-else />
            </div>
            <span class="timeline-label">{{ s.label }}</span>
            <div v-if="idx < statutSteps.length - 1" class="timeline-line" :class="{ done: stepsDone(c.statut, s.key) }" />
          </div>
        </div>

        <div class="commande-body">
          <div class="commande-info-row">
            <div class="commande-info-item">
              <span class="info-label">Formule</span>
              <span class="info-value">{{ c.formula?.nom }}</span>
            </div>
            <div class="commande-info-item">
              <span class="info-label">Taille</span>
              <span class="info-value"><span class="size-chip">{{ c.taille }}</span></span>
            </div>
            <div class="commande-info-item">
              <span class="info-label">Total</span>
              <span class="info-value font-semibold">{{ c.total?.toFixed(2) }}&nbsp;€</span>
            </div>
            <div class="commande-info-item" v-if="c.dateExpedition">
              <span class="info-label">Expédition</span>
              <span class="info-value">{{ formatDate(c.dateExpedition) }}</span>
            </div>
          </div>

          <!-- Produits sélectionnés (box à la carte) -->
          <div v-if="c.selections?.length > 0" class="commande-selections">
            <p class="selections-title text-sm font-semibold text-soft">Produits dans cette box :</p>
            <div class="selections-list">
              <div v-for="s in c.selections" :key="s.id" class="selection-chip">
                {{ s.produit?.emoji }} {{ s.produit?.nom }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { dawkyImages } from '~/composables/useDawkyImages'
const images = dawkyImages

definePageMeta({ layout: 'compte' })

const filterStatut = ref('')
const loading = ref(true)
const commandes = ref<any[]>([])

onMounted(async () => {
  const data = await $fetch('/api/commandes').catch(() => ({ data: [] }))
  commandes.value = (data as any).data ?? []
  loading.value = false
})

const commandesFiltrees = computed(() => {
  if (!filterStatut.value) return commandes.value
  return commandes.value.filter(c => c.statut === filterStatut.value)
})

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const statutSteps = [
  { key: 'EN_ATTENTE', label: 'Reçue' },
  { key: 'CONFIRMEE',  label: 'Confirmée' },
  { key: 'PREPAREE',   label: 'Préparée' },
  { key: 'EXPEDIEE',   label: 'Expédiée' },
  { key: 'LIVREE',     label: 'Livrée' },
]
const statutOrder = ['EN_ATTENTE','CONFIRMEE','PREPAREE','EXPEDIEE','LIVREE']
function stepsDone(current: string, step: string) {
  return statutOrder.indexOf(current) > statutOrder.indexOf(step)
}

const statutIcon: Record<string,string> = {
  EN_ATTENTE:'⏳', CONFIRMEE:'✅', PREPAREE:'📦', EXPEDIEE:'🚚', LIVREE:'🎉', ANNULEE:'❌'
}
const statutLabel: Record<string,string> = {
  EN_ATTENTE:'En attente', CONFIRMEE:'Confirmée', PREPAREE:'Préparée', EXPEDIEE:'Expédiée', LIVREE:'Livrée', ANNULEE:'Annulée'
}
const statutColor: Record<string,string> = {
  EN_ATTENTE:'badge-yellow', CONFIRMEE:'badge-blue', PREPAREE:'badge-blue',
  EXPEDIEE:'badge-green', LIVREE:'badge-green', ANNULEE:'badge-rose'
}
</script>

<style scoped>
.commandes-page { display: flex; flex-direction: column; gap: var(--space-5); }
.commandes-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); }
.page-title { font-family: var(--font-display); font-size: 1.75rem; font-weight: 700; }
.filter-select { max-width: 220px; }

.skeleton-commande { background: #eee; border-radius: var(--radius-xl); height: 160px; animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

.empty-state { text-align: center; padding: var(--space-9); display: flex; flex-direction: column; align-items: center; gap: var(--space-4); }
.empty-mascot { width: 140px; }

.commandes-list { display: flex; flex-direction: column; gap: var(--space-4); }

.commande-card {
  background: white; border: 2px solid var(--border); border-radius: var(--radius-xl);
  overflow: hidden; transition: box-shadow var(--duration-fast);
}
.commande-card:hover { box-shadow: var(--shadow-md); }

.commande-card-header {
  display: flex; align-items: center; gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  background: var(--cream); border-bottom: 1px solid var(--border); flex-wrap: wrap;
}
.commande-ref { display: flex; flex-direction: column; gap: 2px; }
.ref-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-muted); font-weight: 700; }
.ref-value { font-family: monospace; font-weight: 700; font-size: 1rem; }
.commande-date { margin-left: auto; }

/* Timeline */
.statut-timeline {
  display: flex; align-items: flex-start;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
}
.timeline-step {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  flex: 1; position: relative; min-width: 80px;
}
.timeline-dot {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--cream); border: 2px solid rgba(4,172,227,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; color: var(--ink-muted);
  position: relative; z-index: 1; transition: all 0.3s;
}
.timeline-step.done .timeline-dot { background: var(--blue); border-color: var(--blue); color: white; }
.timeline-step.active .timeline-dot { background: white; border-color: var(--blue); color: var(--blue); box-shadow: 0 0 0 4px rgba(4,172,227,0.15); }
.timeline-step.cancelled .timeline-dot { background: #E54747; border-color: #E54747; color: white; }
.dot-pulse { width: 10px; height: 10px; border-radius: 50%; background: var(--blue); animation: pulse 1.5s ease-in-out infinite; }
.timeline-label { font-size: 0.7rem; font-weight: 600; color: var(--ink-muted); text-align: center; }
.timeline-step.done .timeline-label, .timeline-step.active .timeline-label { color: var(--blue); }
.timeline-line {
  position: absolute; top: 14px; left: 50%; width: 100%;
  height: 2px; background: rgba(4,172,227,0.15);
}
.timeline-line.done { background: var(--blue); }

.commande-body { padding: var(--space-4) var(--space-5); }
.commande-info-row { display: flex; gap: var(--space-6); align-items: center; flex-wrap: wrap; }
.commande-info-item { display: flex; flex-direction: column; gap: 2px; }
.info-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-muted); font-weight: 700; }
.info-value { font-size: 0.9375rem; }

.commande-selections { margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px solid var(--border); }
.selections-title { margin-bottom: var(--space-2); }
.selections-list { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.selection-chip {
  font-size: 0.8125rem; padding: 4px 12px;
  background: rgba(4,172,227,0.08); color: var(--blue);
  border-radius: var(--radius-pill); font-weight: 500;
}
</style>
