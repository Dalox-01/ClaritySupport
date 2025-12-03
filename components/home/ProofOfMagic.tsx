'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Wand2 } from 'lucide-react';

const demoOutputs = [
  {
    headline: 'Prospection B2B',
    body: `Bonjour Camille,

Je viens de découvrir la croissance fulgurante de NovaOps et je serais ravi de vous montrer comment MailWizard automatise la personnalisation de vos séquences de prospection en moins de 10 minutes.

Disponible mardi à 10h pour un rapide tour ?

À très vite,
Julien — MailWizard`,
  },
  {
    headline: 'Relance client',
    body: `Bonjour Sarah,

Merci d’avoir testé MailWizard la semaine dernière ! Votre période d’essai gratuit arrive à son terme et j’aimerais savoir si vous souhaitez prolonger l’expérience avec notre plan Starter.

On vous offre -30% sur le premier mois si vous activez votre compte avant vendredi.

Chaleureusement,
L’équipe MailWizard`,
  },
  {
    headline: 'Support premium',
    body: `Bonjour David,

Nous venons de traiter votre demande concernant l’intégration Outlook. Le connecteur a été activé et toutes vos signatures ont été synchronisées.

N’hésitez pas à nous répondre si vous souhaitez un accompagnement individuel.

Bien à vous,
Soline — Support Pro MailWizard`,
  },
];

function createOutput(keyword: string) {
  if (!keyword) {
    return demoOutputs[Math.floor(Math.random() * demoOutputs.length)];
  }

  return {
    headline: `Email généré pour « ${keyword} »`,
    body: `Bonjour,

Voici un aperçu de l’email que MailWizard peut préparer autour de « ${keyword} ».

1. Contexte : nous analysons la situation, les émotions et l’objectif.
2. Ton : calculé automatiquement pour correspondre à votre style.
3. Call-to-action : optimisé pour générer une réponse immédiate.

Prêt à être envoyé ? Il ne reste qu’à cliquer.

À vous de jouer,
MailWizard Hyperlumina`,
  };
}

export function ProofOfMagic() {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(demoOutputs[0]);

  const handleGenerate = () => {
    setIsLoading(true);
    setTimeout(() => {
      setResult(createOutput(keyword.trim()));
      setIsLoading(false);
    }, 650);
  };

  return (
    <section className="relative overflow-hidden bg-[#04040d] py-32 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(61,255,226,0.18),transparent_65%)]" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-12">
        <div className="space-y-5">
          <motion.div
            className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-xs uppercase tracking-[0.45em] text-white/55"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <Wand2 className="h-4 w-4 text-[#5affec]" />
            Proof of Magic
          </motion.div>
          <motion.h2
            className="text-balance text-4xl font-semibold leading-tight md:text-5xl"
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            Tapez un mot-clé. Observez l’IA matérialiser un email presque prêt à envoyer.
          </motion.h2>
          <motion.p
            className="max-w-xl text-base text-white/65"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.65, delay: 0.15 }}
          >
            Ce module démontre l’énergie créative de MailWizard : adaptatif, contextuel, instantané. Vos données sont gardées en local, il s’agit d’une simulation fidèle de l’expérience réelle.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col gap-4 md:flex-row"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.65, delay: 0.2 }}
          >
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Prospection SaaS, Relance client, Onboarding..."
              className="h-14 flex-1 rounded-full border border-white/20 bg-white/[0.06] px-6 text-white placeholder:text-white/35"
            />
            <Button
              onClick={handleGenerate}
              className="h-14 rounded-full bg-gradient-to-r from-[#34ffe0] via-[#775dff] to-[#34ffe0] px-8 text-sm font-semibold text-black shadow-[0_15px_60px_rgba(84,255,232,0.4)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Génération
                </span>
              ) : (
                'Générer'
              )}
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10/30 p-10 backdrop-blur-[48px] shadow-[0_25px_120px_rgba(96,74,255,0.35)]"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(69,255,233,0.35),transparent_65%)] blur-2xl"
            animate={{ scale: isLoading ? 1.2 : 1, opacity: isLoading ? 0.5 : 0.3 }}
            transition={{ duration: 0.6, repeat: isLoading ? Infinity : 0, repeatType: 'reverse' }}
          />

          <div className="relative space-y-6 text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={result.headline}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
              >
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">Prévisualisation</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{result.headline}</h3>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.pre
                key={result.body}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="whitespace-pre-wrap rounded-[1.75rem] border border-white/10 bg-black/30 p-6 text-sm text-white/75 shadow-inner"
              >
                {result.body}
              </motion.pre>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


