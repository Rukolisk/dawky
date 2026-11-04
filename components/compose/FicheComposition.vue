<!-- components/compose/FicheComposition.vue — composition, allergènes,
     traces d'un produit, à portée de clic (US-23) -->
<template>
  <div class="fiche">
    <p>{{ produit.description }}</p>
    <dl>
      <div>
        <dt>Composition</dt>
        <dd>{{ produit.ingredients || 'Produit non alimentaire.' }}</dd>
      </div>
      <div>
        <dt>Allergènes</dt>
        <dd>
          <template v-if="produit.allergenes.length">
            <strong v-for="(a, i) in produit.allergenes" :key="a.code" class="allergene">{{ a.nom }}{{ i < produit.allergenes.length - 1 ? ', ' : '' }}</strong>
          </template>
          <template v-else>Aucun allergène déclaré.</template>
        </dd>
      </div>
      <div>
        <dt>Traces possibles</dt>
        <dd>{{ produit.traces.length ? produit.traces.map(t => t.nom).join(', ') : 'Aucune trace signalée.' }}</dd>
      </div>
      <div>
        <dt>Tailles</dt>
        <dd>{{ produit.tailles.join(', ') }}</dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
import type { ProduitPublic } from '~/composables/useCompose'

defineProps<{ produit: ProduitPublic }>()
</script>

<style scoped>
.fiche {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
  font-size: 16px;
}
dl {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}
dl > div {
  border-top: 1px solid var(--filet);
  padding-top: 12px;
}
dt {
  font-weight: 700;
  margin-bottom: 4px;
}
dd {
  margin: 0;
}
.allergene {
  color: var(--burgundy);
}
</style>
