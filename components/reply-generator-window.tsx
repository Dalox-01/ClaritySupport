'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  RefreshCw,
  Wand2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DraggableWindow } from './draggable-window';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import type { EmailCache } from '@/lib/mail-center-types';
import { toast } from 'sonner';

interface ReplyGeneratorWindowProps {
  email: EmailCache | null;
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  onFocus?: () => void;
}

export function ReplyGeneratorWindow({
  email,
  isOpen,
  onClose,
  zIndex = 60,
  onFocus,
}: ReplyGeneratorWindowProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [replySubject, setReplySubject] = useState('');

  useEffect(() => {
    if (email && isOpen) {
      setReplySubject(`Re: ${email.subject || 'Sans objet'}`);
      // Auto-generate on open
      generateReply();
    }
  }, [email, isOpen]);

  const generateReply = async () => {
    if (!email) return;

    setIsGenerating(true);
    try {
      // Vérifier le quota avant de générer
      const quotaCheck = await fetch('/api/usage');
      if (quotaCheck.ok) {
        const result = await quotaCheck.json();
        const quotaData = result.data || result;
        
        if (quotaData.percentage >= 100) {
          toast.error('Quota atteint ! Veuillez passer au plan supérieur.');
          setIsGenerating(false);
          return;
        }
      }

      // Construire le contexte pour la génération
      const contextText = `Email reçu de ${email.from_name || email.from_email}:
Objet: ${email.subject || 'Sans objet'}
Catégorie: ${email.category || 'Non catégorisé'}

Contenu de l&apos;email:
${email.body_text || email.body_html?.replace(/<[^>]*>/g, '') || 'Pas de contenu'}

Génère une réponse professionnelle et pertinente à cet email.`;

      // Utiliser la vraie API de génération
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'reponse',
          tone: 'pro',
          style: 'formel',
          language: 'fr',
          length: 'moyen',
          context: contextText,
          attachments: false,
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        console.error('API Error:', data);
        
        // Gérer le quota dépassé
        if (data.quotaExceeded) {
          toast.error(data.message || 'Limite de génération atteinte');
          setIsGenerating(false);
          return;
        }
        
        throw new Error(data.message || 'Erreur lors de la génération');
      }

      if (data.success && data.data) {
        // Extraire le texte généré
        const generatedText = data.data.text || data.data.html?.replace(/<[^>]*>/g, '') || '';
        setReplyBody(generatedText);
        
        toast.success('✨ Réponse générée avec succès !');
      } else {
        throw new Error('Réponse invalide de l&apos;API');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la génération de la réponse');
    } finally {
      setIsGenerating(false);
    }
  };

  const sendReply = async () => {
    if (!email || !replyBody.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/mail-center/send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailId: email.id,
          toEmail: email.from_email, // Email de l'expéditeur original
          subject: replySubject,
          body: replyBody,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error sending reply:', errorData);
        throw new Error(errorData.error || 'Erreur envoi');
      }

      toast.success('✅ Réponse envoyée avec succès !');
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l&apos;envoi de la réponse');
    } finally {
      setIsSending(false);
    }
  };

  if (!email) return null;

  return (
    <DraggableWindow
      title="Générer une réponse"
      isOpen={isOpen}
      onClose={onClose}
      width="700px"
      height="600px"
      zIndex={zIndex}
      onFocus={onFocus}
    >
      <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-[#0f1320] dark:to-[#1a1f3a]">
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-4">
            {/* Header avec animation */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20"
            >
              <motion.div
                animate={{ rotate: isGenerating ? 360 : 0 }}
                transition={{ duration: 2, repeat: isGenerating ? Infinity : 0, ease: "linear" }}
              >
                <Wand2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {isGenerating ? 'Génération en cours...' : 'Réponse générée par IA'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Vous pouvez modifier la réponse avant de l&apos;envoyer
                </p>
              </div>
              {!isGenerating && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </motion.div>
              )}
            </motion.div>

            {/* Sujet */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Objet
              </Label>
              <input
                type="text"
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                className={cn(
                  "w-full px-4 py-2 rounded-lg border transition-all",
                  "bg-white dark:bg-[#0f1320]",
                  "border-gray-200 dark:border-blue-500/20",
                  "text-gray-900 dark:text-white",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  "placeholder:text-gray-400"
                )}
                placeholder="Objet de la réponse"
              />
            </div>

            {/* Corps du message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message
                </Label>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateReply}
                  disabled={isGenerating}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <RefreshCw className={cn("w-3 h-3", isGenerating && "animate-spin")} />
                  Regénérer
                </motion.button>
              </div>
              
              <div className="relative">
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-white/50 dark:bg-[#0f1320]/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10"
                  >
                    <div className="text-center space-y-2">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Génération de la réponse...
                      </p>
                    </div>
                  </motion.div>
                )}
                
                <Textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={12}
                  className={cn(
                    "w-full resize-none",
                    "bg-white dark:bg-[#0f1320]",
                    "border-gray-200 dark:border-blue-500/20",
                    "text-gray-900 dark:text-white",
                    "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                    "placeholder:text-gray-400"
                  )}
                  placeholder="La réponse générée apparaîtra ici..."
                />
              </div>
            </div>

            {/* Info tip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20"
            >
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                La réponse a été générée en analysant le contexte de l&apos;email et votre historique de réponses.
                N&apos;hésitez pas à la personnaliser avant l&apos;envoi.
              </p>
            </motion.div>
          </div>
        </ScrollArea>

        {/* Actions Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-blue-500/20 bg-gray-50 dark:bg-[#1a1f3a]">
          <div className="flex items-center justify-end gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSending}
              >
                Annuler
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={sendReply}
                disabled={isSending || !replyBody.trim()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer la réponse
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </DraggableWindow>
  );
}
