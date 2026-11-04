<!-- components/home/HeroSection.vue -->
<template>
  <section class="hero">
    <div class="hero__bg">
      <div class="hero__blob-1" />
      <div class="hero__blob-2" />
    </div>

    <div class="hero__inner container">
      <div class="hero__content">
        <div class="hero__eyebrow fade-in">
          <span class="hero__paw-icon">🐾</span>
          La box conçue pour les yeux de votre chien
        </div>

        <h1 class="hero__title fade-in delay-1">
          La box qui<br />
          <em>parle à votre<br />chien.</em>
        </h1>

        <p class="hero__desc fade-in delay-2">
          Bleu et jaune — les deux couleurs que votre chien peut vraiment voir.
          Nos produits sont sélectionnés pour stimuler ses sens, pas juste les vôtres.
        </p>

        <div class="hero__actions fade-in delay-3">
          <NuxtLink to="/abonnement" class="btn btn-yellow btn-xl">
            Commencer l'aventure 🐾
          </NuxtLink>
          <NuxtLink to="/boxes" class="btn btn-outline btn-xl">
            Voir les boxes
          </NuxtLink>
        </div>

        <div class="hero__badges fade-in delay-4">
          <span v-for="b in badges" :key="b.label" class="hero__badge">
            <span>{{ b.icon }}</span>{{ b.label }}
          </span>
        </div>
      </div>

      <div class="hero__visual" aria-hidden="true">
        <div class="hero__card-wrap">
          <div class="hero__card hero__card--main">
            <div class="hero__card-emoji">🐕</div>
            <div class="hero__card-title">Box du mois</div>
            <div class="hero__card-dots">
              <span class="dot dot-blue" /><span class="dot dot-yellow" /><span class="dot dot-blue" />
            </div>
          </div>
          <div class="hero__float hero__float--a">🎁 Surprise</div>
          <div class="hero__float hero__float--b">♻️ Éco</div>
          <div class="hero__float hero__float--c">⭐ 4,9/5</div>
          <div class="hero__sizes">
            <span v-for="t in ['XS','S','M','L']" :key="t"
              :class="['hero__sz', `hero__sz--${t.toLowerCase()}`]">{{ t }}</span>
          </div>
        </div>
      </div>
    </div>

    <svg class="hero__wave" viewBox="0 0 1440 56" preserveAspectRatio="none" fill="none">
      <path d="M0,28 C480,56 960,0 1440,28 L1440,56 L0,56 Z" fill="#F7F9FC"/>
    </svg>
  </section>
</template>

<script setup lang="ts">
const badges = [
  { icon: '📏', label: '4 tailles XS→L' },
  { icon: '🌱', label: 'Zéro plastique' },
  { icon: '🔄', label: 'Résiliable' },
  { icon: '🚚', label: 'Livraison offerte' },
]
</script>

<style scoped>
.hero {
  position: relative; overflow: hidden; min-height: 100vh;
  background: linear-gradient(145deg, #E8F1FC 0%, #F0F6FF 35%, #FEFCE8 70%, #FFF8D6 100%);
  display: flex; flex-direction: column;
}
.hero__bg { position: absolute; inset: 0; pointer-events: none; }
.hero__blob-1 {
  position: absolute; width: 600px; height: 600px;
  top: -150px; right: -100px; border-radius: 50%;
  background: radial-gradient(circle, rgba(49,130,206,.12) 0%, transparent 70%);
}
.hero__blob-2 {
  position: absolute; width: 450px; height: 450px;
  bottom: -50px; left: -80px; border-radius: 50%;
  background: radial-gradient(circle, rgba(246,201,14,.14) 0%, transparent 70%);
}

.hero__inner {
  position: relative; z-index: 2;
  display: grid; grid-template-columns: 1fr 1fr;
  align-items: center; gap: 4rem;
  padding-top: 8rem; padding-bottom: 5rem; flex: 1;
}

.hero__eyebrow {
  display: inline-flex; align-items: center; gap: .55rem;
  background: white; border: 1.5px solid var(--brume);
  border-radius: var(--r-full); padding: .5rem 1.1rem;
  font-size: .82rem; font-weight: 600; color: var(--ardoise);
  margin-bottom: 1.5rem; box-shadow: var(--shadow-sm);
}
.hero__paw-icon { animation: wiggle 2s ease-in-out infinite; }

.hero__title {
  font-family: var(--font-display);
  font-size: clamp(3rem, 5.5vw, 5rem);
  font-weight: 900; color: var(--nuit);
  line-height: 1.0; margin-bottom: 1.5rem;
}
.hero__title em { color: var(--bleu-vif); font-style: italic; }

.hero__desc {
  font-size: 1.05rem; color: var(--muted);
  line-height: 1.75; max-width: 480px; margin-bottom: 2.5rem;
}

.hero__actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2.5rem; }

.hero__badges {
  display: flex; flex-wrap: wrap; gap: .6rem;
  padding-top: 2rem; border-top: 1.5px solid var(--brume);
}
.hero__badge {
  display: flex; align-items: center; gap: .4rem;
  background: white; border: 1.5px solid var(--brume);
  border-radius: var(--r-full); padding: .35rem .9rem;
  font-size: .8rem; font-weight: 500; color: var(--ardoise);
}

/* Visuel */
.hero__visual { display: flex; justify-content: center; align-items: center; }
.hero__card-wrap { position: relative; width: 360px; height: 400px; }

.hero__card {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%) rotate(-8deg);
  border-radius: 32px; padding: 2.5rem;
  display: flex; flex-direction: column; align-items: center; gap: .8rem;
  box-shadow: var(--shadow-xl);
}
.hero__card--main {
  background: linear-gradient(145deg, var(--bleu), var(--nuit));
  width: 240px; height: 240px;
  animation: float 5s ease-in-out infinite;
}
.hero__card-emoji { font-size: 4.5rem; }
.hero__card-title { font-family: var(--font-display); font-size: .9rem; font-weight: 700; color: rgba(255,255,255,.7); letter-spacing: .04em; }
.hero__card-dots { display: flex; gap: .4rem; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot-blue   { background: var(--jaune-vif); }
.dot-yellow { background: rgba(255,255,255,.4); }

.hero__float {
  position: absolute; background: white;
  border: 1.5px solid var(--brume); border-radius: var(--r-lg);
  padding: .5rem 1rem; font-size: .82rem; font-weight: 600;
  color: var(--nuit); box-shadow: var(--shadow-md);
}
.hero__float--a { top: 24px; right: 16px; animation: float 4s ease-in-out infinite .5s; }
.hero__float--b { bottom: 70px; left: 8px;  animation: float 4.5s ease-in-out infinite 1s; }
.hero__float--c { top: 52%;   right: -4px;  animation: float 3.8s ease-in-out infinite .3s; }

.hero__sizes {
  position: absolute; bottom: 24px; right: 16px;
  display: flex; gap: .35rem;
}
.hero__sz {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: .75rem; font-weight: 900;
  box-shadow: var(--shadow-sm); border: 2px solid;
}
.hero__sz--xs { background: var(--lilas-pale); color: var(--lilas); border-color: var(--lilas); }
.hero__sz--s  { background: var(--jaune-pale); color: #7A5200; border-color: var(--jaune); }
.hero__sz--m  { background: var(--menthe-pale); color: var(--menthe); border-color: var(--menthe); }
.hero__sz--l  { background: var(--bleu-pale); color: var(--bleu); border-color: var(--bleu); }

.hero__wave { position: absolute; bottom: 0; left: 0; right: 0; width: 100%; display: block; }

@media (max-width: 900px) {
  .hero__inner { grid-template-columns: 1fr; padding-top: 6rem; }
  .hero__visual { display: none; }
}
</style>
