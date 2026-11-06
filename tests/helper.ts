// tests/helper.ts
// ─────────────────────────────────────────────────────────────
// Utilitaires partagés pour les tests Dawky
// ─────────────────────────────────────────────────────────────

import { expect, vi } from 'vitest'
import { readBody, getQuery, getHeader, getRouterParam } from 'h3'
import type { H3Event } from 'h3'
import { supabaseAuthMock } from './setup'

/**
 * Crée un faux H3Event avec body, query et headers configurables.
 */
export function mockEvent(opts: {
  body?:    Record<string, unknown>
  query?:   Record<string, string>
  headers?: Record<string, string>
  params?:  Record<string, string>
}): H3Event {
  vi.mocked(getRouterParam).mockImplementation((_event, name) => (opts.params ?? {})[name])

  // Mock readBody pour retourner le body fourni
  vi.mocked(readBody).mockResolvedValue(opts.body ?? {})

  // Mock getQuery pour retourner les query params
  vi.mocked(getQuery).mockReturnValue(opts.query ?? {})

  // Mock getHeader pour retourner les headers
  vi.mocked(getHeader).mockImplementation((_event, name) => {
    return (opts.headers ?? {})[name] ?? undefined
  })

  // L'event lui-même n'est pas utilisé directement dans nos handlers
  // (tout passe par readBody / getQuery / getHeader)
  return {} as H3Event
}

/**
 * Configure supabaseAuthMock.getUser() pour simuler un token Bearer valide
 * correspondant à cet uid Supabase. À utiliser avant tout appel à
 * requireAuth/requireAdmin dans un test.
 */
export function mockValidSupabaseToken(uid: string, email = 'test@example.com') {
  supabaseAuthMock.getUser.mockResolvedValue({
    data: { user: { id: uid, email } },
    error: null,
  })
}

/**
 * Configure supabaseAuthMock.getUser() pour simuler un token invalide/expiré.
 */
export function mockInvalidSupabaseToken() {
  supabaseAuthMock.getUser.mockResolvedValue({
    data: { user: null },
    error: { message: 'Invalid token' },
  })
}

/**
 * Raccourci pour créer un event admin authentifié (token Supabase valide +
 * le mock Prisma doit séparément renvoyer un Client avec role: 'ADMIN')
 */
/**
 * Faux jeton au format JWT portant un niveau d'authentification
 * (sa signature n'est jamais vérifiée : getUser est simulé).
 */
export function fauxJeton(aal: 'aal1' | 'aal2'): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url')
  return `${b64({ alg: 'HS256' })}.${b64({ sub: 'admin-uid-123', aal })}.signature`
}

/**
 * Event admin authentifié, double authentification validée (aal2) par
 * défaut. Passer aal: 'aal1' pour simuler un admin sans code validé.
 */
export function mockAdminEvent(
  body?: Record<string, unknown>,
  params?: Record<string, string>,
  aal: 'aal1' | 'aal2' = 'aal2',
): H3Event {
  mockValidSupabaseToken('admin-uid-123', 'bastien@dawky.fr')
  return mockEvent({
    body,
    params,
    headers: { authorization: `Bearer ${fauxJeton(aal)}` },
  })
}

/**
 * Raccourci pour créer un event utilisateur authentifié
 */
export function mockAuthEvent(
  body?: Record<string, unknown>,
  opts: { uid?: string; params?: Record<string, string>; query?: Record<string, string> } = {},
): H3Event {
  mockValidSupabaseToken(opts.uid ?? 'user-uid-456', 'camille@example.com')
  return mockEvent({ body, params: opts.params, query: opts.query, headers: { authorization: 'Bearer fake-user-token' } })
}

/**
 * Vérifie qu'une erreur H3 a le bon statut
 */
export async function expectH3Error(
  fn: () => Promise<unknown>,
  statusCode: number,
  messagePart?: string,
): Promise<void> {
  try {
    await fn()
    throw new Error(`Expected H3Error ${statusCode} but no error was thrown`)
  } catch (err: unknown) {
    const e = err as { statusCode?: number; statusMessage?: string }
    if (!e.statusCode) throw err // re-throw si ce n'est pas une H3Error
    expect(e.statusCode).toBe(statusCode)
    if (messagePart) {
      expect(e.statusMessage).toContain(messagePart)
    }
  }
}

// ── Fixtures de données ───────────────────────────────────────

export const mockClient = {
  id:                    'client-001',
  supabaseUid:           'user-uid-456',
  email:                 'camille@example.com',
  prenom:                'Camille',
  nom:                   'Morel',
  telephone:             null,
  role:                  'USER',
  stripeCustomerId:      'cus_123',
  codeParrainage:        'CAMILL7K2P',
  recompensesParrainage: 0,
  anonymiseLe:           null,
}

export const mockAdmin = {
  ...mockClient,
  id:             'admin-001',
  supabaseUid:    'admin-uid-123',
  email:          'bastien@dawky.fr',
  prenom:         'Bastien',
  role:           'ADMIN',
  codeParrainage: 'BASTIE2222',
}

export const mockChien = {
  id:                   'chien-001',
  clientId:             'client-001',
  nom:                  'Max',
  race:                 'Golden Retriever',
  dateNaissance:        new Date('2023-03-10'),
  poids:                32,
  taille:               'L',
  niveauActivite:       'ELEVE',
  estMacheur:           true,
  comportement:         null,
  sensibleTraces:       false,
  allergiesAutres:      null,
  consentementRgpdLe:   new Date('2026-01-01'),
  profilAllergieValide: false,
  allergenes:           [] as Array<{ allergeneId: string; allergene: { code: string; nom: string } }>,
}

export const mockChienAllergique = {
  ...mockChien,
  id:         'chien-002',
  nom:        'Pixel',
  race:       'Bichon Frisé',
  poids:      5,
  taille:     'S',
  allergenes: [{ allergeneId: 'alg-poulet', allergene: { code: 'poulet', nom: 'Poulet' } }],
}

export const mockAdresse = {
  id:         'adr-001',
  clientId:   'client-001',
  prenom:     'Camille',
  nom:        'Morel',
  ligne1:     '12 rue des Lilas',
  ligne2:     null,
  codePostal: '75011',
  ville:      'Paris',
  pays:       'France',
  parDefaut:  true,
}

export const mockFormulaSurprise = {
  id:   'formula-surprise',
  slug: 'box-surprise',
  nom:  'Box Surprise',
  type: 'SURPRISE',
  actif: true,
  contenu: { L: { JOUET: 1, FRIANDISE: 1, MASTICATION: 1, ACCESSOIRE: 1 } },
  prix: [
    { formulaId: 'formula-surprise', taille: 'S', prix: 2490 },
    { formulaId: 'formula-surprise', taille: 'M', prix: 2990 },
    { formulaId: 'formula-surprise', taille: 'L', prix: 3490 },
  ],
}

/** Produit d'un lot invendu (Compose ta box) */
export function mockLot(id: string, opts: {
  nom?: string; prix?: number; tailles?: string[]; quantite?: number
  allergenes?: Array<{ allergeneId: string; presence: 'CONTIENT' | 'TRACES'; nom: string }>
} = {}) {
  return {
    id,
    produitId: `prod-${id}`,
    quantite: opts.quantite ?? 10,
    moisOrigine: '2026-10',
    statut: 'DISPONIBLE',
    dateLimite: null,
    produit: {
      id: `prod-${id}`,
      nom: opts.nom ?? `Produit ${id}`,
      prix: opts.prix ?? 500,
      actif: true,
      tailles: (opts.tailles ?? ['S', 'M', 'L']).map(taille => ({ taille })),
      allergenes: (opts.allergenes ?? []).map(a => ({ allergeneId: a.allergeneId, presence: a.presence, allergene: { nom: a.nom } })),
    },
  }
}
