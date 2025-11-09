// Helpers pour l'intégration Outlook/Microsoft Graph API

import { Client } from '@microsoft/microsoft-graph-client';
import { ConfidentialClientApplication } from '@azure/msal-node';
import 'isomorphic-fetch';
import type { OutlookMessage } from './mail-center-types';

const msalConfig = {
  auth: {
    clientId: process.env.MICROSOFT_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/common`,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
  },
};

const redirectUri = process.env.NEXT_PUBLIC_APP_URL + '/api/mail-center/outlook/callback';

/**
 * Génère l'URL d'authentification Outlook
 */
export function getOutlookAuthUrl(userId: string): string {
  const cca = new ConfidentialClientApplication(msalConfig);
  
  const authCodeUrlParameters = {
    scopes: [
      'https://graph.microsoft.com/Mail.Read',
      'https://graph.microsoft.com/Mail.Send',
      'https://graph.microsoft.com/Mail.ReadWrite',
      'offline_access',
    ],
    redirectUri,
    state: userId,
  };

  return cca.getAuthCodeUrl(authCodeUrlParameters).toString();
}

/**
 * Échange le code d'autorisation contre des tokens
 */
export async function exchangeOutlookCode(code: string) {
  const cca = new ConfidentialClientApplication(msalConfig);
  
  const tokenRequest = {
    code,
    scopes: [
      'https://graph.microsoft.com/Mail.Read',
      'https://graph.microsoft.com/Mail.Send',
      'https://graph.microsoft.com/Mail.ReadWrite',
      'offline_access',
    ],
    redirectUri,
  };

  const response = await cca.acquireTokenByCode(tokenRequest);

  return {
    access_token: response!.accessToken,
    refresh_token: response!.account?.homeAccountId || '',
    expiry_date: response!.expiresOn!.getTime(),
  };
}

/**
 * Rafraîchit le token d'accès Outlook
 */
export async function refreshOutlookToken(refreshToken: string) {
  const cca = new ConfidentialClientApplication(msalConfig);
  
  const refreshTokenRequest = {
    refreshToken,
    scopes: [
      'https://graph.microsoft.com/Mail.Read',
      'https://graph.microsoft.com/Mail.Send',
      'https://graph.microsoft.com/Mail.ReadWrite',
    ],
  };

  const response = await cca.acquireTokenByRefreshToken(refreshTokenRequest);

  return {
    access_token: response!.accessToken,
    expiry_date: response!.expiresOn!.getTime(),
  };
}

/**
 * Crée un client Microsoft Graph
 */
function createGraphClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

/**
 * Récupère les derniers emails Outlook
 */
export async function fetchOutlookMessages(
  accessToken: string,
  maxResults: number = 50
): Promise<OutlookMessage[]> {
  const client = createGraphClient(accessToken);

  try {
    const response = await client
      .api('/me/mailFolders/inbox/messages')
      .top(maxResults)
      .select('id,conversationId,subject,bodyPreview,from,toRecipients,receivedDateTime,body,hasAttachments')
      .orderby('receivedDateTime DESC')
      .get();

    return response.value as OutlookMessage[];
  } catch (error) {
    console.error('Error fetching Outlook messages:', error);
    throw error;
  }
}

/**
 * Parse un message Outlook
 */
export function parseOutlookMessage(message: OutlookMessage) {
  return {
    id: message.id,
    threadId: message.conversationId,
    from_email: message.from.emailAddress.address,
    from_name: message.from.emailAddress.name || message.from.emailAddress.address,
    to_email: message.toRecipients[0]?.emailAddress.address || '',
    subject: message.subject,
    snippet: message.bodyPreview,
    body_text: message.body.contentType === 'text' ? message.body.content : '',
    body_html: message.body.contentType === 'html' ? message.body.content : '',
    received_at: new Date(message.receivedDateTime).toISOString(),
    has_attachments: message.hasAttachments,
    labels: [],
  };
}

/**
 * Envoie une réponse via Outlook
 */
export async function sendOutlookReply(
  accessToken: string,
  to: string,
  subject: string,
  bodyHtml: string,
  messageId?: string
) {
  const client = createGraphClient(accessToken);

  const email = {
    message: {
      subject,
      body: {
        contentType: 'HTML',
        content: bodyHtml,
      },
      toRecipients: [
        {
          emailAddress: {
            address: to,
          },
        },
      ],
    },
  };

  try {
    if (messageId) {
      // Répondre au message
      await client.api(`/me/messages/${messageId}/reply`).post(email);
    } else {
      // Nouveau message
      await client.api('/me/sendMail').post(email);
    }
  } catch (error) {
    console.error('Error sending Outlook reply:', error);
    throw error;
  }
}

/**
 * Marque un email Outlook comme lu
 */
export async function markOutlookAsRead(accessToken: string, messageId: string) {
  const client = createGraphClient(accessToken);

  try {
    await client.api(`/me/messages/${messageId}`).patch({
      isRead: true,
    });
  } catch (error) {
    console.error('Error marking Outlook as read:', error);
    throw error;
  }
}

/**
 * Configure les webhooks Outlook (subscriptions)
 */
export async function setupOutlookWebhook(
  accessToken: string,
  notificationUrl: string
) {
  const client = createGraphClient(accessToken);

  const subscription = {
    changeType: 'created',
    notificationUrl,
    resource: '/me/mailFolders/inbox/messages',
    expirationDateTime: new Date(Date.now() + 4230 * 60 * 1000).toISOString(), // 3 jours max
    clientState: 'secretClientValue',
  };

  try {
    const response = await client.api('/subscriptions').post(subscription);
    return response;
  } catch (error) {
    console.error('Error setting up Outlook webhook:', error);
    throw error;
  }
}
