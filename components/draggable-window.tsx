'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableWindowProps {
  children: React.ReactNode;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  width?: string;
  height?: string;
  zIndex?: number;
  onFocus?: () => void;
}

export function DraggableWindow({
  children,
  title,
  isOpen,
  onClose,
  className,
  width = '800px',
  height = '600px',
  zIndex = 50,
  onFocus,
}: DraggableWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  // Calculer la position centrée au montage - SEULEMENT UNE FOIS
  useEffect(() => {
    if (isOpen && !isInitialized && windowRef.current) {
      // Calculer le centre de l'écran
      const windowWidth = parseInt(width);
      const windowHeight = parseInt(height);
      const centerX = (window.innerWidth - windowWidth) / 2;
      const centerY = (window.innerHeight - windowHeight) / 2;
      
      setPosition({ x: Math.max(0, centerX), y: Math.max(0, centerY) });
      setIsInitialized(true);
      
      // Appeler onFocus pour mettre cette fenêtre au premier plan
      if (onFocus) {
        onFocus();
      }
    }
    
    // Réinitialiser quand la fenêtre se ferme
    if (!isOpen && isInitialized) {
      setIsInitialized(false);
    }
  }, [isOpen, isInitialized, width, height, onFocus]);

  // Bloquer le scroll de la page en arrière-plan
  useEffect(() => {
    if (!isOpen) return;

    const preventMainScroll = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      const isInModal = windowRef.current?.contains(target);
      
      if (!isInModal) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', preventMainScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventMainScroll);
    };
  }, [isOpen]);

  // Handle mouse down on header to start drag
  const handleMouseDown = (e: React.MouseEvent) => {
    // Ignore clicks on window controls (buttons)
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    
    // Only allow drag if clicking directly on header, not on any interactive elements
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') {
      return;
    }
    
    e.preventDefault(); // Prevent text selection during drag
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    
    if (onFocus) onFocus();
  };

  // Handle mouse move during drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Constrain to viewport
      const maxX = window.innerWidth - (windowRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (windowRef.current?.offsetHeight || 0);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay pour bloquer les interactions avec la page en fond */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        style={{ zIndex: zIndex - 1 }}
        onClick={onClose}
      />
      
      {/* Draggable window */}
      <div
        ref={windowRef}
        tabIndex={-1}
        style={{ 
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isMaximized ? '100vw' : width,
          height: isMaximized ? '100vh' : height,
          zIndex,
        }}
        className={cn(
          "absolute top-0 left-0",
          "bg-white dark:bg-[#1a1f3a] rounded-xl shadow-2xl overflow-hidden",
          "border border-gray-200 dark:border-blue-500/20",
          "outline-none",
          className
        )}
      >
        {/* Header - macOS style */}
        <div 
          onMouseDown={handleMouseDown}
          className={cn(
            "flex items-center justify-between px-4 py-3 border-b cursor-move touch-none select-none",
            "bg-gradient-to-b from-gray-50 to-white dark:from-[#1a1f3a] dark:to-[#151829]",
            "border-gray-200 dark:border-blue-500/20"
          )}
        >
          {/* Traffic lights - macOS style */}
          <div className="flex items-center gap-2 window-controls">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors group relative"
            >
              <X className="w-2 h-2 text-red-900 absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors group relative"
            >
              <Minus className="w-2 h-2 text-yellow-900 absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsMaximized(!isMaximized);
              }}
              className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors group relative"
            >
              <Maximize2 className="w-2 h-2 text-green-900 absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </div>

          {/* Title */}
          <div className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            {title}
          </div>

          {/* Placeholder for symmetry */}
          <div className="w-16"></div>
        </div>

        {/* Content */}
        <div 
          className="h-[calc(100%-52px)] overflow-y-auto overflow-x-hidden" 
          style={{ userSelect: 'text' }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  );
}
