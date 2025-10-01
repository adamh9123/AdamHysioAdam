/**
 * Performance Monitoring and Optimization System for Hysio Medical Scribe v7.0
 * Monitors export performance, memory usage, and system health
 */

export interface PerformanceMetric {
  id: string;
  operation: string;
  category: 'export' | 'ui' | 'api' | 'storage' | 'validation';
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface PerformanceSnapshot {
  timestamp: string;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  renderTime?: number;
  networkLatency?: number;
  storageUsage?: number;
  activeConnections?: number;
  cpuUsage?: number;
}

export interface PerformanceReport {
  generatedAt: string;
  timeRange: {
    start: string;
    end: string;
  };
  summary: {
    totalOperations: number;
    averageDuration: number;
    successRate: number;
    errorRate: number;
    slowestOperation: PerformanceMetric | null;
    fastestOperation: PerformanceMetric | null;
  };
  categoryBreakdown: Record<string, {
    count: number;
    averageDuration: number;
    successRate: number;
  }>;
  alerts: PerformanceAlert[];
  recommendations: string[];
  snapshots: PerformanceSnapshot[];
  trends: {
    averageDurationTrend: number[];
    memoryUsageTrend: number[];
    errorRateTrend: number[];
  };
}

export interface PerformanceAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'performance' | 'memory' | 'error' | 'availability';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: string;
  resolved: boolean;
}

export interface PerformanceThresholds {
  exportOperationWarning: number; // milliseconds
  exportOperationCritical: number;
  memoryUsageWarning: number; // bytes
  memoryUsageCritical: number;
  errorRateWarning: number; // percentage
  errorRateCritical: number;
  renderTimeWarning: number;
  renderTimeCritical: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private snapshots: PerformanceSnapshot[] = [];
  private alerts: PerformanceAlert[] = [];
  private activeOperations: Map<string, PerformanceMetric> = new Map();
  private maxMetricsHistory = 1000;
  private maxSnapshotsHistory = 100;
  private snapshotInterval: NodeJS.Timeout | null = null;

  private readonly thresholds: PerformanceThresholds = {
    exportOperationWarning: 5000,   // 5 seconds
    exportOperationCritical: 15000, // 15 seconds
    memoryUsageWarning: 100 * 1024 * 1024,   // 100MB
    memoryUsageCritical: 250 * 1024 * 1024,  // 250MB
    errorRateWarning: 5,    // 5%
    errorRateCritical: 15,  // 15%
    renderTimeWarning: 1000,  // 1 second
    renderTimeCritical: 3000, // 3 seconds
  };

  private constructor() {
    this.startPerformanceTracking();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start tracking an operation
   */
  public startOperation(
    operation: string,
    category: PerformanceMetric['category'],
    metadata?: Record<string, any>
  ): string {
    const id = this.generateId();
    const metric: PerformanceMetric = {
      id,
      operation,
      category,
      startTime: performance.now(),
      success: false,
      timestamp: new Date().toISOString(),
      metadata
    };

    this.activeOperations.set(id, metric);
    return id;
  }

  /**
   * End tracking an operation
   */
  public endOperation(id: string, success: boolean, error?: string, additionalMetadata?: Record<string, any>): void {
    const metric = this.activeOperations.get(id);
    if (!metric) {
      console.warn(`Performance metric not found for operation ${id}`);
      return;
    }

    const endTime = performance.now();
    metric.endTime = endTime;
    metric.duration = endTime - metric.startTime;
    metric.success = success;
    metric.error = error;

    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }

    this.activeOperations.delete(id);
    this.addMetric(metric);
    this.checkPerformanceThresholds(metric);
  }

  /**
   * Track an export operation with automatic timing
   */
  public async trackExportOperation<T>(
    operation: string,
    exportFunction: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const id = this.startOperation(operation, 'export', metadata);

    try {
      const result = await exportFunction();
      this.endOperation(id, true, undefined, {
        resultSize: result instanceof Blob ? result.size : undefined
      });
      return result;
    } catch (error) {
      this.endOperation(id, false, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Track UI render performance
   */
  public trackRenderPerformance(componentName: string, renderTime: number): void {
    const id = this.generateId();
    const metric: PerformanceMetric = {
      id,
      operation: `render-${componentName}`,
      category: 'ui',
      startTime: performance.now() - renderTime,
      endTime: performance.now(),
      duration: renderTime,
      success: true,
      timestamp: new Date().toISOString(),
      metadata: { componentName }
    };

    this.addMetric(metric);
    this.checkRenderPerformance(metric);
  }

  /**
   * Track API call performance
   */
  public async trackAPICall<T>(
    endpoint: string,
    apiFunction: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const id = this.startOperation(`api-${endpoint}`, 'api', { endpoint, ...metadata });

    try {
      const result = await apiFunction();
      this.endOperation(id, true);
      return result;
    } catch (error) {
      this.endOperation(id, false, error instanceof Error ? error.message : 'API error');
      throw error;
    }
  }

  /**
   * Take a performance snapshot
   */
  public takeSnapshot(): PerformanceSnapshot {
    const timestamp = new Date().toISOString();
    const snapshot: PerformanceSnapshot = { timestamp };

    // Memory usage (if available)
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      snapshot.memoryUsage = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }

    // Network timing (rough estimation)
    if (navigator.connection) {
      snapshot.networkLatency = (navigator.connection as any).rtt || 0;
    }

    // Storage usage
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        snapshot.storageUsage = estimate.usage || 0;
      }).catch(() => {
        // Ignore storage estimation errors
      });
    }

    this.snapshots.push(snapshot);
    if (this.snapshots.length > this.maxSnapshotsHistory) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  /**
   * Generate performance report
   */
  public generateReport(timeRangeHours = 24): PerformanceReport {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - (timeRangeHours * 60 * 60 * 1000));

    const relevantMetrics = this.metrics.filter(m =>
      new Date(m.timestamp) >= startTime && new Date(m.timestamp) <= endTime
    );

    const summary = this.generateSummary(relevantMetrics);
    const categoryBreakdown = this.generateCategoryBreakdown(relevantMetrics);
    const recommendations = this.generateRecommendations(relevantMetrics, this.snapshots);
    const trends = this.generateTrends(relevantMetrics, this.snapshots);

    return {
      generatedAt: endTime.toISOString(),
      timeRange: {
        start: startTime.toISOString(),
        end: endTime.toISOString()
      },
      summary,
      categoryBreakdown,
      alerts: [...this.alerts],
      recommendations,
      snapshots: [...this.snapshots],
      trends
    };
  }

  /**
   * Get current performance status
   */
  public getCurrentStatus(): {
    health: 'excellent' | 'good' | 'warning' | 'critical';
    activeOperations: number;
    recentErrors: number;
    averageLatency: number;
    memoryUsage?: number;
    alerts: PerformanceAlert[];
  } {
    const recentMetrics = this.getRecentMetrics(60); // Last 60 minutes
    const recentErrors = recentMetrics.filter(m => !m.success).length;
    const averageLatency = this.calculateAverageDuration(recentMetrics);
    const criticalAlerts = this.alerts.filter(a => !a.resolved && a.severity === 'critical');
    const warningAlerts = this.alerts.filter(a => !a.resolved && a.severity === 'high');

    let health: 'excellent' | 'good' | 'warning' | 'critical';
    if (criticalAlerts.length > 0) {
      health = 'critical';
    } else if (warningAlerts.length > 0 || recentErrors > 5) {
      health = 'warning';
    } else if (averageLatency > this.thresholds.exportOperationWarning) {
      health = 'good';
    } else {
      health = 'excellent';
    }

    const latestSnapshot = this.snapshots[this.snapshots.length - 1];

    return {
      health,
      activeOperations: this.activeOperations.size,
      recentErrors,
      averageLatency,
      memoryUsage: latestSnapshot?.memoryUsage?.usedJSHeapSize,
      alerts: this.alerts.filter(a => !a.resolved)
    };
  }

  /**
   * Optimize performance based on current metrics
   */
  public optimizePerformance(): {
    optimizationsApplied: string[];
    recommendations: string[];
  } {
    const optimizations: string[] = [];
    const recommendations: string[] = [];
    const status = this.getCurrentStatus();

    // Memory optimization
    if (status.memoryUsage && status.memoryUsage > this.thresholds.memoryUsageWarning) {
      // Clear old metrics
      if (this.metrics.length > this.maxMetricsHistory * 0.5) {
        const toRemove = Math.floor(this.metrics.length * 0.2);
        this.metrics.splice(0, toRemove);
        optimizations.push('Cleared old performance metrics');
      }

      // Clear old snapshots
      if (this.snapshots.length > this.maxSnapshotsHistory * 0.5) {
        const toRemove = Math.floor(this.snapshots.length * 0.2);
        this.snapshots.splice(0, toRemove);
        optimizations.push('Cleared old performance snapshots');
      }

      recommendations.push('Consider reducing export batch sizes');
      recommendations.push('Enable export result cleanup after download');
    }

    // Performance optimization
    if (status.averageLatency > this.thresholds.exportOperationWarning) {
      recommendations.push('Consider implementing export caching');
      recommendations.push('Optimize export template generation');
      recommendations.push('Enable progress streaming for large exports');
    }

    // Error rate optimization
    if (status.recentErrors > 3) {
      recommendations.push('Review error handling in export pipeline');
      recommendations.push('Implement retry mechanisms for failed exports');
      recommendations.push('Add validation pre-checks to prevent errors');
    }

    return { optimizationsApplied: optimizations, recommendations };
  }

  /**
   * Start automatic performance tracking
   */
  private startPerformanceTracking(): void {
    // Take snapshots every 5 minutes
    this.snapshotInterval = setInterval(() => {
      this.takeSnapshot();
    }, 5 * 60 * 1000);

    // Monitor long-running operations
    setInterval(() => {
      this.checkLongRunningOperations();
    }, 30 * 1000); // Check every 30 seconds
  }

  /**
   * Stop automatic performance tracking
   */
  public stopTracking(): void {
    if (this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
      this.snapshotInterval = null;
    }
  }

  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }
  }

  private checkPerformanceThresholds(metric: PerformanceMetric): void {
    if (!metric.duration) return;

    if (metric.category === 'export') {
      if (metric.duration > this.thresholds.exportOperationCritical) {
        this.createAlert('critical', 'performance',
          `Export operation "${metric.operation}" took ${(metric.duration / 1000).toFixed(1)}s`,
          this.thresholds.exportOperationCritical, metric.duration);
      } else if (metric.duration > this.thresholds.exportOperationWarning) {
        this.createAlert('high', 'performance',
          `Export operation "${metric.operation}" took ${(metric.duration / 1000).toFixed(1)}s`,
          this.thresholds.exportOperationWarning, metric.duration);
      }
    }

    if (!metric.success) {
      const recentErrors = this.getRecentMetrics(60).filter(m => !m.success).length;
      const errorRate = (recentErrors / Math.max(this.getRecentMetrics(60).length, 1)) * 100;

      if (errorRate > this.thresholds.errorRateCritical) {
        this.createAlert('critical', 'error',
          `High error rate: ${errorRate.toFixed(1)}% in the last hour`,
          this.thresholds.errorRateCritical, errorRate);
      } else if (errorRate > this.thresholds.errorRateWarning) {
        this.createAlert('medium', 'error',
          `Elevated error rate: ${errorRate.toFixed(1)}% in the last hour`,
          this.thresholds.errorRateWarning, errorRate);
      }
    }
  }

  private checkRenderPerformance(metric: PerformanceMetric): void {
    if (!metric.duration) return;

    if (metric.duration > this.thresholds.renderTimeCritical) {
      this.createAlert('high', 'performance',
        `Slow render: ${metric.operation} took ${metric.duration.toFixed(0)}ms`,
        this.thresholds.renderTimeCritical, metric.duration);
    } else if (metric.duration > this.thresholds.renderTimeWarning) {
      this.createAlert('medium', 'performance',
        `Slow render: ${metric.operation} took ${metric.duration.toFixed(0)}ms`,
        this.thresholds.renderTimeWarning, metric.duration);
    }
  }

  private checkLongRunningOperations(): void {
    const now = performance.now();
    for (const [id, metric] of this.activeOperations) {
      const runTime = now - metric.startTime;

      if (runTime > this.thresholds.exportOperationCritical * 2) { // 30 seconds
        this.createAlert('critical', 'availability',
          `Operation "${metric.operation}" has been running for ${(runTime / 1000).toFixed(1)}s`,
          this.thresholds.exportOperationCritical, runTime);
      }
    }
  }

  private createAlert(
    severity: PerformanceAlert['severity'],
    type: PerformanceAlert['type'],
    message: string,
    threshold: number,
    currentValue: number
  ): void {
    const alert: PerformanceAlert = {
      id: this.generateId(),
      severity,
      type,
      message,
      threshold,
      currentValue,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    this.alerts.push(alert);

    // Auto-resolve similar alerts that are older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.alerts.forEach(existingAlert => {
      if (existingAlert.type === type &&
          existingAlert.severity === severity &&
          new Date(existingAlert.timestamp) < oneHourAgo &&
          !existingAlert.resolved) {
        existingAlert.resolved = true;
      }
    });
  }

  private getRecentMetrics(minutes: number): PerformanceMetric[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.metrics.filter(m => new Date(m.timestamp) > cutoff);
  }

  private calculateAverageDuration(metrics: PerformanceMetric[]): number {
    const validMetrics = metrics.filter(m => m.duration !== undefined);
    if (validMetrics.length === 0) return 0;

    return validMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / validMetrics.length;
  }

  private generateSummary(metrics: PerformanceMetric[]) {
    const successfulOps = metrics.filter(m => m.success);
    const sortedByDuration = [...metrics].filter(m => m.duration).sort((a, b) => (b.duration || 0) - (a.duration || 0));

    return {
      totalOperations: metrics.length,
      averageDuration: this.calculateAverageDuration(metrics),
      successRate: metrics.length > 0 ? (successfulOps.length / metrics.length) * 100 : 0,
      errorRate: metrics.length > 0 ? ((metrics.length - successfulOps.length) / metrics.length) * 100 : 0,
      slowestOperation: sortedByDuration[0] || null,
      fastestOperation: sortedByDuration[sortedByDuration.length - 1] || null
    };
  }

  private generateCategoryBreakdown(metrics: PerformanceMetric[]) {
    const categories: Record<string, PerformanceMetric[]> = {};

    metrics.forEach(metric => {
      if (!categories[metric.category]) {
        categories[metric.category] = [];
      }
      categories[metric.category].push(metric);
    });

    const breakdown: Record<string, any> = {};

    Object.entries(categories).forEach(([category, categoryMetrics]) => {
      const successful = categoryMetrics.filter(m => m.success);
      breakdown[category] = {
        count: categoryMetrics.length,
        averageDuration: this.calculateAverageDuration(categoryMetrics),
        successRate: categoryMetrics.length > 0 ? (successful.length / categoryMetrics.length) * 100 : 0
      };
    });

    return breakdown;
  }

  private generateRecommendations(metrics: PerformanceMetric[], snapshots: PerformanceSnapshot[]): string[] {
    const recommendations: string[] = [];
    const recentMetrics = metrics.slice(-50); // Last 50 operations

    // Performance recommendations
    const avgDuration = this.calculateAverageDuration(recentMetrics);
    if (avgDuration > this.thresholds.exportOperationWarning) {
      recommendations.push('Consider implementing export template caching to improve performance');
      recommendations.push('Optimize large document processing by implementing streaming');
    }

    // Error rate recommendations
    const errorRate = recentMetrics.length > 0 ?
      ((recentMetrics.length - recentMetrics.filter(m => m.success).length) / recentMetrics.length) * 100 : 0;

    if (errorRate > 5) {
      recommendations.push('Review input validation to prevent export failures');
      recommendations.push('Implement better error recovery mechanisms');
    }

    // Memory recommendations
    const latestSnapshot = snapshots[snapshots.length - 1];
    if (latestSnapshot?.memoryUsage) {
      const memoryUsage = latestSnapshot.memoryUsage.usedJSHeapSize;
      if (memoryUsage > this.thresholds.memoryUsageWarning) {
        recommendations.push('Consider implementing blob cleanup after download');
        recommendations.push('Reduce the number of concurrent export operations');
      }
    }

    return recommendations;
  }

  private generateTrends(metrics: PerformanceMetric[], snapshots: PerformanceSnapshot[]) {
    const recentMetrics = metrics.slice(-20); // Last 20 operations
    const recentSnapshots = snapshots.slice(-10); // Last 10 snapshots

    return {
      averageDurationTrend: recentMetrics.map(m => m.duration || 0),
      memoryUsageTrend: recentSnapshots.map(s => s.memoryUsage?.usedJSHeapSize || 0),
      errorRateTrend: recentMetrics.map((_, index) => {
        const slice = recentMetrics.slice(Math.max(0, index - 4), index + 1);
        return slice.length > 0 ? ((slice.length - slice.filter(m => m.success).length) / slice.length) * 100 : 0;
      })
    };
  }

  private generateId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all metrics and snapshots
   */
  public clearHistory(): void {
    this.metrics = [];
    this.snapshots = [];
    this.alerts = [];
  }

  /**
   * Get metrics for a specific operation
   */
  public getMetricsForOperation(operation: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.operation === operation);
  }

  /**
   * Export performance data
   */
  public exportPerformanceData(): string {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      metrics: this.metrics,
      snapshots: this.snapshots,
      alerts: this.alerts
    }, null, 2);
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();