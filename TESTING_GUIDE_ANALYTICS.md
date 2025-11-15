# 🧪 GUIDE DE TEST - ANALYTICS MAIL CENTER

## ✅ Pré-requis

Avant de tester, assurez-vous que:
- [ ] Migration SQL appliquée (`20250115_analytics_optimizations.sql`)
- [ ] Variable `OPENAI_API_KEY` configurée
- [ ] Au moins 5-10 emails synchronisés dans `emails_cache`
- [ ] Serveur Next.js en cours d'exécution (`npm run dev`)

---

## 🔍 TEST 1: Endpoint API

### Test manuel (cURL)

```bash
# Test 1: Stats de la semaine
curl http://localhost:3000/api/mail-center/stats?period=week

# Vérifier:
# ✅ Status 200
# ✅ JSON valide
# ✅ Header X-Processing-Time < 500ms
# ✅ metrics.total_emails >= 0
# ✅ timeline.length === 7
# ✅ categories est un array
# ✅ filters est un array avec couleurs
# ✅ sentiment est un array de 4 éléments
```

### Test avec navigateur

```javascript
// 1. Ouvrir la console (F12)
// 2. Copier-coller ce code:

fetch('/api/mail-center/stats?period=week')
  .then(res => {
    console.log('Status:', res.status);
    console.log('Headers:', Object.fromEntries(res.headers));
    return res.json();
  })
  .then(data => {
    console.log('📊 Stats:', data);
    console.log('Total emails:', data.metrics.total_emails);
    console.log('Filtres:', data.filters);
    console.table(data.timeline);
  });
```

**Résultat attendu:**
```
Status: 200
Headers: { "x-processing-time": "125ms", "cache-control": "private, max-age=60" }
📊 Stats: { metrics: {...}, timeline: [...], ... }
Total emails: 347
Filtres: [{id: "TECHNIQUE", label: "Technique", count: 89, color: "#10b981"}, ...]
```

---

## 🤖 TEST 2: Analyse IA

### Test unitaire

```typescript
// test/ai-analysis.test.ts
import { analyzeEmailWithAI } from '@/lib/mail-ai-helpers';

// Test 1: Email urgent
const result1 = await analyzeEmailWithAI(
  'client@test.com',
  'URGENT: Site down',
  'Mon site est hors ligne depuis 2h !!!'
);

console.log('Test 1 - Email urgent:');
console.log('✅ category:', result1.category); // Devrait être "urgent"
console.log('✅ sentiment:', result1.sentiment); // "urgent" ou "negatif"
console.log('✅ urgency_score:', result1.urgency_score); // >= 8
console.log('✅ support_category:', result1.support_category); // "TECHNIQUE"

// Test 2: Email positif
const result2 = await analyzeEmailWithAI(
  'client@test.com',
  'Merci pour votre excellent service',
  'Bonjour, je voulais vous remercier pour votre rapidité !'
);

console.log('\nTest 2 - Email positif:');
console.log('✅ category:', result2.category); // "autre" ou "support"
console.log('✅ sentiment:', result2.sentiment); // "positif"
console.log('✅ urgency_score:', result2.urgency_score); // <= 3
```

**Commande:**
```bash
# Créer un script de test
node -e "$(cat test/ai-analysis.test.ts)"
```

---

## 📊 TEST 3: Composants Frontend

### Test visuel

1. **Naviguer vers:** `http://localhost:3000/mail-center`
2. **Cliquer sur l'onglet:** "Stats" (si intégré)
3. **Vérifier:**

#### Métriques clés (4 cartes)
- [ ] Total emails affiché
- [ ] Non lus affiché
- [ ] Urgents affiché
- [ ] Temps de réponse moyen affiché (ex: "2h 15min")
- [ ] Animations fluides (apparition progressive)

#### Timeline (graphique à barres)
- [ ] 7 barres (Lun à Dim) ou 1 barre (Aujourd'hui) ou 30 barres (Mois)
- [ ] Hauteur proportionnelle au nombre d'emails
- [ ] Tooltip au hover (date + nombre)
- [ ] Légende "Reçus" / "Envoyés"

#### Catégories (pie chart)
- [ ] Segments colorés (Support, Vente, Urgent, Spam, Autre)
- [ ] Tooltip au hover (catégorie + nombre + %)
- [ ] Indicateur central (Total)
- [ ] Légende à droite

#### Sentiment (radar chart)
- [ ] 4 axes (Positif, Neutre, Négatif, Urgent)
- [ ] Forme polygonale bleue
- [ ] Tooltip au hover (catégorie + score %)
- [ ] Score moyen affiché

#### Filtres (bubbles)
- [ ] Bubbles rondes avec chiffres
- [ ] Couleurs distinctes (10 couleurs)
- [ ] Tooltip au hover ("X emails - Label")
- [ ] Animation scale au hover
- [ ] Responsive (wrap sur mobile)

---

## 🎨 TEST 4: Bubbles Interactives

### Test d'interaction

```tsx
// Dans la console navigateur:

// 1. Sélectionner une bubble
const bubble = document.querySelector('[style*="background-color: rgb(16, 185, 129)"]'); // Technique (vert)

// 2. Simuler hover
bubble.dispatchEvent(new MouseEvent('mouseenter'));
// ✅ Tooltip devrait apparaître

// 3. Simuler click
bubble.click();
// ✅ Console devrait afficher: "Filtre cliqué: TECHNIQUE"

// 4. Vérifier le style
console.log(bubble.style.backgroundColor);
// ✅ Devrait être "rgb(16, 185, 129)" (#10b981)
```

---

## 🔄 TEST 5: Rafraîchissement

### Test de cache

```javascript
// 1. Premier appel
console.time('Premier appel');
fetch('/api/mail-center/stats?period=week')
  .then(res => res.json())
  .then(() => console.timeEnd('Premier appel'));
// ✅ Temps: ~150-250ms

// 2. Deuxième appel (dans les 60s)
console.time('Deuxième appel (cache)');
fetch('/api/mail-center/stats?period=week')
  .then(res => res.json())
  .then(() => console.timeEnd('Deuxième appel (cache)'));
// ✅ Temps: ~10-50ms (cache navigateur)

// 3. Vérifier header Cache-Control
fetch('/api/mail-center/stats?period=week')
  .then(res => console.log('Cache-Control:', res.headers.get('cache-control')));
// ✅ Devrait afficher: "private, max-age=60"
```

---

## 🗄️ TEST 6: Base de données

### Vérifier les données

```sql
-- Dans Supabase SQL Editor:

-- 1. Compter les emails avec analyse IA
SELECT 
  COUNT(*) as total,
  COUNT(category) as avec_category,
  COUNT(sentiment) as avec_sentiment,
  COUNT(support_category) as avec_support_category
FROM emails_cache;

-- ✅ avec_category devrait être proche de total
-- ✅ avec_sentiment devrait être proche de total
-- ✅ avec_support_category devrait être > 0

-- 2. Distribution des catégories
SELECT category, COUNT(*) 
FROM emails_cache 
GROUP BY category;

-- ✅ Devrait afficher: support, vente, urgent, spam, autre

-- 3. Distribution des sentiments
SELECT sentiment, COUNT(*) 
FROM emails_cache 
GROUP BY sentiment;

-- ✅ Devrait afficher: positif, neutre, negatif, urgent

-- 4. Distribution des filtres
SELECT support_category, COUNT(*) 
FROM emails_cache 
GROUP BY support_category
ORDER BY COUNT(*) DESC;

-- ✅ Devrait afficher: FACTURATION, TECHNIQUE, COMMERCIAL, etc.

-- 5. Vérifier les index
SELECT 
  schemaname, 
  tablename, 
  indexname 
FROM pg_indexes 
WHERE tablename = 'emails_cache';

-- ✅ Devrait inclure:
-- - idx_emails_cache_user_date
-- - idx_emails_cache_category
-- - idx_emails_cache_sentiment
-- - idx_emails_cache_support_category
```

---

## ⚡ TEST 7: Performance

### Benchmark avec temps de réponse

```javascript
// Test de performance (100 appels)
async function benchmarkStats() {
  const times = [];
  
  for (let i = 0; i < 100; i++) {
    const start = performance.now();
    await fetch('/api/mail-center/stats?period=week');
    const end = performance.now();
    times.push(end - start);
  }
  
  const avg = times.reduce((a, b) => a + b) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  console.log('📊 Benchmark Stats API (100 appels):');
  console.log('Moyenne:', Math.round(avg), 'ms');
  console.log('Min:', Math.round(min), 'ms');
  console.log('Max:', Math.round(max), 'ms');
  console.log('✅ Performance OK si moyenne < 500ms');
}

benchmarkStats();
```

**Résultats attendus:**
```
📊 Benchmark Stats API (100 appels):
Moyenne: 85 ms  ✅
Min: 42 ms      ✅
Max: 215 ms     ✅
✅ Performance OK si moyenne < 500ms
```

---

## 🚨 TEST 8: Gestion d'erreurs

### Test d'erreurs

```javascript
// 1. Test avec période invalide
fetch('/api/mail-center/stats?period=invalid')
  .then(res => res.json())
  .then(data => console.log('Erreur attendue:', data));
// ✅ Devrait retourner: { error: 'Invalid period. Use: today, week, or month' }

// 2. Test sans authentification (en navigation privée)
fetch('/api/mail-center/stats?period=week')
  .then(res => res.json())
  .then(data => console.log('Erreur auth:', data));
// ✅ Devrait retourner: { error: 'Non authentifié' }

// 3. Test avec OpenAI key invalide (backend)
// Modifier temporairement OPENAI_API_KEY=invalid dans .env
// ✅ L'analyse devrait utiliser le fallback:
// {
//   category: "autre",
//   sentiment: "neutre",
//   requires_validation: true,
//   reasoning: "Erreur lors de l'analyse IA..."
// }
```

---

## 📱 TEST 9: Responsive Design

### Test sur différents écrans

**Desktop (>1024px):**
- [ ] Grille 4 colonnes pour les métriques
- [ ] Graphiques en 2 colonnes (pie + radar)
- [ ] Bubbles sur 5 colonnes
- [ ] Timeline pleine largeur

**Tablet (768px - 1023px):**
- [ ] Grille 2 colonnes pour les métriques
- [ ] Graphiques empilés (1 colonne)
- [ ] Bubbles sur 3 colonnes
- [ ] Scroll horizontal évité

**Mobile (<768px):**
- [ ] Grille 1 colonne pour les métriques
- [ ] Graphiques empilés
- [ ] Bubbles sur 2 colonnes
- [ ] Padding réduit

**Test:**
```javascript
// Ouvrir DevTools (F12)
// Toggle Device Toolbar (Ctrl+Shift+M)
// Tester: iPhone 12, iPad, Desktop 1920x1080
```

---

## 🎯 TEST 10: Cas limites

### Données vides

```sql
-- Vider temporairement les emails
DELETE FROM emails_cache WHERE user_id = 'your-user-id';
```

**Résultat attendu dans l'API:**
```json
{
  "metrics": {
    "total_emails": 0,
    "unread_emails": 0,
    "urgent_emails": 0,
    "avg_response_time": "0min"
  },
  "timeline": [
    { "date": "Lun", "received": 0, "sent": 0 },
    ...
  ],
  "categories": [],
  "filters": [],
  "sentiment": [
    { "category": "Positif", "score": 0 },
    { "category": "Neutre", "score": 0 },
    { "category": "Négatif", "score": 0 },
    { "category": "Urgent", "score": 0 }
  ]
}
```

**Résultat attendu dans le frontend:**
- [ ] Cartes métriques affichent "0"
- [ ] Timeline affiche un graphique vide
- [ ] Pie chart affiche "Aucune donnée"
- [ ] Radar chart affiche un cercle à 0%
- [ ] Bubbles affichent "Aucune donnée disponible"

---

## ✅ Checklist de validation finale

### Backend
- [ ] Migration SQL appliquée sans erreur
- [ ] Triggers créés (`emails_cache_analytics_trigger`)
- [ ] Index créés (vérifier avec `\di` dans psql)
- [ ] Fonction `calculate_daily_analytics()` existe
- [ ] RLS activée (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)

### API
- [ ] Endpoint `/stats` retourne 200 OK
- [ ] Temps de réponse < 500ms (header `X-Processing-Time`)
- [ ] Cache client activé (`Cache-Control: private, max-age=60`)
- [ ] Erreur 401 si non authentifié
- [ ] Erreur 400 si period invalide

### IA
- [ ] Analyse de sentiment fonctionne (vérifier logs `[AI ANALYSIS]`)
- [ ] `support_category` rempli dans >70% des emails
- [ ] Fallback activé en cas d'erreur OpenAI
- [ ] Coût <$0.001 par email (GPT-4o-mini)

### Frontend
- [ ] Métriques affichées correctement
- [ ] Timeline responsive (7 barres)
- [ ] Pie chart avec légende
- [ ] Radar chart avec 4 axes
- [ ] Bubbles avec hover tooltip
- [ ] Animations fluides (Framer Motion)
- [ ] Mode clair/sombre fonctionnel
- [ ] Responsive (mobile/tablet/desktop)

### Performance
- [ ] API < 200ms (moyen)
- [ ] Première peinture < 1s
- [ ] Pas de memory leaks (DevTools Memory)
- [ ] Pas d'erreurs console

---

## 🐛 Problèmes courants

### "No data available"
**Cause:** Pas d'emails synchronisés  
**Solution:** Synchroniser des emails via Gmail/Outlook

### Stats toujours à 0
**Cause:** RLS trop restrictive ou user_id incorrect  
**Solution:** Vérifier que `auth.uid()` correspond à l'utilisateur

### Sentiment toujours "neutre"
**Cause:** OpenAI API key invalide ou quota dépassé  
**Solution:** Vérifier `OPENAI_API_KEY` et quotas OpenAI

### Filtres vides
**Cause:** `support_category` non rempli  
**Solution:** Re-synchroniser emails avec analyse IA active

### Performance lente (>1s)
**Cause:** Index manquants ou trop d'emails  
**Solution:** Vérifier index avec `EXPLAIN ANALYZE`, limiter à period=today

---

## 📊 Logs à surveiller

### Logs de succès
```
✅ [STATS API] 125ms | Period: week | Emails: 347 | Filters: 8
✅ [AI ANALYSIS] 892ms | Category: support | Sentiment: neutre (50/100) | Urgency: 3/10 | Support: TECHNIQUE
```

### Logs d'erreur
```
❌ [STATS API] Error after 2450ms: Database error: relation "emails_cache" does not exist
❌ [AI ANALYSIS] Error after 5100ms: OpenAI API error: Invalid API key
```

---

**Bon test ! 🚀**
