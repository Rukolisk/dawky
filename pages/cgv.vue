<!-- pages/cgv.vue — ⚠️ texte à faire valider juridiquement -->
<template>
  <PageTexte titre="Conditions générales de vente" mise-a-jour="novembre 2026" :sections="sections" />
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Conditions générales de vente — Dawky' })

const sections = [
  {
    titre: '1. Objet',
    paragraphes: [
      'Les présentes conditions générales de vente (CGV) régissent les ventes conclues sur le site dawky.fr entre la société Dawky (« Dawky ») et toute personne physique agissant en qualité de consommateur (« le Client »).',
      'Toute commande implique l\'acceptation des présentes CGV, cochée par le Client avant le paiement.',
    ],
  },
  {
    titre: '2. Offres',
    liste: [
      'Box Surprise : abonnement mensuel sans engagement. Chaque box contient des produits (friandise, mastication, jouet, accessoire) et une carte collector, adaptés à la taille du chien (S, M ou L). Le contenu exact reste une surprise.',
      'Compose ta box : commande unique de 5 produits choisis par le Client parmi les produits des mois précédents encore disponibles.',
      'Box saisonnières : commande unique, sans abonnement, pendant leur période de vente.',
      'Abonnement offert : Box Surprise prépayée pour une durée choisie (3, 6 ou 12 mois), livrée à l\'adresse indiquée par l\'acheteur, sans renouvellement automatique.',
    ],
  },
  {
    titre: '3. Prix et paiement',
    paragraphes: [
      'Les prix sont indiqués en euros toutes taxes comprises, livraison incluse en France métropolitaine. Le prix applicable est celui affiché au moment de la commande ; un changement de tarif ne s\'applique pas aux abonnements déjà souscrits.',
      'Le paiement s\'effectue par carte bancaire via notre prestataire Stripe. Dawky n\'a jamais accès aux données de carte. L\'abonnement est prélevé à la souscription puis chaque mois à la même date. Une facture est disponible dans l\'espace client.',
      'Les réductions (codes promo, parrainage) ne sont pas cumulables entre elles et s\'appliquent au premier paiement concerné.',
    ],
  },
  {
    titre: '4. Abonnement : changement, pause, résiliation',
    paragraphes: [
      'L\'abonnement est sans engagement. Depuis son espace client, le Client peut changer de taille (prise en compte dès la prochaine période), mettre l\'abonnement en pause pour une durée limitée, ou le résilier en un clic.',
      'La résiliation arrête les prélèvements futurs ; la période déjà payée reste due et sa box est livrée. Aucun remboursement n\'est dû pour une box déjà expédiée.',
    ],
  },
  {
    titre: '5. Livraison',
    paragraphes: [
      'Les Box Surprise et les abonnements offerts sont expédiés le 1er de chaque mois. Les commandes Compose ta box et box saisonnières sont expédiées sous 3 à 5 jours ouvrés.',
      'La livraison est offerte, à domicile ou en point relais, en France métropolitaine. Le Client (et, pour un cadeau, l\'acheteur) est prévenu par email de l\'expédition puis de la livraison.',
    ],
  },
  {
    titre: '6. Allergies',
    paragraphes: [
      'Le Client déclare les allergies de son chien dans sa fiche. Pour la Box Surprise, l\'équipe Dawky le contacte afin de valider un profil sans allergènes avant l\'expédition. Pour Compose ta box, la composition, les allergènes et les traces possibles de chaque produit sont affichés avant l\'achat.',
      'Ces informations ne remplacent pas l\'avis d\'un vétérinaire.',
    ],
  },
  {
    titre: '7. Droit de rétractation et garantie',
    paragraphes: [
      'Le Client dispose d\'un délai de 14 jours à compter de la réception pour exercer son droit de rétractation, sauf pour les denrées alimentaires ouvertes ou descellées, qui ne peuvent être retournées pour des raisons d\'hygiène.',
      'Garantie taille et satisfaction : si un produit ne convient pas à la taille du chien, Dawky propose un échange ou un geste commercial. Il suffit de nous écrire depuis la page contact.',
    ],
  },
  {
    titre: '8. Données personnelles',
    paragraphes: ['Le traitement des données est décrit dans notre politique de confidentialité, accessible en bas de chaque page.'],
  },
  {
    titre: '9. Litiges',
    paragraphes: [
      'Les présentes CGV sont soumises au droit français. En cas de litige, le Client peut recourir gratuitement à un médiateur de la consommation avant toute action en justice.',
    ],
  },
]
</script>
