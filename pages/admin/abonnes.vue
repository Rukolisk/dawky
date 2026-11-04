<!-- pages/admin/abonnes.vue — abonnés par taille et par allergie (US-48) -->
<template>
  <div class="a-page">
    <h1 class="a-titre">Abonnés</h1>

    <div v-if="donnees" class="compteurs">
      <div v-for="t in ['S', 'M', 'L'] as const" :key="t" class="compteur">
        <span class="nombre">{{ (donnees.compteurs.abonnements[t] ?? 0) + (donnees.compteurs.cadeaux[t] ?? 0) }}</span>
        <span class="petit">Taille {{ t }}<template v-if="donnees.compteurs.cadeaux[t]"> · dont {{ donnees.compteurs.cadeaux[t] }} cadeau{{ donnees.compteurs.cadeaux[t]! > 1 ? 'x' : '' }}</template></span>
      </div>
      <div class="compteur fond-burgundy">
        <span class="nombre">{{ avecAllergie }}</span>
        <span class="petit">Avec allergie</span>
      </div>
    </div>

    <div class="a-filtres">
      <div class="champ">
        <label for="f-taille" class="petit">Taille</label>
        <select id="f-taille" v-model="taille" class="input a-select">
          <option value="">Toutes</option>
          <option v-for="t in ['S', 'M', 'L']" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
      <div class="champ">
        <label for="f-allergene" class="petit">Allergène</label>
        <select id="f-allergene" v-model="allergene" class="input a-select">
          <option value="">Tous</option>
          <option v-for="a in donnees?.compteurs.parAllergene ?? []" :key="a.code" :value="a.code">{{ a.nom }} ({{ a.abonnes }})</option>
        </select>
      </div>
    </div>

    <div class="a-table-defilante">
      <table class="a-table">
        <thead><tr><th>Client</th><th>Chien</th><th>Taille</th><th>Allergie</th><th>Statut</th></tr></thead>
        <tbody>
          <tr v-for="a in donnees?.abonnes ?? []" :key="a.id">
            <td>{{ a.client.prenom }} {{ a.client.nom }}<br /><span class="petit texte-secondaire">{{ a.client.email }}</span></td>
            <td>{{ a.chien }}</td>
            <td>{{ a.taille }}</td>
            <td>
              {{ [...a.allergenes, ...(a.allergiesAutres ? [a.allergiesAutres] : [])].join(', ') || 'Aucune' }}
              <span v-if="a.sensibleTraces" class="petit texte-secondaire"> · traces</span>
              <span v-if="(a.allergenes.length || a.allergiesAutres) && !a.profilAllergieValide" class="a-statut a-statut-fort">à valider</span>
            </td>
            <td>{{ STATUTS_ABONNEMENT[a.statut] }}</td>
          </tr>
          <tr v-if="donnees && !donnees.abonnes.length"><td colspan="5" class="a-vide">Aucun abonné pour ces filtres.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Abonnés — Back-office Dawky', robots: 'noindex' })

interface Abonnes {
  compteurs: {
    abonnements: Partial<Record<'S' | 'M' | 'L', number>>
    cadeaux: Partial<Record<'S' | 'M' | 'L', number>>
    parAllergene: Array<{ code: string; nom: string; abonnes: number }>
  }
  abonnes: Array<{
    id: string; statut: string; taille: string; chien: string; allergenes: string[]; allergiesAutres: string | null
    sensibleTraces: boolean; profilAllergieValide: boolean; client: { prenom: string; nom: string; email: string }
  }>
}

const { executer } = useActionAdmin()
const taille = ref('')
const allergene = ref('')
const donnees = ref<Abonnes | null>(null)
const tousAbonnes = ref<Abonnes['abonnes']>([])

async function charger() {
  const r = await executer(() => api<Abonnes>('/api/admin/abonnes', {
    query: { taille: taille.value || undefined, allergene: allergene.value || undefined },
  }))
  if (!r) return
  donnees.value = r
  if (!taille.value && !allergene.value) tousAbonnes.value = r.abonnes
}
watch([taille, allergene], charger, { immediate: true })

const avecAllergie = computed(() => tousAbonnes.value.filter(a => a.allergenes.length || a.allergiesAutres).length)
</script>

<style scoped>
.compteurs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--e2);
}
.compteur {
  background: var(--fond-gris);
  padding: var(--e2);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.nombre {
  font-family: var(--font-titre);
  font-size: 40px;
  line-height: 1;
}
@media (max-width: 900px) {
  .compteurs {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
