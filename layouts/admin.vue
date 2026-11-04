<!-- layouts/admin.vue — back-office (le rôle ADMIN est vérifié par l'API) -->
<template>
  <div class="admin">
    <aside class="admin-barre">
      <LogoDawky :hauteur="40" lien="/admin" />
      <nav class="admin-nav" aria-label="Back-office">
        <NuxtLink v-for="l in liens" :key="l.to" :to="l.to" class="admin-lien" :class="{ actif: estActif(l.to) }">
          {{ l.label }}
          <span v-if="l.pastille && pastilles[l.pastille]" class="pastille" :aria-label="`${pastilles[l.pastille]} à traiter`">{{ pastilles[l.pastille] }}</span>
        </NuxtLink>
      </nav>
      <div class="admin-pied">
        <NuxtLink to="/" class="lien petit">Voir le site</NuxtLink>
        <button type="button" class="lien petit" @click="signOut">Déconnexion</button>
      </div>
    </aside>
    <main id="contenu" class="admin-contenu">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { signOut } = useAuth()
const route = useRoute()

const liens = [
  { to: '/admin', label: 'Box du mois' },
  { to: '/admin/produits', label: 'Produits' },
  { to: '/admin/invendus', label: 'Produits restants', pastille: 'invendus' },
  { to: '/admin/abonnes', label: 'Abonnés' },
  { to: '/admin/expeditions', label: 'Expéditions' },
  { to: '/admin/allergies', label: 'Allergies', pastille: 'allergies' },
  { to: '/admin/avis-messages', label: 'Avis et messages', pastille: 'messages' },
  { to: '/admin/parrainage-prix', label: 'Parrainage et prix' },
] as const

const estActif = (to: string) => (to === '/admin' ? route.path === '/admin' : route.path.startsWith(to))

// Pastilles : éléments à traiter (rafraîchies à chaque changement de page)
const pastilles = reactive<Record<string, number>>({ invendus: 0, allergies: 0, messages: 0 })
async function rafraichir() {
  const [inv, alertes, avis, messages] = await Promise.allSettled([
    api<{ aDonner: unknown[] }>('/api/admin/invendus'),
    api<unknown[]>('/api/admin/alertes-allergie'),
    api<unknown[]>('/api/admin/avis', { query: { statut: 'EN_ATTENTE' } }),
    api<unknown[]>('/api/admin/contacts', { query: { lu: 'false' } }),
  ])
  pastilles.invendus = inv.status === 'fulfilled' ? inv.value.aDonner.length : 0
  pastilles.allergies = alertes.status === 'fulfilled' ? alertes.value.length : 0
  pastilles.messages = (avis.status === 'fulfilled' ? avis.value.length : 0) + (messages.status === 'fulfilled' ? messages.value.length : 0)
}
watch(() => route.path, rafraichir, { immediate: true })
</script>

<style scoped>
.admin {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
}
.admin-barre {
  background: var(--fond-gris);
  padding: var(--e3) var(--e2);
  display: flex;
  flex-direction: column;
  gap: var(--e4);
  position: sticky;
  top: 0;
  height: 100vh;
}
.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.admin-lien {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--e1);
  padding: 10px 12px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  min-height: var(--tactile);
}
.admin-lien:hover {
  background: var(--filet);
}
.admin-lien.actif {
  background: var(--burgundy);
  color: var(--blanc);
}
.pastille {
  min-width: 22px;
  height: 22px;
  padding-inline: 6px;
  border-radius: 999px;
  background: var(--burgundy);
  color: var(--blanc);
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.actif .pastille {
  background: var(--blanc);
  color: var(--burgundy);
}
.admin-pied {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--e1);
}
.admin-contenu {
  padding: var(--e4) var(--e4) var(--e6);
  min-width: 0;
}

@media (max-width: 900px) {
  .admin {
    grid-template-columns: 1fr;
  }
  .admin-barre {
    position: static;
    height: auto;
    gap: var(--e2);
  }
  .admin-nav {
    flex-direction: row;
    overflow-x: auto;
  }
  .admin-lien {
    white-space: nowrap;
  }
  .admin-pied {
    flex-direction: row;
    gap: var(--e3);
  }
  .admin-contenu {
    padding: var(--e3) var(--marge) var(--e5);
  }
}
</style>
