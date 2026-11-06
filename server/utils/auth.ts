// server/utils/auth.ts
// ─────────────────────────────────────────
// DAWKY — Authentification serveur
//
// Le client envoie son access_token Supabase dans le header
// `Authorization: Bearer <token>`. On vérifie ce token auprès de
// Supabase (via la service role key, jamais exposée au client) et on
// n'accorde l'accès qu'après validation. On ne fait JAMAIS confiance
// à un identifiant fourni tel quel par le client (body, query, header
// custom).
// ─────────────────────────────────────────

import { createError, getHeader, H3Event } from 'h3'
import { createClient } from '@supabase/supabase-js'
import prisma from './prisma'

let _supabaseAdmin: ReturnType<typeof createClient> | null = null

/**
 * Client Supabase "admin" (service role) — usage serveur uniquement.
 * Permet de vérifier des tokens et d'administrer les comptes (suppression
 * de compte, stockage des photos d'avis…)
 */
export function getSupabaseAdmin() {
  if (_supabaseAdmin) return _supabaseAdmin

  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl as string
  const serviceKey = config.supabaseServiceKey as string

  if (!url || !serviceKey) {
    throw new Error(
      '❌ SUPABASE_URL / SUPABASE_SERVICE_KEY manquant(s) dans .env — impossible de vérifier les tokens.',
    )
  }

  _supabaseAdmin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return _supabaseAdmin
}

/**
 * Extrait le token Bearer du header Authorization (null si absent).
 */
function extractBearerToken(event: H3Event): string | null {
  const header = getHeader(event, 'authorization')
  if (!header?.startsWith('Bearer ')) return null
  return header.slice('Bearer '.length).trim() || null
}

/**
 * Vérifie le token Supabase auprès de l'API Supabase (source de vérité).
 * Retourne l'utilisateur Supabase (id, email…) si le token est valide.
 * Lance une 401 sinon.
 */
export async function getSupabaseUser(event: H3Event) {
  const token = extractBearerToken(event)
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Session invalide ou expirée' })
  }
  return data.user
}

/**
 * Vérifie le token ET récupère le Client Prisma correspondant.
 * À utiliser sur toute route qui a besoin de savoir "qui" fait la requête.
 */
export async function requireAuth(event: H3Event) {
  const supabaseUser = await getSupabaseUser(event)

  const client = await prisma.client.findUnique({
    where: { supabaseUid: supabaseUser.id },
  })

  if (!client) {
    throw createError({ statusCode: 404, statusMessage: 'Profil introuvable en base' })
  }

  return { client, supabaseUser }
}

/**
 * Pour les routes publiques qui s'enrichissent si l'utilisateur est
 * connecté (quiz, Compose ta box…). Renvoie null si aucun token n'est
 * fourni ; un token fourni mais invalide reste une 401.
 */
export async function getOptionalClient(event: H3Event) {
  if (!extractBearerToken(event)) return null
  const { client } = await requireAuth(event)
  return client
}

/**
 * Niveau d'authentification de la session : 'aal1' (mot de passe seul) ou
 * 'aal2' (mot de passe + code de double authentification).
 * Lu dans le jeton, à n'appeler qu'APRÈS sa vérification par getSupabaseUser.
 */
export function niveauAuthentification(event: H3Event): string | null {
  const token = extractBearerToken(event)
  const charge = token?.split('.')[1]
  if (!charge) return null
  try {
    return JSON.parse(Buffer.from(charge, 'base64url').toString('utf8')).aal ?? null
  } catch {
    return null
  }
}

/**
 * Vérifie le token, le rôle ADMIN et la double authentification : sans
 * code validé (aal2), aucune route d'administration n'est accessible.
 */
export async function requireAdmin(event: H3Event) {
  const { client } = await requireAuth(event)

  if (client.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux administrateurs' })
  }

  if (niveauAuthentification(event) !== 'aal2') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Double authentification requise pour le back-office',
      data: { code: 'MFA_REQUISE' },
    })
  }

  return client
}
