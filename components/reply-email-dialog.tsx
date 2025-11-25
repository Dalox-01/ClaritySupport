'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReplyEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: {
    id: string;
    from_email: string;
    from_name: string | null;
    subject: string | null;
    body_text: string | null;
  };
  onReplySent?: () => void;
  isLightMode?: boolean;
}

export function ReplyEmailDialog({ 
  isOpen, 
  onClose, 
  email, 
  onReplySent,
  isLightMode = false 
}: ReplyEmailDialogProps) {
  const [replyBody, setReplyBody] = useState('');
  const [subject, setSubject] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Préfixer "Re: " si pas déjà présent
      const emailSubject = email.subject || '(sans objet)';
      const subjectPrefix = emailSubject.startsWith('Re: ') ? '' : 'Re: ';
      setSubject(subjectPrefix + emailSubject);
      setReplyBody('');
    }
  }, [isOpen, email]);

  const generateReply = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailContent: email.body_text || '',
          subject: email.subject || '',
          fromName: email.from_name || email.from_email,
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la génération');

      const data = await response.json();
      setReplyBody(data.reply);
      toast.success('Réponse générée avec succès !');
    } catch (error) {
      console.error('Erreur génération:', error);
      toast.error('Impossible de générer la réponse');
    } finally {
      setIsGenerating(false);
    }
  };

  const sendReply = async () => {
    if (!replyBody.trim()) {
      toast.error('Le message ne peut pas être vide');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/mail-center/send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailId: email.id,
          to: email.from_email,
          subject: subject,
          body: replyBody,
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de l&apos;envoi');

      toast.success('Réponse envoyée avec succès !');
      onReplySent?.();
      onClose();
    } catch (error) {
      console.error('Erreur envoi:', error);
      toast.error('Impossible d&apos;envoyer la réponse');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className={cn(
            "absolute inset-0",
            isLightMode ? "bg-black/30" : "bg-black/70"
          )}
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            "relative w-full max-w-2xl rounded-xl border shadow-2xl backdrop-blur-xl",
            isLightMode
              ? "bg-white/90 border-blue-200/50"
              : "bg-[#1a1f3a]/95 border-blue-500/20"
          )}
        >
          {/* Header */}
          <div className={cn(
            "flex items-center justify-between p-6 border-b",
            isLightMode ? "border-blue-200/50" : "border-blue-500/20"
          )}>
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={cn(
                  "p-2 rounded-lg",
                  isLightMode 
                    ? "bg-blue-500/20" 
                    : "bg-blue-500/10"
                )}
              >
                <Sparkles className={cn(
                  "w-5 h-5",
                  isLightMode ? "text-blue-600" : "text-blue-400"
                )} />
              </motion.div>
              <div>
                <h2 className={cn(
                  "text-xl font-bold",
                  isLightMode ? "text-gray-900" : "text-white"
                )}>
                  Répondre à {email.from_name || email.from_email}
                </h2>
                <p className={cn(
                  "text-sm",
                  isLightMode ? "text-gray-600" : "text-gray-400"
                )}>
                  {email.from_email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className={cn(
                isLightMode 
                  ? "hover:bg-gray-100 text-gray-600"
                  : "hover:bg-blue-500/10 text-gray-400"
              )}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Sujet */}
            <div>
              <label className={cn(
                "block text-sm font-medium mb-2",
                isLightMode ? "text-gray-700" : "text-gray-300"
              )}>
                Sujet
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={cn(
                  "transition-all",
                  isLightMode
                    ? "bg-blue-50/50 border-blue-200/50 text-gray-900"
                    : "bg-[#0f1320] border-blue-500/20 text-white"
                )}
              />
            </div>

            {/* Message original (aperçu) */}
            <div className={cn(
              "p-3 rounded-lg border",
              isLightMode
                ? "bg-blue-50/50 border-blue-200/30"
                : "bg-[#0f1320] border-blue-500/10"
            )}>
              <p className={cn(
                "text-xs font-medium mb-1",
                isLightMode ? "text-gray-600" : "text-gray-400"
              )}>
                Message original :
              </p>
              <p className={cn(
                "text-sm line-clamp-3",
                isLightMode ? "text-gray-700" : "text-gray-300"
              )}>
                {email.body_text || 'Pas de contenu'}
              </p>
            </div>

            {/* Bouton de génération AI */}
            <div className="flex gap-2">
              <Button
                onClick={generateReply}
                disabled={isGenerating}
                className={cn(
                  "flex-1 bg-gradient-to-r transition-all",
                  isLightMode
                    ? "from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    : "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Générer une réponse avec l&apos;IA
                  </>
                )}
              </Button>
            </div>

            {/* Zone de texte */}
            <div>
              <label className={cn(
                "block text-sm font-medium mb-2",
                isLightMode ? "text-gray-700" : "text-gray-300"
              )}>
                Votre réponse
              </label>
              <Textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Écrivez votre réponse ici ou générez-la avec l'IA..."
                rows={8}
                className={cn(
                  "transition-all resize-none",
                  isLightMode
                    ? "bg-blue-50/50 border-blue-200/50 text-gray-900 placeholder:text-gray-500"
                    : "bg-[#0f1320] border-blue-500/20 text-white placeholder:text-gray-400"
                )}
              />
              <p className={cn(
                "text-xs mt-1",
                isLightMode ? "text-gray-500" : "text-gray-500"
              )}>
                {replyBody.length} caractères
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className={cn(
            "flex items-center justify-end gap-3 p-6 border-t",
            isLightMode ? "border-blue-200/50" : "border-blue-500/20"
          )}>
            <Button
              variant="ghost"
              onClick={onClose}
              className={cn(
                isLightMode
                  ? "hover:bg-gray-100 text-gray-700"
                  : "hover:bg-blue-500/10 text-gray-300"
              )}
            >
              Annuler
            </Button>
            <Button
              onClick={sendReply}
              disabled={isSending || !replyBody.trim()}
              className={cn(
                "bg-gradient-to-r shadow-lg transition-all",
                isLightMode
                  ? "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/20"
                  : "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/20"
              )}
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
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
