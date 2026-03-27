<!-- components/home/HeroSection.vue -->
<template>
  <section class="hero">
    <div class="hero__bg" />
    <div class="hero__pattern" />

    <div class="hero__inner container">
      <!-- Left: content -->
      <div class="hero__content">
        <KodaBadge color="amber" class="fade-in">🐾 La box premium pour votre chien</KodaBadge>

        <h1 class="hero__title fade-in delay-1">
          Le meilleur,<br /><em>chaque mois,</em><br />pour votre chien.
        </h1>

        <p class="hero__desc fade-in delay-2">
          Koda révolutionne la box pour chien avec une double offre : la Box Surprise pour
          découvrir, la Box Personnalisée pour cibler. Calibrée S, M ou L. Zéro gaspillage.
        </p>

        <div class="hero__actions fade-in delay-3">
          <NuxtLink to="/boxes" class="btn btn-primary btn-lg">Découvrir les boxes</NuxtLink>
          <NuxtLink to="/concept" class="btn btn-outline btn-lg">Notre concept</NuxtLink>
        </div>

        <div class="hero__stats fade-in delay-3">
          <div v-for="s in stats" :key="s.label" class="hero__stat">
            <div class="hero__stat-num">{{ s.num }}</div>
            <div class="hero__stat-label">{{ s.label }}</div>
          </div>
        </div>
      </div>

      <!-- Right: visual -->
      <div class="hero__visual" aria-hidden="true">
        <div class="hero__box-wrap">
          <div class="hero__box">
            <span class="hero__box-emoji">🐕</span>
          </div>
          <div class="hero__badge hero__badge--top">Box<br />Surprise</div>
          <div class="hero__badge hero__badge--bot">À la<br />Carte</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const stats = [
  { num: '3',  label: 'Tailles disponibles' },
  { num: '5+', label: 'Produits par box' },
  { num: '0',  label: 'Plastique superflu' },
]
</script>

<style scoped>
.hero {
  position: relative; overflow: hidden;
  min-height: calc(100vh - 72px);
  display: flex; align-items: center;
}
.hero__bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 80% 60% at 70% 50%, #E8CFA0 0%, var(--cream) 70%);
}
.hero__pattern {
  position: absolute; inset: 0; opacity: .06;
  background-image: radial-gradient(var(--bark) 1.5px, transparent 1.5px);
  background-size: 28px 28px;
}
.hero__inner {
  position: relative; z-index: 2;
  display: grid; grid-template-columns: 1fr 1fr;
  align-items: center; gap: 4rem;
  padding-top: 4rem; padding-bottom: 4rem;
  width: 100%;
}
.hero__title {
  font-size: clamp(2.8rem, 5vw, 5rem);
  font-weight: 900; line-height: 1.05;
  color: var(--dark); margin: 1.2rem 0 1.4rem;
}
.hero__title em { color: var(--amber); font-style: italic; }
.hero__desc {
  font-size: 1.05rem; color: var(--muted); line-height: 1.7;
  max-width: 460px; margin-bottom: 2.4rem;
}
.hero__actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2.8rem; }
.hero__stats {
  display: flex; gap: 2.5rem;
  padding-top: 2rem; border-top: 1px solid var(--warm);
}
.hero__stat-num {
  font-family: 'Playfair Display', serif;
  font-size: 2rem; font-weight: 900; color: var(--bark); line-height: 1;
}
.hero__stat-label {
  font-size: .75rem; color: var(--muted); margin-top: .2rem;
  text-transform: uppercase; letter-spacing: .05em;
}

/* Visual */
.hero__visual {
  display: flex; justify-content: center; align-items: center;
}
.hero__box-wrap {
  position: relative; width: 400px; height: 400px;
}
.hero__box {
  width: 280px; height: 280px;
  background: var(--bark); border-radius: 28px;
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%,-50%) rotate(-8deg);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 12px 20px 60px rgba(74,55,40,.3);
  animation: floatBox 5s ease-in-out infinite;
}
.hero__box-emoji { font-size: 5rem; }
@keyframes floatBox {
  0%,100% { transform: translate(-50%,-50%) rotate(-8deg) translateY(0); }
  50%      { transform: translate(-50%,-50%) rotate(-8deg) translateY(-14px); }
}
.hero__badge {
  position: absolute;
  background: var(--amber); border-radius: 50%;
  width: 84px; height: 84px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Playfair Display', serif; font-weight: 700;
  color: var(--dark); text-align: center; font-size: .7rem; line-height: 1.3;
  padding: 8px;
}
.hero__badge--top { top: 24px; right: 24px; }
.hero__badge--bot { bottom: 40px; left: 20px; }

@media (max-width: 900px) {
  .hero__inner { grid-template-columns: 1fr; }
  .hero__visual { display: none; }
}
</style>
