/**
 * Shopify Order Minifier
 * Optimisé pour réduire la consommation de tokens LLM
 */

export interface ShopifyOrder {
  name: string;
  order_number: number;
  created_at: string;
  financial_status: string;
  fulfillment_status: string | null;
  total_price: string;
  currency: string;
  shipping_address?: {
    city: string;
    country: string;
  };
  line_items: Array<{
    name: string;
    quantity: number;
    variant_title?: string | null;
  }>;
  fulfillments?: Array<{
    tracking_url?: string;
    tracking_company?: string;
  }>;
}

/**
 * Minifie un objet commande Shopify pour l'ingestion par une IA.
 * Réduit drastiquement la taille du JSON en un résumé textuel dense.
 * 
 * @param order L'objet commande Shopify complet
 * @returns Une chaîne de caractères optimisée pour les tokens
 */
export function minifyShopifyOrder(order: ShopifyOrder | null | undefined): string {
  // Gestion d'erreur : Objet null ou undefined
  if (!order) {
    return "Aucune commande récente trouvée associée à cet email.";
  }

  const lines: string[] = [];

  // 1. En-tête : Référence, Date, Total
  // Format date : JJ/MM/AAAA
  const dateObj = new Date(order.created_at);
  const formattedDate = dateObj.toLocaleDateString('fr-FR');
  
  // Optimisation : On combine tout sur une ligne pour économiser des sauts de ligne (tokens)
  lines.push(`[CONTEXTE COMMANDE]`);
  lines.push(`Ref: ${order.name} | Date: ${formattedDate} | Total: ${order.total_price} ${order.currency}`);

  // 2. Statuts
  lines.push(`Statut Paiement: ${order.financial_status}`);
  
  // Logique métier : fulfillment_status null -> "Non expédié"
  const shippingStatus = order.fulfillment_status || "Non expédié";
  
  // Récupération du tracking (le premier trouvé)
  let trackingInfo = "";
  if (order.fulfillments && order.fulfillments.length > 0) {
    const f = order.fulfillments[0];
    if (f.tracking_company) trackingInfo += ` (${f.tracking_company})`;
  }
  
  lines.push(`Statut Logistique: ${shippingStatus}${trackingInfo}`);

  // Lien de suivi si présent
  if (order.fulfillments && order.fulfillments.length > 0) {
    const f = order.fulfillments[0];
    if (f.tracking_url) {
      lines.push(`Suivi: ${f.tracking_url}`);
    }
  }

  // 3. Panier (Articles)
  // Format compact : "1x Produit (Variante), 2x Autre..."
  const itemsSummary = order.line_items.map(item => {
    const variant = item.variant_title ? ` (${item.variant_title})` : '';
    return `${item.quantity}x ${item.name}${variant}`;
  }).join(', ');
  
  lines.push(`Panier: ${itemsSummary}.`);

  // 4. Destination
  if (order.shipping_address) {
    lines.push(`Dest: ${order.shipping_address.city}, ${order.shipping_address.country}.`);
  } else {
    lines.push(`Dest: N/A.`);
  }

  // 5. Règles de gestion (Alertes)
  // Si > 14 jours ET non expédié -> ALERTE
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - dateObj.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 14 && !order.fulfillment_status) {
    lines.push(`[ALERTE: RETARD ANORMAL DETECTÉ]`);
  }

  return lines.join('\n');
}
