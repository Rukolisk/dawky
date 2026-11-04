// server/utils/email.ts
// ─────────────────────────────────────────
// Service email Dawky via Resend
//
// Toute donnée venant d'un utilisateur (prénom, nom du chien, message
// cadeau…) passe par `esc()` avant d'être insérée dans le HTML.
// Les envois sont appelés en "fire and forget" par les routes
// (.catch + log) : un email en échec ne doit pas faire échouer l'action.
// ─────────────────────────────────────────

import { Resend } from 'resend'
import { formatPrix } from './metier'
import { LOGO_EMAIL_CID, LOGO_EMAIL_PNG_BASE64 } from './logo-email'

let _resend: Resend | null = null

function getResend(): Resend {
  if (_resend) return _resend
  const config = useRuntimeConfig()
  if (!config.resendApiKey) {
    throw new Error('RESEND_API_KEY manquant dans .env')
  }
  _resend = new Resend(config.resendApiKey as string)
  return _resend
}

// ─── Helpers HTML ─────────────────────────

const NOIR = '#000000'
const BURGUNDY = '#4F0926'
const GRIS = '#555555'
const FOND = '#F4F4F4'

export function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export const LIBELLES_TAILLE: Record<string, string> = {
  S: 'S — jusqu\'à 10 kg',
  M: 'M — de 10 à 25 kg',
  L: 'L — plus de 25 kg',
}

function dateFr(d: Date): string {
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function appUrl(): string {
  return useRuntimeConfig().public.appUrl as string
}

function titre(texte: string): string {
  return `<h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:${NOIR};margin:0 0 20px;">${texte}</h1>`
}

function para(texte: string): string {
  return `<p style="font-size:16px;color:${NOIR};line-height:1.6;margin:0 0 18px;">${texte}</p>`
}

function petit(texte: string): string {
  return `<p style="font-size:14px;color:${GRIS};line-height:1.6;margin:0 0 16px;">${texte}</p>`
}

function bouton(lien: string, texte: string): string {
  return `<a href="${esc(lien)}" style="display:inline-block;background:${BURGUNDY};color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:16px;margin:8px 0 24px;">${texte}</a>`
}

// Tableau récapitulatif clé / valeur (les valeurs doivent déjà être échappées)
function recap(lignes: Array<[string, string]>): string {
  const rows = lignes.map(([k, v]) => `
    <tr>
      <td style="font-size:14px;color:${GRIS};padding:8px 0;border-bottom:1px solid #e5e5e5;">${k}</td>
      <td style="font-size:15px;color:${NOIR};padding:8px 0;border-bottom:1px solid #e5e5e5;text-align:right;">${v}</td>
    </tr>`).join('')
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">${rows}</table>`
}

function liste(items: string[]): string {
  return `<ul style="padding-left:20px;margin:0 0 24px;">${items
    .map(i => `<li style="font-size:15px;color:${NOIR};padding:3px 0;">${i}</li>`).join('')}</ul>`
}

function encart(contenu: string): string {
  return `<div style="border-left:3px solid ${BURGUNDY};background:${FOND};padding:14px 18px;margin:0 0 24px;font-size:15px;color:${NOIR};line-height:1.6;">${contenu}</div>`
}

function layout(contenu: string, title: string, piedSupplementaire = ''): string {
  const replyTo = esc(useRuntimeConfig().emailReplyTo)
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:${FOND};font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${FOND};padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:${NOIR};padding:28px 32px;text-align:center;">
            <img src="cid:${LOGO_EMAIL_CID}" width="179" height="77" alt="Dawky"
                 style="display:inline-block;width:179px;height:auto;border:0;color:#ffffff;font-size:28px;font-family:Georgia,serif;" />
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:36px 32px;">${contenu}</td>
        </tr>
        <tr>
          <td style="padding:20px 32px;text-align:center;">
            <p style="font-size:12px;color:${GRIS};margin:0;line-height:1.6;">
              Une question ? Répondez à cet email ou écrivez-nous à
              <a href="mailto:${replyTo}" style="color:${BURGUNDY};">${replyTo}</a>
            </p>
            ${piedSupplementaire}
            <p style="font-size:11px;color:#999999;margin:8px 0 0;">© ${new Date().getFullYear()} Dawky</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

async function envoyer(to: string, subject: string, contenu: string, piedSupplementaire = '') {
  const config = useRuntimeConfig()
  // Resend ne lève pas d'exception : une erreur (expéditeur non vérifié,
  // quota…) est renvoyée dans `error` et doit être remontée explicitement.
  const { error } = await getResend().emails.send({
    from: config.emailFrom as string,
    replyTo: config.emailReplyTo as string,
    to,
    subject,
    html: layout(contenu, subject, piedSupplementaire),
    // Logo de l'en-tête, joint en image intégrée (cid:)
    attachments: [{
      filename: 'dawky.png',
      content: LOGO_EMAIL_PNG_BASE64,
      contentType: 'image/png',
      inlineContentId: LOGO_EMAIL_CID,
    }],
  })
  if (error) throw new Error(`Resend : ${error.message}`)
}

function rappelChien(nomChien: string, taille: string): string {
  return encart(`Box adaptée à <strong>${esc(nomChien)}</strong> (taille ${esc(taille)})`)
}

function sansAllergenes(allergenes: string[]): string {
  if (allergenes.length === 0) return ''
  return encart(`Sans : <strong>${allergenes.map(esc).join(', ')}</strong>`)
}

// ─── Compte ───────────────────────────────

export async function sendWelcomeEmail(to: string, prenom: string) {
  await envoyer(to, `Bienvenue chez Dawky, ${prenom}`, `
    ${titre(`Bienvenue, ${esc(prenom)}`)}
    ${para('Votre compte Dawky est créé. Chaque mois, une box adaptée à la taille de votre chien, avec un jouet, une friandise, un produit à mâcher et un accessoire.')}
    ${para('Pas encore sûr de la taille ? Notre quiz vous guide en 3 étapes.')}
    ${bouton(`${appUrl()}/quiz`, 'Trouver la box de mon chien')}`)
}

export async function sendReinitialisationMotDePasse(to: string, lien: string) {
  await envoyer(to, 'Choisir un nouveau mot de passe Dawky', `
    ${titre('Nouveau mot de passe')}
    ${para('Vous avez demandé à changer le mot de passe de votre compte Dawky. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.')}
    ${bouton(lien, 'Choisir un nouveau mot de passe')}
    ${petit('Ce lien est valable une heure et ne fonctionne qu\'une fois. Si vous n\'êtes pas à l\'origine de cette demande, ignorez cet email : votre mot de passe actuel reste valable.')}`)
}

// ─── Quiz ─────────────────────────────────

export async function sendQuizRecommandation(to: string, d: {
  nomChien: string
  taille: string
  formule: 'SURPRISE' | 'COMPOSE'
  prix: number | null
  allergenes: string[]
}) {
  const estCompose = d.formule === 'COMPOSE'
  await envoyer(to, `La box idéale pour ${d.nomChien}`, `
    ${titre(`La recommandation pour ${esc(d.nomChien)}`)}
    ${recap([
      ['Taille conseillée', esc(LIBELLES_TAILLE[d.taille] ?? d.taille)],
      ['Formule conseillée', estCompose ? 'Compose ta box' : 'Box Surprise'],
      ...(d.prix !== null ? [['Prix', `${formatPrix(d.prix)}${estCompose ? '' : ' / mois'}`] as [string, string]] : []),
    ])}
    ${d.allergenes.length > 0
      ? para(`Vous avez signalé : <strong>${d.allergenes.map(esc).join(', ')}</strong>. Dans Compose ta box, ces allergènes sont filtrés automatiquement et chaque produit affiche sa composition complète.`)
      : ''}
    ${bouton(`${appUrl()}/${estCompose ? 'compose-ta-box' : 'abonnement'}?taille=${esc(d.taille)}`,
      estCompose ? 'Composer ma box' : 'Découvrir la Box Surprise')}`)
}

// ─── Abonnement ───────────────────────────

export async function sendAbonnementConfirmation(to: string, d: {
  prenom: string
  nomChien: string
  taille: string
  prixMensuel: number
  premiereLivraison: Date
  livraison: string
  allergenes: string[]
}) {
  await envoyer(to, 'Votre abonnement Dawky est actif', `
    ${titre('Votre abonnement est actif')}
    ${para(`Bonjour ${esc(d.prenom)}, merci pour votre confiance. Voici le récapitulatif de votre abonnement.`)}
    ${rappelChien(d.nomChien, d.taille)}
    ${recap([
      ['Formule', 'Box Surprise mensuelle'],
      ['Taille', esc(LIBELLES_TAILLE[d.taille] ?? d.taille)],
      ['Prix', `${formatPrix(d.prixMensuel)} / mois`],
      ['Engagement', 'Sans engagement, résiliable à tout moment'],
      ['Première livraison', `à partir du ${dateFr(d.premiereLivraison)}`],
      ['Livraison', esc(d.livraison)],
    ])}
    ${sansAllergenes(d.allergenes)}
    ${bouton(`${appUrl()}/mon-compte`, 'Gérer mon abonnement')}`)
}

export async function sendAbonnementResiliation(to: string, d: { prenom: string; nomChien: string; dateFin: Date | null }) {
  await envoyer(to, 'Résiliation de votre abonnement Dawky', `
    ${titre('Votre résiliation est enregistrée')}
    ${para(`Bonjour ${esc(d.prenom)}, l'abonnement de <strong>${esc(d.nomChien)}</strong> est résilié.`)}
    ${d.dateFin ? para(`Vous ne serez plus prélevé(e). La période déjà payée reste due jusqu'au <strong>${dateFr(d.dateFin)}</strong>.`) : ''}
    ${petit('Vous pouvez vous réabonner à tout moment depuis votre espace client.')}`)
}

export async function sendAbonnementChangementTaille(to: string, d: {
  prenom: string; nomChien: string; ancienneTaille: string; nouvelleTaille: string; prixMensuel: number
}) {
  await envoyer(to, 'Changement de taille de votre box', `
    ${titre('Nouvelle taille enregistrée')}
    ${para(`Bonjour ${esc(d.prenom)}, la box de <strong>${esc(d.nomChien)}</strong> passe de la taille ${esc(d.ancienneTaille)} à la taille <strong>${esc(d.nouvelleTaille)}</strong>.`)}
    ${recap([
      ['Nouvelle taille', esc(LIBELLES_TAILLE[d.nouvelleTaille] ?? d.nouvelleTaille)],
      ['Nouveau prix', `${formatPrix(d.prixMensuel)} / mois`],
      ['Prise en compte', 'dès la prochaine période'],
    ])}`)
}

export async function sendAbonnementPause(to: string, d: { prenom: string; nomChien: string; reprise: Date }) {
  await envoyer(to, 'Votre abonnement est en pause', `
    ${titre('Abonnement en pause')}
    ${para(`Bonjour ${esc(d.prenom)}, l'abonnement de <strong>${esc(d.nomChien)}</strong> est en pause. Aucun prélèvement ni envoi pendant cette période.`)}
    ${recap([['Reprise automatique', dateFr(d.reprise)]])}
    ${petit('Vous pouvez reprendre plus tôt depuis votre espace client.')}`)
}

export async function sendRappelRenouvellement(to: string, d: { prenom: string; date: Date; montant: number }) {
  await envoyer(to, 'Votre prochaine box Dawky arrive', `
    ${titre('Prochain renouvellement')}
    ${para(`Bonjour ${esc(d.prenom)}, votre abonnement sera renouvelé le <strong>${dateFr(d.date)}</strong> pour <strong>${formatPrix(d.montant)}</strong>.`)}
    ${petit('Pour changer de taille, mettre en pause ou résilier, rendez-vous dans votre espace client.')}
    ${bouton(`${appUrl()}/mon-compte`, 'Mon espace client')}`)
}

// ─── Commandes ────────────────────────────

export async function sendCommandeConfirmation(to: string, d: {
  prenom: string
  numero: number
  titreCommande: string
  nomChien?: string | null
  taille: string
  produits: string[]
  total: number
  sansAllergenes: string[]
}) {
  await envoyer(to, `Commande n°${d.numero} confirmée`, `
    ${titre('Commande confirmée')}
    ${para(`Bonjour ${esc(d.prenom)}, votre ${esc(d.titreCommande)} est en préparation.`)}
    ${d.nomChien ? rappelChien(d.nomChien, d.taille) : ''}
    ${d.produits.length > 0 ? liste(d.produits.map(esc)) : ''}
    ${sansAllergenes(d.sansAllergenes)}
    ${recap([
      ['Commande', `n°${d.numero}`],
      ['Total payé', formatPrix(d.total)],
      ['Expédition estimée', 'sous 48 h ouvrées'],
    ])}
    ${petit('Votre facture est disponible dans votre espace client.')}`)
}

export async function sendExpedition(to: string, d: {
  prenom: string; numero: number; destinataire: string; transporteur?: string | null; numeroSuivi?: string | null
}) {
  await envoyer(to, `Votre box Dawky est en route`, `
    ${titre('Votre box est expédiée')}
    ${para(`Bonjour ${esc(d.prenom)}, la commande n°${d.numero} vient de partir pour <strong>${esc(d.destinataire)}</strong>.`)}
    ${d.numeroSuivi ? recap([
      ['Transporteur', esc(d.transporteur ?? '—')],
      ['Numéro de suivi', esc(d.numeroSuivi)],
    ]) : ''}
    ${petit('Vous recevrez un email dès que la box sera livrée.')}`)
}

export async function sendLivraison(to: string, d: { prenom: string; numero: number; destinataire: string }) {
  await envoyer(to, 'Votre box Dawky est livrée', `
    ${titre('Box livrée')}
    ${para(`Bonjour ${esc(d.prenom)}, la commande n°${d.numero} a bien été livrée à <strong>${esc(d.destinataire)}</strong>.`)}
    ${petit('Un souci avec la taille ou le contenu ? Notre garantie taille et satisfaction s\'applique : répondez simplement à cet email.')}`)
}

// ─── Cadeaux ──────────────────────────────

export async function sendCadeauConfirmation(to: string, d: {
  prenom: string; dureeMois: number; taille: string; total: number
  destinataire: string; adresse: string; premiereLivraison: Date
}) {
  await envoyer(to, 'Votre cadeau Dawky est confirmé', `
    ${titre('Votre cadeau est confirmé')}
    ${para(`Bonjour ${esc(d.prenom)}, merci ! L'abonnement offert est actif.`)}
    ${recap([
      ['Durée', `${d.dureeMois} mois, sans renouvellement automatique`],
      ['Taille', esc(LIBELLES_TAILLE[d.taille] ?? d.taille)],
      ['Total payé', formatPrix(d.total)],
      ['Pour', esc(d.destinataire)],
      ['Adresse', esc(d.adresse)],
      ['Première livraison', `à partir du ${dateFr(d.premiereLivraison)}`],
    ])}
    ${para('Vous recevrez un email à chaque expédition et à chaque livraison.')}`)
}

export async function sendCadeauAnnonce(to: string, d: { destPrenom: string; acheteurPrenom: string; dureeMois: number; message?: string | null }) {
  await envoyer(to, `${d.acheteurPrenom} vous offre une surprise Dawky`, `
    ${titre(`Une surprise vous attend, ${esc(d.destPrenom)}`)}
    ${para(`<strong>${esc(d.acheteurPrenom)}</strong> vous offre ${d.dureeMois} mois de box Dawky pour votre chien. La première arrive le 1er du mois prochain. Le contenu reste une surprise !`)}
    ${d.message ? encart(`« ${esc(d.message)} »`) : ''}`)
}

export async function sendCadeauRappelFin(to: string, d: { prenom: string; destinataire: string; dateDerniereBox: Date }) {
  await envoyer(to, 'Votre cadeau Dawky touche à sa fin', `
    ${titre('Bientôt la dernière box')}
    ${para(`Bonjour ${esc(d.prenom)}, la dernière box offerte à <strong>${esc(d.destinataire)}</strong> partira le <strong>${dateFr(d.dateDerniereBox)}</strong>.`)}
    ${para('L\'abonnement s\'arrêtera ensuite, sans reconduction. Vous pouvez le prolonger si vous le souhaitez.')}
    ${bouton(`${appUrl()}/offrir`, 'Prolonger le cadeau')}`)
}

// ─── Fidélisation ─────────────────────────

export async function sendParrainageValide(to: string, prenom: string, filleulPrenom: string, pourcentage: number, surAbonnement: boolean) {
  await envoyer(to, 'Votre parrainage est validé', `
    ${titre('Merci pour votre parrainage')}
    ${para(`Bonjour ${esc(prenom)}, <strong>${esc(filleulPrenom)}</strong> vient de rejoindre Dawky grâce à vous.`)}
    ${para(surAbonnement
      ? `Vous bénéficiez de <strong>${pourcentage} %</strong> de réduction sur votre prochaine échéance.`
      : `Vous bénéficiez de <strong>${pourcentage} %</strong> de réduction sur votre prochain achat.`)}`)
}

export async function sendAlerteStock(to: string, prenom: string, taille: string) {
  await envoyer(to, 'De nouveaux produits sont disponibles', `
    ${titre('C\'est de retour')}
    ${para(`Bonjour ${esc(prenom)}, de nouveaux produits en taille <strong>${esc(taille)}</strong> sont disponibles dans Compose ta box. Les quantités sont limitées.`)}
    ${bouton(`${appUrl()}/compose-ta-box?taille=${esc(taille)}`, 'Voir les produits')}`)
}

export async function sendAnniversaire(to: string, d: { prenom: string; nomChien: string; age: number }) {
  await envoyer(to, `Joyeux anniversaire ${d.nomChien}`, `
    ${titre(`Joyeux anniversaire, ${esc(d.nomChien)}`)}
    ${para(`Bonjour ${esc(d.prenom)}, ${esc(d.nomChien)} fête ses ${d.age} an${d.age > 1 ? 's' : ''} aujourd'hui. Toute l'équipe Dawky lui souhaite une belle journée !`)}
    ${petit('Pensez à mettre à jour son poids dans votre espace client : la taille de sa box en dépend.')}`)
}

// ─── Newsletter et contact ────────────────

export async function sendNewsletterConfirmation(to: string, prenom: string | undefined, token: string) {
  const lien = `${appUrl()}/newsletter/desinscription?token=${encodeURIComponent(token)}`
  await envoyer(to, 'Inscription à la newsletter Dawky', `
    ${titre('Inscription confirmée')}
    ${para(`${prenom ? `Bonjour ${esc(prenom)}, v` : 'V'}ous êtes inscrit(e) à la newsletter Dawky : thèmes des prochaines box, nouveautés et conseils.`)}`,
  `<p style="font-size:12px;margin:8px 0 0;"><a href="${esc(lien)}" style="color:${GRIS};">Se désinscrire</a></p>`)
}

export async function sendContactAccuse(to: string, prenom: string, sujet: string) {
  await envoyer(to, 'Nous avons bien reçu votre message', `
    ${titre('Message bien reçu')}
    ${para(`Bonjour ${esc(prenom)}, merci pour votre message « ${esc(sujet)} ». Notre équipe vous répond sous 48 h ouvrées.`)}`)
}

// ─── Équipe Dawky ─────────────────────────

function emailEquipe(): string {
  const config = useRuntimeConfig()
  return (config.emailEquipe || config.emailReplyTo) as string
}

export async function sendAlerteAllergieEquipe(d: {
  client: { prenom: string; nom: string; email: string; telephone?: string | null }
  chien: { nom: string; taille: string; race?: string | null }
  allergenes: string[]
  allergiesAutres?: string | null
  sensibleTraces: boolean
}) {
  await envoyer(emailEquipe(), `[Allergie] ${d.chien.nom} — à contacter`, `
    ${titre('Nouvelle allergie à traiter')}
    ${recap([
      ['Client', esc(`${d.client.prenom} ${d.client.nom}`)],
      ['Email', esc(d.client.email)],
      ['Téléphone', esc(d.client.telephone ?? '—')],
      ['Chien', esc(`${d.chien.nom} (${d.chien.race ?? 'race non précisée'}, taille ${d.chien.taille})`)],
      ['Allergènes', esc(d.allergenes.join(', ') || '—')],
      ['Autres', esc(d.allergiesAutres ?? '—')],
      ['Sensible aux traces', d.sensibleTraces ? 'Oui' : 'Non'],
    ])}
    ${para('Contactez le client puis validez son profil sans allergènes dans le back-office avant l\'expédition.')}
    ${bouton(`${appUrl()}/admin`, 'Ouvrir le back-office')}`)
}

export async function sendNouveauContactEquipe(d: { prenom: string; nom: string; email: string; sujet: string; message: string }) {
  await envoyer(emailEquipe(), `[Contact] ${d.sujet}`, `
    ${titre('Nouveau message')}
    ${recap([
      ['De', esc(`${d.prenom} ${d.nom}`)],
      ['Email', esc(d.email)],
      ['Sujet', esc(d.sujet)],
    ])}
    ${para(esc(d.message).replace(/\n/g, '<br/>'))}`)
}
