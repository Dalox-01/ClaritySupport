'use client';

import { ArrowRight, Sparkles, Check } from 'lucide-react';
import { useState } from 'react';

interface DarkHeroProps {
  onGetStarted: () => void;
}

export function DarkHero({ onGetStarted }: DarkHeroProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0A0E27] via-[#0F1629] to-[#0A0E27] pt-24 pb-16">
      {/* Static gradient orbs */}
      <div className="pointer-events-none absolute left-1/3 top-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px] opacity-30" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/3 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px] opacity-30" />

      {/* Main content - perfectly centered */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 text-center sm:px-8 lg:px-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 backdrop-blur-sm">
          <Sparkles className="h-4 w-4" />
          <span>Support client automatisé par IA</span>
        </div>

        {/* Title */}
        <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          <span className="inline-block bg-gradient-to-r from-[#0EA5E9] to-[#3B82F6] bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>
            ClaritySupport
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-gray-300 sm:text-2xl md:leading-relaxed">
          La plateforme intelligente qui transforme votre support client.
          Centralisez Gmail & Outlook, générez des réponses avec l&apos;IA,
          et délivrez un service exceptionnel 24/7.
        </p>

        {/* CTA Button */}
        <div className="mb-10 flex justify-center">
          <button
            onClick={onGetStarted}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-10 py-5 text-lg font-bold text-white shadow-xl shadow-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/40 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-3">
              Essayer gratuitement
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
        </div>

        {/* Trust badges */}
        <div className="mb-20 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
          {['Essai gratuit 14 jours', 'Sans carte bancaire', 'Configuration en 2 min'].map((text) => (
            <div key={text} className="flex items-center gap-2">
              <Check className="h-5 w-5 flex-shrink-0 text-cyan-400" />
              <span className="whitespace-nowrap">{text}</span>
            </div>
          ))}
        </div>

        {/* Mockup - clean and professional */}
        <div className="relative mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-[#1a1f3a]/90 to-[#0f1320]/90 shadow-2xl shadow-blue-500/10 backdrop-blur-sm">
            {/* Window controls */}
            <div className="flex items-center gap-3 border-b border-blue-500/10 bg-gradient-to-r from-[#0f1320]/80 to-[#1a1f3a]/80 px-6 py-4 backdrop-blur-md">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <div className="ml-6 flex-1 rounded-lg border border-blue-500/10 bg-[#0A0E27]/50 px-4 py-2.5 text-left text-sm text-gray-400 backdrop-blur-sm">
                claritysupport.com/mail-center
              </div>
            </div>

            {/* Screenshot content */}
            <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#0A0E27] via-[#0f1629] to-[#0A0E27]">
              {/* Real MailCenter Screenshot */}
              <img
                src="/screenshots/mailcenter-interface.png"
                alt="Interface ClaritySupport Mail Center"
                className="h-full w-full object-cover object-top"
                loading="lazy"
              />

              {/* Subtle overlay gradient for depth */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0E27]/20 via-transparent to-transparent" />
            </div>
          </div>

          {/* Static glow */}
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gradient-radial from-blue-500/20 via-cyan-500/10 to-transparent blur-3xl opacity-40" />
        </div>
      </div>
    </section>
  );
}
