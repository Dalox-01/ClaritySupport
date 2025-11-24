export async function redirectToStripeCheckout(priceId: string): Promise<void> {
  if (!priceId) {
    throw new Error('Stripe price ID manquant');
  }

  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priceId }),
  });

  if (!response.ok) {
    let message = 'Impossible de créer la session de paiement Stripe';
    try {
      const payload = await response.json();
      if (payload?.error) {
        message = payload.error;
      }
    } catch (_) {
      // ignore JSON errors, fallback to default message
    }
    throw new Error(message);
  }

  const data = await response.json();
  const url = data?.url;
  if (!url) {
    throw new Error('URL Stripe absente de la réponse');
  }

  if (typeof window === 'undefined') {
    throw new Error('Redirection Stripe uniquement disponible côté client');
  }

  window.location.href = url as string;
}
