// server/utils/formules.ts
import type { Prisma } from '@prisma/client'

type FormuleAvecPrix = Prisma.FormulaBoxGetPayload<{ include: { prix: true } }>

export function serialiserFormule(f: FormuleAvecPrix) {
  return {
    id: f.id,
    slug: f.slug,
    nom: f.nom,
    description: f.description,
    type: f.type,
    // { S: 2490, M: 2990, L: 3490 } (centimes)
    prix: Object.fromEntries(f.prix.map(p => [p.taille, p.prix])),
    contenu: f.contenu,
    dateDebutVente: f.dateDebutVente,
    dateFinVente: f.dateFinVente,
    disponible: f.stock === null || f.stock > 0,
  }
}
