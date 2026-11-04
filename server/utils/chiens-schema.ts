// server/utils/chiens-schema.ts
// Champs de la fiche chien, partagés par la création et la modification
import { z } from 'zod'
import { niveauActiviteSchema, tailleSchema } from './schemas'

export const chienChampsSchema = z.object({
  nom:             z.string().trim().min(1).max(50),
  race:            z.string().trim().max(80).optional().nullable(),
  dateNaissance:   z.coerce.date().max(new Date(), 'Date de naissance dans le futur').optional().nullable(),
  poids:           z.number().positive().max(120),
  // Si absente, la taille est calculée à partir du poids et de la race
  taille:          tailleSchema.optional(),
  niveauActivite:  niveauActiviteSchema.default('MODERE'),
  estMacheur:      z.boolean().default(false),
  comportement:    z.string().trim().max(500).optional().nullable(),
  allergenes:      z.array(z.string()).max(20).default([]),
  allergiesAutres: z.string().trim().max(300).optional().nullable(),
  sensibleTraces:  z.boolean().default(false),
})
