<!-- pages/connexion.vue -->
<template>
  <div class="auth-page">
    <!-- Décorations -->
    <div class="auth-page__bg">
      <div class="auth-page__paw" style="top:10%;left:5%;font-size:3rem;opacity:.08;transform:rotate(-20deg)">🐾</div>
      <div class="auth-page__paw" style="top:60%;right:8%;font-size:4rem;opacity:.06;transform:rotate(15deg)">🐾</div>
      <div class="auth-page__paw" style="bottom:15%;left:10%;font-size:2rem;opacity:.09;transform:rotate(-5deg)">🐾</div>
    </div>

    <div class="auth-card card">
      <!-- Logo -->
      <NuxtLink to="/" class="auth-logo">DAW<span>KY</span> 🐾</NuxtLink>
      <h1 class="auth-title">{{ isRegister ? 'Créer un compte' : 'Content de vous revoir !' }}</h1>
      <p class="auth-sub">{{ isRegister ? 'Rejoignez la famille Dawky 🐕' : 'Connectez-vous pour gérer vos boxes' }}</p>

      <!-- Tabs -->
      <div class="auth-tabs">
        <button :class="['auth-tab', { active: !isRegister }]" @click="isRegister = false">Connexion</button>
        <button :class="['auth-tab', { active: isRegister }]"  @click="isRegister = true">Inscription</button>
      </div>

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <!-- LOGIN -->
      <form v-if="!isRegister" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="loginForm.email" type="email" class="form-input" placeholder="vous@exemple.fr" required />
        </div>
        <div class="form-group">
          <label class="form-label">Mot de passe</label>
          <div class="input-eye">
            <input v-model="loginForm.password" :type="showPwd ? 'text' : 'password'" class="form-input" placeholder="••••••••" required />
            <button type="button" class="eye-btn" @click="showPwd = !showPwd">{{ showPwd ? '🙈' : '👁️' }}</button>
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-full btn-lg" :disabled="loading">
          <span v-if="loading" class="spinner" style="width:18px;height:18px;border-width:2px" />
          <span v-else>Se connecter 🐾</span>
        </button>
      </form>

      <!-- REGISTER -->
      <form v-else @submit.prevent="handleRegister">
        <div class="form-row">
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
          <input v-model="regForm.email" type="email" class="form-input" placeholder="vous@exemple.fr" required />
        </div>
        <div class="form-group">
          <label class="form-label">Mot de passe *</label>
          <div class="input-eye">
            <input v-model="regForm.password" :type="showPwd ? 'text' : 'password'" class="form-input" placeholder="8 caractères minimum" required minlength="8" />
            <button type="button" class="eye-btn" @click="showPwd = !showPwd">{{ showPwd ? '🙈' : '👁️' }}</button>
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-full btn-lg" :disabled="loading">
          <span v-if="loading" class="spinner" style="width:18px;height:18px;border-width:2px" />
          <span v-else>Créer mon compte 🐾</span>
        </button>
      </form>

      <p class="auth-footer">
        En continuant, vous acceptez nos <NuxtLink to="#">CGV</NuxtLink> et notre <NuxtLink to="#">politique de confidentialité</NuxtLink>.
      </p>
    </div>

    <KodaToast />
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Connexion — Dawky' })
const route = useRoute(); const router = useRouter()
const { login, register, isLoggedIn } = useAuth()
if (isLoggedIn.value) router.replace('/')
const isRegister = ref(false); const showPwd = ref(false)
const loading = ref(false); const error = ref('')
const loginForm = reactive({ email: '', password: '' })
const regForm   = reactive({ prenom: '', nom: '', email: '', password: '' })

async function handleLogin() {
  loading.value = true; error.value = ''
  try {
    await login(loginForm.email, loginForm.password)
    router.push((route.query.redirect as string) ?? '/')
  } catch (e: any) { error.value = (e as Error).message }
  finally { loading.value = false }
}
async function handleRegister() {
  loading.value = true; error.value = ''
  try { await register(regForm); router.push('/') }
  catch (e: any) { error.value = (e as Error).message }
  finally { loading.value = false }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 72px); display: flex; align-items: center;
  justify-content: center; padding: 3rem 1rem; position: relative;
  background: linear-gradient(160deg, #FAF0DC, #F0E2C8);
}
.auth-page__bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.auth-page__paw { position: absolute; pointer-events: none; }

.auth-card { width: 100%; max-width: 460px; padding: 3rem 2.5rem; }
.auth-logo {
  font-family: var(--font-display); font-size: 2rem; font-weight: 900;
  color: var(--nuit); display: block; text-align: center; margin-bottom: .5rem;
}
.auth-logo span { color: var(--bleu-vif); }
.auth-title { font-family: var(--font-display); font-size: 1.6rem; font-weight: 900; text-align: center; margin-bottom: .3rem; }
.auth-sub { text-align: center; color: var(--muted); font-size: .9rem; margin-bottom: 1.8rem; }

.auth-tabs { display: flex; background: var(--neige); border-radius: var(--r-full); padding: 4px; margin-bottom: 1.8rem; border: 1.5px solid var(--brume); }
.auth-tab { flex: 1; padding: .6rem; border-radius: 46px; border: none; font-size: .88rem; font-weight: 600; cursor: pointer; background: transparent; color: var(--muted); transition: all .2s; font-family: var(--font-body); }
.auth-tab.active { background: var(--bleu-vif); color: white; box-shadow: 0 2px 8px rgba(200,120,58,.3); }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.input-eye { position: relative; }
.input-eye .form-input { padding-right: 3rem; }
.eye-btn { position: absolute; right: .9rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1rem; }

.auth-footer { text-align: center; font-size: .76rem; color: var(--muted); margin-top: 1.5rem; line-height: 1.6; }
.auth-footer a { color: var(--bleu-vif); }
</style>
