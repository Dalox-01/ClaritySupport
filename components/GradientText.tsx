'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  gradient?: string;
  animate?: boolean;
}

export function GradientText({
  children,
  className,
  gradient = 'from-blue-600 via-purple-600 to-pink-600',
  animate = true,
}: GradientTextProps) {
  if (!animate) {
    return (
      <span className={cn(`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`, className)}>
        {children}
      </span>
    );
  }

  return (
    <motion.span
      className={cn(`inline-block bg-gradient-to-r ${gradient} bg-clip-text text-transparent`, className)}
      style={{
        backgroundSize: '200% auto',
      }}
      animate={{
        backgroundPosition: ['0% center', '200% center', '0% center'],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {children}
    </motion.span>
  );
}

export function GlowText({
  children,
  className,
  color = 'rgb(59, 130, 246)',
}: {
  children: ReactNode;
  className?: string;
  color?: string;
}) {
  return (
    <motion.span
      className={cn('inline-block', className)}
      animate={{
        textShadow: [
          `0 0 10px ${color}`,
          `0 0 20px ${color}`,
          `0 0 10px ${color}`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.span>
  );
}

