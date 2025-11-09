// Helpers pour l'intégration Gmail API

import { google } from 'googleapis';
import type { GmailMessage } from './mail-center-types';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.NEXT_PUBLIC_APP_URL + '/api/mail-center/gmail/callback'
);

/**
 * Génère l'URL d'authentification Gmail
 */
export function getGmailAuthUrl(userId: string): string {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.labels',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state: userId, // Pour retrouver l'utilisateur au callback
  });
}

/**
 * Échange le code d'autorisation contre des tokens
 */
export async function exchangeGmailCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return {
    access_token: tokens.access_token!,
    refresh_token: tokens.refresh_token!,
    expiry_date: tokens.expiry_date!,
  };
}

/**
 * Rafraîchit le token d'accès
 */
export async function refreshGmailToken(refreshToken: string) {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  
  return {
    access_token: credentials.access_token!,
    expiry_date: credentials.expiry_date!,
  };
}

/**
 * Récupère les derniers emails
 */
export async function fetchGmailMessages(
  accessToken: string,
  maxResults: number = 50
): Promise<GmailMessage[]> {
  oauth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    // Liste des messages
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: 'in:inbox -in:trash -in:spam', // Seulement inbox, pas corbeille ni spam
    });

    const messages = listResponse.data.messages || [];
    
    // Récupération des détails de chaque message
    const fullMessages = await Promise.all(
      messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'full',
        });
        return detail.data as GmailMessage;
      })
    );

    return fullMessages;
  } catch (error) {
    console.error('Error fetching Gmail messages:', error);
    throw error;
  }
}

/**
 * Parse un message Gmail pour extraire les informations
 */
export function parseGmailMessage(message: GmailMessage) {
  const headers = message.payload.headers;
  
  const getHeader = (name: string) => 
    headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const from = getHeader('from');
  const to = getHeader('to');
  const subject = getHeader('subject');
  const date = getHeader('date');

  // Extraction du nom et email de l'expéditeur
  const fromMatch = from.match(/^(.*?)\s*<(.+?)>$/) || from.match(/^(.+)$/);
  const fromName = fromMatch?.[1]?.trim().replace(/"/g, '') || '';
  const fromEmail = fromMatch?.[2]?.trim() || fromMatch?.[1]?.trim() || '';

  // Extraction du corps
  let bodyText = '';
  let bodyHtml = '';

  function extractBody(part: any) {
    if (part.mimeType === 'text/plain' && part.body.data) {
      bodyText = Buffer.from(part.body.data, 'base64').toString('utf-8');
    }
    if (part.mimeType === 'text/html' && part.body.data) {
      bodyHtml = Buffer.from(part.body.data, 'base64').toString('utf-8');
    }
    if (part.parts) {
      part.parts.forEach(extractBody);
    }
  }

  if (message.payload.parts) {
    message.payload.parts.forEach(extractBody);
  } else if (message.payload.body.data) {
    bodyText = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
  }

  return {
    id: message.id,
    threadId: message.threadId,
    from_email: fromEmail,
    from_name: fromName || fromEmail,
    to_email: to,
    subject,
    snippet: message.snippet,
    body_text: bodyText,
    body_html: bodyHtml,
    received_at: new Date(parseInt(message.internalDate)).toISOString(),
    has_attachments: message.payload.parts?.some((p: any) => p.filename) || false,
    labels: message.labelIds || [],
  };
}

/**
 * Envoie un email via Gmail
 */
export async function sendGmailReply(
  accessToken: string,
  to: string,
  subject: string,
  bodyHtml: string,
  threadId?: string
) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const emailLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    '',
    bodyHtml,
  ];

  const email = emailLines.join('\r\n');
  const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  try {
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
        threadId: threadId || undefined,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error sending Gmail reply:', error);
    throw error;
  }
}

/**
 * Configure le webhook Gmail (Push notifications)
 */
export async function setupGmailPushNotifications(
  accessToken: string,
  topicName: string
) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const response = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName,
        labelIds: ['INBOX'],
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error setting up Gmail push notifications:', error);
    throw error;
  }
}

/**
 * Marque un email comme lu
 */
export async function markGmailAsRead(accessToken: string, messageId: string) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });
  } catch (error) {
    console.error('Error marking Gmail as read:', error);
    throw error;
  }
}
