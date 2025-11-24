'use client';

import { ArrowRight, Sparkles, Check } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface DarkHeroProps {
  onGetStarted: () => void;
}

export function DarkHero({ onGetStarted }: DarkHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative flex min-h-screen items-center overflow-hidden bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gray-50 dark:bg-slate-950 transition-colors duration-300" />
        <div className="absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-blue-100/50 blur-3xl dark:bg-blue-500/20" />
        <div className="absolute right-0 bottom-0 h-[36rem] w-[36rem] rounded-full bg-blue-100/40 blur-[160px] dark:bg-blue-600/15" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl 3xl:max-w-[1600px] 4xl:max-w-[1800px] px-4 xxs:px-5 xs:px-6 sm:px-8 lg:px-12 3xl:px-16 4xl:px-20 py-12 xxs:py-16 sm:py-20 3xl:py-28 4xl:py-32">
        <div className="grid items-center gap-8 xxs:gap-10 sm:gap-14 3xl:gap-20 4xl:gap-28 lg:grid-cols-2">

          {/* Left Content */}
          <div className="relative z-20 flex flex-col items-start text-left">

            {/* Main Title - Style Yield */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-4 xxs:mb-5 sm:mb-6 text-3xl xxs:text-4xl xs:text-5xl sm:text-6xl lg:text-7xl 3xl:text-8xl 4xl:text-9xl font-bold leading-tight text-gray-900 dark:text-slate-50"
            >
              Votre équipe <br/>
              <span className="text-gray-500 dark:text-slate-400">support client </span>
              <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-sky-400 dark:to-blue-500">IA Augmentée</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-6 xxs:mb-8 sm:mb-10 max-w-xl 3xl:max-w-2xl 4xl:max-w-3xl text-base xxs:text-lg sm:text-lg 3xl:text-xl 4xl:text-2xl leading-relaxed text-gray-600 dark:text-slate-300"
            >
              ClaritySupport automatise vos réponses emails avec une IA de pointe, 
              analyse le sentiment client en temps réel, et booste votre productivité — 
              grâce à une plateforme intuitive et une méthode orientée impact.
            </motion.p>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-6 xxs:mb-8 sm:mb-10 flex flex-wrap gap-2 xxs:gap-3"
            >
              <div className="flex items-center gap-1.5 xxs:gap-2 rounded-full bg-white/80 px-3 xxs:px-4 sm:px-5 py-2 xxs:py-2.5 sm:py-3 shadow-lg shadow-blue-500/5 border border-gray-200 dark:bg-slate-800/60 dark:shadow-[0_15px_40px_rgba(59,130,246,0.2)] dark:border-slate-700/50 backdrop-blur-sm">
                <div className="flex h-6 w-6 xxs:h-7 xxs:w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <svg className="h-3 w-3 xxs:h-3.5 xxs:w-3.5 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs xxs:text-sm font-medium text-gray-700 dark:text-slate-200">Réponses IA</span>
              </div>
              <div className="flex items-center gap-1.5 xxs:gap-2 rounded-full bg-white/80 px-3 xxs:px-4 sm:px-5 py-2 xxs:py-2.5 sm:py-3 shadow-lg shadow-blue-500/5 border border-gray-200 dark:bg-slate-800/60 dark:shadow-[0_15px_40px_rgba(59,130,246,0.2)] dark:border-slate-700/50 backdrop-blur-sm">
                <div className="flex h-6 w-6 xxs:h-7 xxs:w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-500">
                  <svg className="h-3 w-3 xxs:h-3.5 xxs:w-3.5 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-xs xxs:text-sm font-medium text-gray-700 dark:text-slate-200">Analytics Avancés</span>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <button
                onClick={onGetStarted}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-blue-700 px-6 xxs:px-7 sm:px-8 py-3 xxs:py-3.5 sm:py-4 text-sm xxs:text-base font-semibold text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/20 dark:shadow-[0_20px_45px_rgba(37,99,235,0.35)]"
              >
                <span>Lancer ClaritySupport</span>
                <ArrowRight className="h-4 w-4 xxs:h-5 xxs:w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>

          {/* Right Side - Product Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative flex items-center justify-center lg:justify-end mt-8 lg:mt-0"
            style={{ 
              y,
              opacity
            }}
          >
            {/* Modern Window - Clean & Professional - AGRANDI */}
            <div className="relative w-full max-w-[120rem] 3xl:max-w-[140rem] 4xl:max-w-[160rem] hidden xs:block" style={{ perspective: '2500px' }}>
              {/* Glow effect behind */}
              <div 
                className="pointer-events-none absolute -inset-8 lg:-inset-12 rounded-[40px] bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl dark:from-blue-500/30 dark:to-blue-600/25" 
                style={{ transform: 'rotateY(-18deg) rotateX(3deg) scale(1.15)' }}
              />
              
              <div 
                className="relative overflow-hidden rounded-2xl lg:rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-slate-700/50 dark:bg-slate-900 dark:shadow-[0_50px_140px_-45px_rgba(59,130,246,0.6)]"
                style={{ 
                  transform: 'rotateY(-18deg) rotateX(3deg) scale(1.3) sm:scale(1.5) lg:scale(1.75) 3xl:scale(2) 4xl:scale(2.2) translateX(0) lg:translateX(-40px) 3xl:translateX(-60px)', 
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center left'
                }}
              >
                {/* Window Header - macOS style */}
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-3 py-2 backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57] border border-[#E0443E]/50" />
                      <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E] border border-[#D89E24]/50" />
                      <div className="h-2.5 w-2.5 rounded-full bg-[#28C840] border border-[#1AAB29]/50" />
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-1.5 rounded bg-white px-2 py-0.5 text-[10px] font-medium text-gray-500 shadow-sm border border-gray-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700">
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      claritysupport.app
                    </div>
                  </div>
                  <div className="w-12" /> {/* Spacer for centering */}
                </div>

                {/* Screenshot Area */}
                <div className="relative bg-white dark:bg-slate-900">
                  <img
                    src="/screenshots/mailcenter-interface.png"
                    alt="Interface ClaritySupport Mail Center"
                    className="w-full h-auto object-cover"
                  />
                  {/* Subtle overlay for depth */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-slate-800/5 dark:from-blue-500/15 dark:to-slate-800/20" />
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-32 -right-32 h-80 w-80 lg:h-96 lg:w-96 rounded-full bg-blue-200/30 blur-[120px] dark:bg-blue-500/25 dark:blur-[140px]" />
              <div className="absolute bottom-16 -left-24 h-72 w-72 lg:h-80 lg:w-80 rounded-full bg-cyan-200/30 blur-[100px] dark:bg-blue-600/20 dark:blur-[120px]" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
