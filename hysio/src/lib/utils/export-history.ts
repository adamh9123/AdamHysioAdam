'use client';

/**
 * Export History and Management System for Hysio Medical Scribe v7.0
 * Provides functionality to track, manage, and re-download previous exports
 */

import type { ExportFormat, ExportOptions } from './advanced-export';
import type { PatientInfo } from '@/types/api';

export interface ExportHistoryEntry {
  id: string;
  timestamp: string;
  patientInitials: string;
  patientId?: string;
  workflowType: 'consult' | 'intake-stapsgewijs' | 'intake-automatisch';
  exportFormat: ExportFormat;
  fileName: string;
  fileSize: number;
  exportOptions: ExportOptions;
  status: 'completed' | 'failed' | 'in_progress';
  errorMessage?: string;
  duration?: number; // Export duration in milliseconds
  downloadCount: number;
  lastDownloaded?: string;
  blob?: Blob; // Store blob temporarily for re-download
  metadata?: {
    exportedBy: string;
    sessionId?: string;
    version: string;
    checksumMD5?: string;
  };
}

export interface ExportHistoryFilter {
  patientInitials?: string;
  workflowType?: string;
  exportFormat?: ExportFormat;
  dateRange?: {
    start: string;
    end: string;
  };
  status?: 'completed' | 'failed' | 'in_progress';
}

export interface ExportHistoryStats {
  totalExports: number;
  successfulExports: number;
  failedExports: number;
  totalFileSize: number;
  averageExportTime: number;
  mostUsedFormat: ExportFormat;
  mostActivePatient: string;
  exportsByFormat: Record<ExportFormat, number>;
  exportsByWorkflow: Record<string, number>;
}

export class ExportHistoryManager {
  private static instance: ExportHistoryManager;
  private storageKey = 'hysio-export-history';
  private maxHistoryEntries = 1000;
  private maxStorageSizeMB = 50;

  private constructor() {
    this.cleanupOldEntries();
  }

  public static getInstance(): ExportHistoryManager {
    if (!ExportHistoryManager.instance) {
      ExportHistoryManager.instance = new ExportHistoryManager();
    }
    return ExportHistoryManager.instance;
  }

  /**
   * Add export entry to history
   */
  public addExportEntry(
    patientInfo: PatientInfo,
    workflowType: 'consult' | 'intake-stapsgewijs' | 'intake-automatisch',
    exportFormat: ExportFormat,
    fileName: string,
    blob: Blob,
    exportOptions: ExportOptions,
    duration?: number
  ): string {
    const entry: ExportHistoryEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      patientInitials: patientInfo.initials,
      patientId: patientInfo.id,
      workflowType,
      exportFormat,
      fileName,
      fileSize: blob.size,
      exportOptions: { ...exportOptions },
      status: 'completed',
      duration,
      downloadCount: 1,
      lastDownloaded: new Date().toISOString(),
      blob,
      metadata: {
        exportedBy: 'Hysio Medical Scribe v7.0',
        version: '7.0.0',
        checksumMD5: this.calculateChecksum(blob)
      }
    };

    this.saveEntry(entry);
    this.cleanupOldEntries();

    return entry.id;
  }

  /**
   * Record export failure
   */
  public recordExportFailure(
    patientInfo: PatientInfo,
    workflowType: 'consult' | 'intake-stapsgewijs' | 'intake-automatisch',
    exportFormat: ExportFormat,
    fileName: string,
    exportOptions: ExportOptions,
    errorMessage: string,
    duration?: number
  ): string {
    const entry: ExportHistoryEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      patientInitials: patientInfo.initials,
      patientId: patientInfo.id,
      workflowType,
      exportFormat,
      fileName,
      fileSize: 0,
      exportOptions: { ...exportOptions },
      status: 'failed',
      errorMessage,
      duration,
      downloadCount: 0,
      metadata: {
        exportedBy: 'Hysio Medical Scribe v7.0',
        version: '7.0.0'
      }
    };

    this.saveEntry(entry);
    return entry.id;
  }

  /**
   * Get export history with optional filtering
   */
  public getHistory(filter?: ExportHistoryFilter): ExportHistoryEntry[] {
    const entries = this.loadAllEntries();

    if (!filter) {
      return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    return entries
      .filter(entry => {
        if (filter.patientInitials && !entry.patientInitials.toLowerCase().includes(filter.patientInitials.toLowerCase())) {
          return false;
        }

        if (filter.workflowType && entry.workflowType !== filter.workflowType) {
          return false;
        }

        if (filter.exportFormat && entry.exportFormat !== filter.exportFormat) {
          return false;
        }

        if (filter.status && entry.status !== filter.status) {
          return false;
        }

        if (filter.dateRange) {
          const entryDate = new Date(entry.timestamp);
          const startDate = new Date(filter.dateRange.start);
          const endDate = new Date(filter.dateRange.end);

          if (entryDate < startDate || entryDate > endDate) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get export entry by ID
   */
  public getEntry(id: string): ExportHistoryEntry | null {
    const entries = this.loadAllEntries();
    return entries.find(entry => entry.id === id) || null;
  }

  /**
   * Re-download export by ID
   */
  public async redownloadExport(id: string): Promise<boolean> {
    const entry = this.getEntry(id);

    if (!entry || entry.status !== 'completed' || !entry.blob) {
      throw new Error('Export not found or not available for re-download');
    }

    try {
      // Create download
      const url = URL.createObjectURL(entry.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = entry.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Update download statistics
      entry.downloadCount++;
      entry.lastDownloaded = new Date().toISOString();
      this.updateEntry(entry);

      return true;
    } catch (error) {
      console.error('Failed to re-download export:', error);
      return false;
    }
  }

  /**
   * Delete export entry
   */
  public deleteEntry(id: string): boolean {
    const entries = this.loadAllEntries();
    const filteredEntries = entries.filter(entry => entry.id !== id);

    if (filteredEntries.length === entries.length) {
      return false; // Entry not found
    }

    this.saveAllEntries(filteredEntries);
    return true;
  }

  /**
   * Clear all history
   */
  public clearHistory(): void {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Get export statistics
   */
  public getStatistics(): ExportHistoryStats {
    const entries = this.loadAllEntries();
    const completedEntries = entries.filter(entry => entry.status === 'completed');
    const failedEntries = entries.filter(entry => entry.status === 'failed');

    const exportsByFormat: Record<ExportFormat, number> = {
      html: 0,
      txt: 0,
      docx: 0,
      pdf: 0
    };

    const exportsByWorkflow: Record<string, number> = {};
    const patientCounts: Record<string, number> = {};

    entries.forEach(entry => {
      exportsByFormat[entry.exportFormat]++;
      exportsByWorkflow[entry.workflowType] = (exportsByWorkflow[entry.workflowType] || 0) + 1;
      patientCounts[entry.patientInitials] = (patientCounts[entry.patientInitials] || 0) + 1;
    });

    const mostUsedFormat = Object.entries(exportsByFormat).reduce((a, b) =>
      exportsByFormat[a[0] as ExportFormat] > exportsByFormat[b[0] as ExportFormat] ? a : b
    )[0] as ExportFormat;

    const mostActivePatient = Object.entries(patientCounts).reduce((a, b) =>
      patientCounts[a[0]] > patientCounts[b[0]] ? a : b, ['', 0]
    )[0];

    const totalFileSize = completedEntries.reduce((sum, entry) => sum + entry.fileSize, 0);
    const totalDuration = completedEntries
      .filter(entry => entry.duration)
      .reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const avgDuration = totalDuration / completedEntries.filter(entry => entry.duration).length || 0;

    return {
      totalExports: entries.length,
      successfulExports: completedEntries.length,
      failedExports: failedEntries.length,
      totalFileSize,
      averageExportTime: avgDuration,
      mostUsedFormat,
      mostActivePatient,
      exportsByFormat,
      exportsByWorkflow
    };
  }

  /**
   * Export history to JSON
   */
  public exportHistoryData(): string {
    const entries = this.loadAllEntries();
    // Remove blob data for JSON export to avoid size issues
    const exportData = entries.map(entry => ({
      ...entry,
      blob: undefined
    }));

    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      version: '7.0.0',
      totalEntries: exportData.length,
      entries: exportData
    }, null, 2);
  }

  /**
   * Get storage usage information
   */
  public getStorageUsage(): {
    usedMB: number;
    maxMB: number;
    usagePercentage: number;
    totalEntries: number;
  } {
    const entries = this.loadAllEntries();
    const totalSize = entries.reduce((sum, entry) => sum + (entry.blob?.size || 0), 0);
    const usedMB = totalSize / (1024 * 1024);

    return {
      usedMB: Math.round(usedMB * 100) / 100,
      maxMB: this.maxStorageSizeMB,
      usagePercentage: Math.round((usedMB / this.maxStorageSizeMB) * 100),
      totalEntries: entries.length
    };
  }

  /**
   * Private helper methods
   */
  private generateId(): string {
    return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveEntry(entry: ExportHistoryEntry): void {
    const entries = this.loadAllEntries();
    entries.push(entry);
    this.saveAllEntries(entries);
  }

  private updateEntry(updatedEntry: ExportHistoryEntry): void {
    const entries = this.loadAllEntries();
    const index = entries.findIndex(entry => entry.id === updatedEntry.id);

    if (index !== -1) {
      entries[index] = updatedEntry;
      this.saveAllEntries(entries);
    }
  }

  private loadAllEntries(): ExportHistoryEntry[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load export history:', error);
      return [];
    }
  }

  private saveAllEntries(entries: ExportHistoryEntry[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save export history:', error);
      // If storage is full, cleanup and try again
      this.cleanupOldEntries(true);
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(entries));
      } catch (retryError) {
        console.error('Failed to save export history after cleanup:', retryError);
      }
    }
  }

  private cleanupOldEntries(force = false): void {
    const entries = this.loadAllEntries();

    if (entries.length <= this.maxHistoryEntries && !force) {
      return;
    }

    // Sort by timestamp (newest first) and keep only the most recent entries
    const sortedEntries = entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const keptEntries = sortedEntries.slice(0, this.maxHistoryEntries);

    // If still too large, remove blob data from older entries
    const currentSize = keptEntries.reduce((sum, entry) => sum + (entry.blob?.size || 0), 0);
    const maxSizeBytes = this.maxStorageSizeMB * 1024 * 1024;

    if (currentSize > maxSizeBytes) {
      let totalSize = 0;
      const cleanedEntries = keptEntries.map(entry => {
        totalSize += entry.blob?.size || 0;

        if (totalSize > maxSizeBytes) {
          // Keep entry but remove blob to save space
          return { ...entry, blob: undefined };
        }

        return entry;
      });

      this.saveAllEntries(cleanedEntries);
    } else {
      this.saveAllEntries(keptEntries);
    }
  }

  private calculateChecksum(blob: Blob): string {
    // Simple checksum calculation - in production, you might want to use a proper hash
    return `${blob.size}_${blob.type}_${Date.now()}`;
  }
}

// Export singleton instance
export const exportHistoryManager = ExportHistoryManager.getInstance();