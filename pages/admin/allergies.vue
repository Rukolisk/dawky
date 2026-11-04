<!-- pages/admin/allergies.vue — allergies à traiter : contact du client
     puis validation du profil sans allergènes avant expédition -->
<template>
  <div class="a-page">
    <h1 class="a-titre">Allergies</h1>
    <div class="a-filtres">
      <button v-for="(l, s) in FILTRES" :key="s" type="button" class="a-filtre" :aria-pressed="filtre === s" @click="filtre = s">{{ l }}</button>
    </div>

    <p v-if="!alertes.length" class="a-vide">Aucune allergie {{ filtre === 'VALIDEE' ? 'validée' : 'à traiter' }}.</p>
    <article v-for="a in alertes" :key="a.id" class="alerte">
      <div class="alerte-infos">
        <p class="a-sous-titre">{{ a.chien.nom }} · taille {{ a.chien.taille }}</p>
        <p>
          <strong>{{ a.chien.allergenes.map(x => x.allergene.nom).join(', ') || '—' }}</strong>
          <template v-if="a.chien.allergiesAutres"> · autre : {{ a.chien.allergiesAutres }}</template>
          <template v-if="a.chien.sensibleTraces"> · sensible aux traces</template>
        </p>
        <p class="petit">
          {{ a.chien.client.prenom }} {{ a.chien.client.nom }} · {{ a.chien.client.email }}<template v-if="a.chien.client.telephone"> · {{ a.chien.client.telephone }}</template>
        </p>
        <p class="petit texte-secondaire">
          Signalée le {{ dateLongue(a.createdAt) }}<template v-if="a.traitePar"> · traitée par {{ a.traitePar.prenom }} le {{ dateLongue(a.traiteLe) }}</template>
        </p>
      </div>
      <div class="alerte-actions">
        <span class="a-statut" :class="{ 'a-statut-fort': a.statut === 'A_TRAITER' }">{{ FILTRES[a.statut] }}</span>
        <textarea v-model="notes[a.id]" class="input" rows="2" placeholder="Note interne (échange avec le client…)" :aria-label="`Note pour ${a.chien.nom}`" />
        <div class="a-actions">
          <button v-if="a.statut === 'A_TRAITER'" type="button" class="btn btn-secondaire a-btn-petit" :disabled="envoi" @click="changer(a, 'CONTACTE')">Client contacté</button>
          <button v-if="a.statut !== 'VALIDEE'" type="button" class="btn btn-principal a-btn-petit" :disabled="envoi" @click="changer(a, 'VALIDEE')">Profil sans allergènes validé</button>
          <button v-else type="button" class="lien petit" :disabled="envoi" @click="changer(a, 'A_TRAITER')">Rouvrir</button>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Allergies — Back-office Dawky', robots: 'noindex' })

type Statut = 'A_TRAITER' | 'CONTACTE' | 'VALIDEE'
const FILTRES: Record<Statut, string> = { A_TRAITER: 'À traiter', CONTACTE: 'Client contacté', VALIDEE: 'Validées' }

interface Alerte {
  id: string; statut: Statut; note: string | null; createdAt: string; traiteLe: string | null
  traitePar: { prenom: string } | null
  chien: {
    nom: string; taille: string; allergiesAutres: string | null; sensibleTraces: boolean
    allergenes: Array<{ allergene: { nom: string } }>
    client: { prenom: string; nom: string; email: string; telephone: string | null }
  }
}

const { envoi, executer } = useActionAdmin()
const filtre = ref<Statut>('A_TRAITER')
const alertes = ref<Alerte[]>([])
const notes = reactive<Record<string, string>>({})

async function charger() {
  const r = await executer(() => api<Alerte[]>('/api/admin/alertes-allergie', { query: { statut: filtre.value } }))
  if (!r) return
  alertes.value = r
  for (const a of r) notes[a.id] = a.note ?? ''
}
watch(filtre, charger, { immediate: true })

async function changer(a: Alerte, statut: Statut) {
  const ok = await executer(() => api(`/api/admin/alertes-allergie/${a.id}`, {
    method: 'PUT',
    body: { statut, note: notes[a.id] || undefined },
  }), statut === 'VALIDEE' ? `Profil de ${a.chien.nom} validé` : 'Alerte mise à jour')
  if (ok) await charger()
}
</script>

<style scoped>
.alerte {
  border: 1px solid var(--noir);
  padding: var(--e2) var(--e3);
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: var(--e3);
}
.alerte-infos,
.alerte-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.alerte-actions {
  align-items: flex-start;
}
@media (max-width: 1100px) {
  .alerte {
    grid-template-columns: 1fr;
  }
}
</style>
