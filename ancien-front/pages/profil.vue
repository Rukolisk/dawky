<!-- pages/profil.vue -->
<template>
  <div class="container profil-page">

    <div class="profil-header">
      <div>
        <p class="section-tag">Mon Compte</p>
        <h1 class="section-title">Bonjour, {{ user?.prenom }} 🐾</h1>
      </div>
      <!-- Badge rôle + bouton rafraîchir (utile après promotion admin) -->
      <div class="profil-header__right">
        <span :class="['role-badge', user?.role === 'ADMIN' ? 'role-admin' : 'role-user']">
          {{ user?.role === 'ADMIN' ? '⚙ Admin' : '👤 Membre' }}
        </span>
        <button class="btn btn-outline btn-sm" :disabled="reloading" @click="doReload" title="Actualiser votre rôle si vous venez d'être promu admin">
          {{ reloading ? '…' : '🔄 Actualiser le rôle' }}
        </button>
        <NuxtLink v-if="isAdmin" to="/admin" class="btn btn-sm" style="background:var(--bleu-vif);color:var(--nuit)">
          ⚙ Interface Admin
        </NuxtLink>
      </div>
    </div>

    <div class="profil-grid">

      <!-- Infos personnelles -->
      <div class="profil-card card">
        <h2 class="profil-card__title">Informations personnelles</h2>
        <form @submit.prevent="saveProfile">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Prénom</label>
              <input v-model="form.prenom" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Nom</label>
              <input v-model="form.nom" type="text" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input :value="user?.email" type="email" class="form-input" disabled style="opacity:.55" />
            <p class="form-hint">L'email ne peut pas être modifié ici.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Téléphone</label>
            <input v-model="form.telephone" type="tel" class="form-input" placeholder="+33 6 12 34 56 78" />
          </div>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{ saving ? 'Sauvegarde…' : 'Enregistrer' }}
          </button>
        </form>
      </div>

      <!-- Adresse de livraison -->
      <div class="profil-card card">
        <h2 class="profil-card__title">🚚 Adresse de livraison</h2>
        <p class="profil-card__sub">Utilisée automatiquement lors de vos commandes.</p>
        <form @submit.prevent="saveProfile">
          <div class="form-group">
            <label class="form-label">Adresse *</label>
            <AdresseAutocomplete
              v-model="form.adresse"
              placeholder="12 rue des Lilas…"
              type="housenumber"
              @select="onAdresseSelect"
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Code postal *</label>
              <input v-model="form.codePostal" type="text" class="form-input" placeholder="75011" />
            </div>
            <div class="form-group">
              <label class="form-label">Ville *</label>
              <input v-model="form.ville" type="text" class="form-input" placeholder="Paris" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Pays</label>
            <select v-model="form.pays" class="form-select">
              <option>France</option>
              <option>Belgique</option>
              <option>Suisse</option>
              <option>Luxembourg</option>
            </select>
          </div>

          <div :class="['addr-status', adresseComplete ? 'status-ok' : 'status-warn']">
            {{ adresseComplete ? '✓ Adresse complète' : '⚠ Adresse incomplète — requise pour commander' }}
          </div>

          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{ saving ? 'Sauvegarde…' : 'Enregistrer l\'adresse' }}
          </button>
        </form>
      </div>

      <!-- Mes abonnements -->
      <div class="profil-card card profil-card--full">
        <h2 class="profil-card__title">📦 Mes abonnements</h2>
        <p style="color:var(--muted);font-size:.9rem">Aucun abonnement actif pour le moment.</p>
        <NuxtLink to="/abonnement" class="btn btn-outline" style="display:inline-flex;margin-top:1rem;">
          Voir les formules →
        </NuxtLink>
      </div>
    </div>

    <!-- Déconnexion -->
    <div class="profil-logout">
      <button class="btn btn-outline" style="color:var(--danger);border-color:var(--danger)" @click="logout">
        Se déconnecter
      </button>
    </div>

    <DawkyToast />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Mon Profil — Dawky' })

const { user, updateProfile, logout, isAdmin, reloadProfile } = useAuth()

// Formulaire
const form = reactive({
  prenom:    '',
  nom:       '',
  telephone: '',
  adresse:   '',
  ville:     '',
  codePostal: '',
  pays:      'France',
})

// Sync quand user se charge
watch(user, (u) => {
  if (!u) return
  form.prenom    = u.prenom    ?? ''
  form.nom       = u.nom       ?? ''
  form.telephone = u.telephone ?? ''
  form.adresse   = u.adresse   ?? ''
  form.ville     = u.ville     ?? ''
  form.codePostal = u.codePostal ?? ''
  form.pays      = u.pays      ?? 'France'
}, { immediate: true })

const adresseComplete = computed(() =>
  !!(form.adresse && form.ville && form.codePostal)
)

function onAdresseSelect(s: { codePostal: string; ville: string }) {
  form.codePostal = s.codePostal
  form.ville      = s.ville
}

const saving   = ref(false)
const reloading = ref(false)

async function saveProfile() {
  saving.value = true
  try {
    await updateProfile({
      prenom:    form.prenom,
      nom:       form.nom,
      telephone: form.telephone || null,
      adresse:   form.adresse   || null,
      ville:     form.ville     || null,
      codePostal: form.codePostal || null,
      pays:      form.pays,
    })
  } finally {
    saving.value = false
  }
}

async function doReload() {
  reloading.value = true
  await reloadProfile()
  reloading.value = false
  const { success } = useToast()
  success(isAdmin.value ? '✓ Rôle Admin activé — rechargez la page' : '✓ Profil actualisé')
}
</script>

<style scoped>
.profil-page { padding: 4rem 0 6rem; }
.profil-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 3rem; flex-wrap: wrap; gap: 1rem;
}
.profil-header__right { display: flex; align-items: center; gap: .8rem; flex-wrap: wrap; }

.role-badge {
  padding: .3rem .9rem; border-radius: 40px;
  font-size: .78rem; font-weight: 600; letter-spacing: .05em;
}
.role-admin { background: rgba(212,136,59,.2); color: var(--bleu-vif); }
.role-user  { background: var(--brume); color: var(--nuit); }

.profil-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.8rem; }
.profil-card { padding: 2rem; }
.profil-card--full { grid-column: 1 / -1; }
.profil-card__title {
  font-family: var(--font-display);
  font-size: 1.2rem; font-weight: 700; margin-bottom: .5rem;
}
.profil-card__sub { font-size: .88rem; color: var(--muted); margin-bottom: 1.2rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-hint { font-size: .75rem; color: var(--muted); margin-top: .3rem; }

.addr-status {
  padding: .6rem 1rem; border-radius: 8px;
  font-size: .82rem; font-weight: 500; margin-bottom: 1rem;
}
.status-ok   { background: #EDF4E5; color: #2D6A1F; }
.status-warn { background: #FFF8E7; color: #8A6200; }

.profil-logout { margin-top: 3rem; display: flex; justify-content: center; }

@media (max-width: 700px) {
  .profil-grid { grid-template-columns: 1fr; }
  .profil-header { flex-direction: column; }
}
</style>
