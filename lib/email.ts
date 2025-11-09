import { Resend } from 'resend';
import { logError, logInfo } from './logger';

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@mailwizard.app';

export type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
};

export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; id?: string }> {
  try {
    logInfo('Sending email', { to: params.to, subject: params.subject });

    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      cc: params.cc,
      bcc: params.bcc,
    });

    if (result.error) {
      logError('Failed to send email', result.error);
      return { success: false };
    }

    logInfo('Email sent successfully', { id: result.data?.id });

    return { success: true, id: result.data?.id };
  } catch (error) {
    logError('Failed to send email', error);
    return { success: false };
  }
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await sendEmail({
    to,
    subject: 'Bienvenue sur MailWizard ! 🎉',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1E6F5C;">Bienvenue sur MailWizard !</h1>
        <p>Bonjour ${name},</p>
        <p>Merci de vous être inscrit sur MailWizard, votre assistant IA pour la rédaction d'emails professionnels.</p>
        <p>Avec votre compte gratuit, vous bénéficiez de :</p>
        <ul>
          <li>10 générations d'emails par mois</li>
          <li>5 templates réutilisables</li>
          <li>Export PDF</li>
        </ul>
        <p>Prêt à commencer ? <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/compose" style="color: #1E6F5C;">Créez votre premier email</a></p>
        <p>À bientôt,<br>L'équipe MailWizard</p>
      </div>
    `,
    text: `Bonjour ${name},\n\nMerci de vous être inscrit sur MailWizard ! Commencez dès maintenant à créer vos emails professionnels avec l'IA.\n\nÀ bientôt,\nL'équipe MailWizard`,
  });
}

export async function sendQuotaReachedEmail(to: string, name: string, plan: 'FREE' | 'PRO'): Promise<void> {
  await sendEmail({
    to,
    subject: 'Quota mensuel atteint - MailWizard',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1E6F5C;">Quota mensuel atteint</h1>
        <p>Bonjour ${name},</p>
        <p>Vous avez atteint votre limite mensuelle de génération d'emails pour votre plan ${plan}.</p>
        ${
          plan === 'FREE'
            ? `
        <p>Pour continuer à profiter de MailWizard sans limite, passez au plan Pro :</p>
        <ul>
          <li>5000 générations par mois</li>
          <li>Templates illimités</li>
          <li>Export PDF sans watermark</li>
          <li>Support prioritaire</li>
        </ul>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/app/pricing" style="color: #1E6F5C; font-weight: bold;">Passer au plan Pro</a></p>
        `
            : '<p>Votre quota se renouvellera automatiquement le mois prochain.</p>'
        }
        <p>Cordialement,<br>L'équipe MailWizard</p>
      </div>
    `,
  });
}

export async function sendUpgradeConfirmationEmail(to: string, name: string): Promise<void> {
  await sendEmail({
    to,
    subject: 'Bienvenue dans MailWizard Pro ! 🚀',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1E6F5C;">Bienvenue dans Pro !</h1>
        <p>Bonjour ${name},</p>
        <p>Félicitations ! Votre compte MailWizard a été mis à niveau vers Pro.</p>
        <p>Vous avez maintenant accès à :</p>
        <ul>
          <li>5000 générations d'emails par mois</li>
          <li>Templates illimités</li>
          <li>Export PDF sans watermark</li>
          <li>Support prioritaire</li>
        </ul>
        <p>Merci de votre confiance !</p>
        <p>L'équipe MailWizard</p>
      </div>
    `,
  });
}
