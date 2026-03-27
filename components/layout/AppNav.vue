<!-- components/layout/AppNav.vue -->
<template>
  <nav :class="['nav', { 'nav--scrolled': scrolled }]">
    <NuxtLink to="/" class="nav__logo">
      DAW<span>KY</span><span class="nav__paw">🐾</span>
    </NuxtLink>

    <ul class="nav__links">
      <li v-for="link in links" :key="link.to">
        <NuxtLink :to="link.to" class="nav__link" active-class="nav__link--active">
          {{ link.label }}
        </NuxtLink>
      </li>
    </ul>

    <div class="nav__auth">
      <NuxtLink v-if="isAdmin" to="/admin" class="nav__admin">⚙ Admin</NuxtLink>
      <template v-if="isLoggedIn">
        <NuxtLink to="/profil" class="nav__profil">
          <span class="nav__avatar">{{ initials }}</span>
          <span>{{ user?.prenom }}</span>
        </NuxtLink>
      </template>
      <template v-else>
        <NuxtLink to="/connexion" class="btn btn-primary btn-sm">Se connecter</NuxtLink>
      </template>
    </div>

    <button class="nav__burger" @click="open = !open" :aria-expanded="open">
      <span /><span /><span />
    </button>

    <Transition name="menu">
      <div v-if="open" class="nav__mobile">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="nav__ml" @click="open=false">{{ l.label }}</NuxtLink>
        <NuxtLink v-if="isAdmin" to="/admin" class="nav__ml" @click="open=false">⚙ Admin</NuxtLink>
        <NuxtLink v-if="isLoggedIn" to="/profil" class="nav__ml" @click="open=false">👤 Mon profil</NuxtLink>
        <NuxtLink v-else to="/connexion" class="nav__ml nav__ml--cta" @click="open=false">Se connecter 🐾</NuxtLink>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
const { y } = useWindowScroll()
const scrolled = computed(() => y.value > 20)
const open = ref(false)
const { user, isLoggedIn, isAdmin } = useAuth()
const initials = computed(() => `${user.value?.prenom?.[0]??''}${user.value?.nom?.[0]??''}`.toUpperCase())
const links = [
  { to: '/', label: 'Accueil' },
  { to: '/boxes', label: 'Nos Boxes' },
  { to: '/abonnement', label: "S'abonner" },
  { to: '/produits', label: 'Catalogue' },
  { to: '/concept', label: 'Concept' },
  { to: '/contact', label: 'Contact' },
]
watch(() => useRoute().path, () => { open.value = false })
</script>

<style scoped>
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 3rem; height: 68px; gap: 1rem;
  background: rgba(247,249,252,.96);
  backdrop-filter: blur(14px);
  border-bottom: 1.5px solid transparent;
  transition: all .3s;
}
.nav--scrolled {
  border-bottom-color: var(--brume);
  box-shadow: 0 2px 16px rgba(26,39,68,.08);
}
.nav__logo {
  font-family: var(--font-display); font-size: 1.6rem; font-weight: 900;
  color: var(--nuit); letter-spacing: -0.5px;
  display: flex; align-items: center; gap: .25rem; flex-shrink: 0;
}
.nav__logo > span:first-child { color: var(--bleu-vif); }
.nav__paw { font-size: 1rem; margin-left: .1rem; animation: wiggle 3s ease-in-out infinite; }

.nav__links { display: flex; gap: 1.5rem; flex: 1; justify-content: center; }
.nav__link {
  font-size: .86rem; font-weight: 500; color: var(--ardoise);
  padding: .25rem 0; position: relative; transition: color .18s;
}
.nav__link::after {
  content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
  height: 2px; background: var(--bleu-vif); border-radius: 2px;
  transform: scaleX(0); transition: transform .2s;
}
.nav__link:hover, .nav__link--active { color: var(--nuit); }
.nav__link:hover::after, .nav__link--active::after { transform: scaleX(1); }

.nav__auth { display: flex; align-items: center; gap: .7rem; flex-shrink: 0; }
.nav__admin {
  font-size: .78rem; font-weight: 700; color: var(--menthe);
  background: var(--menthe-pale); padding: .3rem .85rem;
  border-radius: var(--r-full); transition: background .18s;
  border: 1.5px solid rgba(104,178,160,.3);
}
.nav__admin:hover { background: rgba(104,178,160,.2); }
.nav__profil {
  display: flex; align-items: center; gap: .5rem;
  background: var(--nuage); border-radius: var(--r-full);
  padding: .3rem .85rem .3rem .3rem; border: 1.5px solid var(--brume);
  font-size: .84rem; font-weight: 500; color: var(--text);
  transition: border-color .18s;
}
.nav__profil:hover { border-color: var(--bleu-ciel); }
.nav__avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--bleu); color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: .68rem; font-weight: 700;
}

.nav__burger {
  display: none; flex-direction: column; gap: 5px;
  background: none; border: none; padding: 4px; flex-shrink: 0;
}
.nav__burger span {
  display: block; width: 22px; height: 2px;
  background: var(--nuit); border-radius: 2px; transition: all .25s;
}

.nav__mobile {
  position: absolute; top: 68px; left: 0; right: 0;
  background: var(--blanc); border-bottom: 1.5px solid var(--brume);
  display: flex; flex-direction: column;
  padding: 1rem 1.5rem 1.5rem;
  box-shadow: var(--shadow-md);
}
.nav__ml {
  padding: .7rem 0; font-size: .95rem; font-weight: 500; color: var(--text);
  border-bottom: 1px solid var(--brume);
}
.nav__ml:last-child { border: none; }
.nav__ml--cta { color: var(--bleu); font-weight: 700; }

.menu-enter-active, .menu-leave-active { transition: opacity .2s, transform .2s; }
.menu-enter-from, .menu-leave-to { opacity: 0; transform: translateY(-6px); }

@media (max-width: 1000px) {
  .nav { padding: 0 1.5rem; }
  .nav__links, .nav__auth { display: none; }
  .nav__burger { display: flex; }
}
</style>
