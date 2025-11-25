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
 * Version ULTRA-OPTIMISÉE pour réduire la consommation de tokens au strict minimum.
 * Format: "Cmd:ID Date Prix Statut -> Dest. Items [ALERTE]"
 */
export function minifyShopifyOrder(order: ShopifyOrder | null | undefined): string {
  if (!order) return "N/A";

  const dateObj = new Date(order.created_at);
  // Format court: JJ/MM
  const date = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' });
  
  // Statuts courts
  const fin = order.financial_status === 'paid' ? 'Payé' : order.financial_status.substring(0, 3);
  const ship = order.fulfillment_status ? 'Exp' : 'Attente';
  
  // Tracking: juste le transporteur si dispo
  const track = order.fulfillments?.[0]?.tracking_company ? `(${order.fulfillments[0].tracking_company})` : '';

  // Items: "2xProdA, 1xProdB"
  const items = order.line_items.map(i => {
    // On tronque les noms trop longs
    const name = i.name.length > 15 ? i.name.substring(0, 12) + '..' : i.name;
    return `${i.quantity}x${name}`;
  }).join(',');

  // Dest: Ville, Pays (Code)
  const dest = order.shipping_address 
    ? `${order.shipping_address.city}` 
    : '?';

  // Alerte retard (>7j sans expédition)
  const now = new Date();
  const diffDays = Math.ceil(Math.abs(now.getTime() - dateObj.getTime()) / (86400000));
  const alert = (diffDays > 7 && !order.fulfillment_status) ? " [!RETARD]" : "";

  // Assemblage sur une seule ligne dense
  return `${order.name} ${date} ${Math.round(parseFloat(order.total_price))}€ ${fin}/${ship}${track} -> ${dest}. ${items}${alert}`;
}
