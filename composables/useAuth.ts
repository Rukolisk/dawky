// composables/useAuth.ts
import { createClient } from '@supabase/supabase-js'

let _supabase: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (!_supabase) {
    const config = useRuntimeConfig()
    _supabase = createClient(
      config.public.supabaseUrl as string,
      config.public.supabaseAnonKey as string,
    )
  }
  return _supabase
}

export function useAuth() {
  const user = useState<any>('auth-user', () => null)
  const profile = useState<any>('auth-profile', () => null)
  const loading = useState<boolean>('auth-loading', () => false)

  async function init() {
    const sb = getSupabase()
    const { data: { session } } = await sb.auth.getSession()
    if (session?.user) {
      user.value = session.user
      await fetchProfile()
    }
    sb.auth.onAuthStateChange(async (_event, session) => {
      user.value = session?.user ?? null
      if (session?.user) await fetchProfile()
      else profile.value = null
    })
  }

  async function fetchProfile() {
    try {
      const data = await $fetch('/api/auth/profile')
      profile.value = (data as any).data
    } catch {}
  }

  async function signIn(email: string, password: string) {
    const sb = getSupabase()
    loading.value = true
    try {
      const { error } = await sb.auth.signInWithPassword({ email, password })
      if (error) throw error
      await fetchProfile()
    } finally {
      loading.value = false
    }
  }

  async function signUp(email: string, password: string, prenom: string, nom: string) {
    const sb = getSupabase()
    loading.value = true
    try {
      const { data, error } = await sb.auth.signUp({ email, password })
      if (error) throw error
      if (data.user) {
        await $fetch('/api/auth/register', {
          method: 'POST',
          body: { email, prenom, nom, supabaseUid: data.user.id },
        })
      }
      return data
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    const sb = getSupabase()
    await sb.auth.signOut()
    user.value = null
    profile.value = null
    navigateTo('/')
  }

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'ADMIN')

  return { user, profile, loading, isLoggedIn, isAdmin, init, signIn, signUp, signOut, fetchProfile }
}
