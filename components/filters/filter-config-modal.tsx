'use client';

import { useState, useEffect } from 'react';
import { X, Save, Palette, Brain, Search, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserFilter, FILTER_COLORS, TONE_OPTIONS, LANGUAGE_OPTIONS, PRIORITY_OPTIONS, FilterUpsertPayload } from '@/types/filters';
import { KeywordInput } from './keyword-input';
import * as Icons from 'lucide-react';
import { toast } from 'sonner';

const filterSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères').max(50),
  description: z.string().max(200).optional().or(z.literal('')),
  icon: z.string(),
  color: z.string(),
  keywords: z.array(z.string()).min(1, 'Au moins un mot-clé requis'),
  excludeKeywords: z.array(z.string()),
  regexPatterns: z.array(z.string()),
  matchMode: z.enum(['any', 'all']),
  caseSensitive: z.boolean(),
  autoReplyEnabled: z.boolean(),
  responseTemplate: z.string().max(2000).optional().or(z.literal('')),
  customInstructions: z.string().max(2000).optional().or(z.literal('')),
  tone: z.enum(['pro', 'cordial', 'empathique', 'technique']),
  language: z.enum(['fr', 'en']),
  priorityLevel: z.enum(['high', 'normal', 'low']),
  is_active: z.boolean(),
});

type FilterFormData = z.infer<typeof filterSchema>;

interface FilterConfigModalProps {
  filter?: UserFilter | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FilterUpsertPayload) => Promise<void>;
  isLightMode?: boolean;
}

const ICON_OPTIONS = [
  'Mail', 'Star', 'Heart', 'Zap', 'Users', 'ShoppingCart', 'AlertCircle', 
  'CheckCircle', 'Tag', 'Flag', 'BookOpen', 'Briefcase', 'Coffee', 'Gift'
];

export function FilterConfigModal({ filter, isOpen, onClose, onSave, isLightMode = false }: FilterConfigModalProps) {
  const [activeSection, setActiveSection] = useState('info');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      name: filter?.name || '',
      description: filter?.description || '',
      icon: filter?.icon || 'Mail',
      color: filter?.color || '#3B82F6',
      keywords: filter?.keywords || [],
      excludeKeywords: filter?.detection_rules?.excludeKeywords || [],
      regexPatterns: filter?.detection_rules?.regexPatterns || [],
      matchMode: filter?.detection_rules?.matchMode || 'any',
      caseSensitive: filter?.detection_rules?.caseSensitive ?? false,
      autoReplyEnabled: filter?.response_config?.autoReplyEnabled || false,
      responseTemplate: filter?.response_config?.responseTemplate || '',
      customInstructions: filter?.response_config?.customInstructions || '',
      tone: filter?.response_config?.tone || 'pro',
      language: filter?.response_config?.language || 'fr',
      priorityLevel: filter?.response_config?.priorityLevel || 'normal',
      is_active: filter?.is_active !== false,
    },
  });

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');
  const keywords = watch('keywords');
  const excludeKeywords = watch('excludeKeywords');
  const regexPatterns = watch('regexPatterns');
  const autoReplyEnabled = watch('autoReplyEnabled');

  useEffect(() => {
    if (filter) {
      reset({
        name: filter.name,
        description: filter.description || '',
        icon: filter.icon,
        color: filter.color,
        keywords: filter.keywords,
        excludeKeywords: filter.detection_rules?.excludeKeywords || [],
        regexPatterns: filter.detection_rules?.regexPatterns || [],
        matchMode: filter.detection_rules?.matchMode || 'any',
        caseSensitive: filter.detection_rules?.caseSensitive ?? false,
        autoReplyEnabled: filter.response_config?.autoReplyEnabled || false,
        responseTemplate: filter.response_config?.responseTemplate || '',
        customInstructions: filter.response_config?.customInstructions || '',
        tone: filter.response_config?.tone || 'pro',
        language: filter.response_config?.language || 'fr',
        priorityLevel: filter.response_config?.priorityLevel || 'normal',
        is_active: filter.is_active,
      });
    }
  }, [filter, reset]);

  const onSubmit = async (data: FilterFormData) => {
    setIsLoading(true);
    try {
      const payload: FilterUpsertPayload = {
        id: filter?.id,
        filter_key: filter?.filter_key,
        name: data.name,
        description: data.description || null,
        icon: data.icon,
        color: data.color,
        keywords: data.keywords,
        detection_rules: {
          matchMode: data.matchMode,
          caseSensitive: data.caseSensitive,
          regexPatterns: data.regexPatterns,
          excludeKeywords: data.excludeKeywords,
        },
        response_config: {
          tone: data.tone,
          language: data.language,
          customInstructions: data.customInstructions || undefined,
          responseTemplate: data.responseTemplate || undefined,
          autoReplyEnabled: data.autoReplyEnabled,
          priorityLevel: data.priorityLevel,
        },
        is_active: data.is_active,
      };

      await onSave(payload);
      toast.success(filter ? 'Filtre modifié avec succès' : 'Filtre créé avec succès');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde du filtre');
    } finally {
      setIsLoading(false);
    }
  };

  const IconPreview = (Icons as any)[selectedIcon] || Icons.Mail;

  const sections = [
    { id: 'info', label: 'Informations', icon: Info },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'detection', label: 'Détection', icon: Search },
    { id: 'ai', label: 'Configuration IA', icon: Brain },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${
            isLightMode ? 'bg-white' : 'bg-gray-900 border border-gray-700'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between border-b px-6 py-4 ${isLightMode ? 'border-gray-200' : 'border-gray-700'}`}>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: selectedColor }}
              >
                <IconPreview className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                  {filter ? 'Modifier le filtre' : 'Créer un filtre'}
                </h2>
                <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {filter?.is_default ? 'Filtre par défaut' : 'Filtre personnalisé'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`rounded-lg p-2 transition-colors ${
                isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'
              }`}
            >
              <X className={`h-5 w-5 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </button>
          </div>

          {/* Navigation sections */}
          <div className={`flex gap-2 border-b px-6 py-3 ${isLightMode ? 'border-gray-200 bg-gray-50' : 'border-gray-700 bg-gray-800'}`}>
            {sections.map((section) => {
              const SectionIcon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                    activeSection === section.id
                      ? isLightMode
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-blue-900/50 text-blue-400'
                      : isLightMode
                      ? 'text-gray-600 hover:bg-gray-100'
                      : 'text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <SectionIcon className="h-4 w-4" />
                  {section.label}
                </button>
              );
            })}
          </div>

          {/* Form content */}
          <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="p-6 space-y-6">
              {/* Section Informations */}
              {activeSection === 'info' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      Nom du filtre *
                    </label>
                    <input
                      {...register('name')}
                      className={`w-full rounded-lg border-2 px-4 py-2 transition-colors ${
                        isLightMode
                          ? 'border-gray-200 bg-white focus:border-blue-500'
                          : 'border-gray-700 bg-gray-800 text-white focus:border-blue-500'
                      }`}
                      placeholder="Ex: Support Client"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      className={`w-full rounded-lg border-2 px-4 py-2 transition-colors ${
                        isLightMode
                          ? 'border-gray-200 bg-white focus:border-blue-500'
                          : 'border-gray-700 bg-gray-800 text-white focus:border-blue-500'
                      }`}
                      placeholder="Description optionnelle..."
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      {...register('is_active')}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                    <label className={`text-sm font-semibold ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      Filtre actif
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Section Apparence */}
              {activeSection === 'appearance' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      Icône
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {ICON_OPTIONS.map((iconName) => {
                        const Icon = (Icons as any)[iconName];
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setValue('icon', iconName)}
                            className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all ${
                              selectedIcon === iconName
                                ? 'border-blue-500 bg-blue-100'
                                : isLightMode
                                ? 'border-gray-200 hover:border-blue-300'
                                : 'border-gray-700 hover:border-blue-500'
                            }`}
                          >
                            <Icon className={`h-5 w-5 ${selectedIcon === iconName ? 'text-blue-600' : isLightMode ? 'text-gray-600' : 'text-gray-400'}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      Couleur
                    </label>
                    <div className="grid grid-cols-8 gap-2">
                      {FILTER_COLORS.map((colorOption) => (
                        <button
                          key={colorOption.value}
                          type="button"
                          onClick={() => setValue('color', colorOption.value)}
                          className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all ${
                            selectedColor === colorOption.value
                              ? 'border-blue-500 scale-110'
                              : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: colorOption.value }}
                        >
                          {selectedColor === colorOption.value && <Icons.Check className="h-5 w-5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Section Détection */}
              {activeSection === 'detection' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                        Mode de correspondance
                      </label>
                      <select
                        {...register('matchMode')}
                        className={`w-full rounded-lg border-2 px-4 py-2 transition-colors ${
                          isLightMode
                            ? 'border-gray-200 bg-white focus:border-blue-500'
                            : 'border-gray-700 bg-gray-800 text-white focus:border-blue-500'
                        }`}
                      >
                        <option value="any">Au moins un mot-clé</option>
                        <option value="all">Tous les mots-clés</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <input
                        type="checkbox"
                        {...register('caseSensitive')}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                      <label className={`text-sm font-semibold ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                        Sensible à la casse
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      Mots-clés de détection *
                    </label>
                    <KeywordInput
                      keywords={keywords}
                      onChange={(newKeywords) => setValue('keywords', newKeywords)}
                      placeholder="Ajouter un mot-clé..."
                    />
                    {errors.keywords && <p className="mt-1 text-sm text-red-500">{errors.keywords.message}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      Mots-clés à exclure
                    </label>
                    <KeywordInput
                      keywords={excludeKeywords}
                      onChange={(patterns) => setValue('excludeKeywords', patterns)}
                      placeholder="Ex: newsletter"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      Expressions régulières
                    </label>
                    <KeywordInput
                      keywords={regexPatterns}
                      onChange={(patterns) => setValue('regexPatterns', patterns)}
                      placeholder="Ex: remboursement|rembourser"
                    />
                    <p className={`mt-1 text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Utilisez des REGEX simples pour capturer des variations spécifiques (optionnel)
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Section IA */}
              {activeSection === 'ai' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      {...register('autoReplyEnabled')}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                    <label className={`text-sm font-semibold ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      Activer les réponses automatiques
                    </label>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      Consignes IA spécifiques
                    </label>
                    <textarea
                      {...register('customInstructions')}
                      rows={3}
                      className={`w-full rounded-lg border-2 px-4 py-2 transition-colors ${
                        isLightMode
                          ? 'border-gray-200 bg-white focus:border-blue-500'
                          : 'border-gray-700 bg-gray-800 text-white focus:border-blue-500'
                      }`}
                      placeholder="Ajoutez des instructions que l'IA doit suivre pour ce filtre"
                    />
                    <p className={`mt-1 text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Exemple : "Toujours proposer un rendez-vous téléphonique sous 2h"
                    </p>
                  </div>

                  {autoReplyEnabled && (
                    <>
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                          Template de réponse
                        </label>
                        <textarea
                          {...register('responseTemplate')}
                          rows={4}
                          className={`w-full rounded-lg border-2 px-4 py-2 transition-colors ${
                            isLightMode
                              ? 'border-gray-200 bg-white focus:border-blue-500'
                              : 'border-gray-700 bg-gray-800 text-white focus:border-blue-500'
                          }`}
                          placeholder="Template de réponse automatique..."
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className={`block text-sm font-semibold mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                            Ton
                          </label>
                          <select
                            {...register('tone')}
                            className={`w-full rounded-lg border-2 px-4 py-2 transition-colors ${
                              isLightMode
                                ? 'border-gray-200 bg-white focus:border-blue-500'
                                : 'border-gray-700 bg-gray-800 text-white focus:border-blue-500'
                            }`}
                          >
                            {TONE_OPTIONS.map((tone) => (
                              <option key={tone.value} value={tone.value}>
                                {tone.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm font-semibold mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                            Langue
                          </label>
                          <select
                            {...register('language')}
                            className={`w-full rounded-lg border-2 px-4 py-2 transition-colors ${
                              isLightMode
                                ? 'border-gray-200 bg-white focus:border-blue-500'
                                : 'border-gray-700 bg-gray-800 text-white focus:border-blue-500'
                            }`}
                          >
                            {LANGUAGE_OPTIONS.map((lang) => (
                              <option key={lang.value} value={lang.value}>
                                {lang.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm font-semibold mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                            Priorité
                          </label>
                          <select
                            {...register('priorityLevel')}
                            className={`w-full rounded-lg border-2 px-4 py-2 transition-colors ${
                              isLightMode
                                ? 'border-gray-200 bg-white focus:border-blue-500'
                                : 'border-gray-700 bg-gray-800 text-white focus:border-blue-500'
                            }`}
                          >
                            {PRIORITY_OPTIONS.map((priority) => (
                              <option key={priority.value} value={priority.value}>
                                {priority.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer actions */}
            <div className={`flex items-center justify-end gap-3 border-t px-6 py-4 ${isLightMode ? 'border-gray-200 bg-gray-50' : 'border-gray-700 bg-gray-800'}`}>
              <button
                type="button"
                onClick={onClose}
                className={`rounded-lg px-6 py-2 font-semibold transition-colors ${
                  isLightMode ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
