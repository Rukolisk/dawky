<!-- components/layout/AppFooter.vue -->
<template>
  <footer class="footer">
    <svg class="footer__wave" viewBox="0 0 1440 64" preserveAspectRatio="none" fill="none">
      <path d="M0,32 C360,64 720,0 1080,32 C1260,48 1360,24 1440,32 L1440,64 L0,64 Z" fill="#1A2744"/>
    </svg>

    <div class="footer__body">
      <div class="footer__inner container">
        <div class="footer__brand">
          <div class="footer__logo">DAW<span>KY</span> 🐾</div>
          <p>La box qui s'adapte à votre compagnon. Tailles XS, S, M, L — même prix, contenu parfait.</p>
          <div class="footer__socials">
            <a href="#" class="footer__social" aria-label="Instagram">📸</a>
            <a href="#" class="footer__social" aria-label="TikTok">🎵</a>
            <a href="#" class="footer__social" aria-label="Facebook">👥</a>
          </div>
        </div>

        <div v-for="col in cols" :key="col.title" class="footer__col">
          <h4>{{ col.title }}</h4>
          <ul>
            <li v-for="item in col.items" :key="item.label">
              <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
            </li>
          </ul>
        </div>

        <div class="footer__contact">
          <h4>Contact</h4>
          <p>📧 contact@dawky.fr</p>
          <p>⏰ Lun–Ven 9h–18h</p>
          <p class="footer__contact-note">Réponse garantie sous 24h</p>
        </div>
      </div>

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
  { title: 'Boxes', items: [
    { label: '🎁 Box Surprise', to: '/boxes' },
    { label: '♻️ Box À la Carte', to: '/boxes' },
    { label: "S'abonner", to: '/abonnement' },
    { label: 'Catalogue', to: '/produits' },
  ]},
  { title: 'Dawky', items: [
    { label: 'Notre concept', to: '/concept' },
    { label: 'Engagement éco', to: '/engagement' },
    { label: 'FAQ', to: '/abonnement' },
  ]},
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

.footer__logo {
  font-family: var(--font-display);
  font-size: 1.6rem; font-weight: 900;
  color: var(--jaune-vif); margin-bottom: .8rem;
}
.footer__logo span { color: var(--bleu-ciel); }
.footer__brand p { font-size: .86rem; color: rgba(255,255,255,.45); line-height: 1.65; margin-bottom: 1.2rem; }
.footer__socials { display: flex; gap: .7rem; }
.footer__social { font-size: 1.3rem; opacity: .5; transition: opacity .2s; }
.footer__social:hover { opacity: 1; }

.footer__col h4, .footer__contact h4 {
  font-family: var(--font-body); font-size: .72rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .12em;
  color: rgba(255,255,255,.3); margin-bottom: 1rem;
}
.footer__col li { margin-bottom: .55rem; }
.footer__col a { font-size: .86rem; color: rgba(255,255,255,.55); transition: color .18s; }
.footer__col a:hover { color: var(--jaune-vif); }

.footer__contact p { font-size: .86rem; color: rgba(255,255,255,.55); margin-bottom: .35rem; }
.footer__contact-note { font-size: .74rem !important; opacity: .4; margin-top: .5rem !important; }

.footer__bottom { border-top: 1px solid rgba(255,255,255,.08); }
.footer__bottom-inner {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 1.2rem; padding-bottom: 1.5rem;
  font-size: .76rem; color: rgba(255,255,255,.25);
  flex-wrap: wrap; gap: .5rem;
}
.footer__legal { display: flex; gap: 1.2rem; }
.footer__legal a { color: rgba(255,255,255,.3); transition: color .18s; }
.footer__legal a:hover { color: var(--jaune-vif); }

@media (max-width: 900px) {
  .footer__inner { grid-template-columns: 1fr 1fr; padding-top: 2rem; padding-bottom: 2rem; }
  .footer__brand { grid-column: 1/-1; }
}
@media (max-width: 500px) {
  .footer__inner { grid-template-columns: 1fr; }
  .footer__bottom-inner { flex-direction: column; text-align: center; }
}
</style>
