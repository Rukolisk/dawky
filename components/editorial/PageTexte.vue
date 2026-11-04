<!-- components/editorial/PageTexte.vue — page éditoriale (légal, aide) :
     titre, chapô, puis sections { titre, paragraphes, liste? } -->
<template>
  <article class="conteneur page-texte">
    <header class="entete">
      <p v-if="surtitre" class="surtitre">{{ surtitre }}</p>
      <h1 class="titre-1">{{ titre }}</h1>
      <p v-if="chapo" class="chapo">{{ chapo }}</p>
      <p v-if="miseAJour" class="petit texte-secondaire">Dernière mise à jour : {{ miseAJour }}</p>
    </header>
    <div class="corps">
      <section v-for="s in sections" :id="s.id" :key="s.titre" class="bloc-texte">
        <h2 class="titre-bloc">{{ s.titre }}</h2>
        <p v-for="(p, i) in s.paragraphes ?? []" :key="i">{{ p }}</p>
        <ul v-if="s.liste">
          <li v-for="(l, i) in s.liste" :key="i">{{ l }}</li>
        </ul>
        <div v-if="s.tableau" class="table-defilante">
          <table>
            <thead><tr><th v-for="c in s.tableau.colonnes" :key="c" scope="col">{{ c }}</th></tr></thead>
            <tbody>
              <tr v-for="(ligne, i) in s.tableau.lignes" :key="i"><td v-for="(cellule, j) in ligne" :key="j">{{ cellule }}</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <slot />
    </div>
  </article>
</template>

<script setup lang="ts">
interface SectionTexte {
  id?: string
  titre: string
  paragraphes?: string[]
  liste?: string[]
  tableau?: { colonnes: string[]; lignes: string[][] }
}

defineProps<{
  titre: string
  surtitre?: string
  chapo?: string
  miseAJour?: string
  sections: SectionTexte[]
}>()
</script>

<style scoped>
.page-texte {
  padding-block: var(--e6) var(--e7);
}
.entete {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
  margin-bottom: var(--e5);
  max-width: 900px;
}
.chapo {
  font-size: 20px;
}
.corps {
  max-width: 760px;
  display: flex;
  flex-direction: column;
  gap: var(--e4);
}
.bloc-texte {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid var(--noir);
  padding-top: var(--e3);
  scroll-margin-top: 110px;
}
.titre-bloc {
  font-family: var(--font-texte);
  font-size: 20px;
  font-weight: 700;
}
.bloc-texte ul {
  margin: 0;
  padding-left: 22px;
}
.bloc-texte li {
  margin-bottom: 6px;
}
.table-defilante {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
}
th, td {
  text-align: left;
  padding: 10px 12px 10px 0;
  border-bottom: 1px solid var(--filet);
  vertical-align: top;
}
th {
  border-bottom: 1px solid var(--noir);
}
</style>
