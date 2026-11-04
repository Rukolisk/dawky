<!-- pages/admin/avis-messages.vue — modération des avis (F-66)
     et messages du formulaire de contact -->
<template>
  <div class="a-page">
    <h1 class="a-titre">Avis et messages</h1>

    <section class="bloc">
      <div class="a-entete">
        <h2 class="a-sous-titre">Avis clients</h2>
        <div class="a-filtres">
          <button v-for="(l, s) in STATUTS_AVIS" :key="s" type="button" class="a-filtre" :aria-pressed="filtreAvis === s" @click="filtreAvis = s">{{ l }}</button>
        </div>
      </div>
      <p v-if="!avis.length" class="a-vide">Aucun avis {{ STATUTS_AVIS[filtreAvis].toLowerCase() }}.</p>
      <article v-for="a in avis" :key="a.id" class="avis">
        <img v-if="a.photoUrl" :src="a.photoUrl" :alt="`Photo de ${a.client.prenom}`" class="avis-photo" />
        <div class="avis-texte">
          <p><strong>{{ a.note }}/5</strong> · {{ a.client.prenom }} {{ a.client.nom }} <span class="petit texte-secondaire">· {{ dateLongue(a.createdAt) }}</span></p>
          <p>{{ a.commentaire }}</p>
          <div v-if="filtreAvis === 'EN_ATTENTE'" class="a-actions">
            <button type="button" class="btn btn-principal a-btn-petit" :disabled="envoi" @click="moderer(a.id, 'PUBLIE')">Publier</button>
            <button type="button" class="btn btn-secondaire a-btn-petit" :disabled="envoi" @click="moderer(a.id, 'REFUSE')">Refuser</button>
          </div>
        </div>
      </article>
    </section>

    <section class="bloc">
      <div class="a-entete">
        <h2 class="a-sous-titre">Messages reçus</h2>
        <label class="a-case"><input v-model="voirLus" type="checkbox" /> Afficher les messages lus</label>
      </div>
      <p v-if="!messages.length" class="a-vide">Aucun message {{ voirLus ? '' : 'non lu' }}.</p>
      <article v-for="m in messages" :key="m.id" class="message" :class="{ lu: m.lu }">
        <p><strong>{{ m.sujet }}</strong> · {{ m.prenom }} {{ m.nom }} · <a :href="`mailto:${m.email}`" class="lien">{{ m.email }}</a> <span class="petit texte-secondaire">· {{ dateLongue(m.createdAt) }}</span></p>
        <p class="message-texte">{{ m.message }}</p>
        <button type="button" class="lien petit" :disabled="envoi" @click="marquer(m)">{{ m.lu ? 'Marquer comme non lu' : 'Marquer comme lu' }}</button>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Avis et messages — Back-office Dawky', robots: 'noindex' })

type StatutAvis = 'EN_ATTENTE' | 'PUBLIE' | 'REFUSE'
const STATUTS_AVIS: Record<StatutAvis, string> = { EN_ATTENTE: 'À modérer', PUBLIE: 'Publiés', REFUSE: 'Refusés' }

interface Avis { id: string; note: number; commentaire: string; photoUrl: string | null; createdAt: string; client: { prenom: string; nom: string } }
interface Message { id: string; prenom: string; nom: string; email: string; sujet: string; message: string; lu: boolean; createdAt: string }

const { envoi, executer } = useActionAdmin()
const filtreAvis = ref<StatutAvis>('EN_ATTENTE')
const voirLus = ref(false)
const avis = ref<Avis[]>([])
const messages = ref<Message[]>([])

async function chargerAvis() {
  const r = await executer(() => api<Avis[]>('/api/admin/avis', { query: { statut: filtreAvis.value } }))
  if (r) avis.value = r
}
async function chargerMessages() {
  const r = await executer(() => api<Message[]>('/api/admin/contacts', { query: voirLus.value ? {} : { lu: 'false' } }))
  if (r) messages.value = r
}
watch(filtreAvis, chargerAvis, { immediate: true })
watch(voirLus, chargerMessages, { immediate: true })

async function moderer(id: string, statut: StatutAvis) {
  if (await executer(() => api(`/api/admin/avis/${id}`, { method: 'PUT', body: { statut } }), statut === 'PUBLIE' ? 'Avis publié' : 'Avis refusé')) await chargerAvis()
}
async function marquer(m: Message) {
  if (await executer(() => api(`/api/admin/contacts/${m.id}`, { method: 'PUT', body: { lu: !m.lu } }))) await chargerMessages()
}
</script>

<style scoped>
.bloc {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}
.avis,
.message {
  border-bottom: 1px solid var(--filet);
  padding-bottom: var(--e2);
  display: flex;
  gap: var(--e2);
}
.message {
  flex-direction: column;
  gap: 6px;
}
.message.lu {
  opacity: 0.7;
}
.message-texte {
  white-space: pre-line;
  max-width: 80ch;
}
.avis-photo {
  width: 120px;
  height: 120px;
  object-fit: cover;
}
.avis-texte {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
