// server/utils/admin-codes.ts
import { z } from 'zod'

export const codePromoSchema = z.object({
  code:            z.string().trim().min(3).max(30).regex(/^[A-Za-z0-9_-]+$/, 'Lettres, chiffres, - et _ uniquement'),
  description:     z.string().trim().max(200).optional().nullable(),
  type:            z.enum(['POURCENTAGE', 'MONTANT']),
  valeur:          z.number().int().min(1),
  actif:           z.boolean().default(true),
  dateDebut:       z.coerce.date().optional().nullable(),
  dateFin:         z.coerce.date().optional().nullable(),
  utilisationsMax: z.number().int().min(1).optional().nullable(),
})

export function verifierValeur(type: string | undefined, valeur: number | undefined) {
  return !(type === 'POURCENTAGE' && valeur !== undefined && valeur > 100)
}
