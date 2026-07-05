<template>
  <div class="faq-page">
    <div class="faq-hero">
      <div class="container text-center">
        <span class="badge badge-blue">❓ On répond à tout</span>
        <h1 class="display-md text-white mt-3 mb-3">Questions fréquentes</h1>
        <p class="text-xl faq-hero-sub">Trouvez rapidement la réponse à votre question 🐾</p>
        <div class="faq-search">
          <input v-model="search" type="text" placeholder="Rechercher une question…" class="faq-search-input" />
          <span class="faq-search-icon">🔍</span>
        </div>
      </div>
    </div>

    <div class="container faq-body">
      <div v-for="cat in filteredCategories" :key="cat.title" class="faq-cat">
        <h2 class="faq-cat-title">{{ cat.icon }} {{ cat.title }}</h2>
        <div class="faq-list">
          <div v-for="faq in cat.faqs" :key="faq.q" class="faq-card">
            <button class="faq-btn" @click="toggle(cat.title + faq.q)">
              <span class="faq-question">{{ faq.q }}</span>
              <span class="faq-icon" :class="{ open: open === cat.title + faq.q }">+</span>
            </button>
            <div v-if="open === cat.title + faq.q" class="faq-answer animate-fade-in-up">{{ faq.a }}</div>
          </div>
        </div>
      </div>

      <div v-if="filteredCategories.length === 0" class="faq-empty">
        <img :src="images.mascotte_5" alt="" class="faq-empty-img" />
        <p>Aucun résultat pour "{{ search }}"</p>
        <NuxtLink to="/contact" class="btn btn-primary mt-4">Poser ma question</NuxtLink>
      </div>

      <div class="faq-contact-cta">
        <h3>Vous n'avez pas trouvé votre réponse ?</h3>
        <p class="text-soft mt-2 mb-4">Notre équipe vous répond en moins de 24h.</p>
        <NuxtLink to="/contact" class="btn btn-primary">✉️ Nous contacter</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { dawkyImages } from '~/composables/useDawkyImages'
const images = dawkyImages

useSeoMeta({ title: 'FAQ — Dawky', description: 'Toutes les réponses à vos questions sur les box Dawky pour chiens.' })

const search = ref('')
const open = ref('')
function toggle(key: string) { open.value = open.value === key ? '' : key }

const categories = [
  {
    icon: '📦', title: 'La box',
    faqs: [
      { q: 'Qu\'est-ce que la Box Surprise ?', a: 'La Box Surprise est une box mensuelle contenant 5 produits soigneusement sélectionnés par nos experts, adaptés à la taille de votre chien. Le contenu varie chaque mois pour que votre chien découvre toujours de nouvelles surprises !' },
      { q: 'Qu\'est-ce que la Box À la Carte ?', a: 'La Box À la Carte vous permet de choisir vous-même vos 5 produits dans notre catalogue. Idéale pour les chiens avec des allergies ou des préférences particulières. C\'est une commande ponctuelle, sans abonnement.' },
      { q: 'Combien de produits sont dans chaque box ?', a: 'Chaque box contient exactement 5 produits : jouets, friandises, soins, mastication, accessoires… Nous veillons à proposer une variété de catégories pour stimuler votre chien.' },
      { q: 'Quelle taille choisir pour mon chien ?', a: 'Nous avons 4 tailles : XS (moins de 5 kg), S (5 à 10 kg), M (10 à 25 kg) et L (plus de 25 kg). Faites notre quiz gratuit pour une recommandation personnalisée !' },
    ],
  },
  {
    icon: '🚚', title: 'Livraison',
    faqs: [
      { q: 'Quand est expédiée ma box ?', a: 'La Box Surprise est expédiée le 1er de chaque mois. Pour la Box À la Carte, l\'expédition a lieu sous 3 à 5 jours ouvrés après votre commande.' },
      { q: 'La livraison est-elle gratuite ?', a: 'Oui ! La livraison est offerte pour toutes les commandes en France métropolitaine, Belgique, Suisse et Luxembourg.' },
      { q: 'Livrez-vous à l\'international ?', a: 'Actuellement, nous livrons en France, Belgique, Suisse et Luxembourg. D\'autres pays seront bientôt disponibles.' },
      { q: 'Comment suivre ma commande ?', a: 'Dès l\'expédition de votre box, vous recevez un email avec un numéro de suivi. Vous pouvez également consulter l\'avancement depuis votre espace client.' },
    ],
  },
  {
    icon: '💳', title: 'Abonnement & paiement',
    faqs: [
      { q: 'Comment fonctionne l\'abonnement ?', a: 'L\'abonnement Box Surprise est mensuel et sans engagement. Vous êtes prélevé le 1er de chaque mois. Vous pouvez résilier à tout moment depuis votre espace client.' },
      { q: 'Comment résilier mon abonnement ?', a: 'Rendez-vous dans votre espace client > Mon abonnement > Résilier. La résiliation est immédiate et sans frais. Elle prend effet à la fin du mois en cours.' },
      { q: 'Puis-je mettre mon abonnement en pause ?', a: 'Oui ! Depuis votre espace client, vous pouvez mettre votre abonnement en pause pour 1, 2 ou 3 mois. Pratique en cas de vacances ou d\'imprévu.' },
      { q: 'Quels moyens de paiement acceptez-vous ?', a: 'Nous acceptons les cartes bancaires Visa, Mastercard et American Express. Les paiements sont sécurisés par Stripe.' },
    ],
  },
  {
    icon: '🐾', title: 'Mon chien',
    faqs: [
      { q: 'La box est-elle adaptée aux chiots ?', a: 'Oui ! Précisez l\'âge de votre chien dans votre profil. Pour les chiots (moins d\'un an), nous sélectionnons des produits adaptés : jouets plus doux, friandises pour jeunes chiens.' },
      { q: 'Mon chien a des allergies, que faire ?', a: 'Nous recommandons la Box À la Carte pour les chiens allergiques, car vous contrôlez exactement les produits reçus. Renseignez également les allergies dans votre profil pour que nos équipes en soient informées.' },
      { q: 'Les produits sont-ils naturels et sûrs ?', a: 'Absolument. Nous sélectionnons uniquement des produits naturels, sans additifs chimiques, testés et approuvés pour les chiens. Toutes nos friandises sont fabriquées en Europe.' },
      { q: 'Mon chien n\'aime pas un produit, que faire ?', a: 'Contactez-nous dans les 30 jours suivant la réception. Nous procéderons au remplacement ou au remboursement du produit concerné, sans question posée.' },
    ],
  },
]

const filteredCategories = computed(() => {
  if (!search.value.trim()) return categories
  const q = search.value.toLowerCase()
  return categories.map(cat => ({
    ...cat,
    faqs: cat.faqs.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)),
  })).filter(cat => cat.faqs.length > 0)
})
</script>

<style scoped>
.faq-hero {
  background: var(--blue);
  padding: var(--space-9) 0 var(--space-8);
}
.faq-hero-sub { color: rgba(255,255,255,0.8); }

.faq-search {
  position: relative;
  max-width: 480px;
  margin: var(--space-5) auto 0;
}
.faq-search-input {
  width: 100%;
  padding: 16px 48px 16px 20px;
  border-radius: var(--radius-pill);
  border: none;
  font-family: var(--font-body);
  font-size: 1rem;
  outline: none;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
}
.faq-search-icon {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.125rem;
}

.faq-body { padding: var(--space-8) 0 var(--space-9); }

.faq-cat { margin-bottom: var(--space-7); }
.faq-cat-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; margin-bottom: var(--space-4); }

.faq-list { background: white; border-radius: var(--radius-xl); border: 2px solid var(--border); overflow: hidden; }
.faq-card { border-bottom: 1px solid var(--border); }
.faq-card:last-child { border-bottom: none; }
.faq-btn {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: var(--space-5);
  background: none; border: none; cursor: pointer;
  font-family: var(--font-body); gap: var(--space-4); text-align: left;
  transition: background var(--duration-fast);
}
.faq-btn:hover { background: var(--cream); }
.faq-question { font-size: 1rem; font-weight: 600; }
.faq-icon { font-size: 1.5rem; color: var(--blue); flex-shrink: 0; transition: transform 0.25s; font-weight: 300; }
.faq-icon.open { transform: rotate(45deg); }
.faq-answer { padding: 0 var(--space-5) var(--space-5); font-size: 0.9375rem; color: var(--ink-soft); line-height: 1.7; }

.faq-empty { text-align: center; padding: var(--space-9) 0; display: flex; flex-direction: column; align-items: center; }
.faq-empty-img { width: 140px; margin-bottom: var(--space-4); }

.faq-contact-cta {
  text-align: center;
  background: var(--yellow-pale);
  border: 2px solid rgba(255,187,51,0.2);
  border-radius: var(--radius-xl);
  padding: var(--space-7);
  margin-top: var(--space-8);
}
.faq-contact-cta h3 { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; }
</style>
