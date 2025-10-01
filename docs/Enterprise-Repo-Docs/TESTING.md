# Hysio V2 Testing Strategy and Guide

## Overview

This document outlines the comprehensive testing strategy for Hysio V2, a healthcare platform requiring the highest standards of quality assurance, security testing, and regulatory compliance. Our testing approach ensures patient safety, data integrity, and HIPAA compliance across all platform components.

**Testing Philosophy**: "Test Early, Test Often, Test Everything"
**Compliance Level**: HIPAA, FDA Software as Medical Device (SaMD), ISO 14155
**Quality Gates**: 80%+ code coverage, 99.9% uptime, <2 second response times

## Table of Contents

- [Testing Strategy](#testing-strategy)
- [Test Types](#test-types)
- [Testing Framework](#testing-framework)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Security Testing](#security-testing)
- [Performance Testing](#performance-testing)
- [Healthcare Compliance Testing](#healthcare-compliance-testing)
- [Test Data Management](#test-data-management)
- [Continuous Testing](#continuous-testing)
- [Test Reporting](#test-reporting)

## Testing Strategy

### Test Pyramid Architecture

```
                    ┌─────────────────────┐
                    │   Manual Testing    │ <- 5%
                    │  (Exploratory,      │
                    │   Usability)        │
                    └─────────────────────┘
                ┌───────────────────────────┐
                │   End-to-End Testing     │ <- 15%
                │  (Critical User Flows,   │
                │   Integration Scenarios) │
                └───────────────────────────┘
            ┌─────────────────────────────────┐
            │     Integration Testing        │ <- 30%
            │   (API, Database, Services)    │
            └─────────────────────────────────┘
        ┌─────────────────────────────────────────┐
        │           Unit Testing                  │ <- 50%
        │     (Components, Functions,             │
        │      Business Logic)                    │
        └─────────────────────────────────────────┘
```

### Testing Principles

#### 1. Healthcare-First Approach
- **Patient Safety**: Every test considers patient safety implications
- **Data Integrity**: Rigorous validation of medical data accuracy
- **Compliance**: All tests verify regulatory compliance
- **Audit Trail**: Complete testing audit trails for FDA submissions

#### 2. Risk-Based Testing
- **Critical Path**: Focus on patient-critical functionality
- **High-Risk Components**: Extra testing for AI/ML components
- **Data Protection**: Intensive testing of PHI handling
- **Security**: Comprehensive security testing at all levels

#### 3. Shift-Left Testing
- **Early Testing**: Tests written before or alongside code
- **Developer Testing**: Developers write and run tests locally
- **Fast Feedback**: Quick test execution and reporting
- **Automated Gates**: Automated quality gates in CI/CD

## Test Types

### Functional Testing

#### 1. Unit Tests
- **Scope**: Individual components, functions, classes
- **Coverage**: 80%+ code coverage requirement
- **Framework**: Jest with React Testing Library
- **Focus**: Business logic, data validation, error handling

#### 2. Integration Tests
- **Scope**: API endpoints, database interactions, service integration
- **Framework**: Jest with Supertest for API testing
- **Focus**: Data flow between components, external service integration

#### 3. End-to-End Tests
- **Scope**: Complete user workflows from UI to database
- **Framework**: Cypress for browser automation
- **Focus**: Critical healthcare workflows, user journeys

### Non-Functional Testing

#### 1. Performance Tests
- **Load Testing**: Normal expected load simulation
- **Stress Testing**: Breaking point identification
- **Volume Testing**: Large dataset handling
- **Endurance Testing**: Extended operation validation

#### 2. Security Tests
- **Penetration Testing**: Simulated attack scenarios
- **Vulnerability Scanning**: Automated security scanning
- **Authentication Testing**: Login and session security
- **Data Encryption Testing**: PHI protection validation

#### 3. Usability Tests
- **Accessibility Testing**: WCAG 2.1 AA compliance
- **User Experience Testing**: Healthcare provider workflows
- **Mobile Responsiveness**: Cross-device compatibility
- **Internationalization**: Multi-language support

## Testing Framework

### Technology Stack

#### Core Testing Tools
```json
{
  "dependencies": {
    "jest": "^30.1.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.8.0",
    "@testing-library/user-event": "^14.5.0",
    "cypress": "^13.6.0",
    "supertest": "^6.3.0"
  }
}
```

#### Testing Configuration
```javascript
// jest.config.mjs
export default {
  // Test environment
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Module mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.ts',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Critical modules require higher coverage
    'src/lib/api/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'src/lib/auth/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },

  // Test patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
  ],

  // Healthcare-specific test timeout
  testTimeout: 30000,
};
```

#### Test Setup
```javascript
// jest.setup.js
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Global test utilities
global.TestUtils = {
  createMockFile: (name, type, size) => {
    const file = new File(['test content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  },

  createMockPatientData: () => ({
    id: 'test-patient-001',
    mrn: 'TEST-MRN-001',
    name: 'Test Patient',
    dob: '1980-01-01',
    // Always use test data markers
    __test_data: true,
  }),

  createMockProviderData: () => ({
    id: 'test-provider-001',
    npi: '1234567890',
    name: 'Dr. Test Provider',
    specialties: ['Physical Therapy'],
    __test_data: true,
  }),
};

// Healthcare compliance test helpers
global.HealthcareTestUtils = {
  validatePHIEncryption: (data) => {
    // Ensure PHI data is encrypted
    expect(data).toHaveProperty('encrypted');
    expect(data.encrypted).toBe(true);
  },

  validateAuditTrail: (auditLog) => {
    expect(auditLog).toHaveProperty('userId');
    expect(auditLog).toHaveProperty('action');
    expect(auditLog).toHaveProperty('timestamp');
    expect(auditLog).toHaveProperty('ipAddress');
  },

  validateHIPAACompliance: (operation) => {
    expect(operation).toHaveProperty('hipaaCompliant');
    expect(operation.hipaaCompliant).toBe(true);
  },
};
```

## Unit Testing

### Component Testing

#### React Component Tests
```typescript
// src/components/__tests__/TranscriptionForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranscriptionForm } from '../TranscriptionForm';

describe('TranscriptionForm', () => {
  const mockOnTranscribe = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('File Upload', () => {
    test('should accept supported audio formats', async () => {
      render(<TranscriptionForm onTranscribe={mockOnTranscribe} />);

      const fileInput = screen.getByLabelText(/upload audio file/i);
      const audioFile = TestUtils.createMockFile('test.mp3', 'audio/mp3', 1024);

      await user.upload(fileInput, audioFile);

      expect(screen.getByText('test.mp3')).toBeInTheDocument();
    });

    test('should reject unsupported file formats', async () => {
      render(<TranscriptionForm onTranscribe={mockOnTranscribe} />);

      const fileInput = screen.getByLabelText(/upload audio file/i);
      const textFile = TestUtils.createMockFile('test.txt', 'text/plain', 1024);

      await user.upload(fileInput, textFile);

      expect(screen.getByText(/unsupported file format/i)).toBeInTheDocument();
    });

    test('should enforce file size limits', async () => {
      render(<TranscriptionForm onTranscribe={mockOnTranscribe} />);

      const fileInput = screen.getByLabelText(/upload audio file/i);
      const largeFile = TestUtils.createMockFile('large.mp3', 'audio/mp3', 26 * 1024 * 1024); // 26MB

      await user.upload(fileInput, largeFile);

      expect(screen.getByText(/file size exceeds 25mb limit/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('should validate required fields', async () => {
      render(<TranscriptionForm onTranscribe={mockOnTranscribe} />);

      const submitButton = screen.getByRole('button', { name: /transcribe/i });
      await user.click(submitButton);

      expect(screen.getByText(/audio file is required/i)).toBeInTheDocument();
    });

    test('should validate provider information', async () => {
      render(<TranscriptionForm onTranscribe={mockOnTranscribe} requireProvider />);

      const audioFile = TestUtils.createMockFile('test.mp3', 'audio/mp3', 1024);
      const fileInput = screen.getByLabelText(/upload audio file/i);
      await user.upload(fileInput, audioFile);

      const submitButton = screen.getByRole('button', { name: /transcribe/i });
      await user.click(submitButton);

      expect(screen.getByText(/provider information is required/i)).toBeInTheDocument();
    });
  });

  describe('Healthcare Compliance', () => {
    test('should enforce HIPAA compliance checks', async () => {
      const mockHIPAAValidation = jest.fn().mockResolvedValue({ compliant: true });

      render(
        <TranscriptionForm
          onTranscribe={mockOnTranscribe}
          hipaaValidation={mockHIPAAValidation}
        />
      );

      const audioFile = TestUtils.createMockFile('test.mp3', 'audio/mp3', 1024);
      const fileInput = screen.getByLabelText(/upload audio file/i);
      await user.upload(fileInput, audioFile);

      const submitButton = screen.getByRole('button', { name: /transcribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockHIPAAValidation).toHaveBeenCalled();
      });
    });
  });
});
```

#### Business Logic Tests
```typescript
// src/lib/__tests__/diagnosisCodeAnalyzer.test.ts
import { DCSPHAnalyzer } from '../diagnosisCodeAnalyzer';

describe('DCSPHAnalyzer', () => {
  describe('analyzeDescription', () => {
    test('should analyze lumbar spine conditions', async () => {
      const description = 'Patient presents with lower back pain radiating to left leg, positive straight leg raise test';

      const result = await DCSPHAnalyzer.analyzeDescription(description);

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        code: 'M54.16',
        name: expect.stringContaining('Radiculopathy'),
        confidence: expect.any(Number),
        rationale: expect.any(String),
      });
      expect(result[0].confidence).toBeGreaterThan(0.8);
    });

    test('should handle hip conditions', async () => {
      const description = 'Hip pain with limited range of motion, difficulty weight bearing';

      const result = await DCSPHAnalyzer.analyzeDescription(description);

      expect(result.some(suggestion =>
        suggestion.code.includes('M25') || suggestion.code.includes('M16')
      )).toBe(true);
    });

    test('should provide confidence scoring', async () => {
      const description = 'Knee injury from sports activity, swelling and pain';

      const result = await DCSPHAnalyzer.analyzeDescription(description);

      result.forEach(suggestion => {
        expect(suggestion.confidence).toBeGreaterThanOrEqual(0);
        expect(suggestion.confidence).toBeLessThanOrEqual(1);
      });
    });

    test('should handle invalid input gracefully', async () => {
      const invalidInputs = ['', '   ', null, undefined];

      for (const input of invalidInputs) {
        const result = await DCSPHAnalyzer.analyzeDescription(input as any);
        expect(result).toEqual([]);
      }
    });
  });

  describe('Medical Term Recognition', () => {
    test('should recognize anatomical terms', () => {
      const terms = DCSPHAnalyzer.extractAnatomicalTerms('cervical spine dysfunction');

      expect(terms).toContain('cervical');
      expect(terms).toContain('spine');
    });

    test('should recognize condition severity', () => {
      const severity = DCSPHAnalyzer.assessSeverity('acute severe pain with functional limitation');

      expect(severity).toMatchObject({
        level: 'severe',
        acuity: 'acute',
        functionalImpact: true,
      });
    });
  });
});
```

### API Testing

#### Route Handler Tests
```typescript
// src/app/api/__tests__/transcribe.test.ts
import { POST } from '../transcribe/route';
import { NextRequest } from 'next/server';

// Mock external dependencies
jest.mock('@/lib/api/groq', () => ({
  transcribeAudioWithGroq: jest.fn(),
}));

describe('/api/transcribe', () => {
  const mockTranscribeAudio = require('@/lib/api/groq').transcribeAudioWithGroq;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/transcribe', () => {
    test('should transcribe audio file successfully', async () => {
      const mockFormData = new FormData();
      const audioFile = new File(['audio data'], 'test.mp3', { type: 'audio/mp3' });
      mockFormData.append('audio', audioFile);
      mockFormData.append('language', 'nl');
      mockFormData.append('provider_id', 'test-provider-001');

      const mockRequest = {
        formData: () => Promise.resolve(mockFormData),
        headers: new Headers({ 'content-type': 'multipart/form-data' }),
      } as NextRequest;

      mockTranscribeAudio.mockResolvedValue({
        transcription: 'Patient presents with lower back pain',
        confidence: 0.95,
        duration: 30.5,
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.transcription).toContain('Patient presents');
      expect(data.audit.hipaa_compliant).toBe(true);
    });

    test('should handle missing audio file', async () => {
      const mockFormData = new FormData();
      // No audio file added

      const mockRequest = {
        formData: () => Promise.resolve(mockFormData),
        headers: new Headers({ 'content-type': 'multipart/form-data' }),
      } as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('No audio file provided');
    });

    test('should enforce file size limits', async () => {
      const mockFormData = new FormData();
      const largeFile = new File(
        [new ArrayBuffer(26 * 1024 * 1024)], // 26MB
        'large.mp3',
        { type: 'audio/mp3' }
      );
      mockFormData.append('audio', largeFile);

      const mockRequest = {
        formData: () => Promise.resolve(mockFormData),
        headers: new Headers({ 'content-type': 'multipart/form-data' }),
      } as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(413);
      expect(data.error).toContain('file size exceeds');
    });
  });

  describe('Healthcare Compliance', () => {
    test('should create audit trail for all requests', async () => {
      const mockFormData = new FormData();
      const audioFile = new File(['audio data'], 'test.mp3', { type: 'audio/mp3' });
      mockFormData.append('audio', audioFile);
      mockFormData.append('provider_id', 'test-provider-001');
      mockFormData.append('patient_id', 'test-patient-001');

      const mockRequest = {
        formData: () => Promise.resolve(mockFormData),
        headers: new Headers({
          'content-type': 'multipart/form-data',
          'x-forwarded-for': '192.168.1.1',
        }),
      } as NextRequest;

      mockTranscribeAudio.mockResolvedValue({
        transcription: 'Test transcription',
        confidence: 0.95,
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      HealthcareTestUtils.validateAuditTrail(data.audit);
      HealthcareTestUtils.validateHIPAACompliance(data);
    });
  });
});
```

## Integration Testing

### Database Integration Tests

```typescript
// src/lib/__tests__/database.integration.test.ts
import { createTestDatabase, cleanupTestDatabase } from '../testUtils/database';
import { PatientService } from '../services/PatientService';

describe('PatientService Database Integration', () => {
  let testDb: any;

  beforeAll(async () => {
    testDb = await createTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase(testDb);
  });

  beforeEach(async () => {
    await testDb.clearAllTables();
  });

  describe('Patient CRUD Operations', () => {
    test('should create and retrieve patient', async () => {
      const patientData = TestUtils.createMockPatientData();

      const createdPatient = await PatientService.create(patientData);
      const retrievedPatient = await PatientService.findById(createdPatient.id);

      expect(retrievedPatient).toMatchObject(patientData);
      HealthcareTestUtils.validatePHIEncryption(retrievedPatient);
    });

    test('should enforce unique MRN constraint', async () => {
      const patientData = TestUtils.createMockPatientData();

      await PatientService.create(patientData);

      await expect(PatientService.create(patientData))
        .rejects
        .toThrow('MRN already exists');
    });
  });

  describe('Audit Trail Integration', () => {
    test('should create audit logs for patient data access', async () => {
      const patient = await PatientService.create(TestUtils.createMockPatientData());
      const provider = TestUtils.createMockProviderData();

      await PatientService.findById(patient.id, {
        accessedBy: provider.id,
        reason: 'Treatment review',
      });

      const auditLogs = await testDb.query(
        'SELECT * FROM audit_logs WHERE resource_id = $1',
        [patient.id]
      );

      expect(auditLogs).toHaveLength(2); // Create + Read
      auditLogs.forEach(log => {
        HealthcareTestUtils.validateAuditTrail(log);
      });
    });
  });
});
```

### External API Integration Tests

```typescript
// src/lib/__tests__/groqAPI.integration.test.ts
import { transcribeAudioWithGroq } from '../api/groq';

describe('Groq API Integration', () => {
  // Skip in CI unless GROQ_API_KEY is available
  const isCI = process.env.CI === 'true';
  const hasAPIKey = process.env.GROQ_API_KEY;

  const runTest = hasAPIKey || !isCI ? test : test.skip;

  runTest('should transcribe real audio file', async () => {
    const audioBuffer = await fetch('/test-assets/sample-medical-audio.mp3')
      .then(res => res.arrayBuffer());

    const result = await transcribeAudioWithGroq(audioBuffer, {
      language: 'en',
      temperature: 0.0,
    });

    expect(result.transcription).toBeTruthy();
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.transcription).toMatch(/patient|medical|condition/i);
  }, 30000); // Extended timeout for API calls

  runTest('should handle medical terminology correctly', async () => {
    // Test with medical-specific audio
    const medicalAudioBuffer = await fetch('/test-assets/medical-terminology.mp3')
      .then(res => res.arrayBuffer());

    const result = await transcribeAudioWithGroq(medicalAudioBuffer, {
      language: 'en',
      prompt: 'Medical transcription with clinical terminology',
    });

    // Should recognize medical terms
    expect(result.transcription.toLowerCase()).toMatch(
      /diagnosis|symptom|treatment|medication|patient/
    );
  });
});
```

## End-to-End Testing

### Cypress Configuration

```javascript
// cypress.config.js
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: true,
    screenshotOnRunFailure: true,

    // Healthcare-specific settings
    defaultCommandTimeout: 10000,
    requestTimeout: 30000,
    responseTimeout: 30000,

    env: {
      // Test credentials (never use real data)
      TEST_PROVIDER_EMAIL: 'test.provider@example.com',
      TEST_PROVIDER_PASSWORD: 'TestPassword123!',
      SKIP_AUTH: false,
    },

    setupNodeEvents(on, config) {
      // Healthcare compliance plugins
      on('task', {
        generateTestPatientData() {
          return TestUtils.createMockPatientData();
        },

        validateHIPAACompliance(auditData) {
          return HealthcareTestUtils.validateHIPAACompliance(auditData);
        },
      });
    },
  },
});
```

### Critical User Journey Tests

```typescript
// cypress/e2e/transcription-workflow.cy.ts
describe('Medical Transcription Workflow', () => {
  beforeEach(() => {
    // Login as healthcare provider
    cy.login('test.provider@example.com', 'TestPassword123!');
    cy.visit('/transcription');
  });

  it('should complete full transcription workflow', () => {
    // Upload audio file
    cy.get('[data-testid="audio-upload"]').selectFile('cypress/fixtures/sample-audio.mp3');

    // Verify file details
    cy.get('[data-testid="file-info"]').should('contain', 'sample-audio.mp3');
    cy.get('[data-testid="file-size"]').should('contain', 'KB');

    // Set transcription options
    cy.get('[data-testid="language-select"]').select('English');
    cy.get('[data-testid="provider-id"]').should('have.value', 'test-provider-001');

    // Add patient context (optional)
    cy.get('[data-testid="patient-context"]').type('Follow-up visit for lower back pain');

    // Start transcription
    cy.get('[data-testid="transcribe-button"]').click();

    // Wait for processing
    cy.get('[data-testid="processing-indicator"]').should('be.visible');
    cy.get('[data-testid="transcription-result"]', { timeout: 30000 }).should('be.visible');

    // Verify results
    cy.get('[data-testid="transcription-text"]').should('not.be.empty');
    cy.get('[data-testid="confidence-score"]').should('contain', '%');

    // Verify HIPAA compliance indicators
    cy.get('[data-testid="hipaa-compliant"]').should('contain', 'HIPAA Compliant');
    cy.get('[data-testid="audit-trail"]').should('be.visible');

    // Save transcription
    cy.get('[data-testid="save-transcription"]').click();
    cy.get('[data-testid="save-success"]').should('contain', 'Transcription saved successfully');
  });

  it('should handle large file splitting', () => {
    // Upload large file (>25MB simulation)
    cy.fixture('large-audio.mp3', 'binary').then(fileContent => {
      cy.get('[data-testid="audio-upload"]').selectFile({
        contents: fileContent,
        fileName: 'large-audio.mp3',
        mimeType: 'audio/mp3',
      });
    });

    // Should show splitting notification
    cy.get('[data-testid="file-splitting-notice"]').should('be.visible');
    cy.get('[data-testid="splitting-progress"]').should('be.visible');

    // Process segments
    cy.get('[data-testid="transcribe-button"]').click();
    cy.get('[data-testid="segment-processing"]').should('be.visible');

    // Verify combined results
    cy.get('[data-testid="transcription-result"]', { timeout: 60000 }).should('be.visible');
    cy.get('[data-testid="segment-count"]').should('contain', 'segments');
  });
});
```

### Diagnosis Code Analysis E2E Tests

```typescript
// cypress/e2e/diagnosis-analysis.cy.ts
describe('Diagnosis Code Analysis', () => {
  beforeEach(() => {
    cy.login('test.provider@example.com', 'TestPassword123!');
    cy.visit('/diagnosis');
  });

  it('should analyze clinical description and suggest codes', () => {
    const clinicalDescription = `
      Patient presents with acute onset lower back pain radiating to the left leg.
      Pain started 3 days ago after lifting heavy objects.
      Positive straight leg raise test on the left.
      No neurological deficits observed.
      Range of motion limited due to pain.
    `;

    // Enter clinical description
    cy.get('[data-testid="clinical-description"]').type(clinicalDescription);

    // Set analysis options
    cy.get('[data-testid="max-suggestions"]').select('5');
    cy.get('[data-testid="include-metadata"]').check();

    // Run analysis
    cy.get('[data-testid="analyze-button"]').click();

    // Wait for AI analysis
    cy.get('[data-testid="analysis-loading"]').should('be.visible');
    cy.get('[data-testid="code-suggestions"]', { timeout: 15000 }).should('be.visible');

    // Verify suggestions
    cy.get('[data-testid="suggestion-item"]').should('have.length.greaterThan', 0);
    cy.get('[data-testid="suggestion-item"]').first().within(() => {
      cy.get('[data-testid="code"]').should('match', /^[A-Z]\d{2}(\.\d+)?$/);
      cy.get('[data-testid="name"]').should('not.be.empty');
      cy.get('[data-testid="confidence"]').should('contain', '%');
      cy.get('[data-testid="rationale"]').should('not.be.empty');
    });

    // Select a code
    cy.get('[data-testid="suggestion-item"]').first().click();
    cy.get('[data-testid="selected-codes"]').should('contain', 'M54');

    // Verify metadata
    cy.get('[data-testid="analysis-metadata"]').should('be.visible');
    cy.get('[data-testid="processing-time"]').should('contain', 'seconds');
  });

  it('should validate selected codes', () => {
    // Enter codes manually
    cy.get('[data-testid="manual-code-entry"]').type('M54.16{enter}');
    cy.get('[data-testid="manual-code-entry"]').type('M25.511{enter}');

    // Add patient demographics for validation
    cy.get('[data-testid="patient-age"]').type('45');
    cy.get('[data-testid="patient-gender"]').select('Male');

    // Validate codes
    cy.get('[data-testid="validate-codes"]').click();

    // Check validation results
    cy.get('[data-testid="validation-results"]').should('be.visible');
    cy.get('[data-testid="code-validity"]').should('contain', 'Valid');
    cy.get('[data-testid="billable-status"]').should('be.visible');
  });
});
```

## Security Testing

### Authentication and Authorization Tests

```typescript
// cypress/e2e/security/auth.cy.ts
describe('Authentication Security', () => {
  it('should enforce multi-factor authentication', () => {
    cy.visit('/login');

    // Enter valid credentials
    cy.get('[data-testid="email"]').type('test.provider@example.com');
    cy.get('[data-testid="password"]').type('TestPassword123!');
    cy.get('[data-testid="login-button"]').click();

    // Should prompt for MFA
    cy.get('[data-testid="mfa-prompt"]').should('be.visible');
    cy.get('[data-testid="mfa-code"]').should('be.visible');

    // Invalid MFA code should fail
    cy.get('[data-testid="mfa-code"]').type('000000');
    cy.get('[data-testid="verify-mfa"]').click();
    cy.get('[data-testid="mfa-error"]').should('contain', 'Invalid code');

    // Valid MFA code should succeed
    cy.task('getMFACode', 'test.provider@example.com').then(code => {
      cy.get('[data-testid="mfa-code"]').clear().type(code);
      cy.get('[data-testid="verify-mfa"]').click();
      cy.url().should('include', '/dashboard');
    });
  });

  it('should enforce session timeout', () => {
    cy.login('test.provider@example.com', 'TestPassword123!');

    // Simulate session expiration
    cy.window().then(win => {
      win.localStorage.removeItem('nextauth.session-token');
    });

    // Navigate to protected page
    cy.visit('/patients');

    // Should redirect to login
    cy.url().should('include', '/login');
    cy.get('[data-testid="session-expired"]').should('be.visible');
  });

  it('should prevent unauthorized access to patient data', () => {
    // Attempt to access API without authentication
    cy.request({
      url: '/api/patients/test-patient-001',
      failOnStatusCode: false,
    }).then(response => {
      expect(response.status).to.eq(401);
    });

    // Login and verify access
    cy.login('test.provider@example.com', 'TestPassword123!');
    cy.request('/api/patients/test-patient-001').then(response => {
      expect(response.status).to.eq(200);
    });
  });
});
```

### Data Protection Tests

```typescript
// cypress/e2e/security/data-protection.cy.ts
describe('Data Protection Security', () => {
  beforeEach(() => {
    cy.login('test.provider@example.com', 'TestPassword123!');
  });

  it('should encrypt PHI data at rest', () => {
    // Create patient record
    cy.visit('/patients/new');
    cy.get('[data-testid="patient-name"]').type('Test Patient');
    cy.get('[data-testid="patient-mrn"]').type('TEST-001');
    cy.get('[data-testid="patient-dob"]').type('1980-01-01');
    cy.get('[data-testid="save-patient"]').click();

    // Verify data is encrypted in database
    cy.task('checkDatabaseEncryption', 'TEST-001').then(result => {
      expect(result.encrypted).to.be.true;
      expect(result.plaintext).to.be.false;
    });
  });

  it('should create audit trail for PHI access', () => {
    cy.visit('/patients/test-patient-001');

    // Access patient data
    cy.get('[data-testid="patient-details"]').should('be.visible');

    // Verify audit log creation
    cy.task('getAuditLogs', {
      resourceId: 'test-patient-001',
      action: 'PHI_ACCESS',
    }).then(logs => {
      expect(logs).to.have.length.greaterThan(0);
      expect(logs[0]).to.have.property('userId');
      expect(logs[0]).to.have.property('ipAddress');
      expect(logs[0]).to.have.property('timestamp');
    });
  });

  it('should prevent XSS attacks', () => {
    const xssPayload = '<script>alert("XSS")</script>';

    cy.visit('/transcription');
    cy.get('[data-testid="clinical-description"]').type(xssPayload);
    cy.get('[data-testid="analyze-button"]').click();

    // Script should be escaped, not executed
    cy.get('[data-testid="transcription-result"]').should('contain', '&lt;script&gt;');
    cy.window().then(win => {
      expect(win.alert).not.to.have.been.called;
    });
  });
});
```

## Performance Testing

### Load Testing with Artillery

```yaml
# performance/load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 300
      arrivalRate: 10
      name: "Warm up"
    - duration: 600
      arrivalRate: 50
      name: "Normal load"
    - duration: 300
      arrivalRate: 100
      name: "Peak load"
  defaults:
    headers:
      Authorization: 'Bearer {{ $environment.TEST_TOKEN }}'

scenarios:
  - name: "Transcription workflow"
    weight: 40
    flow:
      - post:
          url: "/api/transcribe"
          formData:
            audio: "@audio-samples/sample-{{ $randomInt(1, 10) }}.mp3"
            language: "en"
            provider_id: "{{ $environment.TEST_PROVIDER_ID }}"
          capture:
            - json: "$.data.transcription"
              as: "transcription"
      - think: 5

  - name: "Diagnosis analysis"
    weight: 35
    flow:
      - post:
          url: "/api/diagnosecode/analyze"
          json:
            clinicalDescription: "{{ $environment.SAMPLE_DESCRIPTIONS[$randomInt(0, 9)] }}"
            includeMetadata: true
            maxSuggestions: 5
          capture:
            - json: "$.data.suggestions[0].code"
              as: "primaryCode"
      - think: 3

  - name: "Email generation"
    weight: 25
    flow:
      - post:
          url: "/api/smartmail/simple"
          json:
            recipientType: "patient"
            context: "{{ $environment.EMAIL_CONTEXTS[$randomInt(0, 4)] }}"
            language: "en"
      - think: 2
```

### Performance Test Scripts

```javascript
// performance/performance.test.js
const { performance } = require('perf_hooks');

describe('Performance Tests', () => {
  test('transcription API should respond within 5 seconds', async () => {
    const audioFile = await fetch('/test-assets/sample-audio.mp3')
      .then(res => res.arrayBuffer());

    const startTime = performance.now();

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: createFormData({ audio: audioFile, language: 'en' }),
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(5000); // 5 seconds
  });

  test('diagnosis analysis should handle concurrent requests', async () => {
    const requests = Array.from({ length: 10 }, (_, i) =>
      fetch('/api/diagnosecode/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicalDescription: `Test description ${i}`,
          maxSuggestions: 3,
        }),
      })
    );

    const startTime = performance.now();
    const responses = await Promise.all(requests);
    const endTime = performance.now();

    responses.forEach(response => {
      expect(response.status).toBe(200);
    });

    const avgResponseTime = (endTime - startTime) / requests.length;
    expect(avgResponseTime).toBeLessThan(2000); // 2 seconds average
  });
});
```

## Healthcare Compliance Testing

### HIPAA Compliance Tests

```typescript
// cypress/e2e/compliance/hipaa.cy.ts
describe('HIPAA Compliance', () => {
  it('should implement minimum necessary standard', () => {
    cy.login('nurse@example.com', 'NursePassword123!');
    cy.visit('/patients/test-patient-001');

    // Nurse should have limited access
    cy.get('[data-testid="patient-name"]').should('be.visible');
    cy.get('[data-testid="diagnosis-history"]').should('not.exist');
    cy.get('[data-testid="financial-info"]').should('not.exist');

    // But should have access to care-related information
    cy.get('[data-testid="current-medications"]').should('be.visible');
    cy.get('[data-testid="care-plan"]').should('be.visible');
  });

  it('should log all PHI access with justification', () => {
    cy.login('test.provider@example.com', 'TestPassword123!');
    cy.visit('/patients/test-patient-001');

    // Should prompt for access reason
    cy.get('[data-testid="access-reason-modal"]').should('be.visible');
    cy.get('[data-testid="access-reason"]').select('treatment');
    cy.get('[data-testid="access-justification"]').type('Reviewing treatment plan for follow-up visit');
    cy.get('[data-testid="confirm-access"]').click();

    // Verify audit log
    cy.task('getAuditLogs', {
      resourceId: 'test-patient-001',
      userId: 'test-provider-001',
    }).then(logs => {
      expect(logs[0]).to.have.property('accessReason', 'treatment');
      expect(logs[0]).to.have.property('justification');
    });
  });

  it('should enforce break-glass emergency access', () => {
    cy.login('emergency.user@example.com', 'EmergencyPassword123!');

    // Emergency access to patient not normally accessible
    cy.visit('/patients/emergency-patient-001');

    // Should show break-glass warning
    cy.get('[data-testid="break-glass-warning"]').should('be.visible');
    cy.get('[data-testid="emergency-justification"]').type('Patient in cardiac arrest, need immediate access to medical history');
    cy.get('[data-testid="confirm-emergency-access"]').click();

    // Should allow access but log extensively
    cy.get('[data-testid="patient-details"]').should('be.visible');
    cy.get('[data-testid="emergency-access-notice"]').should('be.visible');

    // Verify emergency audit log
    cy.task('getAuditLogs', {
      resourceId: 'emergency-patient-001',
      accessType: 'EMERGENCY',
    }).then(logs => {
      expect(logs[0]).to.have.property('emergencyAccess', true);
      expect(logs[0]).to.have.property('justification');
    });
  });
});
```

### Data Integrity Tests

```typescript
// __tests__/compliance/data-integrity.test.ts
describe('Data Integrity Compliance', () => {
  test('should maintain transcription accuracy', async () => {
    // Test with known audio samples
    const knownTranscriptions = [
      {
        audio: 'sample-1.mp3',
        expected: 'Patient presents with lower back pain',
        minAccuracy: 0.9,
      },
      {
        audio: 'sample-2.mp3',
        expected: 'Diagnosis of hypertension confirmed',
        minAccuracy: 0.9,
      },
    ];

    for (const test of knownTranscriptions) {
      const audioBuffer = await fs.readFile(`test-assets/${test.audio}`);
      const result = await transcribeAudio(audioBuffer);

      const accuracy = calculateAccuracy(result.transcription, test.expected);
      expect(accuracy).toBeGreaterThan(test.minAccuracy);
    }
  });

  test('should validate diagnosis code accuracy', async () => {
    const testCases = [
      {
        description: 'Lower back pain with radiation to leg',
        expectedCodes: ['M54.16', 'M51.16'],
        minConfidence: 0.8,
      },
      {
        description: 'Knee osteoarthritis with limited mobility',
        expectedCodes: ['M17.9', 'M25.561'],
        minConfidence: 0.8,
      },
    ];

    for (const testCase of testCases) {
      const result = await analyzeDiagnosisCodes(testCase.description);

      const hasExpectedCode = testCase.expectedCodes.some(expectedCode =>
        result.suggestions.some(suggestion =>
          suggestion.code === expectedCode &&
          suggestion.confidence >= testCase.minConfidence
        )
      );

      expect(hasExpectedCode).toBe(true);
    }
  });
});
```

## Test Data Management

### Synthetic Test Data Generation

```typescript
// src/testUtils/dataGenerators.ts
export class HealthcareTestDataGenerator {
  static generatePatient(options: Partial<PatientData> = {}): PatientData {
    return {
      id: `test-patient-${faker.string.uuid()}`,
      mrn: `TEST-${faker.string.alphanumeric(8).toUpperCase()}`,
      name: faker.person.fullName(),
      dob: faker.date.between({ from: '1940-01-01', to: '2005-01-01' }).toISOString().split('T')[0],
      gender: faker.helpers.arrayElement(['M', 'F', 'O']),
      // Always mark as test data
      __test_data: true,
      __generated_at: new Date().toISOString(),
      ...options,
    };
  }

  static generateProvider(options: Partial<ProviderData> = {}): ProviderData {
    return {
      id: `test-provider-${faker.string.uuid()}`,
      npi: faker.string.numeric(10),
      name: `Dr. ${faker.person.fullName()}`,
      specialties: faker.helpers.arrayElements([
        'Physical Therapy',
        'Occupational Therapy',
        'Speech Therapy',
        'Sports Medicine',
      ], { min: 1, max: 2 }),
      credentials: ['PT', 'DPT'],
      __test_data: true,
      __generated_at: new Date().toISOString(),
      ...options,
    };
  }

  static generateClinicalDescription(): string {
    const templates = [
      'Patient presents with {condition} {location}. {symptom} started {timeframe} ago. {assessment}.',
      '{complaint} in {location} with {quality}. {aggravating_factors}. {examination_findings}.',
      'History of {condition}. Current symptoms include {symptoms}. {functional_impact}.',
    ];

    const variables = {
      condition: ['acute', 'chronic', 'recurring', 'progressive'],
      location: ['lower back', 'neck', 'shoulder', 'knee', 'hip', 'ankle'],
      symptom: ['Pain', 'Stiffness', 'Weakness', 'Numbness'],
      timeframe: ['2 days', '1 week', '3 weeks', '2 months'],
      assessment: ['Range of motion limited', 'No neurological deficits', 'Positive stress test'],
      complaint: ['Chief complaint of pain', 'Patient reports discomfort', 'Decreased function'],
      quality: ['sharp pain', 'dull ache', 'burning sensation', 'throbbing pain'],
      aggravating_factors: ['Worse with movement', 'Improved with rest', 'No clear pattern'],
      examination_findings: ['Tenderness to palpation', 'Reduced strength', 'Positive orthopedic tests'],
      symptoms: ['pain', 'stiffness', 'reduced mobility', 'muscle spasm'],
      functional_impact: ['Difficulty with daily activities', 'Unable to work', 'Requires assistance'],
    };

    const template = faker.helpers.arrayElement(templates);
    let description = template;

    Object.entries(variables).forEach(([key, values]) => {
      const value = faker.helpers.arrayElement(values);
      description = description.replace(`{${key}}`, value);
    });

    return description;
  }
}
```

### Test Data Isolation

```typescript
// src/testUtils/database.ts
export class TestDatabaseManager {
  private static instance: TestDatabaseManager;
  private pools: Map<string, any> = new Map();

  static async createTestDatabase(): Promise<TestDatabase> {
    const testDbName = `hysio_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create isolated test database
    await this.createDatabase(testDbName);
    await this.runMigrations(testDbName);

    return new TestDatabase(testDbName);
  }

  static async cleanupTestDatabase(testDb: TestDatabase): Promise<void> {
    await testDb.close();
    await this.dropDatabase(testDb.name);
  }

  private static async createDatabase(name: string): Promise<void> {
    const adminPool = new Pool({
      connectionString: process.env.TEST_DATABASE_URL,
      database: 'postgres', // Connect to default database for admin operations
    });

    await adminPool.query(`CREATE DATABASE "${name}"`);
    await adminPool.end();
  }

  private static async dropDatabase(name: string): Promise<void> {
    const adminPool = new Pool({
      connectionString: process.env.TEST_DATABASE_URL,
      database: 'postgres',
    });

    await adminPool.query(`DROP DATABASE IF EXISTS "${name}"`);
    await adminPool.end();
  }
}

export class TestDatabase {
  constructor(public readonly name: string) {}

  async clearAllTables(): Promise<void> {
    const tables = await this.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename NOT LIKE 'migrations%'
    `);

    for (const table of tables) {
      await this.query(`TRUNCATE TABLE "${table.tablename}" CASCADE`);
    }
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    // Implementation for test database queries
  }

  async close(): Promise<void> {
    // Close database connections
  }
}
```

## Continuous Testing

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: hysio_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'hysio-medical-scribe/package-lock.json'

      - name: Install dependencies
        working-directory: ./hysio-medical-scribe
        run: npm ci

      - name: Run unit tests
        working-directory: ./hysio-medical-scribe
        run: npm test -- --coverage --watchAll=false
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/hysio_test
          REDIS_URL: redis://localhost:6379
          NODE_ENV: test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./hysio-medical-scribe/coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests

    steps:
      - uses: actions/checkout@v4

      - name: Run integration tests
        working-directory: ./hysio-medical-scribe
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/hysio_test
          # Skip tests requiring real API keys in CI
          SKIP_EXTERNAL_API_TESTS: true

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'hysio-medical-scribe/package-lock.json'

      - name: Install dependencies
        working-directory: ./hysio-medical-scribe
        run: npm ci

      - name: Build application
        working-directory: ./hysio-medical-scribe
        run: npm run build

      - name: Start application
        working-directory: ./hysio-medical-scribe
        run: |
          npm start &
          npx wait-on http://localhost:3000
        env:
          NODE_ENV: test
          NEXTAUTH_SECRET: test-secret

      - name: Run Cypress tests
        uses: cypress-io/github-action@v6
        with:
          working-directory: ./hysio-medical-scribe
          wait-on: 'http://localhost:3000'
          browser: chrome
          record: true
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  security-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run security audit
        working-directory: ./hysio-medical-scribe
        run: npm audit --audit-level=moderate

      - name: Run OWASP ZAP scan
        uses: zaproxy/action-full-scan@v0.7.0
        with:
          target: 'http://localhost:3000'
          fail_action: true
          allow_issue_writing: false
```

## Test Reporting

### Coverage Reports

```javascript
// jest.config.mjs - Coverage reporting
export default {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
  ],

  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary',
  ],

  coverageDirectory: 'coverage',

  // Healthcare-specific coverage requirements
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Critical healthcare modules
    'src/lib/api/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'src/lib/auth/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
};
```

### Test Metrics Dashboard

```typescript
// scripts/generate-test-report.ts
interface TestMetrics {
  coverage: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
  performance: {
    averageResponseTime: number;
    p95ResponseTime: number;
    throughput: number;
  };
  reliability: {
    testPassRate: number;
    flakyTestCount: number;
    criticalTestFailures: number;
  };
  security: {
    vulnerabilityCount: number;
    securityTestPassRate: number;
    lastPenetrationTest: Date;
  };
  compliance: {
    hipaaTestPassRate: number;
    auditTrailCoverage: number;
    dataEncryptionTests: number;
  };
}

export function generateTestReport(): TestMetrics {
  // Implementation for generating comprehensive test metrics
}
```

---

**Document Version**: 1.0
**Last Updated**: January 15, 2025
**Review Cycle**: Monthly
**Maintainer**: Hysio QA Team

*This testing guide is maintained by the Hysio Quality Assurance team and updated regularly to reflect current testing best practices and healthcare compliance requirements.*