'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  Mail, 
  Clock, 
  Edit, 
  Send,
  AlertCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { PendingReply, EmailCache } from '@/lib/mail-center-types';
import { toast } from 'sonner';

type PendingReplyWithEmail = PendingReply & {
  email: EmailCache;
};

type Props = {
  pendingReplies: PendingReplyWithEmail[];
  onRefresh: () => void;
};

export function PendingRepliesPanel({ pendingReplies, onRefresh }: Props) {
  const [selectedReply, setSelectedReply] = useState<PendingReplyWithEmail | null>(null);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectReply = (reply: PendingReplyWithEmail) => {
    setSelectedReply(reply);
    setEditedSubject(reply.generated_subject || '');
    setEditedBody(reply.generated_body_text || '');
    setIsEditing(false);
  };

  const handleValidate = async (action: 'approve' | 'reject') => {
    if (!selectedReply) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/mail-center/validate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replyId: selectedReply.id,
          action,
          editedSubject: isEditing ? editedSubject : null,
          editedBody: isEditing ? editedBody : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          action === 'approve' 
            ? '✅ Réponse envoyée avec succès !' 
            : '❌ Réponse rejetée'
        );
        setSelectedReply(null);
        onRefresh();
      } else {
        toast.error(data.error || 'Erreur lors de la validation');
      }
    } catch (error) {
      toast.error('Erreur réseau');
      console.error('Error validating reply:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTimeAgo = (date: string): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`;
    
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  if (pendingReplies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="relative mb-6">
          <Mail className="w-16 h-16 text-muted-foreground/30" />
          <Check className="w-8 h-8 text-blue-500 absolute -bottom-1 -right-1" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Aucune réponse en attente</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Toutes vos réponses automatiques ont été traitées. Les nouveaux emails urgents 
          apparaîtront ici pour validation.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-250px)]">
      {/* Liste des réponses en attente */}
      <div className="col-span-5">
        <Card className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Réponses en attente
              <Badge className="ml-auto bg-orange-500">{pendingReplies.length}</Badge>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Cliquez pour prévisualiser et valider
            </p>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              <AnimatePresence mode="popLayout">
                {pendingReplies.map((reply, index) => {
                  const email = reply.email;
                  const initials = email.from_name
                    ?.split(' ')
                    .slice(0, 2)
                    .map(n => n[0])
                    .join('')
                    .toUpperCase() || email.from_email[0].toUpperCase();

                  return (
                    <motion.div
                      key={reply.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={cn(
                          "p-4 cursor-pointer transition-all hover:shadow-md border-2",
                          selectedReply?.id === reply.id 
                            ? "border-primary bg-primary/5" 
                            : "border-transparent hover:border-primary/30"
                        )}
                        onClick={() => handleSelectReply(reply)}
                      >
                        <div className="flex gap-3">
                          <Avatar className="w-10 h-10 flex-shrink-0">
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {email.from_name || email.from_email}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {email.subject || '(sans objet)'}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {getTimeAgo(reply.created_at)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {email.category && (
                                <Badge variant="outline" className="text-xs">
                                  {email.category}
                                </Badge>
                              )}
                              {email.urgency_score >= 8 && (
                                <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Urgent
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Prévisualisation et édition */}
      <div className="col-span-7">
        {selectedReply ? (
          <Card className="h-full flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Prévisualisation
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditing ? 'Aperçu' : 'Modifier'}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedReply.reason_for_validation || 'Validation manuelle requise'}
              </p>
            </div>

            <ScrollArea className="flex-1 p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Objet</label>
                    <Input
                      value={editedSubject}
                      onChange={(e) => setEditedSubject(e.target.value)}
                      placeholder="Objet de l'email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Corps du message</label>
                    <Textarea
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                      rows={12}
                      placeholder="Corps de l'email"
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Objet</p>
                    <p className="text-base font-semibold">
                      {editedSubject || selectedReply.generated_subject}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Message</p>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: selectedReply.generated_body_html || '' 
                      }}
                    />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Destinataire</p>
                      <p className="font-medium">{selectedReply.email.from_email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Modèle IA</p>
                      <p className="font-medium">{selectedReply.ai_model_used}</p>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t bg-muted/30">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50"
                  onClick={() => handleValidate('reject')}
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4 mr-2" />
                  Rejeter
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                  onClick={() => handleValidate('approve')}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Valider et envoyer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Sélectionnez une réponse pour la prévisualiser</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

