'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BarChart3, Orbit, PenTool, Sparkles } from 'lucide-react';

const chapters = [
  {
    id: 'chapter-1',
    label: 'Chapitre I',
    title: 'Studio narratif IA',
    description:
      "Une toile synesthésique qui assemble en temps réel vos intentions, le contexte et la tonalité de votre message.",
    icon: PenTool,
    gradient: 'from-[#1ce7ff]/20 via-transparent to-transparent',
  },
  {
    id: 'chapter-2',
    label: 'Chapitre II',
    title: 'Cadence orchestrée',
    description:
      'Timeline immersive : chaque décision dévoile un panneau cinétique avec analytics, templates et signatures.',
    icon: Orbit,
    gradient: 'from-[#a779ff]/20 via-transparent to-transparent',
  },
  {
    id: 'chapter-3',
    label: 'Chapitre III',
    title: 'Impact mesuré',
    description:
      "See / Feel / Act : MailWizard visualise les émotions, les points d&rsquo;engagement et la probabilité de conversion.",
    icon: BarChart3,
    gradient: 'from-[#ff7ac4]/20 via-transparent to-transparent',
  },
];

export function ImmersiveChapters() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  const backdropOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.25, 0.75, 0.3]);
  const haloScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.15, 0.95]);

  return (
    <section ref={containerRef} className="relative overflow-hidden bg-[#05020f] py-32 text-white">
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(80,90,255,0.2),transparent_60%)]"
        style={{ opacity: backdropOpacity }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[conic-gradient(from_120deg_at_50%_50%,rgba(38,255,228,0.18),rgba(132,75,255,0.24),rgba(38,255,228,0.18))] blur-3xl"
        style={{ scale: haloScale, opacity: backdropOpacity }}
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 lg:flex-row lg:items-start lg:px-12">
        <div className="w-full max-w-lg space-y-6">
          <motion.span
            className="inline-flex rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.4em] text-white/60"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Holo Narrative
          </motion.span>
          <motion.h2
            className="text-balance text-4xl font-semibold leading-tight text-white md:text-5xl"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Une expérience séquentielle où chaque scroll libère un nouveau tableau interactif.
          </motion.h2>
          <motion.p
            className="max-w-md text-base text-white/65"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Nous avons transformé l&apos;accueil de MailWizard en voyage chorégraphié. Chaque chapitre révèle une facette du produit avec graphismes holographiques, micro-interactions tactiles et réponses IA.
          </motion.p>
        </div>

        <div className="relative flex-1">
          <div className="absolute -inset-14 rounded-[3rem] border border-white/5 bg-white/5/10 blur-3xl" />

          <div className="relative grid gap-10">
            {chapters.map(({ id, label, title, description, icon: Icon, gradient }, index) => (
              <motion.article
                key={id}
                className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10/20 p-10 backdrop-blur-2xl"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, delay: index * 0.15 }}
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                <div className="relative flex flex-col gap-6">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-white/40">
                    <span>{label}</span>
                    <span>MailWizard</span>
                  </div>
                  <div className="flex items-start gap-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-[#6cf8ff] shadow-[0_0_45px_rgba(88,255,245,0.35)]">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-semibold text-white">{title}</h3>
                      <p className="text-sm text-white/70">{description}</p>
                    </div>
                  </div>
                  <motion.div
                    className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-white/50"
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <Sparkles className="h-4 w-4 text-[#63fcff]" />
                    Déploie ton chapitre
                  </motion.div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


