<!-- components/compte/TableCommandes.vue — commandes du client -->
<template>
  <div class="table-defilante">
    <table class="table">
      <thead>
        <tr><th scope="col">Box</th><th scope="col">Statut</th><th scope="col">Facture</th></tr>
      </thead>
      <tbody>
        <tr v-for="c in commandes" :key="c.id">
          <td>
            {{ libelle(c) }}
            <span v-if="c.numeroSuivi" class="suivi petit texte-secondaire">Suivi {{ c.transporteur ?? '' }} : {{ c.numeroSuivi }}</span>
          </td>
          <td>{{ STATUTS_COMMANDE[c.statut] ?? c.statut }}</td>
          <td>
            <a v-if="c.factureUrl" :href="c.factureUrl" target="_blank" rel="noopener" class="lien">Télécharger</a>
            <NuxtLink v-else-if="c.type === 'BOX_MENSUELLE'" to="/mon-compte/commandes#factures" class="lien">Voir l'abonnement</NuxtLink>
            <span v-else>—</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { CommandeClient } from '~/composables/types'

defineProps<{ commandes: CommandeClient[] }>()

function libelle(c: CommandeClient) {
  if (c.type === 'BOX_MENSUELLE') return `${moisLisible(c.boxMensuelle?.mois)}, taille ${c.taille}`
  if (c.type === 'COMPOSE') return `Compose ta box, taille ${c.taille}`
  return `${c.formula?.nom ?? 'Box saisonnière'}, taille ${c.taille}`
}
</script>

<style scoped>
.table-defilante {
  overflow-x: auto;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 16px;
}
th {
  text-align: left;
  font-weight: 700;
  padding: 12px 0;
  border-bottom: 2px solid var(--noir);
}
td {
  padding: 14px 16px 14px 0;
  border-bottom: 1px solid var(--filet);
  vertical-align: top;
}
.suivi {
  display: block;
}
</style>
