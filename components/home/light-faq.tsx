'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'Comment fonctionne l\'intégration avec mes comptes email ?',
    answer:
      'ClaritySupport se connecte de manière sécurisée via OAuth 2.0 à vos comptes Gmail et Outlook. La configuration prend moins de 2 minutes et ne nécessite aucune compétence technique. Vos identifiants ne sont jamais stockés.',
  },
  {
    question: 'L\'IA peut-elle vraiment comprendre le contexte de mes emails ?',
    answer:
      'Notre intelligence artificielle analyse l\'historique des conversations, le sentiment du client et le contexte métier pour générer des réponses précises et personnalisées. Elle s\'adapte progressivement au ton de votre entreprise.',
  },
  {
    question: 'Puis-je annuler mon abonnement à tout moment ?',
    answer:
      'Absolument. Aucun engagement de durée. Vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord, sans frais de résiliation ni période minimale.',
  },
  {
    question: 'Comment sont sécurisées les données de mes clients ?',
    answer:
      'Nous appliquons les plus hauts standards de sécurité : chiffrement AES-256 de bout en bout, conformité RGPD totale, hébergement sur serveurs européens certifiés ISO 27001. Vos données sont protégées avec le même niveau de sécurité que les institutions bancaires.',
  },
  {
    question: 'Combien de comptes email puis-je connecter ?',
    answer:
      'Le nombre de comptes dépend de votre forfait : 3 comptes pour le plan STARTER, 10 pour le PRO, et illimité pour le SCALE. Vous pouvez librement combiner Gmail et Outlook.',
  },
  {
    question: 'Proposez-vous une intégration API ?',
    answer:
      'Oui. Les plans PRO et SCALE incluent un accès complet à notre API REST et système de webhooks, avec documentation technique détaillée et support développeur dédié.',
  },
];

export function LightFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="relative mx-auto max-w-4xl px-6 sm:px-8 lg:px-12">
        {/* Header professionnel */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-4 text-sm font-bold uppercase tracking-wider text-blue-600">
              Questions Fréquentes
            </p>
            <h2 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl">
              Tout Ce Que Vous
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Devez Savoir
              </span>
            </h2>
            <p className="text-xl leading-relaxed text-gray-700">
              Des réponses claires à vos questions
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

        {/* Contact CTA professionnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="group relative overflow-hidden rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 p-12 shadow-xl transition-all hover:scale-[1.02] hover:border-blue-300 hover:shadow-2xl">
            {/* Effet de brillance */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/20 to-transparent" />
            </div>
            
            <h3 className="relative mb-4 text-3xl font-extrabold text-gray-900">
              Vous avez d'autres questions ?
            </h3>
            <p className="relative mb-8 text-lg leading-relaxed text-gray-700">
              Notre équipe est disponible pour vous accompagner. <span className="font-bold text-blue-600">Réponse sous 2 heures</span> en moyenne.
            </p>
            <button className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-10 py-4 text-lg font-bold text-white shadow-xl shadow-blue-600/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-600/40 active:scale-100">
              <span className="relative z-10">Contactez notre équipe</span>
              <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
              {/* Effet de brillance */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
