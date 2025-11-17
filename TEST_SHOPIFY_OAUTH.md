# Test Shopify OAuth - Diagnostic complet

## Étapes de diagnostic

### 1. Vérifier les variables d'environnement Vercel

Connectez-vous à Vercel Dashboard et vérifiez que ces variables existent :

```
SHOPIFY_API_KEY=<votre_client_id>
SHOPIFY_API_SECRET=<votre_client_secret>
SUPABASE_SERVICE_ROLE_KEY=<votre_service_role_key>
NEXT_PUBLIC_SUPABASE_URL=<votre_supabase_url>
```

### 2. Test manuel de l'endpoint authorize

Ouvrir DevTools Console et exécuter :

```javascript
fetch('/api/shopify/oauth/authorize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ shopDomain: 'hk610k-6m' })
})
.then(r => r.json())
.then(console.log)
```

**Résultat attendu :**
```json
{
  "success": true,
  "authUrl": "https://hk610k-6m.myshopify.com/admin/oauth/authorize?client_id=...",
  "message": "Redirection vers Shopify..."
}
```

### 3. Vérifier les logs Vercel Runtime

1. Allez sur **Vercel Dashboard** → Votre projet
2. **Deployments** → Dernier deployment (76b5a84)
3. **Runtime Logs** (real-time)
4. Cliquez sur "Connecter en 1 clic" dans l'app
5. **Cherchez ces logs** :

```
✅ OAuth URL generated for hk610k-6m.myshopify.com
🟢 [SHOPIFY CALLBACK] START
🔵 Received params: { hasCode: true, shop: 'hk610k-6m.myshopify.com', ... }
🔵 Data to save: { user_id: '...', shop_domain: '...', ... }
❌ Database save error: ...
```

### 4. Vérifier la table Supabase

Allez dans **Supabase Dashboard** :

1. **Table Editor** → `shopify_shops`
2. **SQL Editor** → Exécutez :

```sql
SELECT * FROM shopify_shops 
WHERE user_id = '93740474-2330-4e05-bb63-c75cd62d2de0'
ORDER BY created_at DESC;
```

### 5. Test de connexion Supabase directe

**SQL Editor** → Exécutez pour tester l'insertion :

```sql
INSERT INTO shopify_shops (
  user_id,
  shop_domain,
  shop_name,
  access_token,
  status
) VALUES (
  '93740474-2330-4e05-bb63-c75cd62d2de0',
  'test.myshopify.com',
  'Test Shop',
  'shpat_test123',
  'active'
)
ON CONFLICT (user_id, shop_domain) 
DO UPDATE SET 
  access_token = EXCLUDED.access_token,
  updated_at = NOW();
```

**Si cette requête échoue**, le problème est dans la structure de la table ou les RLS policies.

### 6. Vérifier les RLS Policies

**SQL Editor** :

```sql
-- Vérifier que SERVICE_ROLE peut écrire (devrait bypass RLS)
SELECT current_setting('role');

-- Lister les policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'shopify_shops';
```

### 7. Logs détaillés attendus

Quand vous cliquez "Connecter", vous devriez voir dans Vercel Logs :

```
[SHOPIFY OAUTH] POST /api/shopify/oauth/authorize
✅ OAuth URL generated for hk610k-6m.myshopify.com
→ Status 200

[SHOPIFY CALLBACK] GET /api/shopify/callback?code=...&shop=...
🟢 [SHOPIFY CALLBACK] START
🔵 Received params: { hasCode: true, shop: 'hk610k-6m.myshopify.com', hasState: true }
✅ User ID decoded: 93740474-2330-4e05-bb63-c75cd62d2de0
🔵 Exchanging code for access token...
✅ Access token obtained
🔵 Fetching shop info...
✅ Shop info: hk610k-6m
🔵 Saving to database...
🔵 Data to save: { user_id: '93740474...', shop_domain: 'hk610k-6m.myshopify.com', ... }
✅ Shop saved successfully: abc-123-uuid
→ Redirect to /mail-center?shopify_success=true&shop=hk610k-6m
```

**Si vous voyez `❌ Database save error:`**, copiez l'erreur complète.

## Checklist de vérification

- [ ] Variables d'environnement Vercel correctes
- [ ] Endpoint authorize retourne authUrl
- [ ] Redirection vers Shopify fonctionne
- [ ] Callback reçoit code + shop + state
- [ ] State décodé avec succès (userId extrait)
- [ ] Token exchange avec Shopify réussit
- [ ] **Insertion BDD échoue** ← ERREUR ICI
- [ ] Logs Vercel montrent l'erreur exacte

## Prochaines étapes selon l'erreur

### Si erreur = "duplicate key"
→ Problème de UNIQUE constraint, utiliser UPDATE au lieu de INSERT

### Si erreur = "permission denied" ou "RLS"
→ SERVICE_ROLE_KEY n'est pas utilisée correctement

### Si erreur = "column does not exist"
→ Migration non appliquée ou colonne manquante

### Si erreur = "null value in column"
→ Champ NOT NULL manquant dans l'insert

**Envoyez-moi l'erreur exacte des logs Vercel** pour que je corrige précisément.
