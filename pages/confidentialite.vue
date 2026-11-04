<!-- pages/confidentialite.vue — politique de confidentialité (RGPD),
     d'après le dossier technique. ⚠️ À faire valider. -->
<template>
  <PageTexte
    titre="Politique de confidentialité"
    chapo="Les données que nous collectons, pourquoi, combien de temps, et comment exercer vos droits."
    mise-a-jour="novembre 2026"
    :sections="sections"
  />
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Politique de confidentialité — Dawky' })

const sections = [
  {
    titre: 'Données collectées',
    tableau: {
      colonnes: ['Donnée', 'Finalité', 'Base légale', 'Conservation'],
      lignes: [
        ['Email, prénom, nom', 'Gestion du compte, livraison', 'Exécution du contrat', '3 ans après la dernière activité'],
        ['Adresse postale (y compris d\'un destinataire de cadeau)', 'Livraison des box', 'Exécution du contrat', 'Durée de l\'abonnement + 1 an'],
        ['Données du chien (race, date de naissance, poids, allergies)', 'Adapter et sécuriser la box, email d\'anniversaire', 'Exécution du contrat, consentement sur la fiche chien', '3 ans après la dernière activité'],
        ['Commandes et factures', 'Comptabilité', 'Obligation légale', '10 ans'],
        ['Email newsletter', 'Actualités Dawky', 'Consentement', 'Jusqu\'à la désinscription'],
        ['Réponses au quiz', 'Améliorer nos recommandations', 'Intérêt légitime', '1 an'],
      ],
    },
  },
  {
    titre: 'Vos droits',
    liste: [
      'Accès et rectification : depuis votre espace client, rubrique « Mon compte ».',
      'Portabilité : bouton « Télécharger mes données » dans « Mon compte » (fichier JSON).',
      'Effacement : bouton « Supprimer mon compte ». Vos données personnelles sont effacées ; les factures sont conservées de façon anonyme (obligation légale).',
      'Retrait du consentement : lien de désinscription dans chaque newsletter, suppression de la fiche chien depuis votre espace.',
      'Pour toute autre demande : contact@dawky.fr. Vous pouvez aussi saisir la CNIL (cnil.fr).',
    ],
  },
  {
    titre: 'Sous-traitants',
    tableau: {
      colonnes: ['Prestataire', 'Service', 'Localisation'],
      lignes: [
        ['Supabase', 'Base de données et comptes', 'Union européenne'],
        ['Stripe', 'Paiement et facturation', 'UE / États-Unis (clauses contractuelles types)'],
        ['Resend', 'Envoi des emails', 'États-Unis (clauses contractuelles types)'],
        ['MyDigitalSchool', 'Hébergement du site', 'France'],
      ],
    },
  },
  {
    titre: 'Sécurité',
    paragraphes: [
      'Les mots de passe sont chiffrés et ne sont jamais stockés en clair. Les échanges avec le site sont chiffrés (HTTPS). Les données bancaires sont saisies chez Stripe et ne transitent jamais par nos serveurs.',
    ],
  },
]
</script>
