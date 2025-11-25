'use client';

import { motion } from 'framer-motion';
import {
  Mail,
  Zap,
  BarChart3,
  Shield,
  Bot,
  Clock,
  Inbox,
  Brain,
  Target,
  Users,
  Globe,
  Workflow,
} from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'Intelligence Artificielle Avancée',
    description: 'Analyse contextuelle approfondie pour des réponses précises et personnalisées, adaptées à votre marque.',
    color: 'blue',
  },
  {
    icon: Mail,
    title: 'Centralisation Multi-Comptes',
    description: 'Unification de vos boîtes Gmail, Outlook et autres en une interface unique et performante.',
    color: 'cyan',
  },
  {
    icon: Zap,
    title: 'Automatisation Continue',
    description: 'Réponses instantanées 24h/24, 7j/7. Votre support client ne dort jamais.',
    color: 'indigo',
  },
  {
    icon: BarChart3,
    title: 'Analytique en Temps Réel',
    description: 'Tableaux de bord détaillés : satisfaction client, temps de réponse, taux de résolution.',
    color: 'violet',
  },
  {
    icon: Shield,
    title: 'Sécurité de Niveau Entreprise',
    description: 'Chiffrement AES-256, conformité RGPD complète, hébergement européen certifié.',
    color: 'emerald',
  },
  {
    icon: Clock,
    title: 'Gain de Productivité',
    description: 'Réduction jusqu\'à 85% du temps consacré au support client. Focalisez-vous sur l\'essentiel.',
    color: 'amber',
  },
];

const additionalFeatures = [
  { icon: Inbox, title: 'Classification Automatique', description: 'Tri intelligent et catégorisation de vos emails' },
  { icon: Brain, title: 'Apprentissage Continu', description: 'L\'IA s\'améliore avec chaque interaction' },
  { icon: Target, title: 'Détection de Priorités', description: 'Identification automatique des demandes urgentes' },
  { icon: Users, title: 'Collaboration d\'Équipe', description: 'Gestion des rôles et permissions avancée' },
  { icon: Globe, title: 'Support Multilingue', description: 'Réponses dans 47 langues automatiquement' },
  { icon: Workflow, title: 'Templates Personnalisés', description: 'Bibliothèque de réponses réutilisables' },
];

const colorVariants: Record<string, { bg: string; icon: string; border: string }> = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200' },
  cyan: { bg: 'bg-cyan-50', icon: 'text-cyan-600', border: 'border-cyan-200' },
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', border: 'border-indigo-200' },
  violet: { bg: 'bg-violet-50', icon: 'text-violet-600', border: 'border-violet-200' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-200' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-200' },
};

export function LightFeatures() {
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      {/* Background subtle */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Header professionnel */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-4 text-sm font-bold uppercase tracking-wider text-blue-600">
              Fonctionnalités Avancées
            </p>
            <h2 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Une Suite Complète
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Pour Votre Réussite
              </span>
            </h2>
            <p className="text-xl leading-relaxed text-gray-700">
              Des outils professionnels pour <span className="font-bold text-gray-900">transformer votre support client</span>
            </p>
          </motion.div>
        </div>

        {/* Main features grid */}
        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = colorVariants[feature.color];
            
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <motion.div 
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative h-full overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-md transition-all duration-300 hover:border-gray-300 hover:shadow-2xl"
                >
                  {/* Icon avec animation */}
                  <motion.div 
                    className={`mb-6 inline-flex rounded-xl ${colors.bg} p-3 transition-all`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className={`h-6 w-6 ${colors.icon}`} strokeWidth={2.5} />
                  </motion.div>

                  {/* Content */}
                  <h3 className="mb-3 text-xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700">
                    {feature.description}
                  </p>

                  {/* Effet de brillance au hover */}
                  <motion.div 
                    className={`absolute inset-0 rounded-2xl border-2 ${colors.border} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                    initial={false}
                  />
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className={`absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l ${colors.bg} to-transparent opacity-30`} />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional features - compact */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {additionalFeatures.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-6 transition-all hover:border-gray-200 hover:bg-white hover:shadow-md"
              >
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Icon className="h-5 w-5 text-blue-600" strokeWidth={2} />
                  </div>
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-gray-900">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-12">
            <h3 className="mb-4 text-3xl font-bold text-gray-900">
              Prêt à transformer votre support ?
            </h3>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
              Rejoignez les entreprises qui ont déjà automatisé leur support client
            </p>
            <button className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-[0.98]">
              Démarrer gratuitement
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
