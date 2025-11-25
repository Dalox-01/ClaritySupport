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
          {/* Badge professionnel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="group mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition-all hover:scale-105 hover:shadow-md"
          >
            <Sparkles className="h-4 w-4" />
            <span>+10 000 emails automatisés cette semaine</span>
          </motion.div>

          {/* Title - professionnel et impactant */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-gray-900 sm:text-6xl lg:text-7xl"
          >
            L&apos;IA qui fait passer
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent">
                vos emails e-commerce en pilote automatique
              </span>
              {/* Soulignement animé */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="absolute -bottom-3 left-0 h-1 w-full origin-left rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
              />
            </span>
          </motion.h1>

          {/* Subtitle professionnel */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-gray-700 sm:text-2xl"
          >
            ClaritySupport se connecte à Shopify et à vos boîtes mail pour analyser chaque demande, retrouver la bonne commande et proposer une réponse prête à envoyer qui respecte vos politiques et votre ton de marque.
          </motion.p>

          {/* CTA professionnel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <button
              onClick={onGetStarted}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-10 py-5 text-lg font-bold text-white shadow-2xl shadow-blue-600/40 transition-all hover:scale-105 hover:shadow-blue-600/50 active:scale-100"
            >
              <span className="relative z-10">Essayer gratuitement</span>
              <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-2" />
              {/* Effet de brillance */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>
            
            <a
              href="#pricing"
              className="group inline-flex items-center gap-2 rounded-full border-2 border-gray-300 bg-white px-10 py-5 text-lg font-bold text-gray-900 shadow-lg transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
            >
              Découvrir les tarifs
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>

          {/* Trust badges professionnels */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16 flex flex-wrap items-center justify-center gap-8 text-sm"
          >
            {[
              { text: 'Essai gratuit 7 jours', icon: '✓' },
              { text: 'Sans engagement', icon: '✓' },
              { text: 'Configuration en 2 minutes', icon: '✓' }
            ].map((item) => (
              <motion.div 
                key={item.text} 
                className="group flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm transition-all hover:scale-105 hover:border-blue-300 hover:shadow-md"
                whileHover={{ y: -2 }}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">{item.icon}</span>
                <span className="whitespace-nowrap font-semibold text-gray-700">{item.text}</span>
              </motion.div>
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

          {/* Floating badge addictif avec animation pulse */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
            }}
            transition={{ duration: 0.6, delay: 1 }}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2"
          >
            <motion.div 
              animate={{ 
                y: [0, -8, 0],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="group flex items-center gap-3 rounded-full border-2 border-blue-200 bg-white px-6 py-3 shadow-2xl shadow-blue-500/20 transition-all hover:scale-105 hover:shadow-blue-500/30"
            >
              {/* Avatars animés */}
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + i * 0.1 }}
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-cyan-400 transition-transform"
                  />
                ))}
              </div>
              
              {/* Stats avec compteur animé */}
              <div className="border-l-2 border-gray-200 pl-3">
                <p className="text-sm font-bold text-gray-900">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 }}
                  >
                    +10,247
                  </motion.span> emails traités 
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="ml-1 inline-block h-2 w-2 rounded-full bg-green-500"
                  />
                </p>
                <p className="text-xs font-medium text-gray-500">Cette semaine • En direct</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
