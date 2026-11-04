<!-- pages/paiement/confirmation.vue — retour de Stripe après paiement
     (F-49, US-38) : confirmation claire, dates et adresse de livraison. -->
<template>
  <div class="confirmation">
    <section class="confirmation-texte fond-noir">
      <LogoDawky :hauteur="44" />

      <template v-if="donnees?.actif">
        <h1 class="titre-2">C'est bon, <em>tout est validé.</em></h1>
        <p>{{ phrase }}</p>
        <dl class="tableau">
          <div><dt>{{ donnees.type === 'commande' ? 'Commande' : 'Formule' }}</dt><dd>{{ formule }}</dd></div>
          <div v-if="donnees.livraisonEstimee"><dt>Première expédition</dt><dd>{{ jourMois(donnees.livraisonEstimee) }} {{ new Date(donnees.livraisonEstimee).getFullYear() }}</dd></div>
          <div v-else><dt>Expédition</dt><dd>Sous 3 à 5 jours ouvrés</dd></div>
          <div v-if="donnees.adresse"><dt>Adresse</dt><dd>{{ donnees.adresse }}</dd></div>
        </dl>
        <p class="petit">
          Un email récapitulatif vient de partir. Vous serez aussi prévenu{{ donnees.type === 'cadeau' ? '(e)' : '' }} à l'expédition et à la livraison.
        </p>
        <NuxtLink to="/mon-compte" class="btn btn-clair btn-grand">Voir mon espace</NuxtLink>

        <div v-if="profile?.codeParrainage" class="parrainage">
          <p class="sous-titre">Parrainez un proche</p>
          <p class="petit">Votre code : <strong>{{ profile.codeParrainage }}</strong>. Vous et votre filleul profitez chacun d'une réduction.</p>
        </div>
      </template>

      <template v-else-if="erreur">
        <h1 class="titre-2">Paiement <em>non confirmé.</em></h1>
        <p>{{ erreur }}</p>
        <NuxtLink to="/mon-compte" class="btn btn-clair btn-grand">Mon espace</NuxtLink>
      </template>

      <template v-else>
        <h1 class="titre-2">Un instant…</h1>
        <p role="status">Nous confirmons votre paiement. Ne fermez pas cette page.</p>
      </template>
    </section>
    <VisuelChien class="confirmation-visuel" alt="" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Confirmation — Dawky', robots: 'noindex' })

interface Confirmation {
  type: 'abonnement' | 'commande' | 'cadeau'
  statut: string
  actif: boolean
  dateDebut?: string | null
  livraisonEstimee?: string
  pour?: string
  taille?: string
  dureeMois?: number
  numero?: number
  adresse?: string | null
}

const route = useRoute()
const { profile } = useAuth()
const { recommencer } = useQuiz()
const { selection } = useCompose()
const donnees = ref<Confirmation | null>(null)
const erreur = ref('')

// Le webhook peut arriver quelques secondes après le retour de Stripe :
// on réinterroge l'API tant que la commande n'est pas active.
onMounted(async () => {
  const sessionId = route.query.session_id
  if (typeof sessionId !== 'string') {
    erreur.value = 'Lien de confirmation incomplet.'
    return
  }
  for (let essai = 0; essai < 8; essai++) {
    try {
      donnees.value = await api<Confirmation>('/api/paiement/confirmation', { query: { session_id: sessionId } })
      if (donnees.value.actif) break
    } catch (err) {
      erreur.value = versApiError(err).message
      return
    }
    await new Promise(r => setTimeout(r, 1500))
  }
  if (!donnees.value?.actif) {
    erreur.value = 'Le paiement n\'a pas encore été confirmé par la banque. Vous recevrez un email dès qu\'il le sera ; votre espace client indique l\'état de la commande.'
    return
  }
  // Parcours terminé : on repart de zéro la prochaine fois
  recommencer()
  if (donnees.value.type === 'commande') selection.value.lots = []
})

const formule = computed(() => {
  const d = donnees.value
  if (!d) return ''
  if (d.type === 'abonnement') return `Box Surprise ${d.taille} pour ${d.pour}`
  if (d.type === 'cadeau') return `${d.dureeMois} mois de Box Surprise ${d.taille} pour ${d.pour}`
  return `n°${d.numero}`
})

const phrase = computed(() => {
  const d = donnees.value
  if (!d) return ''
  if (d.type === 'abonnement') return `Votre abonnement est actif à partir du ${dateLongue(d.dateDebut)}.`
  if (d.type === 'cadeau') return `Le cadeau est actif à partir du ${dateLongue(d.dateDebut)}.`
  return 'Votre commande est confirmée et part en préparation.'
})
</script>

<style scoped>
.confirmation {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}
.confirmation-texte {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--e3);
  padding: var(--e6) var(--e6) var(--e6) max(var(--marge), calc((100vw - var(--largeur-max)) / 2 + var(--marge)));
}
.confirmation-texte h1 {
  margin-block: var(--e5) var(--e3);
}
.tableau {
  margin: 0;
  border: 1px solid var(--blanc);
  padding: var(--e2) var(--e3);
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 16px;
}
.tableau div {
  display: flex;
  justify-content: space-between;
  gap: var(--e3);
}
.tableau dd {
  margin: 0;
  font-weight: 700;
  text-align: right;
}
.parrainage {
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  padding-top: var(--e3);
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.parrainage .sous-titre {
  font-size: 17px;
}

@media (max-width: 900px) {
  .confirmation {
    grid-template-columns: 1fr;
  }
  .confirmation-visuel {
    display: none;
  }
  .confirmation-texte {
    padding: var(--e4) var(--marge);
  }
  .confirmation-texte .btn {
    align-self: stretch;
  }
}
</style>
