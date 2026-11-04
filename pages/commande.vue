<!-- pages/commande.vue — Commande Box Surprise ou Compose ta box (F-48, US-08, US-46)
     Compte, chien, adresse, récapitulatif, CGV, puis paiement Stripe intégré.
     Le compte peut être créé ici, en fin de parcours (F-05). -->
<template>
  <div>
    <EnteteEpuree>
      <span class="securise"><Icone nom="cadenas" :taille="18" /> Paiement sécurisé</span>
    </EnteteEpuree>

    <main id="contenu" class="conteneur commande">
      <div class="colonne-principale">
        <h1 class="titre-2">Votre commande</h1>

        <fieldset class="bloc" :disabled="!!clientSecret">
          <!-- Pour qui (Box Surprise) -->
          <section v-if="estSurprise" class="section-form">
            <h2 class="titre-section">C'est pour qui&nbsp;?</h2>
            <div class="options-ligne">
              <ChoixOption v-model="pourQui" valeur="moi" nom="pour-qui">Pour mon chien</ChoixOption>
              <ChoixOption v-model="pourQui" valeur="offrir" nom="pour-qui" @update:model-value="versCadeau">Pour offrir</ChoixOption>
            </div>
          </section>

          <!-- Compte -->
          <section class="section-form">
            <h2 class="titre-section">Votre compte</h2>
            <p v-if="isLoggedIn" class="petit">Connecté en tant que <strong>{{ profile?.email }}</strong>.</p>
            <template v-else>
              <p class="petit">
                {{ modeCompte === 'creer' ? 'Déjà un compte ?' : 'Pas encore de compte ?' }}
                <button type="button" class="lien" @click="modeCompte = modeCompte === 'creer' ? 'connexion' : 'creer'">
                  {{ modeCompte === 'creer' ? 'Se connecter' : 'Créer un compte' }}
                </button>
              </p>
              <div class="ligne">
                <div class="champ">
                  <label for="cmd-email">Email</label>
                  <input id="cmd-email" v-model.trim="email" class="input" type="email" autocomplete="email" required />
                </div>
                <div class="champ">
                  <label for="cmd-mdp">Mot de passe</label>
                  <input
                    id="cmd-mdp" v-model="motDePasse" class="input" type="password" required
                    :autocomplete="modeCompte === 'creer' ? 'new-password' : 'current-password'"
                  />
                  <p v-if="modeCompte === 'creer'" class="aide">6 caractères minimum.</p>
                </div>
              </div>
              <button v-if="modeCompte === 'connexion'" type="button" class="btn btn-secondaire" :disabled="envoi" @click="seConnecter">Se connecter</button>
            </template>
          </section>

          <!-- Chien -->
          <section v-if="estSurprise || chiens.length" class="section-form">
            <h2 class="titre-section">{{ estSurprise ? 'Votre chien' : 'Pour quel chien ? (facultatif)' }}</h2>
            <template v-if="chiens.length">
              <div class="options">
                <ChoixOption v-for="c in chiens" :key="c.id" v-model="chienId" :valeur="c.id" nom="chien">
                  {{ c.nom }} · {{ c.poids }} kg · taille {{ c.taille }}
                </ChoixOption>
                <ChoixOption v-if="estSurprise && chienQuiz" v-model="chienId" valeur="quiz" nom="chien">
                  {{ chienQuiz.nom }} (d'après le quiz)
                </ChoixOption>
              </div>
            </template>
            <template v-else-if="chienQuiz">
              <p class="petit">Box adaptée à <strong>{{ chienQuiz.nom }}</strong>, {{ chienQuiz.poids }} kg, d'après vos réponses au quiz.</p>
            </template>
            <div v-else class="ligne">
              <div class="champ">
                <label for="cmd-chien">Son prénom</label>
                <input id="cmd-chien" v-model.trim="nouveauChien.nom" class="input" required />
              </div>
              <div class="champ">
                <label for="cmd-poids">Son poids (kg)</label>
                <input id="cmd-poids" v-model.number="nouveauChien.poids" class="input" type="number" min="0.5" max="120" step="0.1" required />
              </div>
            </div>
            <label v-if="creeUnChien" class="case-simple">
              <input v-model="consentementChien" type="checkbox" />
              <span>J'accepte que Dawky enregistre la fiche de mon chien (race, âge, poids, allergies) pour adapter sa box.
                <NuxtLink to="/confidentialite" class="lien" target="_blank">En savoir plus</NuxtLink></span>
            </label>
          </section>

          <!-- Livraison -->
          <section class="section-form">
            <h2 class="titre-section">Livraison offerte</h2>
            <div v-if="adresses.length" class="options">
              <ChoixOption v-for="a in adresses" :key="a.id" v-model="adresseId" :valeur="a.id" nom="adresse">
                {{ a.prenom }} {{ a.nom }}, {{ adresseSurUneLigne(a) }}
              </ChoixOption>
              <ChoixOption v-model="adresseId" valeur="nouvelle" nom="adresse">Nouvelle adresse</ChoixOption>
            </div>
            <FormulaireAdresse v-if="!adresses.length || adresseId === 'nouvelle'" v-model="adresse" prefixe="cmd" />
          </section>

          <!-- Code promo -->
          <section class="section-form">
            <h2 class="titre-section">Code promo ou parrainage</h2>
            <div class="code-promo">
              <label for="cmd-code" class="sr-only">Code</label>
              <input id="cmd-code" v-model.trim="code" class="input" autocomplete="off" placeholder="Votre code" @input="reduction = null" />
              <button type="button" class="btn btn-secondaire" :disabled="!code" @click="verifierCode">Appliquer</button>
            </div>
            <p v-if="reduction" class="petit code-ok" role="status">
              Code appliqué : {{ reduction.type === 'POURCENTAGE' ? `${reduction.valeur} %` : formatPrix(reduction.valeur) }} de réduction{{ estSurprise ? ' sur le premier mois' : '' }}.
            </p>
            <p v-if="erreurCode" class="erreur-champ" role="alert">{{ erreurCode }}</p>
          </section>
        </fieldset>

        <!-- Paiement -->
        <section ref="sectionPaiement" class="section-form">
          <h2 class="titre-section">Paiement</h2>
          <template v-if="clientSecret">
            <PaiementStripe :client-secret="clientSecret" />
            <button type="button" class="lien petit" @click="modifier">Modifier ma commande</button>
          </template>
          <p v-else class="petit texte-secondaire">
            Le formulaire de paiement sécurisé s'affiche ici après confirmation. Vos données bancaires sont traitées par Stripe et ne transitent jamais par Dawky.
          </p>
        </section>
      </div>

      <!-- Récapitulatif -->
      <aside class="recap fond-gris" aria-label="Récapitulatif">
        <h2 class="titre-recap">Récapitulatif</h2>
        <p class="recap-produit">{{ estSurprise ? 'Box Surprise' : 'Compose ta box' }}, taille {{ taille }}</p>
        <p v-if="nomChienRecap" class="petit">Box adaptée à {{ nomChienRecap }}</p>
        <ul v-if="!estSurprise" class="recap-produits petit">
          <li v-for="l in compose.lots" :key="l.lotId">{{ l.nom }}</li>
        </ul>
        <dl class="recap-lignes">
          <div><dt>{{ estSurprise ? 'Abonnement mensuel' : 'Box de 5 produits' }}</dt><dd>{{ formatPrix(prixBase) }}</dd></div>
          <div><dt>Livraison</dt><dd>Offerte</dd></div>
          <div v-if="remise"><dt>Réduction</dt><dd>− {{ formatPrix(remise) }}</dd></div>
          <div v-if="estSurprise"><dt>Première box</dt><dd>{{ jourMois(premiereBox) }} {{ premiereBox.getFullYear() }}</dd></div>
          <div v-else><dt>Expédition</dt><dd>Sous 3 à 5 jours</dd></div>
        </dl>
        <div class="recap-total">
          <span>Aujourd'hui</span>
          <span>{{ formatPrix(totalAujourdhui) }}</span>
        </div>
        <p v-if="estSurprise && remise" class="petit texte-secondaire">Puis {{ formatPrix(prixBase) }}/mois.</p>

        <template v-if="!clientSecret">
          <label class="case-simple">
            <input v-model="cgv" type="checkbox" />
            <span>J'accepte les <NuxtLink to="/cgv" class="lien" target="_blank">conditions générales de vente</NuxtLink></span>
          </label>

          <div v-if="risquesAllergie.length" class="alerte-allergie" role="alert">
            <p><strong>Attention, certains produits ne conviennent pas à votre chien :</strong></p>
            <ul>
              <li v-for="r in risquesAllergie" :key="r.produit">{{ r.produit }} ({{ r.allergenes.join(', ') }})</li>
            </ul>
            <button type="button" class="lien" @click="confirmer(true)">Commander quand même</button>
          </div>
          <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>
          <p v-if="info" class="info-recap" role="status">{{ info }}</p>

          <button type="button" class="btn btn-principal btn-grand btn-bloc" :disabled="envoi" @click="confirmer(false)">
            {{ envoi ? 'Un instant…' : 'Confirmer et payer' }}
          </button>
        </template>
        <p class="petit texte-secondaire">
          {{ estSurprise ? 'Sans engagement. Garantie taille et satisfaction.' : 'Commande unique. Garantie taille et satisfaction.' }}
        </p>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { Adresse, Catalogue, Taille } from '~/composables/types'
import { CLE_PARRAIN } from '~/plugins/03.parrainage.client'

definePageMeta({ layout: false })
useSeoMeta({ title: 'Votre commande — Dawky', robots: 'noindex' })

const route = useRoute()
const { isLoggedIn, profile, signIn, signUp, fetchProfile } = useAuth()
const { resultat, reponses, poidsRetenu } = useQuiz()
const { selection: compose } = useCompose()

const estSurprise = computed(() => route.query.formule !== 'compose')

// Compose ta box sans sélection complète : retour au choix des produits
onMounted(() => {
  if (!estSurprise.value && compose.value.lots.length === 0) navigateTo('/compose-ta-box', { replace: true })
})

const { data: catalogue } = await useFetch('/api/boxes', { transform: (r: { data: Catalogue }) => r.data })

// ─── Formulaire ───
const pourQui = ref<'moi' | 'offrir'>('moi')
const modeCompte = ref<'creer' | 'connexion'>('creer')
const email = ref('')
const motDePasse = ref('')
const chienId = ref<string | null>(null)
const nouveauChien = reactive({ nom: '', poids: null as number | null })
const consentementChien = ref(false)
const adresseId = ref<string>('nouvelle')
const adresse = ref(adresseVide())
const code = ref('')
const reduction = ref<{ type: 'POURCENTAGE' | 'MONTANT'; valeur: number } | null>(null)
const erreurCode = ref('')
const cgv = ref(false)

const envoi = ref(false)
const erreur = ref('')
const info = ref('')
const risquesAllergie = ref<Array<{ produit: string; allergenes: string[] }>>([])
const clientSecret = ref<string | null>(null)
const sectionPaiement = ref<HTMLElement | null>(null)

const chiens = computed(() => profile.value?.chiens ?? [])
const adresses = computed<Adresse[]>(() => profile.value?.adresses ?? [])

// Chien issu du quiz, s'il n'a pas déjà été enregistré dans le compte
const chienQuiz = computed(() => {
  if (!resultat.value || !reponses.value.nomChien.trim()) return null
  const nom = reponses.value.nomChien.trim()
  if (chiens.value.some(c => c.nom.toLowerCase() === nom.toLowerCase())) return null
  return { nom, poids: poidsRetenu() }
})
const creeUnChien = computed(() => estSurprise.value && (chienId.value === 'quiz' || (!chiens.value.length)))

// Présélections : chien et adresse par défaut du compte
watchEffect(() => {
  if (!chienId.value) {
    const depuisQuiz = resultat.value?.chienId && chiens.value.find(c => c.id === resultat.value!.chienId)
    const depuisCompose = compose.value.chienId && chiens.value.find(c => c.id === compose.value.chienId)
    chienId.value = (depuisQuiz || depuisCompose || chiens.value[0])?.id ?? (chienQuiz.value ? 'quiz' : null)
  }
  if (adresseId.value === 'nouvelle' && adresses.value.length) {
    adresseId.value = (adresses.value.find(a => a.parDefaut) ?? adresses.value[0]!).id
  }
  if (!adresse.value.prenom && profile.value) {
    adresse.value.prenom = profile.value.prenom
    adresse.value.nom = profile.value.nom
  }
})

const chienSelectionne = computed(() => chiens.value.find(c => c.id === chienId.value) ?? null)

const taille = computed<Taille>(() => {
  if (!estSurprise.value && compose.value.taille) return compose.value.taille
  const q = route.query.taille
  if (q === 'S' || q === 'M' || q === 'L') return q
  return chienSelectionne.value?.taille ?? resultat.value?.taille ?? 'M'
})

const nomChienRecap = computed(() => {
  if (chienSelectionne.value) return `${chienSelectionne.value.nom}, ${chienSelectionne.value.poids} kg`
  if (chienId.value === 'quiz' || (!chiens.value.length && chienQuiz.value)) return `${chienQuiz.value?.nom}, ${chienQuiz.value?.poids} kg`
  if (nouveauChien.nom) return nouveauChien.nom
  return null
})

// ─── Prix ───
const prixBase = computed(() => {
  const type = estSurprise.value ? 'SURPRISE' : 'COMPOSE'
  return catalogue.value?.formules.find(f => f.type === type)?.prix[taille.value] ?? 0
})
const remise = computed(() => {
  if (!reduction.value) return 0
  const r = reduction.value.type === 'POURCENTAGE' ? Math.round(prixBase.value * reduction.value.valeur / 100) : reduction.value.valeur
  return Math.min(r, prixBase.value)
})
const totalAujourdhui = computed(() => prixBase.value - remise.value)
const premiereBox = computed(() => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + 1, 1)
})

async function verifierCode() {
  erreurCode.value = ''
  reduction.value = null
  try {
    reduction.value = await api(`/api/codes-promo/${encodeURIComponent(code.value)}`)
  } catch (err) {
    erreurCode.value = versApiError(err).message
  }
}

function versCadeau() {
  navigateTo({ path: '/offrir', query: { taille: taille.value } })
}

async function seConnecter() {
  erreur.value = ''
  envoi.value = true
  try {
    await signIn(email.value, motDePasse.value)
  } catch (err) {
    erreur.value = (err as Error).message
  } finally {
    envoi.value = false
  }
}

function modifier() {
  clientSecret.value = null
}

// ─── Validation puis création ───
function valider(): string | null {
  if (!isLoggedIn.value) {
    if (modeCompte.value === 'connexion') return 'Connectez-vous pour continuer.'
    if (!/^\S+@\S+\.\S+$/.test(email.value)) return 'Saisissez une adresse email valide.'
    if (motDePasse.value.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.'
  }
  if (estSurprise.value) {
    if (!chienSelectionne.value && !chienQuiz.value && (!nouveauChien.nom || !nouveauChien.poids)) {
      return 'Indiquez le prénom et le poids de votre chien.'
    }
    if (creeUnChien.value && !consentementChien.value) {
      return 'Votre accord est nécessaire pour enregistrer la fiche de votre chien.'
    }
  }
  if ((adresseId.value === 'nouvelle' || !adresses.value.length) && !adresseComplete(adresse.value)) {
    return 'Complétez l\'adresse de livraison (nom, adresse, code postal, ville).'
  }
  if (!cgv.value) return 'Acceptez les conditions générales de vente pour continuer.'
  return null
}

async function assurerCompte(): Promise<boolean> {
  if (isLoggedIn.value) return true
  const { confirmationRequise } = await signUp(email.value, motDePasse.value, {
    prenom: adresse.value.prenom,
    nom: adresse.value.nom,
    codeParrainage: localStorage.getItem(CLE_PARRAIN) ?? undefined,
    // Le chien du quiz est enregistré à la création du compte
    quizResultId: resultat.value?.id,
    consentementChien: estSurprise.value && !!chienQuiz.value && consentementChien.value,
  })
  if (confirmationRequise) {
    info.value = `Nous avons envoyé un lien de confirmation à ${email.value}. Cliquez dessus puis revenez sur cette page pour payer : votre commande est gardée.`
    return false
  }
  localStorage.removeItem(CLE_PARRAIN)
  return true
}

async function assurerChien(): Promise<string | undefined> {
  if (!estSurprise.value) return chienSelectionne.value?.id
  if (chienSelectionne.value) return chienSelectionne.value.id

  // Créé à l'inscription depuis le quiz ?
  await fetchProfile()
  const nomQuiz = reponses.value.nomChien.trim().toLowerCase()
  const cree = profile.value?.chiens.find(c => c.nom.toLowerCase() === (chienQuiz.value ? nomQuiz : nouveauChien.nom.toLowerCase()))
  if (cree) return cree.id

  const r = reponses.value
  const chien = await api<{ id: string }>('/api/chiens', {
    method: 'POST',
    body: chienQuiz.value
      ? {
          nom: chienQuiz.value.nom,
          race: r.race.trim() || null,
          poids: chienQuiz.value.poids,
          taille: resultat.value?.taille,
          niveauActivite: r.niveauActivite ?? 'MODERE',
          estMacheur: !!r.estMacheur,
          allergenes: r.allergenes,
          allergiesAutres: r.allergiesAutres.trim() || null,
          sensibleTraces: r.sensibleTraces,
          consentementRgpd: true,
        }
      : { nom: nouveauChien.nom, poids: nouveauChien.poids, consentementRgpd: true },
  })
  return chien.id
}

async function assurerAdresse(): Promise<string> {
  if (adresseId.value !== 'nouvelle' && adresses.value.some(a => a.id === adresseId.value)) return adresseId.value
  const cree = await api<{ id: string }>('/api/adresses', { method: 'POST', body: versApiAdresse(adresse.value) })
  adresseId.value = cree.id
  return cree.id
}

async function confirmer(confirmerRisqueAllergie: boolean) {
  erreur.value = ''
  info.value = ''
  const probleme = valider()
  if (probleme) {
    erreur.value = probleme
    return
  }
  envoi.value = true
  try {
    if (!(await assurerCompte())) return
    const idChien = await assurerChien()
    const idAdresse = await assurerAdresse()
    await fetchProfile()

    const commun = {
      livraison: { adresseId: idAdresse, modeLivraison: 'DOMICILE' },
      codePromo: code.value || undefined,
      accepteCgv: true,
    }
    const res = estSurprise.value
      ? await api<{ clientSecret: string }>('/api/abonnements', {
          method: 'POST',
          body: { ...commun, chienId: idChien, taille: taille.value },
        })
      : await api<{ clientSecret: string }>('/api/commandes', {
          method: 'POST',
          body: {
            ...commun,
            type: 'COMPOSE',
            chienId: idChien,
            taille: taille.value,
            items: compose.value.lots.map(l => ({ lotId: l.lotId, quantite: 1 })),
            confirmerRisqueAllergie,
          },
        })
    risquesAllergie.value = []
    clientSecret.value = res.clientSecret
    await nextTick()
    sectionPaiement.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch (err) {
    const e = versApiError(err)
    if (e.statusCode === 409 && e.details?.risquesAllergie) {
      risquesAllergie.value = e.details.risquesAllergie as typeof risquesAllergie.value
    } else {
      erreur.value = e.message
    }
  } finally {
    envoi.value = false
  }
}
</script>

<style scoped>
.securise {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.commande {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: var(--e6);
  align-items: start;
  padding-block: var(--e5) var(--e7);
}
.colonne-principale {
  display: flex;
  flex-direction: column;
  gap: var(--e4);
  max-width: 720px;
}
.bloc {
  border: 0;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--e4);
}
.bloc:disabled {
  opacity: 0.6;
}
.section-form {
  display: flex;
  flex-direction: column;
  gap: var(--e2);
}
.titre-section {
  font-family: var(--font-texte);
  font-size: 20px;
  font-weight: 700;
}
.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.options-ligne,
.ligne {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--e2);
}
.aide {
  font-size: 14px;
  color: var(--texte-secondaire);
}
.case-simple {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 15px;
  cursor: pointer;
}
.case-simple input {
  width: 20px;
  height: 20px;
  margin-top: 2px;
  accent-color: var(--burgundy);
  flex-shrink: 0;
}
.code-promo {
  display: flex;
  gap: var(--e1);
  max-width: 420px;
}
.code-ok {
  color: var(--burgundy);
  font-weight: 700;
}
.recap {
  position: sticky;
  top: var(--e3);
  padding: var(--e3);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.titre-recap {
  font-size: 40px;
  margin-bottom: var(--e1);
}
.recap-produit {
  font-weight: 700;
  font-size: 16px;
}
.recap-produits {
  margin: 0;
  padding-left: 18px;
}
.recap-lignes {
  margin: var(--e1) 0 0;
  border-top: 1px solid var(--noir);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 15px;
}
.recap-lignes div {
  display: flex;
  justify-content: space-between;
  gap: var(--e2);
}
.recap-lignes dd {
  margin: 0;
  text-align: right;
}
.recap-total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-top: 1px solid var(--noir);
  padding-top: 12px;
  font-weight: 700;
}
.recap-total span:last-child {
  font-size: 24px;
}
.alerte-allergie {
  border: 1px solid var(--erreur);
  padding: 12px 16px;
  font-size: 15px;
}
.alerte-allergie ul {
  margin: 8px 0;
  padding-left: 18px;
}
.info-recap {
  border-left: 3px solid var(--burgundy);
  background: var(--blanc);
  padding: 12px 16px;
  font-size: 15px;
}

@media (max-width: 900px) {
  .commande {
    grid-template-columns: 1fr;
    gap: var(--e4);
  }
  .recap {
    position: static;
  }
  .options-ligne,
  .ligne {
    grid-template-columns: 1fr;
  }
}
</style>
