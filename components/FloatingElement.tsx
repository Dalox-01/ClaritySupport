'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FloatingElementProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  xOffset?: number;
}

export function FloatingElement({
  children,
  delay = 0,
  duration = 3,
  yOffset = 20,
  xOffset = 0,
}: FloatingElementProps) {
  return (
    <motion.div
      animate={{
        y: [0, -yOffset, 0],
        x: [0, xOffset, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

export function RotatingElement({
  children,
  duration = 10,
  reverse = false,
}: {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
}) {
  return (
    <motion.div
      animate={{
        rotate: reverse ? -360 : 360,
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {children}
    </motion.div>
  );
}

export function PulseElement({
  children,
  scale = 1.1,
  duration = 2,
}: {
  children: ReactNode;
  scale?: number;
  duration?: number;
}) {
  return (
    <motion.div
      animate={{
        scale: [1, scale, 1],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

