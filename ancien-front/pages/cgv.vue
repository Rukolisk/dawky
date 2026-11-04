<template>
  <div class="legal-page section">
    <div class="container-sm">
      <h1 class="display-md mb-7">Conditions Générales de Vente</h1>
      <p class="text-soft mb-6">Dernière mise à jour : {{ new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) }}</p>

      <div v-for="section in sections" :key="section.title" class="legal-block">
        <h2>{{ section.title }}</h2>
        <p v-for="p in section.paragraphs" :key="p">{{ p }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'CGV — Dawky' })

const sections = [
  {
    title: 'Article 1 — Objet',
    paragraphs: [
      'Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre la société Dawky SAS (ci-après "Dawky") et toute personne physique effectuant un achat sur le site dawky.fr (ci-après "le Client").',
      'Toute commande implique l\'acceptation sans réserve des présentes CGV.',
    ],
  },
  {
    title: 'Article 2 — Produits et services',
    paragraphs: [
      'Dawky propose deux types de box pour chiens : la Box Surprise (abonnement mensuel) et la Box À la Carte (commande ponctuelle). Chaque box contient 5 produits sélectionnés selon la taille du chien (XS, S, M, L).',
      'Les photographies et descriptions sont données à titre indicatif. Les produits inclus dans la Box Surprise peuvent varier chaque mois.',
    ],
  },
  {
    title: 'Article 3 — Prix',
    paragraphs: [
      'Les prix sont indiqués en euros TTC. Dawky se réserve le droit de modifier ses prix à tout moment, mais les commandes seront facturées au tarif en vigueur lors de la validation de la commande.',
      'La livraison est offerte pour toutes les commandes vers la France, la Belgique, la Suisse et le Luxembourg.',
    ],
  },
  {
    title: 'Article 4 — Abonnement et résiliation',
    paragraphs: [
      'L\'abonnement Box Surprise est sans engagement. Le Client peut résilier à tout moment depuis son espace client, sans frais. La résiliation prend effet à la fin du mois en cours.',
      'En cas de résiliation, le Client ne sera pas débité pour le mois suivant. Les box déjà préparées et expédiées ne peuvent être remboursées.',
    ],
  },
  {
    title: 'Article 5 — Livraison',
    paragraphs: [
      'Les box Surprise sont expédiées le 1er de chaque mois. Les commandes Box À la Carte sont expédiées sous 3 à 5 jours ouvrés.',
      'En cas d\'absence lors de la livraison, un avis de passage sera déposé et le colis sera mis en instance pendant 15 jours.',
    ],
  },
  {
    title: 'Article 6 — Retours et remboursements',
    paragraphs: [
      'Si votre chien n\'est pas satisfait d\'un produit, contactez-nous dans les 30 jours suivant la réception. Nous procéderons au remplacement ou au remboursement du produit concerné.',
      'Les produits de nutrition et friandises entamés ne peuvent pas être retournés pour des raisons d\'hygiène.',
    ],
  },
  {
    title: 'Article 7 — Données personnelles',
    paragraphs: [
      'Les données collectées sont utilisées uniquement pour le traitement de vos commandes et la gestion de votre abonnement. Elles ne sont jamais revendues à des tiers.',
      'Conformément au RGPD, vous pouvez exercer vos droits d\'accès, de rectification et de suppression en nous contactant à contact.dawky@gmail.com.',
    ],
  },
  {
    title: 'Article 8 — Droit applicable',
    paragraphs: [
      'Les présentes CGV sont soumises au droit français. Tout litige relatif à leur interprétation ou à leur exécution sera soumis aux tribunaux compétents.',
    ],
  },
]
</script>

<style scoped>
.legal-page { background: var(--cream); }
.legal-block {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin-bottom: var(--space-4);
  border: 2px solid var(--border);
}
.legal-block h2 {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: var(--space-3);
  color: var(--blue);
}
.legal-block p { color: var(--ink-soft); line-height: 1.7; margin-bottom: var(--space-3); }
.legal-block p:last-child { margin-bottom: 0; }
</style>
