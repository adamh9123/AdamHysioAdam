/**
 * Comprehensive Tests for ExportHistoryManager
 * Tests the complete export history functionality including storage, retrieval, and management
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ExportHistoryManager, type ExportHistoryEntry, type ExportHistoryFilter } from '@/lib/utils/export-history';
import type { PatientInfo } from '@/types/api';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock URL.createObjectURL and related functions
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn(),
  },
});

// Mock DOM manipulation
Object.defineProperty(document, 'createElement', {
  value: vi.fn(() => ({
    href: '',
    download: '',
    click: vi.fn(),
  })),
});

Object.defineProperty(document.body, 'appendChild', {
  value: vi.fn(),
});

Object.defineProperty(document.body, 'removeChild', {
  value: vi.fn(),
});

describe('ExportHistoryManager', () => {
  let historyManager: ExportHistoryManager;
  let mockPatientInfo: PatientInfo;
  let mockBlob: Blob;

  beforeEach(() => {
    historyManager = ExportHistoryManager.getInstance();
    mockLocalStorage.clear();
    vi.clearAllMocks();

    mockPatientInfo = {
      id: 'test-patient-1',
      initials: 'J.D.',
      birthYear: '1990',
      gender: 'male',
      chiefComplaint: 'Test complaint'
    };

    mockBlob = new Blob(['test content'], { type: 'text/html' });
  });

  afterEach(() => {
    mockLocalStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ExportHistoryManager.getInstance();
      const instance2 = ExportHistoryManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Adding Export Entries', () => {
    it('should add successful export entry', () => {
      const entryId = historyManager.addExportEntry(
        mockPatientInfo,
        'consult',
        'html',
        'test-export.html',
        mockBlob,
        { format: 'html', includePatientInfo: true },
        1500
      );

      expect(entryId).toBeTruthy();
      expect(entryId).toMatch(/^export_\d+_[a-z0-9]+$/);

      const history = historyManager.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        id: entryId,
        patientInitials: 'J.D.',
        workflowType: 'consult',
        exportFormat: 'html',
        fileName: 'test-export.html',
        fileSize: mockBlob.size,
        status: 'completed',
        duration: 1500,
        downloadCount: 1
      });
    });

    it('should add failed export entry', () => {
      const entryId = historyManager.recordExportFailure(
        mockPatientInfo,
        'intake-stapsgewijs',
        'pdf',
        'failed-export.pdf',
        { format: 'pdf' },
        'Export failed due to validation error',
        800
      );

      expect(entryId).toBeTruthy();

      const history = historyManager.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        id: entryId,
        patientInitials: 'J.D.',
        workflowType: 'intake-stapsgewijs',
        exportFormat: 'pdf',
        fileName: 'failed-export.pdf',
        status: 'failed',
        errorMessage: 'Export failed due to validation error',
        duration: 800,
        downloadCount: 0
      });
    });

    it('should store entry in localStorage', () => {
      historyManager.addExportEntry(
        mockPatientInfo,
        'consult',
        'html',
        'test.html',
        mockBlob,
        { format: 'html' }
      );

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'hysio-export-history',
        expect.stringContaining('"patientInitials":"J.D."')
      );
    });
  });

  describe('Retrieving History', () => {
    beforeEach(() => {
      // Add multiple test entries
      historyManager.addExportEntry(
        mockPatientInfo,
        'consult',
        'html',
        'soep-export.html',
        mockBlob,
        { format: 'html' }
      );

      historyManager.addExportEntry(
        { ...mockPatientInfo, initials: 'A.B.' },
        'intake-automatisch',
        'txt',
        'intake-export.txt',
        new Blob(['txt content'], { type: 'text/plain' }),
        { format: 'txt' }
      );

      historyManager.recordExportFailure(
        mockPatientInfo,
        'consult',
        'pdf',
        'failed.pdf',
        { format: 'pdf' },
        'PDF generation failed'
      );
    });

    it('should return all history entries sorted by timestamp', () => {
      const history = historyManager.getHistory();
      expect(history).toHaveLength(3);

      // Should be sorted by timestamp (newest first)
      for (let i = 0; i < history.length - 1; i++) {
        const current = new Date(history[i].timestamp);
        const next = new Date(history[i + 1].timestamp);
        expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
      }
    });

    it('should filter by patient initials', () => {
      const filter: ExportHistoryFilter = { patientInitials: 'A.B.' };
      const history = historyManager.getHistory(filter);

      expect(history).toHaveLength(1);
      expect(history[0].patientInitials).toBe('A.B.');
    });

    it('should filter by workflow type', () => {
      const filter: ExportHistoryFilter = { workflowType: 'consult' };
      const history = historyManager.getHistory(filter);

      expect(history).toHaveLength(2); // One successful, one failed
      expect(history.every(entry => entry.workflowType === 'consult')).toBe(true);
    });

    it('should filter by export format', () => {
      const filter: ExportHistoryFilter = { exportFormat: 'html' };
      const history = historyManager.getHistory(filter);

      expect(history).toHaveLength(1);
      expect(history[0].exportFormat).toBe('html');
    });

    it('should filter by status', () => {
      const filter: ExportHistoryFilter = { status: 'failed' };
      const history = historyManager.getHistory(filter);

      expect(history).toHaveLength(1);
      expect(history[0].status).toBe('failed');
    });

    it('should filter by date range', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const filter: ExportHistoryFilter = {
        dateRange: {
          start: yesterday.toISOString(),
          end: tomorrow.toISOString()
        }
      };

      const history = historyManager.getHistory(filter);
      expect(history).toHaveLength(3); // All entries should be within range
    });

    it('should combine multiple filters', () => {
      const filter: ExportHistoryFilter = {
        patientInitials: 'J.D.',
        status: 'completed'
      };

      const history = historyManager.getHistory(filter);
      expect(history).toHaveLength(1);
      expect(history[0].patientInitials).toBe('J.D.');
      expect(history[0].status).toBe('completed');
    });
  });

  describe('Individual Entry Operations', () => {
    let testEntryId: string;

    beforeEach(() => {
      testEntryId = historyManager.addExportEntry(
        mockPatientInfo,
        'consult',
        'html',
        'test.html',
        mockBlob,
        { format: 'html' }
      );
    });

    it('should get entry by ID', () => {
      const entry = historyManager.getEntry(testEntryId);

      expect(entry).toBeTruthy();
      expect(entry?.id).toBe(testEntryId);
      expect(entry?.fileName).toBe('test.html');
    });

    it('should return null for non-existent entry', () => {
      const entry = historyManager.getEntry('non-existent-id');
      expect(entry).toBeNull();
    });

    it('should delete entry successfully', () => {
      const deleted = historyManager.deleteEntry(testEntryId);
      expect(deleted).toBe(true);

      const entry = historyManager.getEntry(testEntryId);
      expect(entry).toBeNull();

      const history = historyManager.getHistory();
      expect(history).toHaveLength(0);
    });

    it('should return false when deleting non-existent entry', () => {
      const deleted = historyManager.deleteEntry('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('Re-download Functionality', () => {
    let testEntryId: string;

    beforeEach(() => {
      testEntryId = historyManager.addExportEntry(
        mockPatientInfo,
        'consult',
        'html',
        'test.html',
        mockBlob,
        { format: 'html' }
      );
    });

    it('should re-download entry successfully', async () => {
      const success = await historyManager.redownloadExport(testEntryId);
      expect(success).toBe(true);

      // Check that download count was incremented
      const entry = historyManager.getEntry(testEntryId);
      expect(entry?.downloadCount).toBe(2);
      expect(entry?.lastDownloaded).toBeTruthy();
    });

    it('should fail to re-download non-existent entry', async () => {
      await expect(
        historyManager.redownloadExport('non-existent-id')
      ).rejects.toThrow('Export not found or not available for re-download');
    });

    it('should fail to re-download failed entry', async () => {
      const failedEntryId = historyManager.recordExportFailure(
        mockPatientInfo,
        'consult',
        'pdf',
        'failed.pdf',
        { format: 'pdf' },
        'Test error'
      );

      await expect(
        historyManager.redownloadExport(failedEntryId)
      ).rejects.toThrow('Export not found or not available for re-download');
    });

    it('should handle download errors gracefully', async () => {
      // Mock a DOM error
      const mockCreateElement = vi.fn(() => {
        throw new Error('DOM error');
      });
      vi.mocked(document.createElement).mockImplementation(mockCreateElement);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const success = await historyManager.redownloadExport(testEntryId);
      expect(success).toBe(false);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to re-download export:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      // Add test data
      historyManager.addExportEntry(
        mockPatientInfo,
        'consult',
        'html',
        'test1.html',
        mockBlob,
        { format: 'html' },
        1000
      );

      historyManager.addExportEntry(
        mockPatientInfo,
        'consult',
        'html',
        'test2.html',
        mockBlob,
        { format: 'html' },
        1500
      );

      historyManager.addExportEntry(
        { ...mockPatientInfo, initials: 'A.B.' },
        'intake-automatisch',
        'txt',
        'test3.txt',
        new Blob(['content'], { type: 'text/plain' }),
        { format: 'txt' },
        800
      );

      historyManager.recordExportFailure(
        mockPatientInfo,
        'consult',
        'pdf',
        'failed.pdf',
        { format: 'pdf' },
        'Error'
      );
    });

    it('should calculate statistics correctly', () => {
      const stats = historyManager.getStatistics();

      expect(stats.totalExports).toBe(4);
      expect(stats.successfulExports).toBe(3);
      expect(stats.failedExports).toBe(1);
      expect(stats.mostUsedFormat).toBe('html');
      expect(stats.mostActivePatient).toBe('J.D.');
      expect(stats.averageExportTime).toBeCloseTo(1100); // (1000 + 1500 + 800) / 3

      expect(stats.exportsByFormat).toEqual({
        html: 2,
        txt: 1,
        docx: 0,
        pdf: 1
      });

      expect(stats.exportsByWorkflow).toEqual({
        'consult': 3,
        'intake-automatisch': 1
      });
    });

    it('should handle empty history', () => {
      historyManager.clearHistory();
      const stats = historyManager.getStatistics();

      expect(stats.totalExports).toBe(0);
      expect(stats.successfulExports).toBe(0);
      expect(stats.failedExports).toBe(0);
      expect(stats.averageExportTime).toBe(0);
    });
  });

  describe('Storage Management', () => {
    it('should clear all history', () => {
      historyManager.addExportEntry(
        mockPatientInfo,
        'consult',
        'html',
        'test.html',
        mockBlob,
        { format: 'html' }
      );

      historyManager.clearHistory();

      const history = historyManager.getHistory();
      expect(history).toHaveLength(0);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hysio-export-history');
    });

    it('should export history data', () => {
      historyManager.addExportEntry(
        mockPatientInfo,
        'consult',
        'html',
        'test.html',
        mockBlob,
        { format: 'html' }
      );

      const exportedData = historyManager.exportHistoryData();
      const parsed = JSON.parse(exportedData);

      expect(parsed).toMatchObject({
        version: '7.0.0',
        totalEntries: 1,
        exportedAt: expect.any(String),
        entries: expect.arrayContaining([
          expect.objectContaining({
            patientInitials: 'J.D.',
            workflowType: 'consult',
            exportFormat: 'html',
            blob: undefined // Blob should be removed for JSON export
          })
        ])
      });
    });

    it('should get storage usage information', () => {
      historyManager.addExportEntry(
        mockPatientInfo,
        'consult',
        'html',
        'test.html',
        mockBlob,
        { format: 'html' }
      );

      const usage = historyManager.getStorageUsage();

      expect(usage).toMatchObject({
        usedMB: expect.any(Number),
        maxMB: 50,
        usagePercentage: expect.any(Number),
        totalEntries: 1
      });

      expect(usage.usedMB).toBeGreaterThan(0);
      expect(usage.usagePercentage).toBeGreaterThanOrEqual(0);
      expect(usage.usagePercentage).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors when loading', () => {
      vi.mocked(mockLocalStorage.getItem).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const history = historyManager.getHistory();
      expect(history).toHaveLength(0);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load export history:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle localStorage errors when saving', () => {
      vi.mocked(mockLocalStorage.setItem).mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Should not throw error but log warning
      expect(() =>
        historyManager.addExportEntry(
          mockPatientInfo,
          'consult',
          'html',
          'test.html',
          mockBlob,
          { format: 'html' }
        )
      ).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save export history:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle invalid JSON in localStorage', () => {
      vi.mocked(mockLocalStorage.getItem).mockReturnValue('invalid json{');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const history = historyManager.getHistory();
      expect(history).toHaveLength(0);

      consoleSpy.mockRestore();
    });
  });
});