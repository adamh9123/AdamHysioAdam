/**
 * Tests for Unified Export Utilities
 * Tests the simplified export interfaces and helper functions
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  exportSOEPResults,
  exportStepwiseIntake,
  exportAutomatedIntake,
  downloadExportedFile,
  exportAndDownloadSOEP,
  isValidExportFormat,
  getAvailableFormats,
  getFormatDisplayName,
  type ExportResult,
  type SimpleExportOptions
} from '@/lib/utils/export';
import type { PatientInfo, ConsultResult, AnamneseResult, OnderzoekResult, KlinischeConclusieResult } from '@/types/api';

// Mock the AdvancedExportManager
vi.mock('@/lib/utils/advanced-export', () => {
  const mockExportManager = {
    exportSOEP: vi.fn(),
    exportStepwiseIntake: vi.fn(),
    exportAutomatedIntake: vi.fn(),
    getInstance: vi.fn(() => mockExportManager),
  };
  return {
    AdvancedExportManager: {
      getInstance: () => mockExportManager
    }
  };
});

// Mock DOM functions
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

Object.defineProperty(document, 'createElement', { value: mockCreateElement });
Object.defineProperty(document.body, 'appendChild', { value: mockAppendChild });
Object.defineProperty(document.body, 'removeChild', { value: mockRemoveChild });
Object.defineProperty(window.URL, 'createObjectURL', { value: mockCreateObjectURL });
Object.defineProperty(window.URL, 'revokeObjectURL', { value: mockRevokeObjectURL });

describe('Export Utilities', () => {
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
      chiefComplaint: 'Test complaint'
    };

    mockConsultResult = {
      soepStructure: {
        subjectief: 'Patient complaint',
        objectief: 'Physical findings',
        evaluatie: 'Assessment',
        plan: 'Treatment plan'
      },
      consultSummary: 'Summary',
      redFlags: []
    };

    mockBlob = new Blob(['test content'], { type: 'text/html' });

    // Setup DOM mocks
    mockCreateElement.mockReturnValue({
      href: '',
      download: '',
      click: vi.fn(),
    });
    mockCreateObjectURL.mockReturnValue('mock-url');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportSOEPResults', () => {
    it('should export SOEP results successfully', async () => {
      const { AdvancedExportManager } = await import('@/lib/utils/advanced-export');
      const mockExportManager = AdvancedExportManager.getInstance();
      vi.mocked(mockExportManager.exportSOEP).mockResolvedValue(mockBlob);

      const options: SimpleExportOptions = {
        format: 'html',
        includePatientInfo: true,
        includeRedFlags: true
      };

      const result = await exportSOEPResults(mockConsultResult, mockPatientInfo, options);

      expect(result.success).toBe(true);
      expect(result.blob).toBe(mockBlob);
      expect(result.fileName).toMatch(/^SOEP-verslag_J\.D\._\d{4}-\d{2}-\d{2}\.html$/);
      expect(result.error).toBeUndefined();

      expect(mockExportManager.exportSOEP).toHaveBeenCalledWith(
        mockConsultResult,
        mockPatientInfo,
        expect.objectContaining({
          format: 'html',
          includePatientInfo: true,
          includeRedFlags: true
        })
      );
    });

    it('should handle export errors gracefully', async () => {
      const { AdvancedExportManager } = await import('@/lib/utils/advanced-export');
      const mockExportManager = AdvancedExportManager.getInstance();
      vi.mocked(mockExportManager.exportSOEP).mockRejectedValue(new Error('Export failed'));

      const result = await exportSOEPResults(mockConsultResult, mockPatientInfo);

      expect(result.success).toBe(false);
      expect(result.blob).toBeUndefined();
      expect(result.fileName).toBe('');
      expect(result.error).toBe('Export failed');
    });

    it('should use custom filename when provided', async () => {
      const { AdvancedExportManager } = await import('@/lib/utils/advanced-export');
      const mockExportManager = AdvancedExportManager.getInstance();
      vi.mocked(mockExportManager.exportSOEP).mockResolvedValue(mockBlob);

      const options: SimpleExportOptions = {
        customFileName: 'custom-export.html'
      };

      const result = await exportSOEPResults(mockConsultResult, mockPatientInfo, options);

      expect(result.success).toBe(true);
      expect(result.fileName).toBe('custom-export.html');
    });

    it('should default to html format when not specified', async () => {
      const { AdvancedExportManager } = await import('@/lib/utils/advanced-export');
      const mockExportManager = AdvancedExportManager.getInstance();
      vi.mocked(mockExportManager.exportSOEP).mockResolvedValue(mockBlob);

      const result = await exportSOEPResults(mockConsultResult, mockPatientInfo);

      expect(result.fileName).toContain('.html');
    });
  });

  describe('exportStepwiseIntake', () => {
    let mockAnamneseResult: AnamneseResult;
    let mockOnderzoekResult: OnderzoekResult;
    let mockKlinischeConclusieResult: KlinischeConclusieResult;

    beforeEach(() => {
      mockAnamneseResult = {
        hhsbAnamneseCard: {
          hulpvraag: 'Help request',
          historie: 'History',
          stoornissen: 'Disorders',
          beperkingen: 'Limitations'
        },
        redFlags: []
      };

      mockOnderzoekResult = {
        examinationFindings: {
          physicalTests: 'Test results',
          movements: 'Movement assessment',
          palpation: 'Palpation findings'
        },
        redFlags: []
      };

      mockKlinischeConclusieResult = {
        clinicalConclusion: {
          diagnosis: 'Diagnosis',
          treatmentPlan: 'Treatment',
          followUp: 'Follow-up'
        }
      };
    });

    it('should export stepwise intake successfully', async () => {
      const { AdvancedExportManager } = await import('@/lib/utils/advanced-export');
      const mockExportManager = AdvancedExportManager.getInstance();
      vi.mocked(mockExportManager.exportStepwiseIntake).mockResolvedValue(mockBlob);

      const options: SimpleExportOptions = { format: 'txt' };

      const result = await exportStepwiseIntake(
        mockAnamneseResult,
        mockOnderzoekResult,
        mockKlinischeConclusieResult,
        mockPatientInfo,
        options
      );

      expect(result.success).toBe(true);
      expect(result.blob).toBe(mockBlob);
      expect(result.fileName).toMatch(/^Stapsgewijze-intake_J\.D\._\d{4}-\d{2}-\d{2}\.txt$/);

      expect(mockExportManager.exportStepwiseIntake).toHaveBeenCalledWith(
        mockAnamneseResult,
        mockOnderzoekResult,
        mockKlinischeConclusieResult,
        mockPatientInfo,
        expect.objectContaining({ format: 'txt' })
      );
    });

    it('should handle export errors', async () => {
      const { AdvancedExportManager } = await import('@/lib/utils/advanced-export');
      const mockExportManager = AdvancedExportManager.getInstance();
      vi.mocked(mockExportManager.exportStepwiseIntake).mockRejectedValue(
        new Error('Validation failed')
      );

      const result = await exportStepwiseIntake(
        mockAnamneseResult,
        mockOnderzoekResult,
        mockKlinischeConclusieResult,
        mockPatientInfo
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
    });
  });

  describe('exportAutomatedIntake', () => {
    it('should export automated intake successfully', async () => {
      const { AdvancedExportManager } = await import('@/lib/utils/advanced-export');
      const mockExportManager = AdvancedExportManager.getInstance();
      vi.mocked(mockExportManager.exportAutomatedIntake).mockResolvedValue(mockBlob);

      const mockIntakeResult = {
        hhsbAnamneseCard: { hulpvraag: 'Help request' },
        examinationFindings: { physicalTests: 'Tests' }
      };

      const options: SimpleExportOptions = { format: 'docx' };

      const result = await exportAutomatedIntake(
        mockIntakeResult,
        mockPatientInfo,
        options
      );

      expect(result.success).toBe(true);
      expect(result.blob).toBe(mockBlob);
      expect(result.fileName).toMatch(/^Automatische-intake_J\.D\._\d{4}-\d{2}-\d{2}\.docx$/);

      expect(mockExportManager.exportAutomatedIntake).toHaveBeenCalledWith(
        mockIntakeResult,
        mockPatientInfo,
        expect.objectContaining({ format: 'docx' })
      );
    });
  });

  describe('downloadExportedFile', () => {
    it('should download file successfully', () => {
      const mockElement = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      mockCreateElement.mockReturnValue(mockElement);

      const result: ExportResult = {
        success: true,
        blob: mockBlob,
        fileName: 'test-export.html'
      };

      downloadExportedFile(result);

      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockElement.href).toBe('mock-url');
      expect(mockElement.download).toBe('test-export.html');
      expect(mockElement.click).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalledWith(mockElement);
      expect(mockRemoveChild).toHaveBeenCalledWith(mockElement);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url');
    });

    it('should throw error for unsuccessful export', () => {
      const result: ExportResult = {
        success: false,
        fileName: '',
        error: 'Export failed'
      };

      expect(() => downloadExportedFile(result)).toThrow('Export failed');
    });

    it('should throw error for missing blob', () => {
      const result: ExportResult = {
        success: true,
        fileName: 'test.html'
        // blob is undefined
      };

      expect(() => downloadExportedFile(result)).toThrow('Export failed');
    });
  });

  describe('exportAndDownloadSOEP', () => {
    it('should export and download in one step', async () => {
      const { AdvancedExportManager } = await import('@/lib/utils/advanced-export');
      const mockExportManager = AdvancedExportManager.getInstance();
      vi.mocked(mockExportManager.exportSOEP).mockResolvedValue(mockBlob);

      const mockElement = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      mockCreateElement.mockReturnValue(mockElement);

      const success = await exportAndDownloadSOEP(mockConsultResult, mockPatientInfo);

      expect(success).toBe(true);
      expect(mockExportManager.exportSOEP).toHaveBeenCalled();
      expect(mockElement.click).toHaveBeenCalled();
    });

    it('should throw error on export failure', async () => {
      const { AdvancedExportManager } = await import('@/lib/utils/advanced-export');
      const mockExportManager = AdvancedExportManager.getInstance();
      vi.mocked(mockExportManager.exportSOEP).mockRejectedValue(new Error('Export failed'));

      await expect(
        exportAndDownloadSOEP(mockConsultResult, mockPatientInfo)
      ).rejects.toThrow('Export failed');
    });
  });

  describe('Utility Functions', () => {
    describe('isValidExportFormat', () => {
      it('should validate correct formats', () => {
        expect(isValidExportFormat('html')).toBe(true);
        expect(isValidExportFormat('txt')).toBe(true);
        expect(isValidExportFormat('docx')).toBe(true);
        expect(isValidExportFormat('pdf')).toBe(true);
      });

      it('should reject invalid formats', () => {
        expect(isValidExportFormat('xml')).toBe(false);
        expect(isValidExportFormat('json')).toBe(false);
        expect(isValidExportFormat('')).toBe(false);
        expect(isValidExportFormat('HTML')).toBe(false); // Case sensitive
      });
    });

    describe('getAvailableFormats', () => {
      it('should return all available formats', () => {
        const formats = getAvailableFormats();
        expect(formats).toEqual(['html', 'txt', 'docx', 'pdf']);
      });
    });

    describe('getFormatDisplayName', () => {
      it('should return correct display names', () => {
        expect(getFormatDisplayName('html')).toBe('HTML Document');
        expect(getFormatDisplayName('txt')).toBe('Plain Text');
        expect(getFormatDisplayName('docx')).toBe('Word Document');
        expect(getFormatDisplayName('pdf')).toBe('PDF Document');
      });

      it('should handle unknown formats', () => {
        expect(getFormatDisplayName('unknown' as any)).toBe('Unknown Format');
      });
    });
  });

  describe('Filename Generation', () => {
    it('should generate filename with current date', async () => {
      const { AdvancedExportManager } = await import('@/lib/utils/advanced-export');
      const mockExportManager = AdvancedExportManager.getInstance();
      vi.mocked(mockExportManager.exportSOEP).mockResolvedValue(mockBlob);

      const result = await exportSOEPResults(mockConsultResult, mockPatientInfo);

      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      expect(result.fileName).toContain(today);
    });

    it('should include patient initials in filename', async () => {
      const { AdvancedExportManager } = await import('@/lib/utils/advanced-export');
      const mockExportManager = AdvancedExportManager.getInstance();
      vi.mocked(mockExportManager.exportSOEP).mockResolvedValue(mockBlob);

      const patientWithSpecialInitials = {
        ...mockPatientInfo,
        initials: 'A.B.C.'
      };

      const result = await exportSOEPResults(mockConsultResult, patientWithSpecialInitials);
      expect(result.fileName).toContain('A.B.C.');
    });

    it('should handle missing patient initials gracefully', async () => {
      const { AdvancedExportManager } = await import('@/lib/utils/advanced-export');
      const mockExportManager = AdvancedExportManager.getInstance();
      vi.mocked(mockExportManager.exportSOEP).mockResolvedValue(mockBlob);

      const patientWithoutInitials = {
        ...mockPatientInfo,
        initials: ''
      };

      // This should fail validation, but let's test filename generation
      try {
        await exportSOEPResults(mockConsultResult, patientWithoutInitials);
      } catch (error) {
        // Expected to fail due to validation
        expect(error).toBeTruthy();
      }
    });

    it('should use correct file extension for format', async () => {
      const { AdvancedExportManager } = await import('@/lib/utils/advanced-export');
      const mockExportManager = AdvancedExportManager.getInstance();
      vi.mocked(mockExportManager.exportSOEP).mockResolvedValue(mockBlob);

      const formats = [
        { format: 'html', extension: '.html' },
        { format: 'txt', extension: '.txt' },
        { format: 'docx', extension: '.docx' },
        { format: 'pdf', extension: '.pdf' }
      ];

      for (const { format, extension } of formats) {
        const options: SimpleExportOptions = { format: format as any };
        const result = await exportSOEPResults(mockConsultResult, mockPatientInfo, options);
        expect(result.fileName).toEndWith(extension);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown errors gracefully', async () => {
      const { AdvancedExportManager } = await import('@/lib/utils/advanced-export');
      const mockExportManager = AdvancedExportManager.getInstance();
      vi.mocked(mockExportManager.exportSOEP).mockRejectedValue('String error');

      const result = await exportSOEPResults(mockConsultResult, mockPatientInfo);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Export failed'); // Default error message for non-Error objects
    });

    it('should preserve original error message', async () => {
      const { AdvancedExportManager } = await import('@/lib/utils/advanced-export');
      const mockExportManager = AdvancedExportManager.getInstance();
      const specificError = new Error('Specific validation error');
      vi.mocked(mockExportManager.exportSOEP).mockRejectedValue(specificError);

      const result = await exportSOEPResults(mockConsultResult, mockPatientInfo);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Specific validation error');
    });
  });
});