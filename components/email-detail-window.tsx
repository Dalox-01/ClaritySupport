'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Calendar, 
  User, 
  Tag, 
  Bot, 
  Sparkles,
  Reply,
  Forward,
  Archive,
  Trash2,
  Star,
  Clock
} from 'lucide-react';
import { DraggableWindow } from './draggable-window';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import type { EmailCache } from '@/lib/mail-center-types';

interface EmailDetailWindowProps {
  email: EmailCache | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerateReply: (email: EmailCache) => void;
  onToggleFavorite?: (emailId: string) => void;
  onArchive?: (emailId: string) => void;
  onDelete?: (emailId: string) => void;
  isFavorite?: boolean;
  zIndex?: number;
  onFocus?: () => void;
  isReadOnly?: boolean;
  onRestrictedAction?: () => void;
}

export function EmailDetailWindow({
  email,
  isOpen,
  onClose,
  onGenerateReply,
  onToggleFavorite,
  onArchive,
  onDelete,
  isFavorite = false,
  zIndex = 50,
  onFocus,
  isReadOnly = false,
  onRestrictedAction,
}: EmailDetailWindowProps) {
  if (!email) return null;

  const handleAction = (callback?: () => void) => {
    if (isReadOnly) {
      onRestrictedAction?.();
      return;
    }
    callback?.();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'support': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'vente': return 'bg-blue-600/10 text-blue-700 border-blue-600/20';
      case 'client': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'interne': return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20';
      case 'partenaire': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'urgent': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'spam': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <DraggableWindow
      title={email.subject || 'Sans objet'}
      isOpen={isOpen}
      onClose={onClose}
      width="900px"
      height="700px"
      zIndex={zIndex}
      onFocus={onFocus}
    >
      <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-[#0f1320] dark:to-[#1a1f3a]">
        {/* Email Header */}
        <div className="px-6 py-4 space-y-4 border-b border-gray-200 dark:border-blue-500/20">
          {/* Subject */}
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex-1">
              {email.subject || 'Sans objet'}
            </h2>
            <div className="flex items-center gap-2">
              {email.category && (
                <Badge variant="outline" className={cn('text-xs', getCategoryColor(email.category))}>
                  <Tag className="w-3 h-3 mr-1" />
                  {email.category}
                </Badge>
              )}
              {email.is_auto_replied && (
                <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20">
                  <Bot className="w-3 h-3 mr-1" />
                  Auto
                </Badge>
              )}
            </div>
          </div>

          {/* From/To Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 min-w-[80px] text-gray-500 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span className="font-medium">Qui:</span>
              </div>
              <div className="flex-1">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {email.from_name || email.from_email}
                </span>
                {email.from_name && (
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    &lt;{email.from_email}&gt;
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 min-w-[80px] text-gray-500 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span className="font-medium">À:</span>
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                {email.to_email}
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 min-w-[80px] text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Date:</span>
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                {formatDate(email.received_at)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => handleAction(() => onGenerateReply(email))}
                disabled={isReadOnly}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Générer une réponse
              </Button>
            </motion.div>
            
            <Separator orientation="vertical" className="h-8 mx-2" />

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="sm"
                disabled={isReadOnly}
                className="border-blue-500/30 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-500/50 dark:text-blue-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
              >
                <Reply className="w-4 h-4 mr-2" />
                Répondre
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="sm"
                disabled={isReadOnly}
                className="border-blue-500/30 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-500/50 dark:text-blue-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
              >
                <Forward className="w-4 h-4 mr-2" />
                Transférer
              </Button>
            </motion.div>

            <div className="flex-1"></div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleAction(() => onToggleFavorite && onToggleFavorite(email.id))}
                disabled={isReadOnly}
                className={cn(
                  "transition-colors",
                  isFavorite 
                    ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:text-yellow-300 dark:hover:bg-yellow-500/10"
                    : "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-500/10"
                )}
              >
                <Star className={cn("w-4 h-4", isFavorite && "fill-current")} />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleAction(() => onArchive && onArchive(email.id))}
                disabled={isReadOnly}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-500/10"
              >
                <Archive className="w-4 h-4" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleAction(() => onDelete && onDelete(email.id))}
                disabled={isReadOnly}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Email Body */}
        <ScrollArea className="flex-1 px-6 py-6">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: email.body_html || email.body_text || 'Aucun contenu' }}
          />
        </ScrollArea>
      </div>
    </DraggableWindow>
  );
}
