<!-- pages/nos-formules.vue — Box Surprise vs Compose ta box (US-06, US-53) -->
<template>
  <div>
    <section class="conteneur entete">
      <h1 class="titre-1">Nos formules</h1>
      <p>La surprise chaque mois ou le choix produit par produit. Pas sûr de vous&nbsp;? Le quiz vous oriente en 2 minutes.</p>
    </section>

    <section class="conteneur formules">
      <article class="formule fond-noir">
        <VisuelChien class="formule-visuel" src="/images/photos/formule-surprise.jpg" alt="Un dalmatien assis sur fond blanc" position="50% 8%" />
        <div class="formule-texte">
          <p class="surtitre surtitre-clair">Abonnement mensuel</p>
          <h2 class="titre-3">Box Surprise</h2>
          <p class="petit">{{ surprise?.description ?? 'Nos experts composent sa box chaque mois, selon sa taille. Vous découvrez tout à l\'ouverture.' }}</p>
          <ul class="points petit">
            <li>{{ nbSurprise }} produits et une carte collector</li>
            <li>Expédiée le 1er du mois</li>
            <li>Sans engagement, résiliation en ligne</li>
          </ul>
          <p class="formule-prix">
            <template v-if="prixSurprise">{{ formatPrix(prixSurprise) }} <span class="petit">/mois</span></template>
          </p>
          <NuxtLink to="/quiz" class="btn btn-clair">Commencer le quiz</NuxtLink>
        </div>
      </article>

      <article class="formule fond-gris">
        <VisuelChien class="formule-visuel" src="/images/photos/formule-compose.jpg" alt="Un dalmatien couché dans l'herbe, en noir et blanc" position="50% 55%" />
        <div class="formule-texte">
          <p class="surtitre">Commande unique</p>
          <h2 class="titre-3">Compose ta box</h2>
          <p class="petit">Vous choisissez {{ nbCompose }} produits parmi les pépites des mois passés. Idéal en cas d'allergie.</p>
          <ul class="points petit">
            <li>Filtre par allergène et composition complète</li>
            <li>Expédition sous 3 à 5 jours ouvrés</li>
            <li>Anti-gaspi, même qualité</li>
          </ul>
          <p class="formule-prix">
            <template v-if="prixCompose">{{ formatPrix(prixCompose) }} <span class="petit">/box</span></template>
          </p>
          <NuxtLink to="/compose-ta-box" class="btn btn-secondaire">Composer ma box</NuxtLink>
        </div>
      </article>
    </section>

    <section class="conteneur tableau-tailles">
      <h2 class="titre-3">Quelle taille pour votre chien&nbsp;?</h2>
      <div class="tailles">
        <CarteTaille v-for="t in INFOS_TAILLES" :key="t.taille" :infos="t" :prix-mensuel="surprise?.prix[t.taille]" />
      </div>
    </section>

    <section class="fond-burgundy bandeau-cadeau">
      <div class="conteneur bandeau">
        <div>
          <h2 class="titre-3">Offrir 3 mois de Box Surprise</h2>
          <p class="petit">
            <template v-if="prixSurprise">{{ formatPrix(prixSurprise * 3) }} en une fois, l</template><template v-else>L</template>ivrés à
            l'adresse de votre choix. Pas de renouvellement automatique.
          </p>
        </div>
        <NuxtLink to="/offrir" class="btn btn-clair">Offrir une box</NuxtLink>
      </div>
    </section>

    <section class="conteneur faq-section">
      <h2 class="titre-3">Questions fréquentes</h2>
      <FaqListe :questions="FAQ_FORMULES" />
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Catalogue } from '~/composables/types'

useSeoMeta({
  title: 'Nos formules — Box Surprise ou Compose ta box | Dawky',
  description: 'Box Surprise mensuelle sans engagement ou Compose ta box avec les produits des mois passés, idéale en cas d\'allergie.',
})

const { data: catalogue } = await useFetch('/api/boxes', {
  transform: (r: { data: Catalogue }) => r.data,
})

const surprise = computed(() => catalogue.value?.formules.find(f => f.type === 'SURPRISE'))
const compose = computed(() => catalogue.value?.formules.find(f => f.type === 'COMPOSE'))
const minPrix = (p?: Record<string, number | undefined>) => {
  const v = Object.values(p ?? {}).filter((x): x is number => typeof x === 'number')
  return v.length ? Math.min(...v) : null
}
const prixSurprise = computed(() => minPrix(surprise.value?.prix))
const prixCompose = computed(() => minPrix(compose.value?.prix))
const nbSurprise = computed(() => Object.values(surprise.value?.contenu?.M ?? {}).reduce((s, n) => s + (n ?? 0), 0) || 5)
const nbCompose = 5
</script>

<style scoped>
.entete {
  padding-block: var(--e6) var(--e5);
  display: flex;
  flex-direction: column;
  gap: var(--e3);
}
.entete p {
  max-width: 600px;
}
.formules {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gouttiere);
}
.formule {
  display: flex;
  flex-direction: column;
}
.formule-visuel {
  aspect-ratio: 636 / 340;
}
.formule-texte {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--e2);
  padding: var(--e4);
  flex: 1;
}
.surtitre-clair {
  color: var(--blanc);
}
.points {
  margin: 0;
  padding-left: 20px;
}
.formule-prix {
  font-family: var(--font-titre);
  font-weight: 300;
  font-size: 48px;
  line-height: 1;
  margin-top: auto;
  padding-top: var(--e2);
}
.formule-prix .petit {
  font-family: var(--font-texte);
}
.tableau-tailles {
  padding-block: var(--e7) var(--e6);
}
.tableau-tailles h2 {
  margin-bottom: var(--e5);
}
.tailles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gouttiere);
}
.bandeau-cadeau {
  padding-block: var(--e6);
}
.bandeau {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--e3);
}
.bandeau .petit {
  margin-top: var(--e1);
}
.faq-section {
  padding-block: var(--e7);
}
.faq-section h2 {
  margin-bottom: var(--e4);
}

@media (max-width: 900px) {
  .formules,
  .tailles {
    grid-template-columns: 1fr;
  }
  .formule-texte {
    padding: var(--e3);
  }
  .formule-texte .btn {
    align-self: stretch;
  }
  .bandeau {
    flex-direction: column;
    align-items: stretch;
  }
  .tableau-tailles,
  .faq-section {
    padding-block: var(--e5);
  }
}
</style>
