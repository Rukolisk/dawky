// composables/useAuth.ts
// ─────────────────────────────────────────
// Authentification Dawky — flux robuste
//
// Problèmes résolus :
// 1. onAuthStateChange ne doit PAS écraser user si login() vient de le remplir
// 2. supabaseUid séparé du cuid Prisma
// 3. Gestion propre du 404 (profil pas encore créé)
// ─────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

let _supabase: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (_supabase) return _supabase
  const config = useRuntimeConfig()
  _supabase = createClient(
    config.public.supabaseUrl as string,
    config.public.supabaseAnonKey as string,
  )
  return _supabase
}

// ─── State global partagé ───
interface UserProfile {
  id: string           // cuid Prisma — pour affichage
  supabaseUid: string  // UUID Supabase — pour les appels API
  email: string
  prenom: string
  nom: string
  role: 'USER' | 'ADMIN'
  telephone?: string | null
  adresse?: string | null
  ville?: string | null
  codePostal?: string | null
  pays?: string | null
}

const user        = ref<UserProfile | null>(null)
const authLoading = ref(true)
let   _initialized = false

export function useAuth() {
  const supabase = getSupabase()
  const router   = useRouter()
  const { success: toastSuccess } = useToast()

  // ────────────────────────────────────────────────
  // INIT — appelé une seule fois dans app.vue
  // ────────────────────────────────────────────────
  async function init() {
    if (_initialized) return
    _initialized = true

    authLoading.value = true

    // Récupérer la session existante (refresh de page)
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await _fetchProfile(session.user.id)
    }
    authLoading.value = false

    // Écouter les futurs changements d'état
    // IMPORTANT : on ignore SIGNED_IN ici car login() s'en occupe déjà.
    // On gère seulement SIGNED_OUT et TOKEN_REFRESHED.
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        user.value = null
        authLoading.value = false
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Refresh silencieux du token — on re-sync le profil
        await _fetchProfile(session.user.id)
      }
      // SIGNED_IN est géré directement par login() pour éviter les doublons
    })
  }

  // ────────────────────────────────────────────────
  // FETCH PROFILE depuis la base Prisma
  // Retourne true si trouvé, false sinon (sans throw)
  // ────────────────────────────────────────────────
  async function _fetchProfile(supabaseUid: string): Promise<boolean> {
    try {
      const res = await $fetch<{ data: UserProfile }>('/api/auth/profile', {
        headers: { 'x-supabase-uid': supabaseUid },
      })
      user.value = { ...res.data, supabaseUid }
      return true
    } catch (err: any) {
      // 404 = profil pas encore créé en base, ne pas écraser un user existant
      if (err?.status === 404 || err?.statusCode === 404) {
        // On ne touche PAS user.value ici — il sera créé par register()
        return false
      }
      // Autre erreur (réseau, 500…) — on logue sans déconnecter
      console.warn('[Auth] fetchProfile failed:', err?.data?.statusMessage ?? err?.message ?? err)
      return false
    }
  }

  // ────────────────────────────────────────────────
  // INSCRIPTION
  // ────────────────────────────────────────────────
  async function register(payload: {
    email: string; password: string; prenom: string; nom: string
  }) {
    const { data, error } = await supabase.auth.signUp({
      email:    payload.email,
      password: payload.password,
    })

    if (error) throw new Error(frenchError(error.message))
    if (!data.user) throw new Error('Erreur lors de la création du compte')

    // Créer le profil Prisma
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        supabaseUid: data.user.id,
        email:       payload.email,
        prenom:      payload.prenom,
        nom:         payload.nom,
      },
    })

    // Charger le profil fraîchement créé
    await _fetchProfile(data.user.id)

    toastSuccess(`Bienvenue, ${payload.prenom} ! 🐾`)
    return data
  }

  // ────────────────────────────────────────────────
  // CONNEXION
  // ────────────────────────────────────────────────
  async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) throw new Error(frenchError(error.message))

    // Charger le profil Prisma
    const found = await _fetchProfile(data.user.id)

    if (!found) {
      // Profil absent en base (ex: compte Supabase créé manuellement)
      // On crée un profil minimal automatiquement
      try {
        await $fetch('/api/auth/register', {
          method: 'POST',
          body: {
            supabaseUid: data.user.id,
            email,
            prenom: email.split('@')[0],
            nom:    '',
          },
        })
        await _fetchProfile(data.user.id)
      } catch (regErr) {
        console.warn('[Auth] auto-register failed:', regErr)
      }
    }

    toastSuccess(`Bienvenue${user.value?.prenom ? `, ${user.value.prenom}` : ''} ! 🐾`)
    return data
  }

  // ────────────────────────────────────────────────
  // DÉCONNEXION
  // ────────────────────────────────────────────────
  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    toastSuccess('À bientôt !')
    await router.push('/')
  }

  // ────────────────────────────────────────────────
  // MAJ PROFIL (adresse, nom, etc.)
  // ────────────────────────────────────────────────
  async function updateProfile(
    payload: Partial<Omit<UserProfile, 'id' | 'supabaseUid' | 'email' | 'role'>>,
  ) {
    if (!user.value?.supabaseUid) throw new Error('Non connecté')

    const res = await $fetch<{ data: UserProfile }>('/api/auth/profile', {
      method:  'PUT',
      body:    payload,
      headers: { 'x-supabase-uid': user.value.supabaseUid },
    })
    // Conserver supabaseUid dans le state
    user.value = { ...res.data, supabaseUid: user.value.supabaseUid }
    toastSuccess('Profil mis à jour ✓')
  }

  // ────────────────────────────────────────────────
  // RELOAD PROFIL (après changement de rôle admin)
  // ────────────────────────────────────────────────
  async function reloadProfile() {
    if (!user.value?.supabaseUid) return
    await _fetchProfile(user.value.supabaseUid)
  }

  // ─── Computed ───
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin    = computed(() => user.value?.role === 'ADMIN')

  return {
    user:        readonly(user),
    authLoading: readonly(authLoading),
    isLoggedIn,
    isAdmin,
    init,
    login,
    register,
    logout,
    updateProfile,
    reloadProfile,
  }
}

// ─── Traduction des erreurs Supabase ───
function frenchError(msg: string): string {
  const map: [string, string][] = [
    ['Invalid login credentials',  'Email ou mot de passe incorrect.'],
    ['Email not confirmed',        'Confirmez votre email avant de vous connecter (vérifiez vos spams).'],
    ['User already registered',    'Un compte existe déjà avec cet email.'],
    ['Password should be',         'Le mot de passe doit contenir au moins 6 caractères.'],
    ['rate limit',                 'Trop de tentatives, réessayez dans quelques minutes.'],
    ['signup_disabled',            'Les inscriptions sont temporairement désactivées.'],
  ]
  for (const [key, fr] of map) {
    if (msg.toLowerCase().includes(key.toLowerCase())) return fr
  }
  return msg
}
