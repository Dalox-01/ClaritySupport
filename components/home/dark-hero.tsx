'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Check } from 'lucide-react';
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

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0A0E27] via-[#0F1629] to-[#0A0E27] pt-24 pb-16"
    >
      {/* Subtle animated grid background */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '60px 60px'],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Subtle gradient orbs */}
      <motion.div
        className="pointer-events-none absolute left-1/3 top-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="pointer-events-none absolute bottom-1/4 right-1/3 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1.5,
        }}
      />

      {/* Main content - perfectly centered */}
      <motion.div
        className="relative z-10 mx-auto w-full max-w-7xl px-6 text-center sm:px-8 lg:px-12"
        style={{ y, scale }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 backdrop-blur-sm"
        >
          <Sparkles className="h-4 w-4" />
          <span>Support client automatisé par IA</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-6 text-5xl font-black leading-tight tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        >
          <span
            className="inline-block bg-gradient-to-r from-[#0EA5E9] to-[#3B82F6] bg-clip-text text-transparent"
            style={{ 
              letterSpacing: '-0.02em',
            }}
          >
            ClaritySupport
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-gray-300 sm:text-2xl md:leading-relaxed"
        >
          Centralisez tous vos emails Gmail et Outlook. Générez des réponses avec l&apos;IA,
          organisez par statut et automatisez votre support client.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mb-10 flex justify-center"
        >
          <motion.button
            onClick={onGetStarted}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-10 py-5 text-lg font-bold text-white shadow-xl shadow-blue-500/30 transition-shadow hover:shadow-2xl hover:shadow-blue-500/40"
          >
            <span className="relative z-10 flex items-center gap-3">
              Essayer gratuitement
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.4 }}
            />
          </motion.button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mb-20 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400"
        >
          {[
            { text: 'Gratuit pendant 30 jours', delay: 0 },
            { text: 'Sans carte bancaire', delay: 0.1 },
            { text: 'Support 24/7', delay: 0.2 },
          ].map((item) => (
            <motion.div
              key={item.text}
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + item.delay, duration: 0.5 }}
            >
              <Check className="h-5 w-5 flex-shrink-0 text-cyan-400" />
              <span className="whitespace-nowrap">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Mockup - clean and professional */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="relative mx-auto max-w-6xl"
          style={{
            y: useTransform(scrollYProgress, [0, 1], ['0%', '12%']),
          }}
        >
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-[#1a1f3a]/90 to-[#0f1320]/90 shadow-2xl shadow-blue-500/10 backdrop-blur-sm"
          >
            {/* Window controls */}
            <div className="flex items-center gap-3 border-b border-blue-500/10 bg-gradient-to-r from-[#0f1320]/80 to-[#1a1f3a]/80 px-6 py-4 backdrop-blur-md">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <div className="ml-6 flex-1 rounded-lg border border-blue-500/10 bg-[#0A0E27]/50 px-4 py-2.5 text-left text-sm text-gray-400 backdrop-blur-sm">
                claritysupport.com/mail-center
              </div>
            </div>

            {/* Screenshot content */}
            <div className="relative aspect-[16/9] bg-gradient-to-br from-[#0A0E27] via-[#0f1629] to-[#0A0E27] p-12">
              {/* Subtle background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />

              {/* Center content */}
              <div className="relative z-10 flex h-full flex-col items-center justify-center">
                <motion.div
                  className="mb-6 text-9xl"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  ✉️
                </motion.div>
                <p className="text-base font-medium text-blue-400/80">
                  Interface Mail Center
                </p>
              </div>

              {/* Floating UI elements - minimal and elegant */}
              <motion.div
                className="absolute left-[8%] top-[12%] rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 p-4 backdrop-blur-md"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="h-2.5 w-24 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" />
                <div className="mt-2.5 h-2 w-16 rounded-full bg-blue-500/30" />
              </motion.div>

              <motion.div
                className="absolute right-[8%] bottom-[15%] rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 p-4 backdrop-blur-md"
                animate={{
                  y: [0, -12, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              >
                <Sparkles className="h-7 w-7 text-cyan-400/80" />
              </motion.div>

              <motion.div
                className="absolute left-1/2 top-[8%] -translate-x-1/2 rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-3 backdrop-blur-md"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
              >
                <Zap className="h-6 w-6 text-blue-400/80" />
              </motion.div>
            </div>
          </motion.div>

          {/* Subtle glow */}
          <motion.div
            className="pointer-events-none absolute inset-0 -z-10 rounded-2xl blur-3xl"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background:
                'radial-gradient(ellipse, rgba(59, 130, 246, 0.25), rgba(6, 182, 212, 0.15) 50%, transparent 70%)',
            }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
