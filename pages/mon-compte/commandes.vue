<!-- pages/mon-compte/commandes.vue — commandes, suivi et factures (US-47) -->
<template>
  <div class="page">
    <h1 class="titre-2">Mes commandes</h1>

    <p v-if="chargement" class="texte-secondaire">Chargement…</p>
    <template v-else>
      <TableCommandes v-if="commandes.length" :commandes="commandes" />
      <p v-else>Aucune commande pour le moment.</p>

      <section v-if="cadeaux.length">
        <h2 class="titre-section">Cadeaux offerts</h2>
        <ul class="liste">
          <li v-for="c in cadeaux" :key="c.id">
            <strong>{{ c.dureeMois }} mois de Box Surprise {{ c.taille }}</strong> pour {{ c.destPrenom }} {{ c.destNom }}
            <span class="texte-secondaire"> · {{ c.moisEnvoyes }}/{{ c.dureeMois }} box envoyée{{ c.moisEnvoyes > 1 ? 's' : '' }}{{ c.statut === 'TERMINE' ? ' · terminé' : '' }}</span>
          </li>
        </ul>
      </section>

      <section id="avis">
        <h2 class="titre-section">Donner mon avis</h2>
        <FormulaireAvis v-if="aRecuUneBox" />
        <p v-else class="texte-secondaire">Vous pourrez donner votre avis (et partager une photo de l'unboxing) dès réception de votre première box.</p>
      </section>

      <section id="factures">
        <h2 class="titre-section">Factures</h2>
        <ul v-if="factures.length" class="liste">
          <li v-for="f in factures" :key="f.id" class="facture">
            <span>{{ dateLongue(f.date) }} · {{ formatPrix(f.montant) }}<span v-if="f.numero" class="texte-secondaire"> · n° {{ f.numero }}</span></span>
            <a v-if="f.pdf || f.lien" :href="f.pdf ?? f.lien!" target="_blank" rel="noopener" class="lien">Télécharger</a>
          </li>
        </ul>
        <p v-else class="texte-secondaire">Vos factures apparaîtront ici après votre premier paiement.</p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { CommandeClient, Taille } from '~/composables/types'

definePageMeta({ layout: 'compte', middleware: 'auth' })
useSeoMeta({ title: 'Mes commandes — Dawky', robots: 'noindex' })

interface Facture { id: string; numero: string | null; date: string; montant: number; pdf: string | null; lien: string | null }
interface Cadeau { id: string; dureeMois: number; taille: Taille; destPrenom: string; destNom: string; moisEnvoyes: number; statut: string }

const toast = useToast()
const commandes = ref<CommandeClient[]>([])
const factures = ref<Facture[]>([])
const cadeaux = ref<Cadeau[]>([])
const chargement = ref(true)
// Même règle que l'API : avis possible après une box expédiée ou livrée
const aRecuUneBox = computed(() => commandes.value.some(c => ['EXPEDIEE', 'LIVREE'].includes(c.statut)))

onMounted(async () => {
  try {
    const [c, k] = await Promise.all([api<CommandeClient[]>('/api/commandes'), api<Cadeau[]>('/api/cadeaux')])
    commandes.value = c
    cadeaux.value = k
    // Factures Stripe : non bloquant si le paiement n'est pas configuré
    factures.value = await api<Facture[]>('/api/factures').catch(() => [])
  } catch (err) {
    toast.error(versApiError(err).message)
  } finally {
    chargement.value = false
  }
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--e4);
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
  padding-block: 14px;
  border-bottom: 1px solid var(--filet);
  font-size: 16px;
}
.facture {
  display: flex;
  justify-content: space-between;
  gap: var(--e2);
}
</style>
