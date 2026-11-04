<template>
  <footer class="footer">
    <!-- Vague décorative -->
    <div class="footer-wave">
      <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="#1A1A2E"/>
      </svg>
    </div>

    <div class="footer-body">
      <div class="container">
        <div class="footer-grid">
          <!-- Brand -->
          <div class="footer-brand">
            <img :src="images.logo_dawky_blanc" alt="Dawky" class="footer-logo" />
            <p class="footer-tagline">La box pour chiens qui s'adapte à votre compagnon 🐾</p>
            <div class="footer-social">
              <a href="https://instagram.com/dawky" target="_blank" rel="noopener" class="social-link" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://facebook.com/dawky" target="_blank" rel="noopener" class="social-link" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://tiktok.com/@dawky" target="_blank" rel="noopener" class="social-link" aria-label="TikTok">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>
              </a>
            </div>
          </div>

          <!-- Links -->
          <div class="footer-links-group">
            <h4 class="footer-heading">Nos offres</h4>
            <ul class="footer-links">
              <li><NuxtLink to="/offres" class="footer-link">Box Surprise</NuxtLink></li>
              <li><NuxtLink to="/offres" class="footer-link">Box À la Carte</NuxtLink></li>
              <li><NuxtLink to="/quiz" class="footer-link">Quiz 🐾</NuxtLink></li>
              <li><NuxtLink to="/comment-ca-marche" class="footer-link">Comment ça marche</NuxtLink></li>
            </ul>
          </div>

          <div class="footer-links-group">
            <h4 class="footer-heading">Mon compte</h4>
            <ul class="footer-links">
              <li><NuxtLink to="/connexion" class="footer-link">Connexion</NuxtLink></li>
              <li><NuxtLink to="/mon-compte" class="footer-link">Mon espace</NuxtLink></li>
              <li><NuxtLink to="/mon-compte/abonnement" class="footer-link">Mon abonnement</NuxtLink></li>
              <li><NuxtLink to="/mon-compte/commandes" class="footer-link">Mes commandes</NuxtLink></li>
            </ul>
          </div>

          <div class="footer-links-group">
            <h4 class="footer-heading">Aide</h4>
            <ul class="footer-links">
              <li><NuxtLink to="/contact" class="footer-link">Contact</NuxtLink></li>
              <li><NuxtLink to="/faq" class="footer-link">FAQ</NuxtLink></li>
              <li><NuxtLink to="/mentions-legales" class="footer-link">Mentions légales</NuxtLink></li>
              <li><NuxtLink to="/cgv" class="footer-link">CGV</NuxtLink></li>
            </ul>
          </div>
        </div>

        <!-- Newsletter -->
        <div class="footer-newsletter">
          <div class="footer-newsletter-inner">
            <div class="footer-newsletter-text">
              <span class="footer-newsletter-emoji">🐾</span>
              <div>
                <p class="footer-newsletter-title">Newsletter Dawky</p>
                <p class="footer-newsletter-sub">Actus, conseils, et surprises pour votre chien</p>
              </div>
            </div>
            <form class="footer-newsletter-form" @submit.prevent="subscribeNewsletter">
              <input
                v-model="nlEmail"
                type="email"
                placeholder="votre@email.fr"
                class="footer-nl-input"
                required
              />
              <button type="submit" class="btn btn-yellow btn-sm" :disabled="nlLoading">
                {{ nlLoading ? '…' : "S'inscrire" }}
              </button>
            </form>
          </div>
        </div>

        <div class="footer-bottom">
          <p class="footer-copy">© {{ new Date().getFullYear() }} Dawky · Fait avec ❤️ pour les chiens</p>
          <div class="footer-mascot-small">
            <img :src="images.picto_truffe_blanc" alt="" />
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { dawkyImages } from '~/composables/useDawkyImages'
const images = dawkyImages
const nlEmail = ref('')
const nlLoading = ref(false)
const nlDone = ref(false)

async function subscribeNewsletter() {
  nlLoading.value = true
  try {
    await $fetch('/api/newsletter', { method: 'POST', body: { email: nlEmail.value } })
    nlDone.value = true
    nlEmail.value = ''
  } catch {}
  finally { nlLoading.value = false }
}
</script>

<style scoped>
.footer { position: relative; margin-top: var(--space-10); }

.footer-wave {
  margin-bottom: -4px;
  line-height: 0;
}
.footer-wave svg { width: 100%; display: block; }

.footer-body {
  background: var(--ink);
  padding: var(--space-9) 0 var(--space-6);
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: var(--space-7);
  padding-bottom: var(--space-7);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.footer-logo { height: 32px; width: auto; margin-bottom: var(--space-3); }

.footer-tagline {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.55);
  line-height: 1.5;
  margin-bottom: var(--space-4);
  max-width: 240px;
}

.footer-social { display: flex; gap: var(--space-3); }

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px; height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.6);
  transition: all var(--duration-fast);
  text-decoration: none;
}
.social-link:hover {
  background: var(--blue);
  color: white;
  transform: translateY(-2px);
}

.footer-heading {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--blue);
  margin-bottom: var(--space-4);
}

.footer-links { list-style: none; display: flex; flex-direction: column; gap: var(--space-2); }

.footer-link {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.55);
  text-decoration: none;
  transition: color var(--duration-fast);
}
.footer-link:hover { color: white; }

/* Newsletter */
.footer-newsletter {
  padding: var(--space-5) 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.footer-newsletter-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-5);
  flex-wrap: wrap;
}

.footer-newsletter-text {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.footer-newsletter-emoji { font-size: 2rem; }

.footer-newsletter-title {
  font-weight: 700;
  color: white;
  font-size: 1rem;
}

.footer-newsletter-sub {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.5);
}

.footer-newsletter-form {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.footer-nl-input {
  padding: 10px 18px;
  border: 2px solid rgba(255,255,255,0.15);
  border-radius: var(--radius-pill);
  background: rgba(255,255,255,0.06);
  color: white;
  font-family: var(--font-body);
  font-size: 0.9rem;
  outline: none;
  min-width: 220px;
  transition: border-color var(--duration-fast);
}
.footer-nl-input::placeholder { color: rgba(255,255,255,0.35); }
.footer-nl-input:focus { border-color: var(--blue); }

/* Bottom */
.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-5);
}

.footer-copy {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.3);
}

.footer-mascot-small img {
  height: 28px;
  opacity: 0.2;
  filter: brightness(10);
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-6);
  }
  .footer-brand { grid-column: 1 / -1; }
  .footer-newsletter-inner { flex-direction: column; align-items: flex-start; }
  .footer-nl-input { min-width: 0; width: 100%; }
  .footer-newsletter-form { width: 100%; }
}

@media (max-width: 480px) {
  .footer-grid { grid-template-columns: 1fr; }
}
</style>
