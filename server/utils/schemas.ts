// server/utils/schemas.ts
// ─────────────────────────────────────────
// Schémas Zod réutilisés par plusieurs routes
// ─────────────────────────────────────────
import { z } from 'zod'
import { CATEGORIES, TAILLES } from './metier'

export const tailleSchema = z.enum(TAILLES)
export const categorieSchema = z.enum(CATEGORIES)
export const niveauActiviteSchema = z.enum(['FAIBLE', 'MODERE', 'ELEVE'])
export const moisSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Format attendu : YYYY-MM')

export const codePostalSchema = z.string().trim().regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)')

export const adresseSchema = z.object({
  libelle:    z.string().trim().max(50).optional().nullable(),
  prenom:     z.string().trim().min(1, 'Prénom requis').max(80),
  nom:        z.string().trim().min(1, 'Nom requis').max(80),
  ligne1:     z.string().trim().min(5, 'Adresse requise').max(200),
  ligne2:     z.string().trim().max(200).optional().nullable(),
  codePostal: codePostalSchema,
  ville:      z.string().trim().min(2, 'Ville requise').max(100),
  pays:       z.string().trim().default('France'),
  telephone:  z.string().trim().max(20).optional().nullable(),
})

// Choix de livraison commun aux abonnements et commandes.
// Le point relais est choisi via le widget du transporteur côté front,
// qui fournit un identifiant et un libellé.
export const livraisonSchema = z.object({
  adresseId:          z.string().min(1, 'Adresse de livraison requise'),
  modeLivraison:      z.enum(['DOMICILE', 'POINT_RELAIS']).default('DOMICILE'),
  pointRelaisId:      z.string().max(50).optional().nullable(),
  pointRelaisLibelle: z.string().max(200).optional().nullable(),
}).refine(
  d => d.modeLivraison !== 'POINT_RELAIS' || (d.pointRelaisId && d.pointRelaisLibelle),
  { message: 'Point relais requis', path: ['pointRelaisId'] },
)

// Acceptation des CGV obligatoire avant tout paiement
export const cgvSchema = z.literal(true, {
  error: 'Vous devez accepter les conditions générales de vente',
})
