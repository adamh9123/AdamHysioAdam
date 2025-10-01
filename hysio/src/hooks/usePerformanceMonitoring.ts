'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { performanceMonitor, type PerformanceReport } from '@/lib/performance/performance-monitor';

/**
 * Hook for monitoring component render performance
 */
export function useRenderPerformance(componentName: string) {
  const renderStartTime = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    performanceMonitor.trackRenderPerformance(componentName, renderTime);
  });
}

/**
 * Hook for monitoring export operations
 */
export function useExportPerformance() {
  const trackExport = useCallback(async <T>(
    operationName: string,
    exportFunction: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    return performanceMonitor.trackExportOperation(operationName, exportFunction, metadata);
  }, []);

  const trackAPI = useCallback(async <T>(
    endpoint: string,
    apiFunction: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    return performanceMonitor.trackAPICall(endpoint, apiFunction, metadata);
  }, []);

  return { trackExport, trackAPI };
}

/**
 * Hook for real-time performance status
 */
export function usePerformanceStatus(refreshInterval = 30000) {
  const [status, setStatus] = useState(() => performanceMonitor.getCurrentStatus());
  const [report, setReport] = useState<PerformanceReport | null>(null);

  const refreshStatus = useCallback(() => {
    setStatus(performanceMonitor.getCurrentStatus());
  }, []);

  const generateReport = useCallback((hours = 24) => {
    const newReport = performanceMonitor.generateReport(hours);
    setReport(newReport);
    return newReport;
  }, []);

  const optimizePerformance = useCallback(() => {
    return performanceMonitor.optimizePerformance();
  }, []);

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshStatus, refreshInterval]);

  return {
    status,
    report,
    refreshStatus,
    generateReport,
    optimizePerformance
  };
}

/**
 * Hook for performance-aware operations
 */
export function usePerformanceAware() {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const withPerformanceTracking = useCallback(async <T>(
    operation: string,
    category: 'export' | 'ui' | 'api' | 'storage' | 'validation',
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    const id = performanceMonitor.startOperation(operation, category, metadata);

    try {
      const result = await fn();
      performanceMonitor.endOperation(id, true, undefined, {
        resultType: typeof result,
        resultSize: result instanceof Blob ? result.size : undefined
      });
      return result;
    } catch (error) {
      performanceMonitor.endOperation(id, false, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }, []);

  const optimizeSystem = useCallback(async () => {
    if (isOptimizing) return;

    setIsOptimizing(true);
    try {
      const optimization = performanceMonitor.optimizePerformance();

      // Trigger garbage collection if available (development only)
      if ('gc' in window && typeof (window as any).gc === 'function') {
        (window as any).gc();
      }

      return optimization;
    } finally {
      setIsOptimizing(false);
    }
  }, [isOptimizing]);

  return {
    withPerformanceTracking,
    optimizeSystem,
    isOptimizing
  };
}