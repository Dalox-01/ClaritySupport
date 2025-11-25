'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Micro-loader ultra-optimisé avec stratégies des grands sites
 * - YouTube: Skeleton screens progressifs
 * - Vercel: Shimmer effect optimisé GPU
 * - Airbnb: Content placeholders intelligents
 */

interface MicroLoaderProps {
  type?: 'skeleton' | 'shimmer' | 'dots' | 'bar' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MicroLoader({ type = 'shimmer', size = 'md', className = '' }: MicroLoaderProps) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  // Shimmer loader (Vercel-style)
  if (type === 'shimmer') {
    return (
      <div className={`relative overflow-hidden rounded ${sizeClasses[size]} ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
        <div 
          className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          }}
        />
      </div>
    );
  }

  // Skeleton loader (YouTube-style)
  if (type === 'skeleton') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className={`${sizeClasses[size]} w-full rounded bg-gray-200 dark:bg-gray-800 animate-pulse`} />
        <div className={`${sizeClasses[size]} w-5/6 rounded bg-gray-200 dark:bg-gray-800 animate-pulse`} />
        <div className={`${sizeClasses[size]} w-4/6 rounded bg-gray-200 dark:bg-gray-800 animate-pulse`} />
      </div>
    );
  }

  // Dots loader (minimalist)
  if (type === 'dots') {
    return (
      <div className={`flex gap-1.5 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`rounded-full bg-blue-500 ${size === 'sm' ? 'h-1.5 w-1.5' : size === 'md' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'}`}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    );
  }

  // Progress bar (Linear)
  if (type === 'bar') {
    return (
      <div className={`overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800 ${sizeClasses[size]} ${className}`}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    );
  }

  // Pulse loader
  return (
    <motion.div
      className={`rounded-full bg-blue-500 ${size === 'sm' ? 'h-8 w-8' : size === 'md' ? 'h-12 w-12' : 'h-16 w-16'} ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

/**
 * Progressive Image Loader (Pinterest/Instagram-style)
 * Affiche un placeholder flou avant le chargement complet
 */
interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
}

export function ProgressiveImage({ src, alt, className = '', placeholderSrc }: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || src);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={currentSrc}
        alt={alt}
        className={`transition-all duration-500 ${isLoaded ? 'blur-0 scale-100' : 'blur-lg scale-105'}`}
      />
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-800" />
      )}
    </div>
  );
}

/**
 * Content Placeholder (Airbnb/LinkedIn-style)
 * Simule le layout avant le chargement
 */
interface ContentPlaceholderProps {
  lines?: number;
  hasAvatar?: boolean;
  hasImage?: boolean;
  className?: string;
}

export function ContentPlaceholder({ 
  lines = 3, 
  hasAvatar = false, 
  hasImage = false,
  className = '' 
}: ContentPlaceholderProps) {
  return (
    <div className={`space-y-4 animate-pulse ${className}`}>
      {hasAvatar && (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-2 w-16 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      )}
      
      {hasImage && (
        <div className="h-48 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />
      )}
      
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i}
            className="h-4 rounded bg-gray-200 dark:bg-gray-800"
            style={{ width: `${Math.random() * 30 + 70}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Spinner optimisé GPU (Google-style)
 */
interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export function Spinner({ size = 24, color = 'currentColor', className = '' }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill={color}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
