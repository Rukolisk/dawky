<!-- pages/produits.vue -->
<template>
  <div>
    <section class="container produits-header">
      <p class="section-tag">Notre Sélection</p>
      <h1 class="section-title">Des produits pensés<br />pour le bien-être.</h1>
      <p class="section-desc">Chaque produit est rigoureusement sélectionné par nos experts vétérinaires et behavioristes canins.</p>

      <div class="produits-filters">
        <button
          v-for="f in filters"
          :key="String(f.value)"
          :class="['filter-btn', { 'filter-btn--active': activeCat === f.value }]"
          @click="activeCat = f.value"
        >
          {{ f.label }}
        </button>
      </div>

      <div class="produits-sizes">
        <button
          v-for="t in tailles"
          :key="t.value"
          :class="['size-filter', { 'size-filter--active': activeTaille === t.value }]"
          @click="activeTaille = activeTaille === t.value ? undefined : t.value"
        >
          {{ t.label }}
        </button>
      </div>
    </section>

    <DawkySpinner v-if="pending" label="Chargement des produits…" />

    <section v-if="!pending" class="container produits-grid-wrap">
      <TransitionGroup name="produit-list" tag="div" class="produits-grid">
        <ProduitCard
          v-for="p in produits"
          :key="p.id"
          :produit="p"
        />
      </TransitionGroup>
      <p v-if="!produits.length" class="produits-empty">Aucun produit trouvé.</p>

      <div v-if="pagination && pagination.totalPages > 1" class="produits-pagination">
        <button class="btn btn-outline btn-sm" :disabled="pagination.page <= 1" @click="page--">← Précédent</button>
        <span class="produits-pagination__info">Page {{ pagination.page }} / {{ pagination.totalPages }}</span>
        <button class="btn btn-outline btn-sm" :disabled="pagination.page >= pagination.totalPages" @click="page++">Suivant →</button>
      </div>
    </section>

    <DawkyToast />
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Produits — DAWKY', description: 'Découvrez toute la gamme DAWKY : mastication, nutrition, jouets, soins, accessoires pour chiens.' })

type Cat = 'MASTICATION' | 'NUTRITION' | 'JOUET' | 'SOIN' | 'ACCESSOIRE' | undefined
type Taille = 'XS' | 'S' | 'M' | 'L' | undefined

const activeCat    = ref<Cat>(undefined)
const activeTaille = ref<Taille>(undefined)
const page         = ref(1)

watch([activeCat, activeTaille], () => { page.value = 1 })

const queryParams = computed(() => ({
  ...(activeCat.value    ? { categorie: activeCat.value }    : {}),
  ...(activeTaille.value ? { taille:    activeTaille.value } : {}),
  invendus: 'false',   // Catalogue public = jamais les invendus
  page: String(page.value),
}))

const { data, pending } = useProduits(queryParams)
const produits   = computed(() => data.value?.data?.produits ?? [])
const pagination = computed(() => data.value?.data?.pagination)

const filters = [
  { value: undefined,     label: 'Tous' },
  { value: 'MASTICATION', label: '🦌 Mastication' },
  { value: 'NUTRITION',   label: '🍖 Nutrition' },
  { value: 'JOUET',       label: '🎾 Jouets' },
  { value: 'SOIN',        label: '🧴 Soins' },
  { value: 'ACCESSOIRE',  label: '🎀 Accessoires' },
] as const

const tailles = [
  { value: 'XS' as Taille, label: 'XS — Très petite' },
  { value: 'S' as Taille, label: 'S — Petite race' },
  { value: 'M' as Taille, label: 'M — Race moyenne' },
  { value: 'L' as Taille, label: 'L — Grande race' },
]
</script>

<style scoped>
.produits-header { padding: 5rem 0 2rem; }
.produits-filters { display: flex; gap: .7rem; flex-wrap: wrap; margin-top: 2rem; }
.filter-btn {
  padding: .5rem 1.2rem; border-radius: 40px;
  border: 1.5px solid var(--brume); background: white;
  font-size: .85rem; color: var(--muted); cursor: pointer; transition: all .2s;
  font-family: var(--font-body);
}
.filter-btn--active, .filter-btn:hover { background: var(--nuit); color: var(--neige); border-color: var(--nuit); }
.produits-sizes { display: flex; gap: .6rem; margin-top: 1rem; }
.size-filter {
  padding: .4rem 1rem; border-radius: 40px;
  border: 1.5px solid var(--brume); background: white;
  font-size: .8rem; color: var(--muted); cursor: pointer; transition: all .2s;
  font-family: var(--font-body);
}
.size-filter--active, .size-filter:hover { background: var(--bleu-vif); color: var(--nuit); border-color: var(--bleu-vif); }
.produits-grid-wrap { padding-bottom: 5rem; }
.produits-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.4rem; margin-top: 1.5rem; }
.produits-empty { text-align: center; color: var(--muted); padding: 3rem; }
.produits-pagination { display: flex; align-items: center; justify-content: center; gap: 1.5rem; margin-top: 3rem; }
.produits-pagination__info { font-size: .88rem; color: var(--muted); }
.produit-list-enter-active { transition: all .3s ease; }
.produit-list-leave-active  { transition: all .2s ease; position: absolute; }
.produit-list-enter-from, .produit-list-leave-to { opacity: 0; transform: scale(.95); }
@media (max-width: 1100px) { .produits-grid { grid-template-columns: repeat(3,1fr); } }
@media (max-width: 700px)  { .produits-grid { grid-template-columns: repeat(2,1fr); } }
</style>
