/**
 * Comprehensive Export Workflow Integration Tests
 * Tests complete export flows including UI components, state management, and file generation
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportPanel } from '@/components/ui/export-panel';
import { ExportHistoryPanel } from '@/components/ui/export-history-panel';
import { AdvancedExportManager } from '@/lib/utils/advanced-export';
import { exportHistoryManager } from '@/lib/utils/export-history';
import type { PatientInfo, ConsultResult } from '@/types/api';

// Mock the export managers
vi.mock('@/lib/utils/advanced-export');
vi.mock('@/lib/utils/export-history');

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => JSON.stringify([])),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock URL and DOM functions
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn(),
  },
});

const mockClick = vi.fn();
Object.defineProperty(document, 'createElement', {
  value: vi.fn(() => ({
    href: '',
    download: '',
    click: mockClick,
  })),
});

Object.defineProperty(document.body, 'appendChild', { value: vi.fn() });
Object.defineProperty(document.body, 'removeChild', { value: vi.fn() });

describe('Export Workflow Integration', () => {
  let mockPatientInfo: PatientInfo;
  let mockConsultResult: ConsultResult;
  let mockBlob: Blob;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPatientInfo = {
      id: 'test-patient-1',
      initials: 'J.D.',
      birthYear: '1990',
      gender: 'male',
      chiefComplaint: 'Rugpijn sinds 2 weken'
    };

    mockConsultResult = {
      soepStructure: {
        subjectief: 'Patiënt klaagt over pijn in de onderrug sinds 2 weken. Pijn verergert bij zitten en buigen.',
        objectief: 'Beperkte flexie L3-L5, geen neurologische uitval. Pijn bij palpatie paravertebraal L4.',
        evaluatie: 'Waarschijnlijk mechanische lage rugpijn. Geen tekenen van radiculopathie.',
        plan: 'Fysiotherapie 2x/week, pijnstilling indien nodig, werkplekadvies. Controle over 2 weken.'
      },
      consultSummary: 'Mechanische lage rugpijn, behandelplan opgestart',
      redFlags: ['Geen rode vlaggen geïdentificeerd']
    };

    mockBlob = new Blob([
      `<!DOCTYPE html>
      <html>
      <body>
        <h1>SOEP Verslag - J.D.</h1>
        <p>Test export content</p>
      </body>
      </html>`
    ], { type: 'text/html' });

    // Setup mocks
    const mockAdvancedExportManager = {
      exportSOEP: vi.fn().mockResolvedValue(mockBlob),
      exportStepwiseIntake: vi.fn().mockResolvedValue(mockBlob),
      exportAutomatedIntake: vi.fn().mockResolvedValue(mockBlob),
      getInstance: vi.fn(() => mockAdvancedExportManager),
    };

    vi.mocked(AdvancedExportManager).mockImplementation(() => mockAdvancedExportManager as any);
    vi.mocked(AdvancedExportManager.getInstance).mockReturnValue(mockAdvancedExportManager as any);

    const mockHistoryManager = {
      addExportEntry: vi.fn().mockReturnValue('test-entry-id'),
      recordExportFailure: vi.fn().mockReturnValue('test-failure-id'),
      getHistory: vi.fn().mockReturnValue([]),
      getStatistics: vi.fn().mockReturnValue({
        totalExports: 5,
        successfulExports: 4,
        failedExports: 1,
        totalFileSize: 1024000,
        averageExportTime: 1500,
        mostUsedFormat: 'html',
        mostActivePatient: 'J.D.',
        exportsByFormat: { html: 3, txt: 1, docx: 0, pdf: 1 },
        exportsByWorkflow: { consult: 3, 'intake-stapsgewijs': 2 }
      }),
      redownloadExport: vi.fn().mockResolvedValue(true),
      deleteEntry: vi.fn().mockReturnValue(true),
    };

    Object.defineProperty(exportHistoryManager, 'addExportEntry', {
      value: mockHistoryManager.addExportEntry
    });
    Object.defineProperty(exportHistoryManager, 'getHistory', {
      value: mockHistoryManager.getHistory
    });
    Object.defineProperty(exportHistoryManager, 'getStatistics', {
      value: mockHistoryManager.getStatistics
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ExportPanel Component Integration', () => {
    it('should render export panel with all format options', () => {
      render(
        <ExportPanel
          patientInfo={mockPatientInfo}
          data={mockConsultResult}
          dataType="soep"
        />
      );

      // Check if export panel renders
      expect(screen.getByText('Export Document')).toBeInTheDocument();

      // Check format selection
      expect(screen.getByText('HTML Document')).toBeInTheDocument();
      expect(screen.getByText('Plain Text')).toBeInTheDocument();
      expect(screen.getByText('Word Document')).toBeInTheDocument();
      expect(screen.getByText('PDF Document')).toBeInTheDocument();
    });

    it('should handle export with progress tracking', async () => {
      const mockProgressCallback = vi.fn();

      render(
        <ExportPanel
          patientInfo={mockPatientInfo}
          data={mockConsultResult}
          dataType="soep"
        />
      );

      // Select HTML format and start export
      const htmlOption = screen.getByLabelText('HTML Document');
      fireEvent.click(htmlOption);

      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(AdvancedExportManager.getInstance().exportSOEP).toHaveBeenCalledWith(
          mockConsultResult,
          mockPatientInfo,
          expect.objectContaining({
            format: 'html',
            includePatientInfo: true,
            includeRedFlags: true,
            includeTimestamp: true
          })
        );
      });
    });

    it('should show progress during export', async () => {
      // Mock a longer export process
      const exportManager = AdvancedExportManager.getInstance();
      vi.mocked(exportManager.exportSOEP).mockImplementation(async (data, patient, options) => {
        // Simulate progress callbacks
        if (options.onProgress) {
          options.onProgress({ stage: 'Initializing', percentage: 0, currentStep: 'Starting export' });
          await new Promise(resolve => setTimeout(resolve, 100));
          options.onProgress({ stage: 'Generating', percentage: 50, currentStep: 'Generating document' });
          await new Promise(resolve => setTimeout(resolve, 100));
          options.onProgress({ stage: 'Complete', percentage: 100, currentStep: 'Export completed' });
        }
        return mockBlob;
      });

      render(
        <ExportPanel
          patientInfo={mockPatientInfo}
          data={mockConsultResult}
          dataType="soep"
        />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);

      // Check for progress indicators
      await waitFor(() => {
        expect(screen.getByText('Initializing')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Generating')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Complete')).toBeInTheDocument();
      });
    });

    it('should handle export errors gracefully', async () => {
      const exportManager = AdvancedExportManager.getInstance();
      vi.mocked(exportManager.exportSOEP).mockRejectedValue(
        new Error('Export validation failed: Patient initials are required')
      );

      render(
        <ExportPanel
          patientInfo={mockPatientInfo}
          data={mockConsultResult}
          dataType="soep"
        />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/Export validation failed/)).toBeInTheDocument();
      });
    });

    it('should allow customization of export options', async () => {
      render(
        <ExportPanel
          patientInfo={mockPatientInfo}
          data={mockConsultResult}
          dataType="soep"
          showAdvancedOptions={true}
        />
      );

      // Open advanced options
      const advancedButton = screen.getByText('Advanced Options');
      fireEvent.click(advancedButton);

      // Toggle options
      const includeRedFlagsCheckbox = screen.getByLabelText(/Include red flags/i);
      fireEvent.click(includeRedFlagsCheckbox);

      const timestampCheckbox = screen.getByLabelText(/Include timestamp/i);
      fireEvent.click(timestampCheckbox);

      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(AdvancedExportManager.getInstance().exportSOEP).toHaveBeenCalledWith(
          mockConsultResult,
          mockPatientInfo,
          expect.objectContaining({
            includeRedFlags: false,
            includeTimestamp: false
          })
        );
      });
    });
  });

  describe('Export History Integration', () => {
    const mockHistoryEntries = [
      {
        id: 'entry-1',
        timestamp: '2024-01-15T10:30:00Z',
        patientInitials: 'J.D.',
        workflowType: 'consult',
        exportFormat: 'html',
        fileName: 'SOEP-verslag_J.D._2024-01-15.html',
        fileSize: 15420,
        status: 'completed',
        downloadCount: 2,
        blob: mockBlob,
        exportOptions: { format: 'html', includePatientInfo: true }
      },
      {
        id: 'entry-2',
        timestamp: '2024-01-15T09:15:00Z',
        patientInitials: 'A.B.',
        workflowType: 'intake-stapsgewijs',
        exportFormat: 'txt',
        fileName: 'Stapsgewijze-intake_A.B._2024-01-15.txt',
        fileSize: 8200,
        status: 'completed',
        downloadCount: 1,
        blob: new Blob(['txt content'], { type: 'text/plain' }),
        exportOptions: { format: 'txt' }
      },
      {
        id: 'entry-3',
        timestamp: '2024-01-15T08:45:00Z',
        patientInitials: 'C.D.',
        workflowType: 'consult',
        exportFormat: 'pdf',
        fileName: 'SOEP-verslag_C.D._2024-01-15.pdf',
        fileSize: 0,
        status: 'failed',
        downloadCount: 0,
        errorMessage: 'PDF generation failed: Template not found',
        exportOptions: { format: 'pdf' }
      }
    ] as any[];

    it('should display export history correctly', () => {
      vi.mocked(exportHistoryManager.getHistory).mockReturnValue(mockHistoryEntries);

      render(<ExportHistoryPanel />);

      // Check if history entries are displayed
      expect(screen.getByText('Export History')).toBeInTheDocument();
      expect(screen.getByText('SOEP-verslag_J.D._2024-01-15.html')).toBeInTheDocument();
      expect(screen.getByText('Stapsgewijze-intake_A.B._2024-01-15.txt')).toBeInTheDocument();
      expect(screen.getByText('SOEP-verslag_C.D._2024-01-15.pdf')).toBeInTheDocument();

      // Check status indicators
      expect(screen.getByText('completed')).toBeInTheDocument();
      expect(screen.getByText('failed')).toBeInTheDocument();

      // Check error message
      expect(screen.getByText(/PDF generation failed/)).toBeInTheDocument();
    });

    it('should show statistics correctly', () => {
      vi.mocked(exportHistoryManager.getHistory).mockReturnValue(mockHistoryEntries);

      render(<ExportHistoryPanel showStats={true} />);

      expect(screen.getByText('Statistics')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // Total exports
      expect(screen.getByText('4')).toBeInTheDocument(); // Successful exports
    });

    it('should handle re-download functionality', async () => {
      vi.mocked(exportHistoryManager.getHistory).mockReturnValue(mockHistoryEntries);
      vi.mocked(exportHistoryManager.redownloadExport).mockResolvedValue(true);

      render(<ExportHistoryPanel />);

      // Find and click re-download button for first entry
      const redownloadButtons = screen.getAllByTitle('Re-download');
      fireEvent.click(redownloadButtons[0]);

      await waitFor(() => {
        expect(exportHistoryManager.redownloadExport).toHaveBeenCalledWith('entry-1');
      });

      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle filtering', async () => {
      vi.mocked(exportHistoryManager.getHistory).mockReturnValue(mockHistoryEntries);

      render(<ExportHistoryPanel />);

      // Open filters
      const filtersButton = screen.getByText('Filters');
      fireEvent.click(filtersButton);

      // Apply patient filter
      const patientFilter = screen.getByPlaceholderText('Patient initials');
      fireEvent.change(patientFilter, { target: { value: 'J.D.' } });

      await waitFor(() => {
        expect(exportHistoryManager.getHistory).toHaveBeenCalledWith({
          patientInitials: 'J.D.'
        });
      });
    });

    it('should handle deletion', async () => {
      vi.mocked(exportHistoryManager.getHistory).mockReturnValue(mockHistoryEntries);

      // Mock confirm dialog
      const originalConfirm = window.confirm;
      window.confirm = vi.fn(() => true);

      render(<ExportHistoryPanel />);

      // Find and click delete button
      const deleteButtons = screen.getAllByTitle('Delete');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(exportHistoryManager.deleteEntry).toHaveBeenCalledWith('entry-1');
      });

      window.confirm = originalConfirm;
    });
  });

  describe('Complete Export Workflow', () => {
    it('should execute complete export workflow from start to finish', async () => {
      // Step 1: Render export panel
      render(
        <ExportPanel
          patientInfo={mockPatientInfo}
          data={mockConsultResult}
          dataType="soep"
        />
      );

      // Step 2: Select format and options
      const htmlOption = screen.getByLabelText('HTML Document');
      fireEvent.click(htmlOption);

      // Step 3: Start export
      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);

      // Step 4: Verify export manager was called
      await waitFor(() => {
        expect(AdvancedExportManager.getInstance().exportSOEP).toHaveBeenCalledWith(
          mockConsultResult,
          mockPatientInfo,
          expect.objectContaining({
            format: 'html',
            includePatientInfo: true,
            includeRedFlags: true
          })
        );
      });

      // Step 5: Verify download was triggered
      expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle workflow with progress and history recording', async () => {
      let progressCallback: any = null;

      // Mock export manager to capture progress callback
      const exportManager = AdvancedExportManager.getInstance();
      vi.mocked(exportManager.exportSOEP).mockImplementation(async (data, patient, options) => {
        progressCallback = options.onProgress;

        if (progressCallback) {
          progressCallback({ stage: 'Initializing', percentage: 0, currentStep: 'Starting' });
          await new Promise(resolve => setTimeout(resolve, 50));
          progressCallback({ stage: 'Validating', percentage: 25, currentStep: 'Validating data' });
          await new Promise(resolve => setTimeout(resolve, 50));
          progressCallback({ stage: 'Generating', percentage: 75, currentStep: 'Generating document' });
          await new Promise(resolve => setTimeout(resolve, 50));
          progressCallback({ stage: 'Complete', percentage: 100, currentStep: 'Export completed' });
        }

        return mockBlob;
      });

      render(
        <ExportPanel
          patientInfo={mockPatientInfo}
          data={mockConsultResult}
          dataType="soep"
        />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);

      // Wait for export to complete
      await waitFor(() => {
        expect(screen.getByText('Export completed')).toBeInTheDocument();
      });

      // Verify the complete workflow
      expect(exportManager.exportSOEP).toHaveBeenCalled();
      expect(progressCallback).toBeTruthy();
      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle multiple exports and maintain history', async () => {
      const mockHistoryEntries: any[] = [];

      vi.mocked(exportHistoryManager.addExportEntry).mockImplementation((
        patientInfo, workflowType, format, fileName, blob, options, duration
      ) => {
        const entry = {
          id: `entry-${mockHistoryEntries.length + 1}`,
          timestamp: new Date().toISOString(),
          patientInitials: patientInfo.initials,
          workflowType,
          exportFormat: format,
          fileName,
          fileSize: blob.size,
          status: 'completed' as const,
          downloadCount: 1,
          blob,
          exportOptions: options
        };
        mockHistoryEntries.push(entry);
        return entry.id;
      });

      vi.mocked(exportHistoryManager.getHistory).mockImplementation(() => mockHistoryEntries);

      // Render both export panel and history panel
      const { rerender } = render(
        <div>
          <ExportPanel
            patientInfo={mockPatientInfo}
            data={mockConsultResult}
            dataType="soep"
          />
          <ExportHistoryPanel />
        </div>
      );

      // Perform first export
      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(exportHistoryManager.addExportEntry).toHaveBeenCalledTimes(1);
      });

      // Rerender to update history display
      rerender(
        <div>
          <ExportPanel
            patientInfo={mockPatientInfo}
            data={mockConsultResult}
            dataType="soep"
          />
          <ExportHistoryPanel />
        </div>
      );

      // Verify history shows the export
      expect(screen.getByText(/SOEP-verslag_J\.D\./)).toBeInTheDocument();

      // Perform second export with different format
      const txtOption = screen.getByLabelText('Plain Text');
      fireEvent.click(txtOption);
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(exportHistoryManager.addExportEntry).toHaveBeenCalledTimes(2);
      });

      expect(mockHistoryEntries).toHaveLength(2);
      expect(mockHistoryEntries[0].exportFormat).toBe('html');
      expect(mockHistoryEntries[1].exportFormat).toBe('txt');
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    it('should recover from export errors and continue working', async () => {
      const exportManager = AdvancedExportManager.getInstance();

      // First export fails, second succeeds
      vi.mocked(exportManager.exportSOEP)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockBlob);

      render(
        <ExportPanel
          patientInfo={mockPatientInfo}
          data={mockConsultResult}
          dataType="soep"
        />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });

      // First export - should fail
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });

      // Second export - should succeed
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockClick).toHaveBeenCalled();
      });
    });

    it('should handle malformed data gracefully', async () => {
      const malformedData = {
        ...mockConsultResult,
        soepStructure: null // Invalid data
      };

      render(
        <ExportPanel
          patientInfo={mockPatientInfo}
          data={malformedData}
          dataType="soep"
        />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        // Should show validation error
        expect(screen.getByText(/validation/i)).toBeInTheDocument();
      });
    });

    it('should handle storage quota exceeded errors', async () => {
      vi.mocked(exportHistoryManager.addExportEntry).mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(
        <ExportPanel
          patientInfo={mockPatientInfo}
          data={mockConsultResult}
          dataType="soep"
        />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);

      // Export should still succeed even if history storage fails
      await waitFor(() => {
        expect(mockClick).toHaveBeenCalled();
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to record export in history'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});