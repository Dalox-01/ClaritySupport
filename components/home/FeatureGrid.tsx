'use client';

import { motion } from 'framer-motion';
import { Globe2, Headphones, Layers, Mic2, ShieldCheck, Sparkles, Variable, Zap } from 'lucide-react';

const features = [
  {
    title: 'Génération ultra-rapide',
    description: 'Email complet en 3,2 secondes, ton ajusté automatiquement.',
    icon: Zap,
    accent: 'from-[#4bf9ff]/30 to-transparent',
  },
  {
    title: 'Assistant IA contextuel',
    description: 'Discutez avec votre copilote IA pour itérer, reformuler, enrichir.',
    icon: Sparkles,
    accent: 'from-[#a879ff]/30 to-transparent',
  },
  {
    title: 'Variables & signatures',
    description: 'Personnalisation illimitée avec variables dynamiques et signatures haut de gamme.',
    icon: Variable,
    accent: 'from-[#ff81c8]/30 to-transparent',
  },
  {
    title: 'Dictée vocale intuitive',
    description: 'Parlez, MailWizard transcrit et structure. Multi-langues, multi-tons.',
    icon: Mic2,
    accent: 'from-[#64ffe2]/25 to-transparent',
  },
  {
    title: 'Sécurité blindée',
    description: 'Chiffrement bout-en-bout, conformité RGPD, contrôle total.',
    icon: ShieldCheck,
    accent: 'from-[#73c4ff]/35 to-transparent',
  },
  {
    title: 'Export premium',
    description: 'PDF haute définition, sans watermark, aux couleurs de votre marque.',
    icon: Layers,
    accent: 'from-[#d9ff5d]/25 to-transparent',
  },
  {
    title: 'Global par design',
    description: '13 langues natives, expressions idiomatiques maîtrisées, variations culturelles.',
    icon: Globe2,
    accent: 'from-[#7df2ff]/35 to-transparent',
  },
  {
    title: 'Support prioritaire',
    description: 'Équipe humaine + IA, 24/7, selon vos priorités.',
    icon: Headphones,
    accent: 'from-[#ffb764]/35 to-transparent',
  },
];

export function FeatureGrid() {
  return (
    <section className="relative overflow-hidden bg-[#070414] py-32 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(51,255,230,0.25),transparent_60%)] opacity-60" />
      <div className="pointer-events-none absolute inset-y-0 right-[-30%] w-[60%] bg-[conic-gradient(from_90deg_at_50%_50%,rgba(90,58,255,0.3),rgba(42,255,220,0.4),rgba(90,58,255,0.3))] blur-3xl opacity-40" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 lg:px-12">
        <div className="max-w-3xl space-y-6">
          <motion.p
            className="text-xs uppercase tracking-[0.5em] text-white/50"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            Featureverse
          </motion.p>
          <motion.h2
            className="text-balance text-4xl font-semibold leading-tight md:text-5xl"
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Une constellation de fonctionnalités pensée pour les créateurs, les commerciaux et les équipes support.
          </motion.h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {features.map(({ title, description, icon: Icon, accent }, index) => (
            <motion.article
              key={title}
              className="group relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.07] p-8 backdrop-blur-3xl transition-transform duration-500 hover:-translate-y-2"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
            >
              <div className={`pointer-events-none absolute -inset-px bg-gradient-to-br ${accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
              <div className="relative flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[#66f6ff] shadow-[0_0_45px_rgba(88,255,245,0.25)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{title}</h3>
                </div>
                <p className="text-sm text-white/70">{description}</p>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-white/45">
                  <span className="h-px w-20 bg-gradient-to-r from-white/0 via-white/40 to-white/0" />
                  MailWizard
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}


