<!-- pages/index.vue — Accueil (F-12 : concept compris dès le premier écran) -->
<template>
  <div>
    <!-- Hero -->
    <section class="hero">
      <div class="hero-texte">
        <p class="surtitre">Box surprise mensuelle pour chiens</p>
        <h1 class="titre-1">Chaque mois, une surprise <em>à sa taille.</em></h1>
        <p class="hero-intro">
          Une sélection de produits choisis selon le gabarit de votre chien, livrée chez vous.
          Le contenu reste secret jusqu'à l'ouverture.
        </p>
        <div class="hero-actions">
          <NuxtLink to="/quiz" class="btn btn-principal btn-grand">Trouver sa box</NuxtLink>
          <NuxtLink to="/offrir" class="lien">Offrir une box</NuxtLink>
        </div>
        <p class="petit texte-secondaire">
          <template v-if="prixMin">Dès {{ formatPrix(prixMin) }}/mois · </template>Sans engagement · Livraison offerte
        </p>
      </div>
      <VisuelChien class="hero-visuel" alt="Un chien découvre sa box Dawky" />
    </section>

    <!-- Réassurance -->
    <ul class="reassurance conteneur" aria-label="Nos engagements">
      <li><Icone nom="camion" /> Livraison offerte</li>
      <li><Icone nom="check-cercle" /> Sans engagement</li>
      <li><Icone nom="regle" /> Adaptée à sa taille</li>
      <li><Icone nom="bouclier" /> Garantie taille et satisfaction</li>
    </ul>

    <!-- Comment ça marche -->
    <section class="fond-burgundy section">
      <div class="conteneur">
        <h2 class="titre-2 etapes-titre">Quatre étapes, zéro prise de tête.</h2>
        <ol class="etapes">
          <li v-for="(e, i) in etapes" :key="e.titre" class="etape">
            <span class="etape-numero" aria-hidden="true">{{ i + 1 }}</span>
            <p class="etape-titre"><span class="numero-mobile">{{ i + 1 }}. </span>{{ e.titre }}</p>
            <p class="etape-texte">{{ e.texte }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- Les 3 tailles -->
    <section class="section conteneur">
      <div class="entete-section">
        <h2 class="titre-2 titre-tailles">Trois tailles. Aucun jouet détruit en 5 minutes.</h2>
        <NuxtLink to="/quiz" class="lien">Le quiz calcule sa taille</NuxtLink>
      </div>
      <div class="tailles">
        <CarteTaille
          v-for="t in INFOS_TAILLES" :key="t.taille"
          :infos="t" :prix-mensuel="prixSurprise?.[t.taille]"
        />
      </div>
    </section>

    <!-- Contenu secret -->
    <section class="secret">
      <VisuelChien class="secret-visuel" alt="Le contenu d'une box Dawky" />
      <div class="secret-texte fond-gris">
        <h2 class="titre-2">Le contenu reste secret. <em>Pas la qualité.</em></h2>
        <p>Vous savez ce qu'il y aura dans la box, sans savoir quoi exactement.</p>
        <ul class="categories">
          <li v-for="c in categories" :key="c">{{ c }}</li>
        </ul>
        <p class="collector">Chaque box contient aussi une carte collector illustrée.</p>
      </div>
    </section>

    <!-- Allergies -->
    <section class="fond-burgundy section-bandeau">
      <div class="conteneur bandeau">
        <div>
          <h2 class="titre-2">Une allergie ? Composez sa box.</h2>
          <p class="bandeau-texte">
            Filtrez les allergènes, choisissez vos produits et consultez la composition complète de chacun, sans abonnement.
          </p>
        </div>
        <NuxtLink to="/compose-ta-box" class="btn btn-clair btn-grand">Voir Compose ta box</NuxtLink>
      </div>
    </section>

    <!-- Cadeau -->
    <section class="cadeau">
      <div class="cadeau-texte">
        <p class="surtitre">Idée cadeau</p>
        <h2 class="titre-2">Offrez-lui <em>3 mois de surprises.</em></h2>
        <p>
          <template v-if="prixMin">{{ formatPrix(prixMin * 3) }} en une fois, l</template><template v-else>L</template>ivrés directement
          chez le destinataire avec votre message. Aucun renouvellement automatique.
        </p>
        <NuxtLink to="/offrir" class="btn btn-secondaire btn-grand">Offrir une box</NuxtLink>
      </div>
      <VisuelChien class="cadeau-visuel" alt="Une box Dawky emballée pour un cadeau" />
    </section>

    <!-- Avis (affiché seulement s'il y a des avis publiés) -->
    <section v-if="avis && avis.total > 0" class="fond-gris section">
      <div class="conteneur">
        <div class="entete-section">
          <h2 class="titre-2">La communauté Dawky</h2>
          <p class="note" v-if="avis.noteMoyenne">
            {{ String(avis.noteMoyenne).replace('.', ',') }}/5 · {{ avis.total }} avis
          </p>
        </div>
        <div v-if="photos.length" class="galerie">
          <div v-for="a in photos" :key="a.id" class="visuel galerie-photo">
            <img :src="a.photoUrl!" :alt="`Photo partagée par ${a.prenom}`" loading="lazy" />
          </div>
        </div>
        <div class="avis-liste">
          <figure v-for="a in avis.avis.slice(0, 3)" :key="a.id" class="avis">
            <blockquote>{{ a.commentaire }}</blockquote>
            <figcaption>{{ a.prenom }} · {{ a.note }}/5</figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- Transparence -->
    <section class="section conteneur">
      <h2 class="titre-2 titre-transparence">Ce qui entre dans la box, on peut vous le dire.</h2>
      <div class="engagements">
        <div v-for="e in engagements" :key="e.titre" class="engagement">
          <p class="sous-titre">{{ e.titre }}</p>
          <p class="texte-secondaire">{{ e.texte }}</p>
          <NuxtLink :to="e.to" class="lien">{{ e.lien }}</NuxtLink>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="conteneur faq-section">
      <h2 class="titre-2">Questions fréquentes</h2>
      <FaqListe :questions="FAQ_GENERALE" />
    </section>

    <!-- Appel final -->
    <section class="fond-gris cta-final">
      <h2 class="titre-2">Prêt à lui faire <em>plaisir ?</em></h2>
      <p>Le quiz prend 2 minutes. Il est gratuit et sans inscription.</p>
      <NuxtLink to="/quiz" class="btn btn-principal btn-grand">Trouver sa box</NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Avis, Catalogue } from '~/composables/types'

const { data: catalogue } = await useFetch('/api/boxes', {
  transform: (r: { data: Catalogue }) => r.data,
})
const { data: avis } = await useFetch('/api/avis', {
  query: { limit: 12 },
  transform: (r: { data: { avis: Avis[]; noteMoyenne: number | null; total: number } }) => r.data,
})

const prixSurprise = computed(() => catalogue.value?.formules.find(f => f.type === 'SURPRISE')?.prix)
const prixMin = computed(() => {
  const valeurs = Object.values(prixSurprise.value ?? {}).filter((v): v is number => typeof v === 'number')
  return valeurs.length ? Math.min(...valeurs) : null
})
const photos = computed(() => (avis.value?.avis ?? []).filter(a => a.photoUrl).slice(0, 4))

const etapes = [
  { titre: 'Faites le quiz', texte: 'Race, poids, habitudes et allergies, en 2 minutes.' },
  { titre: 'On compose sa box', texte: 'Des produits adaptés à sa taille, sans vous dévoiler la surprise.' },
  { titre: 'Elle part le 1er du mois', texte: 'À domicile ou en point relais, livraison offerte.' },
  { titre: 'Il découvre tout', texte: 'Et vous, vous gardez la carte collector du mois.' },
]

const categories = ['Friandise', 'Mastication', 'Jouet', 'Accessoire']

const engagements = [
  { titre: 'Sécurité et qualité', texte: 'Normes des jouets, fournisseurs et contrôles expliqués.', lien: 'Voir nos engagements', to: '/securite-qualite' },
  { titre: 'Composition transparente', texte: 'Ingrédients, allergènes et traces à portée de clic.', lien: 'Voir les produits', to: '/produits' },
  { titre: 'Rien ne se perd', texte: 'Les produits des mois passés rejoignent Compose ta box.', lien: 'Découvrir les pépites', to: '/compose-ta-box' },
]

useSeoMeta({
  title: 'Dawky — Chaque mois, une box surprise à la taille de votre chien',
  description: 'Une box mensuelle pour chiens adaptée à leur taille (S, M, L) : friandise, mastication, jouet et accessoire. Sans engagement, livraison offerte.',
})
</script>

<style scoped>
/* Hero */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 960px;
}
.hero-texte {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--e3);
  padding: var(--e7) var(--e6) var(--e7) max(var(--marge), calc((100vw - var(--largeur-max)) / 2 + var(--marge)));
}
.hero-texte h1 {
  margin-block: var(--e2);
}
.hero-intro {
  max-width: 540px;
  font-size: 20px;
}
.hero-actions {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
}

/* Réassurance */
.reassurance {
  list-style: none;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  gap: var(--e3);
  padding-block: 30px;
  font-weight: 500;
  border-top: 1px solid var(--filet);
}
.reassurance li {
  display: flex;
  align-items: center;
  gap: var(--e2);
}
.reassurance :deep(svg) {
  color: var(--burgundy);
}

/* Étapes */
.etapes-titre {
  margin-bottom: var(--e5);
}
.etapes {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
}
.etape {
  border-top: 1px solid var(--blanc);
  padding-top: var(--e3);
}
.etape-numero {
  display: block;
  font-family: var(--font-titre);
  font-weight: 300;
  font-size: 48px;
  line-height: 1;
  margin-bottom: var(--e3);
}
.numero-mobile {
  display: none;
}
.etape-titre {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: var(--e1);
}
.etape-texte {
  font-size: 16px;
}

/* Tailles */
.entete-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--e3);
  margin-bottom: var(--e5);
}
.titre-tailles {
  max-width: 760px;
}
.tailles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gouttiere);
}

/* Contenu secret */
.secret {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 720px;
}
.secret-texte {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--e3);
  padding: var(--e7) max(var(--marge), calc((100vw - var(--largeur-max)) / 2 + var(--marge))) var(--e7) var(--e6);
}
.categories {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: var(--gouttiere);
}
.categories li {
  border-top: 1px solid var(--noir);
  padding-block: 14px;
}
.collector {
  color: var(--burgundy);
  font-weight: 700;
}

/* Bandeau allergies */
.section-bandeau {
  padding-block: var(--e7);
}
.bandeau {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--e4);
}
.bandeau > div {
  max-width: 820px;
}
.bandeau-texte {
  margin-top: var(--e3);
}

/* Cadeau */
.cadeau {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 560px;
}
.cadeau-texte {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: var(--e3);
  padding: var(--e7) var(--e6) var(--e7) max(var(--marge), calc((100vw - var(--largeur-max)) / 2 + var(--marge)));
}

/* Avis */
.note {
  font-weight: 500;
}
.galerie {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--e2);
  margin-bottom: var(--e2);
}
.galerie-photo {
  aspect-ratio: 312 / 340;
}
.avis-liste {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--e2);
}
.avis {
  margin: 0;
  background: var(--blanc);
  padding: var(--e3) 28px;
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}
.avis blockquote {
  margin: 0;
}
.avis figcaption {
  font-weight: 700;
  font-size: 16px;
}

/* Transparence */
.titre-transparence {
  max-width: 820px;
  margin-bottom: var(--e5);
}
.engagements {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--e4);
}
.engagement {
  border-top: 2px solid var(--noir);
  padding-top: var(--e3);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--e1);
}

/* FAQ */
.faq-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--e4);
  padding-bottom: var(--e7);
}

/* Appel final */
.cta-final {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--e3);
  text-align: center;
  padding: 200px var(--marge);
}

@media (max-width: 1100px) {
  .reassurance {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .etapes {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 900px) {
  .hero,
  .secret,
  .cadeau,
  .faq-section {
    grid-template-columns: 1fr;
  }
  .hero {
    min-height: 0;
  }
  .hero-visuel {
    order: -1;
    aspect-ratio: 390 / 340;
    height: auto;
  }
  .hero-texte,
  .cadeau-texte,
  .secret-texte {
    padding: var(--e4) var(--marge);
  }
  .hero-actions {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  .reassurance {
    font-size: 15px;
    column-gap: var(--e2);
  }
  .reassurance :deep(svg) {
    display: none;
  }
  .etapes {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .etape {
    padding-block: var(--e2);
  }
  .etape-numero {
    display: none;
  }
  .numero-mobile {
    display: inline;
  }
  .entete-section {
    flex-direction: column;
    align-items: flex-start;
  }
  .tailles {
    grid-template-columns: 1fr;
    gap: var(--e2);
  }
  .secret-visuel,
  .cadeau-visuel {
    aspect-ratio: 390 / 280;
    height: auto;
  }
  .cadeau-visuel {
    display: none;
  }
  .cadeau-texte .btn {
    align-self: stretch;
  }
  .bandeau {
    flex-direction: column;
    align-items: stretch;
  }
  .galerie {
    grid-template-columns: 1fr 1fr;
  }
  .avis-liste,
  .engagements {
    grid-template-columns: 1fr;
  }
  .cta-final {
    padding-block: var(--e6);
  }
  .cta-final .btn {
    align-self: stretch;
  }
}
</style>
