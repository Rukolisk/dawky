<!-- pages/comment-dawky-adapte-ma-box.vue (F-32, US-24) -->
<template>
  <PageTexte
    surtitre="Personnalisation"
    titre="Comment Dawky adapte sa box"
    chapo="Taille, habitudes, allergies : voici concrètement ce que nous faisons de vos réponses."
    :sections="sections"
  >
    <div class="actions">
      <NuxtLink to="/quiz" class="btn btn-principal btn-grand">Faire le quiz</NuxtLink>
      <NuxtLink to="/compose-ta-box" class="lien">Composer une box sans allergène</NuxtLink>
    </div>
  </PageTexte>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Comment Dawky adapte la box à votre chien (taille, allergies)',
  description: 'Taille calculée selon le poids et la race, exclusion des allergènes, validation par l\'équipe : comment Dawky adapte chaque box.',
})

const sections = [
  {
    titre: '1. La taille, d\'après son poids et sa race',
    paragraphes: [
      'Moins de 10 kg : taille S. De 10 à 25 kg : taille M. Plus de 25 kg : taille L. Sa race sert de garde-fou : un chiot labrador de 8 kg reçoit déjà des jouets taille L, adaptés à sa future mâchoire.',
      'Exemple : Max, golden retriever de 32 kg, reçoit la box L et ses jouets pensés pour gros mâcheurs.',
    ],
  },
  {
    titre: '2. Ses habitudes',
    paragraphes: [
      'Un gros mâcheur très actif sera orienté vers Compose ta box, pour choisir lui-même les produits les plus robustes. Son niveau d\'activité nous aide aussi à composer les box des mois suivants.',
    ],
  },
  {
    titre: '3. Ses allergies',
    paragraphes: [
      'Vous cochez ses allergies parmi les plus courantes (poulet, bœuf, céréales, poisson…) ou en saisissez une autre, et indiquez s\'il est sensible aux traces.',
      'Box Surprise : notre équipe vous contacte pour valider avec vous un profil sans allergènes, puis vérifie avant chaque expédition qu\'aucun produit de sa box ne contient ses allergènes.',
      'Compose ta box : les produits contenant ses allergènes sont filtrés automatiquement, chaque produit affiche sa composition et ses traces, et votre panier est vérifié avant le paiement.',
      'Exemple : Pixel, bichon de 5 kg allergique au poulet, voit uniquement des produits taille S sans poulet, avec une vérification « aucun poulet ni trace dans votre sélection ».',
    ],
  },
  {
    titre: '4. Au fil du temps',
    paragraphes: [
      'Mettez à jour son poids dans votre espace client : si sa taille change, nous vous le signalons et vous changez de box en un clic, dès la prochaine période.',
    ],
  },
]
</script>

<style scoped>
.actions {
  display: flex;
  align-items: center;
  gap: var(--e3);
  flex-wrap: wrap;
  padding-top: var(--e2);
}
</style>
