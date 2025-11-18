'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

const proofPoints = [
  'Réponses en < 1 minute',
  'Augmentation du panier moyen',
  'Satisfaction client 5/5',
  'Intégration Shopify native',
];

export function ProofSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white py-16 dark:bg-black sm:py-20 lg:py-24">
      {/* Animated background elements */}
      <motion.div 
        className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10"
        style={{ y, opacity }}
      />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div 
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-1.5 text-sm font-medium text-gray-700 dark:border-gray-800 dark:from-gray-900 dark:to-blue-950 dark:text-gray-300"
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(59, 130, 246, 0.2)",
                  "0 0 20px 2px rgba(59, 130, 246, 0.1)",
                  "0 0 0 0 rgba(59, 130, 246, 0.2)",
                ],
              }}
              transition={{
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              En action
            </motion.div>
            
            <motion.h2 
              className="mb-6 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              L'expérience client qui
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                fait revenir vos acheteurs.
              </span>
            </motion.h2>
            
            <motion.p 
              className="mb-8 text-base text-gray-600 dark:text-gray-400 sm:text-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              Vos clients n'attendent pas. Ils veulent des réponses immédiates et précises. ClaritySupport leur donne exactement ça, tout en boostant votre image de marque.
            </motion.p>

            <ul className="mb-8 space-y-4">
              {proofPoints.map((point, index) => (
                <motion.li 
                  key={point} 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.3 + index * 0.1, 
                    ease: [0.22, 1, 0.36, 1] 
                  }}
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <motion.div 
                    className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-950 dark:to-blue-900"
                    whileHover={{ 
                      scale: 1.2, 
                      rotate: 360,
                      transition: { duration: 0.4 } 
                    }}
                  >
                    <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" strokeWidth={3} />
                  </motion.div>
                  <span className="text-gray-700 dark:text-gray-300">{point}</span>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Button
                size="lg"
                variant="outline"
                className="group relative h-12 overflow-hidden rounded-full border-gray-300 px-8 text-base font-medium transition-all hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-900"
              >
                <span className="relative z-10 flex items-center">
                  Découvrir toutes les fonctionnalités
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30, rotateY: -10 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
            style={{ perspective: "1000px" }}
          >
            <motion.div 
              className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950"
              whileHover={{ 
                scale: 1.02,
                rotateY: 2,
                transition: { duration: 0.4 }
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 dark:border-gray-800 dark:from-gray-900 dark:to-gray-800">
                <div className="flex gap-1.5">
                  <motion.div 
                    className="h-3 w-3 rounded-full bg-red-500"
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(239, 68, 68, 0.4)",
                        "0 0 0 4px rgba(239, 68, 68, 0)",
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div 
                    className="h-3 w-3 rounded-full bg-yellow-500"
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(234, 179, 8, 0.4)",
                        "0 0 0 4px rgba(234, 179, 8, 0)",
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  />
                  <motion.div 
                    className="h-3 w-3 rounded-full bg-green-500"
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(34, 197, 94, 0.4)",
                        "0 0 0 4px rgba(34, 197, 94, 0)",
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                  />
                </div>
                <div className="ml-4 flex-1 rounded-md bg-white px-3 py-1 text-left text-sm text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
                  iamailcenter.com/mail-center
                </div>
              </div>

              {/* Content */}
              <div className="relative p-8">
                {/* Background gradient animation */}
                <motion.div
                  className="pointer-events-none absolute inset-0"
                  animate={{
                    background: [
                      "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)",
                      "radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.05) 0%, transparent 50%)",
                      "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)",
                    ],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                
                <div className="relative mb-6">
                  <motion.div 
                    className="mb-2 h-3 w-32 rounded-full bg-gray-200 dark:bg-gray-800"
                    initial={{ width: 0 }}
                    whileInView={{ width: 128 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                  <motion.div 
                    className="mb-4 h-8 w-full rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    style={{ originX: 0 }}
                  />
                  <div className="space-y-2">
                    {[1, 0.83, 0.67].map((width, index) => (
                      <motion.div
                        key={index}
                        className="h-3 rounded-full bg-gray-200 dark:bg-gray-800"
                        style={{ width: `${width * 100}%`, originX: 0 }}
                        initial={{ scaleX: 0, opacity: 0 }}
                        whileInView={{ scaleX: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                      />
                    ))}
                  </div>
                </div>

                <motion.div 
                  className="relative rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:border-blue-900 dark:from-blue-950/50 dark:to-blue-900/30"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.8,
                    boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(59, 130, 246, 0.2)",
                      "0 0 20px 2px rgba(59, 130, 246, 0.1)",
                      "0 0 0 0 rgba(59, 130, 246, 0.2)",
                    ],
                  }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <motion.div 
                      className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [1, 0.7, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div 
                      className="h-2 rounded-full bg-blue-300 dark:bg-blue-800"
                      initial={{ width: 0 }}
                      whileInView={{ width: 80 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 1 }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <motion.div 
                      className="h-2 w-full rounded-full bg-blue-200 dark:bg-blue-900"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 1.1 }}
                      style={{ originX: 0 }}
                    />
                    <motion.div 
                      className="h-2 w-4/5 rounded-full bg-blue-200 dark:bg-blue-900"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                      style={{ originX: 0 }}
                    />
                  </div>
                </motion.div>

                <motion.div 
                  className="mt-6 flex gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 1.3 }}
                >
                  <motion.div 
                    className="h-10 flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg dark:from-blue-500 dark:to-blue-600"
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)" }}
                  />
                  <motion.div 
                    className="h-10 w-10 rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Enhanced floating annotations */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: 0.5, 
                type: "spring", 
                stiffness: 200,
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
              animate={{
                y: [0, -10, 0],
              }}
              className="absolute -right-4 top-20 rounded-xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 px-4 py-2 text-sm font-medium text-gray-900 shadow-xl backdrop-blur-sm dark:border-blue-900 dark:from-gray-900 dark:to-blue-950 dark:text-white"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Vente sauvée !
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: 0.7, 
                type: "spring", 
                stiffness: 200,
                y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
              }}
              animate={{
                y: [0, 10, 0],
              }}
              className="absolute -left-4 bottom-32 rounded-xl border border-purple-200 bg-gradient-to-br from-white to-purple-50 px-4 py-2 text-sm font-medium text-gray-900 shadow-xl backdrop-blur-sm dark:border-purple-900 dark:from-gray-900 dark:to-purple-950 dark:text-white"
            >
              ❤️ Client ravi
            </motion.div>
            
            {/* Glow effect */}
            <motion.div 
              className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-2xl"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

