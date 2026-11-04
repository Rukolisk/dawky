<!-- pages/offrir.vue — Offrir un abonnement prépayé (US-36 à US-40, F-42 à F-46)
     Parcours pensé pour Michèle : peu de choix, total affiché tôt,
     récapitulatif à relire, un seul bouton principal. -->
<template>
  <div>
    <EnteteEpuree>
      <span class="securise"><Icone nom="cadenas" :taille="18" /> Paiement sécurisé</span>
    </EnteteEpuree>

    <main id="contenu" class="conteneur offrir">
      <div class="colonne-principale">
        <p class="surtitre">Idée cadeau</p>
        <h1 class="titre-2">Offrir des <em>mois de surprises</em></h1>
        <p class="intro">
          La box part le 1er de chaque mois chez la personne de votre choix, avec votre message.
          Aucun renouvellement automatique : vous ne payez qu'une fois.
        </p>

        <fieldset class="bloc" :disabled="!!clientSecret">
          <!-- 1. Durée -->
          <section class="section-form">
            <h2 class="titre-section">1. Combien de mois&nbsp;?</h2>
            <div class="options-ligne">
              <ChoixOption v-for="d in durees" :key="d" v-model="dureeMois" :valeur="d" nom="duree">
                {{ d }} mois <span class="option-detail">{{ formatPrix(prixMensuel * d) }}</span>
              </ChoixOption>
            </div>
          </section>

          <!-- 2. Taille -->
          <section class="section-form">
            <h2 class="titre-section">2. Quelle taille de chien&nbsp;?</h2>
            <div class="options">
              <ChoixOption v-for="t in INFOS_TAILLES" :key="t.taille" v-model="taille" :valeur="t.taille" nom="taille">
                <strong>{{ t.taille }}</strong> · {{ t.poids }} <span class="option-detail">{{ t.races }}</span>
              </ChoixOption>
            </div>
            <div class="champ champ-court">
              <label for="o-chien">Prénom du chien <span class="texte-secondaire">facultatif, imprimé sur la carte</span></label>
              <input id="o-chien" v-model.trim="nomChien" class="input" maxlength="50" />
            </div>
          </section>

          <!-- 3. Destinataire -->
          <section class="section-form">
            <h2 class="titre-section">3. À qui l'envoyer&nbsp;?</h2>
            <FormulaireAdresse v-model="destinataire" prefixe="dest" />
            <div class="champ">
              <label for="o-message">Votre message <span class="texte-secondaire">facultatif, glissé dans la première box</span></label>
              <textarea id="o-message" v-model="message" class="input" rows="3" maxlength="500" placeholder="Joyeux anniversaire ! Bisous, Maman" />
            </div>
            <label class="case-simple">
              <input v-model="annoncer" type="checkbox" />
              <span>Prévenir la personne par email (sans dévoiler le contenu)</span>
            </label>
            <div v-if="annoncer" class="champ">
              <label for="o-email-dest">Son email</label>
              <input id="o-email-dest" v-model.trim="emailDestinataire" class="input" type="email" autocomplete="off" />
            </div>
          </section>

          <!-- 4. Compte de l'acheteur -->
          <section class="section-form">
            <h2 class="titre-section">4. Vos coordonnées</h2>
            <p v-if="isLoggedIn" class="petit">Connecté en tant que <strong>{{ profile?.email }}</strong>. Vous recevrez les emails d'expédition et de livraison.</p>
            <template v-else>
              <p class="petit">
                Un compte vous permet de suivre chaque envoi. {{ modeCompte === 'creer' ? 'Déjà un compte ?' : 'Pas encore de compte ?' }}
                <button type="button" class="lien" @click="modeCompte = modeCompte === 'creer' ? 'connexion' : 'creer'">
                  {{ modeCompte === 'creer' ? 'Se connecter' : 'Créer un compte' }}
                </button>
              </p>
              <div v-if="modeCompte === 'creer'" class="ligne">
                <div class="champ">
                  <label for="o-prenom">Votre prénom</label>
                  <input id="o-prenom" v-model.trim="acheteur.prenom" class="input" autocomplete="given-name" />
                </div>
                <div class="champ">
                  <label for="o-nom">Votre nom</label>
                  <input id="o-nom" v-model.trim="acheteur.nom" class="input" autocomplete="family-name" />
                </div>
              </div>
              <div class="ligne">
                <div class="champ">
                  <label for="o-email">Votre email</label>
                  <input id="o-email" v-model.trim="email" class="input" type="email" autocomplete="email" />
                </div>
                <div class="champ">
                  <label for="o-mdp">Mot de passe</label>
                  <input
                    id="o-mdp" v-model="motDePasse" class="input" type="password"
                    :autocomplete="modeCompte === 'creer' ? 'new-password' : 'current-password'"
                  />
                  <p v-if="modeCompte === 'creer'" class="aide">6 caractères minimum.</p>
                </div>
              </div>
              <button v-if="modeCompte === 'connexion'" type="button" class="btn btn-secondaire" :disabled="envoi" @click="seConnecter">Se connecter</button>
            </template>
          </section>

          <section class="section-form">
            <h2 class="titre-section">Code promo <span class="texte-secondaire petit">facultatif</span></h2>
            <div class="code-promo">
              <label for="o-code" class="sr-only">Code</label>
              <input id="o-code" v-model.trim="code" class="input" autocomplete="off" @input="reduction = null" />
              <button type="button" class="btn btn-secondaire" :disabled="!code" @click="verifierCode">Appliquer</button>
            </div>
            <p v-if="erreurCode" class="erreur-champ" role="alert">{{ erreurCode }}</p>
          </section>
        </fieldset>

        <section ref="sectionPaiement" class="section-form">
          <h2 class="titre-section">Paiement</h2>
          <template v-if="clientSecret">
            <PaiementStripe :client-secret="clientSecret" />
            <button type="button" class="lien petit" @click="clientSecret = null">Modifier le cadeau</button>
          </template>
          <p v-else class="petit texte-secondaire">Le paiement sécurisé s'affiche ici après avoir relu le récapitulatif.</p>
        </section>
      </div>

      <!-- Récapitulatif à relire (US-37) -->
      <aside class="recap fond-gris" aria-label="Récapitulatif du cadeau">
        <h2 class="titre-recap">Votre cadeau</h2>
        <dl class="recap-lignes">
          <div><dt>Box Surprise</dt><dd>Taille {{ taille }}</dd></div>
          <div><dt>Durée</dt><dd>{{ dureeMois }} mois</dd></div>
          <div><dt>Pour</dt><dd>{{ nomDestinataire || '—' }}</dd></div>
          <div v-if="adresseDestinataire"><dt>Adresse</dt><dd>{{ adresseDestinataire }}</dd></div>
          <div><dt>Première box</dt><dd>{{ jourMois(premiereBox) }} {{ premiereBox.getFullYear() }}</dd></div>
          <div><dt>Livraison</dt><dd>Offerte</dd></div>
          <div v-if="remise"><dt>Réduction</dt><dd>− {{ formatPrix(remise) }}</dd></div>
        </dl>
        <div class="recap-total">
          <span>Total, en une fois</span>
          <span>{{ formatPrix(total) }}</span>
        </div>
        <p class="petit texte-secondaire">Aucun renouvellement automatique. Nous vous écrirons 7 jours avant la dernière box.</p>

        <template v-if="!clientSecret">
          <label class="case-simple">
            <input v-model="cgv" type="checkbox" />
            <span>J'accepte les <NuxtLink to="/cgv" class="lien" target="_blank">conditions générales de vente</NuxtLink></span>
          </label>
          <p v-if="erreur" class="message-erreur" role="alert">{{ erreur }}</p>
          <p v-if="info" class="info-recap" role="status">{{ info }}</p>
          <button type="button" class="btn btn-principal btn-grand btn-bloc" :disabled="envoi" @click="confirmer">
            {{ envoi ? 'Un instant…' : 'Confirmer et payer' }}
          </button>
        </template>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { Catalogue, Taille } from '~/composables/types'
import { CLE_PARRAIN } from '~/plugins/03.parrainage.client'

definePageMeta({ layout: false })
useSeoMeta({
  title: 'Offrir une box Dawky — abonnement cadeau de 3, 6 ou 12 mois',
  description: 'Offrez des mois de box surprise pour chien, livrées chez la personne de votre choix avec votre message. Paiement unique, sans renouvellement.',
})

const route = useRoute()
const { isLoggedIn, profile, signIn, signUp } = useAuth()

const { data: catalogue } = await useFetch('/api/boxes', { transform: (r: { data: Catalogue }) => r.data })
const durees = computed(() => catalogue.value?.dureesCadeau ?? [3, 6, 12])

const qTaille = route.query.taille
const taille = ref<Taille>(qTaille === 'S' || qTaille === 'M' || qTaille === 'L' ? qTaille : 'S')
const dureeMois = ref(3)
const nomChien = ref('')
const destinataire = ref(adresseVide())
const message = ref('')
const annoncer = ref(false)
const emailDestinataire = ref('')
const modeCompte = ref<'creer' | 'connexion'>('creer')
const acheteur = reactive({ prenom: '', nom: '' })
const email = ref('')
const motDePasse = ref('')
const code = ref('')
const reduction = ref<{ type: 'POURCENTAGE' | 'MONTANT'; valeur: number } | null>(null)
const erreurCode = ref('')
const cgv = ref(false)

const envoi = ref(false)
const erreur = ref('')
const info = ref('')
const clientSecret = ref<string | null>(null)
const sectionPaiement = ref<HTMLElement | null>(null)

const prixMensuel = computed(() => catalogue.value?.formules.find(f => f.type === 'SURPRISE')?.prix[taille.value] ?? 0)
const sousTotal = computed(() => prixMensuel.value * dureeMois.value)
const remise = computed(() => {
  if (!reduction.value) return 0
  const r = reduction.value.type === 'POURCENTAGE' ? Math.round(sousTotal.value * reduction.value.valeur / 100) : reduction.value.valeur
  return Math.min(r, sousTotal.value)
})
const total = computed(() => sousTotal.value - remise.value)
const premiereBox = computed(() => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + 1, 1)
})
const nomDestinataire = computed(() => `${destinataire.value.prenom} ${destinataire.value.nom}`.trim())
const adresseDestinataire = computed(() => (destinataire.value.ligne1 ? adresseSurUneLigne({ ...destinataire.value, ligne2: destinataire.value.ligne2 || null }) : ''))

async function verifierCode() {
  erreurCode.value = ''
  reduction.value = null
  try {
    reduction.value = await api(`/api/codes-promo/${encodeURIComponent(code.value)}`)
  } catch (err) {
    erreurCode.value = versApiError(err).message
  }
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

function valider(): string | null {
  if (!adresseComplete(destinataire.value)) return 'Complétez le nom et l\'adresse de la personne qui reçoit le cadeau.'
  if (annoncer.value && !/^\S+@\S+\.\S+$/.test(emailDestinataire.value)) return 'Indiquez l\'email de la personne à prévenir.'
  if (!isLoggedIn.value) {
    if (modeCompte.value === 'connexion') return 'Connectez-vous pour continuer.'
    if (!acheteur.prenom || !acheteur.nom) return 'Indiquez votre prénom et votre nom.'
    if (!/^\S+@\S+\.\S+$/.test(email.value)) return 'Saisissez votre adresse email.'
    if (motDePasse.value.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.'
  }
  if (!cgv.value) return 'Acceptez les conditions générales de vente pour continuer.'
  return null
}

async function confirmer() {
  erreur.value = ''
  info.value = ''
  const probleme = valider()
  if (probleme) {
    erreur.value = probleme
    return
  }
  envoi.value = true
  try {
    if (!isLoggedIn.value) {
      const { confirmationRequise } = await signUp(email.value, motDePasse.value, {
        prenom: acheteur.prenom,
        nom: acheteur.nom,
        codeParrainage: localStorage.getItem(CLE_PARRAIN) ?? undefined,
      })
      if (confirmationRequise) {
        info.value = `Nous avons envoyé un lien de confirmation à ${email.value}. Cliquez dessus puis revenez sur cette page pour payer.`
        return
      }
      localStorage.removeItem(CLE_PARRAIN)
    }

    const d = destinataire.value
    const res = await api<{ clientSecret: string }>('/api/cadeaux', {
      method: 'POST',
      body: {
        taille: taille.value,
        dureeMois: dureeMois.value,
        destinataire: {
          prenom: d.prenom,
          nom: d.nom,
          email: annoncer.value ? emailDestinataire.value : undefined,
          ligne1: d.ligne1,
          ligne2: d.ligne2 || undefined,
          codePostal: d.codePostal,
          ville: d.ville,
          telephone: d.telephone || undefined,
        },
        nomChien: nomChien.value || undefined,
        message: message.value.trim() || undefined,
        annoncer: annoncer.value,
        codePromo: code.value || undefined,
        accepteCgv: true,
      },
    })
    clientSecret.value = res.clientSecret
    await nextTick()
    sectionPaiement.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch (err) {
    erreur.value = versApiError(err).message
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
.offrir {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: var(--e6);
  align-items: start;
  padding-block: var(--e5) var(--e7);
}
.colonne-principale {
  display: flex;
  flex-direction: column;
  gap: var(--e3);
  max-width: 720px;
}
.intro {
  font-size: 20px;
  max-width: 600px;
}
.bloc {
  border: 0;
  margin: var(--e2) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--e5);
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
  font-size: 22px;
  font-weight: 700;
}
.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.options-ligne {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.option-detail {
  display: block;
  font-size: 14px;
  font-weight: 400;
  color: var(--texte-secondaire);
}
.ligne {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--e2);
}
.champ-court {
  max-width: 360px;
}
.champ label .texte-secondaire {
  font-weight: 400;
  font-size: 14px;
}
.aide {
  font-size: 14px;
  color: var(--texte-secondaire);
}
.case-simple {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 16px;
  cursor: pointer;
  min-height: var(--tactile);
}
.case-simple input {
  width: 22px;
  height: 22px;
  margin-top: 2px;
  accent-color: var(--burgundy);
  flex-shrink: 0;
}
.code-promo {
  display: flex;
  gap: var(--e1);
  max-width: 420px;
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
}
.recap-lignes {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 16px;
}
.recap-lignes div {
  display: flex;
  justify-content: space-between;
  gap: var(--e2);
}
.recap-lignes dd {
  margin: 0;
  text-align: right;
  font-weight: 500;
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
  font-size: 26px;
}
.info-recap {
  border-left: 3px solid var(--burgundy);
  background: var(--blanc);
  padding: 12px 16px;
  font-size: 15px;
}

@media (max-width: 900px) {
  .offrir {
    grid-template-columns: 1fr;
    gap: var(--e4);
  }
  .recap {
    position: static;
  }
  .options-ligne {
    grid-template-columns: 1fr;
  }
  .ligne {
    grid-template-columns: 1fr;
  }
}
</style>
