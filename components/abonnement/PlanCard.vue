<!-- components/abonnement/PlanCard.vue -->
<template>
  <div :class="['plan-card', { 'plan-card--featured': featured }]">
    <div v-if="featured" class="plan-card__badge">⭐ Populaire</div>
    <div class="plan-card__name">{{ plan.nom }}</div>
    <div class="plan-card__sub">{{ plan.sub }}</div>
    <div class="plan-card__price">À partir de<br />{{ plan.prixFrom }}</div>
    <div class="plan-card__period">par mois selon la taille</div>
    <ul class="plan-card__features">
      <li v-for="f in plan.features" :key="f">{{ f }}</li>
    </ul>
    <button
      :class="['btn btn-full', featured ? 'btn-amber' : 'btn-outline']"
      @click="handleCommander"
    >
      Commander
    </button>
  </div>
</template>

<script setup lang="ts">
interface Plan {
  nom: string; sub: string; prixFrom: string; features: string[]
}
defineProps<{ plan: Plan; featured?: boolean }>()

const { isLoggedIn, user } = useAuth()
const router = useRouter()
const { error: toastError, info: toastInfo } = useToast()

function handleCommander() {
  if (!isLoggedIn.value) {
    toastInfo('Connectez-vous pour commander 🐾')
    router.push('/connexion?redirect=/abonnement')
    return
  }
  // Vérifier adresse complète
  if (!user.value?.adresse || !user.value?.ville || !user.value?.codePostal) {
    toastError('Complétez votre adresse de livraison dans votre profil avant de commander.')
    router.push('/profil')
    return
  }
  router.push('/contact')
}
</script>

<style scoped>
.plan-card {
  border-radius: 28px; padding: 2.5rem;
  border: 1.5px solid var(--warm); background: white;
  position: relative;
  transition: transform .25s, box-shadow .25s;
}
.plan-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
.plan-card--featured {
  background: var(--bark); border-color: var(--bark);
  transform: scale(1.03);
}
.plan-card--featured:hover { transform: scale(1.03) translateY(-5px); }

.plan-card__badge {
  position: absolute; top: -13px; left: 50%; transform: translateX(-50%);
  background: var(--amber); color: var(--dark);
  padding: .28rem .9rem; border-radius: 40px;
  font-size: .72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .07em;
}
.plan-card__name {
  font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700;
  margin-bottom: .4rem; color: var(--dark);
}
.plan-card--featured .plan-card__name { color: var(--cream); }
.plan-card__sub { font-size: .85rem; color: var(--muted); margin-bottom: 1.5rem; }
.plan-card--featured .plan-card__sub { color: rgba(245,239,224,.6); }
.plan-card__price {
  font-family: 'Playfair Display', serif;
  font-size: 2.2rem; font-weight: 900;
  color: var(--bark); line-height: 1.15; margin-bottom: .3rem;
}
.plan-card--featured .plan-card__price { color: var(--amber); }
.plan-card__period { font-size: .82rem; color: var(--muted); margin-bottom: 2rem; }
.plan-card--featured .plan-card__period { color: rgba(245,239,224,.5); }
.plan-card__features { list-style: none; margin-bottom: 2rem; }
.plan-card__features li {
  display: flex; align-items: flex-start; gap: .6rem;
  font-size: .9rem; padding: .5rem 0;
  border-bottom: 1px solid var(--cream); color: var(--muted);
}
.plan-card__features li::before { content: '✓'; color: var(--sage); font-weight: 700; flex-shrink: 0; }
.plan-card--featured .plan-card__features li {
  border-bottom-color: rgba(245,239,224,.1); color: rgba(245,239,224,.8);
}
.plan-card--featured .plan-card__features li::before { color: var(--amber); }
</style>
