'use client';

import { ArrowRight, Sparkles, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface DarkHeroProps {
  onGetStarted: () => void;
}

export function DarkHero({ onGetStarted }: DarkHeroProps) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0A0E27] via-[#0F1629] to-[#0A0E27] pt-24 pb-16">
      {/* Animated gradient orbs - améliorés */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute left-1/3 top-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="pointer-events-none absolute bottom-1/4 right-1/3 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]"
      />

      {/* Main content - perfectly centered */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 text-center sm:px-8 lg:px-12">
        {/* Badge avec animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 backdrop-blur-md"
        >
          <Sparkles className="h-4 w-4" />
          <span>🚀 +30% de taux de conversion observé</span>
        </motion.div>

        {/* Title amélioré */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 text-5xl font-black leading-[1.1] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Votre Service Client ne doit pas vous coûter de l'argent.
          <br />
          <span className="inline-block bg-gradient-to-r from-[#0EA5E9] via-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
            Il doit vous en rapporter.
          </span>
        </motion.h1>

        {/* Subtitle amélioré */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-gray-300 sm:text-2xl"
        >
          ClaritySupport n'est pas juste un helpdesk. C'est une IA qui répond à vos clients en 30 secondes, résout les problèmes, et pousse à l'achat. 24/7. Sans pause café.
        </motion.p>

        {/* CTA Buttons améliorés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <button
            onClick={onGetStarted}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-10 py-5 text-lg font-bold text-white shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/50 active:scale-100"
          >
            <span className="relative z-10 flex items-center gap-3">
              Booster mes ventes maintenant
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
          
          <a
            href="#pricing"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-blue-500/30 bg-white/5 px-10 py-5 text-lg font-bold text-white backdrop-blur-md transition-all hover:border-blue-500/50 hover:bg-white/10"
          >
            <span>Voir le ROI</span>
          </a>
        </motion.div>

        {/* Trust badges améliorés */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400"
        >
          {['Essai gratuit 14 jours', 'Sans carte bancaire', 'Configuration en 2 min'].map((text, index) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-2"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20">
                <Check className="h-3 w-3 flex-shrink-0 text-cyan-400" strokeWidth={3} />
              </div>
              <span className="whitespace-nowrap font-medium">{text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Mockup - amélioré avec animations */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative mx-auto max-w-6xl"
        >
          <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#1a1f3a]/90 to-[#0f1320]/90 shadow-2xl shadow-blue-500/20 backdrop-blur-sm transition-all duration-500 hover:shadow-blue-500/30">
            {/* Window controls */}
            <div className="flex items-center gap-3 border-b border-blue-500/10 bg-gradient-to-r from-[#0f1320]/80 to-[#1a1f3a]/80 px-6 py-4 backdrop-blur-md">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80 transition-all hover:bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80 transition-all hover:bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500/80 transition-all hover:bg-green-500" />
              </div>
              <div className="ml-6 flex-1 rounded-lg border border-blue-500/10 bg-[#0A0E27]/50 px-4 py-2.5 text-left text-sm text-gray-400 backdrop-blur-sm">
                claritysupport.com/mail-center
              </div>
            </div>

            {/* Screenshot content */}
            <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#0A0E27] via-[#0f1629] to-[#0A0E27]">
              <img
                src="/screenshots/mailcenter-interface.png"
                alt="Interface ClaritySupport Mail Center"
                className="h-full w-full object-cover object-top"
                loading="lazy"
              />
              {/* Subtle overlay gradient */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0E27]/20 via-transparent to-transparent" />
            </div>
          </div>

          {/* Glow effect amélioré */}
          <div className="pointer-events-none absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 blur-3xl opacity-40" />
        </motion.div>
      </div>
    </section>
  );
}
