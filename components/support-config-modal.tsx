'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabAIConfigAdvanced, AIConfigSectionId } from '@/components/tabs/tab-ai-config-advanced';

interface SupportConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'ai-config' | 'filters';
  initialSection?: AIConfigSectionId;
  userPlan?: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  zIndex?: number;
  onFocus?: () => void;
}

export function SupportConfigModal({ 
  isOpen, 
  onClose, 
  initialTab = 'ai-config',
  initialSection = 'models',
  zIndex = 100,
  onFocus,
  userPlan = 'PRO'
}: SupportConfigModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2"
        style={{ zIndex }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            onFocus?.();
          }}
          className="relative w-full max-w-[98vw] h-[98vh] bg-white dark:bg-[#1a1f3a] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header minimal - Fixe */}
          <div className="flex-none border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-[#1a1f3a] dark:to-[#0f1629]">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-600/20">
                  <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    Configuration IA
                  </h2>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content Area - Maximum d'espace */}
          <div className="flex-1 overflow-hidden">
            <TabAIConfigAdvanced userPlan={userPlan} initialSection={initialSection} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
