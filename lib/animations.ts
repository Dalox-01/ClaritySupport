/**
 * Animations optimisées pour de meilleures performances
 * Utilise des valeurs réutilisables pour éviter les re-renders inutiles
 */

import { Variants } from 'framer-motion';

// Durées standardisées
export const DURATIONS = {
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
} as const;

// Easing functions optimisées
export const EASINGS = {
  easeOut: [0.16, 1, 0.3, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
} as const;

// Variants réutilisables (optimisé avec Object.freeze pour éviter modifications)
export const fadeIn: Variants = Object.freeze({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DURATIONS.normal, ease: EASINGS.easeOut },
});

export const fadeInUp: Variants = Object.freeze({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: DURATIONS.normal, ease: EASINGS.easeOut },
});

export const fadeInDown: Variants = Object.freeze({
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: DURATIONS.normal, ease: EASINGS.easeOut },
});

export const scaleIn: Variants = Object.freeze({
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: DURATIONS.fast, ease: EASINGS.easeOut },
});

export const slideInRight: Variants = Object.freeze({
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: DURATIONS.normal, ease: EASINGS.easeOut },
});

export const slideInLeft: Variants = Object.freeze({
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: DURATIONS.normal, ease: EASINGS.easeOut },
});

// Variants pour listes (optimisé pour de nombreux items)
export const staggerContainer: Variants = Object.freeze({
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
});

export const staggerItem: Variants = Object.freeze({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATIONS.fast },
});

// Props optimisées pour hover/tap (utiliser CSS au lieu de motion quand possible)
export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: DURATIONS.fast },
} as const;

export const hoverLift = {
  whileHover: { y: -2 },
  transition: { duration: DURATIONS.fast },
} as const;

// Classes Tailwind pour animations CSS natives (plus performant que Framer Motion)
export const CSS_TRANSITIONS = {
  // Utiliser ces classes au lieu de whileHover/whileTap quand possible
  hoverScale: 'transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]',
  hoverLift: 'transition-transform duration-150 hover:-translate-y-0.5',
  smooth: 'transition-all duration-200 ease-out',
  smoothSlow: 'transition-all duration-300 ease-out',
} as const;

// Configuration pour réduire les animations sur devices low-end
export const getReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Wrapper pour désactiver les animations si prefers-reduced-motion
export const withReducedMotion = (variants: Variants): Variants => {
  if (getReducedMotion()) {
    return {
      initial: {},
      animate: {},
      exit: {},
    };
  }
  return variants;
};
