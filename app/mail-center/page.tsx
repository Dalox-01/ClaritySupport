'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Inbox, Send, BarChart3, Bot, CheckCircle2, Clock, AlertCircle,
  Plus, RefreshCw, Filter, Search, ChevronRight, Star, Archive, Trash2,
  Reply, Eye, Sparkles, Menu, X, Settings, Zap, TrendingUp, Users,
  Bell, FileText, Sun, Moon, Home, LogOut, UserCircle, CreditCard,
  HelpCircle, Package, DollarSign, Truck, Wrench, Info, Receipt,
  Laptop, AlertTriangle, Database, BookOpen, Edit, Save, Store,
  LayoutGrid, List, SlidersHorizontal, ShoppingBag, ChevronDown,
  MoreVertical, Search as SearchIcon, PanelLeftClose, PanelLeft, Lock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { EmailCache, InboxVerificationStatus, MailAccount, PendingReply } from '@/lib/mail-center-types';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { PendingRepliesPanel } from '@/components/pending-replies-panel';
import { ReplyEmailDialog } from '@/components/reply-email-dialog';
import { EmailDetailWindow } from '@/components/email-detail-window';
import { ReplyGeneratorWindow } from '@/components/reply-generator-window';
import { toast } from 'sonner';
import Link from 'next/link';
import { SUPPORT_CATEGORIES, getCategoryColor, getCategoryConfig } from '@/lib/support-categories';
import { SupportConfigModal } from '@/components/support-config-modal';
import { useMailCenterTheme } from '@/hooks/use-mail-center-theme';
import { TabAIConfigAdvanced, type AIConfigSectionId } from '@/components/tabs/tab-ai-config-advanced';
import { ShopifyDashboard } from '@/components/mail-center/ShopifyDashboard';
import { FiltersConfigTab } from '@/components/filters/filters-config-tab';
import { UpgradeModal } from '@/components/upgrade-modal';
import { normalizePlanName, type PlanName } from '@/lib/plan-limits';
import type { PlanType } from '@/lib/pricing-plans';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type AccountStatusStyle = {
  label: string;
  lightClass: string;
  darkClass: string;
  dotClass: string;
};

const ACCOUNT_STATUS_STYLES: Record<InboxVerificationStatus, AccountStatusStyle> = {
  pending: {
    label: 'Connexion en attente',
    lightClass: 'bg-amber-50 text-amber-700 border-amber-100',
    darkClass: 'bg-amber-500/10 text-amber-100 border-amber-500/30',
    dotClass: 'bg-amber-400',
  },
  waiting_test: {
    label: 'Test de routage requis',
    lightClass: 'bg-amber-50 text-amber-700 border-amber-100',
    darkClass: 'bg-amber-500/10 text-amber-100 border-amber-500/30',
    dotClass: 'bg-amber-400',
  },
  connected: {
    label: 'Connecté',
    lightClass: 'bg-blue-50 text-blue-700 border-blue-100',
    darkClass: 'bg-blue-500/10 text-blue-200 border-blue-500/30',
    dotClass: 'bg-blue-500',
  },
  error: {
    label: 'Erreur de vérification',
    lightClass: 'bg-red-50 text-red-700 border-red-100',
    darkClass: 'bg-red-500/10 text-red-200 border-red-500/30',
    dotClass: 'bg-red-500',
  },
};

const getAccountStatusStyle = (status: InboxVerificationStatus): AccountStatusStyle => {
  return ACCOUNT_STATUS_STYLES[status] ?? ACCOUNT_STATUS_STYLES.pending;
};

export default function MailCenterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme, colors } = useMailCenterTheme();
  const [activeTab, setActiveTab] = useState<'inbox' | 'pending' | 'sent' | 'rules' | 'analytics' | 'favorites' | 'archives' | 'shops' | 'ai-config'>('inbox');
  
  const [selectedEmail, setSelectedEmail] = useState<EmailCache | null>(null);
  const [emails, setEmails] = useState<EmailCache[]>([]);
  const [pendingReplies, setPendingReplies] = useState<PendingReply[]>([]);
  const [accounts, setAccounts] = useState<MailAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('inbox');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  
  // State pour la réponse rapide
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [emailToReply, setEmailToReply] = useState<EmailCache | null>(null);
  
  // States pour favoris et archives
  const [favoriteEmails, setFavoriteEmails] = useState<string[]>([]);
  const [archivedEmails, setArchivedEmails] = useState<string[]>([]);
  
  // States pour les fenêtres draggables
  const [emailDetailOpen, setEmailDetailOpen] = useState(false);
  const [selectedEmailForDetail, setSelectedEmailForDetail] = useState<EmailCache | null>(null);
  const [replyGeneratorOpen, setReplyGeneratorOpen] = useState(false);
  const [emailForReply, setEmailForReply] = useState<EmailCache | null>(null);
  const [windowZIndexes, setWindowZIndexes] = useState({
    emailDetail: 50,
    replyGenerator: 60,
    supportConfig: 70,
  });
  
  // State pour la modal de configuration support unifiée
  const [isSupportConfigOpen, setIsSupportConfigOpen] = useState(false);
  const [supportConfigInitialTab, setSupportConfigInitialTab] = useState<'ai-config' | 'filters'>('ai-config');
  const [supportConfigInitialSection, setSupportConfigInitialSection] = useState<AIConfigSectionId>('models');
  
  // User plan & Subscription
  const [userPlan, setUserPlan] = useState<PlanName>('STARTER');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('active');
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const normalizedSubscriptionStatus = (subscriptionStatus || 'active').toLowerCase();
  const isTrialReadOnly = normalizedSubscriptionStatus === 'trial' || normalizedSubscriptionStatus === 'trialing';
  const isTrialExpired = normalizedSubscriptionStatus === 'expired';
  const isActionRestricted = isTrialReadOnly || isTrialExpired;
  const isMailCenterLocked = isTrialExpired;
  const planTypeForModal: PlanType = userPlan === 'PRO' ? 'pro' : userPlan === 'SCALE' ? 'scale' : 'starter';
  const trialCountdownLabel = React.useMemo(() => {
    if (typeof trialDaysLeft === 'number') {
      if (trialDaysLeft <= 0 && trialEndsAt) {
        const diffMs = new Date(trialEndsAt).getTime() - Date.now();
        if (diffMs > 0) {
          const hoursLeft = Math.max(0, Math.ceil(diffMs / (60 * 60 * 1000)));
          if (hoursLeft > 0) {
            return `${hoursLeft}h restante${hoursLeft > 1 ? 's' : ''}`;
          }
        }
        return 'Moins d\'1h restante';
      }
      return `${trialDaysLeft} jour${trialDaysLeft > 1 ? 's' : ''} restant${trialDaysLeft > 1 ? 's' : ''}`;
    }
    if (trialEndsAt) {
      const diffMs = new Date(trialEndsAt).getTime() - Date.now();
      if (diffMs > 0) {
        const days = Math.max(0, Math.ceil(diffMs / DAY_IN_MS));
        return `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`;
      }
    }
    return null;
  }, [trialDaysLeft, trialEndsAt]);

  const handleTrialRestriction = () => {
    const message = isTrialExpired
      ? 'Votre période d\'essai de 7 jours est terminée. Passez à Starter pour continuer à utiliser le Mail Center.'
      : trialCountdownLabel
        ? `Mode lecture seule pendant l'essai (${trialCountdownLabel}). Passez à Starter pour activer toutes les actions.`
        : 'Mode lecture seule pendant la période d\'essai. Passez à Starter pour activer toutes les actions.';
    toast.error(message);
    setShowUpgradeModal(true);
  };

  const canModify = () => {
    if (isActionRestricted) {
      handleTrialRestriction();
      return false;
    }
    return true;
  };
  
  // State pour le thème
  const [isLightMode, setIsLightMode] = useState(true);
  
  // State pour l'IA
  const [isAIActive, setIsAIActive] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);

  // State pour la suppression de compte
  const [accountToDelete, setAccountToDelete] = useState<{ id: string; email: string } | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const bringToFront = (windowName: keyof typeof windowZIndexes) => {
    const maxZ = Math.max(...Object.values(windowZIndexes));
    setWindowZIndexes(prev => ({
      ...prev,
      [windowName]: maxZ + 1
    }));
  };

  const openEmailDetail = (email: EmailCache) => {
    setSelectedEmailForDetail(email);
    setEmailDetailOpen(true);
    bringToFront('emailDetail');
  };

  const openReplyGenerator = (email: EmailCache) => {
    if (!canModify()) return;
    setEmailForReply(email);
    setReplyGeneratorOpen(true);
    bringToFront('replyGenerator');
  };

  const openSupportConfigModal = () => {
    if (!canModify()) return;
    setIsSupportConfigOpen(true);
    bringToFront('supportConfig');
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Vous devez être connecté pour accéder au Mail Center');
      signIn('google', { callbackUrl: '/mail-center' });
    }
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadInitialData();
      const interval = setInterval(syncEmails, 60000);
      return () => clearInterval(interval);
    }
  }, [status]);
  
  useEffect(() => {
    if (status === 'authenticated' && accounts.length > 0) {
      const loadEmails = async () => {
        try {
          const url = searchQuery 
            ? `/api/mail-center/emails?limit=100&search=${encodeURIComponent(searchQuery)}`
            : '/api/mail-center/emails?limit=100';
            
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            setEmails(data.emails || []);
          }
        } catch (error) {
          console.error('Erreur chargement emails:', error);
        }
      };
      
      // Debounce search
      const timeoutId = setTimeout(() => {
        loadEmails();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [status, accounts.length, searchQuery]);

  useEffect(() => {
    if (status === 'authenticated' && isAIActive) {
      const autoReplyInterval = setInterval(() => {
        triggerAutoReply();
      }, 120000);
      return () => clearInterval(autoReplyInterval);
    }
  }, [status, isAIActive]);

  useEffect(() => {
    if (!isActionRestricted) return;
    if (replyDialogOpen) {
      setReplyDialogOpen(false);
      setEmailToReply(null);
    }
    if (replyGeneratorOpen) {
      setReplyGeneratorOpen(false);
      setEmailForReply(null);
    }
    if (isSupportConfigOpen) {
      setIsSupportConfigOpen(false);
    }
  }, [isActionRestricted, replyDialogOpen, replyGeneratorOpen, isSupportConfigOpen]);

  const triggerAutoReply = async (force = false) => {
    if (!force && !canModify()) return;
    try {
      const response = await fetch('/api/mail-center/auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.processed > 0) {
          toast.success(`${result.processed} réponse(s) automatique(s) envoyée(s) 🚀`);
          setTimeout(() => loadInitialData(false), 1000);
        }
      }
    } catch (error) {
      console.error('Erreur auto-reply:', error);
    }
  };

  const toggleAI = async (enabled: boolean) => {
    if (!canModify()) return;
    setIsAIActive(enabled);
    setIsAILoading(true);
    try {
      const response = await fetch('/api/mail-center/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      
      if (response.ok) {
        toast.success(enabled ? 'IA activée 24/7 🤖' : 'IA désactivée zzz');
        if (enabled) triggerAutoReply();
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error toggling AI:', error);
      toast.error('Erreur lors de la modification de l\'IA');
      setIsAIActive(!enabled); // Revert
    } finally {
      setIsAILoading(false);
    }
  };

  const loadInitialData = async (triggerSync = false) => {
    setIsLoading(true);
    try {
      let nextStatus = subscriptionStatus;
      // Charger l'abonnement
      const subRes = await fetch('/api/subscription/current');
      if (subRes.ok) {
        const subData = await subRes.json();
        if (subData.subscription) {
          const normalizedPlan = normalizePlanName(subData.subscription.plan);
          const status = (subData.subscription.status || 'active').toLowerCase();
          nextStatus = status;
          setUserPlan(normalizedPlan);
          setSubscriptionStatus(status);
          setTrialEndsAt(subData.subscription.trial_end || null);
          setTrialDaysLeft(
            typeof subData.subscription.trial_days_left === 'number'
              ? subData.subscription.trial_days_left
              : null
          );
        }
      }

      const nextIsReadOnly = nextStatus === 'trial' || nextStatus === 'trialing';
      const nextIsExpired = nextStatus === 'expired';

      const accountsRes = await fetch('/api/mail-center/accounts');
      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(Array.isArray(accountsData) ? accountsData : []);
      }

      const aiSettingsRes = await fetch('/api/mail-center/ai-settings');
      if (aiSettingsRes.ok) {
        const aiSettings = await aiSettingsRes.json();
        if (nextIsReadOnly || nextIsExpired) {
          setIsAIActive(false);
        } else if (aiSettings.enabled) {
          setIsAIActive(true);
            triggerAutoReply(true);
        } else {
          setIsAIActive(false);
        }
      }

      if (triggerSync) {
        setIsLoading(false);
        await syncEmails();
      } else {
        const res = await fetch('/api/mail-center/emails?limit=50');
        if (res.ok) {
          const data = await res.json();
          setEmails(Array.isArray(data.emails) ? data.emails : []);
        }
      }

      const pendingRes = await fetch('/api/mail-center/pending-replies');
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingReplies(Array.isArray(pendingData) ? pendingData : []);
      }
    } catch (error) {
      console.error('Erreur loadInitialData:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: string, accountEmail: string) => {
    if (!canModify()) return;
    setAccountToDelete({ id: accountId, email: accountEmail });
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;
    if (!canModify()) {
      setAccountToDelete(null);
      return;
    }
    setIsDeletingAccount(true);
    try {
      const response = await fetch(`/api/mail-center/accounts/${accountToDelete.id}`, { method: 'DELETE' });
      if (response.ok) {
        setAccounts(prev => prev.filter(acc => acc.id !== accountToDelete.id));
        if (selectedAccount === accountToDelete.id) setSelectedAccount('all');
        toast.success(`Compte supprimé`);
        loadInitialData();
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeletingAccount(false);
      setAccountToDelete(null);
    }
  };

  const syncEmails = async () => {
    setIsSyncing(true);
    try {
      const syncRes = await fetch('/api/mail-center/auto-sync', { method: 'POST' });
      if (syncRes.status === 401) {
        router.push('/auth/signin');
        return;
      }
      if (syncRes.ok) {
        const response = await fetch('/api/mail-center/emails?limit=50');
        if (response.ok) {
          const data = await response.json();
          setEmails(data.emails || []);
        }
      }
    } catch (error) {
      console.error('Erreur sync:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleFavorite = (emailId: string) => {
    if (!canModify()) return;
    setFavoriteEmails(prev => prev.includes(emailId) ? prev.filter(id => id !== emailId) : [...prev, emailId]);
  };

  const archiveEmail = (emailId: string) => {
    if (!canModify()) return;
    if (!archivedEmails.includes(emailId)) setArchivedEmails(prev => [...prev, emailId]);
  };

  const deleteEmail = async (emailId: string) => {
    if (!canModify()) return;
    try {
      setEmails(prev => prev.filter(email => email.id !== emailId));
      setFavoriteEmails(prev => prev.filter(id => id !== emailId));
      setArchivedEmails(prev => prev.filter(id => id !== emailId));
      setEmailDetailOpen(false);
      await fetch(`/api/mail-center/emails/${emailId}`, { method: 'DELETE' });
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const connectAccount = async (provider: 'gmail' | 'outlook') => {
    if (!canModify()) return;
    try {
      const res = await fetch(`/api/mail-center/${provider}/auth`);
      const data = await res.json();
      window.location.href = data.authUrl;
    } catch (error) {
      console.error(`Error connecting ${provider}:`, error);
    }
  };

  const getSentimentIcon = (sentiment: string | null, urgency: number) => {
    if (urgency >= 8) return <AlertCircle className="w-3 h-3 text-red-600 dark:text-red-400" />;
    if (sentiment === 'urgent') return <Clock className="w-3 h-3 text-orange-600 dark:text-orange-400" />;
    if (sentiment === 'negatif') return <AlertCircle className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />;
    return null;
  };

  const filteredEmails = emails.filter(email => {
    if (activeTab === 'favorites' && !favoriteEmails.includes(email.id)) return false;
    if (activeTab === 'archives' && !archivedEmails.includes(email.id)) return false;
    if ((activeTab === 'inbox' || activeTab === 'pending' || activeTab === 'analytics') && (archivedEmails.includes(email.id))) return false;
    
    const matchesSearch = searchQuery === '' || 
      email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'inbox' || email.support_category === filterCategory;
    const matchesAccount = selectedAccount === 'all' || email.account_id === selectedAccount;
    
    return matchesSearch && matchesCategory && matchesAccount;
  });

  // Calcul des compteurs par catégorie
  const categoryCounts = React.useMemo(() => {
    return SUPPORT_CATEGORIES.reduce((acc, cat) => {
      acc[cat.id] = emails.filter(e => e.support_category === cat.id && !archivedEmails.includes(e.id)).length;
      return acc;
    }, {} as Record<string, number>);
  }, [emails, archivedEmails]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <p>Redirection...</p>
      </div>
    );
  }

  const navItems = [
    { id: 'inbox', label: 'Boîte de réception', icon: Inbox, count: emails.filter(e => !e.is_read).length },
    { id: 'pending', label: 'En attente', icon: Clock, count: pendingReplies.length },
    { id: 'sent', label: 'Envoyés', icon: Send },
    { id: 'favorites', label: 'Favoris', icon: Star, count: favoriteEmails.length },
    { id: 'archives', label: 'Archives', icon: Archive, count: archivedEmails.length },
    { id: 'shops', label: 'Boutiques', icon: ShoppingBag },
    { id: 'analytics', label: 'Analytique', icon: BarChart3 },
    { id: 'rules', label: 'Règles', icon: SlidersHorizontal },
    { id: 'ai-config', label: 'Configuration IA', icon: Sparkles },
  ];

  return (
    <div className={cn(
      "relative flex h-screen w-full overflow-hidden transition-colors duration-300 font-sans",
      isLightMode ? "bg-[#f4f5fa]" : "bg-[#0f111a]"
    )}>
      {/* Sidebar */}
      <aside className={cn(
        "flex-shrink-0 flex flex-col border-r transition-all duration-300 z-30",
        isLightMode ? "bg-white border-gray-200" : "bg-[#1a1f3a] border-white/5",
        sidebarOpen ? "w-[260px]" : "w-[80px]"
      )}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-transparent">
          <div className="flex-shrink-0">
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
          </div>
          {sidebarOpen && (
            <span className={cn(
              "text-xl font-bold tracking-tight whitespace-nowrap",
              isLightMode ? "text-gray-800" : "text-white"
            )}>
              Clarity Mail
            </span>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                  activeTab === item.id
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20"
                    : isLightMode 
                      ? "text-gray-600 hover:bg-gray-100" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  activeTab === item.id ? "text-white" : "text-current"
                )} />
                
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "ml-auto h-5 min-w-[20px] flex items-center justify-center px-1.5 text-[10px]",
                          activeTab === item.id 
                            ? "bg-white/20 text-white" 
                            : isLightMode ? "bg-blue-100 text-blue-700" : "bg-blue-500/20 text-blue-400"
                        )}
                      >
                        {item.count}
                      </Badge>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Filters Section */}
          <div className="mt-6">
            {sidebarOpen && (
              <button 
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider mb-2",
                  isLightMode ? "text-gray-400 hover:text-gray-600" : "text-gray-500 hover:text-gray-300"
                )}
              >
                <span>Filtres</span>
                <ChevronDown className={cn("w-3 h-3 transition-transform", !filtersOpen && "-rotate-90")} />
              </button>
            )}
            
            <AnimatePresence>
              {(filtersOpen || !sidebarOpen) && (
                <motion.div 
                  initial={false}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-1 overflow-hidden"
                >
                  <button
                    onClick={() => setFilterCategory('inbox')}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                      filterCategory === 'inbox'
                        ? isLightMode ? "bg-gray-100 text-gray-900 font-medium" : "bg-white/10 text-white font-medium"
                        : isLightMode ? "text-gray-600 hover:bg-gray-50" : "text-gray-400 hover:bg-white/5"
                    )}
                    title={!sidebarOpen ? "Tous les messages" : undefined}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-400 flex-shrink-0" />
                    {sidebarOpen && <span>Tous</span>}
                  </button>

                  {SUPPORT_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setFilterCategory(cat.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group",
                        filterCategory === cat.id
                          ? isLightMode ? "bg-gray-100 text-gray-900 font-medium" : "bg-white/10 text-white font-medium"
                          : isLightMode ? "text-gray-600 hover:bg-gray-50" : "text-gray-400 hover:bg-white/5"
                      )}
                      title={!sidebarOpen ? cat.label : undefined}
                    >
                      <cat.icon className={cn(
                        "w-4 h-4 flex-shrink-0 transition-colors",
                        filterCategory === cat.id 
                          ? (isLightMode ? "text-gray-900" : "text-white")
                          : (isLightMode ? "text-gray-400 group-hover:text-gray-600" : "text-gray-500 group-hover:text-gray-300")
                      )} />
                      
                      {sidebarOpen && (
                        <>
                          <span className="truncate flex-1 text-left">{cat.label}</span>
                          {categoryCounts[cat.id] > 0 && (
                            <span className={cn(
                              "text-xs font-medium px-1.5 py-0.5 rounded-md transition-colors",
                              filterCategory === cat.id
                                ? (isLightMode ? "bg-white text-gray-900" : "bg-white/20 text-white")
                                : (isLightMode ? "bg-gray-100 text-gray-600 group-hover:bg-gray-200" : "bg-white/5 text-gray-400 group-hover:bg-white/10")
                            )}>
                              {categoryCounts[cat.id]}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className={cn(
          "p-4 border-t",
          isLightMode ? "border-gray-200" : "border-white/5"
        )}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4 mr-2" /> : <PanelLeft className="w-4 h-4" />}
            {sidebarOpen && "Réduire"}
          </Button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Header */}
        <header className={cn(
          "h-16 px-6 flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-xl border-b transition-colors",
          isLightMode ? "bg-white/80 border-gray-200" : "bg-[#0f111a]/80 border-white/5"
        )}>
          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <SearchIcon className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                isLightMode ? "text-gray-400 group-hover:text-blue-500" : "text-gray-500 group-hover:text-blue-400"
              )} />
              <Input
                placeholder="Rechercher (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "pl-10 h-10 rounded-full border-none shadow-sm transition-all",
                  isLightMode 
                    ? "bg-white focus:bg-white focus:ring-2 focus:ring-blue-500/20" 
                    : "bg-[#1a1f3a] focus:bg-[#1a1f3a] focus:ring-2 focus:ring-blue-500/20"
                )}
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* AI Toggle */}
            <div className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-full border transition-all mr-2 hidden md:flex",
              isAIActive 
                ? "bg-blue-500/10 border-blue-500/20" 
                : isLightMode ? "bg-gray-100 border-transparent" : "bg-white/5 border-transparent"
            )}>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bot className={cn("w-5 h-5", isAIActive ? "text-blue-500" : "text-gray-400")} />
                  {isAIActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className={cn("text-xs font-bold leading-none", isLightMode ? "text-gray-900" : "text-white")}>
                    IA Autopilot
                  </span>
                  <span className={cn("text-[10px] leading-none", isAIActive ? "text-blue-500" : "text-gray-500")}>
                    {isAIActive ? "Active 24/7" : "Désactivée"}
                  </span>
                </div>
              </div>
              <Switch 
                checked={isAIActive} 
                onCheckedChange={toggleAI}
                disabled={isAILoading || isActionRestricted}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "hidden md:flex items-center gap-2 rounded-full border border-blue-200 text-sm font-semibold text-blue-700 hover:text-blue-900",
                    isLightMode ? "bg-white" : "bg-[#1a1f3a]"
                  )}
                >
                  <Inbox className="w-4 h-4" />
                  Comptes
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-0 overflow-hidden">
                <div className={cn("px-4 py-3 border-b", isLightMode ? "bg-white border-gray-100" : "bg-[#151936] border-white/10")}> 
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Inbox className="w-4 h-4" />
                    Comptes Resend
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Connectés ({accounts.filter(a => a.verification_status === 'connected').length}) · En attente ({accounts.filter(a => a.verification_status !== 'connected' && a.verification_status !== 'error').length})
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {accounts.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                      Aucun compte Resend pour l'instant
                    </div>
                  ) : (
                    accounts.map((account) => {
                      const statusStyle = getAccountStatusStyle(account.verification_status);
                      return (
                        <div
                          key={account.id}
                          className="flex items-start gap-3 px-4 py-3 border-b last:border-0 border-gray-100 dark:border-white/5"
                        >
                          <span className={cn("mt-1 h-2.5 w-2.5 rounded-full", statusStyle.dotClass)} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{account.email}</p>
                            <p className="text-xs text-muted-foreground truncate">{statusStyle.label}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteAccount(account.id, account.email)}
                            disabled={isActionRestricted}
                            title="Supprimer le compte"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className={cn("p-3 border-t", isLightMode ? "bg-slate-50 border-gray-100" : "bg-[#11152c] border-white/10")}>
                  <Button size="sm" className="w-full" asChild>
                    <Link href="/dashboard/settings/inbox-connect">
                      Ouvrir Inbox Connect
                    </Link>
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className={cn(
                "w-[180px] h-9 rounded-full border-none shadow-sm hidden sm:flex",
                isLightMode ? "bg-white" : "bg-[#1a1f3a]"
              )}>
                <SelectValue placeholder="Tous les comptes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les comptes</SelectItem>
                {accounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>{acc.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLightMode(!isLightMode)}
              className="rounded-full"
            >
              {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={syncEmails}
              disabled={isSyncing}
              className={cn("rounded-full", isSyncing && "animate-spin")}
            >
              <RefreshCw className="w-5 h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full pl-2 pr-4 gap-2 h-10 ml-2 hover:bg-transparent">
                  <Avatar className="w-8 h-8 border border-gray-200 dark:border-white/10">
                    <AvatarImage src={session?.user?.image || undefined} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-xs hidden md:flex">
                    <span className={cn("font-semibold", isLightMode ? "text-gray-900" : "text-white")}>
                      {session?.user?.name?.split(' ')[0]}
                    </span>
                    <span className={cn(isLightMode ? "text-gray-500" : "text-gray-400")}>Admin</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={openSupportConfigModal}>
                  <Settings className="w-4 h-4 mr-2" /> Paramètres
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="w-4 h-4 mr-2" /> Abonnement
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="w-4 h-4 mr-2" /> Aide
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={() => window.location.href = '/api/auth/signout'}>
                  <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {isTrialReadOnly && !isMailCenterLocked && (
          <div className={cn(
            "px-6 py-3 border-b flex items-center justify-between text-sm",
            isLightMode
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-amber-900/30 border-amber-700 text-amber-100"
          )}>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Mode lecture seule pendant l&apos;essai.</span>
              {trialCountdownLabel && (
                <span className="font-semibold">{trialCountdownLabel}</span>
              )}
            </div>
            <Button
              variant="link"
              size="sm"
              className={cn("h-auto", isLightMode ? "text-amber-900" : "text-amber-200")}
              onClick={() => setShowUpgradeModal(true)}
            >
              Choisir un plan
            </Button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden p-6">
          <div className="h-full flex flex-col gap-6 max-w-[1800px] mx-auto">
            {/* View Content */}
            <Card className={cn(
              "flex-1 overflow-hidden border-none shadow-sm flex flex-col rounded-xl",
              isLightMode ? "bg-white" : "bg-[#1a1f3a]"
            )}>
              {activeTab === 'analytics' ? (
                <ScrollArea className="h-full">
                  <div className="p-6">
                    <AnalyticsDashboard isLightMode={isLightMode} />
                  </div>
                </ScrollArea>
              ) : activeTab === 'shops' ? (
                <ScrollArea className="h-full">
                  <div className="p-6">
                    <ShopifyDashboard isLightMode={isLightMode} />
                  </div>
                </ScrollArea>
              ) : activeTab === 'pending' ? (
                <ScrollArea className="h-full">
                  <div className="p-6">
                    <PendingRepliesPanel 
                      pendingReplies={pendingReplies as any} 
                      onRefresh={loadInitialData}
                    />
                  </div>
                </ScrollArea>
              ) : activeTab === 'rules' ? (
                <ScrollArea className="h-full">
                  <div className="p-6">
                    <FiltersConfigTab 
                      userPlan={userPlan}
                      isLightMode={isLightMode}
                    />
                  </div>
                </ScrollArea>
              ) : activeTab === 'ai-config' ? (
                <ScrollArea className="h-full">
                  <div className={cn("p-6", !isLightMode && "dark")}>
                    <TabAIConfigAdvanced 
                      userPlan={userPlan}
                      subscriptionStatus={subscriptionStatus}
                    />
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col h-full">
                  {/* List Header */}
                  <div className={cn(
                    "p-4 border-b flex items-center justify-between",
                    isLightMode ? "border-gray-100" : "border-white/5"
                  )}>
                    <div className="flex items-center gap-3">
                      <h2 className={cn("text-lg font-semibold", isLightMode ? "text-gray-900" : "text-white")}>
                        {activeTab === 'inbox' ? 'Boîte de réception' : 
                         activeTab === 'favorites' ? 'Favoris' : 
                         activeTab === 'archives' ? 'Archives' : 'Emails'}
                      </h2>
                      <Badge variant="secondary" className="rounded-full px-2.5">
                        {filteredEmails.length}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8">
                        <Filter className="w-3.5 h-3.5 mr-2" />
                        Filtrer
                      </Button>
                    </div>
                  </div>

                  {/* Email List */}
                  <ScrollArea className="flex-1">
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                      {isLoading ? (
                        <div className="flex justify-center py-20">
                          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                      ) : filteredEmails.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                          <Mail className="w-16 h-16 mb-4 text-gray-300" />
                          <p className="text-lg font-medium">Aucun email trouvé</p>
                          <p className="text-sm text-gray-500">Modifiez vos filtres pour voir plus de résultats</p>
                        </div>
                      ) : (
                        <AnimatePresence mode="popLayout">
                          {filteredEmails.map((email, index) => (
                            <EmailRow
                              key={email.id}
                              email={email}
                              onClick={() => openEmailDetail(email)}
                              getCategoryColor={getCategoryColor}
                              getSentimentIcon={getSentimentIcon}
                              onReply={(email) => {
                                  if (!canModify()) return;
                                  setEmailToReply(email);
                                  setReplyDialogOpen(true);
                              }}
                              onDelete={(emailId) => deleteEmail(emailId)}
                              isLightMode={isLightMode}
                                isReadOnly={isActionRestricted}
                            />
                          ))}
                        </AnimatePresence>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>

      {/* Modals & Windows */}
      <EmailDetailWindow
        email={selectedEmailForDetail}
        isOpen={emailDetailOpen}
        onClose={() => setEmailDetailOpen(false)}
        onGenerateReply={(email) => openReplyGenerator(email)}
        onToggleFavorite={toggleFavorite}
        onArchive={archiveEmail}
        onDelete={deleteEmail}
        isFavorite={selectedEmailForDetail ? favoriteEmails.includes(selectedEmailForDetail.id) : false}
        zIndex={windowZIndexes.emailDetail}
        onFocus={() => bringToFront('emailDetail')}
        isReadOnly={isActionRestricted}
        onRestrictedAction={handleTrialRestriction}
      />
      
      <ReplyGeneratorWindow
        email={emailForReply}
        isOpen={replyGeneratorOpen}
        onClose={() => setReplyGeneratorOpen(false)}
        zIndex={windowZIndexes.replyGenerator}
        onFocus={() => bringToFront('replyGenerator')}
      />
      
      <SupportConfigModal
        isOpen={isSupportConfigOpen}
        onClose={() => setIsSupportConfigOpen(false)}
        initialTab={supportConfigInitialTab}
        initialSection={supportConfigInitialSection}
        userPlan={userPlan}
        zIndex={windowZIndexes.supportConfig}
        onFocus={() => bringToFront('supportConfig')}
      />
      
      {emailToReply && (
        <ReplyEmailDialog
          isOpen={replyDialogOpen}
          onClose={() => {
            setReplyDialogOpen(false);
            setEmailToReply(null);
          }}
          email={emailToReply}
          onReplySent={() => loadInitialData()}
          isLightMode={isLightMode}
        />
      )}

      {isMailCenterLocked && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-6">
          <Card className={cn("w-full max-w-lg text-center space-y-4 p-8", isLightMode ? "bg-white" : "bg-[#1a1f3a]") }>
            <div className="flex flex-col items-center gap-2">
              <Lock className="w-10 h-10 text-amber-500" />
              <h3 className="text-2xl font-semibold">Essai expiré</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Votre période d&apos;essai de 7 jours est terminée. Passez à Starter, Pro ou Scale pour continuer à répondre à vos emails et automatiser votre support.
            </p>
            <div className="flex flex-col gap-2">
              <Button className="w-full" onClick={() => setShowUpgradeModal(true)}>
                Voir les plans disponibles
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push('/pricing')}>
                Découvrir la tarification
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Account Confirmation */}
      <AnimatePresence>
        {accountToDelete && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={cn(
                "w-full max-w-md p-6 rounded-xl shadow-2xl",
                isLightMode ? "bg-white" : "bg-[#1a1f3a] border border-white/10"
              )}
            >
              <h3 className={cn("text-lg font-bold mb-2", isLightMode ? "text-gray-900" : "text-white")}>
                Supprimer ce compte ?
              </h3>
              <p className={cn("mb-6", isLightMode ? "text-gray-600" : "text-gray-400")}>
                Êtes-vous sûr de vouloir supprimer le compte <span className="font-semibold">{accountToDelete.email}</span> ? Cette action est irréversible.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setAccountToDelete(null)}>Annuler</Button>
                <Button variant="destructive" onClick={confirmDeleteAccount} disabled={isDeletingAccount}>
                  {isDeletingAccount ? "Suppression..." : "Supprimer"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={planTypeForModal}
        reason={isMailCenterLocked
          ? 'Votre période d\'essai est terminée. Passez sur un plan payant pour continuer à agir.'
          : 'Passez sur Starter, Pro ou Scale pour débloquer toutes les actions du Mail Center.'}
      />
    </div>
  );
}

// Composant EmailRow (Style Liste Moderne)
function EmailRow({ 
  email, 
  onClick, 
  getCategoryColor, 
  getSentimentIcon,
  onReply,
  onDelete,
  isLightMode,
  isReadOnly = false,
}: { 
  email: EmailCache;
  onClick: () => void;
  getCategoryColor: (cat: string | null) => string;
  getSentimentIcon: (sent: string | null, urg: number) => React.ReactNode;
  onReply?: (email: EmailCache) => void;
  onDelete?: (emailId: string) => void;
  isLightMode: boolean;
  isReadOnly?: boolean;
}) {
  const initials = email.from_name
    ?.split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() || email.from_email[0].toUpperCase();

  const timeAgo = getTimeAgo(new Date(email.received_at));

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-4 p-4 cursor-pointer transition-all border-l-4",
        isLightMode 
          ? "hover:bg-gray-50" 
          : "hover:bg-white/5",
        !email.is_read 
          ? "border-l-blue-500 bg-blue-50/30 dark:bg-blue-500/5" 
          : "border-l-transparent"
      )}
    >
      <div className="flex-shrink-0 relative">
        <Avatar className="w-10 h-10">
          <AvatarFallback className={cn(
            "font-bold text-xs",
            isLightMode ? "bg-gray-100 text-gray-600" : "bg-white/10 text-gray-300"
          )}>
            {initials}
          </AvatarFallback>
        </Avatar>
        {!email.is_read && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-[#1a1f3a]" />
        )}
      </div>

      <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
        <div className="col-span-3 min-w-0">
          <p className={cn(
            "text-sm font-medium truncate",
            isLightMode ? "text-gray-900" : "text-white",
            !email.is_read && "font-bold"
          )}>
            {email.from_name || email.from_email}
          </p>
        </div>
        
        <div className="col-span-7 min-w-0">
           <div className="flex items-center gap-2">
              <p className={cn(
                "text-sm truncate",
                isLightMode ? "text-gray-600" : "text-gray-400",
                !email.is_read && (isLightMode ? "text-gray-900 font-medium" : "text-white font-medium")
              )}>
                {email.subject || '(sans objet)'}
              </p>
              {email.support_category && (
                <Badge variant="outline" className={cn('text-[10px] h-5 px-1.5 flex-shrink-0', getCategoryColor(email.support_category))}>
                  {getCategoryConfig(email.support_category)?.label || email.support_category}
                </Badge>
              )}
           </div>
        </div>

        <div className="col-span-2 flex items-center justify-end gap-3">
          <span className={cn(
            "text-xs whitespace-nowrap",
            isLightMode ? "text-gray-400" : "text-gray-500"
          )}>{timeAgo}</span>
          
          <div className={cn(
            "flex items-center gap-1 transition-opacity",
            isReadOnly ? "opacity-40" : "opacity-0 group-hover:opacity-100"
          )}>
            {onReply && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                disabled={isReadOnly}
                onClick={(e) => { e.stopPropagation(); onReply(email); }}
              >
                <Reply className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-500 hover:text-red-600"
                disabled={isReadOnly}
                onClick={(e) => { e.stopPropagation(); onDelete(email.id); }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'À l\'instant';
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`;
  if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)} j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

