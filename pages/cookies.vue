<!-- pages/cookies.vue — préférences cookies et liste des traceurs -->
<template>
  <div class="conteneur page">
    <NuxtLink to="/" class="lien petit">Retour à l'accueil</NuxtLink>
    <h1 class="titre-1">Cookies</h1>
    <p class="chapo">Les cookies nécessaires font tourner le site. Les autres ne sont déposés qu'avec votre accord, et vous pouvez changer d'avis à tout moment.</p>

    <section class="bloc">
      <h2 class="titre-section">Vos préférences</h2>
      <div class="preference">
        <div><p class="nom">Nécessaires</p><p class="petit texte-secondaire">Connexion, panier et paiement sécurisé.</p></div>
        <span class="etiquette">Toujours actifs</span>
      </div>
      <label class="preference">
        <div><p class="nom">Mesure d'audience</p><p class="petit texte-secondaire">Comprendre les pages consultées pour améliorer le site.</p></div>
        <input v-model="audience" type="checkbox" class="interrupteur" />
      </label>
      <label class="preference">
        <div><p class="nom">Marketing</p><p class="petit texte-secondaire">Mesurer et personnaliser nos publicités sur les réseaux sociaux.</p></div>
        <input v-model="marketing" type="checkbox" class="interrupteur" />
      </label>
      <div class="actions">
        <button type="button" class="btn btn-principal" @click="sauver(audience, marketing)">Enregistrer mes choix</button>
        <button type="button" class="btn btn-secondaire" @click="sauver(false, false)">Tout refuser</button>
        <button type="button" class="btn btn-secondaire" @click="sauver(true, true)">Tout accepter</button>
      </div>
    </section>

    <section class="bloc">
      <h2 class="titre-section">Liste des cookies</h2>
      <div class="table-defilante">
        <table>
          <thead><tr><th scope="col">Nom</th><th scope="col">Finalité</th><th scope="col">Durée</th><th scope="col">Fournisseur</th></tr></thead>
          <tbody>
            <tr><td>sb-…-auth-token</td><td>Nécessaire : garder votre session de connexion</td><td>Jusqu'à la déconnexion</td><td>Supabase</td></tr>
            <tr><td>dawky-quiz, dawky-compose</td><td>Nécessaire : vos réponses au quiz et votre box en cours</td><td>Session du navigateur</td><td>Dawky</td></tr>
            <tr><td>dawky-consentement</td><td>Nécessaire : mémoriser vos choix cookies</td><td>6 mois</td><td>Dawky</td></tr>
            <tr><td>__stripe_mid, __stripe_sid</td><td>Nécessaire : sécuriser le paiement et prévenir la fraude</td><td>1 an / 30 minutes</td><td>Stripe</td></tr>
          </tbody>
        </table>
      </div>
      <p class="petit texte-secondaire">Aucun cookie de mesure d'audience ni de marketing n'est déposé à ce jour. Cette liste sera mise à jour si nous en ajoutons.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Cookies — Dawky' })

const { choix, enregistrer } = useConsentement()
const toast = useToast()
const audience = ref(choix.value?.audience ?? false)
const marketing = ref(choix.value?.marketing ?? false)

function sauver(a: boolean, m: boolean) {
  audience.value = a
  marketing.value = m
  enregistrer(a, m)
  toast.success('Vos choix sont enregistrés')
}
</script>

<style scoped>
.page {
  padding-block: var(--e5) var(--e7);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--e3);
}
.chapo {
  font-size: 20px;
  max-width: 760px;
}
.bloc {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: var(--e2);
  margin-top: var(--e3);
}
.titre-section {
  font-family: var(--font-texte);
  font-size: 20px;
  font-weight: 700;
}
.preference {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--e3);
  border-top: 1px solid var(--filet);
  padding-top: var(--e2);
  cursor: pointer;
}
.nom {
  font-weight: 700;
}
.interrupteur {
  width: 22px;
  height: 22px;
  accent-color: var(--burgundy);
  flex-shrink: 0;
}
.actions {
  display: flex;
  gap: var(--e1);
  flex-wrap: wrap;
  margin-top: var(--e2);
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
}
th {
  border-bottom: 1px solid var(--noir);
}
</style>
