<!-- components/produits/ProduitCard.vue -->
<template>
  <div class="produit-card card">
    <div class="produit-card__thumb">
      <span class="produit-card__emoji">{{ produit.emoji }}</span>
      <span v-if="produit.estInvendu" class="produit-card__inv">♻️ Invendu</span>
    </div>
    <div class="produit-card__body">
      <div class="produit-card__cat">{{ catLabels[produit.categorie] }}</div>
      <h3 class="produit-card__name">{{ produit.nom }}</h3>
      <p class="produit-card__desc">{{ produit.description }}</p>
      <div class="produit-card__sizes">
        <span v-for="t in produit.tailles" :key="t.taille" :class="['size-pill', `size-pill-${t.taille.toLowerCase()}`]">{{ t.taille }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Produit } from '~/composables/useApi'
defineProps<{ produit: Produit }>()
const catLabels: Record<string,string> = { MASTICATION:'🦌 Mastication', NUTRITION:'🍖 Nutrition', JOUET:'🎾 Jouets', SOIN:'🧴 Soins', ACCESSOIRE:'🎀 Accessoires' }
</script>
<style scoped>
.produit-card { cursor: default; }
.produit-card__thumb { height: 140px; display:flex;align-items:center;justify-content:center; background: linear-gradient(135deg,var(--neige),var(--brume)); position:relative; }
.produit-card__emoji { font-size: 3.8rem; }
.produit-card__inv { position:absolute;top:.7rem;right:.7rem;background:rgba(107,143,113,.15);color:var(--menthe);font-size:.68rem;font-weight:600;padding:.2rem .6rem;border-radius:var(--r-full); }
.produit-card__body { padding: 1.1rem 1.3rem 1.4rem; }
.produit-card__cat { font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--bleu-vif);font-weight:600;margin-bottom:.35rem; }
.produit-card__name { font-family:var(--font-display);font-size:1rem;font-weight:700;color:var(--nuit);margin-bottom:.3rem; }
.produit-card__desc { font-size:.82rem;color:var(--muted);line-height:1.55; }
.produit-card__sizes { display:flex;gap:.35rem;margin-top:.7rem; }
</style>
