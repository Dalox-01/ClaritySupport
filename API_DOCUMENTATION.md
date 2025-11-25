# 📡 Documentation API - Nouvelles Fonctionnalités

## 📋 Templates API

### GET /api/templates
Récupère la liste des templates de l'utilisateur + templates publics

**Query Parameters:**
- `q` (string, optional) - Recherche dans nom, sujet, contenu
- `type` (string, optional) - Filtrer par type d'email

**Response:**
```json
{
  "success": true,
  "templates": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Mon template",
      "subject": "Candidature au poste de {{poste}}",
      "text": "Bonjour {{nom}},\n\nJe me permets...",
      "html": "<p>Bonjour {{nom}}</p>",
      "type": "candidature",
      "tone": "pro",
      "style": "formel",
      "variables": ["poste", "nom"],
      "is_public": false,
      "created_at": "2024-10-29T12:00:00Z",
      "updated_at": "2024-10-29T12:00:00Z"
    }
  ]
}
```

---

### POST /api/templates
Crée un nouveau template

**Body:**
```json
{
  "name": "Mon template",
  "subject": "Candidature au poste de {{poste}}",
  "text": "Bonjour {{nom}},\n\nJe me permets de vous contacter...",
  "html": "<p>Bonjour {{nom}}</p>",
  "type": "candidature",
  "tone": "pro",
  "style": "formel",
  "is_public": false
}
```

**Validation:**
- `name`: string, min 1, max 255 caractères, requis
- `subject`: string, min 1, requis
- `text`: string, min 1, requis
- `html`: string, optional
- `type`: enum ["candidature", "relance", "prospection", "support", "reponse", "negociation"], requis
- `tone`: enum ["pro", "cordial", "direct"], optional
- `style`: enum ["formel", "creatif", "technique", "commercial"], optional
- `is_public`: boolean, optional (default: false)

**Response Success (201):**
```json
{
  "success": true,
  "template": { /* template créé */ }
}
```

**Response Error (403) - Limite atteinte:**
```json
{
  "error": "Template limit reached",
  "message": "Vous avez atteint la limite de 5 templates pour le plan gratuit."
}
```

---

### GET /api/templates/[id]
Récupère un template spécifique

**Response:**
```json
{
  "success": true,
  "template": { /* données du template */ }
}
```

**Errors:**
- 404: Template non trouvé ou non accessible
- 401: Non authentifié

---

### PATCH /api/templates/[id]
Met à jour un template (propriétaire uniquement)

**Body (tous champs optionnels):**
```json
{
  "name": "Nouveau nom",
  "subject": "Nouveau sujet",
  "text": "Nouveau contenu",
  "type": "relance",
  "tone": "cordial",
  "style": "creatif"
}
```

**Response:**
```json
{
  "success": true,
  "template": { /* template mis à jour */ }
}
```

---

### DELETE /api/templates/[id]
Supprime un template (propriétaire uniquement)

**Response:**
```json
{
  "success": true
}
```

---

## ⭐ Favoris API

### PATCH /api/emails/[id]/favorite
Toggle le statut favori d'un email

**Aucun body requis**

**Response:**
```json
{
  "success": true,
  "email": {
    "id": "uuid",
    "is_favorite": true,
    /* autres champs */
  }
}
```

**Logique:**
- Si `is_favorite = false` → devient `true`
- Si `is_favorite = true` → devient `false`

---

## 🔍 Historique API (amélioré)

### GET /api/history
Récupère l'historique des emails avec recherche avancée

**Query Parameters:**
- `q` (string, optional) - Recherche dans sujet et contenu
- `type` (string, optional) - Filtrer par type
- `tone` (string, optional) - Filtrer par ton
- `favorites` (boolean, optional) - Uniquement les favoris (true/false)
- `dateFrom` (ISO string, optional) - Date de début (ex: "2024-10-01")
- `dateTo` (ISO string, optional) - Date de fin (ex: "2024-10-31")
- `page` (number, optional, default: 1) - Numéro de page
- `limit` (number, optional, default: 20) - Résultats par page

**Exemples:**
```
/api/history?q=candidature&type=candidature&favorites=true
/api/history?dateFrom=2024-10-01&dateTo=2024-10-31
/api/history?tone=pro&page=2&limit=10
```

**Response:**
```json
{
  "success": true,
  "emails": [
    {
      "id": "uuid",
      "subject": "Candidature...",
      "text": "...",
      "html": "<p>...</p>",
      "type": "candidature",
      "tone": "pro",
      "style": "formel",
      "is_favorite": true,
      "created_at": "2024-10-29T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

## 📊 Analytics API

### GET /api/analytics
Récupère les statistiques de génération d'emails

**Query Parameters:**
- `period` (number, optional, default: 30) - Période en jours (7, 30, 90)

**Exemples:**
```
/api/analytics?period=7   # 7 derniers jours
/api/analytics?period=30  # 30 derniers jours
/api/analytics?period=90  # 90 derniers jours
```

**Response:**
```json
{
  "success": true,
  "analytics": {
    "totalGenerated": 25,
    "period": 30,
    "dailyStats": [
      {
        "date": "29/10/2024",
        "count": 3
      },
      {
        "date": "28/10/2024",
        "count": 5
      }
    ],
    "typeDistribution": [
      {
        "name": "candidature",
        "value": 10
      },
      {
        "name": "relance",
        "value": 8
      },
      {
        "name": "prospection",
        "value": 7
      }
    ],
    "toneDistribution": [
      {
        "name": "pro",
        "value": 15
      },
      {
        "name": "cordial",
        "value": 10
      }
    ],
    "styleDistribution": [
      {
        "name": "formel",
        "value": 12
      },
      {
        "name": "technique",
        "value": 8
      },
      {
        "name": "commercial",
        "value": 5
      }
    ]
  }
}
```

**Calculs:**
- `totalGenerated`: Nombre total d'emails sur la période
- `dailyStats`: Comptage par jour (groupBy sur created_at)
- `typeDistribution`: Comptage par type d'email
- `toneDistribution`: Comptage par ton
- `styleDistribution`: Comptage par style (si utilisé)

---

## 🔐 Authentification

Toutes les API requièrent une session NextAuth valide.

**Headers requis:**
- Cookie de session NextAuth

**Gestion des erreurs:**
```json
{
  "error": "Unauthorized"
}
```
Status: 401

---

## 🎯 Codes de statut HTTP

- **200 OK** - Succès
- **201 Created** - Ressource créée
- **400 Bad Request** - Validation échouée
- **401 Unauthorized** - Non authentifié
- **403 Forbidden** - Limite atteinte ou accès interdit
- **404 Not Found** - Ressource non trouvée
- **500 Internal Server Error** - Erreur serveur

---

## 🧪 Exemples d'utilisation

### Créer un template avec fetch
```javascript
const response = await fetch('/api/templates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Candidature développeur',
    subject: 'Candidature au poste de {{poste}}',
    text: 'Bonjour {{nom}},\n\nJe souhaite candidater...',
    type: 'candidature',
    tone: 'pro',
    style: 'formel'
  })
});

const data = await response.json();
if (data.success) {
  console.log('Template créé:', data.template.id);
}
```

### Toggle favori
```javascript
const response = await fetch(`/api/emails/${emailId}/favorite`, {
  method: 'PATCH'
});

const data = await response.json();
console.log('Favori:', data.email.is_favorite);
```

### Rechercher dans l'historique
```javascript
const params = new URLSearchParams({
  q: 'candidature',
  type: 'candidature',
  favorites: 'true',
  page: '1'
});

const response = await fetch(`/api/history?${params}`);
const data = await response.json();
console.log(`${data.emails.length} emails trouvés`);
```

### Récupérer les analytics
```javascript
const response = await fetch('/api/analytics?period=30');
const data = await response.json();

console.log(`Total: ${data.analytics.totalGenerated} emails`);
console.log(`Type principal: ${data.analytics.typeDistribution[0].name}`);
```

---

## 📈 Limites et Performances

### Rate Limiting
Actuellement non implémenté, mais recommandé:
- 100 requêtes/minute pour GET
- 20 requêtes/minute pour POST/PATCH/DELETE

### Pagination
- Historique: 20 résultats par page par défaut
- Templates: Pas de pagination (nombre limité)
- Analytics: Pas de pagination (agrégation)

### Cache
Recommandations:
- Cache analytics pendant 5 minutes
- Cache templates pendant 1 minute
- Invalidation cache lors de création/modification

---

Bonne utilisation des API ! 🚀
