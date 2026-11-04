<!-- pages/abonnement.vue -->
<template>
  <div>

    <!-- ═══════ HERO ═══════ -->
    <section class="abo-hero">
      <div class="abo-hero__bg" />
      <div class="container abo-hero__inner">
        <div class="abo-hero__text">
          <p class="section-tag">Abonnement & Commandes</p>
          <h1 class="section-title">La box qui s'adapte<br /><em style="color:var(--bleu-vif)">à votre chien.</em></h1>
          <p class="section-desc">
            Un seul prix pour tous les gabarits. Le contenu est dimensionné selon la taille de votre chien.
            Petit chien = 2 petits jouets. Grand chien = 1 grand jouet. Même valeur, toujours.
          </p>
          <div class="abo-hero__prix-wrap">
            <div class="prix-pill">
              <span>Box Surprise</span>
              <strong>27,90€<em>/mois</em></strong>
            </div>
            <div class="prix-pill prix-pill--light">
              <span>Box À la Carte</span>
              <strong>24,90€<em>/commande</em></strong>
            </div>
          </div>
          <div class="abo-hero__ctas">
            <a href="#box-surprise" class="btn btn-primary btn-lg">🎁 S'abonner (Surprise)</a>
            <a href="#box-carte"    class="btn btn-outline btn-lg">🛒 Commander (À la Carte)</a>
          </div>
        </div>

        <div class="abo-hero__quiz card" id="quiz">
          <div class="quiz-header">
            <span>🐕</span>
            <div>
              <strong>Quelle box pour votre chien ?</strong>
              <p>Quiz — 2 minutes · Recommandation personnalisée</p>
            </div>
          </div>
          <QuizChien />
        </div>
      </div>
    </section>

    <!-- ═══════ EXPLICATION PRIX UNIQUE ═══════ -->
    <section class="prix-expl">
      <div class="container">
        <p class="section-tag" style="text-align:center">Même prix, contenu adapté</p>
        <h2 class="section-title" style="text-align:center">Voici ce que reçoit chaque chien</h2>
        <div class="taille-cards">
          <div v-for="t in taillesContenu" :key="t.code" class="taille-card">
            <div class="taille-card__top">
              <span class="taille-card__letter">{{ t.code }}</span>
              <span class="taille-card__poids">{{ t.poids }}</span>
            </div>
            <ul>
              <li v-for="item in t.items" :key="item">{{ item }}</li>
            </ul>
            <div class="taille-card__equal">= valeur identique ✓</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════
         BOX SURPRISE — ABONNEMENT MENSUEL
    ═══════════════════════════════════════════════ -->
    <section class="formule-section formule-surprise" id="box-surprise">
      <div class="container formule-inner">
        <div class="formule-info">
          <DawkyBadge color="amber">🎁 Abonnement mensuel</DawkyBadge>
          <h2 class="section-title" style="margin-top:.8rem">Box Surprise</h2>
          <p class="section-desc">
            Chaque mois, nos experts composent une box thématique surprise adaptée à votre chien.
            Engagement 12 mois, <strong>résiliable à tout moment</strong> sans frais.
          </p>
          <div class="formule-prix">27,90€<span>/mois</span></div>
          <ul class="formule-features">
            <li>Sélection surprise mensuelle par nos experts</li>
            <li>Contenu adapté S, M ou L</li>
            <li>Engagement 12 mois — résiliable à tout moment</li>
            <li>Livraison offerte chaque mois 🌱</li>
            <li>Thème exclusif chaque mois</li>
          </ul>
        </div>

        <div class="formule-form card">
          <div v-if="surpriseSuccess" class="order-success">
            <div style="font-size:3rem">🎉</div>
            <h3>Abonnement créé !</h3>
            <p>{{ surpriseSuccess }}</p>
            <NuxtLink to="/profil" class="btn btn-primary" style="margin-top:1.2rem;display:inline-flex">Mon profil →</NuxtLink>
          </div>
          <form v-else @submit.prevent="submitSurprise">
            <h3 class="form-section-title">Choisissez le gabarit</h3>
            <div class="gabarit-btns">
              <button v-for="t in tailles" :key="t.code" type="button"
                :class="['gabarit-btn', { active: surpriseForm.taille === t.code }]"
                @click="surpriseForm.taille = t.code">
                <strong>{{ t.code }}</strong>
                <span>{{ t.poids }}</span>
                <em>{{ t.ex }}</em>
              </button>
            </div>

            <h3 class="form-section-title" style="margin-top:1.5rem">Vos coordonnées</h3>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Prénom *</label><input v-model="surpriseForm.prenom" type="text" class="form-input" required /></div>
              <div class="form-group"><label class="form-label">Nom *</label><input v-model="surpriseForm.nom" type="text" class="form-input" required /></div>
            </div>
            <div class="form-group"><label class="form-label">Email *</label><input v-model="surpriseForm.email" type="email" class="form-input" required /></div>
            <div class="form-group"><label class="form-label">Téléphone</label><input v-model="surpriseForm.telephone" type="tel" class="form-input" /></div>

            <h3 class="form-section-title" style="margin-top:1.2rem">🚚 Livraison</h3>
            <div class="form-group">
              <label class="form-label">Adresse *</label>
              <AdresseAutocomplete v-model="surpriseForm.adresse" placeholder="12 rue des Lilas…" type="housenumber" @select="(s) => { surpriseForm.codePostal = s.codePostal; surpriseForm.ville = s.ville }" />
            </div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Code postal *</label><input v-model="surpriseForm.codePostal" type="text" class="form-input" required @input="fetchVilles(surpriseForm.codePostal, surpriseVilles)" /></div>
              <div class="form-group">
                <label class="form-label">Ville *</label>
                <input v-model="surpriseForm.ville" type="text" class="form-input" required />
                <div v-if="surpriseVilles.length > 1" class="villes-chips">
                  <button v-for="v in surpriseVilles" :key="v" type="button" class="ville-chip" @click="surpriseForm.ville = v; surpriseVilles = []">{{ v }}</button>
                </div>
              </div>
            </div>
            <div class="form-group"><label class="form-label">Pays</label><select v-model="surpriseForm.pays" class="form-select"><option>France</option><option>Belgique</option><option>Suisse</option><option>Luxembourg</option></select></div>

            <label class="consent-check"><input v-model="surpriseForm.cgv" type="checkbox" required />J'accepte les <a href="#">CGV</a> et l'engagement 12 mois résiliable à tout moment</label>
            <div v-if="surpriseError" class="alert alert-error">{{ surpriseError }}</div>
            <button type="submit" class="btn btn-primary btn-full btn-lg" :disabled="surpriseLoading" style="margin-top:1rem">
              <span v-if="surpriseLoading">Traitement…</span>
              <span v-else>S'abonner — 27,90€/mois 🐾</span>
            </button>
          </form>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════
         BOX À LA CARTE — COMMANDE PONCTUELLE
    ═══════════════════════════════════════════════ -->
    <section class="formule-section formule-carte" id="box-carte">
      <div class="container formule-inner">
        <div class="formule-info">
          <DawkyBadge color="sage">🛒 Commande unique</DawkyBadge>
          <h2 class="section-title" style="margin-top:.8rem">Box À la Carte</h2>
          <p class="section-desc">
            Pas d'abonnement, pas d'engagement. Composez votre box uniquement avec les
            <strong>produits invendus</strong> des mois précédents — des articles de qualité
            à prix réduit, parfaits pour les besoins spécifiques de votre chien.
          </p>
          <div class="formule-prix formule-prix--sage">24,90€<span>/commande</span></div>
          <ul class="formule-features">
            <li>Uniquement les produits invendus ♻️</li>
            <li>Aucun engagement — achat unique</li>
            <li>Idéal pour les allergies ou besoins précis</li>
            <li>Livraison offerte 🌱</li>
            <li>Renouvelable quand vous voulez</li>
          </ul>
          <div class="carte-note">
            ♻️ Ces produits proviennent des box Surprise des mois précédents. Rien ne se perd chez Dawky !
          </div>
        </div>

        <div class="formule-form card">
          <div v-if="carteSuccess" class="order-success">
            <div style="font-size:3rem">🎉</div>
            <h3>Commande confirmée !</h3>
            <p>{{ carteSuccess }}</p>
            <NuxtLink to="/profil" class="btn btn-primary" style="margin-top:1.2rem;display:inline-flex">Mon profil →</NuxtLink>
          </div>
          <form v-else @submit.prevent="submitCarte">
            <h3 class="form-section-title">Gabarit de votre chien</h3>
            <div class="gabarit-btns">
              <button v-for="t in tailles" :key="t.code" type="button"
                :class="['gabarit-btn gabarit-btn--sage', { active: carteForm.taille === t.code }]"
                @click="carteForm.taille = t.code">
                <strong>{{ t.code }}</strong>
                <span>{{ t.poids }}</span>
                <em>{{ t.ex }}</em>
              </button>
            </div>

            <!-- Sélection des produits -->
            <h3 class="form-section-title" style="margin-top:1.5rem">
              Vos produits <span class="slots-counter">{{ carteForm.produits.length }}/5</span>
            </h3>
            <ProduitsProduitCard
              v-if="false"
              :produit="{ id:'', nom:'', description:'', emoji:'', categorie:'JOUET', tailles:[], stock:0 }"
            />
            <div class="produits-picker">
              <DawkySpinner v-if="produitsLoading" />
              <div v-else>
                <div class="picker-filters">
                  <button v-for="f in catFilters" :key="String(f.value)" type="button"
                    :class="['filter-btn', { 'filter-btn--active': pickerCat === f.value }]"
                    @click="pickerCat = f.value">{{ f.label }}</button>
                </div>
                <div class="picker-grid">
                  <div
                    v-for="p in filteredProduits"
                    :key="p.id"
                    :class="['picker-item', { selected: carteForm.produits.includes(p.id), disabled: !carteForm.produits.includes(p.id) && carteForm.produits.length >= 5 }]"
                    @click="toggleProduit(p.id)"
                  >
                    <span class="picker-item__emoji">{{ p.emoji }}</span>
                    <span class="picker-item__nom">{{ p.nom }}</span>
                    <span v-if="carteForm.produits.includes(p.id)" class="picker-item__check">✓</span>
                  </div>
                </div>
              </div>
            </div>

            <h3 class="form-section-title" style="margin-top:1.5rem">Vos coordonnées</h3>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Prénom *</label><input v-model="carteForm.prenom" type="text" class="form-input" required /></div>
              <div class="form-group"><label class="form-label">Nom *</label><input v-model="carteForm.nom" type="text" class="form-input" required /></div>
            </div>
            <div class="form-group"><label class="form-label">Email *</label><input v-model="carteForm.email" type="email" class="form-input" required /></div>

            <h3 class="form-section-title" style="margin-top:1.2rem">🚚 Livraison</h3>
            <div class="form-group">
              <label class="form-label">Adresse *</label>
              <AdresseAutocomplete v-model="carteForm.adresse" placeholder="12 rue des Lilas…" type="housenumber" @select="(s) => { carteForm.codePostal = s.codePostal; carteForm.ville = s.ville }" />
            </div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Code postal *</label><input v-model="carteForm.codePostal" type="text" class="form-input" required @input="fetchVilles(carteForm.codePostal, carteVilles)" /></div>
              <div class="form-group">
                <label class="form-label">Ville *</label>
                <input v-model="carteForm.ville" type="text" class="form-input" required />
                <div v-if="carteVilles.length > 1" class="villes-chips">
                  <button v-for="v in carteVilles" :key="v" type="button" class="ville-chip" @click="carteForm.ville = v; carteVilles = []">{{ v }}</button>
                </div>
              </div>
            </div>

            <div v-if="carteError" class="alert alert-error">{{ carteError }}</div>
            <button type="submit" class="btn btn-full btn-lg" style="margin-top:1rem;background:var(--menthe);color:white"
              :disabled="carteLoading || carteForm.produits.length === 0">
              <span v-if="carteLoading">Traitement…</span>
              <span v-else>Commander — 24,90€ 🐾</span>
            </button>
          </form>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="container faq-section">
      <div style="text-align:center;margin-bottom:3rem">
        <p class="section-tag">FAQ</p>
        <h2 class="section-title">Questions fréquentes</h2>
      </div>
      <div class="faq-list">
        <FaqItem v-for="faq in faqs" :key="faq.q" :question="faq.q" :answer="faq.a" />
      </div>
    </section>

    <NewsletterBand />
    <DawkyToast />
  </div>
</template>

<script setup lang="ts">
import { submitAbonnement, submitCommande, useProduits } from '~/composables/useApi'

useSeoMeta({ title: 'Abonnement & Commandes — DAWKY' })

const { user, isLoggedIn } = useAuth()
const { error: toastError } = useToast()

// ─── Tailles ───
const tailles = [
  { code: 'XS' as const, poids: '≤ 5 kg',   ex: 'Chihuahua, Spitz nain…' },
  { code: 'S'  as const, poids: '5–10 kg',  ex: 'Yorkshire, Bichon…' },
  { code: 'M'  as const, poids: '10–25 kg', ex: 'Beagle, Cocker…' },
  { code: 'L'  as const, poids: '> 25 kg',  ex: 'Labrador, Husky…' },
]

const taillesContenu = [
  { code: 'XS', poids: 'jusqu\'à 5 kg', items: ['2 jouets ultra-légers', '1 sachet friandises XS', '1 bâton mastication XS', '1 soin coussinets mini', '1 accessoire mignon'] },
  { code: 'S', poids: '5 à 10 kg', items: ['2 petits jouets résistants', '2 sachets friandises mini', '1 bâton mastication S', '1 soin coussinets', '1 accessoire'] },
  { code: 'M', poids: '10 à 25 kg',     items: ['1 jouet robuste M', '2 sachets friandises', '1 mastication M', '1 soin ou lotion', '1 accessoire'] },
  { code: 'L', poids: 'plus de 25 kg',  items: ['1 grand jouet XXL', '1 grand sachet friandises', '1 mastication XXL', '1 kit soin complet', '1 accessoire premium'] },
]

// ─── Helper: fetch villes depuis code postal ───
let cpTimers: Record<string, ReturnType<typeof setTimeout>> = {}
async function fetchVilles(cp: string, target: Ref<string[]> | string[]) {
  const arr = Array.isArray(target) ? target : target
  const key = cp
  if (cpTimers[key]) clearTimeout(cpTimers[key])
  if (cp.replace(/\s/g, '').length < 4) { if (Array.isArray(arr)) arr.splice(0); return }
  cpTimers[key] = setTimeout(async () => {
    try {
      const res = await $fetch<any[]>('/api/geo/adresse', { params: { q: cp, type: 'municipality', limit: '6' } })
      const villes = [...new Set(res.map((r: any) => r.ville))] as string[]
      if (Array.isArray(arr)) { arr.splice(0, arr.length, ...villes); if (villes.length === 1 && Array.isArray(arr)) {} }
    } catch { /**/ }
  }, 300)
}

// ─── SURPRISE form ───
const surpriseForm = reactive({
  prenom: user.value?.prenom ?? '', nom: user.value?.nom ?? '',
  email: user.value?.email ?? '', telephone: user.value?.telephone ?? '',
  adresse: user.value?.adresse ?? '', ville: user.value?.ville ?? '',
  codePostal: user.value?.codePostal ?? '', pays: user.value?.pays ?? 'France',
  taille: 'S' as 'XS' | 'S' | 'M' | 'L', cgv: false,
})
const surpriseVilles  = ref<string[]>([])
const surpriseLoading = ref(false)
const surpriseError   = ref('')
const surpriseSuccess = ref('')

watch(user, u => { if (!u) return; Object.assign(surpriseForm, { prenom: u.prenom ?? '', nom: u.nom ?? '', email: u.email ?? '', telephone: u.telephone ?? '', adresse: u.adresse ?? '', ville: u.ville ?? '', codePostal: u.codePostal ?? '', pays: u.pays ?? 'France' }) })

async function submitSurprise() {
  if (!isLoggedIn.value) { toastError('Connectez-vous pour vous abonner 🐾'); navigateTo('/connexion?redirect=/abonnement#box-surprise'); return }
  surpriseLoading.value = true; surpriseError.value = ''
  try {
    const res = await submitAbonnement({ ...surpriseForm, clientId: user.value?.id })
    surpriseSuccess.value = (res as any).message
  } catch (e: any) {
    surpriseError.value = e?.data?.statusMessage ?? 'Erreur lors de la souscription'
  } finally { surpriseLoading.value = false }
}

// ─── CARTE form ───
const carteForm = reactive({
  prenom: user.value?.prenom ?? '', nom: user.value?.nom ?? '',
  email: user.value?.email ?? '',
  adresse: user.value?.adresse ?? '', ville: user.value?.ville ?? '',
  codePostal: user.value?.codePostal ?? '', pays: user.value?.pays ?? 'France',
  taille: 'S' as 'XS' | 'S' | 'M' | 'L',
  produits: [] as string[],
})
const carteVilles  = ref<string[]>([])
const carteLoading = ref(false)
const carteError   = ref('')
const carteSuccess = ref('')

// Box À la Carte = UNIQUEMENT les produits invendus
// Ce sont les surplus des box Surprise des mois précédents
const pickerCat = ref<string | undefined>(undefined)

const queryInvendus = computed(() => ({
  ...(pickerCat.value ? { categorie: pickerCat.value } : {}),
  invendus: 'true',
  limit: '50',
}))

const { data: produitsInvendusData, pending: produitsLoading } = useProduits(queryInvendus)

const allProduits = computed(() => produitsInvendusData.value?.data?.produits ?? [])

const filteredProduits = computed(() =>
  allProduits.value.filter(p => p.tailles.some(t => t.taille === carteForm.taille))
)

const catFilters = [
  { value: undefined, label: 'Tous' },
  { value: 'MASTICATION', label: '🦌' },
  { value: 'NUTRITION',   label: '🍖' },
  { value: 'JOUET',       label: '🎾' },
  { value: 'SOIN',        label: '🧴' },
  { value: 'ACCESSOIRE',  label: '🎀' },
]

function toggleProduit(id: string) {
  const idx = carteForm.produits.indexOf(id)
  if (idx !== -1) { carteForm.produits.splice(idx, 1) }
  else if (carteForm.produits.length < 5) { carteForm.produits.push(id) }
}

async function submitCarte() {
  if (!isLoggedIn.value) { toastError('Connectez-vous pour commander 🐾'); navigateTo('/connexion?redirect=/abonnement#box-carte'); return }
  if (!carteForm.produits.length) { carteError.value = 'Sélectionnez au moins 1 produit'; return }
  carteLoading.value = true; carteError.value = ''
  try {
    const res = await submitCommande({ ...carteForm, selectionProduitIds: carteForm.produits, clientId: user.value?.id })
    carteSuccess.value = (res as any).message
  } catch (e: any) {
    carteError.value = e?.data?.statusMessage ?? 'Erreur lors de la commande'
  } finally { carteLoading.value = false }
}

const faqs = [
  { q: 'Quelle différence entre l\'abonnement et la commande ?',  a: 'L\'abonnement Box Surprise est mensuel et récurrent (12 mois résiliable). La Box À la Carte est une commande ponctuelle sans engagement — vous payez une fois, vous recevez une box.' },
  { q: 'Pourquoi un seul prix pour S, M et L ?',                   a: 'Le poids total de la box est identique. Pour un petit chien, on inclut 2 petits jouets plutôt qu\'un grand. La valeur des produits reste la même.' },
  { q: 'Comment résilier l\'abonnement Surprise ?',                a: 'Depuis votre espace client → Mes abonnements → Résilier. Immédiat, sans frais.' },
  { q: 'Puis-je passer d\'abonnement à commande ponctuelle ?',     a: 'Bien sûr ! Résiliez votre abonnement et commandez une Box À la Carte quand vous le souhaitez.' },
]
</script>

<style scoped>
/* Hero */
.abo-hero { position:relative; overflow:hidden; background:radial-gradient(ellipse 80% 70% at 30% 50%,#E8CFA0 0%,var(--neige) 65%); padding:5rem 0; }
.abo-hero__bg { position:absolute;inset:0;opacity:.04;background-image:radial-gradient(var(--nuit) 1.5px,transparent 1.5px);background-size:28px 28px; }
.abo-hero__inner { display:grid;grid-template-columns:1fr 1.1fr;gap:3rem;align-items:start;position:relative;z-index:1; }
.abo-hero__prix-wrap { display:flex;gap:1rem;flex-wrap:wrap;margin:1.5rem 0; }
.prix-pill { display:flex;flex-direction:column;gap:.2rem;background:var(--nuit);color:var(--neige);padding:.8rem 1.4rem;border-radius:50px; }
.prix-pill span { font-size:.72rem;opacity:.7; }
.prix-pill strong { font-family:var(--font-display);font-size:1.3rem;font-weight:900; }
.prix-pill strong em { font-size:.75rem;font-style:normal;opacity:.75;margin-left:.2rem; }
.prix-pill--light { background:var(--menthe); }
.abo-hero__ctas { display:flex;gap:1rem;flex-wrap:wrap; }
.abo-hero__quiz { padding:2rem; }
.quiz-header { display:flex;align-items:flex-start;gap:.9rem;padding-bottom:1.5rem;border-bottom:1px solid var(--brume);margin-bottom:1.5rem; }
.quiz-header span { font-size:2rem; }
.quiz-header strong { display:block;font-weight:700;color:var(--nuit);margin-bottom:.2rem; }
.quiz-header p { font-size:.8rem;color:var(--muted); }

/* Prix explication */
.prix-expl { background:var(--neige);padding:5rem 0; }
.taille-cards { display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;margin-top:3rem; }
.taille-card { background:white;border-radius:24px;overflow:hidden;border:1.5px solid var(--brume); }
.taille-card__top { background:var(--nuit);color:var(--neige);padding:1.2rem 1.5rem;display:flex;align-items:baseline;gap:.8rem; }
.taille-card__letter { font-family:var(--font-display);font-size:2.5rem;font-weight:900;color:var(--bleu-vif);line-height:1; }
.taille-card__poids { font-size:.82rem;opacity:.7; }
.taille-card ul { list-style:none;padding:1.2rem 1.5rem; }
.taille-card li { font-size:.85rem;color:var(--text);padding:.3rem 0;border-bottom:1px solid var(--neige);display:flex;align-items:center;gap:.5rem; }
.taille-card li::before { content:'✦';color:var(--bleu-vif);font-size:.55rem;flex-shrink:0; }
.taille-card__equal { text-align:center;padding:.7rem;font-size:.75rem;font-weight:600;color:var(--menthe);background:#EDF4E5; }

/* Sections formules */
.formule-section { padding:5rem 0; }
.formule-surprise { background:white; }
.formule-carte    { background:#F8F6F2; }
.formule-inner { display:grid;grid-template-columns:1fr 1.2fr;gap:4rem;align-items:start; }
.formule-prix { font-family:var(--font-display);font-size:2.5rem;font-weight:900;color:var(--nuit);margin:1.2rem 0; }
.formule-prix span { font-size:.9rem;color:var(--muted);font-family:var(--font-body);font-weight:400;margin-left:.2rem; }
.formule-prix--sage { color:var(--menthe); }
.formule-features { list-style:none;margin:0 0 1.5rem; }
.formule-features li { display:flex;align-items:center;gap:.6rem;font-size:.9rem;color:var(--muted);padding:.45rem 0;border-bottom:1px solid var(--neige); }
.formule-features li::before { content:'✓';color:var(--menthe);font-weight:700;flex-shrink:0; }
.carte-note { font-size:.82rem;color:var(--muted);background:var(--brume);padding:.7rem 1rem;border-radius:10px;line-height:1.5; }
.carte-note a { color:var(--bleu-vif); }

/* Form commun */
.formule-form { padding:2.5rem; }
.form-section-title { font-family:var(--font-display);font-size:1rem;font-weight:700;color:var(--nuit);margin-bottom:.8rem; }
.form-row { display:grid;grid-template-columns:1fr 1fr;gap:1rem; }

/* Gabarit */
.gabarit-btns { display:grid;grid-template-columns:repeat(3,1fr);gap:.7rem; }
.gabarit-btn { display:flex;flex-direction:column;align-items:center;gap:.15rem;padding:.9rem .5rem;border-radius:14px;border:2px solid var(--brume);background:white;cursor:pointer;font-family:var(--font-body);transition:all .2s; }
.gabarit-btn strong { font-family:var(--font-display);font-size:1.8rem;font-weight:900;color:var(--nuit);line-height:1; }
.gabarit-btn span { font-size:.72rem;font-weight:600;color:var(--nuit); }
.gabarit-btn em { font-size:.65rem;color:var(--muted);font-style:normal;text-align:center; }
.gabarit-btn.active { border-color:var(--bleu-vif);background:#FFF4E6; }
.gabarit-btn.active strong { color:var(--bleu-vif); }
.gabarit-btn--sage.active { border-color:var(--menthe);background:#EDF2E8; }
.gabarit-btn--sage.active strong { color:var(--menthe); }

/* Produits picker */
.produits-picker { background:var(--neige);border-radius:16px;padding:1rem;margin-bottom:1rem; }
.picker-filters { display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.8rem; }
.filter-btn { padding:.3rem .8rem;border-radius:40px;border:1.5px solid var(--brume);background:white;font-size:.82rem;cursor:pointer;font-family:var(--font-body);transition:all .15s; }
.filter-btn--active { background:var(--nuit);color:var(--neige);border-color:var(--nuit); }
.picker-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:.5rem;max-height:280px;overflow-y:auto; }
.picker-item { display:flex;align-items:center;gap:.6rem;padding:.7rem .9rem;background:white;border-radius:10px;border:1.5px solid var(--brume);cursor:pointer;transition:all .15s; }
.picker-item.selected { border-color:var(--menthe);background:#EDF2E8; }
.picker-item.disabled { opacity:.4;cursor:not-allowed; }
.picker-item__emoji { font-size:1.2rem;flex-shrink:0; }
.picker-item__nom { font-size:.8rem;font-weight:500;color:var(--text);flex:1;line-height:1.3; }
.picker-item__check { color:var(--menthe);font-weight:700;font-size:.9rem; }
.slots-counter { font-size:.75rem;background:var(--brume);padding:.15rem .6rem;border-radius:40px;color:var(--nuit);font-family:var(--font-body);font-weight:500; }

/* Villes */
.villes-chips { display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.4rem; }
.ville-chip { padding:.2rem .7rem;background:var(--brume);border:none;border-radius:40px;font-size:.78rem;color:var(--nuit);cursor:pointer;font-family:var(--font-body);transition:background .15s; }
.ville-chip:hover { background:var(--bleu-vif);color:var(--nuit); }

/* Consent */
.consent-check { display:flex;align-items:flex-start;gap:.6rem;font-size:.82rem;color:var(--muted);cursor:pointer;line-height:1.5;margin-top:1rem; }
.consent-check input { flex-shrink:0;accent-color:var(--bleu-vif);margin-top:2px; }
.consent-check a { color:var(--bleu-vif); }

/* Success */
.order-success { text-align:center;padding:2rem; }
.order-success h3 { font-family:var(--font-display);font-size:1.5rem;font-weight:900;margin-bottom:.8rem; }
.order-success p { color:var(--muted);line-height:1.7; }

/* FAQ */
.faq-section { padding-bottom:5rem; }
.faq-list { max-width:740px;margin:0 auto; }

@media (max-width:1000px) { .abo-hero__inner,.formule-inner { grid-template-columns:1fr; } }
@media (max-width:700px)  { .taille-cards { grid-template-columns:1fr; } }
</style>
