# Hysio V2 Development Guide

## Overview

This guide provides comprehensive instructions for setting up and developing the Hysio V2 healthcare platform locally. The platform is designed for medical transcription, diagnosis code analysis, and healthcare communication with enterprise-grade security and HIPAA compliance.

**Target Audience**: Software Engineers, DevOps Engineers, Healthcare IT Developers
**Platform Support**: Windows, macOS, Linux
**Estimated Setup Time**: 30-60 minutes

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Testing](#testing)
- [Debugging](#debugging)
- [Code Quality](#code-quality)
- [Healthcare Compliance](#healthcare-compliance)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Prerequisites

### System Requirements

#### Minimum Requirements
- **CPU**: 4 cores (8 recommended)
- **Memory**: 8 GB RAM (16 GB recommended)
- **Storage**: 20 GB free space (SSD recommended)
- **Network**: Broadband internet connection

#### Operating Systems
- **Windows**: 10/11 with WSL2
- **macOS**: 12.0+ (Intel or Apple Silicon)
- **Linux**: Ubuntu 20.04+, Debian 11+, CentOS 8+

### Required Software

#### Core Development Tools
```bash
# Node.js (required version)
Node.js 18.x or 20.x (LTS recommended)

# Package manager
npm 9.x+ (comes with Node.js)

# Version control
Git 2.30+

# Database
PostgreSQL 15+

# Cache/Session store
Redis 7+
```

#### Development Tools (Recommended)
```bash
# Code editor
Visual Studio Code with extensions:
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Jest Test Explorer

# Database tools
pgAdmin 4 or TablePlus (GUI)
Redis CLI or RedisInsight (GUI)

# API testing
Postman or Insomnia

# Docker (for containerized development)
Docker Desktop or Docker Engine 20.10+
Docker Compose 2.0+
```

### API Keys and Services

#### Required for Full Functionality
```bash
# AI Services
OPENAI_API_KEY=sk-...      # GPT-4 for medical content generation
GROQ_API_KEY=gsk_...       # Whisper for audio transcription

# Email Service (optional for development)
SMTP credentials for email testing

# Cloud Storage (optional for development)
AWS S3 credentials for file storage
```

## Quick Start

### 1. Clone the Repository
```bash
# Clone the repository
git clone https://github.com/your-org/hysio-v2.git
cd hysio-v2

# Switch to the main application directory
cd hysio-medical-scribe
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Verify installation
npm run build  # Should complete without errors
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit configuration (see Environment Setup section)
code .env.local  # or use your preferred editor
```

### 4. Start Development Server
```bash
# Start the development server
npm run dev

# Open browser to http://localhost:3000
```

## Development Environment Setup

### Node.js Installation

#### Option 1: Direct Installation
```bash
# Download from nodejs.org
# Install Node.js 18.x LTS

# Verify installation
node --version   # Should show v18.x.x or v20.x.x
npm --version    # Should show 9.x.x+
```

#### Option 2: Node Version Manager (Recommended)
```bash
# Install nvm (Linux/macOS)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install nvm (Windows)
# Download and install nvm-windows from GitHub

# Install and use Node.js
nvm install 18
nvm use 18
nvm alias default 18
```

### Database Setup

#### PostgreSQL Installation

**Windows:**
```powershell
# Using Chocolatey
choco install postgresql

# Or download installer from postgresql.org
```

**macOS:**
```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15

# Or using Postgres.app (GUI)
# Download from postgresapp.com
```

**Linux (Ubuntu/Debian):**
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql-15 postgresql-client-15 postgresql-contrib-15

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Database Configuration
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create development database and user
CREATE DATABASE hysio_dev;
CREATE USER hysio_user WITH ENCRYPTED PASSWORD 'dev_password_123';
GRANT ALL PRIVILEGES ON DATABASE hysio_dev TO hysio_user;

# Create test database
CREATE DATABASE hysio_test;
GRANT ALL PRIVILEGES ON DATABASE hysio_test TO hysio_user;

# Exit PostgreSQL
\q
```

### Redis Installation

**Windows:**
```powershell
# Using Chocolatey
choco install redis-64

# Or use Windows Subsystem for Linux (WSL2)
```

**macOS:**
```bash
# Using Homebrew
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
# Install Redis
sudo apt install redis-server

# Start service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test connection
redis-cli ping  # Should return PONG
```

### Environment Variables Setup

#### Development Configuration
Create `.env.local` in the `hysio-medical-scribe` directory:

```bash
# Core application settings
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-change-in-production

# Database configuration
DATABASE_URL=postgresql://hysio_user:dev_password_123@localhost:5432/hysio_dev
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=hysio_dev
POSTGRES_USER=hysio_user
POSTGRES_PASSWORD=dev_password_123

# Redis configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# AI Services (required for full functionality)
OPENAI_API_KEY=your-openai-api-key-here
GROQ_API_KEY=your-groq-api-key-here

# Development settings
DEBUG=false
LOG_LEVEL=debug
ENABLE_HEALTH_CHECKS=true

# Test database
TEST_DATABASE_URL=postgresql://hysio_user:dev_password_123@localhost:5432/hysio_test
TEST_REDIS_URL=redis://localhost:6379/1

# Security (development only - use strong keys in production)
ENCRYPTION_KEY=dev-encryption-key-32-characters
JWT_SECRET=dev-jwt-secret-key-here
SESSION_SECRET=dev-session-secret-key-here

# Feature flags for development
FEATURE_VOICE_COMMANDS=true
BETA_AI_DIAGNOSIS_SUGGESTIONS=true
BETA_SMART_TEMPLATES=true

# HIPAA compliance (always enabled)
HIPAA_COMPLIANT_LOGGING=true
AUDIT_TRAIL_ENABLED=true
PHI_ENCRYPTION_REQUIRED=true
```

### IDE Configuration

#### Visual Studio Code Setup

**Recommended Extensions:**
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "orta.vscode-jest",
    "ms-vscode.vscode-json",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag",
    "bradlc.vscode-tailwindcss"
  ]
}
```

**Workspace Settings (`.vscode/settings.json`):**
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
    "dist": true,
    "coverage": true
  },
  "search.exclude": {
    "node_modules": true,
    ".next": true,
    "dist": true,
    "coverage": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

**Launch Configuration (`.vscode/launch.json`):**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "env": {
        "NODE_OPTIONS": "--inspect"
      }
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

## Project Structure

### Directory Overview
```
hysio-v2/
├── .github/                    # GitHub workflows and templates
│   ├── workflows/             # CI/CD pipelines
│   ├── ISSUE_TEMPLATE/        # Issue templates
│   └── PULL_REQUEST_TEMPLATE/ # PR templates
├── docs/                      # Project documentation
│   ├── api/                   # API documentation
│   ├── architecture/          # Architecture diagrams
│   └── guides/               # Development guides
├── hysio-medical-scribe/      # Main application
│   ├── src/                   # Source code
│   │   ├── app/              # Next.js app directory
│   │   │   ├── api/          # API routes
│   │   │   ├── (dashboard)/  # Dashboard pages
│   │   │   └── globals.css   # Global styles
│   │   ├── components/       # React components
│   │   │   ├── ui/           # Base UI components
│   │   │   ├── forms/        # Form components
│   │   │   └── layouts/      # Layout components
│   │   ├── lib/              # Utility libraries
│   │   │   ├── api/          # API client functions
│   │   │   ├── auth/         # Authentication logic
│   │   │   ├── utils/        # Helper functions
│   │   │   └── types/        # TypeScript types
│   │   └── styles/           # CSS and styling
│   ├── public/               # Static assets
│   ├── __tests__/            # Test files
│   ├── .env.example          # Environment template
│   ├── package.json          # Dependencies
│   ├── tsconfig.json         # TypeScript config
│   ├── tailwind.config.js    # Tailwind CSS config
│   ├── jest.config.mjs       # Jest test config
│   └── next.config.ts        # Next.js config
├── docker-compose.yml         # Docker development setup
├── CONTRIBUTING.md           # Contribution guidelines
├── DEPLOYMENT.md             # Deployment instructions
├── API_DOCUMENTATION.md      # API reference
├── ARCHITECTURE.md           # System architecture
└── README.md                 # Project overview
```

### Key Directories Explained

#### `/src/app/` - Next.js App Router
```typescript
app/
├── api/                      # Backend API routes
│   ├── transcribe/          # Audio transcription
│   ├── diagnosecode/        # Diagnosis code analysis
│   ├── smartmail/           # Email generation
│   ├── assistant/           # Healthcare assistant
│   └── auth/                # Authentication
├── (dashboard)/             # Dashboard routes (route groups)
│   ├── transcription/       # Transcription interface
│   ├── diagnosis/           # Diagnosis code interface
│   ├── email/               # Email generation interface
│   └── settings/            # User settings
├── layout.tsx               # Root layout
├── page.tsx                 # Home page
├── loading.tsx              # Loading UI
├── error.tsx                # Error UI
└── globals.css              # Global styles
```

#### `/src/components/` - React Components
```typescript
components/
├── ui/                      # Base UI components (Radix UI based)
│   ├── button.tsx           # Button component
│   ├── input.tsx            # Input component
│   ├── dialog.tsx           # Modal/dialog
│   └── ...                  # Other UI primitives
├── forms/                   # Form-specific components
│   ├── transcription-form/  # Audio upload forms
│   ├── diagnosis-form/      # Clinical description forms
│   └── email-form/          # Email generation forms
├── layouts/                 # Layout components
│   ├── dashboard-layout/    # Main dashboard layout
│   ├── auth-layout/         # Authentication layout
│   └── public-layout/       # Public pages layout
└── features/                # Feature-specific components
    ├── transcription/       # Transcription-related components
    ├── diagnosis/           # Diagnosis-related components
    └── email/               # Email-related components
```

#### `/src/lib/` - Utility Libraries
```typescript
lib/
├── api/                     # API client functions
│   ├── groq.ts             # Groq API integration
│   ├── openai.ts           # OpenAI API integration
│   ├── transcription.ts    # Transcription utilities
│   └── index.ts            # API client exports
├── auth/                    # Authentication logic
│   ├── config.ts           # Auth configuration
│   ├── providers.ts        # Auth providers
│   └── middleware.ts       # Auth middleware
├── utils/                   # Helper functions
│   ├── audio-splitter.ts   # Audio file processing
│   ├── encryption.ts       # Data encryption
│   ├── validation.ts       # Input validation
│   └── formatting.ts       # Data formatting
├── types/                   # TypeScript type definitions
│   ├── api.ts              # API types
│   ├── auth.ts             # Authentication types
│   ├── medical.ts          # Medical data types
│   └── common.ts           # Common types
└── constants/               # Application constants
    ├── medical-codes.ts    # Medical coding constants
    ├── file-types.ts       # Supported file formats
    └── validation.ts       # Validation rules
```

## Local Development

### Development Workflow

#### 1. Start Development Environment
```bash
# Navigate to the application directory
cd hysio-medical-scribe

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# In separate terminals, start additional services:

# PostgreSQL (if not running as service)
sudo systemctl start postgresql

# Redis (if not running as service)
redis-server

# Optional: Start Docker services
docker-compose up -d postgres redis
```

#### 2. Verify Setup
```bash
# Check if services are running
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "healthy",
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

#### 3. Development Commands
```bash
# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Testing
npm test
npm run test:watch
npm run test:coverage

# Building
npm run build
npm start  # Production build

# Database operations
npm run db:migrate
npm run db:seed
npm run db:reset
```

### Hot Reload and Live Development

#### Next.js Fast Refresh
- **File Changes**: Automatic reload on save
- **Component Updates**: React components update without losing state
- **API Changes**: API routes reload automatically
- **Style Changes**: CSS updates without page refresh

#### Development Features
```typescript
// Development-only features in .env.local
DEBUG=true                    # Enable debug logging
HOT_RELOAD=true              # Enable hot module replacement
ENABLE_SWAGGER_UI=true       # API documentation UI
REACT_STRICT_MODE=true       # React strict mode checks
```

### Database Development

#### Running Migrations
```bash
# Check migration status
npm run db:status

# Run pending migrations
npm run db:migrate

# Rollback last migration
npm run db:rollback

# Reset database (development only)
npm run db:reset
```

#### Sample Data (Development)
```bash
# Seed development data
npm run db:seed

# Clear development data
npm run db:clear

# Reset with fresh seed data
npm run db:reset-with-seed
```

### Working with Healthcare Data

#### Test Data Guidelines
```typescript
// Use synthetic data for development
const testPatientData = {
  // NEVER use real patient information
  mrn: "TEST-001",
  name: "Test Patient",
  dob: "1980-01-01",
  // Always use clearly marked test data
  notes: "[TEST DATA] - Not real patient information"
};

// PHI Encryption in Development
const encryptedData = await encryptPHI(testData, "test-encryption-key");
```

#### HIPAA Compliance in Development
- **Never use real PHI**: Always use synthetic test data
- **Encryption**: Even test data should be encrypted
- **Audit Logging**: All data access is logged
- **Access Controls**: Implement proper authentication

## Testing

### Test Structure
```
__tests__/
├── components/              # Component tests
│   ├── ui/                 # UI component tests
│   └── forms/              # Form component tests
├── lib/                    # Utility function tests
│   ├── api/               # API client tests
│   └── utils/             # Helper function tests
├── pages/                  # Page component tests
├── api/                    # API route tests
├── integration/            # Integration tests
├── e2e/                    # End-to-end tests
└── __mocks__/              # Mock files
    ├── next-auth.ts       # NextAuth mocks
    └── api-responses.ts   # API response mocks
```

### Running Tests

#### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test files
npm test -- transcription

# Run tests matching pattern
npm test -- --testNamePattern="should transcribe audio"
```

#### Test Configuration
```javascript
// jest.config.mjs
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

#### Example Test Files
```typescript
// __tests__/components/TranscriptionForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TranscriptionForm } from '@/components/forms/TranscriptionForm';

describe('TranscriptionForm', () => {
  test('should upload and transcribe audio file', async () => {
    const mockFile = new File(['audio data'], 'test.mp3', { type: 'audio/mp3' });
    const onTranscribe = jest.fn();

    render(<TranscriptionForm onTranscribe={onTranscribe} />);

    const fileInput = screen.getByLabelText(/upload audio/i);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    const submitButton = screen.getByRole('button', { name: /transcribe/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onTranscribe).toHaveBeenCalledWith(mockFile);
    });
  });
});
```

### E2E Testing (Planned)

#### Cypress Configuration
```javascript
// cypress.config.js
export default {
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
  env: {
    SKIP_REAL_API_CALLS: true,
  },
};
```

## Debugging

### Development Debugging

#### Browser DevTools
```javascript
// Enable React DevTools
// Install React Developer Tools browser extension

// Debug state and props
console.log('Component state:', state);
console.log('Component props:', props);

// Performance profiling
console.time('transcription-processing');
// ... code to measure
console.timeEnd('transcription-processing');
```

#### Server-Side Debugging
```bash
# Start with Node.js inspector
npm run dev:debug

# Connect Chrome DevTools
# Navigate to chrome://inspect
# Click "Inspect" next to the Node.js process
```

#### API Debugging
```typescript
// Add debug logging to API routes
export async function POST(request: NextRequest) {
  console.log('API Request:', {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
  });

  try {
    // ... route logic
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

### Production Debugging

#### Logging Configuration
```typescript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'hysio-medical-scribe',
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    }),
  ],
});
```

#### Health Checks
```typescript
// app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      external_apis: await checkExternalAPIs(),
    },
  };

  const isHealthy = Object.values(health.services).every(
    status => status === 'healthy'
  );

  return NextResponse.json(health, {
    status: isHealthy ? 200 : 503,
  });
}
```

## Code Quality

### ESLint Configuration

#### `.eslintrc.json`
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-console": "warn"
  },
  "overrides": [
    {
      "files": ["**/*.test.ts", "**/*.test.tsx"],
      "rules": {
        "no-console": "off"
      }
    }
  ]
}
```

### Prettier Configuration

#### `.prettierrc.json`
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### Pre-commit Hooks

#### `.husky/pre-commit`
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm test -- --passWithNoTests

# Check for sensitive data
npm run check-secrets
```

## Healthcare Compliance

### Development Best Practices

#### PHI Handling
```typescript
// Always encrypt PHI data
interface PatientData {
  id: string;
  encryptedData: string;  // Never store plain text PHI
  lastAccessed: Date;
  accessedBy: string;
}

// Log all PHI access
async function accessPatientData(patientId: string, providerId: string, reason: string) {
  await auditLog({
    action: 'PHI_ACCESS',
    patientId,
    providerId,
    reason,
    timestamp: new Date(),
    ipAddress: getClientIP(),
  });

  return await getEncryptedPatientData(patientId);
}
```

#### Audit Logging
```typescript
// Comprehensive audit trail
interface AuditEvent {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  outcome: 'success' | 'failure';
  details?: any;
}

async function createAuditLog(event: AuditEvent): Promise<void> {
  // Store in immutable audit table
  await db.auditLogs.create(event);

  // Also send to external audit system if configured
  if (process.env.EXTERNAL_AUDIT_ENDPOINT) {
    await sendToExternalAudit(event);
  }
}
```

#### Data Validation
```typescript
// Validate all medical data inputs
import { z } from 'zod';

const PatientSchema = z.object({
  mrn: z.string().regex(/^[A-Z0-9-]{6,20}$/),
  name: z.string().min(1).max(100),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(['M', 'F', 'O', 'U']),
});

const DiagnosisSchema = z.object({
  code: z.string().regex(/^[A-Z]\d{2}(\.\d{1,4})?$/),
  description: z.string().min(1).max(500),
  confidence: z.number().min(0).max(1),
});

// Use in API routes
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const validatedData = PatientSchema.parse(data);
    // Process validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -h localhost -U hysio_user -d hysio_dev

# Common fixes:
# - Ensure PostgreSQL is started
# - Check credentials in .env.local
# - Verify database exists
# - Check firewall settings
```

#### 2. Redis Connection Issues
```bash
# Check if Redis is running
redis-cli ping

# Should return: PONG

# Check Redis logs
sudo journalctl -u redis

# Common fixes:
# - Start Redis service: sudo systemctl start redis
# - Check Redis configuration
# - Verify port 6379 is open
```

#### 3. API Key Issues
```bash
# Test OpenAI API key
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.openai.com/v1/models

# Test Groq API key
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.groq.com/openai/v1/models

# Common fixes:
# - Verify API keys are correct
# - Check API key permissions
# - Ensure sufficient API credits
# - Check rate limits
```

#### 4. Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check
```

#### 5. Permission Issues (Linux/macOS)
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Fix npm global permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Performance Issues

#### 1. Slow Development Server
```bash
# Check if it's a file watching issue
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Use faster package manager
npm install -g pnpm
pnpm install
pnpm dev
```

#### 2. Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev

# Or add to package.json scripts:
"dev": "NODE_OPTIONS='--max-old-space-size=4096' next dev"
```

### Getting Help

#### Internal Resources
- **Team Chat**: Development team Slack/Teams channel
- **Documentation**: `/docs` directory in repository
- **Code Review**: Pull request discussions
- **Architecture**: `ARCHITECTURE.md` for system design

#### External Resources
- **Next.js Documentation**: https://nextjs.org/docs
- **React Documentation**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs

#### Support Channels
- **Technical Issues**: tech-support@hysio.com
- **Security Questions**: security@hysio.com
- **Compliance Questions**: compliance@hysio.com

## Contributing

### Before You Start
1. Read `CONTRIBUTING.md` for detailed guidelines
2. Set up development environment following this guide
3. Ensure all tests pass: `npm test`
4. Verify code quality: `npm run lint`

### Development Workflow
1. **Create Feature Branch**: `git checkout -b feature/your-feature-name`
2. **Make Changes**: Follow coding standards and test your changes
3. **Test Thoroughly**: Run unit tests and manual testing
4. **Submit PR**: Create pull request with clear description

### Code Standards
- **TypeScript**: Use strict type checking
- **Testing**: Maintain >80% code coverage
- **Security**: Never commit secrets or PHI data
- **Healthcare Compliance**: Follow HIPAA guidelines
- **Documentation**: Update docs for significant changes

---

**Last Updated**: January 15, 2025
**Guide Version**: 1.0
**Next Review**: Monthly

*This development guide is maintained by the Hysio development team. For questions or improvements, please open an issue or submit a pull request.*