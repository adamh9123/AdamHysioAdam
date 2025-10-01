'use client';

import React, { useState, useEffect } from 'react';
import { Play, RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock, Activity, Zap } from 'lucide-react';
import { qaValidator, type QAReportSummary, type QATestResult } from '@/lib/quality-assurance/qa-validator';

interface QADashboardProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function QADashboard({
  className = '',
  autoRefresh = false,
  refreshInterval = 300000 // 5 minutes
}: QADashboardProps) {
  const [report, setReport] = useState<QAReportSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);

  useEffect(() => {
    // Load existing report if available
    const existingReport = qaValidator.getLatestReport();
    if (existingReport) {
      setReport(existingReport);
      setLastRun(existingReport.generatedAt);
    }

    // Set up auto-refresh
    if (autoRefresh) {
      const interval = setInterval(runQAValidation, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const runQAValidation = async () => {
    if (isRunning) return;

    setIsRunning(true);
    try {
      const newReport = await qaValidator.runAllValidations();
      setReport(newReport);
      setLastRun(new Date().toISOString());
    } catch (error) {
      console.error('QA validation failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'critical':
        return <Zap className="h-4 w-4 text-red-500" />;
      case 'important':
        return <Activity className="h-4 w-4 text-yellow-500" />;
      case 'minor':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-hysio-deep-green" />
            <div>
              <h2 className="text-xl font-semibold text-hysio-deep-green">Quality Assurance Dashboard</h2>
              <p className="text-sm text-gray-600">Automated validation of critical user journeys</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {lastRun && (
              <div className="text-sm text-gray-500">
                Last run: {formatTimestamp(lastRun)}
              </div>
            )}
            <button
              onClick={runQAValidation}
              disabled={isRunning}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isRunning
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-hysio-deep-green text-white hover:bg-hysio-deep-green/90'
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 inline mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 inline mr-2" />
                  Run QA Tests
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      {report && (
        <div className="p-6 border-b border-gray-200">
          <div className={`p-4 rounded-lg border-2 ${getHealthColor(report.overallHealth)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getHealthIcon(report.overallHealth)}
                <div>
                  <h3 className="font-semibold text-lg">
                    System Health: {report.overallHealth.charAt(0).toUpperCase() + report.overallHealth.slice(1)}
                  </h3>
                  <p className="text-sm opacity-75">
                    {report.passedTests} of {report.totalTests} tests passed
                    {report.criticalFailures > 0 && ` • ${report.criticalFailures} critical failures`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {Math.round((report.passedTests / report.totalTests) * 100)}%
                </div>
                <div className="text-sm opacity-75">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Tests</p>
                  <p className="text-2xl font-bold text-blue-700">{report.totalTests}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Passed</p>
                  <p className="text-2xl font-bold text-green-700">{report.passedTests}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Failed</p>
                  <p className="text-2xl font-bold text-red-700">{report.failedTests}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Avg Duration</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {formatDuration(report.averageDuration)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      {report && (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
          <div className="space-y-3">
            {report.testResults.map((test, index) => (
              <TestResultCard key={`${test.testName}-${index}`} test={test} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!report && !isRunning && (
        <div className="p-12 text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No QA Report Available</h3>
          <p className="text-gray-600 mb-4">Run quality assurance tests to validate system health</p>
          <button
            onClick={runQAValidation}
            className="px-6 py-3 bg-hysio-deep-green text-white rounded-lg hover:bg-hysio-deep-green/90 transition-colors"
          >
            <Play className="h-4 w-4 inline mr-2" />
            Run First QA Test
          </button>
        </div>
      )}

      {/* Loading State */}
      {isRunning && !report && (
        <div className="p-12 text-center">
          <RefreshCw className="h-12 w-12 text-hysio-deep-green mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Running QA Tests</h3>
          <p className="text-gray-600">Validating critical user journeys...</p>
        </div>
      )}
    </div>
  );
}

interface TestResultCardProps {
  test: QATestResult;
}

function TestResultCard({ test }: TestResultCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'critical':
        return <Zap className="h-4 w-4 text-red-500" />;
      case 'important':
        return <Activity className="h-4 w-4 text-yellow-500" />;
      case 'minor':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className={`border rounded-lg p-4 ${test.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {test.success ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <div>
            <h4 className={`font-medium ${test.success ? 'text-green-900' : 'text-red-900'}`}>
              {test.testName}
            </h4>
            <div className="flex items-center space-x-2 text-sm">
              {getCategoryIcon(test.category)}
              <span className="capitalize text-gray-600">{test.category}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{formatDuration(test.duration)}</span>
            </div>
          </div>
        </div>

        {(test.error || test.details) && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        )}
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {test.error && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-red-800 mb-1">Error:</h5>
              <p className="text-sm text-red-700 bg-red-100 p-2 rounded">{test.error}</p>
            </div>
          )}

          {test.details && (
            <div>
              <h5 className="text-sm font-medium text-gray-800 mb-2">Details:</h5>
              <pre className="text-xs text-gray-700 bg-gray-100 p-3 rounded overflow-x-auto">
                {JSON.stringify(test.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}