<!-- pages/mon-compte/parrainage.vue — code, lien et suivi (US-30) -->
<template>
  <div class="page">
    <h1 class="titre-2">Parrainage</h1>
    <p v-if="!donnees" class="texte-secondaire">Chargement…</p>
    <template v-else>
      <section class="encart fond-burgundy">
        <p class="sous-titre">Offrez {{ donnees.pourcentage }} %, recevez {{ donnees.pourcentage }} %.</p>
        <p class="petit">
          Votre filleul profite de {{ donnees.pourcentage }} % sur sa première commande. Vous recevez {{ donnees.pourcentage }} % de réduction
          sur votre prochaine box dès qu'il a payé.
        </p>
        <div class="code">
          <span class="code-valeur">{{ donnees.code }}</span>
          <button type="button" class="btn btn-clair" @click="copier(donnees.lien, 'Lien copié')">Copier mon lien</button>
          <button type="button" class="lien lien-clair" @click="copier(donnees.code, 'Code copié')">Copier le code</button>
        </div>
      </section>

      <p v-if="donnees.recompensesDisponibles" class="petit">
        <strong>{{ donnees.recompensesDisponibles }} réduction{{ donnees.recompensesDisponibles > 1 ? 's' : '' }} de {{ donnees.pourcentage }} %</strong>
        en attente : elle{{ donnees.recompensesDisponibles > 1 ? 's' : '' }} s'appliquera sur votre prochain paiement.
      </p>

      <section>
        <h2 class="titre-section">Mes filleuls</h2>
        <ul v-if="donnees.parrainages.length" class="liste">
          <li v-for="(p, i) in donnees.parrainages" :key="i">
            {{ p.prenom }} <span class="texte-secondaire">· {{ p.statut === 'VALIDE' ? `validé le ${dateLongue(p.valideLe)}` : 'en attente de sa première commande' }}</span>
          </li>
        </ul>
        <p v-else class="texte-secondaire">Pas encore de filleul. Partagez votre lien&nbsp;!</p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'compte', middleware: 'auth' })
useSeoMeta({ title: 'Parrainage — Dawky', robots: 'noindex' })

interface Parrainage {
  code: string
  lien: string
  pourcentage: number
  recompensesDisponibles: number
  parrainages: Array<{ prenom: string; statut: string; valideLe: string | null }>
}

const toast = useToast()
const donnees = ref<Parrainage | null>(null)
onMounted(async () => {
  try {
    donnees.value = await api<Parrainage>('/api/parrainage')
  } catch (err) {
    toast.error(versApiError(err).message)
  }
})

async function copier(texte: string, message: string) {
  try {
    await navigator.clipboard.writeText(texte)
    toast.success(message)
  } catch {
    toast.info(texte)
  }
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--e4);
}
.encart {
  padding: var(--e4) var(--e3);
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}
.code {
  display: flex;
  align-items: center;
  gap: var(--e3);
  flex-wrap: wrap;
  margin-top: var(--e1);
}
.code-valeur {
  font-family: var(--font-titre);
  font-size: 40px;
  letter-spacing: 0.04em;
}
.lien-clair {
  color: var(--blanc);
}
.titre-section {
  font-family: var(--font-texte);
  font-size: 20px;
  font-weight: 700;
  margin-bottom: var(--e2);
}
.liste {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--filet);
}
.liste li {
  padding-block: 12px;
  border-bottom: 1px solid var(--filet);
}
</style>
