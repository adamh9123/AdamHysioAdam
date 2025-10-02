# Technical Debt & Known Issues

## Overview

This document catalogs all known technical debt, code smells, and improvement opportunities in the Hysio codebase. Items are prioritized by severity and estimated effort.

**Last Updated**: Based on codebase analysis as of branch `hysio-v7.1`

## Priority Legend

- **P0 (Critical)**: Blocks production use, security risk, data loss risk
- **P1 (High)**: Significant UX impact, performance degradation, maintainability issue
- **P2 (Medium)**: Minor UX issue, code quality improvement, nice-to-have
- **P3 (Low)**: Refactoring, optimization, documentation improvement

## Effort Legend

- **XS**: <2 hours
- **S**: 2-4 hours
- **M**: 4-8 hours (1 day)
- **L**: 8-16 hours (2 days)
- **XL**: 16+ hours (3+ days)

---

## P0: Critical Issues

### None Currently Identified

**Status**: All critical bugs fixed in recent releases (v8.5-v9.1)

**Recent Critical Fixes** (see CHANGELOG):
- ✅ Transcript truncation bug (v8.5)
- ✅ Invalid OpenAI model name (v8.5)
- ✅ Phantom redirect navigation failures (ULTRATHINK Protocol)
- ✅ State management race conditions (v7.1)
- ✅ Audio transcription Cloudflare WAF blocking (v7.0)

---

## P1: High Priority

### 1. No Test Coverage for AI Prompts

**Issue**: System prompts have zero test coverage despite being the core intelligence of Hysio

**Impact**:
- Prompt regressions are not caught before deployment
- Changes to prompts may break existing workflows
- No validation of prompt output structure

**Location**: `hysio/src/lib/prompts/`

**Proposed Solution**:
```typescript
// Create prompt regression tests
// File: hysio/src/lib/prompts/__tests__/soep-verslag.test.ts

import { describe, it, expect } from 'vitest';
import { CONSULT_VERWERKING_SOEP_PROMPT } from '../consult/stap1-verwerking-soep-verslag';

describe('SOEP Prompt v9.0', () => {
  it('should contain v9.0 GOLDEN STANDARD header', () => {
    expect(CONSULT_VERWERKING_SOEP_PROMPT).toContain('v9.0 GOLDEN STANDARD');
  });

  it('should enforce word limits', () => {
    expect(CONSULT_VERWERKING_SOEP_PROMPT).toContain('300-600 woorden');
    expect(CONSULT_VERWERKING_SOEP_PROMPT).toContain('400-700 woorden');
  });

  it('should include absolute privacy protocol', () => {
    expect(CONSULT_VERWERKING_SOEP_PROMPT).toContain('ABSOLUTE PRIVACY PROTOCOL');
    expect(CONSULT_VERWERKING_SOEP_PROMPT).toContain('NON-NEGOTIABLE');
  });

  // Test actual AI output structure with mock OpenAI responses
  // ... more tests
});
```

**Effort**: M (4-8 hours to create comprehensive test suite)

**Priority**: P1 (prevents prompt regression)

---

### 2. Missing Database Layer

**Issue**: All state stored in browser localStorage - not scalable, not shareable, no backup

**Impact**:
- User loses all data if localStorage cleared
- No cross-device synchronization
- No collaboration features possible
- No audit trails or compliance logging

**Location**: `hysio/src/lib/state/scribe-store.ts` (uses Zustand persist to localStorage)

**Proposed Solution**:
1. Add PostgreSQL database
2. Create Prisma schema for patient data, sessions, workflow data
3. Migrate Zustand store to use API calls instead of localStorage
4. Add sync layer (optimistic updates + server persistence)

**Effort**: XL (16+ hours)

**Priority**: P1 (blocks multi-user features, compliance requirements)

**Blockers**: None, ready to implement

---

### 3. No User Authentication/Authorization

**Issue**: No login system, anyone can access any data (when DB added)

**Impact**:
- Cannot deploy to production safely
- No user-specific data isolation
- No access control
- No compliance with healthcare regulations (AVG/GDPR requires authentication)

**Location**: No auth system exists currently

**Proposed Solution**:
1. Add NextAuth.js for authentication
2. Implement JWT-based session management
3. Add role-based access control (therapist, admin)
4. Protect API routes with auth middleware

**Files to Create**:
- `hysio/src/app/api/auth/[...nextauth]/route.ts`
- `hysio/src/middleware.ts` (auth middleware)
- `hysio/src/lib/auth/session.ts` (session management)

**Effort**: L (8-16 hours)

**Priority**: P1 (required for production)

**Dependencies**: Database layer (P1-2)

---

### 4. Missing Error Monitoring & Logging

**Issue**: No centralized error tracking, logging only to console

**Impact**:
- Production errors are invisible
- Cannot diagnose user-reported issues
- No performance monitoring
- No alerting for critical failures

**Location**: Logging is ad-hoc throughout codebase

**Proposed Solution**:
1. Add Sentry for error tracking
2. Implement structured logging (Winston or Pino)
3. Add performance monitoring
4. Set up alerting for critical errors

**Effort**: M (4-8 hours)

**Priority**: P1 (required for production support)

---

### 5. API Routes Lack Input Validation

**Issue**: Some API routes trust client input without server-side validation

**Impact**:
- Security risk (malicious inputs)
- Data corruption risk
- Unclear error messages
- Harder to debug issues

**Examples**:
- `hysio/src/app/api/hhsb/process/route.ts` - trusts patientInfo structure
- `hysio/src/app/api/soep/process/route.ts` - trusts inputData type

**Proposed Solution**:
Add Zod validation to all API routes:
```typescript
import { z } from 'zod';

const PatientInfoSchema = z.object({
  initials: z.string().min(1).max(10),
  birthYear: z.string().regex(/^\d{4}$/),
  gender: z.enum(['male', 'female']),
  chiefComplaint: z.string().min(3).max(200),
  additionalInfo: z.string().max(1000).optional(),
});

// In route handler
export async function POST(request: Request) {
  const body = await request.json();

  // Validate
  const parseResult = PatientInfoSchema.safeParse(body.patientInfo);
  if (!parseResult.success) {
    return NextResponse.json({
      error: 'Ongeldige patiëntinformatie',
      details: parseResult.error.issues
    }, { status: 400 });
  }

  const patientInfo = parseResult.data;
  // ... continue processing
}
```

**Effort**: M (4-8 hours to add validation to all routes)

**Priority**: P1 (security and data integrity)

---

## P2: Medium Priority

### 6. Inconsistent Error Messages

**Issue**: Error messages vary in format, language, and helpfulness

**Impact**:
- Poor user experience
- Difficult to debug issues
- Inconsistent UX

**Examples**:
- Some errors in English, some in Dutch
- Some technical, some user-friendly
- Different error formats across components

**Proposed Solution**:
Create error message standards:
```typescript
// hysio/src/lib/utils/error-messages.ts

export const ERROR_MESSAGES = {
  INVALID_PATIENT_INFO: 'Ongeldige patiëntinformatie. Controleer alle velden.',
  TRANSCRIPTION_FAILED: 'Transcriptie mislukt. Probeer het opnieuw of gebruik handmatige invoer.',
  AI_GENERATION_FAILED: 'AI-verwerking mislukt. Probeer het opnieuw.',
  NETWORK_ERROR: 'Netwerkfout. Controleer uw internetverbinding.',
  // ... etc.
} as const;

export function getUserFriendlyError(error: Error): string {
  // Map technical errors to user-friendly Dutch messages
  if (error.message.includes('OpenAI')) {
    return ERROR_MESSAGES.AI_GENERATION_FAILED;
  }
  // ... etc.
  return 'Er is een onverwachte fout opgetreden. Probeer het opnieuw.';
}
```

**Effort**: S (2-4 hours)

**Priority**: P2 (UX improvement)

---

### 7. No Loading States for Long Operations

**Issue**: Some long-running operations lack loading indicators

**Impact**:
- User doesn't know if app is processing or stuck
- Poor UX, increased perceived latency

**Examples**:
- Audio transcription (15-30 seconds) - has loading state ✅
- AI generation (5-20 seconds) - has loading state ✅
- Export to PDF/DOCX - some missing ⚠️

**Proposed Solution**:
Add loading states to all async operations, especially export functions

**Effort**: XS (<2 hours)

**Priority**: P2 (UX polish)

---

### 8. Duplicate Export Logic

**Issue**: Export logic partially duplicated across files

**Status**: **MOSTLY FIXED** in v4.0 refactor (Week 4 Day 2)

**Remaining Duplication**:
- Some specialized export functions still exist
- Complete consolidation not yet done

**Location**:
- Primary: `hysio/src/lib/utils/document-export.ts` (unified)
- Legacy: `hysio/src/lib/utils/soep-export.ts` (partially consolidated)
- Legacy: `hysio/src/lib/utils/session-export.ts` (deprecated?)

**Proposed Solution**:
Complete migration to unified `document-export.ts`

**Effort**: S (2-4 hours)

**Priority**: P2 (code quality, maintainability)

---

### 9. Limited Accessibility Testing

**Issue**: No automated accessibility testing, manual testing incomplete

**Impact**:
- May not meet WCAG 2.1 AA standards
- Excludes users with disabilities
- Legal/compliance risk

**Proposed Solution**:
1. Add `axe-core` or `jest-axe` for automated a11y testing
2. Test all workflows with screen readers
3. Verify keyboard navigation
4. Check color contrast ratios

**Effort**: M (4-8 hours)

**Priority**: P2 (compliance, inclusivity)

---

### 10. No Performance Monitoring

**Issue**: No tracking of actual user performance metrics

**Impact**:
- Cannot identify performance bottlenecks
- No data-driven optimization
- User experience issues invisible

**Proposed Solution**:
1. Add Web Vitals tracking (LCP, FID, CLS)
2. Track API latency (OpenAI, Groq)
3. Monitor bundle sizes
4. Set performance budgets

**Effort**: S (2-4 hours)

**Priority**: P2 (optimization enabler)

---

## P3: Low Priority (Nice-to-Have)

### 11. Inconsistent Component Naming

**Issue**: Component naming conventions vary (PascalCase, kebab-case files)

**Impact**: Minor - harder to find files, inconsistent codebase feel

**Effort**: S (2-4 hours to standardize)

**Priority**: P3 (code quality)

---

### 12. Missing JSDoc Comments

**Issue**: Many functions lack JSDoc documentation

**Impact**: Harder for new developers to understand code purpose

**Effort**: M (4-8 hours to document all public APIs)

**Priority**: P3 (developer experience)

---

### 13. No Storybook for Component Development

**Issue**: Components developed in full app context, harder to iterate

**Impact**: Slower component development, less reusable components

**Effort**: L (8-16 hours to set up Storybook + stories)

**Priority**: P3 (developer experience)

---

### 14. Bundle Size Not Optimized

**Issue**: Initial bundle size could be smaller with more code splitting

**Current**: Not measured, likely 1.5-2MB initial bundle

**Target**: <1MB initial bundle

**Effort**: M (4-8 hours)

**Priority**: P3 (performance optimization)

---

## Quick Wins (High Impact, Low Effort)

### Quick Win 1: Add Prompt Regression Tests
- **Impact**: Prevent prompt regressions (high)
- **Effort**: M (4-8 hours)
- **Priority**: P1
- **Start here**: Create `hysio/src/lib/prompts/__tests__/` directory

### Quick Win 2: Standardize Error Messages
- **Impact**: Better UX (medium)
- **Effort**: S (2-4 hours)
- **Priority**: P2
- **Start here**: Create `hysio/src/lib/utils/error-messages.ts`

### Quick Win 3: Add Loading States to Exports
- **Impact**: UX polish (medium)
- **Effort**: XS (<2 hours)
- **Priority**: P2
- **Start here**: Review export functions in components, add loading states

### Quick Win 4: Add Input Validation to API Routes
- **Impact**: Security & data integrity (high)
- **Effort**: M (4-8 hours)
- **Priority**: P1
- **Start here**: Add Zod to dependencies, validate `/api/hhsb/process` first

---

## Technical Debt by Category

### Testing (Total: 20+ hours)
- [ ] Prompt regression tests (M)
- [ ] API integration tests (M)
- [ ] E2E workflow tests (L)
- [ ] Accessibility tests (M)
- [ ] Performance tests (S)

### Infrastructure (Total: 40+ hours)
- [ ] Database layer (XL)
- [ ] User authentication (L)
- [ ] Error monitoring (M)
- [ ] Performance monitoring (S)
- [ ] CI/CD pipeline (L)

### Code Quality (Total: 10+ hours)
- [ ] Input validation (M)
- [ ] Error message standardization (S)
- [ ] Complete export consolidation (S)
- [ ] Component naming (S)
- [ ] JSDoc comments (M)

### UX (Total: 8+ hours)
- [ ] Loading states (XS)
- [ ] Error handling UX (S)
- [ ] Accessibility improvements (M)
- [ ] Mobile responsiveness (M)

**Total Estimated Effort**: ~80 hours (2 weeks for 1 developer)

---

## Avoiding Future Debt

### Best Practices Going Forward

1. **Test First**: Write tests for new prompts before deploying
2. **Validate Everything**: Add Zod validation to all new API routes
3. **Document as You Go**: Add JSDoc to all new functions
4. **Performance Budget**: Monitor bundle size, reject PRs that exceed budget
5. **Code Review**: Require review for all prompt changes
6. **Changelog Discipline**: Update CHANGELOG.md for every change

### Code Standards

- **Max file size**: 500 lines (enforced in ESLint)
- **Max function complexity**: 15 (enforced in ESLint)
- **Test coverage target**: 60% (currently 15%)
- **Type coverage**: 100% (no `any` types except justified)

---

## Migration Priorities

**Phase 1** (Week 1-2): Foundation
1. Add prompt regression tests
2. Add input validation to API routes
3. Standardize error messages
4. Set up error monitoring (Sentry)

**Phase 2** (Week 3-4): Infrastructure
1. Add database layer (PostgreSQL + Prisma)
2. Implement authentication (NextAuth.js)
3. Add comprehensive logging

**Phase 3** (Week 5-6): Quality
1. Complete test coverage (60%+ target)
2. Add performance monitoring
3. Accessibility audit and fixes

**Phase 4** (Week 7-8): Optimization
1. Bundle size optimization
2. Code splitting improvements
3. Performance tuning

---

## Key Takeaways

1. **Good State**: Most critical bugs fixed, codebase is stable
2. **Main Gaps**: Testing (especially prompts), database, authentication
3. **Quick Wins Available**: Prompt tests, input validation, error standardization
4. **Estimated Effort**: ~80 hours to clear all P1-P2 debt
5. **Not Blocking**: Current debt doesn't prevent feature development

**For Bernard**: Start with "Quick Win 1" (prompt regression tests). This will give you deep understanding of the AI pipeline while delivering high-value testing infrastructure.

**Next**: Read `05-path-to-enterprise/testing-strategy.md` for detailed testing roadmap.
