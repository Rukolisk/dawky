// server/utils/admin-formules.ts
import { z } from 'zod'
import { CATEGORIES } from './metier'

// partialRecord : toutes les catégories ne sont pas obligatoires
const contenuTailleSchema = z.partialRecord(z.enum(CATEGORIES), z.number().int().min(0).max(10))

export const formuleChampsSchema = z.object({
  slug:           z.string().trim().min(2).max(60).regex(/^[a-z0-9-]+$/, 'Minuscules, chiffres et tirets'),
  nom:            z.string().trim().min(2).max(120),
  description:    z.string().trim().min(5).max(2000),
  actif:          z.boolean().default(true),
  dateDebutVente: z.coerce.date().optional().nullable(),
  dateFinVente:   z.coerce.date().optional().nullable(),
  stock:          z.number().int().min(0).optional().nullable(),
  // Contenu prévu par taille et par catégorie (sans révéler les produits)
  contenu:        z.object({ S: contenuTailleSchema, M: contenuTailleSchema, L: contenuTailleSchema }).optional().nullable(),
})
