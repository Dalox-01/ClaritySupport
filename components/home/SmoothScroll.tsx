'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Initialise Lenis pour un défilement ultra-fluide.
 * Le hook respecte les préférences d'accessibilité et se désactive
 * automatiquement si l'utilisateur préfère réduire les animations.
 */
export function SmoothScroll() {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (mediaQuery.matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.85,
    });

    let animationFrameId: number;

    const raf = (time: number) => {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    };

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);

  return null;
}


