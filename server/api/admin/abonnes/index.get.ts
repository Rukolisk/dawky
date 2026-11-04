// server/api/admin/abonnes/index.get.ts
// Abonnés actifs par taille et par allergie (US-48)
// GET /api/admin/abonnes?taille=S&allergene=poulet
import { z } from 'zod'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { apiSuccess, parseQuery, withErrorHandling } from '~/server/utils/api'
import { tailleSchema } from '~/server/utils/schemas'

const querySchema = z.object({
  taille:    tailleSchema.optional(),
  allergene: z.string().optional(),
})

const ACTIFS = { statut: { in: ['ACTIF' as const, 'PAUSE' as const, 'IMPAYE' as const] } }

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const q = parseQuery(event, querySchema)

    const [parTaille, cadeauxParTaille, allergenes, abonnes] = await Promise.all([
      prisma.abonnement.groupBy({ by: ['taille'], where: ACTIFS, _count: { _all: true } }),
      prisma.abonnementCadeau.groupBy({ by: ['taille'], where: { statut: 'ACTIF' }, _count: { _all: true } }),
      prisma.allergene.findMany({
        select: {
          code: true, nom: true,
          _count: { select: { chiens: { where: { chien: { abonnements: { some: ACTIFS } } } } } },
        },
        orderBy: { nom: 'asc' },
      }),
      prisma.abonnement.findMany({
        where: {
          ...ACTIFS,
          ...(q.taille ? { taille: q.taille } : {}),
          ...(q.allergene ? { chien: { allergenes: { some: { allergene: { code: q.allergene } } } } } : {}),
        },
        include: {
          client: { select: { prenom: true, nom: true, email: true } },
          chien: { include: { allergenes: { include: { allergene: { select: { code: true, nom: true } } } } } },
        },
        orderBy: [{ taille: 'asc' }, { createdAt: 'asc' }],
      }),
    ])

    return apiSuccess({
      compteurs: {
        abonnements: Object.fromEntries(parTaille.map(r => [r.taille, r._count._all])),
        cadeaux: Object.fromEntries(cadeauxParTaille.map(r => [r.taille, r._count._all])),
        parAllergene: allergenes.map(a => ({ code: a.code, nom: a.nom, abonnes: a._count.chiens })),
      },
      abonnes: abonnes.map(a => ({
        id: a.id,
        statut: a.statut,
        taille: a.taille,
        client: a.client,
        chien: a.chien.nom,
        allergenes: a.chien.allergenes.map(x => x.allergene.nom),
        allergiesAutres: a.chien.allergiesAutres,
        sensibleTraces: a.chien.sensibleTraces,
        profilAllergieValide: a.chien.profilAllergieValide,
      })),
    })
  })
})
