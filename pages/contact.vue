<!-- pages/contact.vue -->
<template>
  <div class="contact-wrap container">
    <div class="contact-info">
      <p class="section-tag">Contact</p>
      <h1 class="contact-info__title">Parlons de votre chien 🐾</h1>
      <p class="contact-info__desc">
        Une question sur nos boxes, un problème de livraison, une suggestion ? Notre équipe de
        passionnés est là pour vous répondre sous 24h.
      </p>

      <div class="contact-details">
        <div v-for="d in details" :key="d.label" class="contact-detail">
          <div class="contact-detail__icon">{{ d.icon }}</div>
          <div>
            <strong>{{ d.label }}</strong>
            <span>{{ d.value }}</span>
          </div>
        </div>
      </div>

      <div class="contact-info__note">
        <strong>💬 Réponse garantie sous 24h</strong><br />
        Notre équipe de dog-lovers traite chaque demande avec soin et bienveillance.
      </div>
    </div>

    <div class="contact-form card">
      <h2 class="contact-form__title">Envoyez-nous un message</h2>

      <div v-if="success" class="alert alert-success">✓ {{ success }}</div>

      <form v-else @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Prénom *</label>
            <input v-model="form.prenom" type="text" class="form-input" :class="{ error: errors.prenom }" placeholder="Marie" />
            <p v-if="errors.prenom" class="form-error">{{ errors.prenom }}</p>
          </div>
          <div class="form-group">
            <label class="form-label">Nom *</label>
            <input v-model="form.nom" type="text" class="form-input" :class="{ error: errors.nom }" placeholder="Dupont" />
            <p v-if="errors.nom" class="form-error">{{ errors.nom }}</p>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Email *</label>
          <input v-model="form.email" type="email" class="form-input" :class="{ error: errors.email }" placeholder="marie@exemple.fr" />
          <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">Sujet *</label>
          <select v-model="form.sujet" class="form-select">
            <option value="">Choisir un sujet…</option>
            <option>Question sur les boxes</option>
            <option>Problème de commande</option>
            <option>Abonnement</option>
            <option>Livraison</option>
            <option>Produit défectueux</option>
            <option>Partenariat</option>
            <option>Autre</option>
          </select>
          <p v-if="errors.sujet" class="form-error">{{ errors.sujet }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">Votre chien (optionnel)</label>
          <input v-model="form.chien" type="text" class="form-input" placeholder="Ex : Labrador 3 ans, taille M" />
        </div>

        <div class="form-group">
          <label class="form-label">Message *</label>
          <textarea v-model="form.message" class="form-textarea" :class="{ error: errors.message }" placeholder="Décrivez votre demande…" />
          <p v-if="errors.message" class="form-error">{{ errors.message }}</p>
        </div>

        <div v-if="apiError" class="alert alert-error">{{ apiError }}</div>

        <button type="submit" class="btn btn-primary btn-full btn-lg" :disabled="loading">
          <span v-if="loading" class="spinner" style="width:18px;height:18px;border-width:2px;" />
          <span v-else>Envoyer le message 🐾</span>
        </button>
      </form>
    </div>

    <DawkyToast />
  </div>
</template>

<script setup lang="ts">
import { submitContact } from '~/composables/useApi'

useSeoMeta({ title: 'Contact — DAWKY', description: 'Contactez l\'équipe DAWKY pour toute question sur nos boxes, abonnements ou livraisons.' })

const details = [
  { icon: '📧', label: 'Email',     value: 'bonjour@dawky.fr' },
  { icon: '📱', label: 'Téléphone', value: '+33 1 23 45 67 89' },
  { icon: '⏰', label: 'Horaires',  value: 'Lun – Ven, 9h – 18h' },
  { icon: '📍', label: 'Adresse',   value: '12 rue du Chien Heureux, Paris 11e' },
]

const { success: toastSuccess } = useToast()
const form = reactive({ prenom: '', nom: '', email: '', sujet: '', chien: '', message: '' })
const errors   = reactive<Record<string, string>>({})
const loading  = ref(false)
const success  = ref('')
const apiError = ref('')

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.prenom || form.prenom.length < 2) errors.prenom = 'Prénom requis (min 2 caractères)'
  if (!form.nom    || form.nom.length < 2)    errors.nom    = 'Nom requis (min 2 caractères)'
  if (!form.email  || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Email invalide'
  if (!form.sujet  || form.sujet.length < 3)  errors.sujet  = 'Sujet requis'
  if (!form.message || form.message.length < 10) errors.message = 'Message trop court (min 10 caractères)'
  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  loading.value  = true
  apiError.value = ''
  try {
    const res = await submitContact({ ...form })
    success.value = res.message
    toastSuccess(res.message)
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    apiError.value = e?.data?.statusMessage ?? 'Erreur lors de l\'envoi. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.contact-wrap { display: grid; grid-template-columns: 1fr 1.2fr; gap: 5rem; padding-top: 5rem; padding-bottom: 5rem; }
.contact-info__title { font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; margin-bottom: 1rem; }
.contact-info__desc { color: var(--muted); line-height: 1.7; margin-bottom: 2rem; }
.contact-details { display: flex; flex-direction: column; gap: 1.1rem; margin-bottom: 2rem; }
.contact-detail { display: flex; align-items: flex-start; gap: 1rem; }
.contact-detail__icon { width: 44px; height: 44px; border-radius: 50%; background: var(--brume); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
.contact-detail strong { display: block; font-weight: 500; color: var(--nuit); font-size: .92rem; }
.contact-detail span   { font-size: .85rem; color: var(--muted); }
.contact-info__note { padding: 1.4rem; border-radius: 20px; background: linear-gradient(135deg,#FFF4E6,#FFE4C4); font-size: .88rem; color: var(--nuit); line-height: 1.65; }
.contact-form { padding: 2.5rem; }
.contact-form__title { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; margin-bottom: 1.5rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 900px) { .contact-wrap { grid-template-columns: 1fr; gap: 2.5rem; } .form-row { grid-template-columns: 1fr; } }
</style>
