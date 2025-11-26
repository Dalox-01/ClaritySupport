'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  LayoutGrid, List, SlidersHorizontal
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
import { cn } from '@/lib/utils';
import type { EmailCache, MailAccount, PendingReply } from '@/lib/mail-center-types';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { PendingRepliesPanel } from '@/components/pending-replies-panel';
import { ReplyEmailDialog } from '@/components/reply-email-dialog';
import { EmailDetailWindow } from '@/components/email-detail-window';
import { ReplyGeneratorWindow } from '@/components/reply-generator-window';
import { QuotaDisplay } from '@/components/quota-display';
import { toast } from 'sonner';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { SUPPORT_CATEGORIES, getCategoryColor, getCategoryConfig } from '@/lib/support-categories';
import { KnowledgeBaseManager, loadKnowledgeBase, saveKnowledgeBase } from '@/lib/product-knowledge';
import { AIPromptBuilder, loadAIConfig, saveAIConfig, DEFAULT_AI_CONFIG } from '@/lib/ai-prompt-config';
import { SupportConfigModal } from '@/components/support-config-modal';
import { useMailCenterTheme } from '@/hooks/use-mail-center-theme';
import type { AIConfigSectionId } from '@/components/tabs/tab-ai-config-advanced';
import { ShopifyConnectPanel } from '@/components/mail-center/ShopifyConnectPanel';
import { ShopifyQuickConnect } from '@/components/mail-center/ShopifyQuickConnect';
import { ShopifyDashboard } from '@/components/mail-center/ShopifyDashboard';
import { MailCenterDock } from '@/components/mail-center-dock';

// Composant Card optimisé - Tilt effect simplifié avec CSS
const TiltCard = React.memo(({ children, className, glow = false }: { 
  children: React.ReactNode; 
  className?: string; 
  glow?: boolean 
}) => {
  return (
    <div
      className={cn(
        "relative transition-all duration-300 ease-out",
        "hover:scale-[1.02] hover:-translate-y-1",
        glow && "hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]",
        className
      )}
    >
      {children}
    </div>
  );
});

TiltCard.displayName = 'TiltCard';

export default function MailCenterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme, colors } = useMailCenterTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'pending' | 'sent' | 'rules' | 'analytics' | 'favorites' | 'archives' | 'shops'>('inbox');
  
  const [selectedEmail, setSelectedEmail] = useState<EmailCache | null>(null);
  const [emails, setEmails] = useState<EmailCache[]>([]);
  const [pendingReplies, setPendingReplies] = useState<PendingReply[]>([]);
  const [accounts, setAccounts] = useState<MailAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('inbox');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  
  // State pour la réponse rapide
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [emailToReply, setEmailToReply] = useState<EmailCache | null>(null);
  
  // States pour favoris et archives
  const [favoriteEmails, setFavoriteEmails] = useState<string[]>([]); // IDs des emails favoris
  const [archivedEmails, setArchivedEmails] = useState<string[]>([]); // IDs des emails archivés
  
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
  
  // State pour afficher tous les filtres
  const [showAllFilters, setShowAllFilters] = useState(false);
  
  // User plan - TODO: Fetch from subscription/session
  const [userPlan] = useState<'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE'>('PRO');
  
  // State pour le thème - Par défaut en mode clair
  const [isLightMode, setIsLightMode] = useState(true);
  
  // State pour l'IA active/inactive - INACTIVE PAR DÉFAUT
  const [isAIActive, setIsAIActive] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);

  // State pour la suppression de compte
  const [accountToDelete, setAccountToDelete] = useState<{ id: string; email: string } | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Fonction pour mettre une fenêtre au premier plan
  const bringToFront = (windowName: keyof typeof windowZIndexes) => {
    const maxZ = Math.max(...Object.values(windowZIndexes));
    setWindowZIndexes(prev => ({
      ...prev,
      [windowName]: maxZ + 1
    }));
  };

  // Ouvrir le détail d'un email
  const openEmailDetail = (email: EmailCache) => {
    setSelectedEmailForDetail(email);
    setEmailDetailOpen(true);
    bringToFront('emailDetail');
  };

  // Ouvrir le générateur de réponse
  const openReplyGenerator = (email: EmailCache) => {
    setEmailForReply(email);
    setReplyGeneratorOpen(true);
    bringToFront('replyGenerator');
  };

  // Vérifier l'authentification
  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Vous devez être connecté pour accéder au Mail Center');
      signIn('google', { callbackUrl: '/mail-center' });
    }
  }, [status]);

  // Charger les données initiales
  useEffect(() => {
    if (status === 'authenticated') {
      loadInitialData();
      const interval = setInterval(syncEmails, 60000);
      return () => clearInterval(interval);
    }
  }, [status]);
  
  // Recharger les emails quand les comptes changent
  useEffect(() => {
    if (status === 'authenticated' && accounts.length > 0) {
      const loadEmails = async () => {
        try {
          const response = await fetch('/api/mail-center/emails?limit=100');
          if (response.ok) {
            const data = await response.json();
            setEmails(data.emails || []);
          }
        } catch (error) {
          console.error('Erreur chargement emails:', error);
        }
      };
      loadEmails();
    }
  }, [status, accounts.length]);

  // Auto-reply automatique
  useEffect(() => {
    if (status === 'authenticated' && isAIActive) {
      const autoReplyInterval = setInterval(() => {
        triggerAutoReply();
      }, 120000);
      return () => clearInterval(autoReplyInterval);
    }
  }, [status, isAIActive]);

  // Vérifier si connexion réussie
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'gmail_connected' || success === 'outlook_connected') {
      toast.success(`🎉 Compte ${success === 'gmail_connected' ? 'Gmail' : 'Outlook'} connecté avec succès !`);
      window.history.replaceState({}, '', '/mail-center');
      loadInitialData(true);
    } else if (error) {
      toast.error('❌ Erreur de connexion');
      window.history.replaceState({}, '', '/mail-center');
    }
  }, []);

  const triggerAutoReply = async () => {
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

  const loadInitialData = async (triggerSync = false) => {
    setIsLoading(true);
    try {
      const accountsRes = await fetch('/api/mail-center/accounts');
      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(Array.isArray(accountsData) ? accountsData : []);
      }

      const aiSettingsRes = await fetch('/api/mail-center/ai-settings');
      if (aiSettingsRes.ok) {
        const aiSettings = await aiSettingsRes.json();
        setIsAIActive(aiSettings.enabled || false);
        if (aiSettings.enabled) triggerAutoReply();
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

  const toggleAI = async () => {
    setIsAILoading(true);
    try {
      const newState = !isAIActive;
      const response = await fetch('/api/mail-center/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newState })
      });

      if (response.ok) {
        setIsAIActive(newState);
        if (newState) {
          toast.success('IA activée - Réponses automatiques 24/7');
          triggerAutoReply();
        } else {
          toast.info('IA désactivée');
        }
      }
    } catch (error) {
      toast.error('Erreur lors de l\'activation de l\'IA');
    } finally {
      setIsAILoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: string, accountEmail: string) => {
    setAccountToDelete({ id: accountId, email: accountEmail });
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;
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
    setFavoriteEmails(prev => prev.includes(emailId) ? prev.filter(id => id !== emailId) : [...prev, emailId]);
  };

  const archiveEmail = (emailId: string) => {
    if (!archivedEmails.includes(emailId)) setArchivedEmails(prev => [...prev, emailId]);
  };

  const deleteEmail = async (emailId: string) => {
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

  const stats = [
    { label: 'Total', value: emails.length, icon: Mail, color: 'blue' },
    { label: 'Non lus', value: emails.filter(e => !e.is_read).length, icon: Inbox, color: 'orange' },
    { label: 'En attente', value: pendingReplies.length, icon: Clock, color: 'yellow' },
    { label: 'Comptes', value: accounts.length, icon: Users, color: 'purple' },
  ];

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "h-screen w-full relative overflow-hidden transition-colors duration-700",
        isLightMode ? "bg-[#f8fafc]" : "bg-[#050505]"
      )}
    >
      {/* Background Ambient Glow */}
      <div className={cn(
        "absolute inset-0 pointer-events-none transition-opacity duration-1000",
        isLightMode ? "opacity-40" : "opacity-20"
      )}>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[120px]" />
      </div>

      {/* Top Header - Minimalist & Floating */}
      <header className={cn(
        "absolute top-0 left-0 right-0 h-16 z-40 px-6 flex items-center justify-between backdrop-blur-md border-b transition-all duration-500",
        isLightMode ? "bg-white/60 border-gray-200/50" : "bg-black/40 border-white/5"
      )}>
        {/* Left: Brand */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className={cn(
              "p-2 rounded-xl transition-all duration-300 group-hover:scale-110",
              isLightMode ? "bg-blue-50 text-blue-600" : "bg-blue-500/10 text-blue-400"
            )}>
              <Mail className="w-5 h-5" />
            </div>
            <span className={cn(
              "font-bold text-lg tracking-tight hidden sm:block",
              isLightMode ? "text-gray-900" : "text-white"
            )}>
              Clarity Mail
            </span>
          </Link>
        </div>

        {/* Center: Search Bar (Floating) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full group">
            <Search className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
              isLightMode ? "text-gray-400 group-hover:text-blue-500" : "text-gray-500 group-hover:text-blue-400"
            )} />
            <Input
              placeholder="Rechercher dans vos emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-10 pr-4 h-10 rounded-full border transition-all duration-300",
                isLightMode
                  ? "bg-white/80 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  : "bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-white placeholder:text-gray-500"
              )}
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Account Selector */}
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className={cn(
              "w-[180px] h-9 rounded-full border transition-all hidden sm:flex",
              isLightMode 
                ? "bg-white/80 border-gray-200 text-gray-700" 
                : "bg-white/5 border-white/10 text-gray-200"
            )}>
              <SelectValue placeholder="Tous les comptes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les comptes</SelectItem>
              {accounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id}>{acc.email}</SelectItem>
              ))}
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-xs h-8"
                  onClick={(e) => {
                    e.preventDefault();
                    connectAccount('gmail');
                  }}
                >
                  <Plus className="w-3 h-3 mr-2" /> Ajouter
                </Button>
              </div>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={syncEmails}
            disabled={isSyncing}
            className={cn(
              "rounded-full transition-all",
              isSyncing && "animate-spin",
              isLightMode ? "hover:bg-gray-100 text-gray-600" : "hover:bg-white/10 text-gray-300"
            )}
          >
            <RefreshCw className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsLightMode(!isLightMode)}
            className={cn(
              "rounded-full transition-all",
              isLightMode ? "hover:bg-gray-100 text-gray-600" : "hover:bg-white/10 text-yellow-400"
            )}
          >
            {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full p-0 w-9 h-9 overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all">
                <Avatar className="w-full h-full">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsSupportConfigOpen(true)}>
                <Settings className="w-4 h-4 mr-2" /> Configuration
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => window.location.href = '/api/auth/signout'}>
                <LogOut className="w-4 h-4 mr-2" /> Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="absolute top-16 bottom-0 left-0 right-0 p-4 pb-28 flex gap-4 overflow-hidden">
        
        {/* Central Content Area */}
        <div className="flex-1 flex flex-col h-full min-w-0 relative z-10 max-w-7xl mx-auto w-full">
           
           {/* Top Bar: Stats & Filters */}
           <div className="flex flex-col gap-4 mb-4 flex-shrink-0">
              {/* Stats Row (Compact) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border backdrop-blur-md transition-all hover:scale-[1.02]",
                      isLightMode 
                        ? "bg-white/60 border-gray-200/50 shadow-sm" 
                        : "bg-white/5 border-white/10 shadow-lg"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      isLightMode ? `bg-${stat.color}-100 text-${stat.color}-600` : `bg-${stat.color}-500/20 text-${stat.color}-400`
                    )}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={cn("text-xs font-medium uppercase tracking-wider", isLightMode ? "text-gray-500" : "text-gray-400")}>{stat.label}</p>
                      <p className={cn("text-lg font-bold leading-none", isLightMode ? "text-gray-900" : "text-white")}>{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Filters Row (Horizontal Scroll) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Button
                  variant={filterCategory === 'inbox' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterCategory('inbox')}
                  className={cn(
                    "rounded-full px-4 h-8 text-xs font-medium transition-all whitespace-nowrap",
                    filterCategory === 'inbox' 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700" 
                      : isLightMode ? "bg-white text-gray-600 border-gray-200" : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                  )}
                >
                  <Inbox className="w-3.5 h-3.5 mr-2" />
                  Tous les messages
                </Button>
                
                {SUPPORT_CATEGORIES.map(cat => (
                  <Button
                    key={cat.id}
                    variant={filterCategory === cat.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterCategory(cat.id)}
                    className={cn(
                      "rounded-full px-4 h-8 text-xs font-medium transition-all whitespace-nowrap",
                      filterCategory === cat.id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700"
                        : isLightMode ? "bg-white text-gray-600 border-gray-200" : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                    )}
                  >
                    {cat.icon && <cat.icon className="w-3.5 h-3.5 mr-2" />}
                    {cat.label}
                  </Button>
                ))}
              </div>
           </div>

           {/* Content Area (Maximized) */}
           <div className={cn(
             "flex-1 relative rounded-2xl overflow-hidden border backdrop-blur-md shadow-2xl transition-all duration-500",
             isLightMode 
               ? "bg-white/80 border-gray-200/50" 
               : "bg-[#0A0A0A]/80 border-white/10"
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
              ) : (
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-3">
                    {isLoading ? (
                      <div className="flex justify-center py-20">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                      </div>
                    ) : filteredEmails.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                        <Mail className="w-16 h-16 mb-4" />
                        <p className="text-lg font-medium">Aucun email trouvé</p>
                      </div>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {filteredEmails.map((email, index) => (
                          <EmailCard
                            key={email.id}
                            email={email}
                            index={index}
                            isSelected={false}
                            onClick={() => openEmailDetail(email)}
                            getCategoryColor={getCategoryColor}
                            getSentimentIcon={getSentimentIcon}
                            onReply={(email) => {
                              setEmailToReply(email);
                              setReplyDialogOpen(true);
                            }}
                            onDelete={(emailId) => deleteEmail(emailId)}
                            isLightMode={isLightMode}
                            theme={theme}
                            colors={colors}
                          />
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </ScrollArea>
              )}
           </div>
        </div>
      </main>

      {/* Bottom Dock (Superimposed) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
        <MailCenterDock
          currentView={activeTab}
          onViewChange={(view) => setActiveTab(view as any)}
          isLightMode={isLightMode}
        />
      </div>

      {/* Windows/Modals */}
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

      <AnimatePresence>
        {accountToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => !isDeletingAccount && setAccountToDelete(null)}
          >
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-2">Supprimer ce compte ?</h3>
              <p className="text-gray-500 mb-6">Cette action est irréversible.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setAccountToDelete(null)}>Annuler</Button>
                <Button variant="destructive" className="flex-1" onClick={confirmDeleteAccount}>Supprimer</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Composant EmailCard avec animations vraiment innovantes
function EmailCard({ 
  email, 
  index, 
  isSelected, 
  onClick, 
  getCategoryColor, 
  getSentimentIcon,
  onReply,
  onDelete,
  isLightMode = false,
  theme,
  colors
}: { 
  email: EmailCache;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  getCategoryColor: (cat: string | null) => string;
  getSentimentIcon: (sent: string | null, urg: number) => React.ReactNode;
  onReply?: (email: EmailCache) => void;
  onDelete?: (emailId: string) => void;
  isLightMode?: boolean;
  theme: string;
  colors: any;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const initials = email.from_name
    ?.split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() || email.from_email[0].toUpperCase();

  const timeAgo = getTimeAgo(new Date(email.received_at));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative p-4 rounded-xl border cursor-pointer transition-all duration-300 overflow-hidden group backdrop-blur-3xl shadow-sm',
        'hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-md',
        isLightMode
          ? 'border-gray-100 bg-white hover:border-blue-200'
          : 'border-white/5 bg-white/5 hover:border-blue-500/30 hover:bg-white/10',
        !email.is_read && (isLightMode 
          ? 'font-semibold border-l-4 border-l-blue-500 bg-blue-50/30' 
          : 'font-semibold border-l-4 border-l-blue-400 bg-blue-500/5')
      )}
    >
      <div className="relative flex gap-4 z-10 items-center">
        {/* Avatar */}
        <Avatar className={cn(
          "w-10 h-10 flex-shrink-0 border transition-all",
          isLightMode ? "border-gray-200" : "border-white/10"
        )}>
          <AvatarFallback className={cn(
            "font-bold text-xs",
            isLightMode 
              ? "bg-gray-100 text-gray-600"
              : "bg-white/10 text-gray-300"
          )}>
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Contenu */}
        <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
          <div className="col-span-3 min-w-0">
            <p className={cn(
              "text-sm font-medium truncate",
              isLightMode ? "text-gray-900" : "text-white"
            )}>
              {email.from_name || email.from_email}
            </p>
          </div>
          
          <div className="col-span-6 min-w-0">
             <div className="flex items-center gap-2">
                <p className={cn(
                  "text-sm truncate",
                  isLightMode ? "text-gray-600" : "text-gray-300",
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

          <div className="col-span-3 flex items-center justify-end gap-3">
            <span className={cn(
              "text-xs whitespace-nowrap",
              isLightMode ? "text-gray-400" : "text-gray-500"
            )}>{timeAgo}</span>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onReply && (
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onReply(email); }}>
                  <Reply className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); onDelete(email.id); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
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
