'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Zap,
  BarChart3,
  Shield,
  Sparkles,
  Bot,
  Clock,
  ChevronDown,
  Inbox,
  Brain,
  Target,
  Users,
  Globe,
  Workflow,
} from 'lucide-react';
import { useRef, useState } from 'react';

const mainFeatures = [
  {
    icon: Bot,
    title: 'Vendeur Expert 24/7',
    description: 'Ne dort jamais. Ne prend jamais de pause. Répond à chaque client avec l\'objectif de convertir.',
    gradient: 'from-purple-500 to-pink-500',
    borderGradient: 'from-purple-500/50 to-pink-500/50',
  },
  {
    icon: Mail,
    title: 'Vision 360° Client',
    description: 'Connecté à Shopify. L\'IA connaît l\'historique d\'achat et propose le produit complémentaire parfait.',
    gradient: 'from-blue-500 to-cyan-500',
    borderGradient: 'from-blue-500/50 to-cyan-500/50',
  },
  {
    icon: Zap,
    title: 'Réponses Instantanées',
    description: 'Le client pose une question. 10 secondes plus tard, il a sa réponse. 30 secondes plus tard, il achète.',
    gradient: 'from-cyan-500 to-teal-500',
    borderGradient: 'from-cyan-500/50 to-teal-500/50',
  },
  {
    icon: BarChart3,
    title: 'Tableau de Bord ROI',
    description: 'Ne suivez pas juste les tickets. Suivez le chiffre d\'affaires généré par votre support.',
    gradient: 'from-orange-500 to-red-500',
    borderGradient: 'from-orange-500/50 to-red-500/50',
  },
  {
    icon: Shield,
    title: 'Données Blindées',
    description: 'Vos données clients sont précieuses. Nous les protégeons comme un coffre-fort bancaire (AES-256).',
    gradient: 'from-green-500 to-emerald-500',
    borderGradient: 'from-green-500/50 to-emerald-500/50',
  },
  {
    icon: Clock,
    title: 'Liberté Totale',
    description: 'Réduisez votre temps de gestion de 85%. Passez vos journées à développer votre marque, pas à répondre aux emails.',
    gradient: 'from-indigo-500 to-blue-500',
    borderGradient: 'from-indigo-500/50 to-blue-500/50',
  },
];

const additionalFeatures = [
  {
    icon: Inbox,
    title: 'Classification Auto',
    description: 'L\'IA catégorise vos emails : support, urgent, commande, remboursement...',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Brain,
    title: 'Base de Connaissances',
    description: 'Alimentez l\'IA avec vos FAQs et documentations pour des réponses précises.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Target,
    title: 'Détection de Sentiment',
    description: 'Identifie automatiquement les emails urgents ou négatifs pour traitement prioritaire.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'Travaillez en équipe avec plusieurs membres, rôles et permissions.',
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    icon: Globe,
    title: 'Multi-langues',
    description: 'Répondez dans la langue de vos clients automatiquement.',
    gradient: 'from-sky-500 to-blue-500',
  },
  {
    icon: Workflow,
    title: 'Templates Personnalisés',
    description: 'Créez des modèles de réponses adaptés à chaque type de demande.',
    gradient: 'from-emerald-500 to-green-500',
  },
];

export function DarkBentoFeatures() {
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['10%', '-10%']);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-gray-50 py-16 xxs:py-20 sm:py-24 lg:py-32 transition-colors duration-300 dark:bg-gradient-to-br dark:from-[#0A0E27] dark:via-[#0f1629] dark:to-[#0A0E27]"
    >
      {/* Animated mesh background */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          className="h-full w-full"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '40px 40px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Floating blobs */}
      <motion.div
        className="pointer-events-none absolute left-1/3 top-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"
        style={{ y }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl 3xl:max-w-[1600px] 4xl:max-w-[1800px] px-4 xxs:px-5 xs:px-6 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16">
        {/* Header */}
        <div className="mb-10 xxs:mb-12 sm:mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.span
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(6, 182, 212, 0)',
                  '0 0 30px 10px rgba(6, 182, 212, 0.15)',
                  '0 0 0 0 rgba(6, 182, 212, 0)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Sparkles className="h-4 w-4" />
              Fonctionnalités
            </motion.span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 xxs:mt-5 sm:mt-6 text-2xl xxs:text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white"
          >
            Arrêtez de perdre des ventes{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-400">
              à cause d'un support lent
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-4 xxs:mt-5 sm:mt-6 max-w-2xl 3xl:max-w-3xl text-base xxs:text-lg sm:text-xl 3xl:text-2xl text-gray-600 dark:text-slate-300"
          >
            Chaque minute d'attente est une vente perdue. ClaritySupport répond instantanément pour sécuriser le panier.
          </motion.p>
        </div>

        {/* Bento Grid - Main Features */}
        <div className="grid gap-4 xxs:gap-5 sm:gap-6 3xl:gap-8 4xl:gap-10 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
          {mainFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  scale: 1.05,
                  rotateX: -5,
                  rotateY: 5,
                  transition: { duration: 0.3 },
                }}
                className="group relative"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="relative h-full overflow-hidden rounded-2xl xxs:rounded-3xl border border-gray-200 bg-white p-5 xxs:p-6 sm:p-8 3xl:p-10 4xl:p-12 shadow-lg transition-all duration-300 group-hover:border-blue-500/30 group-hover:shadow-xl dark:border-blue-500/10 dark:bg-gradient-to-br dark:from-[#1a1f3a] dark:to-[#0f1320] dark:shadow-none">
                  {/* Animated gradient border on hover */}
                  <motion.div
                    className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(135deg, transparent 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%)`,
                    }}
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />

                  {/* Icon with complex animations */}
                  <motion.div
                    className={`mb-6 inline-flex rounded-2xl bg-gradient-to-br ${feature.gradient} p-4`}
                    whileHover={{
                      scale: 1.15,
                      rotate: [0, -10, 10, -10, 0],
                      transition: { duration: 0.5 },
                    }}
                    animate={{
                      boxShadow: [
                        `0 0 0 0 ${feature.gradient.includes('blue') ? 'rgba(59, 130, 246, 0)' : 'rgba(6, 182, 212, 0)'}`,
                        `0 0 40px 10px ${feature.gradient.includes('blue') ? 'rgba(59, 130, 246, 0.3)' : 'rgba(6, 182, 212, 0.3)'}`,
                        `0 0 0 0 ${feature.gradient.includes('blue') ? 'rgba(59, 130, 246, 0)' : 'rgba(6, 182, 212, 0)'}`,
                      ],
                    }}
                    transition={{
                      boxShadow: {
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 0.5,
                      },
                    }}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </motion.div>

                  {/* Title */}
                  <h3 className="mb-3 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 transition-colors group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-300">
                    {feature.description}
                  </p>

                  {/* Hover glow effect */}
                  <motion.div
                    className={`pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br ${feature.borderGradient} opacity-0 blur-xl group-hover:opacity-50 transition-opacity duration-500`}
                    style={{ zIndex: -1 }}
                  />

                  {/* Particles on hover */}
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute h-1 w-1 rounded-full bg-blue-400"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [0, -100],
                          opacity: [0, 1, 0],
                          scale: [0, 1.5, 0],
                        }}
                        transition={{
                          duration: 2 + Math.random() * 2,
                          repeat: Infinity,
                          delay: Math.random() * 3,
                          ease: 'easeOut',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Multiple layer depth effect */}
                <motion.div
                  className={`absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 blur-2xl group-hover:opacity-20 transition-opacity duration-500`}
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: index * 0.3,
                  }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Additional Features (Expandable) */}
        <AnimatePresence>
          {showAll && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden"
            >
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {additionalFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 30 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.1,
                      }}
                      className="group relative"
                    >
                      <div className="relative h-full overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-lg transition-all duration-500 hover:border-blue-200 hover:bg-blue-50 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:shadow-2xl">
                        {/* Icon container */}
                        <motion.div
                          className={`mb-6 inline-flex rounded-2xl bg-gradient-to-br ${feature.gradient} p-4`}
                          whileHover={{
                            scale: 1.1,
                            rotate: [0, -5, 5, -5, 0],
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon className="h-8 w-8 text-white" />
                        </motion.div>

                        {/* Content */}
                        <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>

                        {/* Animated glow effect */}
                        <motion.div
                          className={`absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 blur-2xl group-hover:opacity-20 transition-opacity duration-500`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA with animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <motion.button
            onClick={() => setShowAll(!showAll)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-blue-600 px-8 py-4 font-bold text-white transition-all hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25"
          >
            <span className="relative z-10">
              {showAll ? 'Réduire les fonctionnalités' : 'Découvrir toutes les fonctionnalités'}
            </span>
            <motion.div
              animate={{ 
                rotate: showAll ? 180 : 0,
                y: showAll ? 0 : [0, 3, 0] 
              }}
              transition={{ 
                rotate: { duration: 0.3 },
                y: { duration: 1.5, repeat: Infinity }
              }}
            >
              <ChevronDown className="relative z-10 h-5 w-5" />
            </motion.div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.5 }}
            />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
