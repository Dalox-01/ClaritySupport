'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { debounce, throttle } from '@/lib/performance-optimizations';

/**
 * Hook pour lazy loading intelligent
 * Inspiré de YouTube/Netflix
 */
export function useLazyLoad(ref: React.RefObject<HTMLElement>, options?: IntersectionObserverInit) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setHasLoaded(true);
            observer.unobserve(element);
          }
        });
      },
      {
        rootMargin: '100px', // Commence à charger 100px avant
        threshold: 0.01,
        ...options,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, hasLoaded, options]);

  return { isVisible, hasLoaded };
}

/**
 * Hook pour scroll optimisé
 * Inspiré de Twitter/Facebook
 */
export function useOptimizedScroll(callback: (scrollTop: number) => void, delay: number = 100) {
  const throttledCallback = useRef(throttle(callback, delay)).current;

  useEffect(() => {
    const handleScroll = () => {
      throttledCallback(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [throttledCallback]);
}

/**
 * Hook pour debounce de recherche
 * Inspiré de Google Search
 */
export function useDebouncedSearch<T>(
  searchFunc: (query: string) => Promise<T[]>,
  delay: number = 300
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchFunc(searchQuery);
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, delay),
    [searchFunc, delay]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return { query, setQuery, results, isLoading };
}

/**
 * Hook pour préchargement intelligent
 * Inspiré de Vercel/Next.js
 */
export function usePrefetch() {
  const prefetchResource = useCallback((url: string, type: 'script' | 'style' | 'image' | 'fetch') => {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = type === 'fetch' ? 'prefetch' : 'preload';
    
    if (type === 'script') link.as = 'script';
    else if (type === 'style') link.as = 'style';
    else if (type === 'image') link.as = 'image';
    
    link.href = url;
    document.head.appendChild(link);
  }, []);

  return { prefetchResource };
}

/**
 * Hook pour Virtual Scrolling
 * Inspiré de Twitter/Instagram
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  const buffer = 3; // Items supplémentaires à rendre

  const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const visibleEnd = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const offsetY = visibleStart * itemHeight;
  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    offsetY,
    totalHeight,
    handleScroll,
    visibleRange: { start: visibleStart, end: visibleEnd },
  };
}

/**
 * Hook pour performance monitoring
 * Inspiré de Google Analytics / Vercel Analytics
 */
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Log seulement si render > 16ms (60fps threshold)
      if (renderTime > 16) {
        console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
    };
  }, [componentName]);
}

/**
 * Hook pour Web Workers
 * Inspiré de Figma/Canva
 */
export function useWebWorker<T, R>(
  workerFunction: (data: T) => R
): [(data: T) => Promise<R>, () => void] {
  const workerRef = useRef<Worker | null>(null);

  const runWorker = useCallback(async (data: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        const blob = new Blob([`(${workerFunction.toString()})()`], {
          type: 'application/javascript',
        });
        const url = URL.createObjectURL(blob);
        workerRef.current = new Worker(url);
      }

      workerRef.current.onmessage = (e: MessageEvent<R>) => {
        resolve(e.data);
      };

      workerRef.current.onerror = (error) => {
        reject(error);
      };

      workerRef.current.postMessage(data);
    });
  }, [workerFunction]);

  const cleanup = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return [runWorker, cleanup];
}

/**
 * Hook pour cache intelligent
 * Inspiré de SWR/React Query
 */
export function useCache<T>(key: string, ttl: number = 3600000) {
  const [data, setData] = useState<T | null>(() => {
    if (typeof window === 'undefined') return null;

    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const item = JSON.parse(cached);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  });

  const updateCache = useCallback((value: T) => {
    const item = {
      value,
      expiry: Date.now() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
    setData(value);
  }, [key, ttl]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(key);
    setData(null);
  }, [key]);

  return { data, updateCache, clearCache };
}

/**
 * Hook pour Intersection Observer Batch
 * Optimise plusieurs observations simultanées
 */
export function useBatchIntersectionObserver(
  refs: React.RefObject<HTMLElement>[],
  callback: (index: number, entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = refs.findIndex((ref) => ref.current === entry.target);
          if (index !== -1) {
            callback(index, entry);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
        ...options,
      }
    );

    refs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, [refs, callback, options]);
}

/**
 * Hook pour optimisation images
 * Progressive loading
 */
export function useProgressiveImage(src: string, placeholderSrc?: string) {
  const [imgSrc, setImgSrc] = useState(placeholderSrc || src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImgSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setIsLoading(false);
    };
  }, [src]);

  return { imgSrc, isLoading };
}
