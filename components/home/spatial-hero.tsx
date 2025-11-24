'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Settings, 
  Search, 
  Bell, 
  Menu, 
  Plus,
  BarChart3,
  Inbox,
  CheckCircle2,
  Clock
} from 'lucide-react';

export function SpatialHero({ onGetStarted }: { onGetStarted?: () => void }) {
  // --- 3D Tilt Logic ---
  const ref = useRef<HTMLDivElement>(null);
  
  // Mouse position (0 to 1)
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Smooth mouse movement
  const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

  // Tilt transforms (Desktop only)
  const rotateX = useTransform(mouseY, [0, 1], [7, -7]); // Tilt up/down
  const rotateY = useTransform(mouseX, [0, 1], [-7, 7]); // Tilt left/right
  
  // Parallax effects for inner elements
  const contentX = useTransform(mouseX, [0, 1], [-10, 10]);
  const contentY = useTransform(mouseY, [0, 1], [-10, 10]);

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
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#F5F5F7] text-slate-900 selection:bg-blue-100"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={ref}
    >
      {/* 1. Environment (Background & Ambiance) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Dot Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
            backgroundSize: '24px 24px' 
          }} 
        />
        
        {/* Floating Orbs */}
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, -50, 0],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 0], 
            y: [0, 50, 0],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-400/20 blur-[120px]" 
        />
      </div>

      {/* Header & Typography */}
      <div className="relative z-10 mb-8 text-center md:mb-12 pt-20 md:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
            Clarity Support
          </h1>
          <p className="mt-4 text-lg font-medium text-slate-500 md:text-xl">
            Le support client, enfin clair.
          </p>
        </motion.div>
      </div>

      {/* 2. The "Hero Device" */}
      <div className="relative z-20 w-full max-w-[90%] perspective-1000 md:max-w-5xl md:px-8">
        <motion.div
          style={{ 
            rotateX: isMobile ? 0 : rotateX, 
            rotateY: isMobile ? 0 : rotateY,
            transformStyle: "preserve-3d"
          }}
          initial={{ scale: 0.9, opacity: 0, rotateX: 20 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
          className="relative mx-auto aspect-[9/19] w-full max-w-[380px] rounded-[3rem] bg-white/60 shadow-2xl backdrop-blur-xl ring-1 ring-white/50 md:aspect-[16/10] md:max-w-none md:rounded-3xl"
        >
          {/* Device Reflection/Sheen */}
          <div className="absolute inset-0 z-50 rounded-[inherit] pointer-events-none bg-gradient-to-tr from-white/40 to-transparent opacity-50" />
          
          {/* 3. The Interface Factice */}
          <div className="absolute inset-0 flex flex-col overflow-hidden rounded-[inherit] md:flex-row">
            
            {/* Sidebar (Desktop) */}
            <div className="hidden w-64 flex-col border-r border-slate-200/50 bg-white/40 p-6 backdrop-blur-md md:flex">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                  <span className="font-bold">C</span>
                </div>
                <span className="font-semibold text-slate-800">Clarity</span>
              </div>
              
              <nav className="space-y-1">
                <NavItem icon={Inbox} label="Boîte de réception" active count={12} />
                <NavItem icon={BarChart3} label="Statistiques" />
                <NavItem icon={Users} label="Clients" />
                <NavItem icon={Settings} label="Paramètres" />
              </nav>

              <div className="mt-auto rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border border-blue-100/50">
                <p className="text-xs font-medium text-blue-600">Plan Pro</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-blue-100">
                  <div className="h-1.5 w-[70%] rounded-full bg-blue-500" />
                </div>
                <p className="mt-1 text-[10px] text-blue-400">70% utilisé</p>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col bg-white/30 backdrop-blur-sm">
              {/* Top Bar */}
              <div className="flex h-16 items-center justify-between border-b border-slate-200/50 px-6">
                <h2 className="text-lg font-semibold text-slate-800">Boîte de réception</h2>
                <div className="flex items-center gap-4">
                  <div className="hidden h-8 w-64 items-center gap-2 rounded-full bg-slate-100/50 px-3 text-slate-400 md:flex">
                    <Search className="h-4 w-4" />
                    <span className="text-sm">Rechercher...</span>
                  </div>
                  <button className="relative rounded-full p-2 hover:bg-slate-100/50 transition-colors">
                    <Bell className="h-5 w-5 text-slate-600" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                  </button>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 ring-2 ring-white" />
                </div>
              </div>

              {/* Content Scroll */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
                {/* Stats Row (Desktop) */}
                <div className="mb-6 hidden grid-cols-3 gap-4 md:grid">
                  <StatCard label="Tickets ouverts" value="24" trend="+12%" />
                  <StatCard label="Temps moyen" value="1h 20m" trend="-5%" good />
                  <StatCard label="Satisfaction" value="4.8/5" trend="+0.2" good />
                </div>

                {/* Ticket List */}
                <div className="space-y-3">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">Aujourd'hui</p>
                  <TicketItem 
                    avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                    name="Sophie Martin"
                    subject="Problème de connexion API"
                    time="2 min"
                    tag="Urgent"
                    preview="Bonjour, je rencontre une erreur 500 lors de..."
                  />
                  <TicketItem 
                    avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka"
                    name="Thomas Dubreuil"
                    subject="Question sur la facturation"
                    time="15 min"
                    tag="Support"
                    preview="Est-il possible de passer au plan annuel en..."
                  />
                  <TicketItem 
                    avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Mark"
                    name="Lucas Petit"
                    subject="Feature request: Dark mode"
                    time="1h"
                    tag="Feature"
                    preview="J'adore l'application ! Serait-il possible d'ajouter..."
                  />
                   <TicketItem 
                    avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                    name="Emma Wilson"
                    subject="Integration Shopify"
                    time="2h"
                    tag="Support"
                    preview="Comment synchroniser mes commandes avec..."
                  />
                   <TicketItem 
                    avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                    name="David Chen"
                    subject="Remboursement #4023"
                    time="3h"
                    tag="Billing"
                    preview="Le client demande un remboursement suite à..."
                  />
                </div>
              </div>

              {/* Mobile Bottom Nav */}
              <div className="mt-auto flex h-16 items-center justify-around border-t border-slate-200/50 bg-white/80 backdrop-blur-xl md:hidden">
                <MobileNavItem icon={Inbox} active />
                <MobileNavItem icon={Search} />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                  <Plus className="h-6 w-6" />
                </div>
                <MobileNavItem icon={BarChart3} />
                <MobileNavItem icon={Settings} />
              </div>
            </div>
          </div>

          {/* 4. Le Bouton "Tester" (Floating CTA) */}
          <div className="absolute bottom-8 left-1/2 z-50 -translate-x-1/2 md:bottom-12">
            <motion.button
              onClick={onGetStarted}
              whileHover="hover"
              initial="idle"
              animate="idle"
              className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-slate-900 px-8 py-4 pr-10 text-white shadow-2xl shadow-slate-900/30 transition-transform active:scale-95"
            >
              {/* Shimmer Effect */}
              <motion.div
                variants={{
                  idle: { x: ['-100%', '200%'] },
                  hover: { x: '100%' } // Stop shimmer on hover
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2.5, 
                  ease: "easeInOut", 
                  repeatDelay: 1 
                }}
                className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
              
              <div className="relative flex items-center gap-3 font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <LayoutDashboard className="h-4 w-4" />
                </span>
                Lancer la démo
              </div>
              
              {/* Arrow Animation */}
              <motion.span 
                variants={{
                  idle: { x: 0 },
                  hover: { x: 4 }
                }}
                className="absolute right-4"
              >
                →
              </motion.span>
            </motion.button>
          </div>

        </motion.div>
      </div>
    </section>
  );
}

// --- Subcomponents ---

function NavItem({ icon: Icon, label, active, count }: any) {
  return (
    <button className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${active ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}>
      <div className="flex items-center gap-3">
        <Icon className={`h-4 w-4 ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
        {label}
      </div>
      {count && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-100 px-1.5 text-[10px] font-bold text-blue-600">
          {count}
        </span>
      )}
    </button>
  );
}

function MobileNavItem({ icon: Icon, active }: any) {
  return (
    <button className={`flex flex-col items-center justify-center p-2 ${active ? 'text-blue-600' : 'text-slate-400'}`}>
      <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
    </button>
  );
}

function StatCard({ label, value, trend, good }: any) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-slate-100 bg-white/50 p-4 shadow-sm backdrop-blur-sm"
    >
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="mt-1 flex items-end justify-between">
        <p className="text-xl font-bold text-slate-800">{value}</p>
        <span className={`text-[10px] font-bold ${good ? 'text-emerald-500' : 'text-slate-400'}`}>
          {trend}
        </span>
      </div>
    </motion.div>
  );
}

function TicketItem({ avatar, name, subject, time, tag, preview }: any) {
  return (
    <motion.div 
      whileHover={{ scale: 0.98, backgroundColor: 'rgba(255,255,255,0.8)' }}
      whileTap={{ scale: 0.96 }}
      className="cursor-pointer rounded-2xl border border-transparent bg-white/40 p-3 transition-colors hover:border-slate-200/50 hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        <img src={avatar} alt={name} className="h-10 w-10 rounded-full bg-slate-200" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="truncate text-sm font-semibold text-slate-800">{name}</h4>
            <span className="text-[10px] text-slate-400">{time}</span>
          </div>
          <p className="truncate text-xs font-medium text-slate-600">{subject}</p>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">{preview}</p>
        </div>
      </div>
    </motion.div>
  );
}
