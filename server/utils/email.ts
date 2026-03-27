// server/utils/email.ts
// ─────────────────────────────────────────
// Service email Dawky via Resend
// ─────────────────────────────────────────

import { Resend } from 'resend'

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

// ─── Template HTML de base ───
function baseTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F5EFE0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5EFE0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#4A3728;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <div style="font-size:32px;font-weight:900;color:#D4883B;letter-spacing:-1px;font-family:Georgia,serif;">
              DAWKY
            </div>
            <div style="font-size:12px;color:rgba(245,239,224,.6);margin-top:4px;letter-spacing:.15em;text-transform:uppercase;">
              La box premium pour chiens
            </div>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="background:#ffffff;padding:40px;border-radius:0 0 16px 16px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;text-align:center;">
            <p style="font-size:12px;color:#8A7A65;margin:0;line-height:1.6;">
              Vous recevez cet email car vous êtes inscrit(e) chez Dawky.<br/>
              <a href="mailto:contact.dawky@gmail.com" style="color:#D4883B;">contact.dawky@gmail.com</a>
            </p>
            <p style="font-size:11px;color:#B0A090;margin:8px 0 0;">
              © ${new Date().getFullYear()} Dawky · La box qui s'adapte à votre chien
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── Emails disponibles ───────────────────

/**
 * Email de bienvenue après inscription
 */
export async function sendWelcomeEmail(to: string, prenom: string) {
  const config  = useRuntimeConfig()
  const resend  = getResend()
  const appUrl  = config.public.appUrl as string

  const content = `
    <h1 style="font-family:Georgia,serif;font-size:28px;color:#1C1A14;margin:0 0 16px;">
      Bienvenue, ${prenom} ! 🐾
    </h1>
    <p style="font-size:16px;color:#4A3728;line-height:1.7;margin:0 0 24px;">
      Votre compte Dawky est créé. Vous pouvez maintenant souscrire à la <strong>Box Surprise</strong>
      mensuelle ou composer votre <strong>Box À la Carte</strong>.
    </p>

    <div style="background:#FFF4E6;border-radius:12px;padding:24px;margin-bottom:24px;">
      <p style="font-size:14px;color:#4A3728;margin:0 0 16px;font-weight:600;">Ce qui vous attend :</p>
      <table cellpadding="0" cellspacing="0">
        <tr><td style="padding:4px 0;font-size:14px;color:#8A7A65;">🎁</td><td style="padding:4px 8px;font-size:14px;color:#8A7A65;">Box Surprise — sélection mensuelle par nos experts</td></tr>
        <tr><td style="padding:4px 0;font-size:14px;color:#8A7A65;">🛒</td><td style="padding:4px 8px;font-size:14px;color:#8A7A65;">Box À la Carte — choisissez vos produits librement</td></tr>
        <tr><td style="padding:4px 0;font-size:14px;color:#8A7A65;">📏</td><td style="padding:4px 8px;font-size:14px;color:#8A7A65;">Contenu adapté S, M ou L selon votre chien</td></tr>
        <tr><td style="padding:4px 0;font-size:14px;color:#8A7A65;">🌱</td><td style="padding:4px 8px;font-size:14px;color:#8A7A65;">Packaging 100% éco-conçu, zéro plastique</td></tr>
      </table>
    </div>

    <a href="${appUrl}/abonnement"
       style="display:inline-block;background:#4A3728;color:#F5EFE0;text-decoration:none;
              padding:14px 32px;border-radius:50px;font-size:15px;font-weight:600;margin-bottom:24px;">
      Découvrir les boxes →
    </a>

    <p style="font-size:13px;color:#8A7A65;margin:0;">
      Des questions ? Répondez directement à cet email ou écrivez-nous à
      <a href="mailto:contact.dawky@gmail.com" style="color:#D4883B;">contact.dawky@gmail.com</a>
    </p>`

  await resend.emails.send({
    from:     config.emailFrom as string,
    replyTo:  config.emailReplyTo as string,
    to,
    subject:  `Bienvenue chez Dawky, ${prenom} ! 🐾`,
    html:     baseTemplate(content, 'Bienvenue chez Dawky'),
  })
}

/**
 * Email de confirmation d'abonnement Box Surprise
 */
export async function sendAbonnementConfirmation(
  to: string,
  prenom: string,
  taille: string,
  prix: number,
) {
  const config = useRuntimeConfig()
  const resend = getResend()

  const tailleLabel: Record<string, string> = {
    S: 'S — jusqu\'à 10 kg',
    M: 'M — 10 à 25 kg',
    L: 'L — plus de 25 kg',
  }

  const content = `
    <h1 style="font-family:Georgia,serif;font-size:26px;color:#1C1A14;margin:0 0 16px;">
      Abonnement confirmé ! 🎉
    </h1>
    <p style="font-size:15px;color:#4A3728;line-height:1.7;margin:0 0 24px;">
      Bonjour ${prenom}, votre abonnement <strong>Box Surprise Dawky</strong> est actif.
      Votre première box sera expédiée le <strong>1er du mois prochain</strong>.
    </p>

    <div style="background:#FFF4E6;border:2px solid #D4883B;border-radius:12px;padding:24px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#8A7A65;padding:6px 0;">Formule</td>
          <td style="font-size:13px;color:#4A3728;font-weight:600;text-align:right;">Box Surprise Mensuelle</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#8A7A65;padding:6px 0;">Gabarit</td>
          <td style="font-size:13px;color:#4A3728;font-weight:600;text-align:right;">${tailleLabel[taille] ?? taille}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#8A7A65;padding:6px 0;">Prix mensuel</td>
          <td style="font-size:16px;color:#D4883B;font-weight:900;font-family:Georgia,serif;text-align:right;">${prix.toFixed(2).replace('.', ',')}€</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#8A7A65;padding:6px 0;">Engagement</td>
          <td style="font-size:13px;color:#4A3728;font-weight:600;text-align:right;">12 mois · Résiliable à tout moment</td>
        </tr>
      </table>
    </div>

    <p style="font-size:14px;color:#8A7A65;line-height:1.6;margin:0 0 20px;">
      Vous pouvez gérer votre abonnement (modifier la taille, résilier) depuis votre espace client.
    </p>

    <a href="${config.public.appUrl}/profil"
       style="display:inline-block;background:#4A3728;color:#F5EFE0;text-decoration:none;
              padding:12px 28px;border-radius:50px;font-size:14px;font-weight:600;">
      Mon espace client →
    </a>`

  await resend.emails.send({
    from:    config.emailFrom as string,
    replyTo: config.emailReplyTo as string,
    to,
    subject: `Votre abonnement Dawky est confirmé 🐾`,
    html:    baseTemplate(content, 'Abonnement confirmé — Dawky'),
  })
}

/**
 * Email de confirmation commande Box À la Carte
 */
export async function sendCommandeConfirmation(
  to: string,
  prenom: string,
  taille: string,
  produits: string[],
) {
  const config = useRuntimeConfig()
  const resend = getResend()

  const produitsHtml = produits.map(p => `
    <tr><td style="padding:5px 0;font-size:14px;color:#4A3728;">✦</td>
        <td style="padding:5px 8px;font-size:14px;color:#4A3728;">${p}</td></tr>
  `).join('')

  const content = `
    <h1 style="font-family:Georgia,serif;font-size:26px;color:#1C1A14;margin:0 0 16px;">
      Commande confirmée ! 📦
    </h1>
    <p style="font-size:15px;color:#4A3728;line-height:1.7;margin:0 0 24px;">
      Bonjour ${prenom}, votre <strong>Box À la Carte Dawky</strong> est en préparation.
    </p>

    <div style="background:#EDF2E8;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="font-size:13px;font-weight:600;color:#4A3728;margin:0 0 12px;text-transform:uppercase;letter-spacing:.08em;">
        Taille ${taille} · Vos produits
      </p>
      <table>${produitsHtml}</table>
    </div>

    <p style="font-size:13px;color:#8A7A65;margin:0;">
      Expédition prévue sous 48h. Vous recevrez un email de suivi avec votre numéro de colis.
    </p>`

  await resend.emails.send({
    from:    config.emailFrom as string,
    replyTo: config.emailReplyTo as string,
    to,
    subject: `Votre Box À la Carte Dawky est en préparation 🛒`,
    html:    baseTemplate(content, 'Commande confirmée — Dawky'),
  })
}

/**
 * Email de confirmation d'inscription newsletter
 */
export async function sendNewsletterConfirmation(to: string, prenom?: string) {
  const config = useRuntimeConfig()
  const resend = getResend()

  const content = `
    <h1 style="font-family:Georgia,serif;font-size:26px;color:#1C1A14;margin:0 0 16px;">
      Inscription confirmée ! 🎉
    </h1>
    <p style="font-size:15px;color:#4A3728;line-height:1.7;margin:0 0 24px;">
      ${prenom ? `Bonjour ${prenom}, v` : 'V'}ous êtes maintenant inscrit(e) à la newsletter Dawky.
      Vous recevrez chaque mois nos actualités, les thèmes des prochaines boxes et nos conseils d'experts.
    </p>
    <p style="font-size:14px;color:#8A7A65;line-height:1.6;margin:0 0 20px;">
      Pour vous désinscrire, répondez simplement à cet email avec "Désabonnement".
    </p>
    <a href="${config.public.appUrl}/abonnement"
       style="display:inline-block;background:#4A3728;color:#F5EFE0;text-decoration:none;
              padding:12px 28px;border-radius:50px;font-size:14px;font-weight:600;">
      Voir les boxes →
    </a>`

  await resend.emails.send({
    from:    config.emailFrom as string,
    replyTo: config.emailReplyTo as string,
    to,
    subject: 'Votre inscription à la newsletter Dawky est confirmée 🐾',
    html:    baseTemplate(content, 'Newsletter Dawky'),
  })
}
