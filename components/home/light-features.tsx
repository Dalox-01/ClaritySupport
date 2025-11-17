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
    title: 'IA Avancée',
    description: 'Réponses automatiques contextuelles qui comprennent l\'intent du client.',
    color: 'blue',
  },
  {
    icon: Mail,
    title: 'Centralisation',
    description: 'Unifiez Gmail, Outlook et autres boîtes mail en une seule interface.',
    color: 'cyan',
  },
  {
    icon: Zap,
    title: 'Automatisation 24/7',
    description: 'Réponses instantanées jour et nuit, même pendant que vous dormez.',
    color: 'indigo',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Tableaux de bord en temps réel : satisfaction, volume, tendances.',
    color: 'violet',
  },
  {
    icon: Shield,
    title: 'Sécurité RGPD',
    description: 'Chiffrement AES-256, conformité RGPD, hébergement EU.',
    color: 'emerald',
  },
  {
    icon: Clock,
    title: 'Gain de Temps',
    description: 'Économisez jusqu\'à 85% de temps sur le support client.',
    color: 'amber',
  },
];

const additionalFeatures = [
  { icon: Inbox, title: 'Classification Auto', description: 'Catégorisation intelligente de vos emails' },
  { icon: Brain, title: 'Base de Connaissances', description: 'Alimentez l\'IA avec vos FAQs' },
  { icon: Target, title: 'Détection de Sentiment', description: 'Identification des emails urgents' },
  { icon: Users, title: 'Collaboration', description: 'Travail d\'équipe avec rôles et permissions' },
  { icon: Globe, title: 'Multi-langues', description: 'Répondez dans la langue de vos clients' },
  { icon: Workflow, title: 'Templates', description: 'Modèles de réponses personnalisés' },
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
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-600">
              Fonctionnalités
            </p>
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600">
              Une suite complète d'outils pour transformer votre support client
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
                <div className="relative h-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-200/50">
                  {/* Icon */}
                  <div className={`mb-6 inline-flex rounded-xl ${colors.bg} p-3 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`h-6 w-6 ${colors.icon}`} strokeWidth={2} />
                  </div>

                  {/* Content */}
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-base leading-relaxed text-gray-600">
                    {feature.description}
                  </p>

                  {/* Hover effect border */}
                  <div className={`absolute inset-0 rounded-2xl border-2 ${colors.border} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                </div>
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
