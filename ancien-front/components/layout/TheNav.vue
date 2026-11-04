<template>
  <header class="nav-wrapper" :class="{ scrolled: isScrolled, 'nav-open': menuOpen }">
    <nav class="nav-inner container">
      <!-- Logo -->
      <NuxtLink to="/" class="nav-logo" @click="menuOpen = false">
        <img :src="images.logo_dawky_bleu" alt="Dawky" class="logo-img" />
      </NuxtLink>

      <!-- Desktop links -->
      <ul class="nav-links hide-mobile">
        <li><NuxtLink to="/offres" class="nav-link">Nos offres</NuxtLink></li>
        <li><NuxtLink to="/quiz" class="nav-link nav-link-highlight">Quiz 🐾</NuxtLink></li>
        <li><NuxtLink to="/comment-ca-marche" class="nav-link">Comment ça marche</NuxtLink></li>
        <li><NuxtLink to="/contact" class="nav-link">Contact</NuxtLink></li>
      </ul>

      <!-- Desktop CTA -->
      <div class="nav-actions hide-mobile">
        <template v-if="isLoggedIn">
          <NuxtLink v-if="isAdmin" to="/admin" class="btn btn-ghost btn-sm">Admin</NuxtLink>
          <NuxtLink to="/mon-compte" class="btn btn-outline btn-sm">
            <span>{{ profile?.prenom || 'Mon compte' }}</span>
          </NuxtLink>
          <button class="btn btn-ghost btn-sm" @click="signOut">Déconnexion</button>
        </template>
        <template v-else>
          <NuxtLink to="/connexion" class="btn btn-ghost btn-sm">Connexion</NuxtLink>
          <NuxtLink to="/offres" class="btn btn-primary btn-sm">Commencer</NuxtLink>
        </template>
      </div>

      <!-- Mobile burger -->
      <button class="burger" :class="{ open: menuOpen }" @click="menuOpen = !menuOpen" aria-label="Menu">
        <span /><span /><span />
      </button>
    </nav>

    <!-- Mobile menu -->
    <div class="mobile-menu" :class="{ open: menuOpen }">
      <div class="mobile-menu-inner">
        <nav class="mobile-nav-links">
          <NuxtLink to="/offres" class="mobile-link" @click="menuOpen = false">Nos offres</NuxtLink>
          <NuxtLink to="/quiz" class="mobile-link mobile-link-cta" @click="menuOpen = false">Quiz 🐾 — Trouve ta box</NuxtLink>
          <NuxtLink to="/comment-ca-marche" class="mobile-link" @click="menuOpen = false">Comment ça marche</NuxtLink>
          <NuxtLink to="/contact" class="mobile-link" @click="menuOpen = false">Contact</NuxtLink>
        </nav>
        <div class="mobile-actions">
          <template v-if="isLoggedIn">
            <NuxtLink to="/mon-compte" class="btn btn-primary w-full" @click="menuOpen = false">Mon compte</NuxtLink>
            <button class="btn btn-ghost w-full" @click="() => { signOut(); menuOpen = false }">Déconnexion</button>
          </template>
          <template v-else>
            <NuxtLink to="/offres" class="btn btn-primary w-full" @click="menuOpen = false">Commencer</NuxtLink>
            <NuxtLink to="/connexion" class="btn btn-outline w-full" @click="menuOpen = false">Connexion</NuxtLink>
          </template>
        </div>
        <div class="mobile-mascot">
          <img :src="images.mascotte_1" alt="" />
        </div>
      </div>
    </div>
  </header>
  <!-- Spacer -->
  <div class="nav-spacer" />
</template>

<script setup lang="ts">
import { dawkyImages } from '~/composables/useDawkyImages'
const images = dawkyImages
const { isLoggedIn, isAdmin, profile, signOut } = useAuth()

const isScrolled = ref(false)
const menuOpen = ref(false)

onMounted(() => {
  window.addEventListener('scroll', () => {
    isScrolled.value = window.scrollY > 16
  })
})
</script>

<style scoped>
.nav-wrapper {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  transition: background var(--duration-base), box-shadow var(--duration-base);
  background: rgba(255,251,244, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.nav-wrapper.scrolled {
  background: rgba(255,251,244, 0.96);
  box-shadow: 0 2px 24px rgba(4,172,227,0.1);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  gap: var(--space-5);
}

.nav-logo { display: flex; align-items: center; flex-shrink: 0; }
.logo-img { height: 36px; width: auto; }

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  list-style: none;
  flex: 1;
  justify-content: center;
}

.nav-link {
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--ink-soft);
  text-decoration: none;
  transition: all var(--duration-fast);
}

.nav-link:hover, .nav-link.router-link-active {
  color: var(--blue);
  background: rgba(4,172,227,0.08);
}

.nav-link-highlight {
  background: rgba(4,172,227,0.08);
  color: var(--blue);
  font-weight: 600;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

/* Burger */
.burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 40px; height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.burger span {
  display: block;
  width: 24px; height: 2px;
  background: var(--ink);
  border-radius: 2px;
  transition: all var(--duration-base) var(--ease-out);
  transform-origin: center;
}

.burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* Mobile menu */
.mobile-menu {
  display: none;
  position: fixed;
  inset: 72px 0 0 0;
  background: var(--cream);
  transform: translateX(100%);
  transition: transform var(--duration-slow) var(--ease-out);
  overflow-y: auto;
  z-index: 999;
}

.mobile-menu.open { transform: translateX(0); }

.mobile-menu-inner {
  padding: var(--space-6) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.mobile-link {
  display: block;
  padding: 16px 20px;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast);
}

.mobile-link:hover, .mobile-link.router-link-active { background: rgba(4,172,227,0.08); color: var(--blue); }

.mobile-link-cta {
  background: rgba(4,172,227,0.1);
  color: var(--blue);
}

.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.mobile-mascot {
  display: flex;
  justify-content: center;
}
.mobile-mascot img {
  width: 140px;
  opacity: 0.7;
}

.nav-spacer { height: 72px; }

@media (max-width: 768px) {
  .burger { display: flex; }
  .mobile-menu { display: block; }
}
</style>
