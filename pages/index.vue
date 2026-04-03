<!-- pages/index.vue -->
<template>
  <div class="home">

    <!-- ═══════════════════════════════════════
         HERO
    ═══════════════════════════════════════ -->
    <section class="hero">
      <!-- Arrière-plan dégradé -->
      <div class="hero__bg" />

      <div class="hero__container container">

        <!-- Colonne gauche : texte -->
        <div class="hero__left">

          <!-- Eyebrow pill -->
          <div class="hero__pill fade-in">
            <img src="/images/dawky-picto.png" alt="" class="hero__pill-picto" />
            La box pensée pour les yeux de votre chien
          </div>

          <!-- Titre -->
          <h1 class="hero__title fade-in delay-1">
            La box qui<br />parle à<br />
            <span class="hero__title-accent">votre chien.</span>
          </h1>

          <!-- Sous-titre -->
          <p class="hero__desc fade-in delay-2">
            Bleu et jaune — les deux couleurs que les chiens voient vraiment.
            Contenu adapté à chaque gabarit : XS, S, M, L.
          </p>

          <!-- CTAs -->
          <div class="hero__ctas fade-in delay-3">
            <NuxtLink to="/abonnement" class="btn btn-yellow btn-xl">
              Commencer l'aventure
            </NuxtLink>
            <NuxtLink to="/boxes" class="btn btn-outline btn-xl">
              Voir les boxes
            </NuxtLink>
          </div>

          <!-- Trust badges -->
          <div class="hero__trust fade-in delay-4">
            <div v-for="b in trust" :key="b" class="hero__trust-item">{{ b }}</div>
          </div>
        </div>

        <!-- Colonne droite : visuel -->
        <div class="hero__right" aria-hidden="true">

          <!-- Grande carte box -->
          <div class="hero__box-card">
            <div class="hero__box-top">
              <img src="/images/dawky-picto.png" alt="" class="hero__box-logo" />
              <span class="hero__box-mois">Box du mois 🐾</span>
            </div>
            <div class="hero__box-sizes">
              <span class="hero__sz hero__sz--xs">XS</span>
              <span class="hero__sz hero__sz--s">S</span>
              <span class="hero__sz hero__sz--m">M</span>
              <span class="hero__sz hero__sz--l">L</span>
            </div>
            <div class="hero__box-tag">Un prix · Quatre gabarits</div>
          </div>

          <!-- Badges flottants -->
          <div class="hero__badge-float hero__badge-float--1">🎁 Surprise mensuelle</div>
          <div class="hero__badge-float hero__badge-float--2">🌱 Zéro plastique</div>
          <div class="hero__badge-float hero__badge-float--3">♻️ Invendus recyclés</div>
        </div>
      </div>

      <!-- Vague de transition -->
      <svg class="hero__wave" viewBox="0 0 1440 60" preserveAspectRatio="none">
        <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,15 1440,30 L1440,60 L0,60 Z"
              fill="var(--nuit)" />
      </svg>
    </section>

    <!-- ═══════════════════════════════════════
         BAND — Valeurs
    ═══════════════════════════════════════ -->
    <section class="values-band">
      <div class="container values-band__inner">
        <div v-for="v in values" :key="v.label" class="values-band__item">
          <span class="values-band__icon">{{ v.icon }}</span>
          <div>
            <strong>{{ v.label }}</strong>
            <span>{{ v.sub }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════
         SECTION — Pourquoi Dawky
    ═══════════════════════════════════════ -->
    <section class="why section-pad">
      <div class="container">
        <div class="why__inner">
          <!-- Visuel gauche -->
          <div class="why__visual">
            <div class="why__logo-wrap">
              <img src="/images/dawky-logo.png" alt="DAWKY" class="why__logo" />
              <p class="why__logo-sub">La box aux couleurs du chien</p>
            </div>
            <div class="why__colors">
              <div class="why__color why__color--bleu">
                <span>Bleu</span>
                <small>Vue conique S (~450nm)</small>
              </div>
              <div class="why__color why__color--jaune">
                <span>Jaune</span>
                <small>Vue conique M (~560nm)</small>
              </div>
            </div>
          </div>

          <!-- Texte droite -->
          <div class="why__text">
            <p class="section-tag">Notre philosophie</p>
            <h2 class="section-title">
              Conçu pour<br />
              <em>leurs yeux.</em>
            </h2>
            <p class="section-desc" style="max-width:none">
              Les chiens sont dichromates — ils ne voient que le bleu et le jaune.
              Nos jouets, nos packagings, nos couleurs de marque : tout est pensé
              pour stimuler leurs sens, pas les vôtres.
            </p>
            <div class="why__points">
              <div v-for="p in points" :key="p.title" class="why__point">
                <span class="why__point-icon">{{ p.icon }}</span>
                <div>
                  <strong>{{ p.title }}</strong>
                  <p>{{ p.desc }}</p>
                </div>
              </div>
            </div>
            <NuxtLink to="/concept" class="btn btn-outline" style="margin-top:1.5rem">
              Notre concept →
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════
         SECTION — Comment ça marche
    ═══════════════════════════════════════ -->
    <section class="hiw section-pad" style="background:var(--nuage)">
      <div class="container">
        <div style="text-align:center;margin-bottom:3.5rem">
          <p class="section-tag">Comment ça marche</p>
          <h2 class="section-title">Simple comme <em>bonjour</em> 🐾</h2>
        </div>

        <div class="hiw__grid">
          <div v-for="(step, i) in steps" :key="step.num" class="hiw__step">
            <!-- Connecteur entre étapes -->
            <div v-if="i < steps.length - 1" class="hiw__connector" />

            <div class="hiw__circle" :style="{ background: step.color }">
              {{ step.emoji }}
            </div>
            <div class="hiw__num">Étape {{ step.num }}</div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════
         SECTION — Les gabarits
    ═══════════════════════════════════════ -->
    <section class="tailles section-pad">
      <div class="container">
        <div style="text-align:center;margin-bottom:3.5rem">
          <p class="section-tag">Nos 4 gabarits</p>
          <h2 class="section-title">
            Du Yorkshire<br />au Saint-Bernard — <em>même prix.</em>
          </h2>
          <p class="section-desc" style="margin:0 auto">
            Un seul tarif pour tous. Le contenu s'adapte à la taille de votre chien,
            pas l'inverse.
          </p>
        </div>

        <div class="tailles__grid">
          <div v-for="t in tailles" :key="t.code" class="taille-card">
            <div class="taille-card__head" :style="{ background: t.bg, borderColor: t.color }">
              <span class="taille-card__letter" :style="{ color: t.color }">{{ t.code }}</span>
              <span class="taille-card__poids">{{ t.poids }}</span>
            </div>
            <div class="taille-card__body">
              <p class="taille-card__race">{{ t.exemples }}</p>
              <ul class="taille-card__items">
                <li v-for="item in t.contenu" :key="item">{{ item }}</li>
              </ul>
            </div>
            <div class="taille-card__footer">= même valeur ✓</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════
         CTA BAND
    ═══════════════════════════════════════ -->
    <section class="cta-band">
      <div class="container cta-band__inner">
        <div class="cta-band__text">
          <h2>Prêt à gâter<br /><em>votre chien ?</em></h2>
          <p>Livraison offerte · Résiliable à tout moment</p>
        </div>
        <div class="cta-band__actions">
          <NuxtLink to="/abonnement" class="btn btn-yellow btn-xl">
            Commencer l'aventure
          </NuxtLink>
          <NuxtLink to="/boxes" class="btn btn-outline-yellow btn-xl">
            Voir les formules
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════
         NEWSLETTER
    ═══════════════════════════════════════ -->
    <NewsletterBand />
    <KodaToast />
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'DAWKY — La Box Premium pour Chiens',
  description: 'Dawky : la box pour chiens aux couleurs que les chiens voient vraiment. Bleu & jaune, tailles XS/S/M/L, un seul prix.',
})

const trust = [
  '📏 4 tailles XS → L',
  '🌱 Zéro plastique',
  '🔄 Résiliable à tout moment',
  '🚚 Livraison offerte',
]

const values = [
  { icon: '🎨', label: 'Bleu & Jaune', sub: 'Les couleurs du chien' },
  { icon: '📏', label: 'XS, S, M, L',  sub: 'Du Chihuahua au Saint-Bernard' },
  { icon: '♻️', label: 'Invendus recyclés', sub: 'Rien ne se perd chez Dawky' },
  { icon: '🔄', label: 'Résiliable',    sub: 'Sans engagement minimal' },
]

const points = [
  { icon: '🔵', title: 'Jouets bleus & jaunes',    desc: 'Nos jouets sont conçus dans les teintes que votre chien perçoit vraiment.' },
  { icon: '📦', title: 'Packaging stimulant',       desc: 'Le carton, les étiquettes, les couleurs — tout est pensé pour exciter votre chien.' },
  { icon: '🧪', title: 'Sélection vétérinaire',     desc: 'Chaque produit est validé pour la sécurité et l\'enrichissement sensoriel.' },
]

const steps = [
  { num: 1, emoji: '📏', color: 'linear-gradient(135deg,#F6C90E,#D4A017)', title: 'Choisissez votre gabarit', desc: 'XS ≤ 4 kg · S ≤ 10 kg · M ≤ 25 kg · L > 25 kg. La taille détermine le contenu.' },
  { num: 2, emoji: '🎁', color: 'linear-gradient(135deg,#4299E1,#2B6CB0)', title: 'Sélectionnez votre box',   desc: 'Box Surprise mensuelle ou Box À la Carte avec les invendus. Même prix pour tous les gabarits.' },
  { num: 3, emoji: '🚚', color: 'linear-gradient(135deg,#68B2A0,#4A8A78)', title: 'Recevez et profitez',      desc: 'Livraison offerte dans un packaging éco. Votre chien découvre, joue et mâche !' },
]

const tailles = [
  {
    code: 'XS', poids: '≤ 4 kg', color: '#9B8EC4', bg: '#F0ECF8',
    exemples: 'Yorkshire, Chihuahua, Spitz nain…',
    contenu: ['3 micro-jouets adaptés', '2 sachets friandises mini', '1 micro-mastication', '1 soin coussinets', '1 accessoire mignon'],
  },
  {
    code: 'S', poids: '4 – 10 kg', color: '#D4A017', bg: '#FEFCE8',
    exemples: 'Teckel, Bichon, Jack Russell…',
    contenu: ['2 petits jouets résistants', '2 sachets friandises S', '1 bois mastication S', '1 soin coussinets', '1 accessoire'],
  },
  {
    code: 'M', poids: '10 – 25 kg', color: '#68B2A0', bg: '#E0F4EF',
    exemples: 'Beagle, Cocker, Border Collie…',
    contenu: ['1 jouet robuste M', '2 sachets friandises M', '1 mastication M', '1 soin ou lotion', '1 accessoire'],
  },
  {
    code: 'L', poids: '> 25 kg', color: '#2B6CB0', bg: '#EBF4FF',
    exemples: 'Labrador, Husky, Malinois…',
    contenu: ['1 grand jouet XXL', '1 grand sachet friandises', '1 mastication XXL', '1 kit soin complet', '1 accessoire premium'],
  },
]
</script>

<style scoped>
/* ── Hero ────────────────────────────────────────────────── */
.hero {
  position: relative; overflow: hidden;
  min-height: 100vh; display: flex; flex-direction: column;
  background: linear-gradient(155deg, #EBF4FF 0%, #F7F9FC 40%, #FEFCE8 80%, #FFF8C0 100%);
}
.hero__bg {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 60% 50% at 70% 30%, rgba(49,130,206,.10) 0%, transparent 70%),
    radial-gradient(ellipse 50% 40% at 20% 80%, rgba(246,201,14,.12) 0%, transparent 70%);
}

.hero__container {
  position: relative; z-index: 2;
  display: grid; grid-template-columns: 1fr 1fr;
  align-items: center; gap: 5rem;
  padding-top: 9rem; padding-bottom: 6rem; flex: 1;
}

/* Eyebrow pill */
.hero__pill {
  display: inline-flex; align-items: center; gap: .6rem;
  background: white; border: 1.5px solid var(--brume);
  border-radius: var(--r-full); padding: .5rem 1.1rem;
  font-size: .82rem; font-weight: 600; color: var(--ardoise);
  margin-bottom: 1.6rem; box-shadow: var(--shadow-sm);
}
.hero__pill-picto { height: 22px; width: auto; }

/* Titre */
.hero__title {
  font-family: var(--font-display);
  font-size: clamp(2.8rem, 5.5vw, 5rem);
  font-weight: 900; color: var(--nuit);
  line-height: 1.0; margin-bottom: 1.4rem;
}
.hero__title-accent { color: var(--bleu-vif); font-style: italic; }

.hero__desc {
  font-size: 1.05rem; color: var(--muted);
  line-height: 1.75; max-width: 460px; margin-bottom: 2.5rem;
}

.hero__ctas {
  display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2.5rem;
}

/* Trust */
.hero__trust {
  display: flex; flex-wrap: wrap; gap: .6rem;
  padding-top: 2rem; border-top: 1.5px solid var(--brume);
}
.hero__trust-item {
  background: white; border: 1.5px solid var(--brume);
  border-radius: var(--r-full); padding: .38rem 1rem;
  font-size: .8rem; font-weight: 500; color: var(--ardoise);
  box-shadow: var(--shadow-xs);
}

/* Colonne droite */
.hero__right {
  position: relative; display: flex;
  justify-content: center; align-items: center;
  height: 420px;
}

/* Carte box */
.hero__box-card {
  background: var(--nuit);
  border-radius: 32px; padding: 2.5rem 2.5rem 2rem;
  width: 300px;
  box-shadow: var(--shadow-xl);
  display: flex; flex-direction: column; gap: 1.5rem;
  animation: float 5s ease-in-out infinite;
  border: 3px solid rgba(246,201,14,.2);
  position: relative; z-index: 1;
}
.hero__box-top {
  display: flex; align-items: center; gap: 1rem;
}
.hero__box-logo {
  height: 50px; width: auto;
  /* Sur fond sombre le jaune ressort parfaitement */
}
.hero__box-mois {
  font-family: var(--font-display); font-size: 1rem; font-weight: 700;
  color: rgba(255,255,255,.8);
}
.hero__box-sizes { display: flex; gap: .6rem; }
.hero__sz {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: .82rem; font-weight: 900;
  border: 2.5px solid;
}
.hero__sz--xs { background: #EDE9F8; color: #9B8EC4; border-color: #9B8EC4; }
.hero__sz--s  { background: #FEFCE8; color: #D4A017; border-color: #D4A017; }
.hero__sz--m  { background: #E0F4EF; color: #68B2A0; border-color: #68B2A0; }
.hero__sz--l  { background: #EBF4FF; color: #2B6CB0; border-color: #2B6CB0; }
.hero__box-tag {
  font-size: .78rem; color: rgba(255,255,255,.45);
  text-align: center; letter-spacing: .04em;
}

/* Badges flottants */
.hero__badge-float {
  position: absolute; background: white;
  border: 1.5px solid var(--brume); border-radius: var(--r-lg);
  padding: .55rem 1.1rem; font-size: .82rem; font-weight: 600;
  color: var(--nuit); box-shadow: var(--shadow-md); z-index: 2;
  white-space: nowrap;
}
.hero__badge-float--1 { top: 20px;  right: 10px;  animation: float 4s ease-in-out infinite .5s; }
.hero__badge-float--2 { bottom: 80px; left: 5px;  animation: float 4.5s ease-in-out infinite 1s; }
.hero__badge-float--3 { top: 48%;   right: -10px; animation: float 3.8s ease-in-out infinite .3s; }

/* Vague hero → dark band */
.hero__wave {
  position: absolute; bottom: 0; left: 0; right: 0;
  width: 100%; height: 60px; display: block;
}

/* ── Values band ─────────────────────────────────────────── */
.values-band { background: var(--nuit); padding: 2rem 0; }
.values-band__inner {
  display: flex; gap: 2.5rem; justify-content: center; flex-wrap: wrap;
}
.values-band__item {
  display: flex; align-items: center; gap: .9rem; color: white; min-width: 180px;
}
.values-band__icon {
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(246,201,14,.12);
  border: 1px solid rgba(246,201,14,.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; flex-shrink: 0;
}
.values-band__item strong { display: block; font-size: .9rem; font-weight: 600; margin-bottom: .1rem; }
.values-band__item span   { font-size: .76rem; color: rgba(255,255,255,.45); }

/* ── Section padding ─────────────────────────────────────── */
.section-pad { padding: 6rem 0; }

/* ── Why / Pourquoi Dawky ────────────────────────────────── */
.why__inner {
  display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center;
}
.why__visual { display: flex; flex-direction: column; gap: 2rem; }
.why__logo-wrap {
  background: var(--nuage); border-radius: var(--r-xl);
  padding: 3rem 2.5rem; text-align: center;
  border: 1.5px solid var(--brume);
}
.why__logo { max-width: 280px; margin: 0 auto 1rem; }
.why__logo-sub { font-size: .85rem; color: var(--muted); }
.why__colors { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.why__color {
  border-radius: var(--r-lg); padding: 1.2rem;
  text-align: center; border: 2px solid;
}
.why__color--bleu   { background: #EBF4FF; border-color: var(--bleu); }
.why__color--jaune  { background: #FEFCE8; border-color: var(--jaune); }
.why__color span  { display: block; font-family: var(--font-display); font-size: 1.2rem; font-weight: 900; margin-bottom: .2rem; }
.why__color--bleu  span  { color: var(--bleu); }
.why__color--jaune span  { color: var(--jaune); }
.why__color small { font-size: .72rem; color: var(--muted); }

.why__points { display: flex; flex-direction: column; gap: 1.2rem; margin-top: 2rem; }
.why__point {
  display: flex; gap: 1rem; align-items: flex-start;
  background: var(--nuage); border-radius: var(--r-md);
  padding: 1.1rem 1.3rem; border: 1.5px solid var(--brume);
}
.why__point-icon { font-size: 1.5rem; flex-shrink: 0; }
.why__point strong { display: block; font-size: .92rem; font-weight: 600; margin-bottom: .2rem; }
.why__point p { font-size: .83rem; color: var(--muted); line-height: 1.55; margin: 0; }

/* ── How it works ────────────────────────────────────────── */
.hiw__grid {
  display: grid; grid-template-columns: repeat(3,1fr);
  gap: 2.5rem; position: relative;
}
.hiw__step { text-align: center; position: relative; }
.hiw__connector {
  position: absolute; top: 36px; left: 62%; right: -38%;
  height: 2px; z-index: 0;
  background: repeating-linear-gradient(
    90deg, var(--brume) 0, var(--brume) 6px, transparent 6px, transparent 14px
  );
}
.hiw__circle {
  width: 72px; height: 72px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem; margin: 0 auto 1rem;
  box-shadow: var(--shadow-md); position: relative; z-index: 1;
}
.hiw__num { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--bleu); margin-bottom: .5rem; }
.hiw__step h3 { font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; margin-bottom: .5rem; color: var(--nuit); }
.hiw__step p  { font-size: .88rem; color: var(--muted); line-height: 1.65; }

/* ── Tailles ─────────────────────────────────────────────── */
.tailles__grid {
  display: grid; grid-template-columns: repeat(4,1fr); gap: 1.2rem;
}
.taille-card {
  border-radius: var(--r-lg); overflow: hidden;
  border: 2px solid var(--brume);
  background: var(--blanc);
  transition: transform .22s, box-shadow .22s;
}
.taille-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); }
.taille-card__head {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: .3rem;
  padding: 1.8rem 1rem; border-bottom: 2px solid;
}
.taille-card__letter {
  font-family: var(--font-display); font-size: 3rem; font-weight: 900; line-height: 1;
}
.taille-card__poids {
  font-size: .8rem; font-weight: 600; color: var(--muted);
}
.taille-card__body { padding: 1.2rem 1.3rem; }
.taille-card__race { font-size: .78rem; color: var(--muted); margin-bottom: .8rem; font-style: italic; }
.taille-card__items { list-style: none; display: flex; flex-direction: column; gap: .35rem; }
.taille-card__items li {
  font-size: .82rem; color: var(--text);
  display: flex; align-items: center; gap: .5rem;
  padding-bottom: .35rem; border-bottom: 1px solid var(--brume);
}
.taille-card__items li:last-child { border: none; }
.taille-card__items li::before { content: '·'; color: var(--bleu); font-weight: 900; flex-shrink: 0; }
.taille-card__footer {
  text-align: center; padding: .7rem 1rem;
  font-size: .74rem; font-weight: 700;
  color: var(--menthe); background: var(--menthe-pale);
  border-top: 1px solid var(--brume);
}

/* ── CTA Band ────────────────────────────────────────────── */
.cta-band {
  background: linear-gradient(135deg, var(--bleu) 0%, var(--nuit) 100%);
  padding: 5rem 0; position: relative; overflow: hidden;
}
.cta-band::before {
  content: '🐾 🦴 🐾 🦴 🐾 🦴 🐾 🦴';
  position: absolute; top: 1rem; width: 100%;
  text-align: center; font-size: 1.3rem; opacity: .06;
  letter-spacing: 2.5rem; pointer-events: none;
}
.cta-band__inner {
  display: flex; align-items: center; justify-content: space-between;
  gap: 3rem; flex-wrap: wrap; position: relative; z-index: 1;
}
.cta-band__text h2 {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3.5vw, 2.8rem); font-weight: 900;
  color: white; line-height: 1.1; margin-bottom: .5rem;
}
.cta-band__text h2 em { font-style: italic; color: var(--jaune-vif); }
.cta-band__text p { color: rgba(255,255,255,.65); font-size: 1rem; }
.cta-band__actions { display: flex; gap: 1rem; flex-wrap: wrap; }

/* ── Animations ──────────────────────────────────────────── */
@keyframes float {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-10px); }
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 1100px) {
  .tailles__grid { grid-template-columns: repeat(2,1fr); }
}
@media (max-width: 900px) {
  .hero__container { grid-template-columns: 1fr; padding-top: 7rem; padding-bottom: 4rem; }
  .hero__right { display: none; }
  .why__inner { grid-template-columns: 1fr; }
  .hiw__grid { grid-template-columns: 1fr; }
  .hiw__connector { display: none; }
  .cta-band__inner { flex-direction: column; text-align: center; }
}
@media (max-width: 600px) {
  .tailles__grid { grid-template-columns: 1fr; }
  .hero__ctas { flex-direction: column; }
  .values-band__inner { gap: 1.5rem; justify-content: flex-start; }
}
</style>
