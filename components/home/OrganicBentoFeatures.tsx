'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Bot, Globe, Lock, Sparkles, Timer, Wand2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { ElasticCard } from '@/components/ui/elastic-card';

const features = [
  {
    title: 'Mail Center Unifié',
    description:
      'Centralisez tous vos emails Gmail et Outlook dans une interface unique. Gérez tout depuis un seul endroit.',
    icon: Timer,
    span: 'sm:col-span-2 lg:col-span-1 lg:row-span-2',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Génération IA',
    description:
      'Créez des emails parfaits en 3 secondes avec GPT-5. Templates intelligents et ton adaptatif.',
    icon: Bot,
    span: 'lg:col-span-1 lg:row-span-1',
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    title: 'Organisation par Statuts',
    description:
      'Classez vos emails : En attente, Répondus, À traiter, Archivés. Visualisez votre workflow.',
    icon: Globe,
    span: 'lg:col-span-1 lg:row-span-1',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    title: 'Réponses Automatiques',
    description:
      'Configurez des réponses auto avec variables et conditions. L&rsquo;IA répond pour vous 24/7.',
    icon: Wand2,
    span: 'lg:col-span-1 lg:row-span-1',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Multi-comptes',
    description:
      'Gérez plusieurs comptes Gmail et Outlook simultanément. Synchronisation temps réel.',
    icon: Lock,
    span: 'lg:col-span-1 lg:row-span-1',
    gradient: 'from-rose-500 to-red-600',
  },
  {
    title: 'Filtres & Analytics',
    description:
      'Recherche avancée, filtres intelligents, statistiques détaillées, export PDF et rapports.',
    icon: Sparkles,
    span: 'sm:col-span-2 lg:col-span-2 lg:row-span-1',
    gradient: 'from-violet-500 to-indigo-600',
  },
];

function FeatureCard({ feature, index }: { feature: any; index: number }) {
  const Icon = feature.icon;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={feature.span}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ElasticCard className="group h-full p-8">
        <div className="relative z-10 flex h-full flex-col">
          {/* Icon with gradient background */}
          <motion.div
            className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}
            whileHover={{
              rotate: [0, -12, 12, -12, 0],
              scale: 1.15,
              transition: { duration: 0.6 },
            }}
            animate={
              isHovered
                ? {
                    boxShadow: [
                      '0 0 0 0 rgba(30, 111, 92, 0.4)',
                      '0 0 0 12px rgba(30, 111, 92, 0)',
                    ],
                  }
                : {}
            }
            transition={{
              boxShadow: { duration: 0.6 },
            }}
          >
            <Icon className="h-7 w-7" strokeWidth={2} />
          </motion.div>

          {/* Title */}
          <motion.h3
            className="mb-3 text-2xl font-bold text-[#6B4F3A]"
            animate={{ x: isHovered ? 4 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {feature.title}
          </motion.h3>

          {/* Description */}
          <motion.p
            className="flex-1 text-[#6B4F3A]/70"
            dangerouslySetInnerHTML={{ __html: feature.description }}
            animate={{ x: isHovered ? 4 : 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          />

          {/* Decorative corner accent */}
          <motion.div
            className="absolute bottom-0 right-0 h-20 w-20 opacity-0 transition-opacity group-hover:opacity-100"
            style={{
              background: `linear-gradient(135deg, transparent 50%, rgba(30, 111, 92, 0.05) 50%)`,
            }}
          />
        </div>
      </ElasticCard>
    </motion.div>
  );
}

export function OrganicBentoFeatures() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative overflow-hidden bg-white py-24 sm:py-32 lg:py-40"
    >
      {/* Animated mesh background */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ y }}
      >
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(30, 111, 92, 0.15) 1px, transparent 0)`,
            backgroundSize: '48px 48px',
          }}
        />
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 text-center"
        >
          <motion.h2
            className="mb-6 text-4xl font-bold tracking-tight text-[#6B4F3A] sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="block">Un centre de contrôle</span>
            <span className="bg-gradient-to-r from-[#1E6F5C] via-[#26AB8C] to-[#1E6F5C] bg-clip-text text-transparent">
              complet.
            </span>
          </motion.h2>
          <motion.p
            className="mx-auto max-w-2xl text-lg text-[#6B4F3A]/70 sm:text-xl"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Le Mail Center centralise tout : génération IA, gestion multi-comptes, organisation par
            statuts, réponses automatiques et analytics avancés.
          </motion.p>
        </motion.div>

        {/* Organic Bento Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
