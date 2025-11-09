'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Send, Loader2, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface AutoReplyDialogProps {
  email: {
    id: string;
    subject: string;
    from_email: string;
    from_name?: string;
    body_text?: string;
    body_html?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent?: () => void;
}

export function AutoReplyDialog({ email, open, onOpenChange, onSent }: AutoReplyDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Générer la réponse automatique
  const generateReply = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/mail-center/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailId: email.id,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur génération réponse');
      }

      const data = await res.json();
      setGeneratedSubject(data.subject);
      setGeneratedBody(data.body);
      toast.success('✨ Réponse générée !');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('❌ Erreur génération réponse');
    } finally {
      setIsGenerating(false);
    }
  };

  // Envoyer la réponse
  const sendReply = async () => {
    setIsSending(true);
    try {
      const res = await fetch('/api/mail-center/send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailId: email.id,
          toEmail: email.from_email,
          subject: generatedSubject,
          body: generatedBody,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur envoi email');
      }

      toast.success('✅ Email envoyé !');
      onOpenChange(false);
      
      // Réinitialiser
      setGeneratedSubject('');
      setGeneratedBody('');
      setIsEditing(false);
      
      // Appeler le callback onSent pour recharger le quota
      if (onSent) {
        onSent();
      }
      
      // Recharger la page pour afficher le badge "Auto-répondu"
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('❌ Erreur envoi email');
    } finally {
      setIsSending(false);
    }
  };

  // Auto-générer quand le dialog s'ouvre
  React.useEffect(() => {
    if (open && !generatedSubject && !generatedBody) {
      generateReply();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Réponse automatique
          </DialogTitle>
          <DialogDescription>
            Répondre à <strong>{email.from_name || email.from_email}</strong>
          </DialogDescription>
        </DialogHeader>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Génération de la réponse avec l'IA...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Email original */}
            <div className="bg-muted/50 p-4 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-2">Email original :</p>
              <p className="font-semibold text-sm">{email.subject}</p>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                {email.body_text?.substring(0, 200)}...
              </p>
            </div>

            {/* Sujet de la réponse */}
            <div className="space-y-2">
              <Label htmlFor="subject">Sujet</Label>
              <Input
                id="subject"
                value={generatedSubject}
                onChange={(e) => {
                  setGeneratedSubject(e.target.value);
                  setIsEditing(true);
                }}
                placeholder="Re: ..."
              />
            </div>

            {/* Corps de la réponse */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="body">Message</Label>
                {isEditing && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Edit className="w-3 h-3" />
                    Modifié
                  </span>
                )}
              </div>
              <Textarea
                id="body"
                value={generatedBody}
                onChange={(e) => {
                  setGeneratedBody(e.target.value);
                  setIsEditing(true);
                }}
                rows={12}
                className="font-mono text-sm"
                placeholder="Votre réponse..."
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Annuler
          </Button>
          
          {!isGenerating && (
            <>
              <Button
                variant="outline"
                onClick={generateReply}
                disabled={isSending}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Régénérer
              </Button>
              
              <Button
                onClick={sendReply}
                disabled={isSending || !generatedBody}
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

