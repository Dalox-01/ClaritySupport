# 🎨 Design System Signature — IA mailcenter

**Philosophie:** Chaque page a sa propre identité visuelle et animations uniques, mais toutes partagent un ADN commun cohérent.

---

## 🌈 PALETTE COULEUR (STRICTEMENT PRÉSERVÉE)

```css
/* Couleurs brand — NE PAS MODIFIER */
--primary: #1E6F5C;        /* Vert brand */
--background: #E8E2D0;     /* Beige clair */
--foreground: #6B4F3A;     /* Marron bois */

/* Dark mode */
--primary-dark: #2C2F33;   /* Gris-bleu foncé */
```

**Déclinaisons pour animations:**
- Primary light: `#26AB8C` (hover/glow)
- Primary dark: `#164F42` (shadows)
- Background alt: `#F5F1E7` (cards)
- Foreground soft: `#8B7355` (text secondaire)

---

## ✨ SYSTÈME D'ANIMATIONS SIGNATURE

### Principe: "Liquid Intelligence"

Toutes les animations suivent une **physique liquide + organique** pour différencier l'interface.

#### 1. **MORPH TRANSITIONS** (entre pages)
```typescript
// Transition Homepage → Dashboard
const morphTransition = {
  initial: { 
    clipPath: "circle(0% at 50% 50%)",
    scale: 0.8,
    rotate: -5,
  },
  animate: { 
    clipPath: "circle(150% at 50% 50%)",
    scale: 1,
    rotate: 0,
  },
  exit: {
    clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
    opacity: 0,
  },
  transition: {
    duration: 1.2,
    ease: [0.76, 0, 0.24, 1], // Cubic bezier unique
  }
}
```

#### 2. **MAGNETIC HOVER** (tous les boutons)
```typescript
// Effet magnétique sur boutons
const magneticStrength = 0.3;

const handleMouseMove = (e: MouseEvent) => {
  const { left, top, width, height } = button.getBoundingClientRect();
  const centerX = left + width / 2;
  const centerY = top + height / 2;
  const deltaX = (e.clientX - centerX) * magneticStrength;
  const deltaY = (e.clientY - centerY) * magneticStrength;
  
  gsap.to(button, {
    x: deltaX,
    y: deltaY,
    duration: 0.3,
    ease: "power2.out",
  });
};
```

#### 3. **ELASTIC CARDS** (toutes les cards)
```typescript
// Cards avec effet élastique au hover
<motion.div
  whileHover={{
    scale: 1.05,
    rotate: [0, -2, 2, 0],
    transition: {
      scale: { type: "spring", stiffness: 400, damping: 10 },
      rotate: { duration: 0.6, ease: [0.76, 0, 0.24, 1] }
    }
  }}
>
```

#### 4. **LIQUID BLOB** (backgrounds animés)
```tsx
// SVG morph blob pour backgrounds
<svg viewBox="0 0 200 200">
  <motion.path
    fill="url(#gradient)"
    animate={{
      d: [
        "M45,-65C56,-55,62,-40,65,-25C68,-10,68,5,62,18C56,31,44,42,31,50C18,58,4,63,-11,65C-26,67,-42,66,-54,58C-66,50,-74,35,-75,20C-76,5,-70,-10,-63,-24C-56,-38,-48,-51,-37,-61C-26,-71,-13,-78,1,-80C15,-82,34,-75,45,-65Z",
        "M37,-55C48,-44,57,-33,62,-19C67,-5,68,12,63,27C58,42,47,55,34,61C21,67,6,66,-10,66C-26,66,-43,67,-56,60C-69,53,-78,38,-80,22C-82,6,-77,-11,-69,-25C-61,-39,-50,-50,-38,-60C-26,-70,-13,-79,2,-82C17,-85,26,-66,37,-55Z",
        "M45,-65C56,-55,62,-40,65,-25C68,-10,68,5,62,18C56,31,44,42,31,50C18,58,4,63,-11,65C-26,67,-42,66,-54,58C-66,50,-74,35,-75,20C-76,5,-70,-10,-63,-24C-56,-38,-48,-51,-37,-61C-26,-71,-13,-78,1,-80C15,-82,34,-75,45,-65Z",
      ]
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
  <defs>
    <linearGradient id="gradient">
      <stop offset="0%" stopColor="#1E6F5C" stopOpacity="0.2" />
      <stop offset="100%" stopColor="#6B4F3A" stopOpacity="0.1" />
    </linearGradient>
  </defs>
</svg>
```

#### 5. **PARTICLE SYSTEMS** (ambiance unique par page)
```typescript
// Homepage: Floating emails (enveloppes SVG)
// Dashboard: Code snippets flottants
// Mail Center: Lettres qui volent
// Auth: Sparks électriques

const ParticleSystem = ({ type, count = 30 }) => {
  const particles = Array.from({ length: count });
  
  return (
    <>
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className={`particle particle-${type}`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, Math.random() * -200, 0],
            x: [0, Math.sin(i) * 50, 0],
            opacity: [0, 0.6, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      ))}
    </>
  );
};
```

#### 6. **TEXT REVEAL ANIMATIONS**
```tsx
// Animation de texte lettre par lettre avec effet wave
const TextReveal = ({ text }: { text: string }) => {
  const letters = text.split("");
  
  return (
    <span>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ y: 50, opacity: 0, rotateX: 90 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{
            delay: i * 0.03,
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={{
            y: -10,
            color: "#1E6F5C",
            transition: { duration: 0.2 }
          }}
          className="inline-block"
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </span>
  );
};
```

#### 7. **CURSOR FOLLOWER CUSTOM**
```typescript
// Curseur personnalisé avec trail liquide
const CustomCursor = () => {
  const cursorRef = useRef(null);
  const trailRef = useRef([]);
  
  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.2,
        ease: "power2.out",
      });
      
      // Trail effect
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      trail.style.left = e.clientX + 'px';
      trail.style.top = e.clientY + 'px';
      document.body.appendChild(trail);
      
      setTimeout(() => trail.remove(), 800);
    };
    
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);
  
  return (
    <div 
      ref={cursorRef}
      className="custom-cursor"
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        border: '2px solid #1E6F5C',
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 9999,
        mixBlendMode: 'difference',
      }}
    />
  );
};
```

---

## 🎭 IDENTITÉ PAR PAGE

### **Homepage** — "Liquid Minimalism"
**Thème:** Douceur liquide, fluidité professionnelle

**Animations signature:**
- Hero: Blob SVG morphing derrière titre
- Text: Gradient flow infini sur "intelligent des emails"
- CTA: Magnetic buttons avec ripple liquid
- Features: Cards avec elastic bounce + shimmer trail
- Pricing: Plans qui "flottent" en 3D au hover
- Scroll: Smooth scroll Lenis avec parallax subtil

**Couleurs dominantes:** Primary green + beige backgrounds

---

### **Dashboard** — "Generative Energy"
**Thème:** Énergie créative, productivité dynamique

**Animations signature:**
- Sidebar: Slide elastic avec spring physics
- Form fields: Floating labels avec liquid transition
- Generate button: Pulse glow + particle burst onclick
- Result card: Morph transition depuis point de clic
- History: Staggered list reveal avec elastic overshoot
- AI chat: Messages qui "poussent" avec spring

**Couleurs dominantes:** Green accents + white cards sur beige

**Particules:** Code snippets `</>`, `{}` qui flottent

---

### **Mail Center** — "Inbox Flow"
**Thème:** Organisation zen, flux maîtrisé

**Animations signature:**
- Email cards: Swipe gestures avec physics naturelle
- Status badges: Morph color transition
- Sidebar filters: Accordion avec liquid expand
- Search bar: Focus expand avec backdrop blur wave
- Sync button: Rotation 3D + success checkmark morph
- Empty state: Lottie animation envelope ouverte

**Couleurs dominantes:** Soft greens + subtle grays

**Particules:** Enveloppes ✉️ SVG qui volent doucement

---

### **Auth (Login/Signup)** — "Secure Spark"
**Thème:** Sécurité électrique, confiance technologique

**Animations signature:**
- Form container: 3D tilt au mouse move
- Input focus: Electric border glow qui se propage
- Password field: Visibility toggle avec morph icon
- Submit button: Loading state = circle expand
- Success: Confetti particles explosion
- Error shake: Elastic shake avec red glow pulse

**Couleurs dominantes:** Green primary + white form sur beige

**Particules:** Sparks électriques (petits lightning SVG)

---

### **Contact** — "Message Sending"
**Thème:** Communication chaleureuse, réponse rapide

**Animations signature:**
- Hero: Paper plane SVG qui vole en boucle
- Form: Fields qui "s'écrivent" au focus (placeholder animation)
- Send button: Avion qui décolle + trail
- Success: Checkmark draw animation SVG
- Map (si présent): Pins qui "tombent" avec bounce

**Couleurs dominantes:** Warm beige + green accents

---

## 🧩 COMPOSANTS CORE CUSTOM

### `<LiquidButton>`
```tsx
interface LiquidButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  magnetic?: boolean;
  ripple?: boolean;
}

export const LiquidButton = ({ children, magnetic = true, ...props }: LiquidButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handleClick = (e: React.MouseEvent) => {
    if (props.ripple) {
      // Créer ripple effect
      const ripple = document.createElement('span');
      const rect = buttonRef.current!.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.className = 'ripple-effect';
      
      buttonRef.current!.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
  };
  
  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      className={cn('liquid-button', `variant-${props.variant}`, `size-${props.size}`)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onMouseMove={magnetic ? handleMagneticMove : undefined}
      onMouseLeave={magnetic ? () => gsap.to(buttonRef.current, { x: 0, y: 0 }) : undefined}
    >
      {children}
    </motion.button>
  );
};
```

### `<ElasticCard>`
```tsx
export const ElasticCard = ({ children, hoverLift = true }: ElasticCardProps) => {
  return (
    <motion.div
      className="elastic-card"
      whileHover={hoverLift ? {
        y: -10,
        boxShadow: "0 20px 40px rgba(30, 111, 92, 0.15)",
        transition: { type: "spring", stiffness: 300, damping: 20 }
      } : {}}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="card-shimmer"
        initial={{ x: "-100%" }}
        whileHover={{ x: "200%" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      {children}
    </motion.div>
  );
};
```

### `<MorphIcon>`
```tsx
// Icons qui morphent entre états
export const MorphIcon = ({ from, to, trigger }: MorphIconProps) => {
  const [current, setCurrent] = useState(from);
  
  useEffect(() => {
    if (trigger) {
      setCurrent(to);
      setTimeout(() => setCurrent(from), 2000);
    }
  }, [trigger]);
  
  return (
    <motion.div
      key={current}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      {current === 'check' ? <Check /> : <X />}
    </motion.div>
  );
};
```

---

## 📐 LAYOUT INNOVANTS

### Grid System "Organic Bento"
```css
.organic-bento {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
  
  /* Cards de tailles variables */
  .card-large { grid-column: span 8; grid-row: span 2; }
  .card-medium { grid-column: span 6; grid-row: span 1; }
  .card-small { grid-column: span 4; grid-row: span 1; }
  
  /* Chaque card a un border-radius unique */
  .card:nth-child(1) { border-radius: 32px 8px 32px 8px; }
  .card:nth-child(2) { border-radius: 8px 32px 8px 32px; }
  .card:nth-child(3) { border-radius: 24px 24px 8px 8px; }
  /* ... patterns aléatoires mais cohérents */
}
```

### Asymmetric Hero Layout
```tsx
// Hero avec layout asymétrique unique
<div className="hero-asymmetric">
  <div className="content" style={{ 
    gridColumn: '1 / 7',
    gridRow: '2 / 4',
  }}>
    <h1>Titre</h1>
  </div>
  <div className="visual" style={{
    gridColumn: '7 / 13',
    gridRow: '1 / 5',
    clipPath: 'polygon(10% 0%, 100% 0%, 100% 100%, 0% 100%)',
  }}>
    <Image />
  </div>
</div>
```

---

## 🎬 TRANSITIONS DE PAGE

### Router-level page transitions
```tsx
// layout.tsx
<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
  >
    {children}
  </motion.div>
</AnimatePresence>

const pageVariants = {
  initial: (direction: number) => ({
    clipPath: direction > 0 
      ? "circle(0% at 100% 50%)" 
      : "circle(0% at 0% 50%)",
    opacity: 0,
  }),
  animate: {
    clipPath: "circle(150% at 50% 50%)",
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.76, 0, 0.24, 1],
    }
  },
  exit: {
    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: [0.76, 0, 0.24, 1],
    }
  }
};
```

---

## 🎨 CSS UTILITIES SIGNATURE

```css
/* Glassmorphism brand */
.glass {
  background: rgba(232, 226, 208, 0.7);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(30, 111, 92, 0.1);
}

.glass-dark {
  background: rgba(44, 47, 51, 0.7);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(30, 111, 92, 0.2);
}

/* Shimmer effect */
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(30, 111, 92, 0.1) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 3s infinite;
}

/* Liquid glow */
.liquid-glow {
  box-shadow: 
    0 0 20px rgba(30, 111, 92, 0.3),
    0 0 40px rgba(30, 111, 92, 0.2),
    0 0 60px rgba(30, 111, 92, 0.1);
  animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { filter: brightness(1) saturate(1); }
  50% { filter: brightness(1.2) saturate(1.3); }
}

/* Text gradient flow */
.text-gradient-flow {
  background: linear-gradient(
    90deg,
    #6B4F3A 0%,
    #1E6F5C 25%,
    #26AB8C 50%,
    #1E6F5C 75%,
    #6B4F3A 100%
  );
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-flow 4s linear infinite;
}

@keyframes gradient-flow {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
```

---

## 🔊 MICRO-INTERACTIONS SONORES (optionnel)

```typescript
// Sons subtils sur interactions
const playSound = (type: 'click' | 'hover' | 'success' | 'error') => {
  const sounds = {
    click: '/sounds/click.mp3',  // Son doux "pop"
    hover: '/sounds/hover.mp3',  // Son léger "whoosh"
    success: '/sounds/success.mp3', // Son "ding" agréable
    error: '/sounds/error.mp3',  // Son "buzz" court
  };
  
  const audio = new Audio(sounds[type]);
  audio.volume = 0.2; // Très subtil
  audio.play();
};
```

---

## ✅ CHECKLIST D'IMPLÉMENTATION

- [ ] Installer dépendances: `gsap`, `@gsap/react`, `@lottiefiles/react-lottie-player`
- [ ] Créer composants signature: `LiquidButton`, `ElasticCard`, `MorphIcon`, `TextReveal`
- [ ] Implémenter `CustomCursor` global
- [ ] Créer `ParticleSystem` avec variants par page
- [ ] Setup page transitions dans `layout.tsx`
- [ ] Créer animations Lottie custom (envelope, checkmark, loading)
- [ ] Implémenter smooth scroll Lenis
- [ ] Ajouter sons micro-interactions (optionnel)
- [ ] Tester performance 60fps sur toutes animations
- [ ] Valider reduced-motion support

---

## 📚 RESSOURCES

- **Inspiration animations:** [Awwwards Site of the Day](https://awwwards.com/sites/ia-mailcenter) (pour référence future)
- **Cubic bezier custom:** `[0.76, 0, 0.24, 1]` — Signature "Liquid Ease"
- **Spring physics:** `stiffness: 300, damping: 20` — Défaut élastique
- **Durées standards:** 0.3s (micro), 0.6s (small), 1.2s (large)

---

**Next:** Commencer implémentation par Homepage Hero révolutionnaire. 🚀
