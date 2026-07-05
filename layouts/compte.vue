<template>
  <div class="compte-page">
    <!-- Header -->
    <div class="compte-header">
      <div class="compte-header-bg">
        <img :src="images.fond_motif_bleu" alt="" />
      </div>
      <div class="container compte-header-inner">
        <div class="compte-avatar">
          <div class="avatar-circle">{{ initials }}</div>
          <div class="compte-user-info">
            <h1 class="display-sm text-white">Bonjour {{ profile?.prenom || '' }} 👋</h1>
            <p class="text-white compte-email" style="opacity:.75">{{ profile?.email }}</p>
          </div>
        </div>
        <div class="compte-header-stats hide-mobile">
          <div v-for="stat in stats" :key="stat.label" class="header-stat">
            <span class="header-stat-value">{{ stat.value }}</span>
            <span class="header-stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Nav tabs -->
    <div class="compte-nav-wrap">
      <div class="container">
        <nav class="compte-nav">
          <NuxtLink v-for="tab in tabs" :key="tab.to" :to="tab.to" class="compte-nav-link" exact-active-class="active">
            <span class="compte-nav-icon">{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
          </NuxtLink>
        </nav>
      </div>
    </div>

    <!-- Page content -->
    <div class="container compte-content">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import { dawkyImages } from '~/composables/useDawkyImages'
const images = dawkyImages
const { isLoggedIn, profile } = useAuth()

// Protect route
watch(isLoggedIn, (v) => { if (!v) navigateTo('/connexion') }, { immediate: true })

const initials = computed(() => {
  if (!profile.value) return '?'
  return (profile.value.prenom?.[0] ?? '') + (profile.value.nom?.[0] ?? '')
})

const tabs = [
  { to: '/mon-compte', icon: '🏠', label: 'Tableau de bord' },
  { to: '/mon-compte/abonnement', icon: '📦', label: 'Mon abonnement' },
  { to: '/mon-compte/commandes', icon: '🛍️', label: 'Commandes' },
  { to: '/mon-compte/profil', icon: '👤', label: 'Profil' },
]

// Fetch some stats
const { data: commandesData } = await useFetch('/api/commandes')
const stats = computed(() => [
  { value: (commandesData.value as any)?.data?.length ?? 0, label: 'Commandes' },
  { value: profile.value?.abonnements?.length ?? 0, label: 'Abonnements' },
])
</script>

<style scoped>
.compte-page { min-height: 100vh; background: var(--cream); }

.compte-header {
  background: var(--blue);
  padding: var(--space-8) 0 var(--space-6);
  position: relative;
  overflow: hidden;
}
.compte-header-bg {
  position: absolute; inset: 0; opacity: 0.06; pointer-events: none;
}
.compte-header-bg img { width: 100%; height: 100%; object-fit: cover; }

.compte-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  position: relative;
}

.compte-avatar { display: flex; align-items: center; gap: var(--space-4); }

.avatar-circle {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: 3px solid rgba(255,255,255,0.4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.header-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-3) var(--space-5);
  background: rgba(255,255,255,0.12);
  border-radius: var(--radius-lg);
}
.compte-header-stats { display: flex; gap: var(--space-3); }
.header-stat-value { font-family: var(--font-display); font-size: 2rem; font-weight: 900; color: white; }
.header-stat-label { font-size: 0.75rem; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 0.06em; }

/* Nav */
.compte-nav-wrap {
  background: white;
  border-bottom: 2px solid var(--border);
  position: sticky;
  top: 72px;
  z-index: 100;
}
.compte-nav {
  display: flex;
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.compte-nav::-webkit-scrollbar { display: none; }

.compte-nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--ink-soft);
  text-decoration: none;
  border-bottom: 3px solid transparent;
  transition: all var(--duration-fast);
  white-space: nowrap;
}
.compte-nav-link:hover { color: var(--blue); background: rgba(4,172,227,0.04); }
.compte-nav-link.active { color: var(--blue); border-bottom-color: var(--blue); font-weight: 600; }
.compte-nav-icon { font-size: 1.125rem; }

.compte-content { padding: var(--space-7) 0 var(--space-9); }
</style>
