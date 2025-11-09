'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';

export function CustomCursor({ variant = 'default' }: { variant?: 'default' | 'trail' | 'glow' }) {
  const [isPointer, setIsPointer] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const target = e.target as HTMLElement;
      setIsPointer(
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'A'
      );
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY]);

  if (variant === 'trail') {
    return (
      <>
        {/* Main cursor */}
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-[9999] h-4 w-4 rounded-full border-2 border-primary bg-primary/20"
          style={{
            x: cursorXSpring,
            y: cursorYSpring,
            translateX: '-50%',
            translateY: '-50%',
          }}
          animate={{
            scale: isPointer ? 1.5 : 1,
          }}
        />
        {/* Trail */}
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-[9998] h-8 w-8 rounded-full border border-primary/30"
          style={{
            x: cursorXSpring,
            y: cursorYSpring,
            translateX: '-50%',
            translateY: '-50%',
          }}
          animate={{
            scale: isPointer ? 2 : 1,
          }}
        />
      </>
    );
  }

  if (variant === 'glow') {
    return (
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-12 w-12 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-xl"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isPointer ? 1.5 : 1,
        }}
      />
    );
  }

  // Default cursor
  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-6 w-6 rounded-full border-2 border-primary mix-blend-difference"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        scale: isPointer ? 1.5 : 1,
      }}
    />
  );
}

