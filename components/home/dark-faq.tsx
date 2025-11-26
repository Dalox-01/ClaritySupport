'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'Est-ce que l\'IA va dire n\'importe quoi à mes clients ?',
    answer:
      'Non. Vous gardez le contrôle total. L\'IA apprend de vos réponses passées et de votre base de connaissances. Vous pouvez choisir de valider chaque réponse avant envoi (mode Copilote) ou de laisser l\'IA gérer les questions simples (mode Autopilote).',
  },
  {
    question: 'Est-ce compatible avec Shopify ?',
    answer:
      'Oui, nativement. L\'IA voit les commandes, les statuts de livraison, les numéros de suivi et les stocks en temps réel. Elle peut dire à un client "Votre commande #1234 est en route" sans que vous ayez à chercher.',
  },
  {
    question: 'Est-ce que c\'est difficile à installer ?',
    answer:
      '2 minutes chrono. Connectez votre Gmail/Outlook, connectez Shopify en un clic, et c\'est parti. Pas besoin de développeur.',
  },
  {
    question: 'Est-ce que ça remplace un humain ?',
    answer:
      'Ça remplace les tâches répétitives et chronophages (80% du volume). Votre équipe peut enfin se concentrer sur les cas complexes, les VIP et la stratégie de croissance.',
  },
  {
    question: 'Combien de temps je gagne vraiment ?',
    answer:
      'Nos clients divisent leur temps de support par 5 en moyenne. Si vous passez 2h par jour sur les emails, vous passerez à 20 minutes. Le reste du temps ? Vous le consacrez à vendre.',
  },
  {
    question: 'Puis-je essayer avant de payer ?',
    answer:
      'Oui, vous avez 7 jours d\'essai gratuit avec toutes les fonctionnalités PRO. Aucune carte bancaire n\'est requise pour commencer.',
  },
];

export function DarkFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative overflow-hidden bg-gray-50 py-32 transition-colors duration-300 dark:bg-gradient-to-br dark:from-[#0A0E27] dark:via-[#0f1629] dark:to-[#0A0E27]">
      {/* Background animations */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-3 lg:px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.span
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(6, 182, 212, 0)',
                  '0 0 30px 10px rgba(6, 182, 212, 0.15)',
                  '0 0 0 0 rgba(6, 182, 212, 0)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <HelpCircle className="h-4 w-4" />
              FAQ
            </motion.span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl"
          >
            Questions{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-400">
              fréquentes
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400"
          >
            Tout ce que vous devez savoir sur ClaritySupport
          </motion.p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <motion.div
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:border-blue-200 hover:shadow-lg dark:border-blue-500/10 dark:bg-gradient-to-br dark:from-[#1a1f3a] dark:to-[#0f1320] dark:hover:border-blue-500/30"
                  whileHover={{ scale: 1.01 }}
                  animate={
                    isOpen
                      ? {
                          boxShadow: '0 0 30px rgba(59, 130, 246, 0.15)',
                        }
                      : {}
                  }
                >
                  {/* Question button */}
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-start gap-4 p-6 text-left transition-colors"
                  >
                    {/* Number badge */}
                    <motion.div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 font-bold text-white shadow-lg shadow-blue-500/30 dark:from-blue-500 dark:to-cyan-500"
                      whileHover={{
                        rotate: 360,
                        scale: 1.1,
                        transition: { duration: 0.5 },
                      }}
                      animate={
                        isOpen
                          ? {
                              boxShadow: [
                                '0 10px 30px rgba(59, 130, 246, 0.3)',
                                '0 10px 50px rgba(59, 130, 246, 0.5)',
                                '0 10px 30px rgba(59, 130, 246, 0.3)',
                              ],
                            }
                          : {}
                      }
                      transition={{
                        boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </motion.div>

                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-300">
                        {faq.question}
                      </h3>
                    </div>

                    {/* Toggle icon */}
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="flex-shrink-0"
                    >
                      {isOpen ? (
                        <Minus className="h-6 w-6 text-blue-600 dark:text-cyan-400" />
                      ) : (
                        <Plus className="h-6 w-6 text-gray-400 transition-colors group-hover:text-blue-600 dark:group-hover:text-cyan-400" />
                      )}
                    </motion.div>
                  </button>

                  {/* Answer */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                          opacity: { duration: 0.3 },
                        }}
                        className="overflow-hidden"
                      >
                        <motion.div
                          initial={{ y: -10 }}
                          animate={{ y: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="border-t border-gray-100 px-6 pb-6 pt-4 dark:border-blue-500/10"
                        >
                          <p className="pl-14 text-gray-600 leading-relaxed dark:text-gray-400">{faq.answer}</p>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-12 shadow-lg dark:border-blue-500/20 dark:bg-gradient-to-br dark:from-[#1a1f3a] dark:to-[#0f1320]">
            {/* Animated background */}
            <motion.div
              className="pointer-events-none absolute inset-0"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                ],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative z-10">
              <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Vous avez encore des questions ?
              </h3>
              <p className="mb-8 text-gray-600 dark:text-gray-400">
                Notre équipe est là pour vous aider. Contactez-nous et obtenez une réponse en moins de 24h.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/50 dark:from-blue-500 dark:to-cyan-500 dark:shadow-blue-500/50 dark:hover:shadow-blue-500/70"
              >
                <span className="relative z-10">Contactez le support</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </motion.button>
            </div>

            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="pointer-events-none absolute h-2 w-2 rounded-full bg-blue-400/30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100],
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
