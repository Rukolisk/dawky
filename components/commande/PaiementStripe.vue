<!-- components/commande/PaiementStripe.vue
     Formulaire de paiement Stripe intégré à la page (Embedded Checkout).
     Les données de carte sont saisies dans une iframe Stripe : elles ne
     transitent jamais par Dawky. Après paiement, Stripe redirige vers
     /paiement/confirmation. -->
<template>
  <div class="paiement">
    <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>
    <p v-else-if="chargement" class="texte-secondaire petit">Chargement du paiement sécurisé…</p>
    <div ref="conteneur" />
  </div>
</template>

<script setup lang="ts">
import { loadStripe, type StripeEmbeddedCheckout } from '@stripe/stripe-js'

const props = defineProps<{ clientSecret: string }>()
const conteneur = ref<HTMLElement | null>(null)
const chargement = ref(true)
const erreur = ref('')
let checkout: StripeEmbeddedCheckout | null = null

onMounted(async () => {
  const cle = useRuntimeConfig().public.stripePublishableKey as string
  if (!cle) {
    erreur.value = 'Le paiement n\'est pas configuré (clé publiable Stripe manquante).'
    chargement.value = false
    return
  }
  try {
    const stripe = await loadStripe(cle, { locale: 'fr' })
    if (!stripe) throw new Error('Stripe indisponible')
    checkout = await stripe.createEmbeddedCheckoutPage({ clientSecret: props.clientSecret })
    if (conteneur.value) checkout.mount(conteneur.value)
  } catch {
    erreur.value = 'Impossible d\'afficher le paiement. Vérifiez votre connexion puis réessayez.'
  } finally {
    chargement.value = false
  }
})

onBeforeUnmount(() => checkout?.destroy())
</script>

<style scoped>
.paiement {
  min-height: 120px;
}
</style>
