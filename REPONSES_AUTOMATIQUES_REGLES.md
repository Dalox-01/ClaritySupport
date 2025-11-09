# Règles de Réponses Automatiques - ClaritySupport

## 🚨 RÈGLE CRITIQUE - SÉCURITÉ

### L'IA NE DOIT RÉPONDRE QU'AUX EMAILS DE SUPPORT CLIENT

**JAMAIS de réponse automatique pour :**
- ❌ Catégorie `urgent`
- ❌ Catégorie `autre`
- ❌ Support catégorie `urgent`
- ❌ Support catégorie `autre`

Ces emails **NÉCESSITENT TOUJOURS** une validation manuelle.

## Catégories autorisées pour les réponses automatiques

✅ **Support Client classique :**
- `commande` - Questions sur les commandes
- `remboursement` - Demandes de remboursement
- `question-produit` - Questions sur les produits
- `suivi-commande` - Suivi de livraison
- `sav` - Service Après-Vente
- `reclamation` - Réclamations clients
- `information` - Demandes d'information
- `facturation` - Questions de facturation
- `technique` - Support technique

## Implémentation

### 1. Fichier: `app/api/mail-center/process-auto-reply/route.ts`

```typescript
// SÉCURITÉ: Ne JAMAIS envoyer de réponse automatique pour "urgent" et "autre"
if (email.category === 'urgent' || email.category === 'autre') {
  console.log(`⚠️ Auto-reply BLOCKED for category: ${email.category}`);
  
  await supabase
    .from('emails_cache')
    .update({
      requires_validation: true,
      reply_status: 'pending',
    })
    .eq('id', email.id);

  return NextResponse.json({ 
    message: `Catégorie ${email.category} - Validation manuelle obligatoire`,
    skipped: true,
    reason: 'auto_reply_disabled_for_category'
  });
}

// De même pour les support_category
if (email.support_category === 'urgent' || email.support_category === 'autre') {
  console.log(`⚠️ Auto-reply BLOCKED for support_category: ${email.support_category}`);
  
  await supabase
    .from('emails_cache')
    .update({
      requires_validation: true,
      reply_status: 'pending',
    })
    .eq('id', email.id);

  return NextResponse.json({ 
    message: `Support catégorie ${email.support_category} - Validation manuelle obligatoire`,
    skipped: true,
    reason: 'auto_reply_disabled_for_support_category'
  });
}
```

### 2. Fichier: `app/api/mail-center/auto-reply/route.ts`

Même logique de blocage pour le traitement en batch.

## Pourquoi ces restrictions ?

### Catégorie "Urgent"
- Emails urgents nécessitent une attention immédiate et personnalisée
- Risque élevé si l'IA se trompe ou donne une mauvaise réponse
- Impact critique sur la satisfaction client
- Peut nécessiter une escalade vers un manager

### Catégorie "Autre"
- Nature imprévisible du contenu
- L'IA pourrait ne pas comprendre le contexte
- Risque de réponses inappropriées ou hors sujet
- Peut concerner des sujets sensibles non détectés

## Comportement attendu

Quand un email est classé "urgent" ou "autre" :

1. ✅ Email reçu et classifié par l'IA
2. ✅ Email marqué `requires_validation: true`
3. ✅ Email marqué `reply_status: 'pending'`
4. ✅ Log dans la console : `⚠️ Auto-reply BLOCKED for category: urgent`
5. ✅ Email visible dans l'interface avec badge "Validation requise"
6. ❌ **AUCUNE** réponse automatique envoyée
7. ✅ Notification à l'utilisateur pour traitement manuel

## Tests à effectuer

### Test 1 : Email urgent
```
Sujet: URGENT - Problème majeur
Résultat attendu: Aucune réponse auto, statut "pending"
```

### Test 2 : Email "autre"
```
Sujet: Question bizarre
Catégorie: autre
Résultat attendu: Aucune réponse auto, statut "pending"
```

### Test 3 : Email support normal
```
Sujet: Question sur ma commande
Catégorie: commande
Résultat attendu: Réponse automatique envoyée
```

## Logs de débogage

Pour vérifier que la sécurité fonctionne, cherchez dans les logs :

```
⚠️ Auto-reply BLOCKED for category: urgent
⚠️ Auto-reply BLOCKED for support_category: autre
```

---

**Date de mise en place :** 9 novembre 2024  
**Dernière modification :** 9 novembre 2024  
**Responsable :** Système de sécurité ClaritySupport
