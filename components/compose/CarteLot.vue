<!-- components/compose/CarteLot.vue — produit de Compose ta box -->
<template>
  <article class="carte" :class="{ choisi }">
    <div class="carte-visuel">
      <img v-if="lot.produit.imageUrl" :src="lot.produit.imageUrl" :alt="lot.produit.nom" loading="lazy" />
      <Icone v-else :nom="ICONES[lot.produit.categorie]" :taille="48" />
    </div>
    <div class="carte-texte">
      <h3 class="carte-nom">{{ lot.produit.nom }}</h3>
      <p class="petit texte-secondaire">{{ LIBELLES_CATEGORIE[lot.produit.categorie] }} · Stock : {{ lot.quantiteDisponible }}</p>
      <ul class="etiquettes">
        <li class="etiquette">Anti-gaspi</li>
        <li v-for="a in sansAllergenes" :key="a" class="etiquette etiquette-burgundy">Sans {{ a.toLowerCase() }}</li>
        <li v-if="lot.compatibleChien === false" class="etiquette etiquette-alerte">Allergène de votre chien</li>
      </ul>
      <button type="button" class="lien petit" @click="emit('composition')">Composition et traces</button>
      <button
        type="button" class="btn btn-bloc" :class="choisi ? 'btn-noir' : 'btn-secondaire'"
        :disabled="!choisi && complet" :aria-pressed="choisi" @click="emit('basculer')"
      >
        {{ choisi ? 'Retirer' : 'Ajouter' }}<span class="sr-only"> {{ lot.produit.nom }}</span>
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Categorie } from '~/composables/types'
import type { LotCompose } from '~/composables/useCompose'

defineProps<{ lot: LotCompose; choisi: boolean; complet: boolean; sansAllergenes: string[] }>()
const emit = defineEmits<{ basculer: []; composition: [] }>()

const ICONES: Record<Categorie, string> = {
  FRIANDISE: 'sachet',
  MASTICATION: 'os',
  JOUET: 'balle',
  ACCESSOIRE: 'medaille',
}
</script>

<style scoped>
.carte {
  border: 1px solid var(--noir);
  display: flex;
  flex-direction: column;
}
.carte.choisi {
  box-shadow: inset 0 0 0 1px var(--noir);
}
.carte-visuel {
  aspect-ratio: 206 / 104;
  background: var(--fond-gris);
  display: flex;
  align-items: center;
  justify-content: center;
}
.carte-visuel img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.carte-texte {
  padding: var(--e2);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--e1);
  flex: 1;
}
.carte-nom {
  font-family: var(--font-texte);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.3;
}
.etiquettes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.etiquettes .etiquette {
  font-size: 13px;
  padding: 2px 10px;
}
.etiquette-alerte {
  background: var(--erreur);
  color: var(--blanc);
}
.carte-texte .btn {
  margin-top: auto;
  min-height: 40px;
  padding-block: 8px;
}
</style>
