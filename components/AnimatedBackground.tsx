'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  variant?: 'default' | 'mesh' | 'dots' | 'waves';
}

// Optimisé : Réduction drastique du nombre de particules et utilisation de CSS pour animations
export const AnimatedBackground = memo(({ variant = 'default' }: AnimatedBackgroundProps) => {
  
  if (variant === 'mesh') {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 opacity-20">
        {/* Grille statique en CSS (beaucoup plus performant) */}
        <div 
          className="absolute inset-0 animate-mesh"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
              linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Orbes simplifiés - réduit de 2 à 2 avec animations CSS */}
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl animate-float" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl animate-float-delayed" />
      </div>
    );
  }

  if (variant === 'dots') {
    // Réduction de 50 à 12 particules
    const particles = useMemo(() => 
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: i * 0.3,
        duration: 4 + i * 0.5,
      })), 
    []);

    return (
      <div className="pointer-events-none fixed inset-0 z-0 opacity-30">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-br from-blue-400/40 to-purple-400/40"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: particle.delay,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'waves') {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-15">
        {/* Réduction de 5 à 3 vagues */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(59, 130, 246, ${0.08 - i * 0.02}), transparent ${35 + i * 20}%)`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.2, 0.4],
            }}
            transition={{
              duration: 10 + i * 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.8,
            }}
          />
        ))}
      </div>
    );
  }

  // Default variant - particules flottantes ULTRA optimisées
  const defaultParticles = useMemo(() => 
    Array.from({ length: 15 }, (_, i) => ({ // Réduit de 50 à 15
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 30,
      speedY: (Math.random() - 0.5) * 30,
      opacity: Math.random() * 0.3 + 0.1,
      delay: i * 0.2,
    })),
  []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-25">
      {defaultParticles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-br from-blue-400 to-purple-400"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size * 2,
            height: particle.size * 2,
            opacity: particle.opacity,
            filter: `blur(${particle.size * 0.5}px)`,
          }}
          animate={{
            x: [0, particle.speedX, 0],
            y: [0, particle.speedY, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8 + particle.id * 0.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';

