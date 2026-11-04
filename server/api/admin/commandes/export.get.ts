// server/api/admin/commandes/export.get.ts
// Export CSV des adresses pour les étiquettes (US-49)
// GET /api/admin/commandes/export?mois=2026-12  (box du mois)
// GET /api/admin/commandes/export?statut=PAYEE  (commandes ponctuelles)
import { z } from 'zod'
import { setHeader } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/auth'
import { parseQuery, withErrorHandling } from '~/server/utils/api'
import { moisSchema } from '~/server/utils/schemas'

const querySchema = z.object({
  mois:   moisSchema.optional(),
  statut: z.enum(['PAYEE', 'PREPAREE', 'EXPEDIEE']).optional(),
})

function cellule(v: unknown): string {
  const s = String(v ?? '')
  // Échappe guillemets et neutralise les formules (injection CSV)
  const sur = /^[=+\-@]/.test(s) ? `'${s}` : s
  return `"${sur.replace(/"/g, '""')}"`
}

export default defineEventHandler(async (event) => {
  return withErrorHandling(async () => {
    await requireAdmin(event)
    const q = parseQuery(event, querySchema)

    const commandes = await prisma.commande.findMany({
      where: {
        statut: q.statut ?? { in: ['PAYEE', 'PREPAREE'] },
        ...(q.mois ? { boxMensuelle: { mois: q.mois } } : {}),
      },
      include: { client: { select: { email: true, telephone: true } }, chien: { select: { nom: true } } },
      orderBy: [{ taille: 'asc' }, { livCodePostal: 'asc' }],
    })

    const entete = ['numero', 'type', 'taille', 'nom', 'adresse', 'code_postal', 'ville', 'pays', 'mode', 'point_relais', 'chien', 'email', 'telephone']
    const lignes = commandes.map(c => [
      c.numero, c.type, c.taille, c.livNom, c.livAdresse, c.livCodePostal, c.livVille, c.livPays,
      c.modeLivraison, c.pointRelaisId, c.chien?.nom, c.client.email, c.client.telephone,
    ].map(cellule).join(';'))

    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setHeader(event, 'Content-Disposition', `attachment; filename="etiquettes-${q.mois ?? 'commandes'}.csv"`)
    // BOM pour l'ouverture correcte des accents dans Excel
    return '﻿' + [entete.join(';'), ...lignes].join('\n')
  })
})
