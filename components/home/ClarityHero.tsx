'use client';

import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { MagneticButton } from './MagneticButton';

interface ClarityHeroProps {
  onGetStarted: () => void;
}

export function ClarityHero({ onGetStarted }: ClarityHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 300 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 300 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section ref={containerRef} className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-white dark:bg-black">
      {/* Animated gradient background */}
      <motion.div 
        className="absolute inset-0 opacity-60 dark:opacity-30"
        style={{
          background: useTransform(
            [smoothMouseX, smoothMouseY],
            (latest: number[]) => `radial-gradient(circle at ${latest[0] * 100}% ${latest[1] * 100}%, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.1) 40%, transparent 70%)`
          ),
        }}
      />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.05),transparent_50%)]" />
      
      {/* Enhanced floating particles with depth */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ y, opacity }}>
        {[...Array(40)].map((_, i) => {
          const size = Math.random() * 3 + 1;
          const depth = Math.random();
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: size,
                height: size,
                background: `radial-gradient(circle, rgba(59, 130, 246, ${0.4 + depth * 0.3}), transparent)`,
                filter: `blur(${depth * 2}px)`,
              }}
              animate={{
                y: [0, -50 * (1 + depth), 0],
                x: [0, Math.sin(i) * 20, 0],
                opacity: [0.2 + depth * 0.3, 0.6 + depth * 0.2, 0.2 + depth * 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </motion.div>
      
      {/* Orbital rings */}
      <motion.div 
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ opacity: useTransform(scrollYProgress, [0, 0.3], [0.3, 0]) }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-blue-500/20"
            style={{
              width: `${300 + i * 200}px`,
              height: `${300 + i * 200}px`,
            }}
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 20 + i * 10, repeat: Infinity, ease: "linear" },
              scale: { duration: 5 + i * 2, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        ))}
      </motion.div>
      
      <motion.div 
        className="relative z-10 mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8 lg:py-20"
        style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '30%']) }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-6 max-w-4xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
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

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-8 max-w-2xl text-base text-gray-600 dark:text-gray-400 sm:mb-10 sm:text-lg md:text-xl"
        >
          IA mailcenter centralise tous vos emails Gmail et Outlook. Générez avec l&rsquo;IA, organisez par statut, répondez automatiquement et gérez toutes vos communications depuis une interface unique.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center justify-center"
        >
          <MagneticButton
            onClick={onGetStarted}
            className="group relative h-11 w-full overflow-hidden rounded-full bg-blue-600 px-6 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md dark:bg-blue-500 dark:hover:bg-blue-600 sm:h-12 sm:w-auto sm:px-8 sm:text-base"
          >
            <span className="relative z-10 flex items-center justify-center">
              Essayer gratuitement
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="group/mockup relative mx-auto mt-8 max-w-5xl perspective-1000 sm:mt-12 lg:mt-16"
          style={{ 
            y: useTransform(scrollYProgress, [0, 1], ['0%', '20%']),
            rotateX: useTransform(scrollYProgress, [0, 1], [0, 5]),
          }}
        >
          <motion.div 
            className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            <div className="flex items-center gap-2 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 dark:border-gray-800 dark:from-gray-900 dark:to-gray-800">
              <div className="flex gap-1.5">
                <motion.div 
                  className="h-3 w-3 rounded-full bg-red-500"
                  whileHover={{ scale: 1.3 }}
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(239, 68, 68, 0.4)",
                      "0 0 0 4px rgba(239, 68, 68, 0)",
                    ],
                  }}
                  transition={{
                    boxShadow: { duration: 1.5, repeat: Infinity },
                  }}
                />
                <motion.div 
                  className="h-3 w-3 rounded-full bg-yellow-500"
                  whileHover={{ scale: 1.3 }}
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(234, 179, 8, 0.4)",
                      "0 0 0 4px rgba(234, 179, 8, 0)",
                    ],
                  }}
                  transition={{
                    boxShadow: { duration: 1.5, repeat: Infinity, delay: 0.5 },
                  }}
                />
                <motion.div 
                  className="h-3 w-3 rounded-full bg-green-500"
                  whileHover={{ scale: 1.3 }}
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(34, 197, 94, 0.4)",
                      "0 0 0 4px rgba(34, 197, 94, 0)",
                    ],
                  }}
                  transition={{
                    boxShadow: { duration: 1.5, repeat: Infinity, delay: 1 },
                  }}
                />
              </div>
              <div className="ml-4 flex-1 rounded-md bg-white px-3 py-1 text-left text-sm text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
                iamailcenter.com/mail-center
              </div>
            </div>
            <motion.div 
              className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950"
              style={{
                y: useTransform(scrollYProgress, [0, 1], ['0%', '-10%']),
              }}
            >
              {/* Animated mesh gradient background */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
                    "radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)",
                    "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
                  ],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Placeholder for product screenshot */}
              <div className="relative z-10 flex h-full items-center justify-center">
                <motion.div 
                  className="text-center"
                  animate={{ 
                    y: [0, -15, 0],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                >
                  <motion.div 
                    className="mb-4 text-6xl"
                    animate={{
                      rotateY: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    ✉️
                  </motion.div>
                  <motion.p 
                    className="text-sm font-medium text-gray-500 dark:text-gray-400"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    Interface Mail Center
                  </motion.p>
                </motion.div>
              </div>
              
              {/* Floating UI elements */}
              <motion.div
                className="absolute left-2 top-2 rounded-lg border border-white bg-white/80 p-2 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80 sm:left-8 sm:top-8 sm:p-3"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 2, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="h-1.5 w-12 rounded bg-blue-500 sm:h-2 sm:w-16" />
                <div className="mt-1.5 h-1 w-8 rounded bg-gray-300 dark:bg-gray-600 sm:mt-2 sm:h-1.5 sm:w-12" />
              </motion.div>
              
              <motion.div
                className="absolute bottom-2 right-2 rounded-lg border border-white bg-white/80 p-2 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80 sm:bottom-8 sm:right-8 sm:p-3"
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -2, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <Sparkles className="h-4 w-4 text-purple-500 sm:h-5 sm:w-5" />
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Multi-layered glow effect */}
          <motion.div 
            className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-blue-600/20 via-purple-600/10 to-transparent blur-3xl dark:from-blue-500/20 dark:via-purple-500/10"
            animate={{
              opacity: [0.4, 0.7, 0.4],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div 
            className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-2xl"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 180, 360],
            }}
            transition={{
              opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 sm:mt-12 sm:gap-8 sm:text-sm"
        >
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="whitespace-nowrap">Gratuit pendant 30 jours</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="whitespace-nowrap">Sans carte bancaire</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="whitespace-nowrap">Support 24/7</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
