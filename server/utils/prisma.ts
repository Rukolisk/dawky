// server/utils/prisma.ts
// ─────────────────────────────────────────
// DAWKY — Singleton PrismaClient (Prisma 7.5)
// L'adaptateur pg fournit la connexion au runtime Nuxt
// ─────────────────────────────────────────

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import prismaClientPkg from '@prisma/client'

const { PrismaClient } = prismaClientPkg

type PrismaClientType = InstanceType<typeof PrismaClient>

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClientType | undefined
}

function createPrismaClient(): PrismaClientType {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      '❌  DATABASE_URL manquant. Vérifiez votre fichier .env',
    )
  }

  const pool = new Pool({
    connectionString,
    max: process.env.NODE_ENV === 'production' ? 10 : 2,
  })

  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  })
}

const prisma = globalThis.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

export default prisma
