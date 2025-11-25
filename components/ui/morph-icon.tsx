'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

interface MorphIconProps {
  IconA: LucideIcon;
  IconB: LucideIcon;
  trigger: boolean;
  size?: number;
  className?: string;
  duration?: number;
}

export function MorphIcon({
  IconA,
  IconB,
  trigger,
  size = 24,
  className = '',
  duration = 0.5,
}: MorphIconProps) {
  const [current, setCurrent] = useState<'A' | 'B'>('A');

  useEffect(() => {
    if (trigger) {
      setCurrent('B');
      const timer = setTimeout(() => setCurrent('A'), duration * 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  const CurrentIcon = current === 'A' ? IconA : IconB;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={current}
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0, rotate: 180, opacity: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          duration,
        }}
        className={className}
      >
        <CurrentIcon size={size} />
      </motion.div>
    </AnimatePresence>
  );
}
