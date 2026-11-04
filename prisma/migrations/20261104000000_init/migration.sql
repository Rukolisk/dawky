-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Taille" AS ENUM ('S', 'M', 'L');

-- CreateEnum
CREATE TYPE "NiveauActivite" AS ENUM ('FAIBLE', 'MODERE', 'ELEVE');

-- CreateEnum
CREATE TYPE "Categorie" AS ENUM ('FRIANDISE', 'MASTICATION', 'JOUET', 'ACCESSOIRE');

-- CreateEnum
CREATE TYPE "PresenceAllergene" AS ENUM ('CONTIENT', 'TRACES');

-- CreateEnum
CREATE TYPE "StatutLot" AS ENUM ('DISPONIBLE', 'RETIRE', 'DONNE');

-- CreateEnum
CREATE TYPE "TypeFormule" AS ENUM ('SURPRISE', 'SAISONNIERE', 'COMPOSE');

-- CreateEnum
CREATE TYPE "StatutBoxMensuelle" AS ENUM ('BROUILLON', 'VALIDEE', 'EXPEDIEE', 'CLOTUREE');

-- CreateEnum
CREATE TYPE "StatutAbonnement" AS ENUM ('EN_ATTENTE_PAIEMENT', 'ACTIF', 'PAUSE', 'IMPAYE', 'RESILIE', 'TERMINE', 'ANNULE');

-- CreateEnum
CREATE TYPE "StatutCadeau" AS ENUM ('EN_ATTENTE_PAIEMENT', 'ACTIF', 'TERMINE', 'ANNULE');

-- CreateEnum
CREATE TYPE "TypeCommande" AS ENUM ('BOX_MENSUELLE', 'COMPOSE', 'SAISONNIERE');

-- CreateEnum
CREATE TYPE "StatutCommande" AS ENUM ('EN_ATTENTE_PAIEMENT', 'PAYEE', 'PREPAREE', 'EXPEDIEE', 'LIVREE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "ModeLivraison" AS ENUM ('DOMICILE', 'POINT_RELAIS');

-- CreateEnum
CREATE TYPE "StatutAlerteAllergie" AS ENUM ('A_TRAITER', 'CONTACTE', 'VALIDEE');

-- CreateEnum
CREATE TYPE "TypeReduction" AS ENUM ('POURCENTAGE', 'MONTANT');

-- CreateEnum
CREATE TYPE "StatutParrainage" AS ENUM ('EN_ATTENTE', 'VALIDE');

-- CreateEnum
CREATE TYPE "StatutAvis" AS ENUM ('EN_ATTENTE', 'PUBLIE', 'REFUSE');

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "supabaseUid" TEXT,
    "email" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "stripeCustomerId" TEXT,
    "codeParrainage" TEXT NOT NULL,
    "recompensesParrainage" INTEGER NOT NULL DEFAULT 0,
    "anonymiseLe" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adresses" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "libelle" TEXT,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "ligne1" TEXT NOT NULL,
    "ligne2" TEXT,
    "codePostal" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "pays" TEXT NOT NULL DEFAULT 'France',
    "telephone" TEXT,
    "parDefaut" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chiens" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "race" TEXT,
    "dateNaissance" TIMESTAMP(3),
    "poids" DOUBLE PRECISION NOT NULL,
    "taille" "Taille" NOT NULL,
    "niveauActivite" "NiveauActivite" NOT NULL DEFAULT 'MODERE',
    "estMacheur" BOOLEAN NOT NULL DEFAULT false,
    "comportement" TEXT,
    "sensibleTraces" BOOLEAN NOT NULL DEFAULT false,
    "allergiesAutres" TEXT,
    "consentementRgpdLe" TIMESTAMP(3),
    "profilAllergieValide" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chiens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergenes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "allergenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chien_allergenes" (
    "chienId" TEXT NOT NULL,
    "allergeneId" TEXT NOT NULL,

    CONSTRAINT "chien_allergenes_pkey" PRIMARY KEY ("chienId","allergeneId")
);

-- CreateTable
CREATE TABLE "produits" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '📦',
    "imageUrl" TEXT,
    "categorie" "Categorie" NOT NULL,
    "ingredients" TEXT,
    "prix" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produit_tailles" (
    "produitId" TEXT NOT NULL,
    "taille" "Taille" NOT NULL,

    CONSTRAINT "produit_tailles_pkey" PRIMARY KEY ("produitId","taille")
);

-- CreateTable
CREATE TABLE "produit_allergenes" (
    "produitId" TEXT NOT NULL,
    "allergeneId" TEXT NOT NULL,
    "presence" "PresenceAllergene" NOT NULL,

    CONSTRAINT "produit_allergenes_pkey" PRIMARY KEY ("produitId","allergeneId")
);

-- CreateTable
CREATE TABLE "lots_stock" (
    "id" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "dateLimite" TIMESTAMP(3),
    "moisOrigine" TEXT,
    "statut" "StatutLot" NOT NULL DEFAULT 'DISPONIBLE',
    "retireLe" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lots_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dons" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "association" TEXT NOT NULL,
    "note" TEXT,
    "donneLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formules" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "TypeFormule" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "dateDebutVente" TIMESTAMP(3),
    "dateFinVente" TIMESTAMP(3),
    "stock" INTEGER,
    "contenu" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prix_tailles" (
    "formulaId" TEXT NOT NULL,
    "taille" "Taille" NOT NULL,
    "prix" INTEGER NOT NULL,

    CONSTRAINT "prix_tailles_pkey" PRIMARY KEY ("formulaId","taille")
);

-- CreateTable
CREATE TABLE "box_mensuelles" (
    "id" TEXT NOT NULL,
    "mois" TEXT NOT NULL,
    "taille" "Taille" NOT NULL,
    "theme" TEXT,
    "description" TEXT,
    "statut" "StatutBoxMensuelle" NOT NULL DEFAULT 'BROUILLON',
    "dateExpedition" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "box_mensuelles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "box_mensuelle_items" (
    "boxMensuelleId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "box_mensuelle_items_pkey" PRIMARY KEY ("boxMensuelleId","produitId")
);

-- CreateTable
CREATE TABLE "abonnements" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "chienId" TEXT NOT NULL,
    "formulaId" TEXT NOT NULL,
    "adresseId" TEXT,
    "taille" "Taille" NOT NULL,
    "prixMensuel" INTEGER NOT NULL,
    "statut" "StatutAbonnement" NOT NULL DEFAULT 'EN_ATTENTE_PAIEMENT',
    "modeLivraison" "ModeLivraison" NOT NULL DEFAULT 'DOMICILE',
    "pointRelaisId" TEXT,
    "pointRelaisLibelle" TEXT,
    "dateDebut" TIMESTAMP(3),
    "finPeriode" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "pauseJusquau" TIMESTAMP(3),
    "raisonResiliation" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripeCheckoutId" TEXT,
    "codePromoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abonnements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abonnements_cadeaux" (
    "id" TEXT NOT NULL,
    "acheteurId" TEXT NOT NULL,
    "taille" "Taille" NOT NULL,
    "dureeMois" INTEGER NOT NULL,
    "prixMensuel" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "remise" INTEGER NOT NULL DEFAULT 0,
    "statut" "StatutCadeau" NOT NULL DEFAULT 'EN_ATTENTE_PAIEMENT',
    "moisEnvoyes" INTEGER NOT NULL DEFAULT 0,
    "destPrenom" TEXT NOT NULL,
    "destNom" TEXT NOT NULL,
    "destEmail" TEXT,
    "destLigne1" TEXT NOT NULL,
    "destLigne2" TEXT,
    "destCodePostal" TEXT NOT NULL,
    "destVille" TEXT NOT NULL,
    "destPays" TEXT NOT NULL DEFAULT 'France',
    "destTelephone" TEXT,
    "nomChien" TEXT,
    "message" TEXT,
    "annoncer" BOOLEAN NOT NULL DEFAULT false,
    "annonceEnvoyeeLe" TIMESTAMP(3),
    "rappelFinEnvoyeLe" TIMESTAMP(3),
    "dateDebut" TIMESTAMP(3),
    "stripeCheckoutId" TEXT,
    "codePromoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abonnements_cadeaux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commandes" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "type" "TypeCommande" NOT NULL,
    "clientId" TEXT NOT NULL,
    "chienId" TEXT,
    "formulaId" TEXT,
    "abonnementId" TEXT,
    "cadeauId" TEXT,
    "boxMensuelleId" TEXT,
    "taille" "Taille" NOT NULL,
    "statut" "StatutCommande" NOT NULL DEFAULT 'EN_ATTENTE_PAIEMENT',
    "sousTotal" INTEGER NOT NULL DEFAULT 0,
    "fraisPort" INTEGER NOT NULL DEFAULT 0,
    "remise" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "modeLivraison" "ModeLivraison" NOT NULL DEFAULT 'DOMICILE',
    "livNom" TEXT NOT NULL,
    "livAdresse" TEXT NOT NULL,
    "livCodePostal" TEXT NOT NULL,
    "livVille" TEXT NOT NULL,
    "livPays" TEXT NOT NULL DEFAULT 'France',
    "pointRelaisId" TEXT,
    "transporteur" TEXT,
    "numeroSuivi" TEXT,
    "dateExpedition" TIMESTAMP(3),
    "dateLivraison" TIMESTAMP(3),
    "stripeCheckoutId" TEXT,
    "stripeInvoiceId" TEXT,
    "factureUrl" TEXT,
    "codePromoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commandes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "selection_items" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 1,
    "prixUnitaire" INTEGER NOT NULL,

    CONSTRAINT "selection_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertes_allergie" (
    "id" TEXT NOT NULL,
    "chienId" TEXT NOT NULL,
    "statut" "StatutAlerteAllergie" NOT NULL DEFAULT 'A_TRAITER',
    "note" TEXT,
    "traiteParId" TEXT,
    "traiteLe" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alertes_allergie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertes_stock" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "taille" "Taille" NOT NULL,
    "notifieeLe" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertes_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codes_promo" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" "TypeReduction" NOT NULL,
    "valeur" INTEGER NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "utilisationsMax" INTEGER,
    "utilisations" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "codes_promo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parrainages" (
    "id" TEXT NOT NULL,
    "parrainId" TEXT NOT NULL,
    "filleulId" TEXT NOT NULL,
    "statut" "StatutParrainage" NOT NULL DEFAULT 'EN_ATTENTE',
    "valideLe" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parrainages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avis" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "commentaire" TEXT NOT NULL,
    "photoUrl" TEXT,
    "statut" "StatutAvis" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "prenom" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "consentementLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tokenDesinscription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_results" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "email" TEXT,
    "accepteEmail" BOOLEAN NOT NULL DEFAULT false,
    "nomChien" TEXT NOT NULL,
    "race" TEXT,
    "poids" DOUBLE PRECISION NOT NULL,
    "ageMois" INTEGER,
    "taille" "Taille" NOT NULL,
    "niveauActivite" "NiveauActivite" NOT NULL,
    "estMacheur" BOOLEAN NOT NULL DEFAULT false,
    "allergenes" TEXT[],
    "allergiesAutres" TEXT,
    "sensibleTraces" BOOLEAN NOT NULL DEFAULT false,
    "formuleRecommandee" "TypeFormule" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sujet" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reglages" (
    "cle" TEXT NOT NULL,
    "valeur" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reglages_pkey" PRIMARY KEY ("cle")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_supabaseUid_key" ON "clients"("supabaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_stripeCustomerId_key" ON "clients"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_codeParrainage_key" ON "clients"("codeParrainage");

-- CreateIndex
CREATE INDEX "adresses_clientId_idx" ON "adresses"("clientId");

-- CreateIndex
CREATE INDEX "chiens_clientId_idx" ON "chiens"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "allergenes_code_key" ON "allergenes"("code");

-- CreateIndex
CREATE INDEX "lots_stock_produitId_statut_idx" ON "lots_stock"("produitId", "statut");

-- CreateIndex
CREATE INDEX "lots_stock_moisOrigine_statut_idx" ON "lots_stock"("moisOrigine", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "formules_slug_key" ON "formules"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "box_mensuelles_mois_taille_key" ON "box_mensuelles"("mois", "taille");

-- CreateIndex
CREATE UNIQUE INDEX "abonnements_stripeSubscriptionId_key" ON "abonnements"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "abonnements_stripeCheckoutId_key" ON "abonnements"("stripeCheckoutId");

-- CreateIndex
CREATE INDEX "abonnements_clientId_idx" ON "abonnements"("clientId");

-- CreateIndex
CREATE INDEX "abonnements_statut_taille_idx" ON "abonnements"("statut", "taille");

-- CreateIndex
CREATE UNIQUE INDEX "abonnements_cadeaux_stripeCheckoutId_key" ON "abonnements_cadeaux"("stripeCheckoutId");

-- CreateIndex
CREATE INDEX "abonnements_cadeaux_statut_idx" ON "abonnements_cadeaux"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "commandes_numero_key" ON "commandes"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "commandes_stripeCheckoutId_key" ON "commandes"("stripeCheckoutId");

-- CreateIndex
CREATE INDEX "commandes_clientId_idx" ON "commandes"("clientId");

-- CreateIndex
CREATE INDEX "commandes_statut_idx" ON "commandes"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "commandes_abonnementId_boxMensuelleId_key" ON "commandes"("abonnementId", "boxMensuelleId");

-- CreateIndex
CREATE UNIQUE INDEX "commandes_cadeauId_boxMensuelleId_key" ON "commandes"("cadeauId", "boxMensuelleId");

-- CreateIndex
CREATE INDEX "alertes_allergie_statut_idx" ON "alertes_allergie"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "alertes_stock_clientId_taille_key" ON "alertes_stock"("clientId", "taille");

-- CreateIndex
CREATE UNIQUE INDEX "codes_promo_code_key" ON "codes_promo"("code");

-- CreateIndex
CREATE UNIQUE INDEX "parrainages_filleulId_key" ON "parrainages"("filleulId");

-- CreateIndex
CREATE INDEX "avis_statut_idx" ON "avis"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_email_key" ON "newsletter"("email");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_tokenDesinscription_key" ON "newsletter"("tokenDesinscription");

-- AddForeignKey
ALTER TABLE "adresses" ADD CONSTRAINT "adresses_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chiens" ADD CONSTRAINT "chiens_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chien_allergenes" ADD CONSTRAINT "chien_allergenes_chienId_fkey" FOREIGN KEY ("chienId") REFERENCES "chiens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chien_allergenes" ADD CONSTRAINT "chien_allergenes_allergeneId_fkey" FOREIGN KEY ("allergeneId") REFERENCES "allergenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produit_tailles" ADD CONSTRAINT "produit_tailles_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produit_allergenes" ADD CONSTRAINT "produit_allergenes_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produit_allergenes" ADD CONSTRAINT "produit_allergenes_allergeneId_fkey" FOREIGN KEY ("allergeneId") REFERENCES "allergenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots_stock" ADD CONSTRAINT "lots_stock_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dons" ADD CONSTRAINT "dons_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots_stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prix_tailles" ADD CONSTRAINT "prix_tailles_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "formules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "box_mensuelle_items" ADD CONSTRAINT "box_mensuelle_items_boxMensuelleId_fkey" FOREIGN KEY ("boxMensuelleId") REFERENCES "box_mensuelles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "box_mensuelle_items" ADD CONSTRAINT "box_mensuelle_items_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnements" ADD CONSTRAINT "abonnements_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnements" ADD CONSTRAINT "abonnements_chienId_fkey" FOREIGN KEY ("chienId") REFERENCES "chiens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnements" ADD CONSTRAINT "abonnements_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "formules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnements" ADD CONSTRAINT "abonnements_adresseId_fkey" FOREIGN KEY ("adresseId") REFERENCES "adresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnements" ADD CONSTRAINT "abonnements_codePromoId_fkey" FOREIGN KEY ("codePromoId") REFERENCES "codes_promo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnements_cadeaux" ADD CONSTRAINT "abonnements_cadeaux_acheteurId_fkey" FOREIGN KEY ("acheteurId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnements_cadeaux" ADD CONSTRAINT "abonnements_cadeaux_codePromoId_fkey" FOREIGN KEY ("codePromoId") REFERENCES "codes_promo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_chienId_fkey" FOREIGN KEY ("chienId") REFERENCES "chiens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "formules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_abonnementId_fkey" FOREIGN KEY ("abonnementId") REFERENCES "abonnements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_cadeauId_fkey" FOREIGN KEY ("cadeauId") REFERENCES "abonnements_cadeaux"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_boxMensuelleId_fkey" FOREIGN KEY ("boxMensuelleId") REFERENCES "box_mensuelles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_codePromoId_fkey" FOREIGN KEY ("codePromoId") REFERENCES "codes_promo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selection_items" ADD CONSTRAINT "selection_items_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "commandes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selection_items" ADD CONSTRAINT "selection_items_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selection_items" ADD CONSTRAINT "selection_items_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots_stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertes_allergie" ADD CONSTRAINT "alertes_allergie_chienId_fkey" FOREIGN KEY ("chienId") REFERENCES "chiens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertes_allergie" ADD CONSTRAINT "alertes_allergie_traiteParId_fkey" FOREIGN KEY ("traiteParId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertes_stock" ADD CONSTRAINT "alertes_stock_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parrainages" ADD CONSTRAINT "parrainages_parrainId_fkey" FOREIGN KEY ("parrainId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parrainages" ADD CONSTRAINT "parrainages_filleulId_fkey" FOREIGN KEY ("filleulId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_results" ADD CONSTRAINT "quiz_results_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

