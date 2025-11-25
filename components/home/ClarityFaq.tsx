'use client';

import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Sparkles } from 'lucide-react';

const faqs = [
  {
    value: 'faq-1',
    question: 'Comment fonctionne le Mail Center ?',
    answer:
      "Le Mail Center centralise tous vos comptes Gmail et Outlook dans une interface unique. Vous pouvez générer des emails avec l'IA GPT-5, organiser vos messages par statuts (en attente, répondus, à traiter), configurer des réponses automatiques, et suivre vos analytics en temps réel.",
  },
  {
    value: 'faq-2',
    question: 'Puis-je connecter plusieurs comptes email ?',
    answer:
      "Oui ! Le plan Gratuit permet 1 compte, le Starter jusqu'à 3 comptes, et le Pro offre des comptes illimités. Vous pouvez connecter des comptes Gmail et Outlook simultanément. La synchronisation est automatique et en temps réel.",
  },
  {
    value: 'faq-3',
    question: 'Comment fonctionnent les réponses automatiques ?',
    answer:
      "Vous configurez des règles avec des conditions (expéditeur, mots-clés, statut). L'IA génère alors automatiquement des réponses personnalisées en utilisant vos templates et variables. Les réponses peuvent être envoyées instantanément ou après validation selon vos préférences.",
  },
  {
    value: 'faq-4',
    question: "Qu'est-ce que l'organisation par statuts ?",
    answer:
      "Le Mail Center vous permet de classer vos emails par statuts : En attente (nouveaux), Répondus, À traiter (prioritaires), ou Archivés. Vous pouvez filtrer, rechercher et visualiser vos emails par statut pour un workflow optimisé. Les statuts se synchronisent sur tous vos appareils.",
  },
  {
    value: 'faq-5',
    question: "Mes données email sont-elles sécurisées ?",
    answer:
      "Absolument. Toutes les connexions utilisent OAuth 2.0 (Gmail/Outlook). Vos emails sont chiffrés bout-en-bout. Nous sommes conformes RGPD. Nous ne stockons jamais vos mots de passe et vous pouvez révoquer l'accès à tout moment. Vos données vous appartiennent.",
  },
];

export function ClarityFaq() {
  return (
    <section className="relative overflow-hidden bg-white py-24 dark:bg-black">
      {/* Decorative elements */}
      <motion.div 
        className="pointer-events-none absolute right-1/4 top-20 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl dark:bg-purple-500/10"
        animate={{
          scale: [1, 1.2, 1],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <div className="relative mx-auto max-w-3xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50 px-4 py-1.5 text-sm font-medium text-gray-700 dark:border-gray-800 dark:from-gray-900 dark:to-purple-950 dark:text-gray-300"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.05 }}
          >
            <HelpCircle className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            FAQ
          </motion.div>
          
          <motion.h2 
            className="mb-4 text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent dark:from-white dark:via-purple-400 dark:to-white">
              Questions fréquentes.
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Tout ce que vous devez savoir sur le Mail Center.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map(({ value, question, answer }, index) => (
              <motion.div
                key={value}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <AccordionItem
                  value={value}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 shadow-sm transition-all hover:shadow-md data-[state=open]:border-purple-200 data-[state=open]:shadow-lg data-[state=open]:shadow-purple-500/10 dark:border-gray-800 dark:bg-gray-900 dark:data-[state=open]:border-purple-900"
                >
                  <AccordionTrigger className="py-6 text-left text-lg font-semibold text-gray-900 transition-colors hover:no-underline group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">
                    <motion.span
                      className="flex items-center gap-3"
                      whileHover={{ x: 5, transition: { duration: 0.2 } }}
                    >
                      <motion.span
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-200 text-sm font-bold text-purple-600 dark:from-purple-950 dark:to-purple-900 dark:text-purple-400"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {index + 1}
                      </motion.span>
                      {question}
                    </motion.span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pl-11 text-gray-600 dark:text-gray-400">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {answer}
                    </motion.div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <motion.div
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-purple-50 px-6 py-4 shadow-lg dark:border-gray-800 dark:from-gray-900 dark:to-purple-950"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.3 }}
          >
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <p className="text-gray-700 dark:text-gray-300">
              Vous avez d&apos;autres questions ?{' '}
              <motion.a
                href="/contact"
                className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contactez-nous
              </motion.a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

