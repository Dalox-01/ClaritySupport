'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'Comment fonctionne la synchronisation des emails ?',
    answer:
      'ClaritySupport se connecte de manière sécurisée à vos comptes Gmail et Outlook via OAuth 2.0. Vos emails sont synchronisés en temps réel et stockés de manière chiffrée. Nous ne conservons jamais vos mots de passe.',
  },
  {
    question: 'L\'IA peut-elle vraiment comprendre le contexte de mes emails ?',
    answer:
      'Absolument ! Notre IA analyse le contexte, l\'historique des conversations et le sentiment du client pour générer des réponses précises et personnalisées. Elle s\'adapte au ton de votre entreprise.',
  },
  {
    question: 'Puis-je annuler mon abonnement à tout moment ?',
    answer:
      'Oui, sans aucun engagement. Vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. Aucun frais caché, aucune période d\'engagement minimum.',
  },
  {
    question: 'Mes données clients sont-elles sécurisées ?',
    answer:
      'La sécurité est notre priorité absolue. Nous utilisons un chiffrement AES-256 de bout en bout, et sommes conformes au RGPD. Vos données sont hébergées en Europe sur des serveurs certifiés ISO 27001.',
  },
  {
    question: 'Combien de boîtes mail puis-je connecter ?',
    answer:
      'Cela dépend de votre plan : le plan STARTER permet 3 comptes, le plan PRO permet 10 comptes, et le plan SCALE permet un nombre illimité. Vous pouvez librement mélanger Gmail et Outlook.',
  },
  {
    question: 'Proposez-vous une API pour intégrer ClaritySupport ?',
    answer:
      'Oui ! Les plans PRO et SCALE incluent un accès complet à notre API REST et aux webhooks. Documentation technique complète et support développeur disponibles.',
  },
];

export function LightFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="relative mx-auto max-w-4xl px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-600">
              FAQ
            </p>
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Questions fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir sur ClaritySupport
            </p>
          </motion.div>
        </div>

        {/* FAQ Items */}
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
              >
                <div
                  className={`overflow-hidden rounded-2xl border-2 bg-white transition-all duration-300 ${
                    isOpen
                      ? 'border-blue-600 shadow-lg shadow-blue-600/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Question */}
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 p-6 text-left transition-colors"
                  >
                    <span className={`text-lg font-semibold ${
                      isOpen ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {faq.question}
                    </span>

                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      {isOpen ? (
                        <Minus className="h-5 w-5 text-blue-600" strokeWidth={2.5} />
                      ) : (
                        <Plus className="h-5 w-5 text-gray-400" strokeWidth={2.5} />
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
                          height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                          opacity: { duration: 0.2 },
                        }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-100 px-6 pb-6 pt-4">
                          <p className="leading-relaxed text-gray-600">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50 to-transparent p-12">
            <h3 className="mb-4 text-2xl font-bold text-gray-900">
              Vous avez encore des questions ?
            </h3>
            <p className="mb-6 text-gray-600">
              Notre équipe est là pour vous aider. Contactez-nous et obtenez une réponse en moins de 24h.
            </p>
            <button className="inline-flex items-center gap-2 rounded-full border-2 border-blue-600 bg-white px-8 py-4 text-base font-semibold text-blue-600 transition-all hover:bg-blue-600 hover:text-white active:scale-[0.98]">
              Contactez le support
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
