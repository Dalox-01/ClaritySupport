'use client';

import { useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function ExtensionAuthPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const isExtension = searchParams.get('extension') === 'true';

  useEffect(() => {
    if (status === 'authenticated' && session?.user && isExtension) {
      // Envoyer les données à l'extension
      sendAuthToExtension();
    } else if (status === 'unauthenticated' && isExtension) {
      // Construire l'URL de callback avec le paramètre extension
      const callbackUrl = `${window.location.origin}/extension-auth?extension=true`;
      // Rediriger vers la connexion Google
      signIn('google', { callbackUrl });
    }
  }, [status, session, isExtension]);

  const sendAuthToExtension = async () => {
    try {
      console.log('🔐 Envoi des données d\'authentification à l\'extension...');
      
      // Récupérer les données utilisateur
      let usage = null;
      try {
        const usageRes = await fetch('/api/usage');
        if (usageRes.ok) {
          const usageData = await usageRes.json();
          usage = usageData.data || usageData;
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch usage data:', error);
      }

      const authData = {
        type: 'AUTH_SUCCESS',
        token: 'session-token', // En production, utilisez un vrai token
        user: {
          email: session?.user?.email,
          name: session?.user?.name,
          plan: session?.user?.plan || 'FREE'
        },
        usage: usage || {
          plan: session?.user?.plan || 'FREE',
          used: 0,
          limit: 10
        }
      };

      console.log('📦 Données préparées:', authData);

      // Envoyer via window.postMessage pour le content script
      window.postMessage(authData, window.location.origin);
      console.log('✅ Message envoyé via window.postMessage');

      // Sauvegarder aussi dans localStorage comme backup
      localStorage.setItem('mailwiz_auth', JSON.stringify(authData));
      console.log('✅ Données sauvegardées dans localStorage');

      // Fermer la fenêtre après 2 secondes
      console.log('⏱️ Fermeture de la fenêtre dans 2 secondes...');
      setTimeout(() => {
        window.close();
      }, 2000);
    } catch (error) {
      console.error('❌ Error sending auth to extension:', error);
    }
  };

  if (!isExtension) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Page non accessible</h1>
          <p className="text-muted-foreground mt-2">Cette page est réservée à l'extension</p>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Connexion en cours...</p>
        </div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-8 bg-card rounded-lg shadow-lg">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">✅ Connexion réussie !</h1>
          <p className="text-muted-foreground mb-4">
            Bienvenue {session.user?.name || session.user?.email}
          </p>
          <p className="text-sm text-muted-foreground">
            Cette fenêtre va se fermer automatiquement...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-8 bg-card rounded-lg shadow-lg">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">🔐 Connexion requise</h1>
          <p className="text-muted-foreground mb-4">
            Vous allez être redirigé vers la page de connexion...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return null;
}
