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
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        style={{ zIndex }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => {
            e.stopPropagation();
            onFocus?.();
          }}
          className="relative w-full max-w-[1100px] max-h-[90vh] bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-[#1a1f3a] dark:via-[#0f1629] dark:to-[#1a1f3a] border border-blue-200/50 dark:border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative border-b border-blue-200/50 dark:border-blue-500/20 bg-white/80 dark:bg-[#1a1f3a]/80 backdrop-blur-xl">
            <div className="flex items-center justify-between p-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Configuration IA Avancée
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Contrôle total de l'intelligence artificielle de votre support
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Auto-save indicator */}
                {lastSaved && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    Sauvegardé à {lastSaved.toLocaleTimeString('fr-FR')}
                  </div>
                )}

                {/* Export/Import */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="border-blue-300 dark:border-blue-500/30"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Exporter
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImport}
                  className="border-blue-300 dark:border-blue-500/30"
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  Importer
                </Button>

                {/* Close */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Tabs Navigation - Hidden when only one tab */}
            {tabs.length > 1 && (
              <div className="flex gap-1 px-6 pb-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-500/10'
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <AnimatePresence mode="wait">
              {activeTab === 'ai-config' && (
                <motion.div
                  key="ai-config"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full"
                >
                  <TabAIConfigAdvanced />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-blue-200/50 dark:border-blue-500/20 bg-white/80 dark:bg-[#1a1f3a]/80 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {hasChanges && (
                  <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                    <AlertCircle className="w-4 h-4" />
                    Modifications non sauvegardées
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    className="rounded"
                  />
                  Auto-save (30s)
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  Annuler
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSaving || !hasChanges}
                  className="border-blue-400 dark:border-blue-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder en brouillon
                </Button>

                <Button
                  onClick={handlePublish}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
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
