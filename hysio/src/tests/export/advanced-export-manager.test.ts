/**
 * Comprehensive Tests for AdvancedExportManager
 * Tests the complete export functionality including validation, generation, and history
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AdvancedExportManager, type ExportOptions } from '@/lib/utils/advanced-export';
import { exportHistoryManager } from '@/lib/utils/export-history';
import type { PatientInfo, ConsultResult, AnamneseResult, OnderzoekResult, KlinischeConclusieResult } from '@/types/api';

// Mock the export history manager
vi.mock('@/lib/utils/export-history', () => ({
  exportHistoryManager: {
    addExportEntry: vi.fn(),
    recordExportFailure: vi.fn()
  }
}));

describe('AdvancedExportManager', () => {
  let exportManager: AdvancedExportManager;
  let mockPatientInfo: PatientInfo;
  let mockConsultResult: ConsultResult;

  beforeEach(() => {
    exportManager = AdvancedExportManager.getInstance();
    vi.clearAllMocks();

    // Mock patient info
    mockPatientInfo = {
      id: 'test-patient-1',
      initials: 'J.D.',
      birthYear: '1990',
      gender: 'male',
      chiefComplaint: 'Rugpijn'
    };

    // Mock SOEP consultation result
    mockConsultResult = {
      soepStructure: {
        subjectief: 'Patiënt klaagt over pijn in de onderrug',
        objectief: 'Beperkte flexie, geen neurologische uitval',
        evaluatie: 'Waarschijnlijk mechanische lage rugpijn',
        plan: 'Fysiotherapie en pijnstilling'
      },
      consultSummary: 'Mechanische lage rugpijn, behandeling gestart',
      redFlags: ['Geen rode vlaggen geïdentificeerd']
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AdvancedExportManager.getInstance();
      const instance2 = AdvancedExportManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Input Validation', () => {
    describe('Export Options Validation', () => {
      it('should validate export format', async () => {
        const invalidOptions = { format: 'invalid' as any };

        await expect(
          exportManager.exportSOEP(mockConsultResult, mockPatientInfo, invalidOptions)
        ).rejects.toThrow('Invalid export format: invalid');
      });

      it('should validate boolean options', async () => {
        const invalidOptions = { includePatientInfo: 'yes' as any };

        await expect(
          exportManager.exportSOEP(mockConsultResult, mockPatientInfo, invalidOptions)
        ).rejects.toThrow('must be a boolean value');
      });

      it('should validate language option', async () => {
        const invalidOptions = { language: 'fr' as any };

        await expect(
          exportManager.exportSOEP(mockConsultResult, mockPatientInfo, invalidOptions)
        ).rejects.toThrow('Invalid language: fr');
      });

      it('should validate page size option', async () => {
        const invalidOptions = { pageSize: 'tabloid' as any };

        await expect(
          exportManager.exportSOEP(mockConsultResult, mockPatientInfo, invalidOptions)
        ).rejects.toThrow('Invalid page size: tabloid');
      });
    });

    describe('Patient Info Validation', () => {
      it('should require patient info', async () => {
        await expect(
          exportManager.exportSOEP(mockConsultResult, null as any)
        ).rejects.toThrow('Patient information is required');
      });

      it('should require patient initials', async () => {
        const invalidPatient = { ...mockPatientInfo, initials: '' };

        await expect(
          exportManager.exportSOEP(mockConsultResult, invalidPatient)
        ).rejects.toThrow('Patient initials are required');
      });

      it('should validate birth year', async () => {
        const invalidPatient = { ...mockPatientInfo, birthYear: '1800' };

        await expect(
          exportManager.exportSOEP(mockConsultResult, invalidPatient)
        ).rejects.toThrow('Invalid birth year provided');
      });
    });

    describe('SOEP Data Validation', () => {
      it('should require consult result', async () => {
        await expect(
          exportManager.exportSOEP(null as any, mockPatientInfo)
        ).rejects.toThrow('Consult result data is required');
      });

      it('should require SOEP structure', async () => {
        const invalidConsult = { ...mockConsultResult, soepStructure: null as any };

        await expect(
          exportManager.exportSOEP(invalidConsult, mockPatientInfo)
        ).rejects.toThrow('SOEP structure is missing');
      });

      it('should warn about missing SOEP sections', async () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const incompleteSOEP = {
          ...mockConsultResult,
          soepStructure: {
            subjectief: 'Test',
            objectief: '',
            evaluatie: '',
            plan: ''
          }
        };

        try {
          await exportManager.exportSOEP(incompleteSOEP, mockPatientInfo);
        } catch (error) {
          // Expected to throw due to missing sections
        }

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Missing SOEP sections: Objectief, Evaluatie, Plan')
        );

        consoleSpy.mockRestore();
      });
    });
  });

  describe('Export Generation', () => {
    describe('HTML Export', () => {
      it('should generate HTML export successfully', async () => {
        const options: ExportOptions = { format: 'html' };
        const result = await exportManager.exportSOEP(mockConsultResult, mockPatientInfo, options);

        expect(result).toBeInstanceOf(Blob);
        expect(result.type).toBe('text/html;charset=utf-8');
        expect(result.size).toBeGreaterThan(0);

        // Verify history was recorded
        expect(exportHistoryManager.addExportEntry).toHaveBeenCalledWith(
          mockPatientInfo,
          'consult',
          'html',
          expect.stringContaining('SOEP-verslag_J.D.'),
          result,
          expect.objectContaining({ format: 'html' }),
          expect.any(Number)
        );
      });

      it('should include patient info in HTML when enabled', async () => {
        const options: ExportOptions = { format: 'html', includePatientInfo: true };
        const result = await exportManager.exportSOEP(mockConsultResult, mockPatientInfo, options);

        const html = await result.text();
        expect(html).toContain(mockPatientInfo.initials);
        expect(html).toContain(mockPatientInfo.chiefComplaint);
      });

      it('should include red flags in HTML when enabled', async () => {
        const options: ExportOptions = { format: 'html', includeRedFlags: true };
        const result = await exportManager.exportSOEP(mockConsultResult, mockPatientInfo, options);

        const html = await result.text();
        expect(html).toContain('rode vlaggen'); // Dutch for red flags
      });
    });

    describe('TXT Export', () => {
      it('should generate TXT export successfully', async () => {
        const options: ExportOptions = { format: 'txt' };
        const result = await exportManager.exportSOEP(mockConsultResult, mockPatientInfo, options);

        expect(result).toBeInstanceOf(Blob);
        expect(result.type).toBe('text/plain;charset=utf-8');
        expect(result.size).toBeGreaterThan(0);
      });

      it('should format TXT content correctly', async () => {
        const options: ExportOptions = { format: 'txt', includePatientInfo: true };
        const result = await exportManager.exportSOEP(mockConsultResult, mockPatientInfo, options);

        const text = await result.text();
        expect(text).toContain('SOEP VERSLAG');
        expect(text).toContain('S - SUBJECTIEF');
        expect(text).toContain('O - OBJECTIEF');
        expect(text).toContain('E - EVALUATIE');
        expect(text).toContain('P - PLAN');
        expect(text).toContain(mockPatientInfo.initials);
      });
    });

    describe('DOCX Export', () => {
      it('should return placeholder for DOCX export', async () => {
        const options: ExportOptions = { format: 'docx' };
        const result = await exportManager.exportSOEP(mockConsultResult, mockPatientInfo, options);

        expect(result).toBeInstanceOf(Blob);
        const text = await result.text();
        expect(text).toContain('DOCX export not yet implemented');
      });
    });

    describe('PDF Export', () => {
      it('should return placeholder for PDF export', async () => {
        const options: ExportOptions = { format: 'pdf' };
        const result = await exportManager.exportSOEP(mockConsultResult, mockPatientInfo, options);

        expect(result).toBeInstanceOf(Blob);
        const text = await result.text();
        expect(text).toContain('PDF export not yet implemented');
      });
    });
  });

  describe('Progress Tracking', () => {
    it('should call progress callback during export', async () => {
      const progressCallback = vi.fn();
      const options: ExportOptions = {
        format: 'html',
        onProgress: progressCallback
      };

      await exportManager.exportSOEP(mockConsultResult, mockPatientInfo, options);

      expect(progressCallback).toHaveBeenCalledTimes(6); // Initializing, Validating (3x), Preparing, Generating, Finalizing, Complete

      // Check specific progress calls
      expect(progressCallback).toHaveBeenCalledWith({
        stage: 'Initializing',
        percentage: 0,
        currentStep: 'Starting SOEP export',
        estimatedTimeRemaining: expect.any(Number)
      });

      expect(progressCallback).toHaveBeenCalledWith({
        stage: 'Complete',
        percentage: 100,
        currentStep: 'Export completed successfully',
        estimatedTimeRemaining: 0
      });
    });

    it('should handle progress callback errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const faultyCallback = vi.fn().mockImplementation(() => {
        throw new Error('Progress callback error');
      });

      const options: ExportOptions = {
        format: 'html',
        onProgress: faultyCallback
      };

      // Should not throw error due to progress callback failure
      await expect(
        exportManager.exportSOEP(mockConsultResult, mockPatientInfo, options)
      ).resolves.toBeInstanceOf(Blob);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in progress callback:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Stepwise Intake Export', () => {
    let mockAnamneseResult: AnamneseResult;
    let mockOnderzoekResult: OnderzoekResult;
    let mockKlinischeConclusieResult: KlinischeConclusieResult;

    beforeEach(() => {
      mockAnamneseResult = {
        hhsbAnamneseCard: {
          hulpvraag: 'Behandeling rugpijn',
          historie: 'Pijn sinds 3 weken',
          stoornissen: 'Beperkte beweeglijkheid',
          beperkingen: 'Kan niet lang zitten'
        },
        redFlags: []
      };

      mockOnderzoekResult = {
        examinationFindings: {
          physicalTests: 'Beperkte flexie',
          movements: 'Pijnlijk bij vooroverbuigen',
          palpation: 'Gevoelige spieren'
        },
        redFlags: []
      };

      mockKlinischeConclusieResult = {
        clinicalConclusion: {
          diagnosis: 'Mechanische lage rugpijn',
          treatmentPlan: 'Manuele therapie',
          followUp: 'Controle na 2 weken'
        }
      };
    });

    it('should export stepwise intake successfully', async () => {
      const options: ExportOptions = { format: 'html' };
      const result = await exportManager.exportStepwiseIntake(
        mockAnamneseResult,
        mockOnderzoekResult,
        mockKlinischeConclusieResult,
        mockPatientInfo,
        options
      );

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('text/html;charset=utf-8');

      // Verify history was recorded
      expect(exportHistoryManager.addExportEntry).toHaveBeenCalledWith(
        mockPatientInfo,
        'intake-stapsgewijs',
        'html',
        expect.stringContaining('Stapsgewijze-intake_J.D.'),
        result,
        expect.objectContaining({ format: 'html' }),
        expect.any(Number)
      );
    });

    it('should require at least one step result', async () => {
      await expect(
        exportManager.exportStepwiseIntake(null as any, null as any, null as any, mockPatientInfo)
      ).rejects.toThrow('At least one step result is required');
    });

    it('should warn about missing HHSB structure', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const invalidAnamnese = { ...mockAnamneseResult, hhsbAnamneseCard: null as any };

      try {
        await exportManager.exportStepwiseIntake(
          invalidAnamnese,
          mockOnderzoekResult,
          mockKlinischeConclusieResult,
          mockPatientInfo
        );
      } catch (error) {
        // May fail for other reasons
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        'Warning: Anamnese result missing HHSB structure'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling and History', () => {
    it('should record export failure in history', async () => {
      const invalidConsult = null as any; // This will cause validation to fail

      try {
        await exportManager.exportSOEP(invalidConsult, mockPatientInfo);
      } catch (error) {
        expect(exportHistoryManager.recordExportFailure).toHaveBeenCalledWith(
          mockPatientInfo,
          'consult',
          'html',
          expect.stringContaining('SOEP-verslag_J.D.'),
          expect.objectContaining({ format: 'html' }),
          expect.stringContaining('Consult result data is required'),
          expect.any(Number)
        );
      }
    });

    it('should handle history recording errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.mocked(exportHistoryManager.addExportEntry).mockImplementation(() => {
        throw new Error('History storage error');
      });

      // Should still complete export even if history fails
      const result = await exportManager.exportSOEP(mockConsultResult, mockPatientInfo);
      expect(result).toBeInstanceOf(Blob);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to record export in history:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Customization Options', () => {
    it('should use custom filename when provided', async () => {
      const customFileName = 'custom-export.html';
      const options: ExportOptions = {
        format: 'html',
        customFileName
      };

      await exportManager.exportSOEP(mockConsultResult, mockPatientInfo, options);

      expect(exportHistoryManager.addExportEntry).toHaveBeenCalledWith(
        mockPatientInfo,
        'consult',
        'html',
        customFileName,
        expect.any(Blob),
        expect.objectContaining({ customFileName }),
        expect.any(Number)
      );
    });

    it('should generate default filename correctly', async () => {
      const options: ExportOptions = { format: 'txt' };
      await exportManager.exportSOEP(mockConsultResult, mockPatientInfo, options);

      expect(exportHistoryManager.addExportEntry).toHaveBeenCalledWith(
        mockPatientInfo,
        'consult',
        'txt',
        expect.stringMatching(/^SOEP-verslag_J\.D\._\d{4}-\d{2}-\d{2}\.txt$/),
        expect.any(Blob),
        expect.any(Object),
        expect.any(Number)
      );
    });
  });
});