<!-- pages/aide.vue — FAQ et formulaire de contact (F-56, US-15) -->
<template>
  <div class="conteneur page">
    <header class="entete">
      <h1 class="titre-1">Aide</h1>
      <p class="chapo">Les réponses aux questions les plus fréquentes. Et sinon, on vous répond sous 48 h ouvrées.</p>
    </header>

    <section class="faq-section" aria-labelledby="titre-faq">
      <h2 id="titre-faq" class="titre-3">Questions fréquentes</h2>
      <FaqListe :questions="questions" />
    </section>

    <section id="contact" class="contact" aria-labelledby="titre-contact">
      <div class="contact-intro">
        <h2 id="titre-contact" class="titre-3">Nous écrire</h2>
        <p>Une question sur une box, une allergie, une livraison&nbsp;? Écrivez-nous, un humain vous répond.</p>
        <p class="petit texte-secondaire">Vous pouvez aussi nous écrire directement à contact@dawky.fr</p>
      </div>

      <p v-if="envoye" class="confirmation" role="status">
        <strong>Message envoyé&nbsp;!</strong> Un email de confirmation vient de partir. Nous vous répondons sous 48 h ouvrées.
      </p>
      <form v-else class="formulaire" novalidate @submit.prevent="envoyer">
        <div class="ligne">
          <div class="champ">
            <label for="ct-prenom">Prénom</label>
            <input id="ct-prenom" v-model.trim="f.prenom" class="input" autocomplete="given-name" :aria-invalid="!!erreurs.prenom" />
            <p v-if="erreurs.prenom" class="erreur-champ">{{ erreurs.prenom }}</p>
          </div>
          <div class="champ">
            <label for="ct-nom">Nom</label>
            <input id="ct-nom" v-model.trim="f.nom" class="input" autocomplete="family-name" :aria-invalid="!!erreurs.nom" />
            <p v-if="erreurs.nom" class="erreur-champ">{{ erreurs.nom }}</p>
          </div>
        </div>
        <div class="champ">
          <label for="ct-email">Email</label>
          <input id="ct-email" v-model.trim="f.email" class="input" type="email" autocomplete="email" :aria-invalid="!!erreurs.email" />
          <p v-if="erreurs.email" class="erreur-champ">{{ erreurs.email }}</p>
        </div>
        <div class="champ">
          <label for="ct-sujet">Sujet</label>
          <select id="ct-sujet" v-model="f.sujet" class="input">
            <option v-for="s in SUJETS" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="champ">
          <label for="ct-message">Message</label>
          <textarea id="ct-message" v-model.trim="f.message" class="input" rows="6" maxlength="5000" :aria-invalid="!!erreurs.message" />
          <p v-if="erreurs.message" class="erreur-champ">{{ erreurs.message }}</p>
        </div>
        <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>
        <button class="btn btn-principal btn-grand" :disabled="envoi">{{ envoi ? 'Envoi…' : 'Envoyer' }}</button>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Aide et contact — Dawky',
  description: 'Prélèvement, résiliation, allergies, livraison : les réponses aux questions fréquentes, et un formulaire pour écrire à l\'équipe Dawky.',
})

const SUJETS = ['Ma box ou mon abonnement', 'Une allergie', 'Une livraison', 'Un cadeau', 'La garantie taille et satisfaction', 'Autre question']

const questions = [
  ...FAQ_GENERALE,
  {
    question: 'Comment offrir une box ?',
    reponse: 'Choisissez la durée (3, 6 ou 12 mois) et la taille, indiquez l\'adresse de la personne et votre message. Vous payez une seule fois, sans renouvellement automatique, et vous êtes prévenu(e) à chaque expédition.',
  },
  {
    question: 'Qu\'est-ce que Compose ta box ?',
    reponse: 'Les produits qui n\'ont pas trouvé leur box à la fin du mois rejoignent Compose ta box. Vous en choisissez 5, pour un prix fixe, sans abonnement : même qualité, rien ne se perd.',
  },
  {
    question: 'Comment fonctionne le parrainage ?',
    reponse: 'Partagez votre lien depuis votre espace client. Votre filleul profite d\'une réduction sur sa première commande, et vous d\'une réduction sur votre prochaine box dès qu\'il a payé.',
  },
  {
    question: 'Comment télécharger ma facture ?',
    reponse: 'Dans votre espace client, rubrique « Commandes ». Chaque facture est aussi envoyée par email après le paiement.',
  },
]

const { profile } = useAuth()
const f = reactive({ prenom: '', nom: '', email: '', sujet: SUJETS[0]!, message: '' })
watch(profile, (p) => {
  if (p && !f.email) Object.assign(f, { prenom: p.prenom, nom: p.nom, email: p.email })
}, { immediate: true })

const erreurs = reactive<Record<string, string>>({})
const erreur = ref('')
const envoi = ref(false)
const envoye = ref(false)

function valider() {
  for (const k of Object.keys(erreurs)) delete erreurs[k]
  if (!f.prenom) erreurs.prenom = 'Indiquez votre prénom.'
  if (!f.nom) erreurs.nom = 'Indiquez votre nom.'
  if (!/^\S+@\S+\.\S+$/.test(f.email)) erreurs.email = 'Saisissez une adresse email valide.'
  if (f.message.length < 10) erreurs.message = 'Votre message est un peu court (10 caractères minimum).'
  return Object.keys(erreurs).length === 0
}

async function envoyer() {
  erreur.value = ''
  if (!valider()) return
  envoi.value = true
  try {
    await api('/api/contact', { method: 'POST', body: f })
    envoye.value = true
  } catch (err) {
    erreur.value = versApiError(err).message
  } finally {
    envoi.value = false
  }
}
</script>

<style scoped>
.page {
  padding-block: var(--e6) var(--e7);
  display: flex;
  flex-direction: column;
  gap: var(--e7);
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
.faq-section {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: var(--e4);
}
.contact {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: var(--e4);
  scroll-margin-top: 110px;
}
.contact-intro {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}
.formulaire {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--e3);
}
.formulaire .champ {
  width: 100%;
}
.ligne {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--e2);
  width: 100%;
}
.confirmation {
  background: var(--fond-gris);
  border-left: 3px solid var(--burgundy);
  padding: var(--e3);
  align-self: start;
}

@media (max-width: 900px) {
  .page {
    gap: var(--e5);
  }
  .faq-section,
  .contact,
  .ligne {
    grid-template-columns: 1fr;
  }
  .formulaire .btn {
    align-self: stretch;
  }
}
</style>
