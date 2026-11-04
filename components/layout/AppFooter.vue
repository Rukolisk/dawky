<!-- components/layout/AppFooter.vue -->
<template>
  <footer class="footer fond-burgundy">
    <div class="conteneur">
      <div class="footer-haut">
        <div class="footer-marque">
          <LogoDawky :hauteur="66" />
          <p>La box surprise qui s'adapte à votre chien.</p>
        </div>
        <nav v-for="col in colonnes" :key="col.titre" class="footer-col" :aria-label="col.titre">
          <p class="footer-titre">{{ col.titre }}</p>
          <NuxtLink v-for="l in col.liens" :key="l.to" :to="l.to">{{ l.label }}</NuxtLink>
        </nav>
      </div>

      <div class="footer-milieu">
        <NewsletterForm />
        <div class="reseaux">
          <a v-for="r in reseaux" :key="r.nom" :href="r.url" target="_blank" rel="noopener" class="reseau">{{ r.nom }}</a>
        </div>
      </div>

      <div class="footer-bas">
        <p>© {{ annee }} Dawky. Paiement sécurisé.</p>
        <nav aria-label="Informations légales" class="footer-legal">
          <NuxtLink to="/cgv">CGV</NuxtLink>
          <NuxtLink to="/mentions-legales">Mentions légales</NuxtLink>
          <NuxtLink to="/confidentialite">Confidentialité</NuxtLink>
          <NuxtLink to="/cookies">Cookies</NuxtLink>
        </nav>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const annee = new Date().getFullYear()

const colonnes = [
  {
    titre: 'Nos offres',
    liens: [
      { to: '/nos-formules', label: 'Box Surprise' },
      { to: '/compose-ta-box', label: 'Compose ta box' },
      { to: '/offrir', label: 'Offrir une box' },
      { to: '/quiz', label: 'Le quiz' },
    ],
  },
  {
    titre: 'Mon compte',
    liens: [
      { to: '/connexion', label: 'Connexion' },
      { to: '/mon-compte', label: 'Mon abonnement' },
      { to: '/mon-compte/commandes', label: 'Mes commandes' },
      { to: '/mon-compte/parrainage', label: 'Parrainage' },
    ],
  },
  {
    titre: 'Aide',
    liens: [
      { to: '/aide', label: 'FAQ' },
      { to: '/aide#contact', label: 'Contact' },
      { to: '/securite-qualite', label: 'Sécurité et qualité' },
      { to: '/comment-dawky-adapte-ma-box', label: 'Comment Dawky adapte ma box' },
    ],
  },
]

// ⚠️ Remplacer par les vraies adresses des comptes Dawky
const reseaux = [
  { nom: 'Instagram', url: 'https://www.instagram.com/' },
  { nom: 'Facebook', url: 'https://www.facebook.com/' },
  { nom: 'TikTok', url: 'https://www.tiktok.com/' },
]
</script>

<style scoped>
.footer {
  padding-block: var(--e6) var(--e4);
  font-size: 16px;
}
.footer a {
  color: var(--blanc);
  text-underline-offset: 3px;
}
.footer-haut {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gouttiere);
  padding-bottom: var(--e5);
  border-bottom: 1px solid var(--blanc);
}
.footer-marque {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
  max-width: 260px;
}
.footer-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}
.footer-titre {
  font-weight: 700;
  margin-bottom: 6px;
}
.footer-milieu {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--e3);
  flex-wrap: wrap;
  padding-block: var(--e4);
}
.reseaux {
  display: flex;
  gap: var(--e1);
  flex-wrap: wrap;
}
.reseau {
  border: 1px solid var(--blanc);
  border-radius: 999px;
  padding: 10px 18px;
  text-decoration: none;
  min-height: var(--tactile);
  display: inline-flex;
  align-items: center;
}
.footer-bas {
  display: flex;
  justify-content: space-between;
  gap: var(--e2);
  flex-wrap: wrap;
  font-size: 15px;
}
.footer-legal {
  display: flex;
  gap: var(--e3);
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .footer-haut {
    grid-template-columns: 1fr 1fr;
    row-gap: var(--e4);
  }
  .footer-marque {
    grid-column: 1 / -1;
    max-width: none;
  }
}
</style>
