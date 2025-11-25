'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export const BackgroundBeams = ({ className }: { className?: string }) => {
  const beamsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!beamsRef.current) return;

    const moveBeams = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = clientX - beamsRef.current!.getBoundingClientRect().left;
      const y = clientY - beamsRef.current!.getBoundingClientRect().top;
      
      beamsRef.current!.style.setProperty('--x', `${x}px`);
      beamsRef.current!.style.setProperty('--y', `${y}px`);
    };

    window.addEventListener('mousemove', moveBeams);
    return () => window.removeEventListener('mousemove', moveBeams);
  }, []);

  return (
    <div
      ref={beamsRef}
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden [background:radial-gradient(circle_at_var(--x,_50%)_var(--y,_50%),rgba(59,130,246,0.1)_0%,transparent_50%)]",
        className
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      {/* Animated Beams */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute h-[1px] w-[100px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 animate-beam",
            )}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 5}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
