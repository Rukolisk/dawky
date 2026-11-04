<!-- pages/produits.vue — catalogue public (US-13, F-37) : se faire une idée
     de la qualité, composition et traces accessibles en un clic -->
<template>
  <div class="conteneur page">
    <header class="entete">
      <p class="surtitre">Transparence</p>
      <h1 class="titre-1">Nos produits</h1>
      <p class="chapo">Les produits qui composent nos box. Le contenu de chaque box reste une surprise, leur composition non.</p>
    </header>

    <div class="filtres" role="group" aria-label="Filtres">
      <div class="groupe">
        <button type="button" class="filtre" :aria-pressed="!categorie" @click="changer({ categorie: null })">Toutes les catégories</button>
        <button
          v-for="(libelle, c) in LIBELLES_CATEGORIE" :key="c" type="button" class="filtre"
          :aria-pressed="categorie === c" @click="changer({ categorie: categorie === c ? null : c })"
        >{{ libelle }}</button>
      </div>
      <div class="groupe">
        <button
          v-for="t in INFOS_TAILLES" :key="t.taille" type="button" class="filtre"
          :aria-pressed="taille === t.taille" @click="changer({ taille: taille === t.taille ? null : t.taille })"
        >Taille {{ t.taille }}</button>
        <label>
          <span class="sr-only">Sans allergène</span>
          <select class="input select" :value="sansAllergene ?? ''" @change="changer({ sansAllergene: ($event.target as HTMLSelectElement).value || null })">
            <option value="">Tous les allergènes</option>
            <option v-for="a in allergenes" :key="a.code" :value="a.code">Sans {{ a.nom.toLowerCase() }}</option>
          </select>
        </label>
      </div>
    </div>

    <p v-if="pending && !donnees" class="texte-secondaire">Chargement…</p>
    <p v-else-if="!donnees?.produits.length" class="vide">Aucun produit ne correspond à ces filtres.</p>
    <ul v-else class="grille">
      <li v-for="p in donnees.produits" :key="p.id" class="carte">
        <div class="carte-visuel">
          <img v-if="p.imageUrl" :src="p.imageUrl" :alt="p.nom" loading="lazy" />
          <span v-else class="emoji" aria-hidden="true">{{ p.emoji }}</span>
        </div>
        <div class="carte-texte">
          <h2 class="carte-nom">{{ p.nom }}</h2>
          <p class="petit texte-secondaire">{{ LIBELLES_CATEGORIE[p.categorie] }} · Taille{{ p.tailles.length > 1 ? 's' : '' }} {{ p.tailles.join(', ') }}</p>
          <p class="petit">{{ p.description }}</p>
          <button type="button" class="lien petit" @click="fiche = p">Composition et traces</button>
        </div>
      </li>
    </ul>

    <nav v-if="(donnees?.pagination.totalPages ?? 0) > 1" class="pagination" aria-label="Pagination">
      <button type="button" class="btn btn-secondaire" :disabled="page <= 1" @click="changer({ page: page - 1 })">Précédent</button>
      <span class="petit">Page {{ page }} sur {{ donnees?.pagination.totalPages }}</span>
      <button type="button" class="btn btn-secondaire" :disabled="page >= (donnees?.pagination.totalPages ?? 1)" @click="changer({ page: page + 1 })">Suivant</button>
    </nav>

    <ModaleDawky :ouverte="!!fiche" :titre="fiche?.nom ?? ''" @fermer="fiche = null">
      <FicheComposition v-if="fiche" :produit="fiche" />
    </ModaleDawky>
  </div>
</template>

<script setup lang="ts">
import type { Allergene, Categorie, Taille } from '~/composables/types'
import type { ProduitPublic } from '~/composables/useCompose'

useSeoMeta({
  title: 'Nos produits pour chiens : composition, allergènes, traces — Dawky',
  description: 'Friandises, produits à mâcher, jouets et accessoires des box Dawky, avec leur composition complète, leurs allergènes et les traces possibles.',
})

// Filtres dans l'URL : la page reste partageable et le retour arrière fonctionne
const route = useRoute()
const router = useRouter()
const categorie = computed(() => (route.query.categorie as Categorie | undefined) ?? null)
const taille = computed(() => (route.query.taille as Taille | undefined) ?? null)
const sansAllergene = computed(() => (route.query.sans as string | undefined) ?? null)
const page = computed(() => Number(route.query.page) || 1)
const fiche = ref<ProduitPublic | null>(null)

function changer(f: { categorie?: Categorie | null; taille?: Taille | null; sansAllergene?: string | null; page?: number }) {
  const q = {
    categorie: f.categorie !== undefined ? f.categorie : categorie.value,
    taille: f.taille !== undefined ? f.taille : taille.value,
    sans: f.sansAllergene !== undefined ? f.sansAllergene : sansAllergene.value,
    page: f.page && f.page > 1 ? String(f.page) : null,
  }
  router.push({ query: Object.fromEntries(Object.entries(q).filter(([, v]) => v)) })
}

const { data: allergenes } = await useFetch('/api/allergenes', {
  transform: (r: { data: Allergene[] }) => r.data,
  default: () => [] as Allergene[],
})

const { data: donnees, pending } = await useFetch('/api/produits', {
  query: computed(() => ({
    categorie: categorie.value ?? undefined,
    taille: taille.value ?? undefined,
    sansAllergenes: sansAllergene.value ?? undefined,
    page: page.value,
    limit: 12,
  })),
  transform: (r: { data: { produits: ProduitPublic[]; pagination: { totalPages: number } } }) => r.data,
})
</script>

<style scoped>
.page {
  padding-block: var(--e6) var(--e7);
  display: flex;
  flex-direction: column;
  gap: var(--e4);
}
.entete {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}
.chapo {
  font-size: 20px;
  max-width: 640px;
}
.filtres {
  display: flex;
  flex-direction: column;
  gap: var(--e1);
}
.groupe {
  display: flex;
  flex-wrap: wrap;
  gap: var(--e1);
}
.filtre {
  min-height: var(--tactile);
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid var(--noir);
  background: var(--blanc);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}
.filtre[aria-pressed='true'] {
  background: var(--noir);
  color: var(--blanc);
}
.select {
  min-height: var(--tactile);
  border-radius: 999px;
  width: auto;
  font-size: 15px;
}
.grille {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--e2);
}
.carte {
  border: 1px solid var(--noir);
  display: flex;
  flex-direction: column;
}
.carte-visuel {
  aspect-ratio: 4 / 3;
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
.emoji {
  font-size: 48px;
}
.carte-texte {
  padding: var(--e2);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  flex: 1;
}
.carte-nom {
  font-family: var(--font-texte);
  font-size: 17px;
  font-weight: 700;
}
.carte-texte .lien {
  margin-top: auto;
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--e3);
}
.vide {
  padding: var(--e4);
  background: var(--fond-gris);
}

@media (max-width: 1100px) {
  .grille { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 900px) {
  .grille { grid-template-columns: 1fr 1fr; }
}
</style>
