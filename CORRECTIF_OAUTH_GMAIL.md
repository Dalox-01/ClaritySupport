# Correctif OAuth Gmail - Mail Center

## Problème identifié

Lors de la connexion d'un compte Gmail via OAuth, le compte n'était pas enregistré dans la base de données et l'utilisateur était redirigé vers Mail Center sans compte lié.

## Causes du problème

### 1. **ID utilisateur manquant dans la génération de l'URL OAuth**
- **Fichier**: `app/api/mail-center/gmail/auth/route.ts`
- **Problème**: Le code utilisait `session.user.id` qui n'existait pas encore dans la session NextAuth
- **Solution**: Récupération de l'ID utilisateur depuis Supabase avant de générer l'URL OAuth

### 2. **Noms de colonnes incorrects dans la base de données**
- **Fichiers affectés**: Tous les fichiers de l'API mail-center
- **Problème**: Incohérence entre les noms de colonnes dans le schéma SQL et ceux utilisés dans le code
  - Code utilisait: `access_token_encrypted`, `refresh_token_encrypted`, `expires_at`, `sync_enabled`, `last_sync_at`
  - SQL définissait: `access_token`, `refresh_token`, `token_expires_at`, `is_active`, `last_sync`

## Corrections apportées

### Fichiers modifiés

#### 1. `app/api/mail-center/gmail/auth/route.ts`
```typescript
// AVANT
const authUrl = getGmailAuthUrl(session.user.id);

// APRÈS
const { data: user } = await supabase
  .from('users')
  .select('id')
  .eq('email', session.user.email)
  .single();

const authUrl = getGmailAuthUrl(user.id);
```

#### 2. `app/api/mail-center/outlook/auth/route.ts`
- Même correction que Gmail auth

#### 3. `app/api/mail-center/gmail/callback/route.ts`
```typescript
// AVANT
.upsert({
  expires_at: new Date(tokens.expiry_date).toISOString(),
  sync_enabled: true,
  ...
})

// APRÈS
.upsert({
  token_expires_at: new Date(tokens.expiry_date).toISOString(),
  is_active: true,
  ...
})
```

#### 4. `app/api/mail-center/outlook/callback/route.ts`
```typescript
// AVANT
access_token_encrypted: encryptedAccessToken,
refresh_token_encrypted: encryptedRefreshToken,

// APRÈS
access_token: encryptedAccessToken,
refresh_token: encryptedRefreshToken,
```

#### 5. `lib/mail-center-types.ts`
```typescript
// AVANT
export type MailAccount = {
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  sync_enabled: boolean;
  last_sync_at: string | null;
  ...
}

// APRÈS
export type MailAccount = {
  access_token: string;
  refresh_token: string;
  last_sync: string | null;
  ...
}
```

#### 6. Autres fichiers corrigés
- `app/api/mail-center/sync/route.ts`
- `app/api/mail-center/auto-sync/route.ts`
- `app/api/mail-center/check-new/route.ts`
- `app/api/mail-center/validate-reply/route.ts`
- `app/api/mail-center/process-auto-reply/route.ts`
- `app/api/mail-center/debug/route.ts`

### Changements systématiques appliqués

| Ancien nom | Nouveau nom |
|------------|-------------|
| `access_token_encrypted` | `access_token` |
| `refresh_token_encrypted` | `refresh_token` |
| `expires_at` | `token_expires_at` |
| `sync_enabled` | `is_active` |
| `last_sync_at` | `last_sync` |

## Schéma SQL de référence

La table `mail_accounts` dans Supabase doit avoir cette structure :

```sql
CREATE TABLE IF NOT EXISTS public.mail_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  provider TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  last_sync TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Vérification

Pour vérifier que le correctif fonctionne :

1. Se connecter à l'application
2. Aller dans Mail Center
3. Cliquer sur "Ajouter un compte"
4. Sélectionner un compte Google
5. Accepter les permissions
6. Vérifier que le compte apparaît dans la liste des comptes connectés

## Messages d'erreur améliorés

Les messages d'erreur ont été améliorés pour faciliter le débogage :
- Ajout des détails d'erreur dans les paramètres d'URL de redirection
- Logs console plus détaillés pour chaque étape

---

**Date**: 12 novembre 2025
**Status**: ✅ Résolu
