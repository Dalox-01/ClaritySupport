'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}

export function TextReveal({
  text,
  className,
  delay = 0,
  stagger = 0.03,
}: TextRevealProps) {
  const letters = text.split('');

  return (
    <span className={cn('inline-block', className)}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ y: 50, opacity: 0, rotateX: 90 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{
            delay: delay + i * stagger,
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={{
            y: -10,
            color: '#1E6F5C',
            transition: { duration: 0.2 },
          }}
          className="inline-block"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </span>
  );
}
