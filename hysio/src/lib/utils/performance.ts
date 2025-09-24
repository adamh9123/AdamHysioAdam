// Performance utilities for optimization

// Debounce function for reducing function call frequency
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout | null = null;

  return ((...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  }) as T;
}

// Throttle function for limiting function call rate
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let isThrottled = false;

  return ((...args: any[]) => {
    if (isThrottled) {
      return;
    }

    func.apply(null, args);
    isThrottled = true;

    setTimeout(() => {
      isThrottled = false;
    }, delay);
  }) as T;
}

// Memoization utility for expensive calculations
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);

    // Prevent memory leaks by limiting cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return result;
  }) as T;
}

// Performance measurement utility
export class PerformanceTimer {
  private startTime: number;
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.startTime = performance.now();
  }

  end(): number {
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    console.debug(`[Performance] ${this.name}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  static time<T>(name: string, fn: () => T): T {
    const timer = new PerformanceTimer(name);
    try {
      return fn();
    } finally {
      timer.end();
    }
  }

  static async timeAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const timer = new PerformanceTimer(name);
    try {
      return await fn();
    } finally {
      timer.end();
    }
  }
}

// Batch state updates to reduce re-renders
export function batchUpdates<T>(
  updates: Array<() => void>,
  delay: number = 0
): void {
  if (delay === 0) {
    // Use React's automatic batching (React 18+)
    updates.forEach(update => update());
  } else {
    // Custom batching with delay
    setTimeout(() => {
      updates.forEach(update => update());
    }, delay);
  }
}

// Component re-render detector
export function detectReRenders(componentName: string) {
  const renderCount = { current: 0 };

  return () => {
    renderCount.current += 1;
    if (renderCount.current > 1) {
      console.debug(`[Re-render] ${componentName} re-rendered ${renderCount.current} times`);
    }
  };
}

// Virtual scrolling utility for large lists
export function calculateVisibleItems(
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  totalItems: number,
  overscan: number = 5
) {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan * 2);

  return {
    startIndex,
    endIndex,
    visibleCount: endIndex - startIndex + 1
  };
}

// Memory usage monitor
export function getMemoryUsage(): MemoryInfo | null {
  if ('memory' in performance) {
    return (performance as any).memory;
  }
  return null;
}

// Bundle size analyzer utility
export function analyzeBundleSize() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    return {
      totalLoadTime: navigation.loadEventEnd - navigation.navigationStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
    };
  }
  return null;
}