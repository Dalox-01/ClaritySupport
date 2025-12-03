'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  ArrowLeft,
  User,
  Mail,
  CreditCard,
  AlertTriangle,
  Save,
  Check,
  X,
  Shield,
  Key,
  Calendar,
  Eye,
  EyeOff,
  Copy,
  Gift,
  Users,
  Share2,
  Link2,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  Crown,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UserData {
  id: string;
  email: string;
  name: string;
  plan: string;
  stripe_customer_id: string | null;
  bonus_credits?: number;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface AffiliateCode {
  id: string;
  code: string;
  referral_link: string;
  total_referrals: number;
  total_bonus_earned: number;
  is_active: boolean;
  created_at: string;
}

interface Referral {
  id: string;
  plan_subscribed: string;
  bonus_awarded: number;
  status: 'pending' | 'completed' | 'canceled';
  subscription_date: string | null;
  created_at: string;
  referred_user: {
    name: string;
    email: string;
  };
}

interface BonusTransaction {
  id: string;
  bonus_type: string;
  amount: number;
  description: string;
  created_at: string;
}

interface AffiliateStats {
  totalReferrals: number;
  totalBonusEarned: number;
  currentBonusCredits: number;
  pendingReferrals: number;
  completedReferrals: number;
}

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  
  const [name, setName] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // États pour l'affiliation
  const [affiliateCode, setAffiliateCode] = useState<AffiliateCode | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [bonusHistory, setBonusHistory] = useState<BonusTransaction[]>([]);
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats | null>(null);
  const [canGenerateCode, setCanGenerateCode] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [affiliateConfig, setAffiliateConfig] = useState({
    referrerBonus: 1500,
    referredBonus: 500,
    eligiblePlans: ['pro', 'scale'],
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      loadAllData();
    }
  }, [status, router]);

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadUserData(),
      loadSubscription(),
      loadAffiliateData(),
    ]);
    setIsLoading(false);
  };

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setName(data.user.name || '');
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      toast.error('Erreur lors du chargement du profil');
    }
  };

  const loadSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/current');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Erreur chargement abonnement:', error);
    }
  };

  const loadAffiliateData = async () => {
    try {
      const response = await fetch('/api/affiliate');
      if (response.ok) {
        const data = await response.json();
        setAffiliateCode(data.affiliateCode);
        setReferrals(data.referrals || []);
        setBonusHistory(data.bonusHistory || []);
        setAffiliateStats(data.stats);
        setCanGenerateCode(data.canGenerateCode);
        if (data.config) setAffiliateConfig(data.config);
      }
    } catch (error) {
      console.error('Erreur chargement affiliation:', error);
    }
  };

  const generateAffiliateCode = async () => {
    setIsGeneratingCode(true);
    try {
      const response = await fetch('/api/affiliate', { method: 'POST' });
      const data = await response.json();
      if (response.ok && data.success) {
        setAffiliateCode(data.affiliateCode);
        toast.success('🎉 Code d\'affiliation créé avec succès !');
      } else {
        toast.error(data.message || data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      toast.error('Erreur lors de la création du code');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const shareReferralLink = async () => {
    if (!affiliateCode) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoignez ClaritySupport !',
          text: `Utilisez mon code ${affiliateCode.code} pour obtenir 500 générations bonus !`,
          url: affiliateCode.referral_link,
        });
      } catch {
        copyToClipboard(affiliateCode.referral_link, 'Lien de parrainage');
      }
    } else {
      copyToClipboard(affiliateCode.referral_link, 'Lien de parrainage');
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setHasChanges(false);
        toast.success('Profil mis à jour avec succès');
        await update({ name });
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const response = await fetch('/api/stripe/cancel-subscription', { method: 'POST' });
      if (response.ok) {
        toast.success('Abonnement résilié. Il restera actif jusqu\'à la fin de la période.');
        setShowCancelConfirm(false);
        loadSubscription();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de la résiliation');
      }
    } catch (error) {
      toast.error('Erreur lors de la résiliation');
    } finally {
      setIsCanceling(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié !`);
  };

  const maskSensitiveData = (data: string) => {
    if (showSensitiveData) return data;
    return data.replace(/./g, '•');
  };

  const openCustomerPortal = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal-session', { method: 'POST' });
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        toast.error('Erreur lors de l\'ouverture du portail');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ouverture du portail');
    }
  };

  const getPlanBadge = (plan: string) => {
    const normalizedPlan = plan.toLowerCase();
    const badges: Record<string, { color: string; icon: any }> = {
      starter: { color: 'bg-green-500', icon: Zap },
      pro: { color: 'bg-blue-500', icon: Crown },
      scale: { color: 'bg-purple-500', icon: Star },
    };
    const badge = badges[normalizedPlan] || badges.starter;
    const Icon = badge.icon;
    return (
      <Badge className={`${badge.color} text-white gap-1`}>
        <Icon className="w-3 h-3" />
        {plan}
      </Badge>
    );
  };

  useEffect(() => {
    if (userData && name !== userData.name) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [name, userData]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/mail-center')} className="mb-6 text-slate-400 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au Mail Center
          </Button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-white">Paramètres du compte</h1>
              <p className="text-slate-400">Gérez votre profil, abonnement et programme d'affiliation</p>
            </div>
            <div className="flex items-center gap-3">
              {getPlanBadge(userData.plan)}
              {affiliateStats && affiliateStats.currentBonusCredits > 0 && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white gap-1">
                  <Gift className="w-3 h-3" />
                  {affiliateStats.currentBonusCredits} bonus
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />Profil
            </TabsTrigger>
            <TabsTrigger value="subscription" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <CreditCard className="w-4 h-4 mr-2" />Abonnement
            </TabsTrigger>
            <TabsTrigger value="affiliate" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Gift className="w-4 h-4 mr-2" />Affiliation
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />Sécurité
            </TabsTrigger>
          </TabsList>

          {/* Tab Profil */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/50 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2"><User className="h-5 w-5 text-blue-500" /></div>
                <h2 className="text-xl font-bold text-white">Informations personnelles</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="name" className="text-slate-300">Nom d'affichage</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" className="mt-1.5 border-slate-700 bg-slate-800/50 text-white" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-slate-300">Email</Label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Input id="email" value={userData.email} disabled className="border-slate-700 bg-slate-800/30 text-slate-400" />
                    <Shield className="h-5 w-5 text-green-500 flex-shrink-0" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">L'email ne peut pas être modifié</p>
                </div>
                <div>
                  <Label className="text-slate-400">Compte créé le</Label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/30 p-3">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-300">{new Date(userData.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-slate-400">ID Utilisateur</Label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 rounded-lg border border-slate-700 bg-slate-800/30 p-3">
                      <code className="text-xs text-slate-300 font-mono">{maskSensitiveData(userData.id)}</code>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(userData.id, 'ID')} className="border-slate-700 hover:bg-slate-800"><Copy className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
              {hasChanges && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                  <Button onClick={handleSave} disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700">
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</> : <><Save className="mr-2 h-4 w-4" />Enregistrer</>}
                  </Button>
                </motion.div>
              )}
            </Card>
          </TabsContent>

          {/* Tab Abonnement */}
          <TabsContent value="subscription" className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/50 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-2"><CreditCard className="h-5 w-5 text-green-500" /></div>
                <h2 className="text-xl font-bold text-white">Votre abonnement</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4">
                  <div className="text-sm text-slate-400 mb-1">Plan actuel</div>
                  {getPlanBadge(userData.plan)}
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4">
                  <div className="text-sm text-slate-400 mb-1">Statut</div>
                  <div className={`text-lg font-semibold ${subscription?.cancel_at_period_end ? 'text-yellow-400' : 'text-green-400'}`}>
                    {subscription?.cancel_at_period_end ? '⏳ Fin de période' : '✓ Actif'}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4">
                  <div className="text-sm text-slate-400 mb-1">{subscription?.cancel_at_period_end ? 'Prend fin le' : 'Renouvellement'}</div>
                  <div className="text-lg font-semibold text-white">{subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('fr-FR') : 'N/A'}</div>
                </div>
              </div>
              {subscription?.cancel_at_period_end && (
                <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-400">Abonnement en cours de résiliation</p>
                      <p className="text-sm text-yellow-300">Actif jusqu'au {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}.</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-6 flex gap-3 flex-wrap">
                <Button onClick={openCustomerPortal} variant="outline" className="border-slate-700 hover:bg-slate-800"><CreditCard className="mr-2 h-4 w-4" />Gérer le paiement</Button>
                {!subscription?.cancel_at_period_end && <Button onClick={() => setShowCancelConfirm(true)} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10"><X className="mr-2 h-4 w-4" />Résilier</Button>}
              </div>
            </Card>
            {affiliateStats && (
              <Card className="border-slate-800 bg-slate-900/50 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2"><Gift className="h-5 w-5 text-amber-500" /></div>
                  <h3 className="text-lg font-semibold text-white">Crédits bonus</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-amber-400">{affiliateStats.currentBonusCredits}</div>
                  <div className="text-slate-400">générations bonus disponibles</div>
                </div>
                <p className="mt-2 text-sm text-slate-500">Les crédits bonus sont utilisés en priorité.</p>
              </Card>
            )}
          </TabsContent>

          {/* Tab Affiliation */}
          <TabsContent value="affiliate" className="space-y-6">
            {/* Hero Affiliation */}
            <Card className="border-slate-800 bg-gradient-to-br from-blue-900/20 via-slate-900/50 to-purple-900/20 p-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-3"><Gift className="h-6 w-6 text-blue-400" /></div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Programme d'affiliation</h2>
                    <p className="text-slate-400">Gagnez des crédits en parrainant vos contacts</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3 mt-6">
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-1">{affiliateConfig.referrerBonus}</div>
                    <div className="text-sm text-slate-400">générations pour vous</div>
                    <div className="text-xs text-slate-500 mt-1">par parrainage réussi</div>
                  </div>
                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-1">{affiliateConfig.referredBonus}</div>
                    <div className="text-sm text-slate-400">pour votre filleul</div>
                    <div className="text-xs text-slate-500 mt-1">bonus de bienvenue</div>
                  </div>
                  <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-center">
                    <div className="text-3xl font-bold text-green-400 mb-1">∞</div>
                    <div className="text-sm text-slate-400">parrainages illimités</div>
                    <div className="text-xs text-slate-500 mt-1">aucune limite</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Code d'affiliation */}
            <Card className="border-slate-800 bg-slate-900/50 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2"><Link2 className="h-5 w-5 text-indigo-500" /></div>
                <h3 className="text-xl font-bold text-white">Votre code d'affiliation</h3>
              </div>

              {!canGenerateCode && !affiliateCode ? (
                <div className="text-center py-8 rounded-xl border border-slate-700 bg-slate-800/30">
                  <Crown className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-white mb-2">Plan Pro ou Scale requis</h4>
                  <p className="text-slate-400 mb-4 max-w-md mx-auto">Le programme d'affiliation est disponible pour les plans Pro et Scale.</p>
                  <Button onClick={() => router.push('/pricing')} className="bg-gradient-to-r from-blue-600 to-indigo-600"><Zap className="mr-2 h-4 w-4" />Voir les plans</Button>
                </div>
              ) : affiliateCode ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-400 mb-2 block">Votre code unique</Label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 rounded-xl border-2 border-dashed border-blue-500/30 bg-blue-500/5 p-4 text-center">
                        <code className="text-2xl font-bold text-blue-400 tracking-wider">{affiliateCode.code}</code>
                      </div>
                      <Button onClick={() => copyToClipboard(affiliateCode.code, 'Code')} variant="outline" size="icon" className="border-slate-700 hover:bg-slate-800 h-14 w-14"><Copy className="h-5 w-5" /></Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-400 mb-2 block">Lien de parrainage</Label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 p-3 overflow-hidden">
                        <code className="text-sm text-slate-300 truncate block">{affiliateCode.referral_link}</code>
                      </div>
                      <Button onClick={() => copyToClipboard(affiliateCode.referral_link, 'Lien')} variant="outline" className="border-slate-700"><Copy className="h-4 w-4 mr-2" />Copier</Button>
                      <Button onClick={shareReferralLink} className="bg-blue-600 hover:bg-blue-700"><Share2 className="h-4 w-4 mr-2" />Partager</Button>
                    </div>
                  </div>
                  {affiliateStats && (
                    <div className="grid gap-4 md:grid-cols-4 mt-6">
                      <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4 text-center">
                        <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{affiliateStats.totalReferrals}</div>
                        <div className="text-xs text-slate-400">Parrainages totaux</div>
                      </div>
                      <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4 text-center">
                        <Clock className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{affiliateStats.pendingReferrals}</div>
                        <div className="text-xs text-slate-400">En attente</div>
                      </div>
                      <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4 text-center">
                        <CheckCircle2 className="h-6 w-6 text-green-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{affiliateStats.completedReferrals}</div>
                        <div className="text-xs text-slate-400">Complétés</div>
                      </div>
                      <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4 text-center">
                        <Sparkles className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{affiliateStats.totalBonusEarned}</div>
                        <div className="text-xs text-slate-400">Bonus gagnés</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="rounded-full bg-blue-500/10 p-4 w-fit mx-auto mb-4"><Link2 className="h-8 w-8 text-blue-400" /></div>
                  <h4 className="text-lg font-semibold text-white mb-2">Générez votre code d'affiliation</h4>
                  <p className="text-slate-400 mb-4 max-w-md mx-auto">Créez votre code unique et gagnez des crédits bonus pour chaque parrainage.</p>
                  <Button onClick={generateAffiliateCode} disabled={isGeneratingCode} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    {isGeneratingCode ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Génération...</> : <><Sparkles className="mr-2 h-4 w-4" />Générer mon code</>}
                  </Button>
                </div>
              )}
            </Card>

            {/* Historique des parrainages */}
            {referrals.length > 0 && (
              <Card className="border-slate-800 bg-slate-900/50 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-2"><Users className="h-5 w-5 text-green-500" /></div>
                  <h3 className="text-lg font-semibold text-white">Vos parrainages</h3>
                </div>
                <div className="space-y-3">
                  {referrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-700 bg-slate-800/30">
                      <div className="flex items-center gap-3">
                        <div className={cn("rounded-full p-2", referral.status === 'completed' ? 'bg-green-500/10' : referral.status === 'pending' ? 'bg-yellow-500/10' : 'bg-red-500/10')}>
                          {referral.status === 'completed' ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : referral.status === 'pending' ? <Clock className="h-4 w-4 text-yellow-400" /> : <XCircle className="h-4 w-4 text-red-400" />}
                        </div>
                        <div>
                          <div className="font-medium text-white">{referral.referred_user?.name || 'Utilisateur'}</div>
                          <div className="text-xs text-slate-400">{referral.referred_user?.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={cn(referral.status === 'completed' ? 'bg-green-500/20 text-green-400' : referral.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400')}>
                          {referral.status === 'completed' ? 'Validé' : referral.status === 'pending' ? 'En attente' : 'Annulé'}
                        </Badge>
                        {referral.bonus_awarded > 0 && <div className="text-sm text-amber-400 mt-1">+{referral.bonus_awarded}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Historique des bonus */}
            {bonusHistory.length > 0 && (
              <Card className="border-slate-800 bg-slate-900/50 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2"><TrendingUp className="h-5 w-5 text-amber-500" /></div>
                  <h3 className="text-lg font-semibold text-white">Historique des bonus</h3>
                </div>
                <div className="space-y-2">
                  {bonusHistory.map((bonus) => (
                    <div key={bonus.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-700/50 bg-slate-800/20">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-amber-500/10 p-2">{bonus.bonus_type === 'referral_reward' ? <Gift className="h-4 w-4 text-amber-400" /> : <Sparkles className="h-4 w-4 text-purple-400" />}</div>
                        <div>
                          <div className="text-sm font-medium text-white">{bonus.description}</div>
                          <div className="text-xs text-slate-500">{new Date(bonus.created_at).toLocaleDateString('fr-FR')}</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-400">+{bonus.amount}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Tab Sécurité */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/50 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-500/10 p-2"><Key className="h-5 w-5 text-purple-500" /></div>
                  <h2 className="text-xl font-bold text-white">Informations sensibles</h2>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowSensitiveData(!showSensitiveData)} className="border-slate-700 hover:bg-slate-800">
                  {showSensitiveData ? <><EyeOff className="mr-2 h-4 w-4" />Masquer</> : <><Eye className="mr-2 h-4 w-4" />Afficher</>}
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {userData.stripe_customer_id && (
                  <div>
                    <Label className="text-slate-400">ID Client Stripe</Label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 rounded-lg border border-slate-700 bg-slate-800/30 p-3"><code className="text-xs text-slate-300 font-mono">{maskSensitiveData(userData.stripe_customer_id)}</code></div>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(userData.stripe_customer_id!, 'ID Stripe')} className="border-slate-700 hover:bg-slate-800"><Copy className="h-4 w-4" /></Button>
                    </div>
                  </div>
                )}
                {subscription?.stripe_subscription_id && (
                  <div>
                    <Label className="text-slate-400">ID Abonnement</Label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 rounded-lg border border-slate-700 bg-slate-800/30 p-3"><code className="text-xs text-slate-300 font-mono">{maskSensitiveData(subscription.stripe_subscription_id)}</code></div>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(subscription.stripe_subscription_id, 'ID Abo')} className="border-slate-700 hover:bg-slate-800"><Copy className="h-4 w-4" /></Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
            <Card className="border-red-500/30 bg-red-500/5 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-red-500/10 p-2"><AlertTriangle className="h-5 w-5 text-red-500" /></div>
                <h2 className="text-xl font-bold text-white">Zone dangereuse</h2>
              </div>
              <p className="text-sm text-slate-400 mb-4">Actions irréversibles.</p>
              <Button variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => { if (confirm('Supprimer votre compte ?')) toast.error('Fonctionnalité à venir'); }}>
                <AlertTriangle className="mr-2 h-4 w-4" />Supprimer mon compte
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal annulation */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-red-500/10 p-2"><AlertTriangle className="h-6 w-6 text-red-500" /></div>
                <h3 className="text-xl font-bold text-white">Résilier l'abonnement ?</h3>
              </div>
              <p className="mb-6 text-slate-400">Accès conservé jusqu'au {subscription && new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}.</p>
              <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4"><p className="text-sm text-yellow-400">⚠️ Passage au plan GRATUIT ensuite.</p></div>
              <div className="flex gap-3">
                <Button onClick={() => setShowCancelConfirm(false)} variant="outline" className="flex-1 border-slate-700" disabled={isCanceling}>Annuler</Button>
                <Button onClick={handleCancelSubscription} disabled={isCanceling} className="flex-1 bg-red-600 hover:bg-red-700">
                  {isCanceling ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />...</> : <><Check className="mr-2 h-4 w-4" />Confirmer</>}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
