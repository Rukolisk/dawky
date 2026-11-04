// composables/contenus.ts
// Textes éditoriaux partagés (FAQ). ⚠️ À faire valider par l'équipe Dawky.

export const FAQ_GENERALE = [
  {
    question: 'Quand suis-je prélevé ?',
    reponse: 'Le premier mois est payé à la souscription, puis chaque mois à la même date. La box part le 1er du mois suivant.',
  },
  {
    question: 'Puis-je résilier à tout moment ?',
    reponse: 'Oui, sans engagement. La résiliation se fait en un clic depuis votre espace client ; le mois déjà payé reste livré.',
  },
  {
    question: 'Comment gérez-vous les allergies ?',
    reponse: 'Vous déclarez les allergies de votre chien dans le quiz. Notre équipe vous contacte pour valider un profil sans allergènes avant l\'expédition. Avec Compose ta box, vous filtrez vous-même les allergènes et consultez la composition de chaque produit.',
  },
  {
    question: 'La box est-elle adaptée aux chiots ?',
    reponse: 'Oui. Indiquez son âge et son poids actuel : le quiz tient compte de sa race pour lui proposer des jouets adaptés à sa future mâchoire. Mettez son poids à jour au fil de sa croissance.',
  },
  {
    question: 'Que faire si mon chien n\'aime pas un produit ?',
    reponse: 'Notre garantie taille et satisfaction prévoit un échange ou un geste commercial. Écrivez-nous depuis la page contact.',
  },
  {
    question: 'Livrez-vous hors de France ?',
    reponse: 'Pour le moment, nous livrons en France métropolitaine, à domicile ou en point relais.',
  },
]

export const FAQ_FORMULES = [
  FAQ_GENERALE[0]!,
  FAQ_GENERALE[1]!,
  FAQ_GENERALE[2]!,
  {
    question: 'La taille ne convient pas, que faire ?',
    reponse: 'Changez de taille depuis votre espace client : elle s\'applique dès la prochaine box. Si la box reçue ne convient pas, notre garantie taille et satisfaction prévoit un échange.',
  },
]
