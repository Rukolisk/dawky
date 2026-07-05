<template>
  <div class="abonnement-page">
    <h2 class="page-title">📦 Mon abonnement</h2>

    <!-- Actif -->
    <div v-if="abonnementActif" class="abo-main">
      <div class="abo-status-banner">
        <div class="abo-status-left">
          <img :src="images.sachet_patoune" alt="" class="abo-status-img animate-float" />
          <div>
            <div class="abo-status-badges">
              <span class="badge badge-green">✅ Actif</span>
              <span class="badge badge-blue">{{ abonnementActif.formula?.type === 'SURPRISE' ? '✨ Box Surprise' : '🛒 À la Carte' }}</span>
              <span class="badge badge-yellow">Taille {{ abonnementActif.taille }}</span>
            </div>
            <h3 class="abo-formula-name">{{ abonnementActif.formula?.nom }}</h3>
            <p class="abo-formula-price">
              <span class="price-big">{{ abonnementActif.formula?.prix?.toFixed(2) }}&nbsp;€</span>/mois
            </p>
          </div>
        </div>
        <div class="abo-status-right">
          <div class="abo-next-box">
            <span class="abo-next-icon">🚀</span>
            <div>
              <p class="abo-next-label text-xs text-muted">Prochaine box</p>
              <p class="abo-next-date font-semibold">{{ prochaineLivraison }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Détails -->
      <div class="abo-details-grid">
        <div class="abo-detail-card">
          <p class="detail-label">Début d'abonnement</p>
          <p class="detail-value">{{ formatDate(abonnementActif.dateDebut) }}</p>
        </div>
        <div class="abo-detail-card">
          <p class="detail-label">Engagement</p>
          <p class="detail-value">{{ abonnementActif.engagement }} mois</p>
        </div>
        <div class="abo-detail-card">
          <p class="detail-label">Adresse de livraison</p>
          <p class="detail-value">{{ profile?.adresse ? `${profile.adresse}, ${profile.codePostal} ${profile.ville}` : 'Non renseignée' }}</p>
        </div>
        <div class="abo-detail-card">
          <p class="detail-label">Slots box</p>
          <p class="detail-value">{{ abonnementActif.formula?.slots }} produits</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="abo-actions">
        <div class="abo-action-card abo-action-pause" @click="showPause = true">
          <span class="abo-action-icon">⏸️</span>
          <div>
            <p class="font-semibold">Mettre en pause</p>
            <p class="text-sm text-soft">Skipper un ou plusieurs mois</p>
          </div>
        </div>
        <div class="abo-action-card abo-action-change" @click="showChangeTaille = true">
          <span class="abo-action-icon">📏</span>
          <div>
            <p class="font-semibold">Changer de taille</p>
            <p class="text-sm text-soft">Modifier la taille de votre box</p>
          </div>
        </div>
        <div class="abo-action-card abo-action-cancel" @click="showCancel = true">
          <span class="abo-action-icon">❌</span>
          <div>
            <p class="font-semibold">Résilier</p>
            <p class="text-sm text-soft">Annuler votre abonnement</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pas d'abo -->
    <div v-else class="no-abo">
      <div class="no-abo-card">
        <img :src="images.mascotte_5" alt="" class="no-abo-img animate-float" />
        <h3>Vous n'avez pas d'abonnement actif</h3>
        <p class="text-soft">Faites le quiz pour découvrir la box idéale pour votre chien.</p>
        <div class="no-abo-btns">
          <NuxtLink to="/quiz" class="btn btn-primary btn-lg">🐾 Faire le quiz</NuxtLink>
          <NuxtLink to="/offres" class="btn btn-outline btn-lg">Voir les offres</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Abonnements passés -->
    <div v-if="abonnementsInactifs.length > 0" class="section-block mt-6">
      <h3 class="block-title">Anciens abonnements</h3>
      <div class="abo-history">
        <div v-for="a in abonnementsInactifs" :key="a.id" class="abo-history-row">
          <span class="badge" :class="statutAboColor[a.statut]">{{ statutAboLabel[a.statut] }}</span>
          <span class="text-sm font-medium">{{ a.formula?.nom }}</span>
          <span class="text-sm text-muted">Taille {{ a.taille }}</span>
          <span class="text-sm text-muted">Du {{ formatDate(a.dateDebut) }}{{ a.dateFin ? ` au ${formatDate(a.dateFin)}` : '' }}</span>
        </div>
      </div>
    </div>

    <!-- Modal pause -->
    <div v-if="showPause" class="modal-overlay" @click.self="showPause = false">
      <div class="modal-card animate-fade-in-up">
        <h3 class="modal-title">⏸️ Mettre en pause</h3>
        <p class="text-soft mb-4">Choisissez combien de mois vous souhaitez sauter.</p>
        <div class="pause-options">
          <button v-for="n in [1,2,3]" :key="n" class="pause-btn" :class="{ active: pauseMois === n }" @click="pauseMois = n">
            {{ n }} mois
          </button>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="handlePause" :disabled="actionLoading">
            {{ actionLoading ? '…' : 'Confirmer la pause' }}
          </button>
          <button class="btn btn-ghost" @click="showPause = false">Annuler</button>
        </div>
      </div>
    </div>

    <!-- Modal changement taille -->
    <div v-if="showChangeTaille" class="modal-overlay" @click.self="showChangeTaille = false">
      <div class="modal-card animate-fade-in-up">
        <h3 class="modal-title">📏 Changer de taille</h3>
        <div class="taille-grid-modal">
          <button v-for="t in ['XS','S','M','L']" :key="t" class="taille-modal-btn"
            :class="{ active: newTaille === t, current: t === abonnementActif?.taille }"
            @click="newTaille = t">
            <span class="taille-big">{{ t }}</span>
            <span class="text-xs">{{ taillePoidsMap[t] }}</span>
            <span v-if="t === abonnementActif?.taille" class="current-label">Actuel</span>
          </button>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="handleChangeTaille" :disabled="actionLoading || newTaille === abonnementActif?.taille">
            {{ actionLoading ? '…' : 'Confirmer le changement' }}
          </button>
          <button class="btn btn-ghost" @click="showChangeTaille = false">Annuler</button>
        </div>
      </div>
    </div>

    <!-- Modal résiliation -->
    <div v-if="showCancel" class="modal-overlay" @click.self="showCancel = false">
      <div class="modal-card animate-fade-in-up">
        <div class="cancel-warning">😢</div>
        <h3 class="modal-title">Vous allez nous manquer…</h3>
        <p class="text-soft mb-4">Êtes-vous sûr de vouloir résilier votre abonnement ? La résiliation prend effet à la fin du mois en cours.</p>
        <div class="cancel-reasons">
          <p class="form-label mb-2">Une raison ? (facultatif)</p>
          <div class="reason-btns">
            <button v-for="r in cancelReasons" :key="r" class="reason-btn" :class="{ active: cancelReason === r }" @click="cancelReason = r">{{ r }}</button>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="showCancel = false">Non, je garde mon abonnement</button>
          <button class="btn btn-outline" style="color:#E54747;border-color:#E54747" @click="handleCancel" :disabled="actionLoading">
            {{ actionLoading ? '…' : 'Oui, résilier' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { dawkyImages } from '~/composables/useDawkyImages'
const images = dawkyImages

definePageMeta({ layout: 'compte' })

const { profile } = useAuth()

const abonnements = computed<any[]>(() => profile.value?.abonnements ?? [])
const abonnementActif = computed(() => abonnements.value.find((a: any) => a.statut === 'ACTIF') ?? null)
const abonnementsInactifs = computed(() => abonnements.value.filter((a: any) => a.statut !== 'ACTIF'))

const prochaineLivraison = computed(() => {
  const d = new Date(); d.setMonth(d.getMonth() + 1, 1)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
})

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

const showPause = ref(false); const showCancel = ref(false); const showChangeTaille = ref(false)
const pauseMois = ref(1); const newTaille = ref(''); const cancelReason = ref(''); const actionLoading = ref(false)
const taillePoidsMap: Record<string,string> = { XS: '< 5 kg', S: '5–10 kg', M: '10–25 kg', L: '> 25 kg' }
const cancelReasons = ['Trop cher', 'Mon chien n\'aime pas', 'Déménagement', 'Autre']

const statutAboColor: Record<string,string> = { ACTIF: 'badge-green', PAUSE: 'badge-yellow', RESILIE: 'badge-rose' }
const statutAboLabel: Record<string,string> = { ACTIF: 'Actif', PAUSE: 'En pause', RESILIE: 'Résilié' }

async function handlePause() {
  actionLoading.value = true
  await $fetch(`/api/abonnements/${abonnementActif.value?.id}/pause`, { method: 'POST', body: { mois: pauseMois.value } }).catch(() => {})
  actionLoading.value = false; showPause.value = false
}
async function handleChangeTaille() {
  actionLoading.value = true
  await $fetch(`/api/abonnements/${abonnementActif.value?.id}`, { method: 'PUT', body: { taille: newTaille.value } }).catch(() => {})
  actionLoading.value = false; showChangeTaille.value = false
}
async function handleCancel() {
  actionLoading.value = true
  await $fetch(`/api/abonnements/${abonnementActif.value?.id}/resilier`, { method: 'POST', body: { raison: cancelReason.value } }).catch(() => {})
  actionLoading.value = false; showCancel.value = false
}
</script>

<style scoped>
.abonnement-page { display: flex; flex-direction: column; gap: var(--space-5); }
.page-title { font-family: var(--font-display); font-size: 1.75rem; font-weight: 700; }

.abo-main { display: flex; flex-direction: column; gap: var(--space-5); }

.abo-status-banner {
  background: linear-gradient(135deg, var(--blue) 0%, var(--blue-deep) 100%);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-5);
  flex-wrap: wrap;
}
.abo-status-left { display: flex; align-items: center; gap: var(--space-5); }
.abo-status-img { width: 100px; flex-shrink: 0; filter: drop-shadow(0 8px 20px rgba(0,0,0,0.2)); }
.abo-status-badges { display: flex; gap: var(--space-2); flex-wrap: wrap; margin-bottom: var(--space-2); }
.abo-formula-name { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 4px; }
.price-big { font-family: var(--font-display); font-size: 2rem; font-weight: 900; color: white; }
.abo-formula-price { color: rgba(255,255,255,0.8); font-size: 1rem; }
.abo-next-box {
  display: flex; align-items: center; gap: var(--space-3);
  background: rgba(255,255,255,0.15); border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-5); color: white;
}
.abo-next-icon { font-size: 2rem; }
.abo-next-label { color: rgba(255,255,255,0.7); }
.abo-next-date { font-size: 1.0625rem; }

.abo-details-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4);
}
.abo-detail-card { background: white; border: 2px solid var(--border); border-radius: var(--radius-lg); padding: var(--space-4); }
.detail-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-muted); font-weight: 600; margin-bottom: 4px; }
.detail-value { font-weight: 600; font-size: 0.9375rem; }

.abo-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
.abo-action-card {
  display: flex; align-items: center; gap: var(--space-4);
  background: white; border: 2px solid var(--border); border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-5); cursor: pointer;
  transition: all var(--duration-fast);
}
.abo-action-card:hover { border-color: var(--blue); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
.abo-action-pause:hover { border-color: #FF9500; }
.abo-action-cancel:hover { border-color: #E54747; }
.abo-action-icon { font-size: 2rem; flex-shrink: 0; }

/* No abo */
.no-abo-card {
  background: white; border: 2px solid var(--border); border-radius: var(--radius-xl);
  padding: var(--space-8); text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--space-4);
}
.no-abo-img { width: 160px; }
.no-abo-btns { display: flex; gap: var(--space-3); flex-wrap: wrap; justify-content: center; }

/* History */
.section-block { background: white; border-radius: var(--radius-xl); padding: var(--space-6); border: 2px solid var(--border); }
.block-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; margin-bottom: var(--space-4); }
.abo-history { display: flex; flex-direction: column; gap: 2px; }
.abo-history-row {
  display: flex; align-items: center; gap: var(--space-4);
  padding: var(--space-3) var(--space-4); border-radius: var(--radius-md);
}
.abo-history-row:hover { background: var(--cream); }

/* Modals */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: var(--space-5);
}
.modal-card {
  background: white; border-radius: var(--radius-xl); padding: var(--space-7);
  max-width: 480px; width: 100%; box-shadow: var(--shadow-lg);
}
.modal-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; margin-bottom: var(--space-3); }
.modal-actions { display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-5); }

.pause-options { display: flex; gap: var(--space-3); }
.pause-btn {
  flex: 1; padding: var(--space-4); border: 2px solid var(--border); border-radius: var(--radius-md);
  background: var(--cream); font-family: var(--font-body); font-size: 1rem; font-weight: 600; cursor: pointer; transition: all var(--duration-fast);
}
.pause-btn.active { border-color: var(--blue); background: rgba(4,172,227,0.08); color: var(--blue); }

.taille-grid-modal { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3); }
.taille-modal-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: var(--space-4); border: 2px solid var(--border); border-radius: var(--radius-md);
  background: var(--cream); cursor: pointer; transition: all var(--duration-fast); font-family: var(--font-body); position: relative;
}
.taille-modal-btn.active { border-color: var(--blue); background: rgba(4,172,227,0.08); }
.taille-modal-btn.current { border-color: rgba(45,122,74,0.4); }
.taille-big { font-family: var(--font-display); font-size: 2rem; font-weight: 900; color: var(--blue); }
.current-label { font-size: 0.65rem; font-weight: 700; color: #2D7A4A; text-transform: uppercase; }

.cancel-warning { font-size: 3rem; text-align: center; margin-bottom: var(--space-3); }
.cancel-reasons { margin-bottom: var(--space-3); }
.reason-btns { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.reason-btn {
  padding: 6px 16px; border: 2px solid var(--border); border-radius: var(--radius-pill);
  background: var(--cream); font-family: var(--font-body); font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all var(--duration-fast);
}
.reason-btn.active { border-color: #E54747; color: #E54747; background: rgba(229,71,71,0.06); }

@media (max-width: 768px) {
  .abo-status-banner { flex-direction: column; }
  .abo-details-grid { grid-template-columns: repeat(2, 1fr); }
  .abo-actions { grid-template-columns: 1fr; }
  .taille-grid-modal { grid-template-columns: repeat(2, 1fr); }
}
</style>
