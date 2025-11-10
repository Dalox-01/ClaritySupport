'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { 
  Mail, 
  Inbox, 
  Send, 
  BarChart3, 
  Bot, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  RefreshCw,
  Filter,
  Search,
  ChevronRight,
  Star,
  Archive,
  Trash2,
  Reply,
  Eye,
  Sparkles,
  Menu,
  X,
  Settings,
  Zap,
  TrendingUp,
  Users,
  Bell,
  FileText,
  Sun,
  Moon,
  Home,
  LogOut,
  UserCircle,
  CreditCard,
  HelpCircle,
  Package,
  DollarSign,
  Truck,
  Wrench,
  Info,
  Receipt,
  Laptop,
  AlertTriangle,
  Database,
  BookOpen,
  Edit,
  Save
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

// Composant TiltCard amélioré avec effets 3D
function TiltCard({ children, className, glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={className}
    >
      {glow && isHovered && (
        <motion.div
          className="absolute inset-0 rounded-lg opacity-0 blur-xl"
          animate={{ opacity: 0.3 }}
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4), transparent)',
          }}
        />
      )}
      <div style={{ transform: 'translateZ(50px)', transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </motion.div>
  );
}

export default function MailCenterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'pending' | 'sent' | 'rules' | 'analytics' | 'favorites' | 'archives'>('inbox');
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
  const [supportConfigInitialTab, setSupportConfigInitialTab] = useState<'ai-config'>('ai-config');
  
  // State pour afficher tous les filtres
  const [showAllFilters, setShowAllFilters] = useState(false);
  
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


  // Scroll parallax
  const { scrollYProgress } = useScroll();
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.5]);

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

  // Vérifier si connexion réussie
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'gmail_connected' || success === 'outlook_connected') {
      toast.success(`🎉 Compte ${success === 'gmail_connected' ? 'Gmail' : 'Outlook'} connecté avec succès !`, {
        description: 'Analyse des emails en cours...',
        duration: 5000,
      });
      window.history.replaceState({}, '', '/mail-center');
      loadInitialData(true);
    } else if (error) {
      const errorMessages: Record<string, string> = {
        'missing_params': 'Paramètres manquants',
        'save_failed': 'Erreur lors de la sauvegarde du compte',
        'server_error': 'Erreur serveur',
      };
      toast.error('❌ Erreur de connexion', {
        description: errorMessages[error] || 'Une erreur est survenue',
        duration: 5000,
      });
      window.history.replaceState({}, '', '/mail-center');
    }
  }, []);

  const loadInitialData = async (triggerSync = false) => {
    setIsLoading(true);
    try {
      const accountsRes = await fetch('/api/mail-center/accounts');
      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(Array.isArray(accountsData) ? accountsData : []);
      } else {
        setAccounts([]);
      }

      // Charger l'état de l'IA
      const aiSettingsRes = await fetch('/api/mail-center/ai-settings');
      if (aiSettingsRes.ok) {
        const aiSettings = await aiSettingsRes.json();
        setIsAIActive(aiSettings.enabled || false);
      }

      if (triggerSync) {
        setIsLoading(false);
        await syncEmails();
      } else {
        const res = await fetch('/api/mail-center/emails?limit=50');
        const data = await res.json();
        const emailList = Array.isArray(data.emails) ? data.emails : [];
        setEmails(emailList);
      }

      const pendingRes = await fetch('/api/mail-center/pending-replies');
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingReplies(Array.isArray(pendingData) ? pendingData : []);
      } else {
        setPendingReplies([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setAccounts([]);
      setEmails([]);
      setPendingReplies([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour activer/désactiver l'IA
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
      } else {
        console.error('Erreur lors de la mise à jour de l\'état de l\'IA');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsAILoading(false);
    }
  };

  // Fonction pour supprimer un compte
  const handleDeleteAccount = async (accountId: string, accountEmail: string) => {
    setAccountToDelete({ id: accountId, email: accountEmail });
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;
    
    setIsDeletingAccount(true);
    try {
      const response = await fetch(`/api/mail-center/accounts/${accountToDelete.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Retirer du state local
        setAccounts(prev => prev.filter(acc => acc.id !== accountToDelete.id));
        
        // Si c'était le compte sélectionné, passer à "all"
        if (selectedAccount === accountToDelete.id) {
          setSelectedAccount('all');
        }
        
        toast.success(`Compte ${accountToDelete.email} supprimé avec succès`);
        
        // Recharger les emails
        loadInitialData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression compte:', error);
      toast.error('Erreur lors de la suppression du compte');
    } finally {
      setIsDeletingAccount(false);
      setAccountToDelete(null);
    }
  };

  const syncEmails = async () => {
    setIsSyncing(true);
    
    try {
      const syncRes = await fetch('/api/mail-center/auto-sync', { method: 'POST' });
      
      // Si 401 (non authentifié), rediriger vers login
      if (syncRes.status === 401) {
        console.warn('⚠️ Session expirée, redirection vers login');
        router.push('/auth/signin');
        return;
      }
      
      if (!syncRes.ok) {
        throw new Error('Erreur synchronisation');
      }
      
      const syncData = await syncRes.json();
      
      const response = await fetch('/api/mail-center/emails?limit=50');
      
      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Fonctions pour favoris, archives et suppression
  const toggleFavorite = (emailId: string) => {
    setFavoriteEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const archiveEmail = (emailId: string) => {
    // Ne pas archiver si déjà archivé
    if (archivedEmails.includes(emailId)) {
      return;
    }
    setArchivedEmails(prev => [...prev, emailId]);
  };

  const deleteEmail = (emailId: string) => {
    // Supprimer définitivement l'email de la liste
    setEmails(prev => prev.filter(email => email.id !== emailId));
    // Retirer aussi des favoris et archives si présent
    setFavoriteEmails(prev => prev.filter(id => id !== emailId));
    setArchivedEmails(prev => prev.filter(id => id !== emailId));
    setEmailDetailOpen(false); // Fermer la fenêtre de détail
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

  // Utiliser la fonction getCategoryColor de la librairie
  // const getCategoryColor est maintenant importée depuis lib/support-categories

  const getSentimentIcon = (sentiment: string | null, urgency: number) => {
    if (urgency >= 8) return <AlertCircle className="w-3 h-3 text-red-600 dark:text-red-400" />;
    if (sentiment === 'urgent') return <Clock className="w-3 h-3 text-orange-600 dark:text-orange-400" />;
    if (sentiment === 'negatif') return <AlertCircle className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />;
    return null;
  };

  const filteredEmails = emails.filter(email => {
    // Filtrer selon l'onglet actif
    if (activeTab === 'favorites' && !favoriteEmails.includes(email.id)) {
      return false;
    }
    if (activeTab === 'archives' && !archivedEmails.includes(email.id)) {
      return false;
    }
    if ((activeTab === 'inbox' || activeTab === 'pending' || activeTab === 'analytics') && 
        (archivedEmails.includes(email.id))) {
      return false;
    }
    
    const matchesSearch = searchQuery === '' || 
      email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Utiliser support_category (classification par hashtags) au lieu de category (ancienne classification générique)
    // 'inbox' affiche tous les emails (navigation principale)
    const matchesCategory = 
      filterCategory === 'inbox' ||  // Inbox = tous les emails
      email.support_category === filterCategory;  // Filtre spécifique
    const matchesAccount = selectedAccount === 'all' || email.account_id === selectedAccount;
    
    return matchesSearch && matchesCategory && matchesAccount;
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Mail className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          </motion.div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </motion.div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const stats = [
    { label: 'Total emails', value: emails.length, icon: Mail, color: 'blue', gradient: 'from-blue-500 to-blue-600' },
    { label: 'Non lus', value: emails.filter(e => !e.is_read).length, icon: Inbox, color: 'orange', gradient: 'from-orange-500 to-orange-600' },
    { label: 'En attente', value: pendingReplies.length, icon: Clock, color: 'yellow', gradient: 'from-yellow-500 to-yellow-600' },
    { label: 'Comptes', value: accounts.length, icon: Users, color: 'purple', gradient: 'from-purple-500 to-purple-600' },
  ];

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "min-h-screen relative overflow-hidden transition-all duration-700",
        isLightMode 
          ? "bg-gradient-to-br from-blue-50 via-white to-cyan-50" 
          : "bg-gradient-to-br from-[#0A0E27] via-[#0F1629] to-[#0A0E27]"
      )}
    >
      {/* Grille animée en arrière-plan (même style que homepage) */}
      <div className={cn("absolute inset-0 transition-opacity duration-700", isLightMode ? "opacity-10" : "opacity-20")}>
        <motion.div
          className="h-full w-full"
          style={{
            backgroundImage: isLightMode
              ? `linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)`
              : `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
      
      {/* Blob lumineux qui suit la souris */}
      <motion.div
        className={cn("pointer-events-none absolute inset-0 transition-opacity duration-700", isLightMode ? "opacity-30" : "opacity-100")}
        style={{
          background: isLightMode
            ? `radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2), transparent 50%)`
            : `radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.12), transparent 50%)`,
        }}
      />
      
      {/* Floating particles */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ y, opacity }}>
        {[...Array(30)].map((_, i) => {
          const size = Math.random() * 3 + 1;
          const depth = Math.random();
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: size,
                height: size,
                background: `radial-gradient(circle, rgba(59, 130, 246, ${0.3 + depth * 0.2}), transparent)`,
                filter: `blur(${depth * 1.5}px)`,
              }}
              animate={{
                y: [0, -30 * (1 + depth), 0],
                x: [0, Math.sin(i) * 15, 0],
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 5 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </motion.div>

      {/* Header */}
      <motion.header 
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-all duration-700",
          isLightMode
            ? "border-blue-200/50 bg-white/70 shadow-lg shadow-blue-100/50"
            : "border-blue-500/20 bg-[#0A0E27]/70 shadow-lg shadow-blue-500/10"
        )}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2"
          >
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                "flex lg:hidden items-center justify-center p-2 rounded-lg transition-colors",
                isLightMode ? "hover:bg-blue-100 text-gray-700" : "hover:bg-blue-500/10 text-white"
              )}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            
            <Link href="/" className={cn("flex items-center gap-2 font-semibold group", isLightMode ? "text-gray-900" : "text-white")}>
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <Mail className={cn("h-5 w-5", isLightMode ? "text-blue-600" : "text-blue-400")} />
                <motion.div
                  className={cn("absolute inset-0 rounded-full blur-md", isLightMode ? "bg-blue-600/30" : "bg-blue-400/20")}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <motion.span
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "hidden sm:inline bg-gradient-to-r bg-clip-text text-transparent",
                  isLightMode ? "from-gray-900 to-gray-700" : "from-white to-gray-300"
                )}
              >
                Mail Center
              </motion.span>
            </Link>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-2 sm:gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Bouton Refresh amélioré */}
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="outline"
                size="icon"
                onClick={syncEmails}
                disabled={isSyncing}
                className={cn(
                  "relative border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 text-blue-400 hover:text-blue-300 transition-all shadow-lg shadow-blue-500/20"
                )}
              >
                <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                {isSyncing && (
                  <motion.div
                    className="absolute inset-0 rounded-md border-2 border-blue-400"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </Button>
            </motion.div>
            
            {/* Toggle Mode Clair/Sombre */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLightMode(!isLightMode)}
              className={cn(
                "p-2 rounded-lg border transition-all shadow-lg",
                isLightMode 
                  ? "bg-gradient-to-br from-slate-500/10 to-gray-500/10 border-slate-500/30 hover:border-slate-400/50 shadow-slate-500/20" 
                  : "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 hover:border-yellow-400/50 shadow-yellow-500/20"
              )}
              title={isLightMode ? "Passer au mode sombre" : "Passer au mode clair"}
            >
              {isLightMode ? (
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <Moon className="w-4 h-4 text-slate-700" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ rotate: 180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <Sun className="w-4 h-4 text-yellow-400" />
                </motion.div>
              )}
            </motion.button>
            
            {/* Affichage du quota */}
            <QuotaDisplay isLightMode={isLightMode} />
            
            {/* Menu utilisateur avec photo de profil */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "relative rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all",
                    "hover:ring-2 hover:ring-blue-400/50"
                  )}
                >
                  <Avatar className={cn(
                    "h-9 w-9 border-2 transition-all",
                    isLightMode 
                      ? "border-blue-500/30 hover:border-blue-500" 
                      : "border-blue-500/30 hover:border-blue-400"
                  )}>
                    <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || 'User'} />
                    <AvatarFallback className={cn(
                      "text-xs font-semibold transition-colors",
                      isLightMode ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                    )}>
                      {session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className={cn(
                  "w-56 mt-2",
                  isLightMode 
                    ? "bg-white border-gray-200 shadow-xl" 
                    : "bg-[#1a1f3a] border-blue-500/20"
                )}
              >
                <DropdownMenuLabel className={cn(
                  "font-normal",
                  isLightMode ? "text-gray-900" : "text-white"
                )}>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session?.user?.name || 'Utilisateur'}</p>
                    <p className={cn(
                      "text-xs leading-none",
                      isLightMode ? "text-gray-500" : "text-gray-400"
                    )}>
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className={cn(
                  isLightMode ? "bg-gray-200" : "bg-blue-500/20"
                )} />
                <DropdownMenuItem asChild>
                  <Link 
                    href="/" 
                    className={cn(
                      "flex items-center cursor-pointer transition-colors",
                      isLightMode 
                        ? "text-gray-900 hover:bg-blue-50 hover:text-blue-600" 
                        : "text-gray-200 hover:bg-blue-500/10 hover:text-blue-400"
                    )}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    <span>Accueil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={cn(
                    "flex items-center cursor-pointer transition-colors",
                    isLightMode 
                      ? "text-gray-900 hover:bg-blue-50 hover:text-blue-600" 
                      : "text-gray-200 hover:bg-blue-500/10 hover:text-blue-400"
                  )}
                  onClick={() => connectAccount('gmail')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span>Connecter un compte</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    href="/mail-center/settings" 
                    className={cn(
                      "flex items-center cursor-pointer transition-colors",
                      isLightMode 
                        ? "text-gray-900 hover:bg-blue-50 hover:text-blue-600" 
                        : "text-gray-200 hover:bg-blue-500/10 hover:text-blue-400"
                    )}
                  >
                    <UserCircle className="w-4 h-4 mr-2" />
                    <span>Mon profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    href="/mail-center/billing" 
                    className={cn(
                      "flex items-center cursor-pointer transition-colors",
                      isLightMode 
                        ? "text-gray-900 hover:bg-blue-50 hover:text-blue-600" 
                        : "text-gray-200 hover:bg-blue-500/10 hover:text-blue-400"
                    )}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    <span>Abonnement</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    href="/mail-center/settings" 
                    className={cn(
                      "flex items-center cursor-pointer transition-colors",
                      isLightMode 
                        ? "text-gray-900 hover:bg-blue-50 hover:text-blue-600" 
                        : "text-gray-200 hover:bg-blue-500/10 hover:text-blue-400"
                    )}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Paramètres</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={cn(
                    "flex items-center cursor-pointer transition-colors",
                    isLightMode 
                      ? "text-gray-900 hover:bg-blue-50 hover:text-blue-600" 
                      : "text-gray-200 hover:bg-blue-500/10 hover:text-blue-400"
                  )}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  <span>Aide</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className={cn(
                  isLightMode ? "bg-gray-200" : "bg-blue-500/20"
                )} />
                <DropdownMenuItem 
                  className={cn(
                    "flex items-center cursor-pointer transition-colors",
                    isLightMode 
                      ? "text-red-600 hover:bg-red-50 hover:text-red-700" 
                      : "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  )}
                  onClick={() => {
                    // Déconnexion
                    window.location.href = '/api/auth/signout';
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-blue-500/20 lg:hidden"
            >
              <div className="space-y-1 px-4 pb-4 pt-2">
                {[
                  { id: 'inbox', label: 'Inbox', icon: Inbox },
                  { id: 'pending', label: 'Validation', icon: Clock },
                  { id: 'analytics', label: 'Stats', icon: BarChart3 },
                ].map((tab, index) => (
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                        activeTab === tab.id
                          ? "bg-blue-500/20 text-blue-400"
                          : "text-gray-400 hover:bg-blue-500/10"
                      )}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content avec design innovant */}
      <main className="relative mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-6 pt-24 sm:py-8 sm:pt-28">
        <div className="flex gap-6">
          {/* Sidebar fixe à gauche - Navigation/Filtres/Comptes */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={cn(
              "hidden lg:block w-64 flex-shrink-0 space-y-4 sticky top-24 self-start h-[calc(100vh-7rem)] overflow-y-auto",
              // Scrollbar personnalisée selon le thème
              isLightMode 
                ? "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-gray-200 [&::-webkit-scrollbar-thumb:hover]:bg-gray-50"
                : "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-gray-800 [&::-webkit-scrollbar-thumb:hover]:bg-gray-900",
              mobileMenuOpen && cn(
                "fixed inset-y-0 left-0 z-40 w-72 p-4 pt-24 overflow-y-auto shadow-2xl lg:relative lg:inset-auto lg:z-auto lg:w-64 lg:p-0 lg:pt-0 lg:shadow-none",
                isLightMode ? "bg-blue-50" : "bg-[#0A0E27]"
              )
            )}
          >
            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className={cn(
                "p-4 border shadow-lg backdrop-blur-xl transition-all duration-700",
                isLightMode 
                  ? "border-blue-200/50 bg-white/70 shadow-blue-100/50" 
                  : "border-blue-500/20 bg-[#1a1f3a]/70 shadow-blue-500/10"
              )}>
                <h3 className={cn(
                  "font-semibold mb-4 text-xs uppercase tracking-wide flex items-center gap-2",
                  isLightMode ? "text-gray-700" : "text-white"
                )}>
                  <Zap className={cn("w-4 h-4", isLightMode ? "text-blue-600" : "text-blue-400")} />
                  Navigation
                </h3>
                <nav className="space-y-2">
                  {[
                    { id: 'inbox', label: 'Inbox', icon: Inbox, count: emails.filter(e => !archivedEmails.includes(e.id)).length },
                    { id: 'pending', label: 'Validation', icon: Clock, count: pendingReplies.length },
                    { id: 'analytics', label: 'Stats', icon: BarChart3, count: null },
                  ].map((tab) => (
                    <motion.div
                      key={tab.id}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                        className={cn(
                          "w-full justify-start gap-3 transition-all h-11",
                          isLightMode 
                            ? activeTab === tab.id 
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-md shadow-blue-200/50" 
                              : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                            : activeTab === tab.id 
                              ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 shadow-md" 
                              : "text-gray-300 hover:bg-blue-500/10 hover:text-blue-400"
                        )}
                        onClick={() => setActiveTab(tab.id as any)}
                      >
                        <tab.icon className="w-5 h-5" />
                        <span className="flex-1 text-left font-medium">{tab.label}</span>
                        {tab.count !== null && tab.count > 0 && (
                          <Badge className="bg-blue-500 text-white shadow-sm">
                            {tab.count}
                          </Badge>
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </nav>
              </Card>
            </motion.div>

            {/* Filtres */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className={cn(
                "p-4 border shadow-lg backdrop-blur-xl transition-all duration-700",
                isLightMode 
                  ? "border-blue-200/50 bg-white/70 shadow-blue-100/50" 
                  : "border-blue-500/20 bg-[#1a1f3a]/70 shadow-blue-500/10"
              )}>
                <h3 className={cn(
                  "font-semibold mb-3 text-xs uppercase tracking-wide flex items-center gap-2",
                  isLightMode ? "text-gray-700" : "text-white"
                )}>
                  <Filter className={cn("w-4 h-4", isLightMode ? "text-blue-600" : "text-blue-400")} />
                  Filtres
                </h3>
                <div className="space-y-1.5">
                  {[
                    { id: 'inbox', label: '📬 Inbox' },
                    ...SUPPORT_CATEGORIES.map(cat => ({
                      id: cat.id,
                      label: `${cat.icon} ${cat.label}`
                    }))
                  ].slice(0, showAllFilters ? undefined : 6).map((filter) => {
                    // Compter les emails avec support_category (classification par hashtags)
                    const count = filter.id === 'inbox' 
                      ? emails.length 
                      : emails.filter(e => e.support_category === filter.id).length;
                    
                    return (
                      <motion.div
                        key={filter.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ x: 4 }}
                      >
                        <Button
                          variant={filterCategory === filter.id ? 'secondary' : 'ghost'}
                          size="sm"
                          className={cn(
                            "w-full justify-start text-xs h-9 transition-all",
                            filterCategory === filter.id 
                              ? isLightMode
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-sm shadow-blue-200/50"
                                : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 shadow-sm"
                              : isLightMode
                                ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                : "text-gray-300 hover:bg-blue-500/10 hover:text-blue-400"
                          )}
                          onClick={() => setFilterCategory(filter.id)}
                        >
                          <span className="flex-1 text-left">{filter.label}</span>
                          {count > 0 && (
                            <Badge variant="outline" className={cn(
                              "ml-auto h-5 px-1.5 text-xs font-semibold",
                              isLightMode 
                                ? "border-blue-300/50 text-blue-600 bg-blue-50" 
                                : "border-blue-500/30 text-blue-400"
                            )}>
                              {count}
                            </Badge>
                          )}
                        </Button>
                      </motion.div>
                    );
                  })}
                  
                  {/* Bouton pour afficher plus de filtres */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAllFilters(!showAllFilters)}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-all",
                      isLightMode
                        ? "text-blue-600 hover:bg-blue-50"
                        : "text-blue-400 hover:bg-blue-500/10"
                    )}
                  >
                    <motion.div
                      animate={{ rotate: showAllFilters ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </motion.div>
                    {showAllFilters ? 'Moins de filtres' : 'Plus de filtres'}
                  </motion.button>
                </div>
              </Card>
            </motion.div>

            {/* Comptes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className={cn(
                "p-4 border shadow-lg backdrop-blur-xl transition-all duration-700",
                isLightMode 
                  ? "border-blue-200/50 bg-white/70 shadow-blue-100/50" 
                  : "border-blue-500/20 bg-[#1a1f3a]/70 shadow-blue-500/10"
              )}>
                <h3 className={cn(
                  "font-semibold mb-3 text-xs uppercase tracking-wide flex items-center gap-2",
                  isLightMode ? "text-gray-700" : "text-white"
                )}>
                  <Users className={cn("w-4 h-4", isLightMode ? "text-blue-600" : "text-blue-400")} />
                  Comptes
                </h3>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className={cn(
                    "w-full border transition-all",
                    isLightMode 
                      ? "border-blue-200/50 bg-blue-50/50 text-gray-700" 
                      : "border-blue-500/20 bg-[#0f1320] text-white"
                  )}>
                    <SelectValue placeholder="Tous les comptes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les comptes</SelectItem>
                    {Array.isArray(accounts) && accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.email}
                      </SelectItem>
                    ))}
                    
                    {/* Séparateur pour les groupes */}
                    {Array.isArray(accounts) && accounts.length > 0 && (
                      <div className={cn(
                        "my-2 border-t",
                        isLightMode ? "border-blue-200/50" : "border-blue-500/20"
                      )} />
                    )}
                    
                    {/* Groupes */}
                    <SelectItem value="group:support">
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        Équipe Support
                      </div>
                    </SelectItem>
                    <SelectItem value="group:vente">
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        Équipe Commerciale
                      </div>
                    </SelectItem>
                    <SelectItem value="group:direction">
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        Direction
                      </div>
                    </SelectItem>
                    <SelectItem value="group:partenaires">
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        Partenaires
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Card>
            </motion.div>

            {/* Outils */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className={cn(
                "p-3 border shadow-lg backdrop-blur-xl transition-all duration-700",
                isLightMode 
                  ? "border-blue-200/50 bg-white/70 shadow-blue-100/50" 
                  : "border-blue-500/20 bg-[#1a1f3a]/70 shadow-blue-500/10"
              )}>
                <h3 className={cn(
                  "text-xs font-semibold mb-2 flex items-center gap-2",
                  isLightMode ? "text-gray-700" : "text-gray-200"
                )}>
                  <Sparkles className={cn("w-3 h-3", isLightMode ? "text-blue-500" : "text-blue-400")} />
                  Configuration Support
                </h3>
                <div className="flex gap-1.5 flex-col">
                  {/* Configuration IA */}
                  <motion.button
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSupportConfigInitialTab('ai-config');
                      setIsSupportConfigOpen(true);
                      bringToFront('supportConfig');
                    }}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border transition-all group text-left",
                      isLightMode
                        ? "border-purple-300/40 hover:border-purple-400/60 bg-purple-500/10 hover:bg-purple-500/20"
                        : "border-purple-500/20 hover:border-purple-400/40 bg-purple-500/10 hover:bg-purple-500/20"
                    )}
                    title="Configuration des prompts IA"
                  >
                    <Settings className={cn("w-4 h-4", isLightMode ? "text-purple-600" : "text-purple-400")} />
                    <div className="flex-1 min-w-0">
                      <div className={cn("text-xs font-medium", isLightMode ? "text-purple-700" : "text-purple-300")}>
                        Configuration IA
                      </div>
                      <div className={cn("text-[10px]", isLightMode ? "text-purple-600/70" : "text-purple-400/70")}>
                        Personnaliser les réponses
                      </div>
                    </div>
                  </motion.button>

                  {/* Toggle IA Active/Inactive */}
                  <motion.button
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleAI}
                    disabled={isAILoading}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border transition-all group text-left",
                      isAIActive
                        ? isLightMode
                          ? "border-green-300/40 hover:border-green-400/60 bg-green-500/10 hover:bg-green-500/20"
                          : "border-green-500/20 hover:border-green-400/40 bg-green-500/10 hover:bg-green-500/20"
                        : isLightMode
                          ? "border-gray-300/40 hover:border-gray-400/60 bg-gray-500/10 hover:bg-gray-500/20"
                          : "border-gray-500/20 hover:border-gray-400/40 bg-gray-500/10 hover:bg-gray-500/20"
                    )}
                    title={isAIActive ? "IA Active - Réponses automatiques activées" : "IA Inactive - Aucune réponse automatique"}
                  >
                    {isAILoading ? (
                      <RefreshCw className={cn("w-4 h-4 animate-spin", isLightMode ? "text-gray-600" : "text-gray-400")} />
                    ) : (
                      <Zap className={cn(
                        "w-4 h-4",
                        isAIActive
                          ? isLightMode ? "text-green-600" : "text-green-400"
                          : isLightMode ? "text-gray-600" : "text-gray-400"
                      )} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-xs font-medium",
                        isAIActive
                          ? isLightMode ? "text-green-700" : "text-green-300"
                          : isLightMode ? "text-gray-700" : "text-gray-300"
                      )}>
                        IA {isAIActive ? "Active" : "Inactive"}
                      </div>
                      <div className={cn(
                        "text-[10px]",
                        isAIActive
                          ? isLightMode ? "text-green-600/70" : "text-green-400/70"
                          : isLightMode ? "text-gray-600/70" : "text-gray-400/70"
                      )}>
                        {isAIActive ? "Réponses auto activées" : "Réponses manuelles"}
                      </div>
                    </div>
                  </motion.button>
                </div>
              </Card>
            </motion.div>

            {/* Mes comptes connectés */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className={cn(
                "p-3 border shadow-lg backdrop-blur-xl transition-all duration-700",
                isLightMode 
                  ? "border-blue-200/50 bg-white/70 shadow-blue-100/50" 
                  : "border-blue-500/20 bg-[#1a1f3a]/70 shadow-blue-500/10"
              )}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className={cn("w-4 h-4", isLightMode ? "text-blue-600" : "text-blue-400")} />
                    <h3 className={cn("text-xs font-semibold", isLightMode ? "text-gray-900" : "text-white")}>
                      Mes comptes
                    </h3>
                  </div>

                  {/* Liste des comptes */}
                  <div className="space-y-1.5">
                    {Array.isArray(accounts) && accounts.length === 0 && (
                      <div className={cn(
                        "text-[10px] text-center py-3 rounded-lg",
                        isLightMode ? "text-gray-500 bg-gray-100/50" : "text-gray-400 bg-gray-800/30"
                      )}>
                        Aucun compte connecté
                      </div>
                    )}

                    {Array.isArray(accounts) && accounts.map((account) => (
                      <motion.div
                        key={account.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "flex items-center justify-between gap-2 p-2 rounded-lg border transition-all group",
                          isLightMode
                            ? "border-blue-200/30 bg-blue-50/30 hover:bg-blue-100/50"
                            : "border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Mail className={cn("w-3.5 h-3.5 flex-shrink-0", isLightMode ? "text-blue-600" : "text-blue-400")} />
                          <span className={cn(
                            "text-xs font-medium truncate",
                            isLightMode ? "text-gray-700" : "text-gray-200"
                          )}>
                            {account.email}
                          </span>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteAccount(account.id, account.email)}
                          className={cn(
                            "flex-shrink-0 p-1.5 rounded transition-all opacity-0 group-hover:opacity-100",
                            isLightMode
                              ? "hover:bg-red-100 text-red-600 hover:text-red-700"
                              : "hover:bg-red-500/20 text-red-400 hover:text-red-300"
                          )}
                          title={`Supprimer ${account.email}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Bouton ajouter un compte */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => connectAccount('gmail')}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 p-2 rounded-lg border transition-all mt-2",
                      isLightMode
                        ? "border-blue-300/40 hover:border-blue-400/60 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700"
                        : "border-blue-500/20 hover:border-blue-400/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300"
                    )}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Ajouter un compte</span>
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          </motion.aside>

          {/* Zone principale - Stats + Emails */}
          <div className="flex-1 space-y-4 min-w-0">
            {/* Hero Stats Section - Plus petit et compact */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3">
                {/* Grille des stats - Version ultra-compacte */}
                <div className="grid gap-1.5 grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: stat.color === 'blue' ? 0.1 : stat.color === 'orange' ? 0.2 : stat.color === 'yellow' ? 0.3 : 0.4 }}
                      whileHover={{ scale: 1.02 }}
                      onMouseEnter={() => setHoveredCardIndex(index)}
                      onMouseLeave={() => setHoveredCardIndex(null)}
                      className={cn(
                        "relative overflow-hidden rounded-md border p-1.5 shadow-sm cursor-pointer backdrop-blur-xl transition-all duration-700",
                        isLightMode
                          ? "border-blue-200/50 bg-white/70 shadow-blue-100/50"
                          : "border-blue-500/20 bg-[#1a1f3a]/70 shadow-blue-500/10"
                      )}
                    >
                      <div className="relative flex items-center gap-1.5 z-10">
                        <motion.div
                          animate={{ 
                            scale: hoveredCardIndex === index ? 1.1 : 1
                          }}
                          transition={{ duration: 0.3 }}
                          className={cn(
                            "p-1 rounded-md bg-gradient-to-br flex-shrink-0",
                            stat.color === 'blue' && (isLightMode ? "from-blue-500/30 to-blue-600/20" : "from-blue-500/20 to-blue-600/10"),
                            stat.color === 'orange' && (isLightMode ? "from-orange-500/30 to-orange-600/20" : "from-orange-500/20 to-orange-600/10"),
                            stat.color === 'yellow' && (isLightMode ? "from-yellow-500/30 to-yellow-600/20" : "from-yellow-500/20 to-yellow-600/10"),
                            stat.color === 'purple' && (isLightMode ? "from-purple-500/30 to-purple-600/20" : "from-purple-500/20 to-purple-600/10")
                          )}
                        >
                          {stat.color === 'blue' && <stat.icon className={cn("w-3 h-3", isLightMode ? "text-blue-600" : "text-blue-400")} />}
                          {stat.color === 'orange' && <stat.icon className={cn("w-3 h-3", isLightMode ? "text-orange-600" : "text-orange-400")} />}
                          {stat.color === 'yellow' && <stat.icon className={cn("w-3 h-3", isLightMode ? "text-yellow-600" : "text-yellow-400")} />}
                          {stat.color === 'purple' && <stat.icon className={cn("w-3 h-3", isLightMode ? "text-purple-600" : "text-purple-400")} />}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-[9px] font-medium mb-0 truncate",
                            isLightMode ? "text-gray-600" : "text-gray-400"
                          )}>
                            {stat.label}
                          </p>
                          <motion.p 
                            className={cn("text-sm font-bold", isLightMode ? "text-gray-900" : "text-white")}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: (stat.color === 'blue' ? 0.1 : stat.color === 'orange' ? 0.2 : stat.color === 'yellow' ? 0.3 : 0.4) + 0.2, type: 'spring', stiffness: 200 }}
                          >
                            {stat.value}
                          </motion.p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Boutons d'action à droite */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setActiveTab('favorites')}
                    className={cn(
                      "px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-2",
                      activeTab === 'favorites'
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/50"
                        : isLightMode
                          ? "bg-white border border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                          : "bg-[#1a1f3a] border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                    )}
                  >
                    <Star className={cn("w-4 h-4", activeTab === 'favorites' && "fill-current")} />
                    <span className="text-sm font-medium">{favoriteEmails.length}</span>
                  </Button>

                  <Button
                    onClick={() => setActiveTab('archives')}
                    className={cn(
                      "px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-2",
                      activeTab === 'archives'
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50"
                        : isLightMode
                          ? "bg-white border border-blue-200 text-blue-700 hover:bg-blue-50"
                          : "bg-[#1a1f3a] border border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                    )}
                  >
                    <Archive className="w-4 h-4" />
                    <span className="text-sm font-medium">{archivedEmails.length}</span>
                  </Button>
                </div>
              </div>
            </motion.section>

          {/* Overlay pour fermer sidebar mobile */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "fixed inset-0 z-30 lg:hidden",
                  isLightMode ? "bg-black/40" : "bg-black/80"
                )}
              />
            )}
          </AnimatePresence>

          {/* Main Area avec design innovant */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-9 w-full"
          >
            {activeTab === 'analytics' ? (
              <AnalyticsDashboard />
            ) : activeTab === 'pending' ? (
              <PendingRepliesPanel 
                pendingReplies={pendingReplies as any} 
                onRefresh={loadInitialData}
              />
            ) : (
              /* Zone principale emails - Beaucoup plus grande */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="h-full"
              >
              <Card className={cn(
                "h-full border shadow-xl backdrop-blur-xl transition-all duration-700",
                isLightMode
                  ? "border-blue-200/50 bg-white/70 shadow-blue-100/50"
                  : "border-blue-500/20 bg-[#1a1f3a]/70 shadow-blue-500/10"
              )}>
                <div className="flex flex-col h-[calc(100vh-16rem)]">
                  {/* Search Bar compact */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 border-b border-blue-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1 group">
                        <Search className={cn(
                          "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                          isLightMode 
                            ? "text-gray-500 group-hover:text-blue-600"
                            : "text-gray-400 group-hover:text-blue-400"
                        )} />
                        <Input
                          placeholder="Rechercher dans vos emails..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className={cn(
                            "pl-10 pr-4 h-10 border transition-all",
                            isLightMode
                              ? "border-blue-200/50 bg-blue-50/50 text-gray-900 placeholder:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                              : "border-blue-500/20 bg-[#0f1320] text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          )}
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Email List - Beaucoup plus grande */}
                  <ScrollArea className="flex-1">
                    <div className="p-3 space-y-2">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="relative"
                          >
                            <RefreshCw className={cn("w-8 h-8", isLightMode ? "text-blue-600" : "text-blue-400")} />
                            <motion.div
                              className={cn(
                                "absolute inset-0 rounded-full border-2",
                                isLightMode ? "border-blue-400/30" : "border-blue-400/20"
                              )}
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          </motion.div>
                        </div>
                      ) : filteredEmails.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center justify-center py-16 text-center"
                        >
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Mail className={cn("w-16 h-16 mb-4", isLightMode ? "text-gray-500" : "text-gray-600")} />
                          </motion.div>
                          <p className={cn("text-lg font-medium", isLightMode ? "text-gray-600" : "text-gray-400")}>Aucun email trouvé</p>
                          <p className="text-sm text-gray-500 mt-2">Essayez de modifier vos filtres</p>
                        </motion.div>
                      ) : (
                        <AnimatePresence mode="popLayout">
                          {filteredEmails.map((email, index) => (
                            <EmailCard
                              key={email.id}
                              email={email}
                              index={index}
                              isSelected={selectedEmail?.id === email.id}
                              onClick={() => {
                                setSelectedEmail(email);
                                openEmailDetail(email);
                              }}
                              getCategoryColor={getCategoryColor}
                              getSentimentIcon={getSentimentIcon}
                              onReply={(email) => {
                                setEmailToReply(email);
                                setReplyDialogOpen(true);
                              }}
                              isLightMode={isLightMode}
                            />
                          ))}
                        </AnimatePresence>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </Card>
            </motion.div>
            )}
          </motion.main>
          </div>
        </div>
      </main>

      {/* Fenêtres draggables pour emails */}
      <EmailDetailWindow
        email={selectedEmailForDetail}
        isOpen={emailDetailOpen}
        onClose={() => setEmailDetailOpen(false)}
        onGenerateReply={(email) => {
          openReplyGenerator(email);
        }}
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
      
      {/* Modal de configuration support unifiée */}
      <SupportConfigModal
        isOpen={isSupportConfigOpen}
        onClose={() => setIsSupportConfigOpen(false)}
        initialTab={supportConfigInitialTab}
        zIndex={windowZIndexes.supportConfig}
        onFocus={() => bringToFront('supportConfig')}
      />
      
      {/* Dialogue de réponse rapide */}
      {emailToReply && (
        <ReplyEmailDialog
          isOpen={replyDialogOpen}
          onClose={() => {
            setReplyDialogOpen(false);
            setEmailToReply(null);
          }}
          email={emailToReply}
          onReplySent={() => {
            loadInitialData(); // Recharger les emails pour mettre à jour le statut
          }}
          isLightMode={isLightMode}
        />
      )}

      {/* Dialog de confirmation de suppression de compte */}
      <AnimatePresence>
        {accountToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={() => !isDeletingAccount && setAccountToDelete(null)}
          >
            {/* Overlay */}
            <div className={cn(
              "absolute inset-0",
              isLightMode ? "bg-black/60" : "bg-black/80"
            )} />

            {/* Dialog */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "relative z-10 max-w-md w-full rounded-xl shadow-2xl border p-6 backdrop-blur-xl",
                isLightMode
                  ? "bg-white/95 border-red-200/50"
                  : "bg-[#1a1f3a]/95 border-red-500/30"
              )}
            >
              {/* Icône d'avertissement */}
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "p-3 rounded-full",
                  isLightMode ? "bg-red-100" : "bg-red-500/20"
                )}>
                  <AlertCircle className={cn("w-6 h-6", isLightMode ? "text-red-600" : "text-red-400")} />
                </div>
                <div>
                  <h3 className={cn("text-lg font-bold", isLightMode ? "text-gray-900" : "text-white")}>
                    Supprimer ce compte ?
                  </h3>
                  <p className={cn("text-sm", isLightMode ? "text-gray-600" : "text-gray-400")}>
                    Cette action est irréversible
                  </p>
                </div>
              </div>

              {/* Message */}
              <div className={cn(
                "p-3 rounded-lg mb-6",
                isLightMode ? "bg-red-50 border border-red-200" : "bg-red-500/10 border border-red-500/20"
              )}>
                <p className={cn("text-sm", isLightMode ? "text-gray-700" : "text-gray-300")}>
                  Êtes-vous sûr de vouloir supprimer le compte{' '}
                  <span className="font-semibold">{accountToDelete.email}</span> ?
                </p>
                <p className={cn("text-xs mt-2", isLightMode ? "text-gray-600" : "text-gray-400")}>
                  Tous les emails associés à ce compte seront également supprimés.
                </p>
              </div>

              {/* Boutons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setAccountToDelete(null)}
                  disabled={isDeletingAccount}
                  className={cn(
                    "flex-1 transition-all",
                    isLightMode
                      ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  )}
                >
                  Annuler
                </Button>
                <Button
                  onClick={confirmDeleteAccount}
                  disabled={isDeletingAccount}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white transition-all"
                >
                  {isDeletingAccount ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
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
  isLightMode = false
}: { 
  email: EmailCache;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  getCategoryColor: (cat: string | null) => string;
  getSentimentIcon: (sent: string | null, urg: number) => React.ReactNode;
  onReply?: (email: EmailCache) => void;
  isLightMode?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['2deg', '-2deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-2deg', '2deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const initials = email.from_name
    ?.split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() || email.from_email[0].toUpperCase();

  const timeAgo = getTimeAgo(new Date(email.received_at));

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ 
        delay: index * 0.03,
        type: 'spring',
        stiffness: 200,
        damping: 20
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      whileHover={{ 
        y: -6,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        transformStyle: 'preserve-3d',
      }}
      className={cn(
        'relative p-3 rounded-lg border cursor-pointer transition-all overflow-hidden group',
        isSelected 
          ? isLightMode
            ? 'border-blue-400/60 bg-blue-100 shadow-lg shadow-blue-200/50'
            : 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/20'
          : isLightMode
            ? 'border-blue-200/40 bg-white/60 hover:border-blue-300/60 hover:bg-blue-50'
            : 'border-blue-500/20 bg-[#0f1320] hover:border-blue-500/40 hover:bg-blue-500/5',
        !email.is_read && (isLightMode 
          ? 'font-semibold ring-1 ring-blue-400/40' 
          : 'font-semibold ring-1 ring-blue-500/30')
      )}
    >
      {/* Barre latérale pour emails non lus - plus fine */}
      {!email.is_read && (
        <motion.div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
            isLightMode
              ? "bg-gradient-to-b from-blue-500 to-cyan-500"
              : "bg-gradient-to-b from-blue-400 to-cyan-400"
          )}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5, delay: index * 0.02 }}
        />
      )}
      
      <div className="relative flex gap-3 z-10">
        {/* Avatar plus petit */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="relative"
        >
          <Avatar className={cn(
            "w-8 h-8 flex-shrink-0 border",
            isLightMode ? "border-blue-300/50" : "border-blue-500/30"
          )}>
            <AvatarFallback className={cn(
              "font-bold text-xs",
              isLightMode 
                ? "bg-blue-500/30 text-blue-700"
                : "bg-blue-500/20 text-blue-400"
            )}>
              {initials}
            </AvatarFallback>
          </Avatar>
          {!email.is_read && (
            <motion.div
              className={cn(
                "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border",
                isLightMode
                  ? "bg-blue-500 border-white"
                  : "bg-blue-400 border-[#1a1f3a]"
              )}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>

        {/* Contenu compact */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-semibold truncate transition-colors",
                isLightMode
                  ? "text-gray-900 group-hover:text-blue-600"
                  : "text-white group-hover:text-blue-400"
              )}>
                {email.from_name || email.from_email}
              </p>
            </div>
            <span className={cn(
              "text-xs whitespace-nowrap flex-shrink-0",
              isLightMode ? "text-gray-500" : "text-gray-500"
            )}>{timeAgo}</span>
          </div>

          <p className={cn(
            "text-xs font-medium mb-1 truncate",
            isLightMode ? "text-gray-600" : "text-gray-300"
          )}>
            {email.subject || '(sans objet)'}
          </p>
          
          {/* Badges et infos - Plus compact */}
          <div className="flex items-center justify-between gap-2 mt-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {email.support_category && (
                <Badge variant="outline" className={cn('text-xs h-5 px-1.5', getCategoryColor(email.support_category))}>
                  {getCategoryConfig(email.support_category)?.icon} {getCategoryConfig(email.support_category)?.label || email.support_category}
                </Badge>
              )}
              {email.is_auto_replied && (
                <Badge variant="outline" className="text-xs h-5 px-1.5 bg-blue-500/10 text-blue-400 border-blue-500/20">
                  <Bot className="w-3 h-3 mr-0.5" />
                  Auto
                </Badge>
              )}
              {email.replied_at && (
                <Badge variant="outline" className={cn(
                  "text-xs h-5 px-1.5",
                  isLightMode
                    ? "bg-blue-500/20 text-blue-700 border-blue-400/40"
                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                )}>
                  <Reply className="w-3 h-3 mr-0.5" />
                  Répondu
                </Badge>
              )}
              {email.requires_validation && (
                <Badge variant="outline" className="text-xs h-5 px-1.5 bg-orange-500/10 text-orange-400 border-orange-500/20">
                  <Clock className="w-3 h-3 mr-0.5" />
                  Val.
                </Badge>
              )}
              {getSentimentIcon(email.sentiment, email.urgency_score)}
            </div>
            
            {/* Bouton de réponse rapide */}
            {onReply && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onReply(email);
                }}
                className={cn(
                  "p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100",
                  isLightMode
                    ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-700"
                    : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400"
                )}
                title="Répondre"
              >
                <Reply className="w-3.5 h-3.5" />
              </motion.button>
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

