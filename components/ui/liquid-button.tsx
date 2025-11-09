'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LiquidButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  magnetic?: boolean;
  ripple?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function LiquidButton({
  children,
  variant = 'primary',
  size = 'md',
  magnetic = true,
  ripple = true,
  className,
  onClick,
  ...props
}: LiquidButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || !buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.25; // Magnetic strength
    const deltaY = (e.clientY - centerY) * 0.25;
    
    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && buttonRef.current) {
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      const ripple = document.createElement('span');
      ripple.className = 'absolute rounded-full bg-white/30 animate-ripple pointer-events-none';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
    
    onClick?.(e);
  };

  const variants = {
    primary: 'bg-[#1E6F5C] text-white hover:bg-[#26AB8C] shadow-lg hover:shadow-[#1E6F5C]/50',
    secondary: 'bg-[#E8E2D0] text-[#6B4F3A] hover:bg-[#F5F1E7] border border-[#6B4F3A]/20',
    ghost: 'text-[#6B4F3A] hover:bg-[#E8E2D0]/50',
    outline: 'border-2 border-[#1E6F5C] text-[#1E6F5C] hover:bg-[#1E6F5C] hover:text-white',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
  };

  return (
    <motion.button
      ref={buttonRef}
      style={{ x: springX, y: springY }}
      className={cn(
        'relative overflow-hidden font-medium transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-[#1E6F5C] focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 -translate-x-full"
        animate={{
          translateX: ['-100%', '200%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
          ease: 'easeInOut',
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
        }}
      />
    </motion.button>
  );
}
