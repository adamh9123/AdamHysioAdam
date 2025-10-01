'use client';

import React, { useState, useEffect } from 'react';
import { Download, Trash2, Filter, Calendar, User, FileText, BarChart3, RefreshCw } from 'lucide-react';
import { exportHistoryManager, type ExportHistoryEntry, type ExportHistoryFilter, type ExportHistoryStats } from '@/lib/utils/export-history';

interface ExportHistoryPanelProps {
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  showStats?: boolean;
  maxHeight?: string;
}

export function ExportHistoryPanel({
  className = '',
  variant = 'default',
  showStats = true,
  maxHeight = '600px'
}: ExportHistoryPanelProps) {
  const [history, setHistory] = useState<ExportHistoryEntry[]>([]);
  const [stats, setStats] = useState<ExportHistoryStats | null>(null);
  const [filter, setFilter] = useState<ExportHistoryFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadHistory();
    if (showStats) {
      loadStats();
    }
  }, [filter, showStats]);

  const loadHistory = () => {
    setIsLoading(true);
    try {
      const entries = exportHistoryManager.getHistory(filter);
      setHistory(entries);
    } catch (error) {
      console.error('Failed to load export history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = () => {
    try {
      const statistics = exportHistoryManager.getStatistics();
      setStats(statistics);
    } catch (error) {
      console.error('Failed to load export statistics:', error);
    }
  };

  const handleRedownload = async (id: string) => {
    try {
      setIsLoading(true);
      const success = await exportHistoryManager.redownloadExport(id);
      if (success) {
        loadHistory(); // Refresh to update download count
      } else {
        alert('Failed to re-download export. File may no longer be available.');
      }
    } catch (error) {
      alert(`Re-download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this export entry?')) {
      const success = exportHistoryManager.deleteEntry(id);
      if (success) {
        loadHistory();
        if (showStats) loadStats();
      }
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all export history? This cannot be undone.')) {
      exportHistoryManager.clearHistory();
      loadHistory();
      if (showStats) loadStats();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms?: number): string => {
    if (!ms) return 'Unknown';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getWorkflowDisplayName = (workflowType: string): string => {
    switch (workflowType) {
      case 'consult': return 'SOEP Consult';
      case 'intake-stapsgewijs': return 'Stapsgewijze Intake';
      case 'intake-automatisch': return 'Automatische Intake';
      default: return workflowType;
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={`bg-white rounded-lg border border-hysio-mint/20 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-hysio-deep-green">Recent Exports</h3>
          <button
            onClick={loadHistory}
            disabled={isLoading}
            className="p-2 text-hysio-deep-green hover:bg-hysio-mint/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {history.slice(0, 5).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{entry.fileName}</p>
                <p className="text-xs text-gray-500">{formatTimestamp(entry.timestamp)}</p>
              </div>
              <button
                onClick={() => handleRedownload(entry.id)}
                disabled={entry.status !== 'completed' || !entry.blob}
                className="ml-2 p-1 text-hysio-deep-green hover:bg-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-hysio-mint/20 ${className}`}>
      {/* Header */}
      <div className="border-b border-hysio-mint/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-hysio-deep-green" />
            <h3 className="text-lg font-semibold text-hysio-deep-green">Export History</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                showFilters ? 'bg-hysio-mint/20 text-hysio-deep-green' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Filter className="h-4 w-4 inline mr-2" />
              Filters
            </button>
            <button
              onClick={loadHistory}
              disabled={isLoading}
              className="px-3 py-2 text-sm text-hysio-deep-green hover:bg-hysio-mint/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 inline mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4 inline mr-2" />
              Clear All
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <input
                  type="text"
                  placeholder="Patient initials"
                  value={filter.patientInitials || ''}
                  onChange={(e) => setFilter({ ...filter, patientInitials: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hysio-mint focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Workflow</label>
                <select
                  value={filter.workflowType || ''}
                  onChange={(e) => setFilter({ ...filter, workflowType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hysio-mint focus:border-transparent"
                >
                  <option value="">All workflows</option>
                  <option value="consult">SOEP Consult</option>
                  <option value="intake-stapsgewijs">Stapsgewijze Intake</option>
                  <option value="intake-automatisch">Automatische Intake</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <select
                  value={filter.exportFormat || ''}
                  onChange={(e) => setFilter({ ...filter, exportFormat: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hysio-mint focus:border-transparent"
                >
                  <option value="">All formats</option>
                  <option value="html">HTML</option>
                  <option value="txt">TXT</option>
                  <option value="docx">DOCX</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filter.status || ''}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hysio-mint focus:border-transparent"
                >
                  <option value="">All statuses</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="in_progress">In Progress</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      {showStats && stats && variant !== 'compact' && (
        <div className="border-b border-hysio-mint/20 p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-hysio-deep-green mr-2" />
            <h4 className="font-medium text-hysio-deep-green">Statistics</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total Exports</p>
              <p className="text-2xl font-bold text-blue-700">{stats.totalExports}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Successful</p>
              <p className="text-2xl font-bold text-green-700">{stats.successfulExports}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Total Size</p>
              <p className="text-2xl font-bold text-purple-700">{formatFileSize(stats.totalFileSize)}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">Avg Time</p>
              <p className="text-2xl font-bold text-orange-700">{formatDuration(stats.averageExportTime)}</p>
            </div>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="p-6">
        <div className="space-y-4" style={{ maxHeight, overflowY: 'auto' }}>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-hysio-deep-green mx-auto mb-4" />
              <p className="text-gray-600">Loading export history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No export history found</p>
              <p className="text-sm text-gray-500">Your exported documents will appear here</p>
            </div>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 truncate">{entry.fileName}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(entry.status)}`}>
                          {entry.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {entry.patientInitials}
                        </span>
                        <span>{getWorkflowDisplayName(entry.workflowType)}</span>
                        <span className="uppercase font-mono">{entry.exportFormat}</span>
                        <span>{formatFileSize(entry.fileSize)}</span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatTimestamp(entry.timestamp)}
                        </span>
                      </div>
                      {entry.errorMessage && (
                        <p className="text-sm text-red-600 mt-1 bg-red-50 p-2 rounded">
                          Error: {entry.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {entry.downloadCount > 1 && (
                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                      Downloaded {entry.downloadCount}x
                    </span>
                  )}
                  <button
                    onClick={() => handleRedownload(entry.id)}
                    disabled={entry.status !== 'completed' || !entry.blob}
                    className="p-2 text-hysio-deep-green hover:bg-hysio-mint/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Re-download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}