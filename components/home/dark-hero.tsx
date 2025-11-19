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
    <section ref={containerRef} className="relative flex min-h-screen items-center overflow-hidden bg-white dark:bg-[#0A0E27] pt-24 pb-16 lg:pt-0 transition-colors duration-300">
      {/* Grid Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-10 dark:opacity-20 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          
          {/* Left Column: Content */}
          <div className="relative z-20 flex flex-col items-start text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 px-4 py-2 text-sm font-medium backdrop-blur-md"
            >
              <Sparkles className="h-4 w-4" />
              <span>Product of the Week</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 text-5xl font-black leading-[1.1] tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl"
            >
              Transformez votre
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-500 bg-clip-text text-transparent">
                Support en Profit.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-400 sm:text-xl"
            >
              L'IA qui répond, résout et vend pour vous. 24/7.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <button
                onClick={onGetStarted}
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#6366f1] px-8 py-4 text-lg font-bold text-white transition-all hover:bg-[#5558dd] hover:scale-105 active:scale-95"
              >
                Booster mes ventes
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400"
            >
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 dark:text-green-500" />
                <span>Pas de carte requise</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 dark:text-green-500" />
                <span>Essai gratuit 14 jours</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: 3D MacBook Window - Podwise Style */}
          <motion.div
            initial={{ opacity: 0, x: 100, rotateY: -30, rotateX: 15, scale: 0.7 }}
            animate={{ opacity: 1, x: 40, rotateY: -18, rotateX: -5, scale: 1.6 }}
            transition={{ duration: 1, delay: 0.3, type: "spring", stiffness: 60, damping: 25 }}
            style={{ 
              perspective: "1500px",
              transformStyle: "preserve-3d"
            }}
            className="relative hidden lg:block"
          >
            <motion.div 
              className="relative"
              style={{ 
                y,
                opacity
              }}
            >
              {/* Simple Window */}
              <div className="relative rounded-lg overflow-hidden border border-white/10 bg-gray-900/95 shadow-2xl">
                {/* Clean Header */}
                <div className="flex items-center gap-2 border-b border-white/5 bg-gray-800/50 px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  </div>
                  <span className="ml-2 text-xs text-white/40">ClaritySupport</span>
                </div>

                {/* Screenshot */}
                <div className="relative">
                  <img
                    src="/screenshots/mailcenter-interface.png"
                    alt="ClaritySupport Interface"
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
