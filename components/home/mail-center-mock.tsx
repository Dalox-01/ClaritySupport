'use client';

import { 
  Mail, Inbox, Clock, BarChart3, Search, 
  RefreshCw, Filter, MoreVertical, Star, 
  Archive, Trash2, Reply, ChevronLeft, ChevronRight,
  Users, Zap, Settings, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MailCenterMock() {
  return (
    <div className="flex h-full w-full flex-col bg-slate-50 dark:bg-[#0f1320] text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1f3a] px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
            <Mail className="h-5 w-5" />
            <span>Clarity Mail Center</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
            <Zap className="h-3 w-3 text-green-500" />
            <span>IA Active</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px]">
            <div className="h-full w-full rounded-full bg-white dark:bg-slate-900 p-0.5">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="h-full w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1f3a]/50 p-4 md:flex">
          <div className="mb-6 space-y-1">
            <div className="flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Navigation
            </div>
            <div className="flex cursor-pointer items-center gap-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400">
              <Inbox className="h-4 w-4" />
              <span>Inbox</span>
              <span className="ml-auto rounded-full bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 text-xs">12</span>
            </div>
            <div className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <Clock className="h-4 w-4" />
              <span>En attente</span>
              <span className="ml-auto text-xs">4</span>
            </div>
            <div className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <BarChart3 className="h-4 w-4" />
              <span>Statistiques</span>
            </div>
          </div>

          <div className="mb-6 space-y-1">
            <div className="flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Filtres
            </div>
            <div className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span>Urgent</span>
            </div>
            <div className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <span>Commandes</span>
            </div>
            <div className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Résolu</span>
            </div>
          </div>

          <div className="mt-auto rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-white">
            <div className="mb-2 text-xs font-medium opacity-80">Quota mensuel</div>
            <div className="mb-1 flex items-end gap-1">
              <span className="text-2xl font-bold">842</span>
              <span className="mb-1 text-sm opacity-80">/ 1000</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/20">
              <div className="h-full w-[84%] rounded-full bg-white" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden bg-slate-50 dark:bg-[#0f1320]">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1f3a]/30 px-6 py-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 pl-9 pr-4 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                <Filter className="h-4 w-4" />
              </button>
              <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              {/* Email Item 1 */}
              <div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#1a1f3a] p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/30">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm">
                    JD
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white truncate">Jean Dupont</h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Il y a 2 min</span>
                    </div>
                    <h5 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">Problème de livraison commande #4829</h5>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      Bonjour, je n'ai toujours pas reçu ma commande effectuée la semaine dernière. Le suivi indique...
                    </p>
                    
                    {/* AI Suggestion */}
                    <div className="mt-3 flex items-center gap-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 p-2 border border-blue-100 dark:border-blue-500/20">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                        <Zap className="h-3 w-3" />
                      </div>
                      <div className="flex-1 text-xs text-blue-700 dark:text-blue-300 truncate">
                        Suggestion : Remboursement des frais de port + Code promo 10%
                      </div>
                      <button className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700">
                        Appliquer
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Item 2 */}
              <div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#1a1f3a] p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/30 opacity-80">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                    SL
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white truncate">Sophie Laurent</h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Il y a 15 min</span>
                    </div>
                    <h5 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">Question sur le produit X</h5>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      Est-ce que ce modèle est compatible avec la version précédente ? J'aimerais savoir si...
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Item 3 */}
              <div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#1a1f3a] p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/30 opacity-70">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                    MK
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white truncate">Marc Klein</h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Il y a 1h</span>
                    </div>
                    <h5 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">Retour produit défectueux</h5>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      Le produit est arrivé cassé. Voici les photos en pièce jointe. Merci de me dire comment procéder...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
