// tests/helpers.ts
// ─────────────────────────────────────────────────────────────
// Utilitaires partagés pour les tests Dawky
// ─────────────────────────────────────────────────────────────

import { expect, vi } from 'vitest'
import { readBody, getQuery, getHeader } from 'h3'
import type { H3Event } from 'h3'

/**
 * Crée un faux H3Event avec body, query et headers configurables.
 */
export function mockEvent(opts: {
  body?:    Record<string, unknown>
  query?:   Record<string, string>
  headers?: Record<string, string>
}): H3Event {
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
 * Raccourci pour créer un event admin authentifié
 */
export function mockAdminEvent(body?: Record<string, unknown>): H3Event {
  return mockEvent({
    body,
    headers: { 'x-supabase-uid': 'admin-uid-123' },
  })
}

/**
 * Raccourci pour créer un event utilisateur authentifié
 */
export function mockAuthEvent(
  body?: Record<string, unknown>,
  uid = 'user-uid-456',
): H3Event {
  return mockEvent({ body, headers: { 'x-supabase-uid': uid } })
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

export const mockProduit = {
  id:          'prod-001',
  nom:         'Balle Résistante L',
  description: 'Caoutchouc naturel vulcanisé',
  emoji:       '🎾',
  categorie:   'JOUET',
  stock:       45,
  estInvendu:  false,
  moisOrigine: null,
  actif:       true,
  tailles:     [{ taille: 'L' }],
}

export const mockInvendu = {
  ...mockProduit,
  id:          'inv_prod-001_2025-03',
  nom:         'Balle Résistante L',
  estInvendu:  true,
  moisOrigine: '2025-03',
  stock:       12,
}

export const mockFormulaSurprise = {
  id:          'formula-surprise-001',
  nom:         'Box Surprise',
  type:        'SURPRISE',
  prix:        27.90,
  slots:       5,
  actif:       true,
  description: 'Sélection mensuelle surprise',
}

export const mockFormulaCarte = {
  id:          'formula-carte-001',
  nom:         'Box À la Carte',
  type:        'CARTE',
  prix:        24.90,
  slots:       5,
  actif:       true,
  description: 'Choisissez vos produits',
}

export const mockClient = {
  id:          'client-001',
  supabaseUid: 'user-uid-456',
  email:       'camille@example.com',
  prenom:      'Camille',
  nom:         'Morel',
  telephone:   null,
  adresse:     '12 rue des Lilas',
  ville:       'Paris',
  codePostal:  '75011',
  pays:        'France',
  role:        'USER',
}

export const mockAdmin = {
  id:          'admin-001',
  supabaseUid: 'admin-uid-123',
  email:       'bastien@dawky.fr',
  prenom:      'Bastien',
  nom:         'Rukolisk',
  role:        'ADMIN',
}

export const mockAbonnement = {
  id:              'abo-001',
  clientId:        'client-001',
  formulaId:       'formula-surprise-001',
  taille:          'L',
  statut:          'ACTIF',
  engagement:      12,
  prochainePeriode: new Date('2025-05-01'),
}

export const mockBoxMensuelle = {
  id:            'box-001',
  mois:          '2025-04',
  taille:        'L',
  theme:         'Printemps en forêt',
  statut:        'BROUILLON',
  dateExpedition: new Date('2025-04-01'),
  items: [
    {
      id:        'item-001',
      produitId: 'prod-001',
      quantite:  1,
      produit:   { ...mockProduit, tailles: [{ taille: 'L' }] },
    },
  ],
}