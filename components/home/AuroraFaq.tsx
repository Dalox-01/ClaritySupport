'use client';

import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    value: 'faq-1',
    question: 'Comment fonctionne MailWizard ?',
    answer:
      "MailWizard orchestre GPT-5 pour transformer vos intentions en emails cohérents. Vous décrivez le contexte, l’IA compose, vous retouchez si besoin et envoyez."
  },
  {
    value: 'faq-2',
    question: 'Mes données sont-elles sécurisées ?',
    answer:
      'Oui. Toutes les données sont chiffrées, isolées et vous gardez le contrôle. Supprimez vos contenus et votre compte à tout moment.'
  },
  {
    value: 'faq-3',
    question: 'Puis-je annuler mon abonnement Pro ?',
    answer:
      'Absolument. Une annulation instantanée depuis votre espace facturation. Vous conservez l’accès Pro jusqu’à la fin du mois en cours.'
  },
  {
    value: 'faq-4',
    question: 'Quels types d’emails puis-je générer ?',
    answer:
      'Prospection B2B, relances, support client, recrutement, follow-up commercial, newsletters, onboarding, emails RH et bien plus encore.'
  },
  {
    value: 'faq-5',
    question: 'Que se passe-t-il si j’atteins ma limite mensuelle ?',
    answer:
      'Vous pouvez attendre le mois suivant ou upgrader. Vos emails, signatures et templates restent disponibles sans interruption.'
  }
];

export function AuroraFaq() {
  return (
    <section className="relative overflow-hidden bg-[#050313] py-32 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(101,255,220,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-[radial-gradient(circle_at_bottom,rgba(120,71,255,0.28),transparent_65%)] blur-3xl" />

      <div className="relative mx-auto flex max-w-5xl flex-col gap-12 px-6 text-center lg:px-12">
        <motion.h2
          className="text-balance text-4xl font-semibold text-white md:text-5xl"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          Les réponses à vos questions avant de traverser le portail.
        </motion.h2>

        <div className="mx-auto w-full max-w-3xl rounded-[2.5rem] border border-white/10 bg-white/10/30 p-10 backdrop-blur-[38px] text-left">
          <Accordion type="single" collapsible defaultValue="faq-1">
            {faqs.map(({ value, question, answer }) => (
              <AccordionItem key={value} value={value} className="border-b border-white/10 py-4 last:border-none">
                <AccordionTrigger className="text-left text-base font-semibold text-white hover:text-[#5ef5ff]">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-white/70">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}


