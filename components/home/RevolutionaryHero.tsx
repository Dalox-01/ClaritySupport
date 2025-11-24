'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { useRef } from 'react';
import { LiquidButton } from '@/components/ui/liquid-button';
import { ParticleSystem } from '@/components/ui/particle-system';
import { TextReveal } from '@/components/ui/text-reveal';

interface RevolutionaryHeroProps {
  onGetStarted: () => void;
}

export function RevolutionaryHero({ onGetStarted }: RevolutionaryHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#E8E2D0] via-[#F5F1E7] to-[#E8E2D0]"
    >
      {/* Animated SVG blob background */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{ y, opacity: useTransform(scrollYProgress, [0, 0.3], [1, 0]) }}
      >
        <svg
          className="h-full w-full"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            fill="url(#blobGradient)"
            animate={{
              d: [
                'M45,-65C56,-55,62,-40,65,-25C68,-10,68,5,62,18C56,31,44,42,31,50C18,58,4,63,-11,65C-26,67,-42,66,-54,58C-66,50,-74,35,-75,20C-76,5,-70,-10,-63,-24C-56,-38,-48,-51,-37,-61C-26,-71,-13,-78,1,-80C15,-82,34,-75,45,-65Z',
                'M37,-55C48,-44,57,-33,62,-19C67,-5,68,12,63,27C58,42,47,55,34,61C21,67,6,66,-10,66C-26,66,-43,67,-56,60C-69,53,-78,38,-80,22C-82,6,-77,-11,-69,-25C-61,-39,-50,-50,-38,-60C-26,-70,-13,-79,2,-82C17,-85,26,-66,37,-55Z',
                'M42,-58C53,-48,60,-34,63,-19C66,-4,65,12,59,26C53,40,42,52,29,58C16,64,1,64,-15,64C-31,64,-48,64,-61,56C-74,48,-83,32,-85,15C-87,-2,-82,-20,-73,-34C-64,-48,-51,-58,-37,-62C-23,-66,-8,-64,6,-72C20,-80,31,-68,42,-58Z',
                'M45,-65C56,-55,62,-40,65,-25C68,-10,68,5,62,18C56,31,44,42,31,50C18,58,4,63,-11,65C-26,67,-42,66,-54,58C-66,50,-74,35,-75,20C-76,5,-70,-10,-63,-24C-56,-38,-48,-51,-37,-61C-26,-71,-13,-78,1,-80C15,-82,34,-75,45,-65Z',
              ],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <defs>
            <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E6F5C" />
              <stop offset="100%" stopColor="#26AB8C" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Particle system - floating emails */}
      <ParticleSystem type="emails" count={25} />

      <motion.div
        className="relative z-10 mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8"
        style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '25%']), scale }}
      >
        {/* Title with letter reveal */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        >
          <span
            className="inline-block bg-gradient-to-r from-[#0EA5E9] to-[#3B82F6] bg-clip-text text-transparent"
            style={{ 
              fontSize: '1.1em',
              fontWeight: 900,
              letterSpacing: '-0.02em',
            }}
          >
            ClaritySupport
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-10 max-w-2xl text-lg text-[#6B4F3A]/80 sm:text-xl"
        >
          IA mailcenter centralise tous vos emails Gmail et Outlook. Générez avec l&rsquo;IA,
          organisez par statut, répondez automatiquement et gérez toutes vos communications depuis
          une interface unique.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center justify-center"
        >
          <LiquidButton
            variant="primary"
            size="lg"
            onClick={onGetStarted}
            magnetic
            ripple
            className="w-full sm:w-auto"
          >
            Essayer gratuitement
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </LiquidButton>
        </motion.div>

        {/* Mockup Window */}
        <motion.div
          initial={{ opacity: 0, y: 80, rotateX: 15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="group/mockup relative mx-auto mt-16 max-w-5xl"
          style={{
            y: useTransform(scrollYProgress, [0, 1], ['0%', '15%']),
            rotateX: useTransform(scrollYProgress, [0, 1], [0, 3]),
            transformStyle: 'preserve-3d',
          }}
        >
          <motion.div
            className="relative overflow-hidden rounded-2xl border-2 border-[#E8E2D0] bg-white shadow-2xl shadow-[#1E6F5C]/10"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Window controls */}
            <div className="flex items-center gap-2 border-b border-[#E8E2D0] bg-gradient-to-r from-[#F5F1E7] to-[#E8E2D0] px-5 py-4">
              <div className="flex gap-2">
                {['bg-red-500', 'bg-yellow-500', 'bg-green-500'].map((color, i) => (
                  <motion.div
                    key={color}
                    className={`h-3 w-3 rounded-full ${color}`}
                    whileHover={{ scale: 1.4 }}
                    animate={{
                      boxShadow: [
                        `0 0 0 0 ${color.replace('bg-', 'rgba(').replace('-500', ', 0.4)')}`,
                        `0 0 0 4px ${color.replace('bg-', 'rgba(').replace('-500', ', 0)')}`,
                      ],
                    }}
                    transition={{
                      boxShadow: { duration: 1.5, repeat: Infinity, delay: i * 0.5 },
                    }}
                  />
                ))}
              </div>
              <div className="ml-6 flex-1 rounded-lg bg-white px-4 py-2 text-left text-sm text-[#6B4F3A]/60 shadow-sm">
                iamailcenter.com/mail-center
              </div>
            </div>

            {/* Screenshot placeholder with gradient animation */}
            <div className="relative aspect-video bg-gradient-to-br from-[#E8E2D0] via-[#F5F1E7] to-[#E8E2D0]">
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    'radial-gradient(circle at 20% 50%, rgba(30, 111, 92, 0.1) 0%, transparent 50%)',
                    'radial-gradient(circle at 80% 50%, rgba(38, 171, 140, 0.1) 0%, transparent 50%)',
                    'radial-gradient(circle at 20% 50%, rgba(30, 111, 92, 0.1) 0%, transparent 50%)',
                  ],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />

              <div className="relative z-10 flex h-full items-center justify-center">
                <motion.div
                  className="text-center"
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <motion.div
                    className="mb-4 text-7xl"
                    animate={{
                      rotateY: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    ✉️
                  </motion.div>
                  <motion.p
                    className="text-sm font-medium text-[#6B4F3A]/60"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    Interface Mail Center
                  </motion.p>
                </motion.div>
              </div>

              {/* Floating UI elements */}
              {[
                { x: '8%', y: '10%', delay: 0, size: 'large' },
                { x: '85%', y: '75%', delay: 0.5, size: 'small' },
              ].map((pos, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-xl border border-white bg-white/90 p-3 shadow-lg backdrop-blur-sm"
                  style={{ left: pos.x, top: pos.y }}
                  animate={{
                    y: [0, -12, 0],
                    rotate: [0, i === 0 ? 2 : -2, 0],
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: pos.delay,
                  }}
                >
                  {pos.size === 'large' ? (
                    <>
                      <div className="h-2 w-16 rounded bg-[#1E6F5C]" />
                      <div className="mt-2 h-1.5 w-12 rounded bg-[#E8E2D0]" />
                    </>
                  ) : (
                    <Sparkles className="h-5 w-5 text-[#26AB8C]" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Multi-layer glow */}
          <motion.div
            className="pointer-events-none absolute inset-0 -z-10 rounded-3xl blur-3xl"
            animate={{
              opacity: [0.4, 0.7, 0.4],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: 'radial-gradient(ellipse, rgba(30, 111, 92, 0.3), transparent 70%)',
            }}
          />
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-[#6B4F3A]/60"
        >
          {[
            'Gratuit pendant 30 jours',
            'Sans carte bancaire',
            'Support 24/7',
          ].map((text, i) => (
            <div key={text} className="flex items-center gap-2">
              <motion.svg
                className="h-5 w-5 flex-shrink-0 text-[#26AB8C]"
                fill="currentColor"
                viewBox="0 0 20 20"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 2 + i * 0.1, type: 'spring', stiffness: 200 }}
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </motion.svg>
              <span className="whitespace-nowrap">{text}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
