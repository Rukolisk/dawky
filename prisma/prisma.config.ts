// prisma/prisma.config.ts
// ─────────────────────────────────────────
// DAWKY — Config Prisma 7.5
//
// Prisma 7.5 db push / migrate exige datasource.url ici.
// Le adapter est utilisé uniquement pour le runtime (PrismaClient).
// ─────────────────────────────────────────

import path from 'node:path'
import { defineConfig } from 'prisma/config'
import * as dotenv from 'dotenv'

// Charger .env pour les commandes CLI (hors contexte Nuxt)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),

  datasource: {
    // DIRECT_URL = connexion directe port 5432, sans pgBouncer
    // pgBouncer (port 6543) bloque les commandes migrate/db push
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
})
