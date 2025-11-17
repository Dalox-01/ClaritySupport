'use client';

import { ArrowRight, Sparkles, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface LightHeroProps {
  onGetStarted: () => void;
}

export function LightHero({ onGetStarted }: LightHeroProps) {
  return (
    <section className="relative min-h-screen bg-white pt-24 pb-20">
      {/* Subtle gradient overlay - très subtil style Apple */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-50/30 via-transparent to-transparent" />
      
      {/* Floating subtle shapes */}
      <div className="pointer-events-none absolute right-0 top-20 h-[600px] w-[600px] rounded-full bg-blue-100/20 blur-3xl" />
      <div className="pointer-events-none absolute left-0 bottom-0 h-[400px] w-[400px] rounded-full bg-cyan-100/20 blur-3xl" />

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge minimaliste */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600"
          >
            <Sparkles className="h-4 w-4" />
            <span>Support client automatisé par IA</span>
          </motion.div>

          {/* Title - typographie Apple style */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-6xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-7xl lg:text-8xl"
          >
            Support client
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              réinventé
            </span>
          </motion.h1>

          {/* Subtitle épuré */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-gray-600 sm:text-2xl"
          >
            Centralisez vos emails, automatisez les réponses avec l'IA,
            et offrez un service client exceptionnel 24/7.
          </motion.p>

          {/* CTA minimaliste */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <button
              onClick={onGetStarted}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.98]"
            >
              <span>Essayer gratuitement</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-full border-2 border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-900 transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]"
            >
              Voir les tarifs
            </a>
          </motion.div>

          {/* Trust badges épurés */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500"
          >
            {['Essai gratuit 14 jours', 'Sans carte bancaire', 'Configuration en 2 min'].map((text) => (
              <div key={text} className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100">
                  <Check className="h-3 w-3 text-blue-600" strokeWidth={3} />
                </div>
                <span className="whitespace-nowrap font-medium">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Mockup style Apple - ultra clean */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative mx-auto max-w-6xl"
        >
          {/* Shadow portée subtile */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-gray-100/50 to-gray-200/50 blur-2xl" />
          
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            {/* Barre de fenêtre minimaliste */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white px-6 py-4">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-300" />
                <div className="h-3 w-3 rounded-full bg-gray-300" />
                <div className="h-3 w-3 rounded-full bg-gray-300" />
              </div>
              <div className="flex-1 mx-6">
                <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-center text-sm text-gray-500">
                  claritysupport.com/mail-center
                </div>
              </div>
              <div className="w-16" /> {/* Spacer for symmetry */}
            </div>

            {/* Screenshot area */}
            <div className="relative aspect-[16/9] bg-gradient-to-br from-gray-50 to-white">
              <img
                src="/screenshots/mailcenter-interface.png"
                alt="Interface ClaritySupport"
                className="h-full w-full object-cover object-top"
              />
              {/* Subtle overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
            </div>
          </div>

          {/* Floating badge - style Apple */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2"
          >
            <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-6 py-3 shadow-lg">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-cyan-400"
                  />
                ))}
              </div>
              <div className="border-l border-gray-200 pl-3">
                <p className="text-sm font-semibold text-gray-900">+10,000 emails traités</p>
                <p className="text-xs text-gray-500">Ce mois-ci</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
