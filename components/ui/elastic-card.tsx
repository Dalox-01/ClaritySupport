'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ElasticCardProps {
  children: ReactNode;
  className?: string;
  hoverLift?: boolean;
  tiltStrength?: number;
}

export function ElasticCard({
  children,
  className,
  hoverLift = true,
  tiltStrength = 10,
}: ElasticCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [tiltStrength, -tiltStrength]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-tiltStrength, tiltStrength]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[#E8E2D0] bg-white/80 backdrop-blur-sm',
        'shadow-md transition-shadow duration-300',
        className
      )}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={
        hoverLift
          ? {
              y: -12,
              boxShadow: '0 20px 40px rgba(30, 111, 92, 0.2)',
              transition: { type: 'spring', stiffness: 300, damping: 20 },
            }
          : {}
      }
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Shimmer effect on hover */}
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(30, 111, 92, 0.15), transparent)',
          }}
        />
      )}
      
      {/* Gradient glow on hover */}
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: `radial-gradient(600px circle at ${mouseXSpring}px ${mouseYSpring}px, rgba(30, 111, 92, 0.1), transparent 40%)`,
          }}
        />
      )}
      
      <div className="relative z-0" style={{ transform: 'translateZ(50px)' }}>
        {children}
      </div>
    </motion.div>
  );
}
