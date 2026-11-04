<!-- components/layout/AppFooter.vue -->
<template>
  <footer class="footer">
    <svg class="footer__wave" viewBox="0 0 1440 64" preserveAspectRatio="none">
      <path d="M0,32 C360,64 720,0 1080,32 C1260,48 1380,20 1440,32 L1440,64 L0,64 Z"
            fill="var(--nuit)" />
    </svg>

    <div class="footer__body">
      <div class="footer__inner container">

        <!-- Brand -->
        <div class="footer__brand">
          <div class="footer__logo">
            <img src="/images/dawky-picto.png" alt="Dawky" class="footer__logo-picto" />
            <img src="/images/dawky-logo.png"  alt="DAWKY" class="footer__logo-word" />
          </div>
          <p>La box aux couleurs du chien. Tailles XS, S, M, L — un prix pour tous.</p>
          <div class="footer__socials">
            <a href="#" class="footer__social" aria-label="Instagram">📸</a>
            <a href="#" class="footer__social" aria-label="TikTok">🎵</a>
            <a href="#" class="footer__social" aria-label="Facebook">👥</a>
          </div>
        </div>

        <!-- Colonnes de liens -->
        <div v-for="col in cols" :key="col.title" class="footer__col">
          <h4>{{ col.title }}</h4>
          <ul>
            <li v-for="item in col.items" :key="item.label">
              <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="footer__contact">
          <h4>Contact</h4>
          <p>📧 contact@dawky.fr</p>
          <p>⏰ Lun–Ven 9h–18h</p>
          <p class="footer__note">Réponse sous 24h garantie</p>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="footer__bottom">
        <div class="container footer__bottom-inner">
          <span>© {{ new Date().getFullYear() }} Dawky · Fait avec 🐾 en France</span>
          <div class="footer__legal">
            <a href="#">Mentions légales</a>
            <a href="#">CGV</a>
            <a href="#">Confidentialité</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const cols = [
  {
    title: 'Boxes',
    items: [
      { label: '🎁 Box Surprise',    to: '/boxes' },
      { label: '♻️ Box À la Carte', to: '/boxes' },
      { label: "S'abonner",          to: '/abonnement' },
      { label: 'Catalogue',          to: '/produits' },
    ],
  },
  {
    title: 'Dawky',
    items: [
      { label: 'Notre concept',  to: '/concept' },
      { label: 'Engagement éco', to: '/engagement' },
      { label: 'FAQ',            to: '/abonnement' },
    ],
  },
]
</script>

<style scoped>
.footer { margin-top: 5rem; }
.footer__wave { display: block; width: 100%; height: 64px; }
.footer__body { background: var(--nuit); }

.footer__inner {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
  padding-top: 3rem;
  padding-bottom: 3rem;
}

/* Brand */
.footer__logo {
  display: flex; align-items: center; gap: .7rem;
  margin-bottom: .9rem;
}
.footer__logo-picto { height: 40px; width: auto; }
.footer__logo-word  { height: 30px; width: auto; }
.footer__brand p {
  font-size: .86rem; color: rgba(255,255,255,.45);
  line-height: 1.65; margin-bottom: 1.2rem;
}
.footer__socials { display: flex; gap: .7rem; }
.footer__social { font-size: 1.3rem; opacity: .5; transition: opacity .2s; }
.footer__social:hover { opacity: 1; }

/* Colonnes */
.footer__col h4,
.footer__contact h4 {
  font-family: var(--font-body);
  font-size: .72rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .12em;
  color: rgba(255,255,255,.28); margin-bottom: 1rem;
}
.footer__col ul { list-style: none; }
.footer__col li { margin-bottom: .55rem; }
.footer__col a {
  font-size: .86rem; color: rgba(255,255,255,.55);
  transition: color .18s; text-decoration: none;
}
.footer__col a:hover { color: var(--jaune-vif); }

.footer__contact p      { font-size: .86rem; color: rgba(255,255,255,.55); margin-bottom: .35rem; }
.footer__note            { font-size: .74rem !important; opacity: .35; margin-top: .5rem !important; }

/* Bottom */
.footer__bottom { border-top: 1px solid rgba(255,255,255,.08); }
.footer__bottom-inner {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 1.2rem; padding-bottom: 1.5rem;
  font-size: .76rem; color: rgba(255,255,255,.22);
  flex-wrap: wrap; gap: .5rem;
}
.footer__legal { display: flex; gap: 1.2rem; }
.footer__legal a { color: rgba(255,255,255,.3); transition: color .18s; text-decoration: none; }
.footer__legal a:hover { color: var(--jaune-vif); }

@media (max-width: 900px) {
  .footer__inner { grid-template-columns: 1fr 1fr; padding-top: 2rem; }
  .footer__brand { grid-column: 1 / -1; }
}
@media (max-width: 500px) {
  .footer__inner { grid-template-columns: 1fr; }
  .footer__bottom-inner { flex-direction: column; text-align: center; }
}
</style>
