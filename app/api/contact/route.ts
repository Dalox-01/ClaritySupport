import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, subject, message } = body;

    // Validation des champs
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont obligatoires' },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Adresse email invalide' },
        { status: 400 }
      );
    }

    // Vérification de la clé API Resend
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY non configurée');
      return NextResponse.json(
        { success: false, error: 'Configuration email manquante' },
        { status: 500 }
      );
    }

    // Initialisation de Resend avec la clé API
    const resend = new Resend(apiKey);

    // Envoi de l'email via Resend
    const { data, error } = await resend.emails.send({
      from: 'MailWizard Contact <onboarding@resend.dev>', // Utilisez votre domaine vérifié
      to: ['clarityteamfr@gmail.com'], // Votre email
      replyTo: email, // L'email de l'utilisateur pour pouvoir répondre directement
      subject: `[Contact MailWizard] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #2c7a7b 0%, #285e61 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #f7fafc;
                padding: 30px;
                border: 1px solid #e2e8f0;
                border-top: none;
              }
              .field {
                margin-bottom: 20px;
              }
              .label {
                font-weight: 600;
                color: #2d3748;
                margin-bottom: 5px;
                display: block;
              }
              .value {
                background: white;
                padding: 12px;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
              }
              .message-box {
                background: white;
                padding: 20px;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
                white-space: pre-wrap;
                line-height: 1.8;
              }
              .footer {
                background: #2d3748;
                color: #a0aec0;
                padding: 20px;
                text-align: center;
                border-radius: 0 0 10px 10px;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">📧 Nouveau message de contact</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Via MailWizard</p>
            </div>
            
            <div class="content">
              <div class="field">
                <span class="label">👤 Nom complet</span>
                <div class="value">${firstName} ${lastName}</div>
              </div>
              
              <div class="field">
                <span class="label">📧 Email</span>
                <div class="value"><a href="mailto:${email}" style="color: #2c7a7b; text-decoration: none;">${email}</a></div>
              </div>
              
              <div class="field">
                <span class="label">📋 Sujet</span>
                <div class="value">${subject}</div>
              </div>
              
              <div class="field">
                <span class="label">💬 Message</span>
                <div class="message-box">${message}</div>
              </div>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">Ce message a été envoyé depuis le formulaire de contact de MailWizard</p>
              <p style="margin: 10px 0 0 0;">Pour répondre, cliquez simplement sur "Répondre" à cet email</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'envoi du message' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Message envoyé avec succès', data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur API contact:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
