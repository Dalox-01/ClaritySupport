/**
 * Techniques d'optimisation des plus grands sites web
 * Inspiré de: Google, YouTube, Vercel, Airbnb, Netflix
 */

/**
 * 1. LAZY LOADING INTELLIGENT (YouTube/Netflix)
 * Charge les composants seulement quand nécessaire
 */
export const lazyLoadComponent = (
  importFunc: () => Promise<any>,
  options?: { delay?: number; preload?: boolean }
) => {
  const { delay = 0, preload = false } = options || {};
  
  // Préchargement intelligent
  if (preload && typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'script';
    document.head.appendChild(link);
  }
  
  return new Promise((resolve) => {
    setTimeout(() => {
      importFunc().then(resolve);
    }, delay);
  });
};

/**
 * 2. DEBOUNCE OPTIMISÉ (Google Search)
 * Évite les appels API excessifs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean; maxWait?: number }
): T {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastCallTime = 0;
  let lastInvokeTime = 0;
  let lastArgs: any[] | null = null;
  let lastThis: any = null;
  let result: any;

  const { leading = false, trailing = true, maxWait } = options || {};

  function invokeFunc(time: number) {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = null;
    lastInvokeTime = time;
    result = func.apply(thisArg, args!);
    return result;
  }

  function shouldInvoke(time: number) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === 0 ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutId = setTimeout(timerExpired, wait);
  }

  function trailingEdge(time: number) {
    timeoutId = null;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = null;
    return result;
  }

  function leadingEdge(time: number) {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }

  const debounced = function (this: any, ...args: any[]) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === null) {
        return leadingEdge(lastCallTime);
      }
      if (maxWait) {
        timeoutId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, wait);
    }
    return result;
  };

  debounced.cancel = function () {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    lastInvokeTime = 0;
    lastArgs = null;
    lastCallTime = 0;
    lastThis = null;
    timeoutId = null;
  };

  debounced.flush = function () {
    return timeoutId === null ? result : trailingEdge(Date.now());
  };

  return debounced as unknown as T;
}

/**
 * 3. THROTTLE (Scroll optimisé - Facebook/Twitter)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean }
): T {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastCallTime = 0;
  let lastInvokeTime = 0;
  let lastArgs: any[] | null = null;
  let lastThis: any = null;
  let result: any;

  const { leading = true, trailing = true } = options || {};

  function invokeFunc(time: number) {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = null;
    lastInvokeTime = time;
    result = func.apply(thisArg, args!);
    return result;
  }

  function shouldInvoke(time: number) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === 0 ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      timeSinceLastInvoke >= wait
    );
  }

  function trailingEdge(time: number) {
    timeoutId = null;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = null;
    return result;
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastInvoke;
    timeoutId = setTimeout(timerExpired, timeWaiting);
  }

  function leadingEdge(time: number) {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }

  const throttled = function (this: any, ...args: any[]) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === null) {
        return leadingEdge(lastCallTime);
      }
      timeoutId = setTimeout(timerExpired, wait);
      return invokeFunc(lastCallTime);
    }
    if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, wait);
    }
    return result;
  };

  throttled.cancel = function () {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    lastInvokeTime = 0;
    lastArgs = null;
    lastCallTime = 0;
    lastThis = null;
    timeoutId = null;
  };

  return throttled as unknown as T;
}

/**
 * 4. INTERSECTION OBSERVER (Lazy Images - Medium/Dev.to)
 */
export const observeElement = (
  element: Element,
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry);
          observer.unobserve(element);
        }
      });
    },
    {
      rootMargin: '50px', // Commence à charger 50px avant
      threshold: 0.01,
      ...options,
    }
  );

  observer.observe(element);
  return () => observer.disconnect();
};

/**
 * 5. REQUEST ANIMATION FRAME (Animations fluides - Apple/Stripe)
 */
export const smoothScroll = (
  element: HTMLElement,
  targetPosition: number,
  duration: number = 500
) => {
  const startPosition = element.scrollTop;
  const distance = targetPosition - startPosition;
  const startTime = performance.now();

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const animation = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easing = easeInOutCubic(progress);

    element.scrollTop = startPosition + distance * easing;

    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
};

/**
 * 6. VIRTUAL SCROLLING (Twitter/Instagram Feed)
 */
export class VirtualScroller {
  private container: HTMLElement;
  private itemHeight: number;
  private visibleRange: { start: number; end: number } = { start: 0, end: 0 };
  private totalItems: number;
  private buffer: number = 3; // Items supplémentaires à rendre

  constructor(container: HTMLElement, itemHeight: number, totalItems: number) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.totalItems = totalItems;
    this.updateVisibleRange();
  }

  updateVisibleRange() {
    const scrollTop = this.container.scrollTop;
    const containerHeight = this.container.clientHeight;

    const start = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
    const end = Math.min(
      this.totalItems,
      Math.ceil((scrollTop + containerHeight) / this.itemHeight) + this.buffer
    );

    this.visibleRange = { start, end };
  }

  getVisibleRange() {
    return this.visibleRange;
  }

  getOffsetY() {
    return this.visibleRange.start * this.itemHeight;
  }

  getTotalHeight() {
    return this.totalItems * this.itemHeight;
  }
}

/**
 * 7. MEMOIZATION (React optimization)
 */
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();

  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

/**
 * 8. WEB WORKERS (Heavy computations - Figma/Canva)
 */
export const createWorker = (fn: Function) => {
  const blob = new Blob([`(${fn.toString()})()`], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  
  return {
    worker,
    cleanup: () => {
      worker.terminate();
      URL.revokeObjectURL(url);
    },
  };
};

/**
 * 9. PREFETCH / PRELOAD (Vercel/Next.js)
 */
export const prefetchResource = (url: string, type: 'script' | 'style' | 'image' | 'fetch') => {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = type === 'fetch' ? 'prefetch' : 'preload';
  
  if (type === 'script') link.as = 'script';
  else if (type === 'style') link.as = 'style';
  else if (type === 'image') link.as = 'image';
  
  link.href = url;
  document.head.appendChild(link);
};

/**
 * 10. BATCH UPDATES (React 18 - Automatic batching)
 */
export const batchUpdates = <T extends (...args: any[]) => void>(
  updates: T[],
  interval: number = 16 // ~60fps
): (() => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  const queue: Array<() => void> = [];

  const flush = () => {
    const currentQueue = [...queue];
    queue.length = 0;
    currentQueue.forEach((update) => update());
  };

  const scheduleUpdate = (update: () => void) => {
    queue.push(update);
    if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        flush();
        timeoutId = null;
      }, interval);
    }
  };

  return () => {
    updates.forEach((update) => scheduleUpdate(update));
  };
};

/**
 * 11. IMAGE OPTIMIZATION (Cloudinary/Imgix-style)
 */
export const optimizeImageUrl = (
  url: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
  }
) => {
  const { width, height, quality = 85, format = 'auto' } = options || {};
  const params = new URLSearchParams();

  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  params.set('fm', format);

  return `${url}?${params.toString()}`;
};

/**
 * 12. LOCAL STORAGE avec expiration (Cache intelligent)
 */
export const cacheWithExpiry = {
  set: (key: string, value: any, ttl: number = 3600000) => {
    const item = {
      value,
      expiry: Date.now() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  get: (key: string) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  },

  remove: (key: string) => {
    localStorage.removeItem(key);
  },

  clear: () => {
    localStorage.clear();
  },
};
