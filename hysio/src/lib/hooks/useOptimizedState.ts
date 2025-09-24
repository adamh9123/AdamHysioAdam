// Optimized state management hooks for better React performance

import * as React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { debounce } from '@/lib/utils/performance';

// Hook for debounced state updates (e.g., search inputs, text areas)
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, T, (value: T) => void] {
  const [immediateValue, setImmediateValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  const debouncedSetValue = useMemo(
    () => debounce((value: T) => setDebouncedValue(value), delay),
    [delay]
  );

  const setValue = useCallback((value: T) => {
    setImmediateValue(value);
    debouncedSetValue(value);
  }, [debouncedSetValue]);

  return [immediateValue, debouncedValue, setValue];
}

// Hook for memoized expensive calculations
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}

// Hook for stable callbacks to prevent unnecessary re-renders
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(((...args: any[]) => {
    return callbackRef.current(...args);
  }) as T, []);
}

// Hook for optimized object state updates
export function useOptimizedObjectState<T extends Record<string, any>>(
  initialState: T
) {
  const [state, setState] = useState<T>(initialState);

  const updateState = useCallback((updates: Partial<T>) => {
    setState(prevState => {
      // Only update if there are actual changes
      const hasChanges = Object.keys(updates).some(
        key => prevState[key] !== updates[key]
      );

      if (!hasChanges) {
        return prevState; // Return same reference to prevent re-renders
      }

      return { ...prevState, ...updates };
    });
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  return [state, updateState, resetState] as const;
}

// Hook for optimized array state management
export function useOptimizedArrayState<T>(initialArray: T[] = []) {
  const [items, setItems] = useState<T[]>(initialArray);

  const addItem = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateItem = useCallback((index: number, item: T) => {
    setItems(prev => prev.map((existingItem, i) => i === index ? item : existingItem));
  }, []);

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  const memoizedItems = useMemo(() => items, [items]);

  return {
    items: memoizedItems,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    count: items.length
  };
}

// Hook for performance monitoring within components
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  renderCount.current += 1;

  const logPerformance = useCallback(() => {
    const endTime = Date.now();
    const duration = endTime - startTime.current;
    console.debug(`[Performance] ${componentName} - Renders: ${renderCount.current}, Duration: ${duration}ms`);
  }, [componentName]);

  // Log performance on unmount
  React.useEffect(() => {
    return () => logPerformance();
  }, [logPerformance]);

  return {
    renderCount: renderCount.current,
    logPerformance
  };
}