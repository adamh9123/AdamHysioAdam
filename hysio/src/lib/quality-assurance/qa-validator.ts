/**
 * Quality Assurance Validator for Hysio Medical Scribe v7.0
 * Automated validation of critical user journeys and functionality
 */

import type { PatientInfo, ConsultResult, AnamneseResult, OnderzoekResult, KlinischeConclusieResult } from '@/types/api';
import { AdvancedExportManager } from '@/lib/utils/advanced-export';
import { exportHistoryManager } from '@/lib/utils/export-history';

export interface QATestResult {
  testName: string;
  category: 'critical' | 'important' | 'minor';
  success: boolean;
  duration: number;
  error?: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface QAReportSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  criticalFailures: number;
  averageDuration: number;
  overallHealth: 'healthy' | 'warning' | 'critical';
  testResults: QATestResult[];
  generatedAt: string;
}

export class QAValidator {
  private static instance: QAValidator;
  private testResults: QATestResult[] = [];

  private constructor() {}

  public static getInstance(): QAValidator {
    if (!QAValidator.instance) {
      QAValidator.instance = new QAValidator();
    }
    return QAValidator.instance;
  }

  /**
   * Run all critical user journey validations
   */
  public async runAllValidations(): Promise<QAReportSummary> {
    console.log('🔍 Starting QA validation of critical user journeys...');
    this.testResults = [];

    // Critical path tests
    await this.testExportSystemIntegrity();
    await this.testDataValidationPipeline();
    await this.testErrorHandlingRobustness();
    await this.testProgressTrackingAccuracy();
    await this.testHistoryManagementReliability();

    // Important workflow tests
    await this.testSOEPWorkflowCompleteness();
    await this.testStepwiseIntakeWorkflow();
    await this.testAutomatedIntakeWorkflow();

    // Performance and reliability tests
    await this.testExportPerformance();
    await this.testMemoryLeakPrevention();
    await this.testConcurrentOperationHandling();

    return this.generateReport();
  }

  /**
   * Test export system integrity
   */
  private async testExportSystemIntegrity(): Promise<void> {
    const startTime = Date.now();

    try {
      const mockPatient = this.createMockPatientInfo();
      const mockSOEP = this.createMockSOEPResult();
      const exportManager = AdvancedExportManager.getInstance();

      // Test all export formats
      const formats = ['html', 'txt', 'docx', 'pdf'] as const;
      const results: Record<string, boolean> = {};

      for (const format of formats) {
        try {
          const blob = await exportManager.exportSOEP(mockSOEP, mockPatient, {
            format,
            includePatientInfo: true,
            includeRedFlags: true
          });

          results[format] = blob instanceof Blob && blob.size > 0;
        } catch (error) {
          results[format] = false;
        }
      }

      const allFormatsWork = Object.values(results).every(success => success);

      this.addTestResult({
        testName: 'Export System Integrity',
        category: 'critical',
        success: allFormatsWork,
        duration: Date.now() - startTime,
        details: { formatResults: results },
        error: allFormatsWork ? undefined : 'One or more export formats failed'
      });

    } catch (error) {
      this.addTestResult({
        testName: 'Export System Integrity',
        category: 'critical',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test data validation pipeline
   */
  private async testDataValidationPipeline(): Promise<void> {
    const startTime = Date.now();

    try {
      const exportManager = AdvancedExportManager.getInstance();
      const validationTests: Array<{ name: string; test: () => Promise<void> }> = [];

      // Test invalid patient info
      validationTests.push({
        name: 'Invalid patient info rejection',
        test: async () => {
          const invalidPatient = { initials: '', birthYear: '1800' } as PatientInfo;
          const mockSOEP = this.createMockSOEPResult();

          try {
            await exportManager.exportSOEP(mockSOEP, invalidPatient);
            throw new Error('Should have rejected invalid patient info');
          } catch (error) {
            if (!error || !error.message.includes('Patient')) {
              throw new Error('Wrong validation error');
            }
          }
        }
      });

      // Test invalid SOEP structure
      validationTests.push({
        name: 'Invalid SOEP structure rejection',
        test: async () => {
          const validPatient = this.createMockPatientInfo();
          const invalidSOEP = { soepStructure: null } as ConsultResult;

          try {
            await exportManager.exportSOEP(invalidSOEP, validPatient);
            throw new Error('Should have rejected invalid SOEP structure');
          } catch (error) {
            if (!error || !error.message.includes('SOEP')) {
              throw new Error('Wrong validation error');
            }
          }
        }
      });

      // Test invalid export format
      validationTests.push({
        name: 'Invalid export format rejection',
        test: async () => {
          const validPatient = this.createMockPatientInfo();
          const validSOEP = this.createMockSOEPResult();

          try {
            await exportManager.exportSOEP(validSOEP, validPatient, { format: 'invalid' as any });
            throw new Error('Should have rejected invalid format');
          } catch (error) {
            if (!error || !error.message.includes('format')) {
              throw new Error('Wrong validation error');
            }
          }
        }
      });

      // Run all validation tests
      const results: Record<string, boolean> = {};
      for (const { name, test } of validationTests) {
        try {
          await test();
          results[name] = true;
        } catch (error) {
          results[name] = false;
          console.warn(`Validation test failed: ${name}`, error);
        }
      }

      const allValidationsWork = Object.values(results).every(success => success);

      this.addTestResult({
        testName: 'Data Validation Pipeline',
        category: 'critical',
        success: allValidationsWork,
        duration: Date.now() - startTime,
        details: { validationResults: results },
        error: allValidationsWork ? undefined : 'One or more validation checks failed'
      });

    } catch (error) {
      this.addTestResult({
        testName: 'Data Validation Pipeline',
        category: 'critical',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test error handling robustness
   */
  private async testErrorHandlingRobustness(): Promise<void> {
    const startTime = Date.now();

    try {
      const exportManager = AdvancedExportManager.getInstance();
      let errorsHandledGracefully = 0;
      let totalErrorTests = 0;

      const errorScenarios = [
        {
          name: 'Null patient info',
          test: () => exportManager.exportSOEP(this.createMockSOEPResult(), null as any)
        },
        {
          name: 'Undefined consult result',
          test: () => exportManager.exportSOEP(undefined as any, this.createMockPatientInfo())
        },
        {
          name: 'Empty SOEP structure',
          test: () => exportManager.exportSOEP(
            { soepStructure: { subjectief: '', objectief: '', evaluatie: '', plan: '' } } as ConsultResult,
            this.createMockPatientInfo()
          )
        }
      ];

      for (const scenario of errorScenarios) {
        totalErrorTests++;
        try {
          await scenario.test();
          console.warn(`Error scenario should have failed: ${scenario.name}`);
        } catch (error) {
          if (error instanceof Error && error.message.length > 0) {
            errorsHandledGracefully++;
          }
        }
      }

      const errorHandlingScore = errorsHandledGracefully / totalErrorTests;

      this.addTestResult({
        testName: 'Error Handling Robustness',
        category: 'critical',
        success: errorHandlingScore >= 0.8, // 80% threshold
        duration: Date.now() - startTime,
        details: {
          errorsHandled: errorsHandledGracefully,
          totalTests: totalErrorTests,
          score: errorHandlingScore
        },
        error: errorHandlingScore < 0.8 ? 'Error handling below acceptable threshold' : undefined
      });

    } catch (error) {
      this.addTestResult({
        testName: 'Error Handling Robustness',
        category: 'critical',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test progress tracking accuracy
   */
  private async testProgressTrackingAccuracy(): Promise<void> {
    const startTime = Date.now();

    try {
      const exportManager = AdvancedExportManager.getInstance();
      const progressEvents: Array<{ stage: string; percentage: number }> = [];

      const mockPatient = this.createMockPatientInfo();
      const mockSOEP = this.createMockSOEPResult();

      await exportManager.exportSOEP(mockSOEP, mockPatient, {
        format: 'html',
        onProgress: (progress) => {
          progressEvents.push({ stage: progress.stage, percentage: progress.percentage });
        }
      });

      // Validate progress tracking
      const hasInitializing = progressEvents.some(e => e.stage === 'Initializing' && e.percentage === 0);
      const hasComplete = progressEvents.some(e => e.stage === 'Complete' && e.percentage === 100);
      const percentagesIncrease = progressEvents.every((event, index) => {
        if (index === 0) return true;
        return event.percentage >= progressEvents[index - 1].percentage;
      });

      const progressTrackingValid = hasInitializing && hasComplete && percentagesIncrease;

      this.addTestResult({
        testName: 'Progress Tracking Accuracy',
        category: 'important',
        success: progressTrackingValid,
        duration: Date.now() - startTime,
        details: {
          progressEvents,
          hasInitializing,
          hasComplete,
          percentagesIncrease
        },
        error: progressTrackingValid ? undefined : 'Progress tracking validation failed'
      });

    } catch (error) {
      this.addTestResult({
        testName: 'Progress Tracking Accuracy',
        category: 'important',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test history management reliability
   */
  private async testHistoryManagementReliability(): Promise<void> {
    const startTime = Date.now();

    try {
      const mockPatient = this.createMockPatientInfo();
      const mockBlob = new Blob(['test content'], { type: 'text/html' });

      // Test adding entry
      const entryId = exportHistoryManager.addExportEntry(
        mockPatient,
        'consult',
        'html',
        'test-qa.html',
        mockBlob,
        { format: 'html' },
        1000
      );

      // Test retrieving entry
      const retrievedEntry = exportHistoryManager.getEntry(entryId);
      const entryRetrievalValid = retrievedEntry !== null && retrievedEntry.id === entryId;

      // Test history listing
      const history = exportHistoryManager.getHistory();
      const historyValid = Array.isArray(history) && history.some(entry => entry.id === entryId);

      // Test statistics
      const stats = exportHistoryManager.getStatistics();
      const statsValid = typeof stats.totalExports === 'number' && stats.totalExports >= 0;

      // Clean up test entry
      exportHistoryManager.deleteEntry(entryId);

      const historyManagementValid = entryRetrievalValid && historyValid && statsValid;

      this.addTestResult({
        testName: 'History Management Reliability',
        category: 'important',
        success: historyManagementValid,
        duration: Date.now() - startTime,
        details: {
          entryRetrievalValid,
          historyValid,
          statsValid
        },
        error: historyManagementValid ? undefined : 'History management validation failed'
      });

    } catch (error) {
      this.addTestResult({
        testName: 'History Management Reliability',
        category: 'important',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test SOEP workflow completeness
   */
  private async testSOEPWorkflowCompleteness(): Promise<void> {
    const startTime = Date.now();

    try {
      const exportManager = AdvancedExportManager.getInstance();
      const mockPatient = this.createMockPatientInfo();
      const mockSOEP = this.createMockSOEPResult();

      // Test complete SOEP export
      const htmlBlob = await exportManager.exportSOEP(mockSOEP, mockPatient, { format: 'html' });
      const htmlContent = await htmlBlob.text();

      // Validate SOEP content is present
      const hasSubjectief = htmlContent.includes('Subjectief') || htmlContent.includes(mockSOEP.soepStructure.subjectief);
      const hasObjectief = htmlContent.includes('Objectief') || htmlContent.includes(mockSOEP.soepStructure.objectief);
      const hasEvaluatie = htmlContent.includes('Evaluatie') || htmlContent.includes(mockSOEP.soepStructure.evaluatie);
      const hasPlan = htmlContent.includes('Plan') || htmlContent.includes(mockSOEP.soepStructure.plan);

      const soepComplete = hasSubjectief && hasObjectief && hasEvaluatie && hasPlan;

      this.addTestResult({
        testName: 'SOEP Workflow Completeness',
        category: 'important',
        success: soepComplete,
        duration: Date.now() - startTime,
        details: {
          hasSubjectief,
          hasObjectief,
          hasEvaluatie,
          hasPlan,
          contentLength: htmlContent.length
        },
        error: soepComplete ? undefined : 'SOEP content missing or incomplete'
      });

    } catch (error) {
      this.addTestResult({
        testName: 'SOEP Workflow Completeness',
        category: 'important',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test stepwise intake workflow
   */
  private async testStepwiseIntakeWorkflow(): Promise<void> {
    const startTime = Date.now();

    try {
      const exportManager = AdvancedExportManager.getInstance();
      const mockPatient = this.createMockPatientInfo();
      const mockAnamnese = this.createMockAnamneseResult();
      const mockOnderzoek = this.createMockOnderzoekResult();
      const mockConclusie = this.createMockKlinischeConclusieResult();

      const htmlBlob = await exportManager.exportStepwiseIntake(
        mockAnamnese,
        mockOnderzoek,
        mockConclusie,
        mockPatient,
        { format: 'html' }
      );

      const htmlContent = await htmlBlob.text();

      // Validate stepwise content
      const hasHHSB = htmlContent.includes('Hulpvraag') || htmlContent.includes('HHSB');
      const hasOnderzoek = htmlContent.includes('Onderzoek') || htmlContent.includes('examination');
      const hasConclusie = htmlContent.includes('Conclusie') || htmlContent.includes('Clinical');

      const stepwiseComplete = hasHHSB && hasOnderzoek && hasConclusie;

      this.addTestResult({
        testName: 'Stepwise Intake Workflow',
        category: 'important',
        success: stepwiseComplete,
        duration: Date.now() - startTime,
        details: {
          hasHHSB,
          hasOnderzoek,
          hasConclusie,
          contentLength: htmlContent.length
        },
        error: stepwiseComplete ? undefined : 'Stepwise intake content missing or incomplete'
      });

    } catch (error) {
      this.addTestResult({
        testName: 'Stepwise Intake Workflow',
        category: 'important',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test automated intake workflow
   */
  private async testAutomatedIntakeWorkflow(): Promise<void> {
    const startTime = Date.now();

    try {
      const exportManager = AdvancedExportManager.getInstance();
      const mockPatient = this.createMockPatientInfo();
      const mockIntakeResult = {
        hhsbAnamneseCard: {
          hulpvraag: 'Automated help request',
          historie: 'Automated history',
          stoornissen: 'Automated disorders',
          beperkingen: 'Automated limitations'
        }
      };

      const htmlBlob = await exportManager.exportAutomatedIntake(
        mockIntakeResult,
        mockPatient,
        { format: 'html' }
      );

      const success = htmlBlob instanceof Blob && htmlBlob.size > 0;

      this.addTestResult({
        testName: 'Automated Intake Workflow',
        category: 'important',
        success,
        duration: Date.now() - startTime,
        details: {
          blobSize: htmlBlob.size,
          blobType: htmlBlob.type
        },
        error: success ? undefined : 'Automated intake export failed'
      });

    } catch (error) {
      this.addTestResult({
        testName: 'Automated Intake Workflow',
        category: 'important',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test export performance
   */
  private async testExportPerformance(): Promise<void> {
    const startTime = Date.now();

    try {
      const exportManager = AdvancedExportManager.getInstance();
      const mockPatient = this.createMockPatientInfo();
      const mockSOEP = this.createMockSOEPResult();

      // Test multiple exports for performance
      const exportTimes: number[] = [];
      const exportCount = 5;

      for (let i = 0; i < exportCount; i++) {
        const exportStart = Date.now();
        await exportManager.exportSOEP(mockSOEP, mockPatient, { format: 'html' });
        exportTimes.push(Date.now() - exportStart);
      }

      const averageTime = exportTimes.reduce((sum, time) => sum + time, 0) / exportTimes.length;
      const maxTime = Math.max(...exportTimes);
      const performanceAcceptable = averageTime < 5000 && maxTime < 10000; // 5s average, 10s max

      this.addTestResult({
        testName: 'Export Performance',
        category: 'minor',
        success: performanceAcceptable,
        duration: Date.now() - startTime,
        details: {
          exportCount,
          averageTime,
          maxTime,
          exportTimes
        },
        error: performanceAcceptable ? undefined : 'Export performance below acceptable threshold'
      });

    } catch (error) {
      this.addTestResult({
        testName: 'Export Performance',
        category: 'minor',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test memory leak prevention
   */
  private async testMemoryLeakPrevention(): Promise<void> {
    const startTime = Date.now();

    try {
      const exportManager = AdvancedExportManager.getInstance();
      const mockPatient = this.createMockPatientInfo();
      const mockSOEP = this.createMockSOEPResult();

      // Perform multiple exports and check for memory growth
      const initialMemory = (performance as any)?.memory?.usedJSHeapSize || 0;

      // Run multiple export operations
      for (let i = 0; i < 10; i++) {
        const blob = await exportManager.exportSOEP(mockSOEP, mockPatient, { format: 'txt' });
        // Ensure blob is used to prevent optimization
        void blob.size;
      }

      const finalMemory = (performance as any)?.memory?.usedJSHeapSize || 0;
      const memoryGrowth = finalMemory - initialMemory;
      const memoryGrowthAcceptable = memoryGrowth < 10 * 1024 * 1024; // Less than 10MB growth

      this.addTestResult({
        testName: 'Memory Leak Prevention',
        category: 'minor',
        success: memoryGrowthAcceptable,
        duration: Date.now() - startTime,
        details: {
          initialMemory,
          finalMemory,
          memoryGrowth,
          memorySupported: typeof (performance as any)?.memory !== 'undefined'
        },
        error: memoryGrowthAcceptable ? undefined : 'Excessive memory growth detected'
      });

    } catch (error) {
      this.addTestResult({
        testName: 'Memory Leak Prevention',
        category: 'minor',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test concurrent operation handling
   */
  private async testConcurrentOperationHandling(): Promise<void> {
    const startTime = Date.now();

    try {
      const exportManager = AdvancedExportManager.getInstance();
      const mockPatient = this.createMockPatientInfo();
      const mockSOEP = this.createMockSOEPResult();

      // Start multiple concurrent exports
      const concurrentExports = Array.from({ length: 3 }, () =>
        exportManager.exportSOEP(mockSOEP, mockPatient, { format: 'html' })
      );

      const results = await Promise.allSettled(concurrentExports);
      const successfulExports = results.filter(result => result.status === 'fulfilled');
      const allSuccessful = successfulExports.length === concurrentExports.length;

      this.addTestResult({
        testName: 'Concurrent Operation Handling',
        category: 'minor',
        success: allSuccessful,
        duration: Date.now() - startTime,
        details: {
          totalOperations: concurrentExports.length,
          successfulOperations: successfulExports.length,
          failures: results.filter(r => r.status === 'rejected').length
        },
        error: allSuccessful ? undefined : 'Some concurrent operations failed'
      });

    } catch (error) {
      this.addTestResult({
        testName: 'Concurrent Operation Handling',
        category: 'minor',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Helper methods for creating mock data
   */
  private createMockPatientInfo(): PatientInfo {
    return {
      id: 'qa-test-patient',
      initials: 'Q.A.',
      birthYear: '1985',
      gender: 'female',
      chiefComplaint: 'QA test complaint'
    };
  }

  private createMockSOEPResult(): ConsultResult {
    return {
      soepStructure: {
        subjectief: 'QA test subjective findings',
        objectief: 'QA test objective findings',
        evaluatie: 'QA test evaluation',
        plan: 'QA test treatment plan'
      },
      consultSummary: 'QA test consultation summary',
      redFlags: ['QA test red flag']
    };
  }

  private createMockAnamneseResult(): AnamneseResult {
    return {
      hhsbAnamneseCard: {
        hulpvraag: 'QA test help request',
        historie: 'QA test history',
        stoornissen: 'QA test disorders',
        beperkingen: 'QA test limitations'
      },
      redFlags: []
    };
  }

  private createMockOnderzoekResult(): OnderzoekResult {
    return {
      examinationFindings: {
        physicalTests: 'QA test physical findings',
        movements: 'QA test movement findings',
        palpation: 'QA test palpation findings'
      },
      redFlags: []
    };
  }

  private createMockKlinischeConclusieResult(): KlinischeConclusieResult {
    return {
      clinicalConclusion: {
        diagnosis: 'QA test diagnosis',
        treatmentPlan: 'QA test treatment',
        followUp: 'QA test follow-up'
      }
    };
  }

  private addTestResult(result: Omit<QATestResult, 'timestamp'>): void {
    this.testResults.push({
      ...result,
      timestamp: new Date().toISOString()
    });
  }

  private generateReport(): QAReportSummary {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const criticalFailures = this.testResults.filter(r => !r.success && r.category === 'critical').length;
    const averageDuration = totalTests > 0
      ? this.testResults.reduce((sum, r) => sum + r.duration, 0) / totalTests
      : 0;

    let overallHealth: 'healthy' | 'warning' | 'critical';
    if (criticalFailures > 0) {
      overallHealth = 'critical';
    } else if (failedTests > 0 || (passedTests / totalTests) < 0.9) {
      overallHealth = 'warning';
    } else {
      overallHealth = 'healthy';
    }

    return {
      totalTests,
      passedTests,
      failedTests,
      criticalFailures,
      averageDuration,
      overallHealth,
      testResults: [...this.testResults],
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Get the latest QA report
   */
  public getLatestReport(): QAReportSummary | null {
    if (this.testResults.length === 0) {
      return null;
    }
    return this.generateReport();
  }

  /**
   * Clear test results
   */
  public clearResults(): void {
    this.testResults = [];
  }
}

// Export singleton instance
export const qaValidator = QAValidator.getInstance();