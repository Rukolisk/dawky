<template>
  <div class="profil-page">
    <h2 class="page-title">👤 Mon profil</h2>

    <form class="profil-form" @submit.prevent="saveProfile">
      <div class="form-section">
        <h3 class="form-section-title">Informations personnelles</h3>
        <div class="profil-grid">
          <div class="form-group">
            <label class="form-label">Prénom *</label>
            <input v-model="form.prenom" type="text" class="form-input" placeholder="Prénom" required />
          </div>
          <div class="form-group">
            <label class="form-label">Nom *</label>
            <input v-model="form.nom" type="text" class="form-input" placeholder="Nom" required />
          </div>
          <div class="form-group" style="grid-column:1/-1">
            <label class="form-label">Email</label>
            <input :value="profile?.email" type="email" class="form-input" disabled />
            <p class="text-xs text-muted mt-1">L'email ne peut pas être modifié ici.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Téléphone</label>
            <input v-model="form.telephone" type="tel" class="form-input" placeholder="06 12 34 56 78" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3 class="form-section-title">Adresse de livraison</h3>
        <div class="profil-grid">
          <div class="form-group" style="grid-column:1/-1">
            <label class="form-label">Adresse *</label>
            <input v-model="form.adresse" type="text" class="form-input" placeholder="12 rue des Chiens" required />
          </div>
          <div class="form-group">
            <label class="form-label">Code postal *</label>
            <input v-model="form.codePostal" type="text" class="form-input" placeholder="75001" maxlength="5" required />
          </div>
          <div class="form-group">
            <label class="form-label">Ville *</label>
            <input v-model="form.ville" type="text" class="form-input" placeholder="Paris" required />
          </div>
          <div class="form-group">
            <label class="form-label">Pays</label>
            <select v-model="form.pays" class="form-select">
              <option value="France">France</option>
              <option value="Belgique">Belgique</option>
              <option value="Suisse">Suisse</option>
              <option value="Luxembourg">Luxembourg</option>
            </select>
          </div>
        </div>
      </div>

      <p v-if="saveError" class="form-error">{{ saveError }}</p>
      <p v-if="saveSuccess" class="save-success">✅ Profil mis à jour avec succès !</p>

      <div class="profil-form-actions">
        <button type="submit" class="btn btn-primary btn-lg" :disabled="saving">
          {{ saving ? 'Sauvegarde…' : '💾 Enregistrer les modifications' }}
        </button>
      </div>
    </form>

    <!-- Changer mot de passe -->
    <div class="section-block">
      <h3 class="form-section-title">🔐 Sécurité</h3>
      <form @submit.prevent="changePassword" class="pwd-form">
        <div class="form-group">
          <label class="form-label">Nouveau mot de passe</label>
          <input v-model="newPwd" type="password" class="form-input" placeholder="8 caractères minimum" minlength="8" />
        </div>
        <div class="form-group">
          <label class="form-label">Confirmer</label>
          <input v-model="confirmPwd" type="password" class="form-input" placeholder="••••••••" />
        </div>
        <p v-if="pwdError" class="form-error">{{ pwdError }}</p>
        <p v-if="pwdSuccess" class="save-success">✅ Mot de passe modifié !</p>
        <button type="submit" class="btn btn-outline" :disabled="pwdLoading">
          {{ pwdLoading ? '…' : 'Changer le mot de passe' }}
        </button>
      </form>
    </div>

    <!-- Danger zone -->
    <div class="danger-zone">
      <h3 class="danger-title">⚠️ Zone de danger</h3>
      <p class="text-soft text-sm mb-4">La suppression de votre compte est définitive et irréversible.</p>
      <button class="btn-danger" @click="showDeleteConfirm = true">Supprimer mon compte</button>
    </div>

    <!-- Modal suppression -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal-card animate-fade-in-up">
        <div style="font-size:3rem;text-align:center;margin-bottom:var(--space-3)">⚠️</div>
        <h3 class="modal-title">Supprimer le compte</h3>
        <p class="text-soft mb-4">Cette action est <strong>irréversible</strong>. Toutes vos données (commandes, abonnements) seront supprimées.</p>
        <p class="text-sm mb-3">Tapez <strong>SUPPRIMER</strong> pour confirmer :</p>
        <input v-model="deleteConfirmText" type="text" class="form-input mb-4" placeholder="SUPPRIMER" />
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="showDeleteConfirm = false">Annuler</button>
          <button
            class="btn-danger"
            :disabled="deleteConfirmText !== 'SUPPRIMER'"
            @click="handleDeleteAccount"
          >Confirmer la suppression</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'compte' })

const { profile, fetchProfile, signOut } = useAuth()

const saving = ref(false); const saveError = ref(''); const saveSuccess = ref(false)
const newPwd = ref(''); const confirmPwd = ref(''); const pwdLoading = ref(false)
const pwdError = ref(''); const pwdSuccess = ref(false)
const showDeleteConfirm = ref(false); const deleteConfirmText = ref('')

const form = reactive({
  prenom:    profile.value?.prenom    ?? '',
  nom:       profile.value?.nom       ?? '',
  telephone: profile.value?.telephone ?? '',
  adresse:   profile.value?.adresse   ?? '',
  codePostal:profile.value?.codePostal?? '',
  ville:     profile.value?.ville     ?? '',
  pays:      profile.value?.pays      ?? 'France',
})

watch(profile, (p) => {
  if (p) Object.assign(form, { prenom: p.prenom, nom: p.nom, telephone: p.telephone ?? '', adresse: p.adresse ?? '', codePostal: p.codePostal ?? '', ville: p.ville ?? '', pays: p.pays ?? 'France' })
}, { immediate: true })

async function saveProfile() {
  saving.value = true; saveError.value = ''; saveSuccess.value = false
  try {
    await $fetch('/api/clients/me', { method: 'PUT', body: form })
    await fetchProfile()
    saveSuccess.value = true
    setTimeout(() => saveSuccess.value = false, 3000)
  } catch (e: any) {
    saveError.value = e?.data?.message ?? 'Erreur lors de la sauvegarde.'
  } finally { saving.value = false }
}

async function changePassword() {
  pwdError.value = ''; pwdSuccess.value = false
  if (newPwd.value !== confirmPwd.value) { pwdError.value = 'Les mots de passe ne correspondent pas.'; return }
  if (newPwd.value.length < 8) { pwdError.value = 'Minimum 8 caractères.'; return }
  pwdLoading.value = true
  try {
    await $fetch('/api/auth/change-password', { method: 'POST', body: { password: newPwd.value } })
    pwdSuccess.value = true; newPwd.value = ''; confirmPwd.value = ''
  } catch { pwdError.value = 'Erreur lors du changement.' } finally { pwdLoading.value = false }
}

async function handleDeleteAccount() {
  await $fetch('/api/clients/me', { method: 'DELETE' }).catch(() => {})
  await signOut()
}
</script>

<style scoped>
.profil-page { display: flex; flex-direction: column; gap: var(--space-6); }
.page-title { font-family: var(--font-display); font-size: 1.75rem; font-weight: 700; }

.profil-form { background: white; border: 2px solid var(--border); border-radius: var(--radius-xl); padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-6); }

.form-section { display: flex; flex-direction: column; gap: var(--space-4); }
.form-section-title { font-family: var(--font-display); font-size: 1.125rem; font-weight: 700; padding-bottom: var(--space-3); border-bottom: 1px solid var(--border); }
.profil-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }

.save-success { color: #2D7A4A; font-size: 0.9375rem; font-weight: 500; }
.profil-form-actions { display: flex; }

.section-block { background: white; border: 2px solid var(--border); border-radius: var(--radius-xl); padding: var(--space-6); }

.pwd-form { display: flex; flex-direction: column; gap: var(--space-4); max-width: 400px; margin-top: var(--space-4); }

/* Danger zone */
.danger-zone {
  background: rgba(229,71,71,0.04);
  border: 2px solid rgba(229,71,71,0.2);
  border-radius: var(--radius-xl);
  padding: var(--space-5) var(--space-6);
}
.danger-title { font-family: var(--font-display); font-size: 1.125rem; font-weight: 700; color: #E54747; margin-bottom: var(--space-3); }
.btn-danger {
  padding: 10px 24px; background: transparent; border: 2px solid #E54747; color: #E54747;
  border-radius: var(--radius-pill); font-family: var(--font-body); font-size: 0.9375rem; font-weight: 600;
  cursor: pointer; transition: all var(--duration-fast);
}
.btn-danger:hover:not(:disabled) { background: #E54747; color: white; }
.btn-danger:disabled { opacity: 0.4; cursor: not-allowed; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: var(--space-5); }
.modal-card { background: white; border-radius: var(--radius-xl); padding: var(--space-7); max-width: 440px; width: 100%; box-shadow: var(--shadow-lg); }
.modal-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; margin-bottom: var(--space-3); }
.modal-actions { display: flex; gap: var(--space-3); flex-wrap: wrap; }

@media (max-width: 640px) {
  .profil-grid { grid-template-columns: 1fr; }
  .profil-grid [style*="grid-column"] { grid-column: 1 / -1; }
}
</style>
