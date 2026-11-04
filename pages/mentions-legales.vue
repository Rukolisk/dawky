<!-- pages/mentions-legales.vue — ⚠️ informations société à compléter -->
<template>
  <PageTexte titre="Mentions légales" :sections="sections" />
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Mentions légales — Dawky' })

const sections = [
  {
    titre: 'Éditeur',
    paragraphes: [
      'Le site dawky.fr est édité par Dawky, [forme juridique, capital, adresse du siège, numéro SIRET à compléter].',
      'Contact : contact@dawky.fr',
      'Directeur de la publication : [nom à compléter].',
    ],
  },
  {
    titre: 'Hébergement',
    paragraphes: [
      'Le site est hébergé en France sur un serveur de MyDigitalSchool. Les données des comptes clients sont hébergées par Supabase dans l\'Union européenne.',
    ],
  },
  {
    titre: 'Propriété intellectuelle',
    paragraphes: [
      'L\'ensemble des contenus du site (textes, photographies, logo, illustrations, cartes collector) est protégé par le droit d\'auteur. Toute reproduction sans autorisation préalable est interdite.',
    ],
  },
  {
    titre: 'Données personnelles et cookies',
    paragraphes: ['Voir notre politique de confidentialité et la page cookies, accessibles en bas de chaque page.'],
  },
]
</script>
