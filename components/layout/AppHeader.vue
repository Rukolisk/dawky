<!-- components/layout/AppHeader.vue -->
<template>
  <header class="header">
    <div class="conteneur header-barre">
      <LogoDawky :hauteur="46" />

      <nav class="nav-principale" aria-label="Navigation principale">
        <NuxtLink v-for="l in liens" :key="l.to" :to="l.to" class="nav-lien">{{ l.label }}</NuxtLink>
      </nav>

      <div class="header-actions">
        <ClientOnly>
          <NuxtLink v-if="isLoggedIn" :to="isAdmin ? '/admin' : '/mon-compte'" class="nav-lien">
            {{ isAdmin ? 'Back-office' : 'Mon espace' }}
          </NuxtLink>
          <NuxtLink v-else to="/connexion" class="nav-lien">Connexion</NuxtLink>
          <template #fallback>
            <NuxtLink to="/connexion" class="nav-lien">Connexion</NuxtLink>
          </template>
        </ClientOnly>
        <NuxtLink to="/quiz" class="btn btn-principal">Trouver sa box</NuxtLink>
      </div>

      <button
        class="burger"
        type="button"
        :aria-expanded="menuOuvert"
        aria-controls="menu-mobile"
        :aria-label="menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'"
        @click="menuOuvert = !menuOuvert"
      >
        <Icone :nom="menuOuvert ? 'fermer' : 'menu'" :taille="28" />
      </button>
    </div>

    <div v-show="menuOuvert" id="menu-mobile" class="menu-mobile">
      <nav class="conteneur menu-mobile-nav" aria-label="Menu">
        <NuxtLink v-for="l in liens" :key="l.to" :to="l.to" class="menu-mobile-lien">{{ l.label }}</NuxtLink>
        <ClientOnly>
          <NuxtLink v-if="isLoggedIn" :to="isAdmin ? '/admin' : '/mon-compte'" class="menu-mobile-lien">
            {{ isAdmin ? 'Back-office' : 'Mon espace' }}
          </NuxtLink>
          <NuxtLink v-else to="/connexion" class="menu-mobile-lien">Connexion</NuxtLink>
        </ClientOnly>
        <NuxtLink to="/quiz" class="btn btn-principal btn-grand btn-bloc">Trouver sa box</NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const { isLoggedIn, isAdmin } = useAuth()
const menuOuvert = ref(false)
const route = useRoute()

const liens = [
  { to: '/nos-formules', label: 'Nos formules' },
  { to: '/compose-ta-box', label: 'Compose ta box' },
  { to: '/offrir', label: 'Offrir' },
  { to: '/aide', label: 'Aide' },
]

// Le menu se referme à chaque changement de page
watch(() => route.fullPath, () => { menuOuvert.value = false })
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--blanc);
  border-bottom: 1px solid var(--filet);
}
.header-barre {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--e3);
  min-height: 89px;
}
.nav-principale {
  display: flex;
  gap: 36px;
}
.nav-lien {
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  padding-block: 4px;
}
.nav-lien:hover,
.nav-lien.router-link-active {
  text-decoration: underline;
  text-underline-offset: 6px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--e3);
}
.burger {
  display: none;
  width: var(--tactile);
  height: var(--tactile);
  align-items: center;
  justify-content: center;
  border: 0;
  background: none;
  cursor: pointer;
}
.menu-mobile {
  border-top: 1px solid var(--filet);
  background: var(--blanc);
  height: calc(100dvh - 68px);
  overflow-y: auto;
}
.menu-mobile-nav {
  display: flex;
  flex-direction: column;
  gap: var(--e1);
  padding-block: var(--e3);
}
.menu-mobile-lien {
  font-family: var(--font-titre);
  font-weight: 300;
  font-size: 40px;
  text-decoration: none;
  padding-block: var(--e1);
}
.menu-mobile-nav .btn {
  margin-top: var(--e3);
}

@media (max-width: 1100px) {
  .nav-principale { gap: 20px; }
}

@media (max-width: 900px) {
  .header-barre { min-height: 68px; }
  .nav-principale,
  .header-actions { display: none; }
  .burger { display: inline-flex; }
}
</style>
