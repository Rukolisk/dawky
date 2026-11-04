// server/utils/admin-produits.ts
import { z } from 'zod'
import { createError } from 'h3'
import prisma from './prisma'
import { CATEGORIES_ALIMENTAIRES } from './metier'
import { categorieSchema, tailleSchema } from './schemas'

export const produitChampsSchema = z.object({
  nom:         z.string().trim().min(2).max(120),
  description: z.string().trim().min(5).max(2000),
  emoji:       z.string().trim().max(8).default('📦'),
  imageUrl:    z.string().url().optional().nullable(),
  categorie:   categorieSchema,
  ingredients: z.string().trim().max(3000).optional().nullable(),
  prix:        z.number().int().min(0),
  tailles:     z.array(tailleSchema).min(1),
  allergenes:  z.array(z.object({
    code:     z.string(),
    presence: z.enum(['CONTIENT', 'TRACES']),
  })).default([]),
  actif:       z.boolean().default(true),
})

/**
 * US-26 : composition obligatoire pour un produit alimentaire.
 */
export function verifierComposition(categorie: string, ingredients: string | null | undefined) {
  if ((CATEGORIES_ALIMENTAIRES as readonly string[]).includes(categorie) && !ingredients?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'La composition est obligatoire pour une friandise ou un produit à mâcher' })
  }
}

export async function allergenesDepuisCodes(liste: Array<{ code: string; presence: 'CONTIENT' | 'TRACES' }>) {
  if (liste.length === 0) return []
  const codes = [...new Set(liste.map(a => a.code.toLowerCase()))]
  if (codes.length !== liste.length) throw createError({ statusCode: 400, statusMessage: 'Allergène en double' })
  const allergenes = await prisma.allergene.findMany({ where: { code: { in: codes } } })
  const parCode = new Map(allergenes.map(a => [a.code, a.id]))
  return liste.map((a) => {
    const allergeneId = parCode.get(a.code.toLowerCase())
    if (!allergeneId) throw createError({ statusCode: 400, statusMessage: `Allergène inconnu : ${a.code}` })
    return { allergeneId, presence: a.presence }
  })
}

export const adminProduitInclude = {
  tailles: { select: { taille: true } },
  allergenes: { include: { allergene: { select: { code: true, nom: true } } } },
  lots: { where: { statut: 'DISPONIBLE' as const }, orderBy: { createdAt: 'asc' as const } },
}
