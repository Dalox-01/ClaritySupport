'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  depth: number;
}

interface ParticleSystemProps {
  type: 'emails' | 'code' | 'letters' | 'sparks';
  count?: number;
  className?: string;
}

export function ParticleSystem({
  type,
  count = 30,
  className = '',
}: ParticleSystemProps) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: 5 + Math.random() * 5,
        delay: Math.random() * 3,
        depth: Math.random(),
      })),
    [count]
  );

  const getParticleContent = (type: string, index: number) => {
    switch (type) {
      case 'emails':
        return '✉️';
      case 'code':
        return ['<>', '{}', '[]', '//'][index % 4];
      case 'letters':
        return String.fromCharCode(65 + (index % 26)); // A-Z
      case 'sparks':
        return '⚡';
      default:
        return '•';
    }
  };

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {particles.map((particle, i) => (
        <motion.div
          key={particle.id}
          className="absolute text-[#1E6F5C]/30 dark:text-[#26AB8C]/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: `${particle.size * 8}px`,
            filter: `blur(${particle.depth}px)`,
          }}
          animate={{
            y: [0, Math.random() * -200, 0],
            x: [0, Math.sin(i) * 50, 0],
            opacity: [0, 0.3 + particle.depth * 0.4, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {getParticleContent(type, i)}
        </motion.div>
      ))}
    </div>
  );
}
