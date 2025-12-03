# Test du système de quota

## Limites configurées :
- **FREE** : 10 emails/mois
- **STARTER** : 500 emails/mois  
- **PRO** : 5000 emails/mois

## Pour tester localement :

1. Connectez-vous avec un compte FREE
2. Ouvrez la console du navigateur (F12)
3. Générez un email
4. Vérifiez dans la console les logs `[GENERATE]` et `[USAGE]`
5. Rechargez la page dashboard et vérifiez que le compteur s'est incrémenté
6. Allez sur `/dashboard/usage` pour voir l'utilisation

## Logs à vérifier :

```
📧 [GENERATE] Request received
✅ [GENERATE] Session OK: votre@email.com
📊 [GENERATE] Checking quota...
📊 [GENERATE] Quota status: {...}
🤖 [GENERATE] Calling AI...
✅ [GENERATE] AI response received
📊 [GENERATE] Incrementing usage...
📊 [USAGE] User: votre@email.com, Plan: FREE, Used: 1/10
✅ [GENERATE] Usage incremented successfully
✅ [GENERATE] Success! Sending response
```

## Si le compteur ne s'incrémente pas :

Vérifier dans Vercel → Logs → Function Logs si l'API `/api/usage/increment` est bien appelée et si elle retourne `success: true`.

## Points de vérification Supabase :

1. La table `users` existe bien
2. Les colonnes `usage_count`, `usage_month`, `plan` existent
3. L'utilisateur a bien un plan assigné (FREE par défaut)

