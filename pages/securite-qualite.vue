<!-- pages/securite-qualite.vue (F-35) — ⚠️ contenu à compléter par l'équipe
     (normes exactes, fournisseurs) -->
<template>
  <PageTexte
    surtitre="Nos engagements"
    titre="Sécurité et qualité"
    chapo="Le contenu de la box reste une surprise. La façon dont on le choisit, non."
    :sections="sections"
  >
    <div class="actions">
      <NuxtLink to="/produits" class="btn btn-principal">Voir les produits et leur composition</NuxtLink>
    </div>
  </PageTexte>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Sécurité et qualité des produits — Dawky',
  description: 'Normes des jouets, sélection des fournisseurs, contrôles et transparence sur la composition des produits Dawky.',
})

const sections = [
  {
    titre: 'Des jouets à la bonne taille',
    paragraphes: [
      'Chaque produit est référencé pour une ou plusieurs tailles (S, M, L). Un jouet trop petit peut être avalé, un jouet trop fragile détruit en quelques minutes : en taille L, nous sélectionnons des jouets pensés pour les gros mâcheurs.',
    ],
  },
  {
    titre: 'Des fournisseurs choisis',
    liste: [
      'Jouets conformes aux exigences de sécurité applicables aux articles pour animaux, sans petites pièces détachables.',
      'Friandises et produits à mâcher fabriqués pour l\'alimentation animale, avec une composition complète.',
      'Lots tracés : chaque lot de stock porte sa date limite.',
    ],
  },
  {
    titre: 'Une composition transparente',
    paragraphes: [
      'Pour chaque produit, vous trouvez la composition complète, les allergènes qu\'il contient et les traces possibles. Ces informations sont visibles dans le catalogue, dans Compose ta box, et rappelées dans votre commande.',
    ],
  },
  {
    titre: 'Des dates limites surveillées',
    paragraphes: [
      'Les produits alimentaires sont retirés du site un mois avant leur date limite, sans être bradés, puis donnés à des associations et des refuges.',
    ],
  },
]
</script>

<style scoped>
.actions {
  padding-top: var(--e2);
}
</style>
