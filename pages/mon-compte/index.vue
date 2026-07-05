<template>
  <div class="dashboard">
    <!-- Abonnement actif -->
    <div v-if="abonnementActif" class="section-block">
      <div class="block-header">
        <h2 class="block-title">📦 Mon abonnement actif</h2>
        <NuxtLink to="/mon-compte/abonnement" class="btn btn-outline btn-sm">Gérer</NuxtLink>
      </div>
      <div class="abo-card">
        <div class="abo-card-info">
          <div class="abo-type-badge">
            <span class="badge" :class="abonnementActif.formula?.type === 'SURPRISE' ? 'badge-blue' : 'badge-yellow'">
              {{ abonnementActif.formula?.type === 'SURPRISE' ? '✨ Box Surprise' : '🛒 Box À la Carte' }}
            </span>
            <span class="badge badge-green">{{ abonnementActif.statut }}</span>
          </div>
          <div class="abo-details">
            <div class="abo-detail-item">
              <span class="abo-detail-label">Formule</span>
              <span class="abo-detail-value">{{ abonnementActif.formula?.nom }}</span>
            </div>
            <div class="abo-detail-item">
              <span class="abo-detail-label">Taille</span>
              <span class="abo-detail-value abo-taille">{{ abonnementActif.taille }}</span>
            </div>
            <div class="abo-detail-item">
              <span class="abo-detail-label">Prix</span>
              <span class="abo-detail-value">{{ abonnementActif.formula?.prix?.toFixed(2) }}&nbsp;€/mois</span>
            </div>
            <div class="abo-detail-item">
              <span class="abo-detail-label">Prochaine box</span>
              <span class="abo-detail-value">{{ prochaineLivraison }}</span>
            </div>
          </div>
        </div>
        <div class="abo-card-visual">
          <img :src="abonnementActif.formula?.type === 'SURPRISE' ? images.sachet_patoune : images.all_image" alt="" class="abo-img animate-float" />
        </div>
      </div>
    </div>

    <!-- Pas d'abo -->
    <div v-else class="no-abo-banner">
      <img :src="images.mascotte_3" alt="" class="no-abo-mascot" />
      <div class="no-abo-text">
        <h3>Pas encore abonné ?</h3>
        <p class="text-soft">Découvrez nos box et commencez par le quiz pour une recommandation personnalisée.</p>
      </div>
      <div class="no-abo-actions">
        <NuxtLink to="/quiz" class="btn btn-primary">🐾 Faire le quiz</NuxtLink>
        <NuxtLink to="/offres" class="btn btn-outline">Voir les offres</NuxtLink>
      </div>
    </div>

    <!-- Dernières commandes -->
    <div class="section-block">
      <div class="block-header">
        <h2 class="block-title">🛍️ Dernières commandes</h2>
        <NuxtLink to="/mon-compte/commandes" class="btn btn-ghost btn-sm">Tout voir →</NuxtLink>
      </div>

      <div v-if="commandes.length === 0" class="empty-state">
        <span>📦</span>
        <p>Aucune commande pour l'instant.</p>
      </div>

      <div v-else class="commandes-list">
        <div v-for="c in commandes.slice(0, 3)" :key="c.id" class="commande-row">
          <div class="commande-icon">{{ statutIcon[c.statut] }}</div>
          <div class="commande-info">
            <p class="commande-id font-semibold">#{{ c.id.slice(-8).toUpperCase() }}</p>
            <p class="text-sm text-soft">{{ c.formula?.nom }} · Taille {{ c.taille }}</p>
          </div>
          <div class="commande-status">
            <span class="badge" :class="statutColor[c.statut]">{{ statutLabel[c.statut] }}</span>
          </div>
          <div class="commande-date text-sm text-muted">
            {{ formatDate(c.createdAt) }}
          </div>
          <div class="commande-total font-semibold">
            {{ c.total?.toFixed(2) }}&nbsp;€
          </div>
        </div>
      </div>
    </div>

    <!-- Profil rapide -->
    <div class="section-block">
      <div class="block-header">
        <h2 class="block-title">👤 Mon profil</h2>
        <NuxtLink to="/mon-compte/profil" class="btn btn-ghost btn-sm">Modifier →</NuxtLink>
      </div>
      <div class="profil-quick">
        <div class="profil-item">
          <span class="profil-label">Nom</span>
          <span class="profil-value">{{ profile?.prenom }} {{ profile?.nom }}</span>
        </div>
        <div class="profil-item">
          <span class="profil-label">Email</span>
          <span class="profil-value">{{ profile?.email }}</span>
        </div>
        <div class="profil-item">
          <span class="profil-label">Téléphone</span>
          <span class="profil-value">{{ profile?.telephone || '—' }}</span>
        </div>
        <div class="profil-item">
          <span class="profil-label">Adresse</span>
          <span class="profil-value">{{ profile?.adresse ? `${profile.adresse}, ${profile.codePostal} ${profile.ville}` : '—' }}</span>
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

const { data: commandesData } = await useFetch('/api/commandes')
const commandes = computed<any[]>(() => (commandesData.value as any)?.data ?? [])

const abonnementActif = computed(() =>
  profile.value?.abonnements?.find((a: any) => a.statut === 'ACTIF') ?? null
)

const prochaineLivraison = computed(() => {
  const d = new Date()
  d.setMonth(d.getMonth() + 1, 1)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
})

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const statutIcon: Record<string, string> = {
  EN_ATTENTE: '⏳', CONFIRMEE: '✅', PREPAREE: '📦', EXPEDIEE: '🚚', LIVREE: '🎉', ANNULEE: '❌'
}
const statutLabel: Record<string, string> = {
  EN_ATTENTE: 'En attente', CONFIRMEE: 'Confirmée', PREPAREE: 'Préparée', EXPEDIEE: 'Expédiée', LIVREE: 'Livrée', ANNULEE: 'Annulée'
}
const statutColor: Record<string, string> = {
  EN_ATTENTE: 'badge-yellow', CONFIRMEE: 'badge-green', PREPAREE: 'badge-blue',
  EXPEDIEE: 'badge-blue', LIVREE: 'badge-green', ANNULEE: 'badge-rose'
}
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: var(--space-6); }

.section-block {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  border: 2px solid var(--border);
}

.block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-5);
}

.block-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
}

/* Abonnement card */
.abo-card {
  background: linear-gradient(135deg, rgba(4,172,227,0.06) 0%, rgba(4,172,227,0.02) 100%);
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-5);
}

.abo-type-badge { display: flex; gap: var(--space-2); margin-bottom: var(--space-4); flex-wrap: wrap; }

.abo-details { display: grid; grid-template-columns: repeat(4, auto); gap: var(--space-5); }
.abo-detail-item { display: flex; flex-direction: column; gap: 4px; }
.abo-detail-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-muted); font-weight: 600; }
.abo-detail-value { font-size: 1rem; font-weight: 600; }
.abo-taille { font-family: var(--font-display); font-size: 1.5rem; font-weight: 900; color: var(--blue); }

.abo-img { width: 120px; object-fit: contain; }

/* No abo */
.no-abo-banner {
  background: var(--yellow-pale);
  border: 2px solid rgba(255,187,51,0.25);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-5);
  flex-wrap: wrap;
}
.no-abo-mascot { width: 80px; flex-shrink: 0; }
.no-abo-text { flex: 1; }
.no-abo-text h3 { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; margin-bottom: 4px; }
.no-abo-actions { display: flex; gap: var(--space-3); flex-wrap: wrap; }

/* Commandes */
.empty-state {
  text-align: center;
  padding: var(--space-7);
  color: var(--ink-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  font-size: 1.5rem;
}

.commandes-list { display: flex; flex-direction: column; gap: 2px; }

.commande-row {
  display: grid;
  grid-template-columns: 40px 1fr auto auto auto;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  transition: background var(--duration-fast);
}
.commande-row:hover { background: var(--cream); }

.commande-icon { font-size: 1.25rem; text-align: center; }
.commande-id { font-size: 0.9375rem; }

/* Profil quick */
.profil-quick { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); }
.profil-item { display: flex; flex-direction: column; gap: 4px; padding: var(--space-3) var(--space-4); background: var(--cream); border-radius: var(--radius-md); }
.profil-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-muted); font-weight: 600; }
.profil-value { font-size: 0.9375rem; font-weight: 500; }

@media (max-width: 768px) {
  .abo-card { flex-direction: column; }
  .abo-details { grid-template-columns: repeat(2, 1fr); }
  .abo-img { display: none; }
  .commande-row { grid-template-columns: 40px 1fr auto; }
  .commande-date, .commande-total { display: none; }
  .profil-quick { grid-template-columns: 1fr; }
}
</style>
