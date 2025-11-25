# 📝 TODO - Intégrations UI Restantes

## ⚠️ Actions à compléter manuellement

Ces petites modifications doivent être faites dans le dashboard principal pour activer complètement toutes les fonctionnalités.

---

## 1. 🌟 Ajouter le bouton Favori dans le résultat

**Fichier:** `app/dashboard/page.tsx`

**Localisation:** Dans la section où le résultat de l'email généré est affiché

**Code à ajouter:**
```tsx
// Ajouter un état pour is_favorite
const [currentEmailId, setCurrentEmailId] = useState<string | null>(null);
const [isFavorite, setIsFavorite] = useState(false);

// Fonction pour toggle favori
const handleToggleFavorite = async () => {
  if (!currentEmailId) return;
  
  try {
    const res = await fetch(`/api/emails/${currentEmailId}/favorite`, {
      method: 'PATCH',
    });
    
    if (res.ok) {
      const data = await res.json();
      setIsFavorite(data.email.is_favorite);
      toast.success(data.email.is_favorite ? 'Ajouté aux favoris' : 'Retiré des favoris');
    }
  } catch (error) {
    toast.error('Erreur lors de la mise à jour');
  }
};

// Ajouter le bouton dans le UI
<Button
  variant="outline"
  size="sm"
  onClick={handleToggleFavorite}
  className={isFavorite ? 'text-yellow-500' : ''}
>
  <Star className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-yellow-500' : ''}`} />
  {isFavorite ? 'Favori' : 'Ajouter aux favoris'}
</Button>
```

---

## 2. 📥 Ajouter le bouton Export PDF dans le résultat

**Fichier:** `app/dashboard/page.tsx`

**Code à ajouter:**
```tsx
// Import en haut du fichier
import { downloadEmailAsPDF } from '@/lib/pdf-client';

// Fonction pour exporter en PDF
const handleExportPDF = async () => {
  if (!generatedEmail) return;
  
  const success = await downloadEmailAsPDF(
    generatedEmail.subject,
    generatedEmail.html
  );
  
  if (success) {
    toast.success('PDF téléchargé avec succès');
  } else {
    toast.error('Erreur lors de la génération du PDF');
  }
};

// Ajouter le bouton dans le UI
<Button
  variant="outline"
  size="sm"
  onClick={handleExportPDF}
>
  <Download className="h-4 w-4 mr-2" />
  Télécharger PDF
</Button>
```

---

## 3. 📋 Ajouter le bouton "Sauvegarder comme template"

**Fichier:** `app/dashboard/page.tsx`

**Code à ajouter:**
```tsx
// État pour le dialog
const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
const [templateName, setTemplateName] = useState('');

// Fonction pour sauvegarder comme template
const handleSaveAsTemplate = async () => {
  if (!generatedEmail || !templateName) {
    toast.error('Veuillez entrer un nom pour le template');
    return;
  }
  
  try {
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: templateName,
        subject: generatedEmail.subject,
        text: generatedEmail.text,
        html: generatedEmail.html,
        type: emailType,
        tone: tone,
        style: style,
      }),
    });
    
    const data = await res.json();
    if (data.success) {
      toast.success('Template créé avec succès');
      setSaveTemplateOpen(false);
      setTemplateName('');
    } else {
      toast.error(data.message || 'Erreur lors de la création');
    }
  } catch (error) {
    toast.error('Erreur lors de la création du template');
  }
};

// Dialog UI à ajouter
<Dialog open={saveTemplateOpen} onOpenChange={setSaveTemplateOpen}>
  <DialogTrigger asChild>
    <Button variant="outline" size="sm">
      <Save className="h-4 w-4 mr-2" />
      Sauvegarder comme template
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Sauvegarder comme template</DialogTitle>
      <DialogDescription>
        Ce template sera réutilisable pour vos prochains emails.
      </DialogDescription>
    </DialogHeader>
    <div>
      <Label htmlFor="template-name">Nom du template</Label>
      <Input
        id="template-name"
        value={templateName}
        onChange={(e) => setTemplateName(e.target.value)}
        placeholder="Ex: Email de relance client"
      />
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setSaveTemplateOpen(false)}>
        Annuler
      </Button>
      <Button onClick={handleSaveAsTemplate}>
        Sauvegarder
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 4. 🔗 Ajouter les liens de navigation

**Fichier:** `app/dashboard/page.tsx` ou layout du dashboard

**Code à ajouter dans la sidebar/navigation:**
```tsx
<nav className="space-y-2">
  <Link 
    href="/dashboard"
    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent"
  >
    <Mail className="h-4 w-4" />
    Générer
  </Link>
  
  <Link 
    href="/dashboard/templates"
    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent"
  >
    <FileText className="h-4 w-4" />
    Templates
  </Link>
  
  <Link 
    href="/dashboard/analytics"
    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent"
  >
    <BarChart3 className="h-4 w-4" />
    Analytics
  </Link>
  
  <Link 
    href="/dashboard/history"
    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent"
  >
    <History className="h-4 w-4" />
    Historique
  </Link>
</nav>
```

---

## 5. 📊 Améliorer la page historique avec recherche

**Fichier:** `app/dashboard/history/page.tsx` (si existe)

**Ajouter les composants de recherche:**
```tsx
// États pour les filtres
const [search, setSearch] = useState('');
const [typeFilter, setTypeFilter] = useState('all');
const [toneFilter, setToneFilter] = useState('all');
const [favoritesOnly, setFavoritesOnly] = useState(false);

// Fonction de recherche avec debounce
useEffect(() => {
  const timer = setTimeout(() => {
    loadHistory();
  }, 300);
  
  return () => clearTimeout(timer);
}, [search, typeFilter, toneFilter, favoritesOnly]);

// UI de recherche
<div className="flex gap-4 mb-6">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder="Rechercher dans l'historique..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="pl-10"
    />
  </div>
  
  <Select value={typeFilter} onValueChange={setTypeFilter}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Type" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Tous les types</SelectItem>
      <SelectItem value="candidature">Candidature</SelectItem>
      <SelectItem value="relance">Relance</SelectItem>
      {/* ... autres types */}
    </SelectContent>
  </Select>
  
  <Button
    variant={favoritesOnly ? "default" : "outline"}
    onClick={() => setFavoritesOnly(!favoritesOnly)}
  >
    <Star className={`h-4 w-4 mr-2 ${favoritesOnly ? 'fill-current' : ''}`} />
    Favoris
  </Button>
</div>
```

---

## 6. ✨ Ajouter l'indicateur de favoris dans l'historique

**Fichier:** `app/dashboard/history/page.tsx`

**Dans la card de chaque email:**
```tsx
{emails.map((email) => (
  <Card key={email.id}>
    <CardHeader>
      <div className="flex items-start justify-between">
        <CardTitle>{email.subject}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleToggleFavorite(email.id)}
        >
          <Star
            className={`h-4 w-4 ${
              email.is_favorite ? 'fill-yellow-500 text-yellow-500' : ''
            }`}
          />
        </Button>
      </div>
    </CardHeader>
    {/* ... reste du contenu */}
  </Card>
))}
```

---

## 📋 Checklist d'intégration

Cochez au fur et à mesure:

- [ ] Bouton favori dans le résultat généré
- [ ] Bouton export PDF dans le résultat
- [ ] Bouton "Sauvegarder comme template"
- [ ] Liens de navigation vers Templates
- [ ] Liens de navigation vers Analytics
- [ ] Barre de recherche dans historique
- [ ] Filtres dans historique (type, ton, favoris)
- [ ] Icônes favoris dans historique
- [ ] Toggle favoris fonctionnel partout
- [ ] Tests des exports PDF

---

## 🎨 Conseils UI/UX

### Placement des boutons (résultat généré):
```
[Copier] [Modifier] [★ Favori] [📥 PDF] [💾 Template] [🔄 Reformuler]
```

### Ordre de navigation:
```
Dashboard → Templates → Analytics → Historique → Usage
```

### Couleurs recommandées:
- Favori actif: `text-yellow-500 fill-yellow-500`
- Bouton PDF: `variant="outline"`
- Bouton Template: `variant="outline"`

---

## ⚡ Optimisations possibles

1. **Lazy loading** des graphiques analytics
2. **Virtualization** de la liste historique (react-window)
3. **Infinite scroll** au lieu de pagination
4. **Cache** des templates en mémoire
5. **Skeleton loaders** pendant chargement

---

## 🐛 Tests à faire

1. ✅ Créer un template
2. ✅ Utiliser un template pour générer
3. ✅ Marquer un email en favori
4. ✅ Filtrer par favoris
5. ✅ Rechercher dans l'historique
6. ✅ Exporter un PDF
7. ✅ Voir les analytics
8. ✅ Changer la période analytics

---

Complétez ces intégrations pour une expérience utilisateur optimale ! 🚀
