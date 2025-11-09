# Guide de Migration - Nouvelles Fonctionnalités

## ⚡ Étapes Rapides

### 1. Exécuter la migration SQL dans Supabase

1. Ouvrez votre projet Supabase: https://supabase.com/dashboard
2. Allez dans **SQL Editor**
3. Créez une nouvelle query
4. Copiez-collez le contenu du fichier:
   ```
   supabase/migrations/20251029120000_add_templates_and_favorites.sql
   ```
5. Cliquez sur **Run**

### 2. Vérifier la migration

Exécutez cette query pour vérifier:

```sql
-- Vérifier que la table templates existe
SELECT COUNT(*) FROM templates;

-- Vérifier que la colonne is_favorite existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'emails' AND column_name = 'is_favorite';
```

### 3. Démarrer le serveur

```bash
npm run dev
```

### 4. Tester les nouvelles pages

Ouvrez votre navigateur et testez:

- **Templates:** http://localhost:3000/dashboard/templates
- **Analytics:** http://localhost:3000/dashboard/analytics
- **Historique:** http://localhost:3000/dashboard/history (avec nouvelle recherche)

---

## 🔧 Si vous rencontrez des problèmes

### Erreur: "templates table does not exist"
**Solution:** Exécutez la migration SQL dans Supabase

### Erreur: "column is_favorite does not exist"
**Solution:** Exécutez cette commande SQL:
```sql
ALTER TABLE emails ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;
```

### Erreur lors de l'export PDF
**Solution:** Vérifiez que les packages sont installés:
```bash
npm install jspdf html2canvas
```

### Les graphiques ne s'affichent pas
**Solution:** Vérifiez que recharts est installé:
```bash
npm install recharts
```

---

## 📊 Structure de la migration

La migration crée:
1. **Table `templates`** - Pour stocker les modèles d'emails
2. **Colonne `is_favorite`** dans `emails` - Pour marquer les favoris
3. **4 index** - Pour optimiser les performances
4. **1 trigger** - Pour mettre à jour automatiquement `updated_at`

---

## ✅ Checklist de vérification

Après la migration, vérifiez que:

- [ ] Table `templates` existe
- [ ] Colonne `is_favorite` existe dans `emails`
- [ ] Page `/dashboard/templates` s'affiche
- [ ] Page `/dashboard/analytics` s'affiche
- [ ] Création de template fonctionne
- [ ] Export PDF fonctionne
- [ ] Toggle favori fonctionne
- [ ] Recherche dans historique fonctionne
- [ ] Graphiques analytics s'affichent

---

## 🎯 Prochaines étapes recommandées

1. **Créer quelques templates** pour tester
2. **Générer des emails** pour voir les analytics
3. **Marquer des favoris** pour tester le filtre
4. **Exporter un PDF** pour vérifier le formatage
5. **Tester la recherche** avec différents filtres

---

Bon développement ! 🚀
