'use client';

import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Sparkles } from 'lucide-react';

const faqs = [
  {
    value: 'faq-1',
    question: 'Comment fonctionne le Mail Center ?',
    answer:
      "Le Mail Center centralise tous vos comptes Gmail et Outlook dans une interface unique. Vous pouvez générer des emails avec l&apos;IA GPT-5, organiser vos messages par statuts (en attente, répondus, à traiter), configurer des réponses automatiques, et suivre vos analytics en temps réel.",
  },
  {
    value: 'faq-2',
    question: 'Puis-je connecter plusieurs comptes email ?',
    answer:
      "Oui ! Le plan Gratuit permet 1 compte, le Starter jusqu&apos;à 3 comptes, et le Pro offre des comptes illimités. Vous pouvez connecter des comptes Gmail et Outlook simultanément. La synchronisation est automatique et en temps réel.",
  },
  {
    value: 'faq-3',
    question: 'Comment fonctionnent les réponses automatiques ?',
    answer:
      "Vous configurez des règles avec des conditions (expéditeur, mots-clés, statut). L&apos;IA génère alors automatiquement des réponses personnalisées en utilisant vos templates et variables. Les réponses peuvent être envoyées instantanément ou après validation selon vos préférences.",
  },
  {
    value: 'faq-4',
    question: "Qu&apos;est-ce que l&apos;organisation par statuts ?",
    answer:
      "Le Mail Center vous permet de classer vos emails par statuts : En attente (nouveaux), Répondus, À traiter (prioritaires), ou Archivés. Vous pouvez filtrer, rechercher et visualiser vos emails par statut pour un workflow optimisé. Les statuts se synchronisent sur tous vos appareils.",
  },
  {
    value: 'faq-5',
    question: "Mes données email sont-elles sécurisées ?",
    answer:
      "Absolument. Toutes les connexions utilisent OAuth 2.0 (Gmail/Outlook). Vos emails sont chiffrés bout-en-bout. Nous sommes conformes RGPD. Nous ne stockons jamais vos mots de passe et vous pouvez révoquer l&apos;accès à tout moment. Vos données vous appartiennent.",
  },
];

export function RevolutionaryFaq() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F5F1E7] to-white py-24 sm:py-32">
      {/* Decorative elements */}
      <motion.div
        className="pointer-events-none absolute right-1/4 top-20 h-72 w-72 rounded-full bg-[#1E6F5C]/5 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-[#1E6F5C]/20 bg-white px-5 py-2 text-sm font-medium text-[#6B4F3A]"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
          >
            <HelpCircle className="h-4 w-4 text-[#1E6F5C]" />
            FAQ
          </motion.div>

          <motion.h2
            className="mb-4 text-4xl font-bold tracking-tight text-[#6B4F3A] sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Questions{' '}
            <span className="bg-gradient-to-r from-[#1E6F5C] to-[#26AB8C] bg-clip-text text-transparent">
              fréquentes.
            </span>
          </motion.h2>

          <motion.p
            className="text-lg text-[#6B4F3A]/70"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Tout ce que vous devez savoir sur le Mail Center.
          </motion.p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map(({ value, question, answer }, index) => (
              <motion.div
                key={value}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: 0.4 + index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <AccordionItem
                  value={value}
                  className="group overflow-hidden rounded-2xl border-2 border-[#E8E2D0] bg-white px-6 shadow-sm transition-all hover:border-[#1E6F5C]/30 hover:shadow-lg hover:shadow-[#1E6F5C]/10 data-[state=open]:border-[#1E6F5C]/40 data-[state=open]:shadow-xl data-[state=open]:shadow-[#1E6F5C]/20"
                >
                  <AccordionTrigger className="py-6 text-left text-lg font-bold text-[#6B4F3A] transition-colors hover:no-underline group-hover:text-[#1E6F5C]">
                    <motion.span
                      className="flex items-center gap-3"
                      whileHover={{ x: 5, transition: { duration: 0.2 } }}
                    >
                      <motion.span
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1E6F5C] to-[#26AB8C] text-sm font-bold text-white shadow-md"
                        whileHover={{ rotate: 360, scale: 1.15 }}
                        transition={{ duration: 0.5 }}
                      >
                        {index + 1}
                      </motion.span>
                      {question}
                    </motion.span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pl-12 text-[#6B4F3A]/70">
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

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <motion.div
            className="inline-flex items-center gap-3 rounded-2xl border-2 border-[#1E6F5C]/20 bg-gradient-to-br from-white to-[#E8E2D0] px-8 py-5 shadow-xl"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.3 }}
          >
            <Sparkles className="h-6 w-6 text-[#26AB8C]" />
            <p className="text-[#6B4F3A]">
              Vous avez d&apos;autres questions ?{' '}
              <motion.a
                href="/contact"
                className="font-bold text-[#1E6F5C] hover:text-[#26AB8C]"
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
