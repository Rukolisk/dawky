# Backend Dawky

API Nuxt 3 / Nitro (`server/`), Prisma 7 + PostgreSQL (Supabase), Supabase Auth, Stripe, Resend.

## Mise en route

1. Variables d'environnement : voir `.env.example`. Nouvelles variables : `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `EMAIL_EQUIPE`.
2. Base de données, en repartant de zéro (⚠️ efface toutes les données) :
   ```bash
   npm run db:reset      # applique prisma/migrations/20261104000000_init
   npm run db:seed       # allergènes, formules, produits, stock, code BIENVENUE10
   ```
3. Compte admin : inscrivez-vous sur le site, puis `ADMIN_EMAIL=vous@exemple.fr npm run db:seed`.
4. Stripe en local : `stripe listen --forward-to localhost:3000/api/webhooks/paiement`, puis copiez le `whsec_…` affiché dans `STRIPE_WEBHOOK_SECRET`.
   En production, créez l'endpoint `https://dawky.fr/api/webhooks/paiement` dans le dashboard Stripe avec les événements listés dans `.env.example`.
   Pour le rappel avant renouvellement, réglez le délai de l'événement `invoice.upcoming` dans Stripe (Paramètres > Facturation > Abonnements).
5. Portail client Stripe (changement de carte) : activez-le dans le dashboard Stripe, Paramètres > Facturation > Portail client.
6. Photos d'avis : bucket **public** `avis` dans Supabase Storage (5 Mo max, JPEG/PNG/WebP). Déjà créé sur le projet de dev, à créer sur le projet de prod.
7. Tests : `npm test`.

## Conventions

- **Montants en centimes** (`2990` = 29,90 €), partout dans l'API et la base.
- Tailles : `S`, `M`, `L` uniquement. Les seuils de poids (10 kg / 25 kg par défaut) sont réglables.
- Mois : `"YYYY-MM"`.
- Réponses : `{ success, message, data }`. Erreurs : `statusCode` + `statusMessage` en français, et le détail par champ dans `data` en cas d'erreur de validation.
- Authentification : en-tête `Authorization: Bearer <access_token Supabase>` (ajouté par `plugins/api.client.ts`).

## Cycle mensuel (back-office)

```
Box du mois (BROUILLON) ─ valider ─▶ VALIDEE ─ expédier ─▶ EXPEDIEE ─ clôturer ─▶ CLOTUREE
  3 tailles S/M/L          contrôle       1 commande / abonné     stock restant
  sauvegarde par taille    allergènes     et / cadeau, stock      → lots invendus
                           + stock        décrémenté              → Compose ta box
```

- **Valider** renvoie un 409 avec le détail lorsqu'un abonné recevrait son allergène, qu'un profil allergique n'a pas été validé ou que le stock ne suffit pas. On renvoie `forcer: true` pour passer outre.
- **Expédier** crée les commandes `PREPAREE`. On les passe ensuite en `EXPEDIEE` puis `LIVREE` via `PUT /api/admin/commandes/:id` : l'acheteur reçoit un email à chaque étape. L'export CSV des étiquettes se fait avec `GET /api/admin/commandes/export?mois=`.
- **Clôturer** transforme le stock courant restant en lots invendus du mois. Les clients inscrits à une alerte de stock sont prévenus.
- Tâche quotidienne (6 h) : les lots invendus à J-30 de leur date limite sont retirés et passent « à donner » (`POST /api/admin/dons`).

## Paiement

Toute création payante (abonnement, commande, cadeau) enregistre l'entité `EN_ATTENTE_PAIEMENT` et renvoie `clientSecret` : le front affiche le formulaire Stripe dans la page (Embedded Checkout, `ui_mode: embedded_page`). Après paiement, Stripe redirige vers `/paiement/confirmation`. Le webhook active l'entité.
La page de retour `/paiement/confirmation?session_id=…` appelle `GET /api/paiement/confirmation`, qui renvoie le récapitulatif à afficher.
Le stock d'une commande est réservé avant le paiement, puis libéré si la session expire (1 h).

Réductions : un seul code par paiement (code promo ou code de parrainage), passé dans `codePromo`. Le parrainage donne 10 % au filleul sur son 1er paiement et 10 % au parrain : sur sa prochaine échéance s'il est abonné, sinon sur son prochain achat.

## Routes

### Public
| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/boxes` | Formules, prix S/M/L, contenu par catégorie, seuils, durées cadeau |
| GET | `/api/boxes/saisonnieres` | Box saisonnières en vente |
| GET | `/api/produits` | Catalogue (`categorie`, `taille`, `sansAllergenes=poulet,boeuf`, `traces`, pagination) |
| GET | `/api/produits/:id` | Fiche produit : composition, allergènes, traces |
| GET | `/api/compose` | Lots Compose ta box (`taille`, `categorie`, `sansAllergenes`, ou `chienId` si connecté) + prix fixe de la box par taille |
| GET | `/api/allergenes` | Liste des allergènes |
| POST | `/api/quiz` | Recommandation (taille, formule, contenu, prix) ; crée la fiche chien si connecté et `enregistrerChien` |
| GET | `/api/codes-promo/:code` | Vérifie un code pour l'afficher dans le récapitulatif |
| GET | `/api/avis` | Avis publiés + note moyenne |
| POST | `/api/newsletter`, `/api/newsletter/desinscription` | Newsletter |
| POST | `/api/contact` | Formulaire de contact |
| GET | `/api/geo/adresse`, `/api/geo/races` | Autocomplétion |

### Client connecté
| Méthode | Route | Rôle |
|---|---|---|
| POST | `/api/auth/register` | Profil après inscription Supabase (`codeParrainage`, `quizResultId` + `consentementChien`) ; rattache un profil orphelin au même email |
| POST | `/api/auth/mot-de-passe-oublie` | Lien de réinitialisation généré par Supabase, envoyé par Resend (réponse identique si l'email est inconnu) |
| GET / PUT / DELETE | `/api/auth/profile` | Espace client / rectification / suppression RGPD |
| GET | `/api/auth/export` | Export JSON des données |
| GET / POST, PUT / DELETE `:id` | `/api/adresses` | Adresses de livraison |
| GET / POST, PUT / DELETE `:id` | `/api/chiens` | Fiches chien (consentement RGPD obligatoire) |
| GET / POST | `/api/abonnements` | Liste (prochaine box, historique, conseil de taille) / souscription |
| PUT | `/api/abonnements/:id` | Changement de taille ou de livraison |
| POST | `/api/abonnements/:id/pause`, `/reprise`, `/resiliation` | Gestion de l'abonnement |
| GET / POST | `/api/commandes` | Compose ta box (`type: COMPOSE`) ou saisonnière (`type: SAISONNIERE`) |
| GET | `/api/commandes/:id` | Détail + facture |
| GET / POST | `/api/cadeaux` | Abonnement offert |
| GET | `/api/factures` | Factures Stripe |
| POST | `/api/paiement/session` | Reprendre un paiement interrompu |
| POST | `/api/paiement/portail` | Portail client Stripe (changer de carte après un impayé) |
| GET | `/api/paiement/confirmation` | Écran de confirmation |
| POST / DELETE | `/api/alertes-stock` | Alerte « prévenez-moi » |
| GET | `/api/parrainage` | Code, lien et suivi |
| POST | `/api/avis` | Avis + photo (multipart), après réception d'une box |

### Admin
| Route | Rôle |
|---|---|
| `/api/admin/produits` (GET, POST), `/:id` (PUT, DELETE = désactivation), `/:id/lots` (POST) | Produits, composition, allergènes, ajout de stock |
| `/api/admin/lots/:id` (PUT) | Quantité, date limite, retrait d'un lot |
| `/api/admin/boxes-mensuelles` (GET, POST), `/valider`, `/expedier`, `/cloturer` | Cycle mensuel |
| `/api/admin/invendus` (GET), `/api/admin/dons` (GET, POST) | Invendus par mois, dons |
| `/api/admin/commandes` (GET), `/:id` (PUT), `/export` (GET CSV) | Suivi des expéditions |
| `/api/admin/alertes-allergie` (GET), `/:id` (PUT) | Allergies à traiter |
| `/api/admin/abonnes` (GET) | Abonnés par taille et par allergie |
| `/api/admin/codes-promo` (GET, POST), `/:id` (PUT) | Codes promo, suivi des parrainages |
| `/api/admin/prix` (GET, PUT) | Prix S/M/L (nouvelles commandes uniquement) |
| `/api/admin/formules` (GET, POST), `/:id` (PUT) | Box saisonnières, contenu prévu |
| `/api/admin/reglages` (GET, PUT) | Seuils, frais de port, délai de retrait, pause, parrainage |
| `/api/admin/avis` (GET), `/:id` (PUT) | Modération |
| `/api/admin/contacts` (GET), `/:id` (PUT) | Messages reçus |

## Hors périmètre / à faire

- **Points relais** : widget officiel Mondial Relay (`components/commande/PointRelaisSelecteur.vue`), dans la commande et dans l'espace client. L'API stocke l'identifiant (`FR-012345`) et le libellé du point. `MONDIAL_RELAY_BRAND` vaut `BDTEST` (démonstration) : le remplacer par le code enseigne fourni à l'ouverture du compte Mondial Relay. Les abonnements cadeaux restent livrés à domicile.
- Connexion Google/Apple, plusieurs abonnements par chien, tableau de bord KPI : prévus en v2 dans le cahier des charges.
- Emails : tous partent par Resend depuis `EMAIL_FROM`, qui doit être une adresse d'un domaine vérifié dans Resend (`contact@dawky.fr`), jamais une adresse gmail. Le mot de passe oublié n'utilise pas le SMTP de Supabase.
- Dans Supabase (Authentication > URL Configuration), ajouter `http://localhost:3000/**` et `https://dawky.fr/**` aux Redirect URLs, sinon le lien de réinitialisation renvoie vers la Site URL.

## Sécurité

- **CSP** (`server/plugins/csp.ts`, production uniquement) : nonce aléatoire par requête sur les scripts de Nuxt, `strict-dynamic` pour les scripts qu'ils chargent (Stripe.js, Mondial Relay, Leaflet). Un script injecté (attribut `onerror`, lien `javascript:`) est bloqué par le navigateur. Pour ajouter un service tiers (mesure d'audience…), compléter `politiqueCsp()` : `img-src`, `connect-src` ou `frame-src` selon le besoin.
- **En-têtes Nginx** : HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, limitation de débit des formulaires publics.
- **Base de données** : la clé publique Supabase n'a aucun droit sur le schéma `public` (vérifié) ; toutes les données passent par l'API Nuxt.
