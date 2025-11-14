'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  FileDown, 
  FileUp, 
  History, 
  Bot,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TabAIConfigAdvanced } from '@/components/tabs/tab-ai-config-advanced';
import { toast } from 'sonner';

interface SupportConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'ai-config';
  zIndex?: number;
  onFocus?: () => void;
}

export function SupportConfigModal({ 
  isOpen, 
  onClose, 
  initialTab = 'ai-config',
  zIndex = 100,
  onFocus 
}: SupportConfigModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save toutes les 30s
  useEffect(() => {
    if (!autoSaveEnabled || !hasChanges || !isOpen) return;

    const interval = setInterval(() => {
      handleSaveDraft();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoSaveEnabled, hasChanges, isOpen]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // TODO: API call to save draft
      await new Promise(resolve => setTimeout(resolve, 500));
      setLastSaved(new Date());
      setHasChanges(false);
      toast.success('Brouillon sauvegardé', {
        description: new Date().toLocaleTimeString('fr-FR'),
      });
    } catch (error) {
      toast.error('Erreur de sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      // TODO: API call to publish config
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSaved(new Date());
      setHasChanges(false);
      toast.success('Configuration publiée avec succès');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la publication');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    // TODO: Export config as JSON
    const config = {}; // Get current config
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `support-config-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Configuration exportée');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const config = JSON.parse(text);
        // TODO: Validate and load config
        toast.success('Configuration importée');
        setHasChanges(true);
      } catch (error) {
        toast.error('Fichier invalide');
      }
    };
    input.click();
  };

  const tabs = [
    { id: 'ai-config', label: 'Configuration IA', icon: Bot },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        style={{ zIndex }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          onClick={(e) => {
            e.stopPropagation();
            onFocus?.();
          }}
          className="relative w-full max-w-[1200px] max-h-[92vh] bg-gradient-to-br from-white/95 via-violet-50/40 to-purple-50/30 dark:from-[#1a1f3a]/95 dark:via-[#0f1629] dark:to-[#1a1f3a] border border-violet-200/40 dark:border-violet-500/20 rounded-3xl shadow-2xl shadow-violet-500/10 overflow-hidden backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="relative border-b border-violet-200/40 dark:border-violet-500/20 bg-white/90 dark:bg-[#1a1f3a]/90 backdrop-blur-xl">
            {/* Effet de brillance glassmorphism */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
            
            <div className="relative flex items-center justify-between p-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 shadow-lg shadow-violet-500/20">
                    <Bot className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 dark:from-violet-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                      Configuration IA Avancée
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      Contrôle total de l'intelligence artificielle de votre support
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Auto-save indicator */}
                {lastSaved && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50/80 dark:bg-green-500/10 border border-green-200/50 dark:border-green-500/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                      Sauvegardé à {lastSaved.toLocaleTimeString('fr-FR')}
                    </span>
                  </motion.div>
                )}

                {/* Export/Import */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="border-violet-300/50 dark:border-violet-500/30 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:border-violet-400/60 transition-all"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Exporter
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImport}
                  className="border-violet-300/50 dark:border-violet-500/30 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:border-violet-400/60 transition-all"
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  Importer
                </Button>

                {/* Close */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 transition-all rounded-xl"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Tabs Navigation - Hidden when only one tab */}
            {tabs.length > 1 && (
              <div className="flex gap-2 px-6 pb-4">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg',
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-violet-500/30'
                        : 'bg-white/60 dark:bg-slate-800/60 text-gray-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 border border-violet-200/30 dark:border-violet-500/20'
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Content Area - Full height for integrated scrolling */}
          <div className="h-[calc(92vh-240px)] bg-gradient-to-b from-transparent via-violet-50/20 to-transparent dark:via-violet-900/10">
            <AnimatePresence mode="wait">
              {activeTab === 'ai-config' && (
                <motion.div
                  key="ai-config"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <TabAIConfigAdvanced />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-violet-200/40 dark:border-violet-500/20 bg-white/90 dark:bg-[#1a1f3a]/90 backdrop-blur-xl p-6">
            {/* Effet de brillance */}
            <div className="absolute inset-0 bg-gradient-to-t from-violet-500/5 to-transparent pointer-events-none" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                {hasChanges && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50/80 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20"
                  >
                    <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                      Modifications non sauvegardées
                    </span>
                  </motion.div>
                )}

                <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-50/50 dark:bg-violet-500/10 border border-violet-200/30 dark:border-violet-500/20 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-violet-100/50 dark:hover:bg-violet-500/20 transition-all">
                  <input
                    type="checkbox"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    className="rounded border-violet-300 text-violet-600 focus:ring-violet-500"
                  />
                  <Clock className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  <span className="font-medium">Auto-save (30s)</span>
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSaving}
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Annuler
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSaving || !hasChanges}
                  className="border-violet-300 dark:border-violet-500/50 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:border-violet-400 transition-all"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder en brouillon
                </Button>

                <Button
                  onClick={handlePublish}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all"
                >
                  {isSaving ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Publication...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Publier
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
