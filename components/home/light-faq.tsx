'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'Setup en 2 minutes ? Vous rigolez ?',
    answer:
      'Zéro blague. Connectez Gmail ou Outlook en 3 clics via OAuth 2.0. Pas de config technique. Pas de migration. L\'IA démarre instantanément. Promis.',
  },
  {
    question: 'L\'IA va vraiment comprendre MES clients ?',
    answer:
      'Elle ne devine pas, elle APPREND. Historique, sentiment, contexte, urgence... L\'IA analyse tout et répond exactement comme vous le feriez. Mais en 8 secondes.',
  },
  {
    question: 'Et si je veux arrêter demain matin ?',
    answer:
      '1 clic, c\'est terminé. Pas de période d\'engagement. Pas de pénalités. Pas de rétention de données. Vous partez quand vous voulez. On reste amis.',
  },
  {
    question: 'Mes données sont-elles vraiment protégées ?',
    answer:
      'Chiffrement militaire AES-256. Serveurs européens ISO 27001. RGPD total. Vos données sont plus sécurisées chez nous que dans votre propre ordinateur.',
  },
  {
    question: 'Combien d\'emails puis-je gérer par mois ?',
    answer:
      'Plan STARTER : 5000 emails. PRO : 20 000. SCALE : 50 000+. Au-delà ? Upgrade automatique sans coupure. Vous ne perdez jamais un client.',
  },
  {
    question: 'C\'est compatible avec Shopify/WooCommerce ?',
    answer:
      'Totalement. Tracking de commandes automatique, updates de livraison, upsells intelligents. L\'IA gère tout. Vos clients adorent.',
  },
];

export function LightFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="relative mx-auto max-w-4xl px-6 sm:px-8 lg:px-12">
        {/* Header conversationnel */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-4 text-sm font-bold uppercase tracking-wider text-blue-600">
              🤔 Les vraies questions
            </p>
            <h2 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl">
              Vous vous demandez si
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                ça marche vraiment ?
              </span>
            </h2>
            <p className="text-xl leading-relaxed text-gray-700">
              <span className="font-bold text-gray-900">Réponse honnête :</span> Oui. Voici pourquoi.
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

        {/* Contact CTA magnétique */}
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
              Pas convaincu(e) ? 🤷‍♂️
            </h3>
            <p className="relative mb-8 text-lg leading-relaxed text-gray-700">
              Parlez à un humain (oui, on existe encore). <span className="font-bold text-blue-600">Réponse garantie en moins de 2h.</span>
            </p>
            <button className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-10 py-4 text-lg font-bold text-white shadow-xl shadow-blue-600/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-600/40 active:scale-100">
              <span className="relative z-10">Discutons ensemble</span>
              <span className="relative z-10 transition-transform group-hover/btn:translate-x-1">💬</span>
              {/* Effet de brillance */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
