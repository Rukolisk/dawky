<template>
  <div class="contact-page">
    <div class="contact-hero">
      <div class="container text-center">
        <span class="badge badge-blue">📬 On vous répond en 24h</span>
        <h1 class="display-md mt-3 mb-3 text-white">Contactez-nous</h1>
        <p class="text-xl contact-hero-sub">Une question sur votre box, votre commande ou votre chien ? On est là !</p>
      </div>
    </div>

    <div class="container contact-body">
      <div class="contact-grid">
        <!-- Formulaire -->
        <div class="contact-form-card">
          <h2 class="contact-form-title">Envoyez-nous un message</h2>

          <div v-if="sent" class="contact-success">
            <img :src="images.mascotte_6" alt="" class="success-mascot animate-float" />
            <h3>Message envoyé ! 🎉</h3>
            <p class="text-soft">On vous répond dans les 24 heures.</p>
            <button class="btn btn-outline mt-4" @click="sent = false">Nouveau message</button>
          </div>

          <form v-else @submit.prevent="handleSubmit" class="contact-form">
            <div class="contact-form-row">
              <div class="form-group">
                <label class="form-label">Prénom *</label>
                <input v-model="form.prenom" type="text" class="form-input" placeholder="Marie" required />
              </div>
              <div class="form-group">
                <label class="form-label">Nom *</label>
                <input v-model="form.nom" type="text" class="form-input" placeholder="Dupont" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Email *</label>
              <input v-model="form.email" type="email" class="form-input" placeholder="votre@email.fr" required />
            </div>
            <div class="form-group">
              <label class="form-label">Sujet *</label>
              <select v-model="form.sujet" class="form-select" required>
                <option value="">— Choisissez un sujet —</option>
                <option value="Ma commande">Ma commande</option>
                <option value="Mon abonnement">Mon abonnement</option>
                <option value="Un produit">Un produit</option>
                <option value="Livraison">Livraison</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Votre chien (facultatif)</label>
              <input v-model="form.chien" type="text" class="form-input" placeholder="Ex: Max, Labrador 3 ans" />
            </div>
            <div class="form-group">
              <label class="form-label">Message *</label>
              <textarea v-model="form.message" class="form-textarea" rows="5" placeholder="Décrivez votre demande…" required />
            </div>
            <p v-if="error" class="form-error">{{ error }}</p>
            <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="loading">
              {{ loading ? 'Envoi…' : '✉️ Envoyer le message' }}
            </button>
          </form>
        </div>

        <!-- Infos contact -->
        <div class="contact-infos">
          <div v-for="info in contactInfos" :key="info.label" class="contact-info-card">
            <span class="contact-info-icon">{{ info.icon }}</span>
            <div>
              <p class="font-semibold">{{ info.label }}</p>
              <p class="text-sm text-soft">{{ info.value }}</p>
            </div>
          </div>

          <div class="contact-faq-teaser">
            <h3>FAQ rapide 🐾</h3>
            <div v-for="faq in faqs" :key="faq.q" class="faq-item">
              <button class="faq-q" @click="toggleFaq(faq.q)">
                <span>{{ faq.q }}</span>
                <span class="faq-arrow" :class="{ open: openFaq === faq.q }">›</span>
              </button>
              <p v-if="openFaq === faq.q" class="faq-a animate-fade-in-up">{{ faq.a }}</p>
            </div>
          </div>

          <div class="contact-social">
            <p class="font-semibold mb-3">Suivez-nous :</p>
            <div class="social-links">
              <a href="https://instagram.com/dawky" target="_blank" class="social-pill">📸 Instagram</a>
              <a href="https://facebook.com/dawky" target="_blank" class="social-pill">👍 Facebook</a>
              <a href="https://tiktok.com/@dawky" target="_blank" class="social-pill">🎵 TikTok</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { dawkyImages } from '~/composables/useDawkyImages'
const images = dawkyImages

useSeoMeta({ title: 'Contact — Dawky', description: 'Contactez l\'équipe Dawky pour toute question sur votre box, commande ou abonnement.' })

const sent = ref(false); const loading = ref(false); const error = ref(''); const openFaq = ref('')
const form = reactive({ prenom: '', nom: '', email: '', sujet: '', chien: '', message: '' })

const contactInfos = [
  { icon: '📧', label: 'Email', value: 'contact.dawky@gmail.com' },
  { icon: '⏰', label: 'Réponse', value: 'Sous 24h en semaine' },
  { icon: '📍', label: 'Localisation', value: 'France métropolitaine' },
]

const faqs = [
  { q: 'Quand est expédiée ma box ?', a: 'Les box Surprise sont expédiées le 1er de chaque mois. Les commandes À la Carte sous 3–5 jours ouvrés.' },
  { q: 'Comment modifier ma box ?', a: 'Pour la Box Surprise, votre profil est mis à jour automatiquement. Pour la Box À la Carte, vous pouvez modifier votre sélection depuis votre espace client.' },
  { q: 'Comment résilier ?', a: 'Depuis votre espace "Mon abonnement", cliquez sur "Résilier". Aucun engagement, résiliation en 1 clic.' },
  { q: 'Mon chien a des allergies, que faire ?', a: 'Nous recommandons la Box À la Carte pour contrôler les ingrédients. Indiquez également les allergies dans votre profil.' },
]

function toggleFaq(q: string) { openFaq.value = openFaq.value === q ? '' : q }

async function handleSubmit() {
  error.value = ''; loading.value = true
  try {
    await $fetch('/api/contact', { method: 'POST', body: form })
    sent.value = true
    Object.assign(form, { prenom: '', nom: '', email: '', sujet: '', chien: '', message: '' })
  } catch (e: any) { error.value = e?.data?.message ?? 'Erreur lors de l\'envoi.' }
  finally { loading.value = false }
}
</script>

<style scoped>
.contact-hero {
  background: linear-gradient(135deg, var(--blue) 0%, var(--blue-deep) 100%);
  padding: var(--space-9) 0 var(--space-8);
}
.contact-hero-sub { color: rgba(255,255,255,0.8); }

.contact-body { padding: var(--space-8) 0 var(--space-9); }
.contact-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: var(--space-7); align-items: start; }

.contact-form-card { background: white; border-radius: var(--radius-xl); padding: var(--space-7); border: 2px solid var(--border); box-shadow: var(--shadow-md); }
.contact-form-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; margin-bottom: var(--space-5); }

.contact-success { text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-6) 0; }
.success-mascot { width: 140px; }

.contact-form { display: flex; flex-direction: column; gap: var(--space-4); }
.contact-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }

.contact-infos { display: flex; flex-direction: column; gap: var(--space-4); }

.contact-info-card {
  display: flex; align-items: center; gap: var(--space-4);
  background: white; border: 2px solid var(--border); border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-5);
}
.contact-info-icon { font-size: 1.75rem; flex-shrink: 0; }

.contact-faq-teaser { background: var(--cream); border-radius: var(--radius-xl); padding: var(--space-5); }
.contact-faq-teaser h3 { font-family: var(--font-display); font-size: 1.125rem; font-weight: 700; margin-bottom: var(--space-4); }
.faq-item { border-bottom: 1px solid var(--border); }
.faq-item:last-child { border-bottom: none; }
.faq-q {
  display: flex; align-items: center; justify-content: space-between; width: 100%;
  padding: var(--space-3) 0; background: none; border: none; cursor: pointer;
  font-family: var(--font-body); font-size: 0.9375rem; font-weight: 600; text-align: left; gap: var(--space-3);
}
.faq-arrow { font-size: 1.25rem; color: var(--blue); transition: transform 0.2s; flex-shrink: 0; }
.faq-arrow.open { transform: rotate(90deg); }
.faq-a { font-size: 0.875rem; color: var(--ink-soft); line-height: 1.6; padding-bottom: var(--space-3); }

.contact-social { background: white; border-radius: var(--radius-xl); padding: var(--space-5); border: 2px solid var(--border); }
.social-links { display: flex; gap: var(--space-3); flex-wrap: wrap; }
.social-pill {
  padding: 8px 16px; border-radius: var(--radius-pill);
  background: var(--cream); border: 1px solid var(--border);
  font-size: 0.875rem; font-weight: 600; color: var(--ink);
  text-decoration: none; transition: all var(--duration-fast);
}
.social-pill:hover { border-color: var(--blue); color: var(--blue); }

@media (max-width: 768px) {
  .contact-grid { grid-template-columns: 1fr; }
  .contact-form-row { grid-template-columns: 1fr; }
}
</style>
