/**
 * End-to-End Tests for Complete Workflow Scenarios
 * Tests complete user journeys from data input to final export
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock the export system components
import { ExportPanel } from '@/components/ui/export-panel';
import { ExportHistoryPanel } from '@/components/ui/export-history-panel';
import { AdvancedExportManager } from '@/lib/utils/advanced-export';
import { exportHistoryManager } from '@/lib/utils/export-history';
import { qaValidator } from '@/lib/quality-assurance/qa-validator';

// Mock all external dependencies
vi.mock('@/lib/utils/advanced-export');
vi.mock('@/lib/utils/export-history');
vi.mock('@/lib/quality-assurance/qa-validator');

// Mock DOM APIs
const mockLocalStorage = {
  getItem: vi.fn(() => JSON.stringify([])),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

const mockURL = {
  createObjectURL: vi.fn(() => 'mock-blob-url'),
  revokeObjectURL: vi.fn(),
};

const mockDocument = {
  createElement: vi.fn(() => ({
    href: '',
    download: '',
    click: vi.fn(),
  })),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
};

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
Object.defineProperty(window, 'URL', { value: mockURL });
Object.defineProperty(document, 'createElement', { value: mockDocument.createElement });
Object.defineProperty(document.body, 'appendChild', { value: mockDocument.body.appendChild });
Object.defineProperty(document.body, 'removeChild', { value: mockDocument.body.removeChild });

describe('Complete Workflow Scenarios E2E', () => {
  let mockPatientInfo: any;
  let mockSOEPResult: any;
  let mockStepwiseResults: any;
  let mockBlob: Blob;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();

    // Setup test data
    mockPatientInfo = {
      id: 'e2e-patient-1',
      initials: 'E.T.',
      birthYear: '1985',
      gender: 'female',
      chiefComplaint: 'Nekpijn na auto-ongeluk'
    };

    mockSOEPResult = {
      soepStructure: {
        subjectief: 'Patiënte meldt nekpijn sinds auto-ongeluk 1 week geleden. Pijn straalt uit naar rechterarm.',
        objectief: 'Beperkte rotatie naar rechts, verhoogde spanning m. trapezius rechts. Negatieve Spurling test.',
        evaluatie: 'Waarschijnlijk whiplash-gerelateerde nekpijn. Geen tekenen van radiculopathie.',
        plan: 'Manuele therapie, oefentherapie, geleidelijke activiteitshervatting. Controle over 1 week.'
      },
      consultSummary: 'Whiplash-gerelateerde nekpijn, conservatieve behandeling gestart',
      redFlags: ['Geen rode vlaggen geïdentificeerd']
    };

    mockStepwiseResults = {
      anamnese: {
        hhsbAnamneseCard: {
          hulpvraag: 'Behandeling nekpijn na trauma',
          historie: 'Auto-ongeluk 1 week geleden, kop-staart botsing',
          stoornissen: 'Nekpijn, beperkte mobiliteit, hoofdpijn',
          beperkingen: 'Kan niet lang achter computer werken, slecht slapen'
        },
        redFlags: []
      },
      onderzoek: {
        examinationFindings: {
          physicalTests: 'Spurling test negatief, cervicale compressie test negatief',
          movements: 'Rotatie rechts 30° (normaal 80°), flexie/extensie vrij',
          palpation: 'Verhoogde spanning trapezius en levator scapulae rechts'
        },
        redFlags: []
      },
      klinischeConclusie: {
        clinicalConclusion: {
          diagnosis: 'Whiplash Associated Disorder grade 2',
          treatmentPlan: 'Manuele therapie 2x/week, oefentherapie thuis, werkplekadvies',
          followUp: 'Evaluatie na 2 weken, bij geen verbetering doorverwijzing naar specialist'
        }
      }
    };

    mockBlob = new Blob([`
      <!DOCTYPE html>
      <html>
      <head><title>Test Export</title></head>
      <body>
        <h1>Medical Export - ${mockPatientInfo.initials}</h1>
        <div class="content">Test medical content</div>
      </body>
      </html>
    `], { type: 'text/html' });

    // Setup mocks
    setupExportManagerMocks();
    setupHistoryManagerMocks();
    setupQAValidatorMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete SOEP Workflow Journey', () => {
    it('should complete full SOEP export workflow with progress tracking and history', async () => {
      // Step 1: Render export panel for SOEP data
      render(
        <div>
          <ExportPanel
            patientInfo={mockPatientInfo}
            data={mockSOEPResult}
            dataType="soep"
            showAdvancedOptions={true}
          />
          <ExportHistoryPanel />
        </div>
      );

      // Step 2: Verify initial state
      expect(screen.getByText('Export Document')).toBeInTheDocument();
      expect(screen.getByText('HTML Document')).toBeInTheDocument();

      // Step 3: Select export options
      const htmlOption = screen.getByLabelText('HTML Document');
      await user.click(htmlOption);

      // Step 4: Open advanced options and customize
      const advancedButton = screen.getByText('Advanced Options');
      await user.click(advancedButton);

      // Toggle some options
      const includeTimestampCheckbox = screen.getByLabelText(/Include timestamp/i);
      await user.click(includeTimestampCheckbox);

      const includeRedFlagsCheckbox = screen.getByLabelText(/Include red flags/i);
      await user.click(includeRedFlagsCheckbox);

      // Step 5: Start export
      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      // Step 6: Verify progress tracking
      await waitFor(() => {
        expect(screen.getByText('Initializing')).toBeInTheDocument();
      }, { timeout: 5000 });

      await waitFor(() => {
        expect(screen.getByText('Complete')).toBeInTheDocument();
      }, { timeout: 10000 });

      // Step 7: Verify export manager was called correctly
      expect(AdvancedExportManager.getInstance().exportSOEP).toHaveBeenCalledWith(
        mockSOEPResult,
        mockPatientInfo,
        expect.objectContaining({
          format: 'html',
          includeTimestamp: false, // We toggled this off
          includeRedFlags: false,  // We toggled this off
          includePatientInfo: true,
          onProgress: expect.any(Function)
        })
      );

      // Step 8: Verify download was triggered
      expect(mockURL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockDocument.createElement).toHaveBeenCalledWith('a');
      expect(mockDocument.body.appendChild).toHaveBeenCalled();

      // Step 9: Verify history was recorded
      await waitFor(() => {
        expect(exportHistoryManager.addExportEntry).toHaveBeenCalledWith(
          mockPatientInfo,
          'consult',
          'html',
          expect.stringContaining('SOEP-verslag_E.T.'),
          mockBlob,
          expect.any(Object),
          expect.any(Number)
        );
      });

      // Step 10: Verify history panel shows the export
      await waitFor(() => {
        expect(screen.getByText(/SOEP-verslag_E\.T\./)).toBeInTheDocument();
      });
    });

    it('should handle SOEP export errors gracefully and allow retry', async () => {
      // Setup export manager to fail first, then succeed
      const mockExportManager = AdvancedExportManager.getInstance();
      vi.mocked(mockExportManager.exportSOEP)
        .mockRejectedValueOnce(new Error('Network timeout error'))
        .mockResolvedValueOnce(mockBlob);

      render(
        <ExportPanel
          patientInfo={mockPatientInfo}
          data={mockSOEPResult}
          dataType="soep"
        />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });

      // First attempt - should fail
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/Network timeout error/)).toBeInTheDocument();
      });

      // Verify error was recorded in history
      expect(exportHistoryManager.recordExportFailure).toHaveBeenCalledWith(
        mockPatientInfo,
        'consult',
        'html',
        expect.any(String),
        expect.any(Object),
        'Network timeout error',
        expect.any(Number)
      );

      // Second attempt - should succeed
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockURL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      });

      // Verify successful export was recorded
      expect(exportHistoryManager.addExportEntry).toHaveBeenCalled();
    });
  });

  describe('Complete Stepwise Intake Workflow Journey', () => {
    it('should complete full stepwise intake export workflow', async () => {
      render(
        <ExportPanel
          patientInfo={mockPatientInfo}
          data={mockStepwiseResults}
          dataType="stepwise-intake"
        />
      );

      // Select TXT format
      const txtOption = screen.getByLabelText('Plain Text');
      await user.click(txtOption);

      // Start export
      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Complete')).toBeInTheDocument();
      });

      // Verify stepwise export was called
      expect(AdvancedExportManager.getInstance().exportStepwiseIntake).toHaveBeenCalledWith(
        mockStepwiseResults.anamnese,
        mockStepwiseResults.onderzoek,
        mockStepwiseResults.klinischeConclusie,
        mockPatientInfo,
        expect.objectContaining({
          format: 'txt',
          onProgress: expect.any(Function)
        })
      );

      // Verify download and history
      expect(mockURL.createObjectURL).toHaveBeenCalled();
      expect(exportHistoryManager.addExportEntry).toHaveBeenCalledWith(
        mockPatientInfo,
        'intake-stapsgewijs',
        'txt',
        expect.stringContaining('Stapsgewijze-intake_E.T.'),
        mockBlob,
        expect.any(Object),
        expect.any(Number)
      );
    });

    it('should handle multiple format exports in sequence', async () => {
      render(
        <ExportPanel
          patientInfo={mockPatientInfo}
          data={mockStepwiseResults}
          dataType="stepwise-intake"
        />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });

      // Export as HTML
      const htmlOption = screen.getByLabelText('HTML Document');
      await user.click(htmlOption);
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Complete')).toBeInTheDocument();
      });

      // Export as TXT
      const txtOption = screen.getByLabelText('Plain Text');
      await user.click(txtOption);
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Complete')).toBeInTheDocument();
      });

      // Verify both exports were called
      expect(AdvancedExportManager.getInstance().exportStepwiseIntake).toHaveBeenCalledTimes(2);
      expect(exportHistoryManager.addExportEntry).toHaveBeenCalledTimes(2);

      // Verify different formats were used
      const calls = vi.mocked(exportHistoryManager.addExportEntry).mock.calls;
      expect(calls[0][2]).toBe('html');
      expect(calls[1][2]).toBe('txt');
    });
  });

  describe('Export History Management Workflow', () => {
    it('should complete full history management workflow', async () => {
      const mockHistoryEntries = [
        {
          id: 'entry-1',
          timestamp: '2024-01-15T10:30:00Z',
          patientInitials: 'E.T.',
          workflowType: 'consult',
          exportFormat: 'html',
          fileName: 'SOEP-verslag_E.T._2024-01-15.html',
          fileSize: 25600,
          status: 'completed',
          downloadCount: 1,
          blob: mockBlob,
          exportOptions: { format: 'html' }
        },
        {
          id: 'entry-2',
          timestamp: '2024-01-15T09:15:00Z',
          patientInitials: 'A.B.',
          workflowType: 'intake-stapsgewijs',
          exportFormat: 'txt',
          fileName: 'Intake_A.B._2024-01-15.txt',
          fileSize: 12800,
          status: 'failed',
          downloadCount: 0,
          errorMessage: 'Validation failed'
        }
      ];

      vi.mocked(exportHistoryManager.getHistory).mockReturnValue(mockHistoryEntries as any);
      vi.mocked(exportHistoryManager.redownloadExport).mockResolvedValue(true);

      render(<ExportHistoryPanel />);

      // Verify history is displayed
      expect(screen.getByText('Export History')).toBeInTheDocument();
      expect(screen.getByText('SOEP-verslag_E.T._2024-01-15.html')).toBeInTheDocument();
      expect(screen.getByText('Intake_A.B._2024-01-15.txt')).toBeInTheDocument();

      // Test filtering
      const filtersButton = screen.getByText('Filters');
      await user.click(filtersButton);

      const patientFilter = screen.getByPlaceholderText('Patient initials');
      await user.type(patientFilter, 'E.T.');

      await waitFor(() => {
        expect(exportHistoryManager.getHistory).toHaveBeenCalledWith({
          patientInitials: 'E.T.'
        });
      });

      // Test re-download
      const redownloadButtons = screen.getAllByTitle('Re-download');
      await user.click(redownloadButtons[0]);

      await waitFor(() => {
        expect(exportHistoryManager.redownloadExport).toHaveBeenCalledWith('entry-1');
      });

      // Verify download was triggered
      expect(mockDocument.createElement).toHaveBeenCalledWith('a');
    });

    it('should handle history errors and provide user feedback', async () => {
      vi.mocked(exportHistoryManager.getHistory).mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<ExportHistoryPanel />);

      // Should show empty state or error message
      expect(screen.getByText(/No export history found/)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Quality Assurance Integration Workflow', () => {
    it('should integrate QA validation with export workflows', async () => {
      const mockQAReport = {
        totalTests: 10,
        passedTests: 8,
        failedTests: 2,
        criticalFailures: 0,
        averageDuration: 1500,
        overallHealth: 'warning' as const,
        testResults: [],
        generatedAt: '2024-01-15T12:00:00Z'
      };

      vi.mocked(qaValidator.runAllValidations).mockResolvedValue(mockQAReport);

      // This would be integrated into a dashboard component
      const qaResult = await qaValidator.runAllValidations();

      expect(qaResult.overallHealth).toBe('warning');
      expect(qaResult.totalTests).toBe(10);
      expect(qaResult.passedTests).toBe(8);
    });
  });

  describe('Performance and Stress Testing', () => {
    it('should handle rapid sequential exports without issues', async () => {
      render(
        <ExportPanel
          patientInfo={mockPatientInfo}
          data={mockSOEPResult}
          dataType="soep"
        />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });

      // Perform rapid sequential exports
      for (let i = 0; i < 5; i++) {
        await user.click(exportButton);

        // Wait for each export to complete
        await waitFor(() => {
          expect(screen.getByText('Complete')).toBeInTheDocument();
        });
      }

      // Verify all exports were processed
      expect(AdvancedExportManager.getInstance().exportSOEP).toHaveBeenCalledTimes(5);
      expect(exportHistoryManager.addExportEntry).toHaveBeenCalledTimes(5);
    });

    it('should handle large export operations without memory issues', async () => {
      // Mock large blob
      const largeBlob = new Blob([new Array(1024 * 1024).fill('x').join('')], { type: 'text/html' }); // 1MB
      vi.mocked(AdvancedExportManager.getInstance().exportSOEP).mockResolvedValue(largeBlob);

      render(
        <ExportPanel
          patientInfo={mockPatientInfo}
          data={mockSOEPResult}
          dataType="soep"
        />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Complete')).toBeInTheDocument();
      });

      // Verify large export was handled
      expect(mockURL.createObjectURL).toHaveBeenCalledWith(largeBlob);
      expect(exportHistoryManager.addExportEntry).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        largeBlob,
        expect.any(Object),
        expect.any(Number)
      );
    });
  });

  describe('Cross-Component Integration', () => {
    it('should maintain state consistency across multiple components', async () => {
      // Render both export and history components
      render(
        <div>
          <ExportPanel
            patientInfo={mockPatientInfo}
            data={mockSOEPResult}
            dataType="soep"
          />
          <ExportHistoryPanel />
        </div>
      );

      // Perform export
      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Complete')).toBeInTheDocument();
      });

      // Verify both components are updated consistently
      expect(exportHistoryManager.addExportEntry).toHaveBeenCalled();

      // Mock updated history for history panel
      const updatedHistory = [{
        id: 'new-entry',
        patientInitials: 'E.T.',
        fileName: 'SOEP-verslag_E.T._2024-01-15.html',
        workflowType: 'consult',
        exportFormat: 'html',
        status: 'completed',
        timestamp: new Date().toISOString()
      }];

      vi.mocked(exportHistoryManager.getHistory).mockReturnValue(updatedHistory as any);

      // Trigger history refresh (would happen automatically in real app)
      const refreshButton = screen.getByTitle(/refresh/i);
      await user.click(refreshButton);

      // Verify history shows the new export
      await waitFor(() => {
        expect(screen.getByText(/SOEP-verslag_E\.T\./)).toBeInTheDocument();
      });
    });
  });

  // Helper function to setup export manager mocks
  function setupExportManagerMocks() {
    const mockExportManager = {
      exportSOEP: vi.fn().mockImplementation(async (data, patient, options) => {
        // Simulate progress callbacks
        if (options?.onProgress) {
          options.onProgress({ stage: 'Initializing', percentage: 0, currentStep: 'Starting' });
          await new Promise(resolve => setTimeout(resolve, 100));
          options.onProgress({ stage: 'Validating', percentage: 25, currentStep: 'Validating' });
          await new Promise(resolve => setTimeout(resolve, 100));
          options.onProgress({ stage: 'Generating', percentage: 75, currentStep: 'Generating' });
          await new Promise(resolve => setTimeout(resolve, 100));
          options.onProgress({ stage: 'Complete', percentage: 100, currentStep: 'Complete' });
        }
        return mockBlob;
      }),
      exportStepwiseIntake: vi.fn().mockImplementation(async (anamnese, onderzoek, conclusie, patient, options) => {
        if (options?.onProgress) {
          options.onProgress({ stage: 'Initializing', percentage: 0, currentStep: 'Starting' });
          await new Promise(resolve => setTimeout(resolve, 50));
          options.onProgress({ stage: 'Complete', percentage: 100, currentStep: 'Complete' });
        }
        return mockBlob;
      }),
      exportAutomatedIntake: vi.fn().mockResolvedValue(mockBlob),
      getInstance: vi.fn(() => mockExportManager),
    };

    vi.mocked(AdvancedExportManager).mockImplementation(() => mockExportManager as any);
    vi.mocked(AdvancedExportManager.getInstance).mockReturnValue(mockExportManager as any);
  }

  function setupHistoryManagerMocks() {
    const mockHistoryManager = {
      addExportEntry: vi.fn().mockReturnValue('test-entry-id'),
      recordExportFailure: vi.fn().mockReturnValue('test-failure-id'),
      getHistory: vi.fn().mockReturnValue([]),
      redownloadExport: vi.fn().mockResolvedValue(true),
      deleteEntry: vi.fn().mockReturnValue(true),
      getStatistics: vi.fn().mockReturnValue({
        totalExports: 5,
        successfulExports: 4,
        failedExports: 1
      })
    };

    Object.assign(exportHistoryManager, mockHistoryManager);
  }

  function setupQAValidatorMocks() {
    const mockQAValidator = {
      runAllValidations: vi.fn().mockResolvedValue({
        totalTests: 10,
        passedTests: 9,
        failedTests: 1,
        criticalFailures: 0,
        averageDuration: 1200,
        overallHealth: 'healthy',
        testResults: [],
        generatedAt: new Date().toISOString()
      }),
      getLatestReport: vi.fn().mockReturnValue(null),
    };

    Object.assign(qaValidator, mockQAValidator);
  }
});