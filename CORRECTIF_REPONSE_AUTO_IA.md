# 🤖 Correctif : Système de Réponse Automatique IA

**Date :** 25 novembre 2024  
**Problème :** Le système de réponse automatique IA ne se déclenche pas quand un email arrive

---

## 🔍 Problème Identifié

Le bouton IA était fonctionnel pour activer/désactiver le flag, **MAIS** :
- ❌ Aucun traitement automatique ne se déclenchait à l'arrivée d'un nouvel email
- ❌ L'API `/api/mail-center/auto-reply` existait mais n'était jamais appelée automatiquement
- ❌ Les emails restaient en attente sans réponse même avec l'IA activée

## ✅ Solution Implémentée

### 1. **Traitement automatique à la synchronisation**

Ajout du déclenchement automatique dans **3 points d'entrée** :

#### A. `/api/mail-center/check-new/route.ts`
- Quand un nouvel email est détecté par polling
- Vérifie si l'IA est activée pour l'utilisateur
- Vérifie les limites du plan (quotas)
- Déclenche `process-auto-reply` en arrière-plan

#### B. `/api/mail-center/sync/route.ts` (mode stream)
- Pendant la synchronisation manuelle avec streaming
- Même logique que `check-new`
- Traite chaque email au fur et à mesure

#### C. `/api/mail-center/sync/route.ts` (mode simple)
- Pendant la synchronisation classique
- Traitement batch des emails

### 2. **Mode interne pour process-auto-reply**

Modification de `/api/mail-center/process-auto-reply/route.ts` :

```typescript
// AVANT : Nécessitait une session NextAuth
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
}

// APRÈS : Accepte les appels backend internes
const { emailId, userId: providedUserId, internal } = await req.json();

let userId: string;

if (internal && providedUserId) {
  // Mode interne : appel depuis le backend
  userId = providedUserId;
} else {
  // Mode normal : vérifier la session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  userId = session.user.id;
}
```

### 3. **Corrections des champs de base de données**

#### Fix `message_id` → `external_message_id`
- La colonne en base s'appelle `external_message_id`
- Le code utilisait parfois `message_id` (incorrect)
- **Corrigé** dans `check-new/route.ts`

#### Fix récupération du compte email
- Avant : `email.account.*` (jointure qui retourne un tableau)
- Après : Requête séparée pour récupérer le compte

```typescript
// Récupérer le compte associé
const { data: account } = await supabase
  .from('mail_accounts')
  .select('*')
  .eq('id', email.account_id)
  .single();
```

---

## 🔄 Flux de Fonctionnement

### Scénario : Nouvel email reçu

```
1. Email arrive → Détecté par check-new OU sync
   ↓
2. Email sauvegardé dans emails_cache
   ↓
3. Vérification : IA activée ?
   ↓ OUI
4. Vérification : Limites du plan respectées ?
   ↓ OUI
5. Appel async : /api/mail-center/process-auto-reply
   {
     emailId: "xxx",
     userId: "yyy",
     internal: true
   }
   ↓
6. process-auto-reply traite l'email :
   - Récupère config IA utilisateur
   - Vérifie catégorie (urgent/autre → validation requise)
   - Génère réponse avec GPT-4
   - Enregistre dans pending_replies
   ↓
7. Si mode auto ET pas de validation requise :
   - Envoie la réponse via Gmail/Outlook API
   - Marque email comme is_auto_replied = true
   - Log l'activité
   - Track l'usage (quotas)
   ↓
8. Si validation requise :
   - Marque reply_status = 'pending'
   - L'utilisateur peut valider manuellement
```

---

## 🛡️ Sécurités en Place

### 1. **Blocage catégories sensibles**
```typescript
if (email.category === 'urgent' || email.category === 'autre') {
  // ❌ PAS de réponse automatique
  // ✅ Validation manuelle obligatoire
}
```

### 2. **Vérification des limites**
```typescript
const limitCheck = await canSendAutoReply(userId);
if (!limitCheck.allowed) {
  console.log(`⚠️ Limite atteinte: ${limitCheck.reason}`);
  return; // Stop le traitement
}
```

### 3. **Gestion des erreurs**
- Chaque étape wrapped dans try/catch
- Erreurs loggées mais ne bloquent pas les autres emails
- Réponses sauvegardées même si envoi échoue (pour validation manuelle)

---

## 📊 Fichiers Modifiés

| Fichier | Modification |
|---------|-------------|
| `app/api/mail-center/check-new/route.ts` | ✅ Ajout déclenchement auto + Fix external_message_id |
| `app/api/mail-center/sync/route.ts` | ✅ Ajout déclenchement auto (2 modes) |
| `app/api/mail-center/process-auto-reply/route.ts` | ✅ Mode interne + Fix account |

---

## 🧪 Tests à Effectuer

### Test 1 : Email normal (non urgent)
```
1. Activer l'IA dans les paramètres
2. Recevoir un email de catégorie "commande" ou "question-produit"
3. ✅ Vérifier qu'une réponse est générée et envoyée automatiquement
4. ✅ Vérifier que l'email est marqué is_auto_replied = true
```

### Test 2 : Email urgent
```
1. Activer l'IA
2. Recevoir un email urgent
3. ✅ Vérifier qu'AUCUNE réponse n'est envoyée automatiquement
4. ✅ Vérifier que reply_status = 'pending'
5. ✅ Vérifier que requires_validation = true
```

### Test 3 : Limite atteinte
```
1. Atteindre la limite d'auto-replies du plan
2. Recevoir un nouvel email
3. ✅ Vérifier qu'aucune réponse n'est envoyée
4. ✅ Vérifier un log : "Limite auto-reply atteinte"
```

### Test 4 : Mode validation
```
1. Activer l'IA avec requireValidation = true pour une catégorie
2. Recevoir un email de cette catégorie
3. ✅ Réponse générée mais PAS envoyée
4. ✅ Réponse visible dans pending_replies
5. ✅ L'utilisateur peut valider/modifier avant envoi
```

---

## 🎯 Résultat Attendu

Quand l'IA est activée :
- ✅ Les emails non urgents reçoivent une réponse automatique
- ✅ Les emails urgents/autres nécessitent validation manuelle
- ✅ Les limites du plan sont respectées
- ✅ L'utilisateur peut surveiller/modifier les réponses générées
- ✅ Le système fonctionne en arrière-plan sans bloquer l'UI

---

## 📝 Notes Importantes

1. **Performance** : Le traitement se fait en arrière-plan (fetch async)
2. **Quotas** : Chaque réponse consomme le quota du plan
3. **Base de connaissances** : Utilisée si configurée par l'utilisateur
4. **Shopify** : Contexte automatique pour emails de commande
5. **Logs** : Tous les traitements sont loggés dans mail_ai_activity_logs

---

**Correctif appliqué par :** GitHub Copilot  
**Status :** ✅ Prêt pour test
