'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Trash2, Edit2, Check } from 'lucide-react';
import { UserFilter, FilterLimits, FilterPlan } from '@/types/filters';
import { toast } from 'sonner';
import { SUPPORT_CATEGORIES } from '@/lib/support-categories';

const slugifyFilterKey = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '') || `filter_${Date.now()}`;

// Mots-clés par défaut pour chaque catégorie
const DEFAULT_KEYWORDS: Record<string, string[]> = {
  'urgent': ['urgent', 'ASAP', 'immédiat', 'prioritaire', 'critique', 'rapidement', 'vite', 'pressé', 'emergency', 'SOS', 'help', 'au secours', 'maintenant', 'tout de suite', 'important'],
  'commande': ['commande', 'commander', 'achat', 'panier', 'checkout', 'acheter', 'passer commande', 'nouvelle commande', 'order', 'shopping', 'cart', 'paiement', 'carte bancaire', 'CB', 'Paypal'],
  'remboursement': ['remboursement', 'rembourser', 'argent', 'restitution', 'annulation', 'refund', 'retour', 'annuler', 'avoir', 'compensation', 'dédommagement', 'money back', 'remise', 'crédit'],
  'question-produit': ['produit', 'article', 'référence', 'disponibilité', 'stock', 'caractéristiques', 'dimensions', 'couleur', 'taille', 'spécifications', 'détails', 'description', 'product', 'info produit', 'compatible'],
  'suivi-commande': ['suivi', 'livraison', 'colis', 'transporteur', 'tracking', 'expédition', 'où est', 'délai', 'reçu', 'shipping', 'delivery', 'Colissimo', 'Chronopost', 'UPS', 'DHL'],
  'sav': ['SAV', 'garantie', 'réparation', 'défectueux', 'panne', 'cassé', 'ne fonctionne pas', 'broken', 'warranty', 'repair', 'retour SAV', 'échange', 'remplacement', 'dysfonctionnement'],
  'reclamation': ['réclamation', 'plainte', 'insatisfait', 'problème', 'déçu', 'complaint', 'mécontent', 'pas content', 'scandale', 'inadmissible', 'inacceptable', 'arnaque', 'colère', 'furieux', 'service client'],
  'information': ['information', 'renseignement', 'question', 'demande', 'savoir', 'info', 'comment', 'pourquoi', 'quand', 'où', 'qui', 'help', 'aide', 'explication', 'précision'],
  'facturation': ['facture', 'facturation', 'TVA', 'paiement', 'reçu', 'invoice', 'montant', 'prix', 'tarif', 'coût', 'devis', 'avoir fiscal', 'comptabilité', 'SIRET', 'attestation'],
  'technique': ['technique', 'bug', 'erreur', 'connexion', 'installation', 'problème technique', 'ne marche pas', 'crash', 'error', 'not working', 'setup', 'configuration', 'paramètres', 'wifi', 'réseau'],
  'autre': ['autre', 'divers', 'général', 'questions', 'demande générale', 'misc', 'various', 'other']
};

// Prompts contexte par défaut pour chaque catégorie
const DEFAULT_PROMPTS: Record<string, string> = {
  'urgent': 'Tu dois traiter cette demande en PRIORITÉ ABSOLUE. Ton ton doit être professionnel, rassurant et réactif. Propose une solution immédiate et concrète. Si nécessaire, escalade vers un responsable. Utilise des phrases courtes et claires.',
  'commande': 'Tu dois faciliter le processus de commande. Sois clair sur les étapes, les moyens de paiement acceptés, les délais de livraison. Rassure le client sur la sécurité du paiement. Si besoin, propose ton aide pour finaliser la commande.',
  'remboursement': 'Tu dois répondre avec empathie et professionnalisme. Explique clairement la procédure de remboursement, les délais (généralement 7 jours ouvrés), et rassure le client. Demande les informations nécessaires (numéro de commande, IBAN si besoin). Reste courtois même si le client est mécontent.',
  'question-produit': 'Tu dois fournir des informations précises et complètes sur les produits. Mentionne les caractéristiques techniques, les avantages, la compatibilité. Si tu ne connais pas la réponse, propose de te renseigner auprès de l\'équipe produit. Utilise un ton expert mais accessible.',
  'suivi-commande': 'Tu dois fournir le suivi de livraison de manière claire. Mentionne le numéro de tracking, le transporteur, la date de livraison estimée. Si la commande est en retard, présente des excuses et propose une solution (geste commercial si nécessaire). Reste transparent sur l\'état de la livraison.',
  'sav': 'Tu dois gérer le retour SAV avec professionnalisme. Explique la procédure : retour du produit, diagnostic, réparation ou échange. Mentionne la garantie applicable et les délais. Si le produit n\'est plus sous garantie, propose des solutions alternatives (réparation payante, remplacement). Reste empathique.',
  'reclamation': 'Tu dois ABSOLUMENT rester calme et empathique, même face à un client en colère. Présente des excuses sincères, reconnais le problème sans chercher d\'excuses. Propose une solution concrète et rapide (remboursement, avoir, geste commercial). Assure un suivi personnalisé. Ton objectif : transformer un client mécontent en ambassadeur.',
  'information': 'Tu dois répondre de manière claire et pédagogique. Structure ta réponse avec des paragraphes courts. Si la question est vague, demande des précisions. Propose des liens vers la FAQ ou la documentation si pertinent. Reste disponible pour des questions complémentaires.',
  'facturation': 'Tu dois fournir les informations de facturation avec précision. Explique comment obtenir une facture (téléchargement depuis le compte client, envoi par email). Mentionne les mentions légales obligatoires. Pour les entreprises, précise les informations de TVA intracommunautaire si applicable.',
  'technique': 'Tu dois résoudre le problème technique de manière méthodique. Pose des questions de diagnostic (système d\'exploitation, navigateur, message d\'erreur exact). Propose des solutions étape par étape, numérotées. Si le problème persiste, propose une assistance à distance ou un ticket d\'escalade vers l\'équipe technique.',
  'autre': 'Tu dois identifier la nature de la demande et la rediriger vers la bonne catégorie si possible. Reste courtois et propose ton aide pour clarifier la demande. Si nécessaire, transfère vers le service approprié.'
};

interface FiltersConfigTabProps {
  userPlan: 'starter' | 'pro' | 'scale';
  isLightMode?: boolean;
}

export function FiltersConfigTab({ userPlan, isLightMode = false }: FiltersConfigTabProps) {
  const [filters, setFilters] = useState<UserFilter[]>([]);
  const [limits, setLimits] = useState<FilterLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newKeywordInputs, setNewKeywordInputs] = useState<Record<string, string>>({});
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [editingFilterName, setEditingFilterName] = useState<string | null>(null);
  const [tempFilterName, setTempFilterName] = useState<string>('');

  // Créer les filtres par défaut à partir de SUPPORT_CATEGORIES
  const [allFilters, setAllFilters] = useState<Array<UserFilter & { isVirtual?: boolean }>>([]);

  const effectivePlan: FilterPlan = (limits?.plan as FilterPlan) || userPlan;
  const customFiltersLimit = limits?.max ?? (effectivePlan === 'pro' ? 5 : effectivePlan === 'scale' ? 999999 : 0);
  const hasUnlimitedCustomFilters = customFiltersLimit >= 999999;

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    setIsLoading(true);
    try {
      const [filtersRes, limitsRes] = await Promise.all([
        fetch('/api/filters'),
        fetch('/api/filters/limits'),
      ]);

      let dbFilters: UserFilter[] = [];
      if (filtersRes.ok) {
        const data = await filtersRes.json();
        dbFilters = data.filters || [];
      }

      if (limitsRes.ok) {
        const data = await limitsRes.json();
        setLimits(data.limits || null);
      }

      // Créer les filtres virtuels à partir de SUPPORT_CATEGORIES
      const virtualFilters = SUPPORT_CATEGORIES.map(cat => {
        // Chercher s'il existe déjà en base
        const existingFilter = dbFilters.find(f => f.filter_key === cat.id);
        
        if (existingFilter) {
          return existingFilter;
        }

        // Sinon créer un filtre virtuel
        return {
          id: `virtual_${cat.id}`,
          name: cat.label,
          filter_key: cat.id,
          is_default: true,
          is_active: true,
          keywords: DEFAULT_KEYWORDS[cat.id] || [],
          detection_rules: {
            keywords: DEFAULT_KEYWORDS[cat.id] || [],
            matchMode: 'any' as const,
            patterns: [],
            requiresAIConfirmation: false,
            minConfidence: 0,
          },
          response_config: {
            tone: 'professional' as const,
            language: 'fr',
            customInstructions: DEFAULT_PROMPTS[cat.id] || '',
            autoReply: false,
          },
          isVirtual: true,
          user_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          description: '',
          color: '#3B82F6',
          icon: cat.icon,
          usage_count: 0,
          last_used_at: null,
        } as any;
      });

      // Ajouter les filtres personnalisés (non-virtuels et non dans SUPPORT_CATEGORIES)
      const customFilters = dbFilters.filter(f => 
        !SUPPORT_CATEGORIES.some(cat => cat.id === f.filter_key)
      );

      setAllFilters([...virtualFilters, ...customFilters]);
      setFilters(dbFilters);
    } catch (error) {
      toast.error('Erreur lors du chargement des filtres');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFilter = async () => {
    const customFiltersCount = filters.filter((f) => !f.is_default).length;

    if (!hasUnlimitedCustomFilters && customFiltersCount >= customFiltersLimit) {
      toast.error('Limite de filtres atteinte', {
        description: `Votre plan ${effectivePlan} autorise ${customFiltersLimit} filtre(s) personnalisé(s).`,
      });
      return;
    }

    try {
      const newFilter = {
        name: 'Nouveau filtre',
        filter_key: `filter_${Date.now()}`,
        keywords: [],
        detection_rules: {
          keywords: [],
          matchMode: 'any',
          patterns: [],
          requiresAIConfirmation: false,
          minConfidence: 0,
        },
        response_config: {
          tone: 'professional',
          language: 'fr',
          customInstructions: '',
          autoReply: false,
        },
        is_active: true,
      };

      const res = await fetch('/api/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFilter),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur lors de la création');
      }

      await fetchFilters();
      toast.success('Filtre créé avec succès');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création');
    }
  };

  const handleUpdateFilter = useCallback(
    async (filterId: string, updates: Partial<UserFilter>) => {
      setSavingStates((prev) => ({ ...prev, [filterId]: true }));
      
      const filter = allFilters.find(f => f.id === filterId);
      
      try {
        // Si c'est un filtre virtuel, on doit le créer d'abord
        if (filter?.isVirtual) {
          const newFilter = {
            name: filter.name,
            filter_key: filter.filter_key,
            keywords: updates.keywords || filter.keywords,
            detection_rules: filter.detection_rules,
            response_config: {
              ...filter.response_config,
              ...(updates.response_config || {}),
            },
            is_active: true,
            is_default: true,
          };

          const res = await fetch('/api/filters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newFilter),
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Erreur lors de la création');
          }
        } else {
          // Mise à jour normale
          const res = await fetch(`/api/filters/${filterId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Erreur lors de la sauvegarde');
          }
        }

        await fetchFilters();
        toast.success('Filtre sauvegardé');
      } catch (error: any) {
        toast.error(error.message || 'Erreur lors de la sauvegarde');
      } finally {
        setSavingStates((prev) => ({ ...prev, [filterId]: false }));
      }
    },
    [allFilters]
  );

  const handleAddKeyword = async (filterId: string) => {
    const keyword = newKeywordInputs[filterId]?.trim();
    if (!keyword) return;

    const filter = allFilters.find((f) => f.id === filterId);
    if (!filter) return;

    const currentKeywords = filter.keywords || [];
    if (currentKeywords.includes(keyword)) {
      toast.info('Ce mot-clé existe déjà');
      return;
    }

    const updatedKeywords = [...currentKeywords, keyword];
    await handleUpdateFilter(filterId, {
      keywords: updatedKeywords,
    });

    setNewKeywordInputs((prev) => ({ ...prev, [filterId]: '' }));
  };

  const handleRemoveKeyword = async (filterId: string, keyword: string) => {
    const filter = allFilters.find((f) => f.id === filterId);
    if (!filter) return;

    const updatedKeywords = (filter.keywords || []).filter((k) => k !== keyword);
    await handleUpdateFilter(filterId, {
      keywords: updatedKeywords,
    });
  };

  const handleUpdateInstructions = async (filterId: string, instructions: string) => {
    const filter = allFilters.find((f) => f.id === filterId);
    if (!filter) return;

    await handleUpdateFilter(filterId, {
      response_config: {
        ...filter.response_config,
        customInstructions: instructions,
      },
    });
  };

  const handleDeleteFilter = async (filterId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce filtre ?')) return;

    try {
      const res = await fetch(`/api/filters/${filterId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Filtre supprimé avec succès');
        fetchFilters();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur réseau');
    }
  };

  const handleStartEditName = (filter: UserFilter) => {
    setEditingFilterName(filter.id);
    setTempFilterName(filter.name);
  };

  const handleSaveFilterName = async (filterId: string) => {
    if (!tempFilterName.trim()) {
      toast.error('Le nom du filtre ne peut pas être vide');
      return;
    }

    await handleUpdateFilter(filterId, { name: tempFilterName.trim() });
    setEditingFilterName(null);
    setTempFilterName('');
  };

  const handleCancelEditName = () => {
    setEditingFilterName(null);
    setTempFilterName('');
  };

  const customFilters = filters.filter((f) => !f.is_default);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
          {SUPPORT_CATEGORIES.length} filtres de base • {customFilters.length} personnalisés
        </p>
        <button
          onClick={handleCreateFilter}
          disabled={!hasUnlimitedCustomFilters && customFilters.length >= customFiltersLimit}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          Créer un filtre
        </button>
      </div>

      <div className="space-y-3">
        {allFilters.map((filter) => (
          <div
            key={filter.id}
            className={`rounded-lg border p-4 ${
              isLightMode 
                ? 'border-gray-200 bg-white shadow-sm' 
                : 'border-gray-700 bg-gray-800'
            }`}
          >
            {/* Header - Nom du filtre */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 flex-1">
                {editingFilterName === filter.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={tempFilterName}
                      onChange={(e) => setTempFilterName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveFilterName(filter.id);
                        if (e.key === 'Escape') handleCancelEditName();
                      }}
                      autoFocus
                      className={`flex-1 px-2 py-1 rounded border-2 font-semibold text-sm ${
                        isLightMode
                          ? 'border-blue-400 bg-white text-gray-900'
                          : 'border-blue-500 bg-gray-700 text-white'
                      }`}
                    />
                    <button
                      onClick={() => handleSaveFilterName(filter.id)}
                      className="p-1 rounded bg-green-500 text-white hover:bg-green-600"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={handleCancelEditName}
                      className={`p-1 rounded ${
                        isLightMode ? 'bg-gray-200 text-gray-700' : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className={`font-semibold text-base ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                      {filter.name}
                    </h3>
                    {!filter.isVirtual && (
                      <button
                        onClick={() => handleStartEditName(filter)}
                        className={`p-1 rounded transition-colors ${
                          isLightMode
                            ? 'text-gray-500 hover:bg-gray-100'
                            : 'text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </>
                )}
                {filter.is_default && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isLightMode
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    Par défaut
                  </span>
                )}
              </div>
              {!filter.is_default && (
                <button
                  onClick={() => handleDeleteFilter(filter.id)}
                  className={`p-1.5 rounded transition-colors ${
                    isLightMode 
                      ? 'text-red-600 hover:bg-red-50' 
                      : 'text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Section Mots-clés */}
            <div className="space-y-2 mb-3">
              <label className={`block text-xs font-semibold ${
                isLightMode ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Mots-clés ({(filter.keywords || []).length})
              </label>
              
              {/* Mots-clés existants */}
              {(filter.keywords || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(filter.keywords || []).map((keyword) => (
                    <span
                      key={keyword}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        isLightMode
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {keyword}
                      <button
                        onClick={() => handleRemoveKeyword(filter.id, keyword)}
                        className="hover:text-red-600 dark:hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Ajout de mot-clé */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newKeywordInputs[filter.id] || ''}
                  onChange={(e) =>
                    setNewKeywordInputs((prev) => ({ ...prev, [filter.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddKeyword(filter.id);
                  }}
                  placeholder="Ajouter un mot-clé..."
                  className={`flex-1 px-2 py-1.5 rounded border text-xs ${
                    isLightMode
                      ? 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400'
                      : 'border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-500'
                  }`}
                />
                <button
                  onClick={() => handleAddKeyword(filter.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter
                </button>
              </div>
            </div>

            {/* Section Prompt Contexte */}
            <div className="space-y-2">
              <label className={`block text-xs font-semibold ${
                isLightMode ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Prompt Contexte
              </label>
              <textarea
                value={filter.response_config?.customInstructions || ''}
                onChange={(e) => handleUpdateInstructions(filter.id, e.target.value)}
                placeholder="Instructions pour l'IA concernant ce type d'email..."
                rows={3}
                className={`w-full px-3 py-2 rounded border text-xs resize-none ${
                  isLightMode
                    ? 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400'
                    : 'border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-500'
                }`}
              />
              {savingStates[filter.id] && (
                <p className="text-xs text-blue-500">Sauvegarde...</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
