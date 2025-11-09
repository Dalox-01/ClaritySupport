'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Bot, Globe, Lock, Sparkles, Timer, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { TiltCard } from './TiltCard';

const features = [
  {
    title: 'Mail Center Unifié',
    description: 'Centralisez tous vos emails Gmail et Outlook dans une interface unique. Gérez tout depuis un seul endroit.',
    icon: Timer,
    span: 'sm:col-span-2 md:col-span-1 md:row-span-2',
  },
  {
    title: 'Génération IA',
    description: 'Créez des emails parfaits en 3 secondes avec GPT-5. Templates intelligents et ton adaptatif.',
    icon: Bot,
    span: 'md:col-span-1 md:row-span-1',
  },
  {
    title: 'Organisation par Statuts',
    description: 'Classez vos emails : En attente, Répondus, À traiter, Archivés. Visualisez votre workflow.',
    icon: Globe,
    span: 'md:col-span-1 md:row-span-1',
  },
  {
    title: 'Réponses Automatiques',
    description: 'Configurez des réponses auto avec variables et conditions. L&rsquo;IA répond pour vous 24/7.',
    icon: Wand2,
    span: 'md:col-span-1 md:row-span-1',
  },
  {
    title: 'Multi-comptes',
    description: 'Gérez plusieurs comptes Gmail et Outlook simultanément. Synchronisation temps réel.',
    icon: Lock,
    span: 'md:col-span-1 md:row-span-1',
  },
  {
    title: 'Filtres & Analytics',
    description: 'Recherche avancée, filtres intelligents, statistiques détaillées, export PDF et rapports.',
    icon: Sparkles,
    span: 'sm:col-span-2 md:col-span-2 md:row-span-1',
  },
];

export function BentoFeatures() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <section className="relative overflow-hidden bg-gray-50 py-16 dark:bg-gray-950 sm:py-20 lg:py-24">
      {/* Animated background pattern */}
      <motion.div 
        className="pointer-events-none absolute inset-0 opacity-30"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.15) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <motion.h2 
            className="mb-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Un centre de contrôle complet.
          </motion.h2>
          <motion.p 
            className="mx-auto max-w-2xl text-base text-gray-600 dark:text-gray-400 sm:text-lg"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Le Mail Center centralise tout : génération IA, gestion multi-comptes, organisation par statuts, réponses automatiques et analytics avancés.
          </motion.p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:grid-rows-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <TiltCard key={feature.title} className={feature.span}>
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.08, 
                    ease: [0.22, 1, 0.36, 1] 
                  }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                  }}
                  className="group relative h-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-500/10 dark:border-gray-800 dark:bg-gray-900 dark:hover:shadow-blue-500/20"
                  onMouseMove={(e) => handleMouseMove(e, index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="relative z-10">
                    <motion.div 
                      className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-sm transition-all group-hover:shadow-md dark:from-blue-950 dark:to-blue-900 dark:text-blue-400"
                      whileHover={{ 
                        rotate: [0, -10, 10, -10, 0], 
                        scale: 1.15,
                        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                      }}
                      animate={{
                        boxShadow: hoveredIndex === index 
                          ? [
                              "0 0 0 0 rgba(59, 130, 246, 0.4)",
                              "0 0 0 8px rgba(59, 130, 246, 0)",
                            ]
                          : "0 0 0 0 rgba(59, 130, 246, 0)",
                      }}
                      transition={{
                        boxShadow: { duration: 0.6 },
                      }}
                    >
                      <Icon className="h-6 w-6" strokeWidth={1.5} />
                    </motion.div>
                    <motion.h3 
                      className="mb-2 text-xl font-semibold text-gray-900 dark:text-white"
                      animate={{
                        x: hoveredIndex === index ? 2 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {feature.title}
                    </motion.h3>
                    <motion.p
                      className="text-gray-600 dark:text-gray-400"
                      dangerouslySetInnerHTML={{ __html: feature.description }}
                      animate={{
                        x: hoveredIndex === index ? 2 : 0,
                      }}
                      transition={{ duration: 0.3, delay: 0.05 }}
                    />
                  </div>
                  
                  {/* Animated gradient that follows mouse */}
                  {hoveredIndex === index && (
                    <motion.div
                      className="pointer-events-none absolute inset-0 opacity-40"
                      style={{
                        background: `radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(59, 130, 246, 0.2), transparent 40%)`,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.4 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                  
                  {/* Animated border gradient */}
                  <motion.div 
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100"
                    style={{
                      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))",
                    }}
                  />
                  
                  {/* Shimmer effect on hover */}
                  {hoveredIndex === index && (
                    <motion.div
                      className="pointer-events-none absolute inset-0"
                      initial={{ x: "-100%", opacity: 0.5 }}
                      animate={{ x: "200%", opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                      }}
                    />
                  )}
                </motion.div>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

