# 🚀 GUIDE D'INTÉGRATION RAPIDE - ANALYTICS BACKEND

## ⚡ Démarrage en 5 minutes

### 1️⃣ Appliquer la migration SQL

```bash
# Dans le SQL Editor de Supabase, copier-coller le contenu de:
# supabase/migrations/20250115_analytics_optimizations.sql
```

Cela crée:
- ✅ Table `mail_analytics_daily` (analytics pré-calculées)
- ✅ Fonction `calculate_daily_analytics()` 
- ✅ Triggers automatiques
- ✅ Index de performance

### 2️⃣ Utiliser l'API dans votre composant React

```tsx
'use client';
import { useState, useEffect } from 'react';
import { EmailMetrics, EmailsTimelineChart, EmailsByCategory, SentimentAnalysis } from '@/components/mail-dashboard';

export default function StatsTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/mail-center/stats?period=week');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Erreur de chargement des stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Chargement des statistiques...</div>;
  if (!stats) return <div>Aucune donnée disponible</div>;

  return (
    <div className="space-y-6 p-6">
      {/* 1. Métriques clés (4 cartes) */}
      <EmailMetrics 
        totalEmails={stats.metrics.total_emails}
        unreadEmails={stats.metrics.unread_emails}
        urgentEmails={stats.metrics.urgent_emails}
        avgResponseTime={stats.metrics.avg_response_time}
        isLightMode={true}
      />

      {/* 2. Timeline (volume par jour) */}
      <EmailsTimelineChart 
        data={stats.timeline} 
        isLightMode={true}
      />

      {/* 3. Répartition par catégorie (pie chart) */}
      <EmailsByCategory 
        data={stats.categories}
        isLightMode={true}
      />

      {/* 4. Analyse de sentiment (radar chart) */}
      <SentimentAnalysis 
        data={stats.sentiment}
        isLightMode={true}
      />

      {/* 5. Filtres (bubbles) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.filters.map(filter => (
          <div
            key={filter.id}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 bg-white hover:shadow-lg transition-all cursor-pointer"
            style={{ borderLeft: `4px solid ${filter.color}` }}
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2"
              style={{ backgroundColor: filter.color }}
            >
              {filter.count}
            </div>
            <p className="text-sm font-semibold text-gray-700">{filter.label}</p>
            <p className="text-xs text-gray-500">{filter.count} emails</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3️⃣ Structure de la réponse API

```typescript
// GET /api/mail-center/stats?period=week

{
  "metrics": {
    "total_emails": 347,
    "unread_emails": 23,
    "urgent_emails": 5,
    "avg_response_time": "2h 15min"
  },
  
  "timeline": [
    { "date": "Lun", "received": 45, "sent": 0 },
    { "date": "Mar", "received": 52, "sent": 0 },
    { "date": "Mer", "received": 48, "sent": 0 },
    { "date": "Jeu", "received": 61, "sent": 0 },
    { "date": "Ven", "received": 58, "sent": 0 },
    { "date": "Sam", "received": 42, "sent": 0 },
    { "date": "Dim", "received": 41, "sent": 0 }
  ],
  
  "categories": [
    { "type": "Support", "value": 145 },
    { "type": "Vente", "value": 82 },
    { "type": "Urgent", "value": 5 },
    { "type": "Autre", "value": 115 }
  ],
  
  "filters": [
    { "id": "TECHNIQUE", "label": "Technique", "count": 89, "color": "#10b981" },
    { "id": "FACTURATION", "label": "Facturation", "count": 56, "color": "#3b82f6" },
    { "id": "COMMERCIAL", "label": "Commercial", "count": 43, "color": "#f59e0b" },
    { "id": "REMBOURSEMENT", "label": "Remboursement", "count": 31, "color": "#ef4444" },
    { "id": "COMMANDE", "label": "Commande", "count": 28, "color": "#8b5cf6" },
    { "id": "LIVRAISON", "label": "Livraison", "count": 22, "color": "#ec4899" },
    { "id": "RENSEIGNEMENT", "label": "Renseignement", "count": 18, "color": "#06b6d4" },
    { "id": "autre", "label": "Autre", "count": 60, "color": "#6b7280" }
  ],
  
  "sentiment": [
    { "category": "Positif", "score": 42 },
    { "category": "Neutre", "score": 38 },
    { "category": "Négatif", "score": 15 },
    { "category": "Urgent", "score": 5 }
  ]
}
```

---

## 🎨 Exemple: Bubbles avec hover (filtres)

```tsx
function FilterBubbles({ filters }: { filters: FilterDistribution[] }) {
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap gap-4 p-6">
      {filters.map(filter => (
        <div
          key={filter.id}
          className="relative"
          onMouseEnter={() => setHoveredFilter(filter.id)}
          onMouseLeave={() => setHoveredFilter(null)}
        >
          {/* Bubble */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg cursor-pointer transition-transform hover:scale-110"
            style={{ backgroundColor: filter.color }}
          >
            {filter.count}
          </div>

          {/* Tooltip au hover */}
          {hoveredFilter === filter.id && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
              {filter.count} emails - {filter.label}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 🔥 Comment l'analyse de sentiment fonctionne

### 1. Email reçu (via sync Gmail/Outlook)
```typescript
// Nouvel email arrive dans emails_cache
{
  from_email: "client@example.com",
  subject: "Problème urgent avec ma commande",
  body_text: "Bonjour, ma commande n'est toujours pas arrivée après 2 semaines. C'est inacceptable !"
}
```

### 2. Analyse IA (automatique)
```typescript
// lib/mail-ai-helpers.ts -> analyzeEmailWithAI()
const analysis = await analyzeEmailWithAI(
  "client@example.com",
  "Problème urgent avec ma commande",
  "Bonjour, ma commande n'est toujours pas arrivée après 2 semaines. C'est inacceptable !"
);

// Résultat:
{
  category: "urgent",
  sentiment: "negatif",
  urgency_score: 9,
  sentiment_score: 18,  // Client très insatisfait
  support_category: "LIVRAISON",
  requires_validation: true,
  detected_entities: {
    problem: "Commande non reçue après 2 semaines"
  },
  reasoning: "Client mécontent avec problème de livraison urgent"
}
```

### 3. Sauvegarde dans la base
```sql
INSERT INTO emails_cache (
  subject,
  category,
  sentiment,
  urgency_score,
  support_category,
  ...
) VALUES (
  'Problème urgent avec ma commande',
  'urgent',
  'negatif',
  9,
  'LIVRAISON',
  ...
);
```

### 4. Affichage dans les stats
```typescript
// Dans le radar chart "Analyse de sentiment"
{
  category: "Négatif",
  score: 15  // 15% des emails sont négatifs
}

// Dans les filtres (bubbles)
{
  id: "LIVRAISON",
  label: "Livraison",
  count: 22,  // +1 email
  color: "#ec4899"
}
```

---

## 🚨 Gestion des cas limites

### Email sans catégorie détectée
```typescript
// Fallback automatique
{
  category: "autre",
  sentiment: "neutre",
  urgency_score: 5,
  support_category: "autre"
}
```

### Erreur IA (OpenAI down)
```typescript
// Fallback sécurisé
{
  category: "autre",
  sentiment: "neutre",
  urgency_score: 5,
  requires_validation: true,  // Forcer validation manuelle
  reasoning: "Erreur lors de l'analyse IA"
}
```

### Pas de données pour la période
```typescript
// Réponse avec valeurs à zéro
{
  metrics: {
    total_emails: 0,
    unread_emails: 0,
    urgent_emails: 0,
    avg_response_time: "0min"
  },
  timeline: [
    { date: "Lun", received: 0, sent: 0 },
    // ...
  ],
  categories: [],
  filters: [],
  sentiment: [
    { category: "Positif", score: 0 },
    { category: "Neutre", score: 0 },
    { category: "Négatif", score: 0 },
    { category: "Urgent", score: 0 }
  ]
}
```

---

## 📊 Exemple: Intégration complète dans Mail Center

```tsx
// app/mail-center/page.tsx
export default function MailCenterPage() {
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'stats'
  
  return (
    <div>
      {/* Navigation */}
      <div className="tabs">
        <button onClick={() => setActiveTab('inbox')}>Inbox</button>
        <button onClick={() => setActiveTab('stats')}>Stats</button>
      </div>

      {/* Contenu */}
      {activeTab === 'inbox' && <InboxView />}
      {activeTab === 'stats' && <StatsTab />}  {/* ← Votre nouveau composant */}
    </div>
  );
}
```

---

## ✅ Checklist avant production

- [ ] Migration SQL appliquée (`20250115_analytics_optimizations.sql`)
- [ ] Variable `OPENAI_API_KEY` configurée
- [ ] Composants Visactor installés (`npm install @visactor/react-vchart`)
- [ ] Test endpoint: `curl http://localhost:3000/api/mail-center/stats?period=week`
- [ ] Vérifier les logs: chercher `[STATS API]` et `[AI ANALYSIS]`
- [ ] Tester avec données réelles (>10 emails minimum)
- [ ] Vérifier performance (<200ms dans les logs)

---

## 🎯 Points clés à retenir

1. **Endpoint unique**: `/api/mail-center/stats?period=week`
2. **Analyse automatique**: Chaque email est analysé par l'IA au moment de la synchronisation
3. **Performance**: <200ms pour 1000 emails grâce aux index SQL
4. **Temps réel**: Les stats se mettent à jour automatiquement quand de nouveaux emails arrivent
5. **Sécurité**: Chaque utilisateur voit seulement ses propres données (RLS)

---

**Besoin d'aide ?**  
Consultez `BACKEND_ANALYTICS_DOCUMENTATION.md` pour la documentation complète.
