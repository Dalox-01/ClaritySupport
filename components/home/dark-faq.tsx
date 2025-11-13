'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'Comment fonctionne la synchronisation des emails ?',
    answer:
      'ClaritySupport se connecte de manière sécurisée à vos comptes Gmail et Outlook via OAuth 2.0. Vos emails sont synchronisés en temps réel et stockés de manière chiffrée. Nous ne conservons jamais vos mots de passe et respectons les standards de sécurité les plus élevés.',
  },
  {
    question: 'L\'IA peut-elle vraiment comprendre le contexte de mes emails de support ?',
    answer:
      'Absolument ! Notre IA analyse le contexte, l\'historique des conversations et le sentiment du client pour générer des réponses précises et personnalisées. Elle s\'adapte au ton de votre entreprise et apprend de vos corrections pour s\'améliorer continuellement.',
  },
  {
    question: 'Puis-je annuler mon abonnement à tout moment ?',
    answer:
      'Oui, sans aucun engagement. Vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. Aucun frais caché, aucune période d\'engagement minimum. Vos données restent accessibles pendant 30 jours après l\'annulation pour faciliter votre transition.',
  },
  {
    question: 'Mes données clients sont-elles sécurisées ?',
    answer:
      'La sécurité est notre priorité absolue. Nous utilisons un chiffrement AES-256 de bout en bout, une authentification à deux facteurs optionnelle, et sommes conformes au RGPD. Vos données sont hébergées en Europe sur des serveurs certifiés ISO 27001. Vos clients sont protégés.',
  },
  {
    question: 'Combien de boîtes mail puis-je connecter ?',
    answer:
      'Cela dépend de votre plan : le plan FREE permet 1 compte, le plan STARTER permet 3 comptes, et le plan PRO permet un nombre illimité de comptes email. Vous pouvez librement mélanger Gmail, Outlook et autres fournisseurs.',
  },
  {
    question: 'Proposez-vous une API pour intégrer ClaritySupport à mes outils ?',
    answer:
      'Oui ! Le plan PRO inclut un accès complet à notre API REST et aux webhooks. Intégrez ClaritySupport à votre CRM, helpdesk ou outils internes pour automatiser vos workflows. Documentation technique complète et support développeur disponibles.',
  },
];

export function DarkFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0A0E27] via-[#0f1629] to-[#0A0E27] py-32">
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

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.span
              className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300"
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
            className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            Questions{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              fréquentes
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-400"
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
                  className="overflow-hidden rounded-2xl border border-blue-500/10 bg-gradient-to-br from-[#1a1f3a] to-[#0f1320] transition-all duration-300 hover:border-blue-500/30"
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
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 font-bold text-white shadow-lg shadow-blue-500/30"
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
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
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
                        <Minus className="h-6 w-6 text-cyan-400" />
                      ) : (
                        <Plus className="h-6 w-6 text-gray-400 group-hover:text-cyan-400 transition-colors" />
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
                          className="border-t border-blue-500/10 px-6 pb-6 pt-4"
                        >
                          <p className="pl-14 text-gray-400 leading-relaxed">{faq.answer}</p>
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
          <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#1a1f3a] to-[#0f1320] p-12">
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
              <h3 className="mb-4 text-2xl font-bold text-white">
                Vous avez encore des questions ?
              </h3>
              <p className="mb-8 text-gray-400">
                Notre équipe est là pour vous aider. Contactez-nous et obtenez une réponse en moins de 24h.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-4 font-bold text-white shadow-lg shadow-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/70"
              >
                <span className="relative z-10">Contactez le support</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500"
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
