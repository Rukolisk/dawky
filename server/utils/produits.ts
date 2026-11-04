// server/utils/produits.ts
// Forme publique d'un produit : composition, allergènes, traces (US-23)
import type { Prisma } from '@prisma/client'
import prisma from './prisma'

export const produitInclude = {
  tailles: { select: { taille: true } },
  allergenes: { include: { allergene: true } },
} satisfies Prisma.ProduitInclude

export type ProduitComplet = Prisma.ProduitGetPayload<{ include: typeof produitInclude }>

export function serialiserProduit(p: ProduitComplet) {
  return {
    id: p.id,
    nom: p.nom,
    description: p.description,
    emoji: p.emoji,
    imageUrl: p.imageUrl,
    categorie: p.categorie,
    ingredients: p.ingredients,
    prix: p.prix,
    tailles: p.tailles.map(t => t.taille),
    allergenes: p.allergenes
      .filter(a => a.presence === 'CONTIENT')
      .map(a => ({ code: a.allergene.code, nom: a.allergene.nom })),
    traces: p.allergenes
      .filter(a => a.presence === 'TRACES')
      .map(a => ({ code: a.allergene.code, nom: a.allergene.nom })),
  }
}

/**
 * Filtre Prisma excluant les produits qui contiennent (ou, avec `traces`,
 * peuvent contenir des traces de) l'un des allergènes donnés.
 */
export async function filtreSansAllergenes(codes: string[], traces: boolean): Promise<Prisma.ProduitWhereInput> {
  if (codes.length === 0) return {}
  const allergenes = await prisma.allergene.findMany({ where: { code: { in: codes.map(c => c.toLowerCase()) } } })
  return {
    allergenes: {
      none: {
        allergeneId: { in: allergenes.map(a => a.id) },
        ...(traces ? {} : { presence: 'CONTIENT' as const }),
      },
    },
  }
}
