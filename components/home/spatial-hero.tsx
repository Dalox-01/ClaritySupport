'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function SpatialHero({ onGetStarted }: { onGetStarted?: () => void }) {
  // --- 3D Tilt Logic ---
  const ref = useRef<HTMLDivElement>(null);
  
  // Mouse position (0 to 1)
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Smooth mouse movement
  const mouseX = useSpring(x, { stiffness: 150, damping: 25 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 25 });

  // Tilt transforms (Desktop only)
  const rotateX = useTransform(mouseY, [0, 1], [5, -5]); // Tilt up/down
  const rotateY = useTransform(mouseX, [0, 1], [-5, 5]); // Tilt left/right

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    
    // Normalize to 0-1
    x.set(clientX / rect.width);
    y.set(clientY / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  // --- Mobile Detection ---
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section 
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#FAFAFA] text-slate-900 py-20 md:py-0"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={ref}
    >
      {/* 1. Environment (Background & Ambiance) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Dot Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04]" 
          style={{ 
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', 
            backgroundSize: '32px 32px' 
          }} 
        />
        
        {/* Floating Orbs */}
        <motion.div 
          animate={{ 
            x: [0, 120, 0], 
            y: [0, -60, 0],
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-15%] left-[-5%] h-[600px] w-[600px] rounded-full bg-blue-400/30 blur-[140px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -120, 0], 
            y: [0, 60, 0],
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1] 
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-[-15%] right-[-5%] h-[700px] w-[700px] rounded-full bg-indigo-400/25 blur-[160px]" 
        />
      </div>

      {/* Content Container - Centered */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Typography */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-12 md:mb-16"
        >
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 md:text-7xl lg:text-8xl mb-4">
            Clarity Support
          </h1>
          <p className="text-xl font-medium text-slate-500 md:text-2xl">
            Le support client, enfin clair.
          </p>
        </motion.div>

        {/* 2. The "Hero Device" - MacBook/Tablet Frame */}
        <div className="relative w-full perspective-2000">
          <motion.div
            style={{ 
              rotateX: isMobile ? 0 : rotateX, 
              rotateY: isMobile ? 0 : rotateY,
              transformStyle: "preserve-3d"
            }}
            initial={{ scale: 0.85, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 1, type: "spring", bounce: 0.15, delay: 0.2 }}
            className="relative mx-auto"
          >
            {/* MacBook Frame */}
            <div className="relative w-full max-w-6xl mx-auto">
              {/* Screen Container */}
              <div className="relative aspect-[16/10] w-full rounded-2xl bg-slate-900 p-3 shadow-2xl ring-1 ring-slate-800/50">
                {/* Screen Bezel */}
                <div className="relative h-full w-full overflow-hidden rounded-xl bg-white shadow-inner">
                  
                  {/* Screenshot of Mail Center Interface */}
                  <div className="absolute inset-0">
                    <img
                      src="/screenshots/mailcenter-interface.png"
                      alt="Mail Center Interface"
                      className="h-full w-full object-cover object-top"
                    />
                    
                    {/* Overlay gradient for depth */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/5 pointer-events-none" />
                  </div>

                  {/* Floating CTA Button */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.button
                      onClick={onGetStarted}
                      whileHover="hover"
                      initial="idle"
                      animate="idle"
                      className="pointer-events-auto group relative flex items-center gap-3 overflow-hidden rounded-full bg-blue-600 px-10 py-5 text-white shadow-2xl shadow-blue-600/40 transition-all duration-300 hover:shadow-blue-600/60 active:scale-95"
                    >
                      {/* Shimmer Effect */}
                      <motion.div
                        variants={{
                          idle: { x: ['-100%', '200%'] },
                          hover: { x: '200%' }
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 3, 
                          ease: "easeInOut", 
                          repeatDelay: 1.5 
                        }}
                        className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />
                      
                      <div className="relative flex items-center gap-3 font-bold text-lg">
                        <Sparkles className="h-5 w-5" />
                        Lancer la démo
                      </div>
                      
                      {/* Arrow Animation */}
                      <motion.span 
                        variants={{
                          idle: { x: 0 },
                          hover: { x: 6 }
                        }}
                        transition={{ duration: 0.3 }}
                        className="relative text-2xl"
                      >
                        →
                      </motion.span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* MacBook Base (Keyboard area) */}
              <div className="relative mt-1 h-6 w-full">
                <div className="absolute inset-0 rounded-b-2xl bg-gradient-to-b from-slate-300 to-slate-400 shadow-lg" />
                <div className="absolute left-1/2 top-1/2 h-1 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-500/30" />
              </div>
            </div>

            {/* Reflection/Shadow under device */}
            <div className="absolute -bottom-20 left-1/2 h-32 w-[90%] -translate-x-1/2 rounded-full bg-slate-900/10 blur-3xl" />
          </motion.div>
        </div>

        {/* Spacer for mobile */}
        <div className="h-20 md:h-0" />
      </div>
    </section>
  );
}
