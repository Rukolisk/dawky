<!-- pages/admin/expeditions.vue — suivi des envois, export des étiquettes (US-49) -->
<template>
  <div class="a-page">
    <div class="a-entete">
      <div>
        <h1 class="a-titre">Expéditions</h1>
        <p class="petit texte-secondaire">{{ mois ? `Envois du 1er ${moisLisible(mois, true).toLowerCase()}` : 'Toutes les commandes' }}.</p>
      </div>
      <button type="button" class="btn btn-principal a-btn-petit" :disabled="envoi" @click="exporter">Exporter les étiquettes</button>
    </div>

    <div class="a-filtres">
      <div class="champ">
        <label for="e-type" class="petit">Type</label>
        <select id="e-type" v-model="type" class="input a-select">
          <option value="">Tous</option>
          <option value="BOX_MENSUELLE">Box du mois</option>
          <option value="COMPOSE">Compose ta box</option>
          <option value="SAISONNIERE">Box saisonnière</option>
        </select>
      </div>
      <div v-if="type === 'BOX_MENSUELLE'" class="champ">
        <label for="e-mois" class="petit">Mois</label>
        <input id="e-mois" v-model="mois" class="input a-select" type="month" />
      </div>
      <div class="champ">
        <label for="e-statut" class="petit">Statut</label>
        <select id="e-statut" v-model="statut" class="input a-select">
          <option value="">Tous</option>
          <option v-for="(l, s) in STATUTS_UTILES" :key="s" :value="s">{{ l }}</option>
        </select>
      </div>
    </div>

    <div class="a-table-defilante">
      <table class="a-table">
        <thead><tr><th>Commande</th><th>Client</th><th>Box</th><th>Destinataire</th><th>Suivi</th><th>Statut</th></tr></thead>
        <tbody>
          <tr v-for="c in commandes" :key="c.id">
            <td>n°{{ c.numero }}</td>
            <td>{{ c.client.prenom }} {{ c.client.nom }}</td>
            <td>{{ libelleBox(c) }}</td>
            <td>{{ c.cadeau ? `${c.livNom} (cadeau)` : c.livNom === `${c.client.prenom} ${c.client.nom}` ? 'Lui-même' : c.livNom }}<br /><span class="petit texte-secondaire">{{ c.livCodePostal }} {{ c.livVille }}</span></td>
            <td>
              <input
                :value="c.numeroSuivi ?? ''" class="input suivi" placeholder="N° de suivi" :aria-label="`Numéro de suivi de la commande ${c.numero}`"
                @change="maj(c, { numeroSuivi: ($event.target as HTMLInputElement).value || null })"
              />
            </td>
            <td>
              <select
                :value="c.statut" class="input a-select" :aria-label="`Statut de la commande ${c.numero}`"
                @change="maj(c, { statut: ($event.target as HTMLSelectElement).value })"
              >
                <option v-for="(l, s) in STATUTS_UTILES" :key="s" :value="s" :disabled="!transitionPossible(c.statut, s)">{{ l }}</option>
              </select>
            </td>
          </tr>
          <tr v-if="!commandes.length"><td colspan="6" class="a-vide">Aucune commande.</td></tr>
        </tbody>
      </table>
    </div>
    <p class="petit texte-secondaire">Le passage à « Expédiée » puis « Livrée » envoie un email à l'acheteur, même s'il n'est pas le destinataire.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Expéditions — Back-office Dawky', robots: 'noindex' })

interface CommandeAdmin {
  id: string; numero: number; type: string; taille: string; statut: string; livNom: string; livCodePostal: string; livVille: string
  numeroSuivi: string | null; transporteur: string | null
  client: { prenom: string; nom: string }; cadeau: unknown | null
  boxMensuelle: { mois: string } | null
}

const STATUTS_UTILES: Record<string, string> = {
  PAYEE: 'Payée',
  PREPAREE: 'En préparation',
  EXPEDIEE: 'Expédiée',
  LIVREE: 'Livrée',
  ANNULEE: 'Annulée',
}
// Mêmes transitions que l'API (PUT /api/admin/commandes/:id)
const SUIVANTS: Record<string, string[]> = {
  PAYEE: ['PREPAREE', 'EXPEDIEE', 'ANNULEE'],
  PREPAREE: ['EXPEDIEE', 'ANNULEE'],
  EXPEDIEE: ['LIVREE'],
}
const transitionPossible = (de: string, vers: string) => de === vers || (SUIVANTS[de] ?? []).includes(vers)

const { envoi, executer } = useActionAdmin()
const type = ref('BOX_MENSUELLE')
// Les box du mois partent le 1er : par défaut, celles du mois en cours
const mois = ref(new Date().toISOString().slice(0, 7))
const statut = ref('')
const commandes = ref<CommandeAdmin[]>([])

const requete = computed(() => ({
  type: type.value || undefined,
  mois: type.value === 'BOX_MENSUELLE' && mois.value ? mois.value : undefined,
  statut: statut.value || undefined,
  limit: 200,
}))

async function charger() {
  const r = await executer(() => api<{ commandes: CommandeAdmin[] }>('/api/admin/commandes', { query: requete.value }))
  if (r) commandes.value = r.commandes
}
watch(requete, charger, { immediate: true })

function libelleBox(c: CommandeAdmin) {
  if (c.type === 'BOX_MENSUELLE') return `Surprise ${c.taille}${c.cadeau ? ', cadeau' : ''}`
  if (c.type === 'COMPOSE') return `Compose ta box ${c.taille}`
  return `Saisonnière ${c.taille}`
}

async function maj(c: CommandeAdmin, champs: Record<string, unknown>) {
  const r = await executer(() => api<CommandeAdmin>(`/api/admin/commandes/${c.id}`, { method: 'PUT', body: champs }), 'Commande mise à jour')
  if (r) Object.assign(c, r)
  else await charger()
}

async function exporter() {
  await executer(async () => {
    const csv = await $fetch<string>('/api/admin/commandes/export', {
      query: { mois: requete.value.mois, statut: statut.value || undefined },
      responseType: 'text',
    })
    const lien = document.createElement('a')
    lien.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    lien.download = `etiquettes-${requete.value.mois ?? 'commandes'}.csv`
    lien.click()
    URL.revokeObjectURL(lien.href)
  })
}
</script>

<style scoped>
.suivi {
  min-height: 36px;
  padding: 6px 10px;
  width: 160px;
}
</style>
