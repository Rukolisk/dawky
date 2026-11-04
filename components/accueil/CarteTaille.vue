<!-- components/accueil/CarteTaille.vue — carte d'une taille S / M / L (US-07) -->
<template>
  <article class="carte">
    <VisuelChien class="carte-visuel" :alt="`Chien de taille ${infos.taille}`" />
    <div class="carte-texte">
      <p class="carte-lettre" aria-hidden="true">{{ infos.taille }}</p>
      <h3 class="sr-only">Taille {{ infos.taille }}</h3>
      <p class="carte-poids">{{ infos.poids }}</p>
      <p class="carte-races">{{ infos.races }}</p>
      <p class="carte-contenu texte-secondaire">{{ infos.contenu }}</p>
      <p v-if="prixMensuel" class="carte-prix">{{ formatPrix(prixMensuel) }}/mois</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { INFOS_TAILLES } from '~/composables/format'

defineProps<{ infos: (typeof INFOS_TAILLES)[number]; prixMensuel?: number }>()
</script>

<style scoped>
.carte {
  border: 1px solid var(--noir);
  display: flex;
  flex-direction: column;
}
.carte-visuel {
  aspect-ratio: 414 / 340;
  height: auto;
}
.carte-texte {
  padding: var(--e3);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.carte-lettre {
  font-family: var(--font-titre);
  font-weight: 300;
  font-size: 56px;
  line-height: 1;
  margin-bottom: var(--e2);
}
.carte-poids {
  font-weight: 700;
}
.carte-races {
  font-size: 16px;
}
.carte-contenu {
  font-size: 16px;
}
.carte-prix {
  font-weight: 700;
  font-size: 16px;
  margin-top: var(--e2);
}

@media (max-width: 900px) {
  .carte {
    flex-direction: row;
  }
  .carte-visuel {
    width: 35%;
    aspect-ratio: auto;
    flex-shrink: 0;
  }
  .carte-texte {
    padding: var(--e2);
  }
  .carte-lettre {
    font-size: 40px;
    margin-bottom: var(--e1);
  }
  .carte-prix {
    margin-top: var(--e1);
  }
}
</style>
