<!-- pages/quiz/resultat.vue — Résultat du quiz (F-16) : taille, formule,
     contenu prévu par catégorie, prix et explication du prix -->
<template>
  <div v-if="res">
    <EnteteEpuree>
      <NuxtLink to="/quiz" class="lien">Modifier mes réponses</NuxtLink>
    </EnteteEpuree>

    <main id="contenu">
      <section class="resultat">
        <div class="resultat-texte">
          <p class="surtitre">Votre résultat</p>
          <h1 class="titre-2">{{ nom }} est <em>un {{ res.taille }}.</em></h1>
          <p class="resultat-explication">{{ explication }}</p>

          <ul class="etiquettes" aria-label="Son profil">
            <li v-for="e in etiquettes" :key="e" class="etiquette">{{ e }}</li>
          </ul>

          <p class="resultat-prix">
            <span class="prix-montant">{{ formatPrix(prixAffiche) }}</span>
            <span class="petit">{{ estCompose ? '/box' : '/mois' }}, livraison offerte</span>
          </p>

          <div class="resultat-actions">
            <NuxtLink :to="lienPrincipal" class="btn btn-principal btn-grand">
              {{ estCompose ? `Composer sa box ${res.taille}` : `Choisir la box ${res.taille}` }}
            </NuxtLink>
            <NuxtLink v-if="estCompose" :to="lienSurprise" class="lien">
              Ou la Box Surprise {{ res.taille }} à {{ formatPrix(res.prixSurpriseMensuel) }}/mois
            </NuxtLink>
          </div>
          <p class="petit texte-secondaire">
            {{ estCompose ? 'Commande unique, sans abonnement.' : 'Sans engagement, résiliation en ligne.' }}
          </p>
          <p v-if="res.allergenesExclus.length || reponses.allergiesAutres" class="petit">
            <NuxtLink to="/comment-dawky-adapte-ma-box" class="lien">Comment Dawky adapte sa box à ses allergies</NuxtLink>
          </p>
        </div>
        <VisuelChien class="resultat-visuel" :alt="`Box Dawky taille ${res.taille}`" />
      </section>

      <section class="fond-gris contenu-box">
        <div class="conteneur">
          <h2 class="titre-3">Ce que contient sa box</h2>
          <p class="texte-secondaire petit contenu-intro">
            <template v-if="estCompose">{{ nbProduits }} produits que vous choisissez parmi les pépites des mois passés.</template>
            <template v-else>{{ nbProduits }} produits surprise. La nature du contenu, jamais le détail.</template>
          </p>
          <ul class="categories">
            <li v-for="c in categories" :key="c.categorie">
              <p class="categorie-nom">
                {{ LIBELLES_CATEGORIE[c.categorie] }}<template v-if="c.quantite > 1"> × {{ c.quantite }}</template>
              </p>
              <p class="texte-secondaire petit">{{ c.description }}</p>
            </li>
          </ul>
        </div>
      </section>

      <section class="conteneur infos">
        <div>
          <h2 class="sous-titre">Pourquoi ce prix&nbsp;?</h2>
          <p class="petit">
            {{ estCompose
              ? 'Il comprend vos produits et la livraison. Les produits viennent des box précédentes : même qualité, rien ne se perd.'
              : 'Il comprend les produits, la carte collector et la livraison.' }}
          </p>
        </div>
        <div>
          <h2 class="sous-titre">La taille ne convient pas&nbsp;?</h2>
          <p class="petit">Notre garantie taille et satisfaction prévoit un échange ou un geste commercial.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { Categorie } from '~/composables/types'

definePageMeta({ layout: false })
useSeoMeta({ title: 'Votre résultat — Dawky' })

const { resultat: res, reponses } = useQuiz()

// Pas de résultat (accès direct, session expirée) : retour au quiz
onMounted(() => {
  if (!res.value) navigateTo('/quiz', { replace: true })
})

const nom = computed(() => reponses.value.nomChien.trim() || 'Votre chien')
const estCompose = computed(() => res.value?.formuleRecommandee === 'COMPOSE')
const infosTaille = computed(() => INFOS_TAILLES.find(t => t.taille === res.value?.taille) ?? INFOS_TAILLES[1]!)
const prixAffiche = computed(() => estCompose.value ? res.value?.prixCompose : res.value?.prixSurpriseMensuel)

const allergies = computed(() => [
  ...(res.value?.allergenesExclus.map(a => a.nom.toLowerCase()) ?? []),
  ...(reponses.value.allergiesAutres.trim() ? [reponses.value.allergiesAutres.trim()] : []),
])

const explication = computed(() => {
  const r = reponses.value
  const poids = r.poidsExact ? `ses ${String(r.poidsExact).replace('.', ',')} kg` : `son gabarit (${infosTaille.value.poids.toLowerCase()})`
  if (estCompose.value && allergies.value.length) {
    return `Avec son allergie (${allergies.value.join(', ')}), Compose ta box vous laisse choisir chaque produit en taille ${res.value!.taille} : les allergènes sont filtrés et la composition est affichée.`
  }
  if (estCompose.value) {
    return `Gros mâcheur et très sportif : avec Compose ta box, vous choisissez vous-même les produits les plus robustes en taille ${res.value!.taille}.`
  }
  return `Avec ${poids}, il lui faut la Box Surprise ${res.value!.taille}${res.value!.taille === 'L' ? ' et ses jouets pensés pour gros mâcheurs' : ''}.`
})

const etiquettes = computed(() => {
  const r = reponses.value
  return [
    r.race.trim(),
    r.ageAns !== null ? ageLisible(Math.round(r.ageAns * 12)) : null,
    r.estMacheur ? 'Gros mâcheur' : null,
    r.niveauActivite ? LIBELLES_ACTIVITE[r.niveauActivite] : null,
    allergies.value.length ? `Sans ${allergies.value.join(', ')}` : 'Aucune allergie',
  ].filter((e): e is string => !!e)
})

const ORDRE: Categorie[] = ['FRIANDISE', 'MASTICATION', 'JOUET', 'ACCESSOIRE']
const categories = computed(() => ORDRE.map(categorie => ({
  categorie,
  quantite: res.value?.contenu?.[categorie] ?? 1,
  description: infosTaille.value.categories[categorie],
})))
const nbProduits = computed(() => categories.value.reduce((s, c) => s + c.quantite, 0))

const lienSurprise = computed(() => `/commande?formule=surprise&taille=${res.value?.taille}`)
const lienPrincipal = computed(() => estCompose.value
  ? { path: '/compose-ta-box', query: { taille: res.value?.taille, sansAllergenes: res.value?.allergenesExclus.map(a => a.code).join(',') || undefined } }
  : lienSurprise.value)
</script>

<style scoped>
.resultat {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 750px;
}
.resultat-texte {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: var(--e3);
  padding: var(--e6) var(--e6) var(--e6) max(var(--marge), calc((100vw - var(--largeur-max)) / 2 + var(--marge)));
}
.resultat-explication {
  max-width: 560px;
}
.etiquettes {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--e1);
  max-width: 560px;
}
.resultat-prix {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.prix-montant {
  font-family: var(--font-titre);
  font-weight: 300;
  font-size: 48px;
  line-height: 1;
}
.resultat-actions {
  display: flex;
  align-items: center;
  gap: var(--e3);
  flex-wrap: wrap;
}
.contenu-box {
  padding-block: var(--e6);
}
.contenu-intro {
  margin: var(--e2) 0 var(--e4);
}
.categories {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gouttiere);
}
.categories li {
  border-top: 1px solid var(--noir);
  padding-top: var(--e2);
}
.categorie-nom {
  font-weight: 700;
}
.infos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--e4);
  padding-block: var(--e5) var(--e6);
}
.infos .sous-titre {
  font-family: var(--font-texte);
  font-size: 18px;
  margin-bottom: var(--e1);
}

@media (max-width: 900px) {
  .resultat,
  .infos {
    grid-template-columns: 1fr;
  }
  .resultat {
    min-height: 0;
  }
  .resultat-visuel {
    order: -1;
    aspect-ratio: 390 / 300;
  }
  .resultat-texte {
    padding: var(--e4) var(--marge);
  }
  .resultat-actions {
    flex-direction: column;
    align-items: stretch;
    align-self: stretch;
    text-align: center;
  }
  .categories {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
