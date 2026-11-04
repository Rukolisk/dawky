// composables/useAuth.ts
// ─────────────────────────────────────────
// Session Supabase + profil Dawky.
//
// `init()` est appelé une seule fois par le plugin 02.auth.client.ts,
// AVANT la première navigation : les middlewares voient donc toujours
// l'état réel de la session (pas de redirection vers /connexion au
// rechargement d'une page protégée).
//
// Si la confirmation d'email est activée dans Supabase, l'inscription ne
// renvoie pas de session : les infos du profil sont gardées en local et
// le profil Dawky est créé à la première connexion.
// ─────────────────────────────────────────
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import type { Profil } from './types'

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const config = useRuntimeConfig()
    _supabase = createClient(
      config.public.supabaseUrl as string,
      config.public.supabaseAnonKey as string,
    )
  }
  return _supabase
}

const CLE_INSCRIPTION = 'dawky-inscription-en-attente'

export interface InfosInscription {
  prenom: string
  nom: string
  codeParrainage?: string
  quizResultId?: string
  consentementChien?: boolean
}

const MESSAGES_AUTH: Array<[RegExp, string]> = [
  [/invalid login credentials/i, 'Email ou mot de passe incorrect.'],
  [/email not confirmed/i, 'Confirmez d\'abord votre adresse email grâce au lien que nous vous avons envoyé.'],
  [/user already registered|already been registered/i, 'Un compte existe déjà avec cet email. Connectez-vous.'],
  [/password should be at least/i, 'Le mot de passe doit contenir au moins 6 caractères.'],
  [/rate limit|too many/i, 'Trop de tentatives. Patientez quelques minutes avant de réessayer.'],
  [/invalid email|unable to validate email/i, 'Adresse email invalide.'],
  [/same password|different from the old/i, 'Le nouveau mot de passe doit être différent de l\'ancien.'],
]

export function traduireErreurAuth(err: unknown): string {
  const message = (err as { message?: string })?.message ?? ''
  return MESSAGES_AUTH.find(([re]) => re.test(message))?.[1]
    ?? 'Une erreur est survenue. Réessayez dans un instant.'
}

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const profile = useState<Profil | null>('auth-profile', () => null)
  const ready = useState<boolean>('auth-ready', () => false)

  async function fetchProfile() {
    try {
      const res = await $fetch<{ data: Profil }>('/api/auth/profile')
      profile.value = res.data
    } catch (err) {
      const status = (err as { statusCode?: number })?.statusCode
      // Compte Supabase sans profil Dawky : inscription confirmée par email
      if (status === 404 && (await finaliserInscription())) {
        const res = await $fetch<{ data: Profil }>('/api/auth/profile')
        profile.value = res.data
      } else {
        profile.value = null
      }
    }
  }

  async function finaliserInscription(): Promise<boolean> {
    const brut = localStorage.getItem(CLE_INSCRIPTION)
    if (!brut) return false
    const infos = JSON.parse(brut) as InfosInscription
    await $fetch('/api/auth/register', { method: 'POST', body: infos })
    localStorage.removeItem(CLE_INSCRIPTION)
    return true
  }

  async function init() {
    const sb = getSupabase()
    const { data: { session } } = await sb.auth.getSession()
    user.value = session?.user ?? null
    if (session?.user) await fetchProfile()
    ready.value = true

    sb.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null
      if (!session?.user) {
        profile.value = null
        return
      }
      // Ne pas bloquer le callback Supabase (risque de blocage interne)
      if (event === 'SIGNED_IN' && !profile.value) setTimeout(fetchProfile, 0)
    })
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password })
    if (error) throw new Error(traduireErreurAuth(error))
    // Sans attendre onAuthStateChange : la redirection qui suit passe par
    // le middleware `auth`, qui doit déjà voir l'utilisateur connecté
    user.value = data.user
    await fetchProfile()
  }

  /**
   * Crée le compte. Renvoie `confirmationRequise: true` si Supabase
   * attend la confirmation de l'email avant d'ouvrir la session.
   */
  async function signUp(email: string, password: string, infos: InfosInscription) {
    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${useRuntimeConfig().public.appUrl}/connexion?confirme=1` },
    })
    if (error) throw new Error(traduireErreurAuth(error))

    localStorage.setItem(CLE_INSCRIPTION, JSON.stringify(infos))
    if (!data.session) return { confirmationRequise: true }

    user.value = data.user
    await fetchProfile()
    return { confirmationRequise: false }
  }

  async function signOut() {
    await getSupabase().auth.signOut()
    user.value = null
    profile.value = null
    await navigateTo('/')
  }

  async function demanderReinitialisation(email: string) {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${useRuntimeConfig().public.appUrl}/mot-de-passe/nouveau`,
    })
    if (error) throw new Error(traduireErreurAuth(error))
  }

  async function changerMotDePasse(password: string) {
    const { error } = await getSupabase().auth.updateUser({ password })
    if (error) throw new Error(traduireErreurAuth(error))
  }

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'ADMIN')

  return {
    user, profile, ready, isLoggedIn, isAdmin,
    init, fetchProfile, signIn, signUp, signOut, demanderReinitialisation, changerMotDePasse,
  }
}
