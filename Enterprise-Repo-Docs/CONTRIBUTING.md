# Contributing to Hysio V2

## Overview

Thank you for your interest in contributing to Hysio V2, an enterprise-grade healthcare platform. This document provides guidelines for contributing to ensure high-quality, secure, and compliant code that meets healthcare industry standards.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Standards](#code-standards)
- [Git Workflow](#git-workflow)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Security Guidelines](#security-guidelines)
- [Healthcare Compliance](#healthcare-compliance)
- [Documentation Standards](#documentation-standards)

## Getting Started

### Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher
- **Git**: Latest stable version
- **IDE**: VS Code recommended with TypeScript extension
- **Healthcare Knowledge**: Understanding of medical terminology and HIPAA compliance (for healthcare-related features)

### Required Reading

Before contributing, please review:
- [README.md](./README.md) - Project overview and setup
- [SECURITY.md](./SECURITY.md) - Security policies and vulnerability reporting
- [PRIVACY.md](./PRIVACY.md) - Privacy policy and data protection requirements
- [COMPLIANCE.md](./COMPLIANCE.md) - Healthcare compliance framework

## Development Setup

### Local Environment Setup

1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   cd AdamHysioAdam
   ```

2. **Install dependencies**:
   ```bash
   cd hysio-medical-scribe
   npm install
   ```

3. **Environment configuration**:
   ```bash
   cp .env.example .env.local
   # Configure your environment variables
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Run tests**:
   ```bash
   npm test
   npm run lint
   ```

### IDE Configuration

#### VS Code Settings (`.vscode/settings.json`)
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.exclude": {
    "node_modules": true,
    ".next": true,
    "dist": true
  }
}
```

#### Recommended Extensions
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Jest Test Explorer
- GitLens

## Code Standards

### TypeScript Guidelines

#### Type Safety
- **Strict Mode**: All TypeScript strict mode options must be enabled
- **Explicit Types**: Prefer explicit type annotations for function parameters and return types
- **No `any`**: Avoid `any` type; use `unknown` or specific types instead
- **Interface Definitions**: Define interfaces for all data structures

```typescript
// ✅ Good
interface PatientRecord {
  id: string;
  name: string;
  birthDate: Date;
  medicalHistory: MedicalEvent[];
}

function processPatientData(patient: PatientRecord): ProcessedData {
  // Implementation
}

// ❌ Bad
function processPatientData(patient: any): any {
  // Implementation
}
```

#### Naming Conventions
- **Variables/Functions**: camelCase (`patientRecord`, `processData`)
- **Classes/Interfaces**: PascalCase (`PatientRecord`, `MedicalScribe`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- **Files**: kebab-case (`patient-record.tsx`, `medical-utils.ts`)
- **Directories**: kebab-case (`patient-management`, `diagnosis-codes`)

### React Component Standards

#### Component Structure
```typescript
// components/patient-record/PatientCard.tsx
import React from 'react';
import { PatientRecord } from '@/types/patient';

interface PatientCardProps {
  patient: PatientRecord;
  onEdit?: (id: string) => void;
  isEditable?: boolean;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onEdit,
  isEditable = false
}) => {
  // Component implementation
};

export default PatientCard;
```

#### Component Guidelines
- **Functional Components**: Use function components with hooks
- **Props Interface**: Define explicit interfaces for all props
- **Default Props**: Use default parameters instead of defaultProps
- **Memoization**: Use `React.memo()` for expensive components
- **Hooks**: Extract complex logic into custom hooks

### Styling Standards

#### Tailwind CSS Guidelines
- **Utility-First**: Use Tailwind utility classes for styling
- **Component Variants**: Use `class-variance-authority` for component variants
- **Responsive Design**: Mobile-first responsive design approach
- **Dark Mode**: Support both light and dark themes

```typescript
// ✅ Good - Using CVA for component variants
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        danger: 'bg-red-600 text-white hover:bg-red-700'
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg'
      }
    }
  }
);
```

### Security Coding Standards

#### Data Sanitization
- **Input Validation**: Validate all user inputs at component and API level
- **XSS Prevention**: Sanitize all user-generated content before rendering
- **SQL Injection**: Use parameterized queries (if applicable)
- **CSRF Protection**: Implement CSRF tokens for state-changing operations

```typescript
// ✅ Good - Input validation
import { z } from 'zod';

const PatientSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s-()]+$/)
});

function validatePatientData(data: unknown): PatientRecord {
  return PatientSchema.parse(data);
}
```

#### Secret Management
- **No Hardcoded Secrets**: Never commit API keys, passwords, or other secrets
- **Environment Variables**: Use environment variables for configuration
- **Sensitive Data**: Encrypt sensitive data at rest and in transit

### Performance Standards

#### Code Optimization
- **Bundle Size**: Monitor and optimize bundle size
- **Code Splitting**: Implement route-based code splitting
- **Lazy Loading**: Lazy load non-critical components
- **Memoization**: Use appropriate memoization for expensive operations

```typescript
// ✅ Good - Lazy loading
import { lazy, Suspense } from 'react';

const DiagnosisCodeSearch = lazy(() => import('./DiagnosisCodeSearch'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <DiagnosisCodeSearch />
    </Suspense>
  );
}
```

## Git Workflow

### Branching Strategy

We use **Git Flow** with the following branch structure:

- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **`feature/*`**: Feature development branches
- **`hotfix/*`**: Critical bug fixes for production
- **`release/*`**: Release preparation branches

### Branch Naming Conventions

```
feature/HYSIO-123-patient-record-search
hotfix/HYSIO-456-security-vulnerability-fix
release/v2.1.0
```

### Commit Message Format

We follow **Conventional Commits** specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

#### Examples
```
feat(patient-records): add search functionality with medical filters

Implements advanced search for patient records including:
- Medical record number search
- Date range filtering
- Diagnosis code filtering
- Provider-specific views

Closes HYSIO-123

fix(security): resolve XSS vulnerability in diagnosis search

- Sanitize user input in search component
- Add Content Security Policy headers
- Update input validation rules

SECURITY-FIX: Addresses potential XSS in search functionality
```

## Pull Request Process

### Before Creating a PR

1. **Update your branch**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/your-branch
   git rebase develop
   ```

2. **Run quality checks**:
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

3. **Security scan**:
   ```bash
   npm audit
   ```

### PR Requirements

#### Mandatory Checks
- [ ] All tests pass
- [ ] Linting passes without errors
- [ ] Build succeeds
- [ ] No security vulnerabilities introduced
- [ ] Documentation updated (if applicable)
- [ ] Healthcare compliance reviewed (for medical features)

#### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Security improvement

## Healthcare Impact
- [ ] Affects patient data processing
- [ ] Involves medical terminology/codes
- [ ] Changes compliance requirements
- [ ] No healthcare impact

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Security testing performed

## Security Review
- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] Authorization checks in place
- [ ] HIPAA compliance maintained

## Screenshots (if applicable)

## Checklist
- [ ] Self-review completed
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Tests pass locally
```

### Code Review Guidelines

#### Reviewer Responsibilities
- **Security Focus**: Prioritize security and compliance review
- **Medical Accuracy**: Verify medical terminology and logic
- **Performance**: Check for performance implications
- **Accessibility**: Ensure accessibility standards are met

#### Review Criteria
1. **Functionality**: Code works as intended
2. **Security**: No security vulnerabilities introduced
3. **Compliance**: Maintains healthcare compliance
4. **Performance**: No performance degradation
5. **Maintainability**: Code is readable and maintainable
6. **Testing**: Adequate test coverage

## Testing Requirements

### Test Coverage Standards
- **Unit Tests**: Minimum 80% code coverage
- **Integration Tests**: All API endpoints and critical user flows
- **E2E Tests**: Key healthcare workflows
- **Security Tests**: Authentication and authorization flows

### Testing Framework
- **Jest**: Unit and integration tests
- **React Testing Library**: Component testing
- **Cypress** (planned): End-to-end testing

### Test Structure
```typescript
// __tests__/components/PatientCard.test.tsx
import { render, screen } from '@testing-library/react';
import { PatientCard } from '@/components/PatientCard';

describe('PatientCard', () => {
  const mockPatient = {
    id: 'patient-123',
    name: 'John Doe',
    birthDate: new Date('1980-01-01')
  };

  it('displays patient information correctly', () => {
    render(<PatientCard patient={mockPatient} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/1980-01-01/)).toBeInTheDocument();
  });

  it('handles missing patient data gracefully', () => {
    render(<PatientCard patient={null} />);

    expect(screen.getByText(/No patient data/)).toBeInTheDocument();
  });
});
```

## Security Guidelines

### Code Security
- **Input Validation**: Validate all inputs at the boundary
- **Output Encoding**: Encode all outputs to prevent XSS
- **Authentication**: Use secure authentication mechanisms
- **Authorization**: Implement proper access controls

### Dependency Security
- **Regular Updates**: Keep dependencies updated
- **Security Audits**: Run `npm audit` regularly
- **Vulnerability Scanning**: Use automated security scanning
- **License Compliance**: Ensure license compatibility

### Data Protection
- **Encryption**: Encrypt sensitive data at rest and in transit
- **Access Logging**: Log all access to patient data
- **Data Minimization**: Collect only necessary data
- **Secure Disposal**: Implement secure data deletion

## Healthcare Compliance

### HIPAA Compliance
- **Minimum Necessary**: Access only necessary patient data
- **Audit Trails**: Log all PHI access and modifications
- **Business Associate Agreements**: Ensure vendor compliance
- **Risk Assessments**: Regular security risk assessments

### Medical Accuracy
- **Terminology**: Use standardized medical terminology
- **Code Validation**: Validate diagnosis and procedure codes
- **Clinical Review**: Have medical professionals review clinical features
- **Error Handling**: Graceful handling of medical data errors

### Data Quality
- **Validation Rules**: Implement medical data validation
- **Consistency Checks**: Ensure data consistency across the platform
- **Audit Trails**: Maintain comprehensive audit logs
- **Backup Procedures**: Regular backup of medical data

## Documentation Standards

### Code Documentation
- **JSDoc Comments**: Document all public functions and classes
- **README Files**: Maintain README files for each major component
- **API Documentation**: Document all API endpoints
- **Architectural Decisions**: Document significant architectural decisions

### User Documentation
- **User Guides**: Maintain user guides for healthcare providers
- **API Documentation**: Complete API reference documentation
- **Security Procedures**: Document security procedures for users
- **Compliance Guides**: Healthcare compliance guidance

## Issue Reporting

### Bug Reports
Use the bug report template in `.github/ISSUE_TEMPLATE/bug_report.md`

### Feature Requests
Use the feature request template in `.github/ISSUE_TEMPLATE/feature_request.md`

### Security Issues
Report security issues to security@hysio.com (do not create public issues)

## Contact

- **Technical Questions**: tech@hysio.com
- **Security Issues**: security@hysio.com
- **Compliance Questions**: compliance@hysio.com
- **General Inquiries**: contact@hysio.com

---

**Note**: This document is a living document and will be updated as the project evolves. All contributors are expected to follow these guidelines to maintain the high quality and security standards required for healthcare software.