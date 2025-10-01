'use client';

import React, { useState } from 'react';
import { Activity, Zap, Clock, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Minimize2 } from 'lucide-react';
import { usePerformanceStatus } from '@/hooks/usePerformanceMonitoring';

interface PerformanceDashboardProps {
  className?: string;
  compact?: boolean;
  autoRefresh?: boolean;
}

export function PerformanceDashboard({
  className = '',
  compact = false,
  autoRefresh = true
}: PerformanceDashboardProps) {
  const [showDetails, setShowDetails] = useState(!compact);
  const { status, report, generateReport, optimizePerformance } = usePerformanceStatus(
    autoRefresh ? 30000 : 0
  );

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'good':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatMemory = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)}MB`;
  };

  const handleOptimize = async () => {
    try {
      const result = await optimizePerformance();
      console.log('Performance optimization completed:', result);
    } catch (error) {
      console.error('Performance optimization failed:', error);
    }
  };

  const handleGenerateReport = () => {
    generateReport(24); // Generate 24-hour report
  };

  if (compact) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getHealthIcon(status.health)}
            <div>
              <h3 className="font-medium text-gray-900">System Performance</h3>
              <p className="text-sm text-gray-600 capitalize">{status.health}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Activity className="h-4 w-4" />
              <span>{status.activeOperations}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(status.averageLatency)}</span>
            </div>
            {status.alerts.length > 0 && (
              <div className="flex items-center space-x-1">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span>{status.alerts.length}</span>
              </div>
            )}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-hysio-deep-green" />
            <div>
              <h2 className="text-xl font-semibold text-hysio-deep-green">Performance Monitor</h2>
              <p className="text-sm text-gray-600">Real-time system performance and optimization</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleGenerateReport}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Generate Report
            </button>
            <button
              onClick={handleOptimize}
              className="px-4 py-2 bg-hysio-deep-green text-white rounded-lg hover:bg-hysio-deep-green/90 transition-colors"
            >
              <Zap className="h-4 w-4 inline mr-2" />
              Optimize
            </button>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="p-6 border-b border-gray-200">
        <div className={`p-4 rounded-lg border-2 ${getHealthColor(status.health)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getHealthIcon(status.health)}
              <div>
                <h3 className="font-semibold text-lg capitalize">{status.health} Performance</h3>
                <p className="text-sm opacity-75">
                  {status.activeOperations} active operations • {status.recentErrors} recent errors
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatDuration(status.averageLatency)}</div>
              <div className="text-sm opacity-75">Average Latency</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<Activity className="h-6 w-6 text-blue-500" />}
            title="Active Operations"
            value={status.activeOperations}
            subtitle="Currently running"
            color="blue"
          />

          <MetricCard
            icon={<Clock className="h-6 w-6 text-purple-500" />}
            title="Avg Latency"
            value={formatDuration(status.averageLatency)}
            subtitle="Response time"
            color="purple"
          />

          <MetricCard
            icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
            title="Recent Errors"
            value={status.recentErrors}
            subtitle="Last hour"
            color="red"
            trend={status.recentErrors > 0 ? 'up' : 'stable'}
          />

          <MetricCard
            icon={<Zap className="h-6 w-6 text-green-500" />}
            title="Memory Usage"
            value={formatMemory(status.memoryUsage)}
            subtitle="JS Heap Size"
            color="green"
          />
        </div>
      </div>

      {/* Alerts */}
      {status.alerts.length > 0 && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h3>
          <div className="space-y-3">
            {status.alerts.slice(0, 5).map((alert, index) => (
              <div
                key={`${alert.id}-${index}`}
                className={`p-3 rounded-lg border-l-4 ${
                  alert.severity === 'critical'
                    ? 'bg-red-50 border-red-500 text-red-800'
                    : alert.severity === 'high'
                    ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
                    : 'bg-blue-50 border-blue-500 text-blue-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm opacity-75">
                      {new Date(alert.timestamp).toLocaleTimeString('nl-NL')}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full uppercase font-medium">
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Summary */}
      {report && (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Report</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-600">Total Operations</p>
              <p className="text-xl font-bold text-blue-700">{report.summary.totalOperations}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-green-600">Success Rate</p>
              <p className="text-xl font-bold text-green-700">
                {report.summary.successRate.toFixed(1)}%
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-purple-600">Avg Duration</p>
              <p className="text-xl font-bold text-purple-700">
                {formatDuration(report.summary.averageDuration)}
              </p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-orange-600">Error Rate</p>
              <p className="text-xl font-bold text-orange-700">
                {report.summary.errorRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Optimization Recommendations</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {report.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  color: 'blue' | 'purple' | 'red' | 'green';
  trend?: 'up' | 'down' | 'stable';
}

function MetricCard({ icon, title, value, subtitle, color, trend }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    red: 'bg-red-50 border-red-200',
    green: 'bg-green-50 border-green-200',
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        {trend && getTrendIcon()}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-600">{subtitle}</p>
      </div>
    </div>
  );
}