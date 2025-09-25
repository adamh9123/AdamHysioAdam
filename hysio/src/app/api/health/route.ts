import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/monitoring/performance-monitor';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const summary = performanceMonitor.getPerformanceSummary();
    const alerts = performanceMonitor.checkPerformanceAlerts();

    // Determine overall system health
    const hasAlerts = alerts.alerts.length > 0;
    const hasWarnings = alerts.warnings.length > 0;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (hasAlerts) {
      status = 'critical';
    } else if (hasWarnings) {
      status = 'warning';
    }

    const healthReport = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      performance: {
        api: {
          totalRequests: summary.overall.totalAPIRequests,
          averageResponseTime: Math.round(summary.overall.averageAPIResponseTime),
          endpoints: Object.keys(summary.api).length
        },
        components: {
          totalRenders: summary.overall.totalComponentRenders,
          averageRenderTime: Math.round(summary.overall.averageComponentRenderTime),
          components: Object.keys(summary.components).length
        }
      },
      alerts: alerts.alerts,
      warnings: alerts.warnings
    };

    const httpStatus = status === 'critical' ? 503 : 200;

    return NextResponse.json({
      success: true,
      data: healthReport
    }, { status: httpStatus });

  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json({
      success: false,
      error: 'Health check failed',
      status: 'critical',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'clear_old_metrics') {
      performanceMonitor.clearOldMetrics();
      return NextResponse.json({
        success: true,
        message: 'Old metrics cleared'
      });
    }

    if (action === 'export_metrics') {
      const metrics = performanceMonitor.exportMetrics();
      return NextResponse.json({
        success: true,
        data: JSON.parse(metrics)
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('Health endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Health endpoint error'
    }, { status: 500 });
  }
}