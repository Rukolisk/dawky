<template>
  <div class="auth-page">
    <div class="auth-bg">
      <img :src="images.fond_motif_bleu" alt="" />
    </div>

    <div class="container auth-wrapper">
      <div class="auth-card">
        <!-- Logo -->
        <NuxtLink to="/" class="auth-logo">
          <img :src="images.logo_dawky_bleu" alt="Dawky" />
        </NuxtLink>

        <!-- Tabs -->
        <div class="auth-tabs">
          <button class="auth-tab" :class="{ active: mode === 'login' }" @click="mode = 'login'">Connexion</button>
          <button class="auth-tab" :class="{ active: mode === 'register' }" @click="mode = 'register'">Créer un compte</button>
        </div>

        <!-- LOGIN -->
        <form v-if="mode === 'login'" class="auth-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="loginForm.email" type="email" class="form-input" placeholder="votre@email.fr" required />
          </div>
          <div class="form-group">
            <label class="form-label">Mot de passe</label>
            <div class="input-eye">
              <input v-model="loginForm.password" :type="showPwd ? 'text' : 'password'" class="form-input" placeholder="••••••••" required />
              <button type="button" class="eye-btn" @click="showPwd = !showPwd">{{ showPwd ? '🙈' : '👁️' }}</button>
            </div>
          </div>
          <p v-if="loginError" class="form-error">{{ loginError }}</p>
          <button type="submit" class="btn btn-primary w-full btn-lg" :disabled="loading">
            <span v-if="loading">Connexion…</span>
            <span v-else>Se connecter</span>
          </button>
          <button type="button" class="btn btn-ghost w-full text-sm" @click="mode = 'forgot'">Mot de passe oublié ?</button>
        </form>

        <!-- REGISTER -->
        <form v-if="mode === 'register'" class="auth-form" @submit.prevent="handleRegister">
          <div class="auth-form-row">
            <div class="form-group">
              <label class="form-label">Prénom *</label>
              <input v-model="regForm.prenom" type="text" class="form-input" placeholder="Marie" required />
            </div>
            <div class="form-group">
              <label class="form-label">Nom *</label>
              <input v-model="regForm.nom" type="text" class="form-input" placeholder="Dupont" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Email *</label>
            <input v-model="regForm.email" type="email" class="form-input" placeholder="votre@email.fr" required />
          </div>
          <div class="form-group">
            <label class="form-label">Mot de passe *</label>
            <div class="input-eye">
              <input v-model="regForm.password" :type="showPwd ? 'text' : 'password'" class="form-input" placeholder="8 caractères minimum" required minlength="8" />
              <button type="button" class="eye-btn" @click="showPwd = !showPwd">{{ showPwd ? '🙈' : '👁️' }}</button>
            </div>
            <div class="pwd-strength" v-if="regForm.password">
              <div class="pwd-bar" :class="pwdStrengthClass" :style="{ width: pwdStrength + '%' }" />
              <span class="pwd-label text-xs">{{ pwdLabel }}</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-group-checkbox">
              <input v-model="regForm.cgv" type="checkbox" required />
              <span class="text-sm">J'accepte les <NuxtLink to="/cgv" class="link-blue">CGV</NuxtLink> et la <NuxtLink to="/mentions-legales" class="link-blue">politique de confidentialité</NuxtLink></span>
            </label>
          </div>
          <p v-if="regError" class="form-error">{{ regError }}</p>
          <button type="submit" class="btn btn-primary w-full btn-lg" :disabled="loading">
            <span v-if="loading">Création du compte…</span>
            <span v-else>🐾 Créer mon compte</span>
          </button>
        </form>

        <!-- MOT DE PASSE OUBLIÉ -->
        <div v-if="mode === 'forgot'" class="auth-form">
          <p class="text-soft mb-4">Entrez votre email pour recevoir un lien de réinitialisation.</p>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="forgotEmail" type="email" class="form-input" placeholder="votre@email.fr" />
          </div>
          <p v-if="forgotDone" class="auth-success">✅ Email envoyé ! Vérifiez votre boîte.</p>
          <button class="btn btn-primary w-full" @click="handleForgot" :disabled="loading">Envoyer le lien</button>
          <button class="btn btn-ghost w-full mt-2" @click="mode = 'login'">← Retour</button>
        </div>

        <!-- Social proof -->
        <div class="auth-footer">
          <div class="auth-divider"><span>Sécurisé par</span></div>
          <div class="auth-trust">
            <span class="trust-badge">🔒 SSL</span>
            <span class="trust-badge">✅ Sans engagement</span>
            <span class="trust-badge">🐾 +500 chiens heureux</span>
          </div>
        </div>
      </div>

      <!-- Mascotte déco -->
      <div class="auth-mascot hide-mobile">
        <img :src="images.mascotte_3" alt="" class="animate-float" />
        <div class="auth-mascot-bubble">
          <p>"La box de Luna arrive<br/>dans <strong>3 jours</strong> !"</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { dawkyImages } from '~/composables/useDawkyImages'
const images = dawkyImages

useSeoMeta({ title: 'Connexion — Dawky' })

const { signIn, signUp, isLoggedIn } = useAuth()

// Redirect if already logged in
watch(isLoggedIn, (v) => { if (v) navigateTo('/mon-compte') }, { immediate: true })

const mode = ref<'login' | 'register' | 'forgot'>('login')
const loading = ref(false)
const showPwd = ref(false)
const loginError = ref('')
const regError = ref('')
const forgotEmail = ref('')
const forgotDone = ref(false)

const loginForm = reactive({ email: '', password: '' })
const regForm = reactive({ prenom: '', nom: '', email: '', password: '', cgv: false })

// Password strength
const pwdStrength = computed(() => {
  const p = regForm.password
  let score = 0
  if (p.length >= 8) score += 25
  if (p.length >= 12) score += 25
  if (/[A-Z]/.test(p)) score += 25
  if (/[0-9!@#$%^&*]/.test(p)) score += 25
  return score
})
const pwdStrengthClass = computed(() => {
  if (pwdStrength.value <= 25) return 'pwd-weak'
  if (pwdStrength.value <= 50) return 'pwd-medium'
  if (pwdStrength.value <= 75) return 'pwd-good'
  return 'pwd-strong'
})
const pwdLabel = computed(() => {
  if (pwdStrength.value <= 25) return 'Trop court'
  if (pwdStrength.value <= 50) return 'Faible'
  if (pwdStrength.value <= 75) return 'Moyen'
  return 'Fort ✓'
})

async function handleLogin() {
  loginError.value = ''
  loading.value = true
  try {
    await signIn(loginForm.email, loginForm.password)
    navigateTo('/mon-compte')
  } catch (e: any) {
    loginError.value = 'Email ou mot de passe incorrect.'
  } finally { loading.value = false }
}

async function handleRegister() {
  regError.value = ''
  if (!regForm.cgv) { regError.value = 'Veuillez accepter les CGV.'; return }
  loading.value = true
  try {
    await signUp(regForm.email, regForm.password, regForm.prenom, regForm.nom)
    mode.value = 'login'
    loginForm.email = regForm.email
  } catch (e: any) {
    regError.value = e?.data?.message ?? 'Erreur lors de la création du compte.'
  } finally { loading.value = false }
}

async function handleForgot() {
  loading.value = true
  await new Promise(r => setTimeout(r, 1000))
  forgotDone.value = true
  loading.value = false
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: var(--cream);
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.auth-bg {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  pointer-events: none;
}
.auth-bg img { width: 100%; height: 100%; object-fit: cover; }

.auth-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-9);
  padding: var(--space-8) 0;
  position: relative;
}

.auth-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-7);
  border: 2px solid var(--border);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 460px;
  flex-shrink: 0;
}

.auth-logo { display: block; margin-bottom: var(--space-6); }
.auth-logo img { height: 36px; }

.auth-tabs {
  display: flex;
  background: var(--cream);
  border-radius: var(--radius-pill);
  padding: 4px;
  gap: 4px;
  margin-bottom: var(--space-6);
}
.auth-tab {
  flex: 1;
  padding: 10px 16px;
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--ink-muted);
  transition: all var(--duration-base);
}
.auth-tab.active { background: white; color: var(--blue); box-shadow: var(--shadow-sm); }

.auth-form { display: flex; flex-direction: column; gap: var(--space-4); }
.auth-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }

.input-eye { position: relative; }
.input-eye .form-input { padding-right: 48px; }
.eye-btn {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; font-size: 1.125rem; padding: 4px;
}

/* Password strength */
.pwd-strength { display: flex; align-items: center; gap: var(--space-3); margin-top: var(--space-2); }
.pwd-bar { height: 4px; border-radius: 2px; transition: all 0.3s; }
.pwd-weak   { background: #E54747; }
.pwd-medium { background: #FF9500; }
.pwd-good   { background: #FFB800; }
.pwd-strong { background: #2D7A4A; }
.pwd-label { color: var(--ink-muted); }

.form-group-checkbox {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  cursor: pointer;
}
.form-group-checkbox input { margin-top: 3px; accent-color: var(--blue); }

.link-blue { color: var(--blue); text-decoration: underline; }

.auth-success { color: #2D7A4A; font-size: 0.9375rem; font-weight: 500; }

/* Footer */
.auth-footer { margin-top: var(--space-5); padding-top: var(--space-5); border-top: 1px solid var(--border); }
.auth-divider {
  display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3);
  font-size: 0.75rem; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.08em;
}
.auth-divider::before, .auth-divider::after {
  content: ''; flex: 1; height: 1px; background: var(--border);
}
.auth-trust { display: flex; gap: var(--space-3); justify-content: center; flex-wrap: wrap; }
.trust-badge {
  font-size: 0.8125rem; font-weight: 500; color: var(--ink-soft);
  background: var(--cream); border: 1px solid var(--border);
  padding: 4px 12px; border-radius: var(--radius-pill);
}

/* Mascotte */
.auth-mascot {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}
.auth-mascot img { width: 280px; filter: drop-shadow(0 10px 40px rgba(4,172,227,0.2)); }

.auth-mascot-bubble {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-5);
  border: 2px solid var(--border);
  box-shadow: var(--shadow-sm);
  font-size: 0.9375rem;
  line-height: 1.5;
  position: relative;
}
.auth-mascot-bubble::before {
  content: '';
  position: absolute;
  top: -10px; left: 50%; transform: translateX(-50%);
  border: 10px solid transparent;
  border-bottom-color: white;
  border-top: none;
}

@media (max-width: 768px) {
  .auth-wrapper { flex-direction: column; align-items: center; }
  .auth-card { max-width: 100%; }
  .auth-form-row { grid-template-columns: 1fr; }
}
</style>
