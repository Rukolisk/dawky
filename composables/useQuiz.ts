// composables/useQuiz.ts
// ─────────────────────────────────────────
// Réponses du quiz et résultat, conservés dans le sessionStorage : on
// peut recharger la page, revenir en arrière ou créer son compte à la
// fin du parcours sans rien perdre (F-05).
// ─────────────────────────────────────────
import type { NiveauActivite, ResultatQuiz, Taille } from './types'

export interface ReponsesQuiz {
  nomChien: string
  race: string
  ageAns: number | null
  // Tranche choisie (S/M/L) et poids exact facultatif
  tranchePoids: Taille | null
  poidsExact: number | null
  niveauActivite: NiveauActivite | null
  estMacheur: boolean | null
  allergenes: string[]
  allergiesAutres: string
  sensibleTraces: boolean
  email: string
}

const VIDE: ReponsesQuiz = {
  nomChien: '',
  race: '',
  ageAns: null,
  tranchePoids: null,
  poidsExact: null,
  niveauActivite: null,
  estMacheur: null,
  allergenes: [],
  allergiesAutres: '',
  sensibleTraces: false,
  email: '',
}

// Poids représentatif d'une tranche quand le poids exact n'est pas connu
const POIDS_TRANCHE: Record<Taille, number> = { S: 6, M: 18, L: 32 }

export function useQuiz() {
  const reponses = useSessionStorage<ReponsesQuiz>('dawky-quiz', { ...VIDE }, { mergeDefaults: true })
  const resultat = useSessionStorage<ResultatQuiz | null>('dawky-quiz-resultat', null, {
    serializer: { read: v => (v ? JSON.parse(v) : null), write: v => JSON.stringify(v) },
  })

  function poidsRetenu(): number {
    const r = reponses.value
    if (r.poidsExact && r.poidsExact > 0) return r.poidsExact
    return POIDS_TRANCHE[r.tranchePoids ?? 'M']
  }

  async function envoyer(enregistrerChien = false) {
    const r = reponses.value
    const aDesAllergies = r.allergenes.length > 0 || !!r.allergiesAutres.trim()
    resultat.value = await api<ResultatQuiz>('/api/quiz', {
      method: 'POST',
      body: {
        nomChien: r.nomChien.trim(),
        race: r.race.trim() || undefined,
        poids: poidsRetenu(),
        ageMois: r.ageAns !== null ? Math.round(r.ageAns * 12) : undefined,
        // Sans poids exact, la tranche choisie fait foi
        taille: r.poidsExact ? undefined : r.tranchePoids ?? undefined,
        niveauActivite: r.niveauActivite,
        estMacheur: r.estMacheur ?? false,
        allergenes: r.allergenes,
        allergiesAutres: r.allergiesAutres.trim() || undefined,
        sensibleTraces: aDesAllergies && r.sensibleTraces,
        email: r.email.trim() || undefined,
        accepteEmail: !!r.email.trim(),
        enregistrerChien,
      },
    })
    return resultat.value
  }

  function recommencer() {
    reponses.value = { ...VIDE, allergenes: [] }
    resultat.value = null
  }

  return { reponses, resultat, envoyer, recommencer, poidsRetenu }
}
