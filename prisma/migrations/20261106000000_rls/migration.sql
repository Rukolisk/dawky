-- Défense en profondeur : RLS activée sur toutes les tables Dawky, sans
-- aucune politique. Les rôles exposés par l'API Supabase (anon,
-- authenticated) ne voient donc aucune ligne, même si on leur redonnait
-- des droits sur le schéma. L'application passe par Prisma avec le rôle
-- propriétaire des tables, qui n'est pas soumis à la RLS.
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "adresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "chiens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "allergenes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "chien_allergenes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "produits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "produit_tailles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "produit_allergenes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lots_stock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "formules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prix_tailles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "box_mensuelles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "box_mensuelle_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "abonnements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "abonnements_cadeaux" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commandes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "selection_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "alertes_allergie" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "alertes_stock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "codes_promo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "parrainages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "avis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "newsletter" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quiz_results" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reglages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "webhook_events" ENABLE ROW LEVEL SECURITY;
