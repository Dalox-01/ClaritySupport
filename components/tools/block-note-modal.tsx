'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DraggableWindow } from '@/components/draggable-window';

interface BlockNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  onFocus?: () => void;
}

export function BlockNoteModal({ isOpen, onClose, zIndex = 40, onFocus }: BlockNoteModalProps) {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Charger le contenu sauvegardé au montage
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('mail-center-notes');
      if (saved) {
        setContent(saved);
      }
    }
  }, [isOpen]);

  // Sauvegarde automatique toutes les 2 secondes
  useEffect(() => {
    if (!content) return;
    
    const timer = setTimeout(() => {
      localStorage.setItem('mail-center-notes', content);
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 1000);
    }, 2000);

    return () => clearTimeout(timer);
  }, [content]);

  const handleManualSave = () => {
    localStorage.setItem('mail-center-notes', content);
    toast.success('Notes sauvegardées !');
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <DraggableWindow
      title="Bloc-notes"
      isOpen={isOpen}
      onClose={onClose}
      width="900px"
      height="700px"
      zIndex={zIndex}
      onFocus={onFocus}
    >
      <div className="h-full flex flex-col bg-gradient-to-br from-[#1a1f3a] to-[#0f1320]">
        {/* Header info */}
        <div className="p-4 border-b border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-2 bg-blue-500/20 rounded-lg"
              >
                <FileText className="w-5 h-5 text-blue-400" />
              </motion.div>
              <div>
                <p className="text-xs text-gray-400">
                  {isSaving ? (
                    <span className="flex items-center gap-1">
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        💾
                      </motion.span>
                      Sauvegarde automatique...
                    </span>
                  ) : (
                    'Sauvegarde automatique activée'
                  )}
                </p>
              </div>
            </div>
            <Button
              onClick={handleManualSave}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 p-6 overflow-hidden">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Écrivez vos notes ici... ✍️"
            className="w-full h-full bg-[#0f1320] border border-blue-500/20 rounded-xl p-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none font-mono text-sm leading-relaxed"
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-blue-500/20 bg-blue-500/5 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {content.length} caractères • {content.split('\n').length} lignes
          </p>
          <p className="text-xs text-gray-500">
            Dernière sauvegarde : {new Date().toLocaleTimeString('fr-FR')}
          </p>
        </div>
      </div>
    </DraggableWindow>
  );
}
