<!-- layouts/compte.vue — espace client : navigation latérale -->
<template>
  <div class="compte">
    <header class="compte-entete">
      <div class="conteneur compte-barre">
        <LogoDawky :hauteur="44" />
        <div class="compte-actions">
          <NuxtLink to="/" class="lien petit">Retour au site</NuxtLink>
          <button type="button" class="lien petit" @click="signOut">Déconnexion</button>
        </div>
      </div>
    </header>
    <div class="conteneur compte-corps">
      <nav class="compte-nav" aria-label="Mon espace">
        <NuxtLink to="/mon-compte" class="compte-lien" exact-active-class="actif">Ma box</NuxtLink>
        <NuxtLink
          v-for="c in profile?.chiens ?? []" :key="c.id" :to="`/mon-compte/chiens/${c.id}`"
          class="compte-lien" active-class="actif"
        >{{ c.nom }}</NuxtLink>
        <NuxtLink to="/mon-compte/commandes" class="compte-lien" active-class="actif">Commandes</NuxtLink>
        <NuxtLink to="/mon-compte/parrainage" class="compte-lien" active-class="actif">Parrainage</NuxtLink>
        <NuxtLink to="/mon-compte/compte" class="compte-lien" active-class="actif">Mon compte</NuxtLink>
      </nav>
      <main id="contenu" class="compte-contenu">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { profile, signOut } = useAuth()
</script>

<style scoped>
.compte-entete {
  border-bottom: 1px solid var(--filet);
}
.compte-barre {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 84px;
}
.compte-actions {
  display: flex;
  gap: var(--e3);
  align-items: center;
}
.compte-corps {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: var(--e5);
  padding-block: var(--e5) var(--e7);
}
.compte-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: sticky;
  top: var(--e3);
  align-self: start;
}
.compte-lien {
  padding: 10px 16px;
  border-radius: 999px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  min-height: var(--tactile);
  display: flex;
  align-items: center;
  white-space: nowrap;
}
.compte-lien:hover {
  background: var(--fond-gris);
}
.compte-lien.actif {
  background: var(--noir);
  color: var(--blanc);
}
.compte-contenu {
  min-width: 0;
}

@media (max-width: 900px) {
  .compte-corps {
    grid-template-columns: 1fr;
    gap: var(--e3);
    padding-block: var(--e2) var(--e5);
  }
  .compte-nav {
    position: static;
    flex-direction: row;
    overflow-x: auto;
    margin-inline: calc(-1 * var(--marge));
    padding-inline: var(--marge);
    scrollbar-width: none;
  }
  .compte-barre {
    min-height: 68px;
  }
}
</style>
