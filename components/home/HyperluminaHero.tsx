'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, MousePointer2, Sparkles } from 'lucide-react';

const HyperluminaScene = dynamic(
  () => import('./HyperluminaScene').then((mod) => mod.HyperluminaScene),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(18,239,207,0.18),transparent_55%)]" />
    ),
  }
);

interface HyperluminaHeroProps {
  onGetStarted: () => void;
}

const heroWords = ['Réinventez', 'Amplifiez', 'Synchronisez'];

export function HyperluminaHero({ onGetStarted }: HyperluminaHeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeWord, setActiveWord] = useState(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 140, damping: 18 });
  const springY = useSpring(y, { stiffness: 140, damping: 18 });
  const glowTransform = useTransform(
    [springX, springY],
    ([latestX, latestY]: any[]) => `translate(${latestX * 0.35}px, ${latestY * 0.35}px)`
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWord((prev) => (prev + 1) % heroWords.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
    const offsetX = event.clientX - bounds.left - bounds.width / 2;
    const offsetY = event.clientY - bounds.top - bounds.height / 2;
    x.set(offsetX * 0.25);
    y.set(offsetY * 0.4);
  };

  const heroCopy = useMemo(
    () => [
      {
        title: 'Expérience synesthésique',
        description:
          "Une interface immersive qui métamorphose la rédaction d&rsquo;emails en voyage audiovisuel. MailWizard devient un studio créatif augmenté par l&rsquo;IA.",
      },
      {
        title: 'Cortex conversationnel',
        description:
          "L&rsquo;IA écoute, apprend, adapte chaque phrase à votre ton. Visualisez l&rsquo;impact émotionnel avant d&rsquo;envoyer.",
      },
      {
        title: 'Cadence orbitale',
        description:
          'Toutes vos actions en un flux chorégraphié. Accès instantané au dashboard, aux templates et à la facturation.',
      },
    ],
    []
  );

  const infoIndexRef = useRef(0);
  const [currentInfo, setCurrentInfo] = useState(heroCopy[0]);

  useEffect(() => {
    const infoInterval = setInterval(() => {
      infoIndexRef.current = (infoIndexRef.current + 1) % heroCopy.length;
      setCurrentInfo(heroCopy[infoIndexRef.current]);
    }, 5600);
    return () => clearInterval(infoInterval);
  }, [heroCopy]);

  return (
    <section
      className="relative min-h-[clamp(720px,95vh,980px)] overflow-hidden bg-[#05030a] text-white"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-60 [background:radial-gradient(circle_at_top,rgba(103,245,255,0.18),transparent_58%)]" />
        <motion.div
          className="absolute -inset-[35%] opacity-35 blur-3xl bg-[conic-gradient(from_180deg_at_50%_50%,rgba(35,255,225,0.4),rgba(116,66,255,0.45),rgba(35,255,225,0.4))]"
          style={{ transform: glowTransform }}
        />
      </div>

      {!prefersReducedMotion && (
        <div className="absolute inset-0">
          <HyperluminaScene className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050208]/50 via-[#050208]/60 to-[#050208]" />
        </div>
      )}

      <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col items-center px-6 pt-32 pb-24 lg:flex-row lg:items-end lg:justify-between lg:px-12">
        <div className="mb-16 flex w-full max-w-2xl flex-col gap-8 text-center lg:mb-0 lg:text-left">
          <div className="flex flex-col items-center gap-4 lg:items-start">
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-medium uppercase tracking-[0.25em] text-white/70 shadow-[0_0_30px_rgba(35,255,225,0.35)]"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Sparkles className="h-3.5 w-3.5 text-[#63fcff]" />
              Hyperlumina Release
            </motion.div>

            <motion.h1
              className="text-balance font-black tracking-tight text-white [font-size:clamp(3rem,8vw,6.4rem)]"
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-white/70">{heroWords[(activeWord + 2) % heroWords.length]}</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#15f4d3] via-[#7f53ff] to-[#15f4d3] drop-shadow-[0_0_45px_rgba(103,245,255,0.5)]">
                vos emails avec MailWizard
              </span>
            </motion.h1>

            <motion.p
              className="text-pretty text-base text-white/70 md:text-lg"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
            >
              L&rsquo;IA devient co-créatrice : vibrez avec un portail interactif, micro-interactions magnétiques et un flux narratif cinématique.
              Propulsez vos emails au rang d&rsquo;expériences inoubliables.
            </motion.p>
          </div>

          <motion.div
            className="relative flex flex-col items-center gap-4 sm:flex-row sm:justify-start"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Button
              size="lg"
              onClick={onGetStarted}
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#13efcf] via-[#6d5bff] to-[#13efcf] px-9 py-5 text-base font-semibold text-black shadow-[0_12px_60px_rgba(98,255,241,0.45)] transition-transform duration-300 hover:scale-[1.03]"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Mail className="h-5 w-5 transition-transform duration-500 group-hover:rotate-12" />
                Générer mon premier email
              </span>
              <span className="absolute inset-0 translate-y-[120%] bg-white/25 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-[-20%]" />
            </Button>

            <Button
              size="lg"
              asChild
              variant="outline"
              className="rounded-full border-white/30 bg-white/5 px-8 py-5 text-base text-white transition-all duration-500 hover:border-white hover:bg-white/15"
            >
              <Link href="#pricing" className="flex items-center gap-2">
                <MousePointer2 className="h-5 w-5" />
                Voir les plans orbitaux
              </Link>
            </Button>
          </motion.div>

          <motion.div
            className="flex items-center justify-center gap-8 text-sm text-white/60 lg:justify-start"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85 }}
          >
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.35em] text-white/40">Cadence</span>
              <span className="text-base font-semibold text-white">10 emails gratuits</span>
            </div>
            <div className="h-10 w-px bg-gradient-to-b from-white/0 via-white/35 to-white/0" />
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.35em] text-white/40">Sécurité</span>
              <span className="text-base font-semibold text-white">Chiffrement total</span>
            </div>
            <div className="h-10 w-px bg-gradient-to-b from-white/0 via-white/35 to-white/0" />
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.35em] text-white/40">IA</span>
              <span className="text-base font-semibold text-white">Contextuelle & vivante</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5/20 backdrop-blur-xl p-8 shadow-[0_35px_120px_rgba(90,104,255,0.28)]"
          initial={{ opacity: 0, y: 80, rotateX: 15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.9, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-6 flex items-center justify-between">
            <Badge
              variant="outline"
              className="rounded-full border-[#31ffe0]/50 bg-[#31ffe0]/10 px-4 py-1 text-[0.7rem] uppercase tracking-[0.35em] text-[#31ffe0]"
            >
              Live Ops IA
            </Badge>
            <motion.span
              key={activeWord}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xs uppercase tracking-[0.35em] text-white/40"
            >
              {heroWords[activeWord]}
            </motion.span>
          </div>
          <motion.h3
            key={currentInfo.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="text-lg font-semibold text-white"
          >
            {currentInfo.title}
          </motion.h3>
          <motion.p
            key={currentInfo.description}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mt-2 text-sm text-white/70"
          >
            {currentInfo.description}
          </motion.p>

          <motion.div
            className="mt-8 grid grid-cols-2 gap-4 text-xs text-white/70"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="rounded-2xl border border-white/10 bg-white/5/25 p-4">
              <span className="text-[0.65rem] uppercase tracking-[0.3em] text-white/40">Temps réel</span>
              <p className="mt-1 text-sm font-semibold text-[#4df7ff]">3,2s</p>
              <p className="text-[0.7rem] text-white/60">Pour générer un email complet</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5/25 p-4">
              <span className="text-[0.65rem] uppercase tracking-[0.3em] text-white/40">Personnalisation</span>
              <p className="mt-1 text-sm font-semibold text-[#b68bff]">Ton adaptatif</p>
              <p className="text-[0.7rem] text-white/60">Signature, variables, langage</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}


