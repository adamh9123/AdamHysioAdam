// Comprehensive performance monitoring and metrics system

import * as React from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

interface APIMetrics {
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  totalRequests: number;
  totalErrors: number;
  totalCacheHits: number;
  lastRequest: number;
}

interface ComponentMetrics {
  renderCount: number;
  averageRenderTime: number;
  memoryUsage: number;
  reRenderRate: number;
  lastRender: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private apiMetrics: Map<string, APIMetrics> = new Map();
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private maxMetrics = 1000; // Maximum number of metrics to store

  // Record a performance metric
  recordMetric(
    name: string,
    value: number,
    tags?: Record<string, string>,
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
      metadata
    };

    this.metrics.push(metric);

    // Prevent memory leaks by limiting stored metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    console.debug(`[Performance] ${name}: ${value}`, { tags, metadata });
  }

  // Record API performance
  recordAPICall(
    endpoint: string,
    responseTime: number,
    isError: boolean = false,
    isCacheHit: boolean = false
  ): void {
    const existing = this.apiMetrics.get(endpoint) || {
      requestCount: 0,
      averageResponseTime: 0,
      errorRate: 0,
      cacheHitRate: 0,
      totalRequests: 0,
      totalErrors: 0,
      totalCacheHits: 0,
      lastRequest: 0
    };

    existing.totalRequests += 1;
    existing.requestCount += 1;
    existing.lastRequest = Date.now();

    if (isError) {
      existing.totalErrors += 1;
    }

    if (isCacheHit) {
      existing.totalCacheHits += 1;
    }

    // Calculate running averages
    existing.averageResponseTime = (
      (existing.averageResponseTime * (existing.totalRequests - 1) + responseTime) /
      existing.totalRequests
    );

    existing.errorRate = existing.totalErrors / existing.totalRequests;
    existing.cacheHitRate = existing.totalCacheHits / existing.totalRequests;

    this.apiMetrics.set(endpoint, existing);

    this.recordMetric(`api.${endpoint}.response_time`, responseTime, {
      endpoint,
      error: isError.toString(),
      cache_hit: isCacheHit.toString()
    });
  }

  // Record component performance
  recordComponentRender(
    componentName: string,
    renderTime: number,
    memoryUsage?: number
  ): void {
    const existing = this.componentMetrics.get(componentName) || {
      renderCount: 0,
      averageRenderTime: 0,
      memoryUsage: 0,
      reRenderRate: 0,
      lastRender: 0
    };

    existing.renderCount += 1;
    existing.lastRender = Date.now();

    // Calculate running average
    existing.averageRenderTime = (
      (existing.averageRenderTime * (existing.renderCount - 1) + renderTime) /
      existing.renderCount
    );

    if (memoryUsage) {
      existing.memoryUsage = memoryUsage;
    }

    // Calculate re-render rate (renders per minute)
    const timeSinceFirstRender = Date.now() - (existing.lastRender - (existing.renderCount * 1000));
    existing.reRenderRate = (existing.renderCount / (timeSinceFirstRender / 60000)) || 0;

    this.componentMetrics.set(componentName, existing);

    this.recordMetric(`component.${componentName}.render_time`, renderTime, {
      component: componentName,
      render_count: existing.renderCount.toString()
    });
  }

  // Get metrics for a specific time range
  getMetrics(
    startTime?: number,
    endTime?: number,
    nameFilter?: string
  ): PerformanceMetric[] {
    const start = startTime || 0;
    const end = endTime || Date.now();

    return this.metrics.filter(metric =>
      metric.timestamp >= start &&
      metric.timestamp <= end &&
      (!nameFilter || metric.name.includes(nameFilter))
    );
  }

  // Get API metrics summary
  getAPIMetrics(): Map<string, APIMetrics> {
    return new Map(this.apiMetrics);
  }

  // Get component metrics summary
  getComponentMetrics(): Map<string, ComponentMetrics> {
    return new Map(this.componentMetrics);
  }

  // Get performance summary
  getPerformanceSummary(): {
    api: Record<string, APIMetrics>;
    components: Record<string, ComponentMetrics>;
    overall: {
      totalMetrics: number;
      totalAPIRequests: number;
      averageAPIResponseTime: number;
      totalComponentRenders: number;
      averageComponentRenderTime: number;
    };
  } {
    const apiSummary: Record<string, APIMetrics> = {};
    const componentSummary: Record<string, ComponentMetrics> = {};

    let totalAPIRequests = 0;
    let totalAPIResponseTime = 0;
    let totalComponentRenders = 0;
    let totalComponentRenderTime = 0;

    // Aggregate API metrics
    for (const [endpoint, metrics] of this.apiMetrics) {
      apiSummary[endpoint] = metrics;
      totalAPIRequests += metrics.totalRequests;
      totalAPIResponseTime += metrics.averageResponseTime * metrics.totalRequests;
    }

    // Aggregate component metrics
    for (const [component, metrics] of this.componentMetrics) {
      componentSummary[component] = metrics;
      totalComponentRenders += metrics.renderCount;
      totalComponentRenderTime += metrics.averageRenderTime * metrics.renderCount;
    }

    return {
      api: apiSummary,
      components: componentSummary,
      overall: {
        totalMetrics: this.metrics.length,
        totalAPIRequests,
        averageAPIResponseTime: totalAPIRequests > 0 ? totalAPIResponseTime / totalAPIRequests : 0,
        totalComponentRenders,
        averageComponentRenderTime: totalComponentRenders > 0 ? totalComponentRenderTime / totalComponentRenders : 0
      }
    };
  }

  // Clear old metrics
  clearOldMetrics(olderThan: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - olderThan;
    this.metrics = this.metrics.filter(metric => metric.timestamp > cutoff);
  }

  // Export metrics for external analysis
  exportMetrics(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      metrics: this.metrics,
      apiMetrics: Object.fromEntries(this.apiMetrics),
      componentMetrics: Object.fromEntries(this.componentMetrics)
    }, null, 2);
  }

  // Import metrics from external source
  importMetrics(data: string): void {
    try {
      const parsed = JSON.parse(data);
      if (parsed.metrics) {
        this.metrics = parsed.metrics;
      }
      if (parsed.apiMetrics) {
        this.apiMetrics = new Map(Object.entries(parsed.apiMetrics));
      }
      if (parsed.componentMetrics) {
        this.componentMetrics = new Map(Object.entries(parsed.componentMetrics));
      }
    } catch (error) {
      console.error('Failed to import metrics:', error);
    }
  }

  // Real-time performance alerts
  checkPerformanceAlerts(): {
    alerts: string[];
    warnings: string[];
  } {
    const alerts: string[] = [];
    const warnings: string[] = [];

    // Check API performance
    for (const [endpoint, metrics] of this.apiMetrics) {
      if (metrics.averageResponseTime > 5000) {
        alerts.push(`High API response time for ${endpoint}: ${metrics.averageResponseTime.toFixed(0)}ms`);
      } else if (metrics.averageResponseTime > 2000) {
        warnings.push(`Elevated API response time for ${endpoint}: ${metrics.averageResponseTime.toFixed(0)}ms`);
      }

      if (metrics.errorRate > 0.1) {
        alerts.push(`High error rate for ${endpoint}: ${(metrics.errorRate * 100).toFixed(1)}%`);
      } else if (metrics.errorRate > 0.05) {
        warnings.push(`Elevated error rate for ${endpoint}: ${(metrics.errorRate * 100).toFixed(1)}%`);
      }
    }

    // Check component performance
    for (const [component, metrics] of this.componentMetrics) {
      if (metrics.averageRenderTime > 100) {
        alerts.push(`Slow component render for ${component}: ${metrics.averageRenderTime.toFixed(0)}ms`);
      } else if (metrics.averageRenderTime > 50) {
        warnings.push(`Slow component render for ${component}: ${metrics.averageRenderTime.toFixed(0)}ms`);
      }

      if (metrics.reRenderRate > 60) {
        alerts.push(`High re-render rate for ${component}: ${metrics.reRenderRate.toFixed(1)} renders/min`);
      } else if (metrics.reRenderRate > 30) {
        warnings.push(`High re-render rate for ${component}: ${metrics.reRenderRate.toFixed(1)} renders/min`);
      }
    }

    return { alerts, warnings };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions for common use cases
export function recordAPIPerformance(
  endpoint: string,
  startTime: number,
  isError: boolean = false,
  isCacheHit: boolean = false
): void {
  const responseTime = Date.now() - startTime;
  performanceMonitor.recordAPICall(endpoint, responseTime, isError, isCacheHit);
}

export function recordComponentPerformance(
  componentName: string,
  startTime: number,
  memoryUsage?: number
): void {
  const renderTime = Date.now() - startTime;
  performanceMonitor.recordComponentRender(componentName, renderTime, memoryUsage);
}

// React hook for component performance monitoring
export function usePerformanceMonitoring(componentName: string) {
  const startTime = React.useRef(Date.now());
  const renderCount = React.useRef(0);

  React.useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - startTime.current;

    recordComponentPerformance(componentName, startTime.current);
    startTime.current = Date.now();
  });

  return {
    renderCount: renderCount.current,
    recordMetric: (name: string, value: number) =>
      performanceMonitor.recordMetric(`${componentName}.${name}`, value)
  };
}

// Performance monitoring middleware for API routes
export function createPerformanceMiddleware(endpoint: string) {
  return {
    start: () => Date.now(),
    end: (startTime: number, isError: boolean = false, isCacheHit: boolean = false) => {
      recordAPIPerformance(endpoint, startTime, isError, isCacheHit);
    }
  };
}

export default performanceMonitor;