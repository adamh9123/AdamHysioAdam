# Week 4 Plan - Code Quality & Testing Foundation

**Datum:** 24 September 2025
**Status:** Week 1-3 Complete (Grade A - 95/100)
**Doel:** Code quality improvements + Testing infrastructure setup

---

## 📊 Huidige Status

### Codebase Metrics
- **Total Files:** 226 TypeScript files
- **Total Lines:** 73,460 lines
- **Exported Functions:** 319
- **Exported Types:** 421
- **Try-Catch Blocks:** 237 (96% error coverage)
- **Test Coverage:** ~8%

### Largest Files (Refactor Candidates)
1. `new-intake-workflow.tsx` - 2,640 lines ⚠️
2. `streamlined-intake-workflow.tsx` - 1,014 lines ⚠️
3. `error-handling.ts` (smartmail) - 845 lines
4. `session-export.ts` - 834 lines
5. `openai.ts` - 830 lines

---

## 🎯 Week 4 Objectives

### 1. Code Quality Improvements (3 dagen)

#### Day 1: Extract Duplicated Patterns
**Target:** Reduce duplication in large workflow files

**Actions:**
- [ ] Extract common workflow patterns from `new-intake-workflow.tsx`
- [ ] Create shared workflow hooks (useWorkflowNavigation, useWorkflowState)
- [ ] Extract common form validation logic
- [ ] Create reusable error handling utilities

**Expected Impact:**
- -500 lines from largest files
- 30% reduction in code duplication
- Improved maintainability

#### Day 2: Utility Consolidation
**Target:** Centralize common utility functions

**Actions:**
- [ ] Audit all utility files for duplication
- [ ] Consolidate export utilities (session-export, soep-export)
- [ ] Create unified error handling utilities
- [ ] Extract common data transformation functions

**Expected Impact:**
- Single source of truth for utilities
- Easier to test
- Reduced bundle size

#### Day 3: ESLint Enhancement
**Target:** Enforce code quality standards

**Actions:**
- [ ] Add custom ESLint rules for project patterns
- [ ] Configure no-duplicate-imports
- [ ] Add complexity limits (max-lines, max-depth)
- [ ] Enable strict TypeScript checking rules

**Expected Impact:**
- Automated code quality enforcement
- Prevention of anti-patterns
- Consistent code style

---

### 2. Testing Infrastructure (2 dagen)

#### Day 4: Test Setup & Configuration
**Target:** Establish testing foundation

**Actions:**
- [ ] Install Vitest + React Testing Library
- [ ] Configure test environment
- [ ] Create test utilities and helpers
- [ ] Setup coverage reporting
- [ ] Add test scripts to package.json

**Configuration:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  }
}
```

#### Day 5: Initial Test Coverage
**Target:** 15% coverage (from 8%)

**Priority Test Areas:**
1. **Utilities** (easiest, highest value)
   - [ ] `lib/utils/sanitize.ts` - XSS protection
   - [ ] `lib/utils/file-validation.ts` - Security validation
   - [ ] `lib/utils/performance.ts` - Performance utils

2. **Critical Components**
   - [ ] `components/error-boundary.tsx` - Error handling
   - [ ] `components/ui/button.tsx` - Basic UI
   - [ ] `lib/state/scribe-store.ts` - State management

3. **API Routes** (integration tests)
   - [ ] `/api/hhsb/process` - Core processing
   - [ ] `/api/preparation` - Caching test

**Test Examples:**

```typescript
// lib/utils/sanitize.test.ts
import { describe, it, expect } from 'vitest';
import { sanitizeHTML } from './sanitize';

describe('sanitizeHTML', () => {
  it('removes malicious script tags', () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script>';
    const clean = sanitizeHTML(dirty);
    expect(clean).toBe('<p>Hello</p>');
    expect(clean).not.toContain('<script>');
  });

  it('preserves safe HTML tags', () => {
    const html = '<p><strong>Bold</strong> <em>italic</em></p>';
    const clean = sanitizeHTML(html);
    expect(clean).toContain('<strong>');
    expect(clean).toContain('<em>');
  });
});
```

```typescript
// components/error-boundary.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './error-boundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  it('renders fallback UI on error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/er is iets misgegaan/i)).toBeInTheDocument();
  });

  it('calls onError callback', () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
  });
});
```

---

### 3. Documentation Improvements (1 dag)

#### Day 6: Enhanced Documentation
**Target:** Improve developer onboarding

**Actions:**
- [ ] Create ARCHITECTURE.md with system diagrams
- [ ] Document testing guidelines
- [ ] Create CONTRIBUTING.md
- [ ] Update README.md with testing instructions
- [ ] Add JSDoc comments to complex functions

**Deliverables:**
- Architecture overview document
- Testing guide for developers
- Contribution guidelines
- API documentation stubs

---

## 📈 Success Metrics

### Code Quality
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **Duplicate Code** | ~20% | <10% | 🎯 |
| **Largest File** | 2,640 lines | <1,500 lines | 🎯 |
| **ESLint Errors** | Unknown | 0 | 🎯 |
| **Code Complexity** | High | Medium | 🎯 |

### Testing
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **Test Coverage** | 8% | 15% | 🎯 |
| **Unit Tests** | ~10 | 30+ | 🎯 |
| **Integration Tests** | 0 | 5+ | 🎯 |
| **Component Tests** | 2 | 10+ | 🎯 |

### Documentation
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **Architecture Docs** | 0 | 1 | 🎯 |
| **Test Docs** | 0 | 1 | 🎯 |
| **API Docs** | Partial | Complete | 🎯 |
| **JSDoc Coverage** | ~10% | 30% | 🎯 |

---

## 🚀 Implementation Strategy

### Phase 1: Code Quality (Days 1-3)
1. **Morning:** Identify duplication patterns
2. **Afternoon:** Extract and refactor
3. **Evening:** Test and validate

### Phase 2: Testing (Days 4-5)
1. **Morning:** Setup infrastructure
2. **Afternoon:** Write tests
3. **Evening:** Coverage analysis

### Phase 3: Documentation (Day 6)
1. **Morning:** Write architecture docs
2. **Afternoon:** Testing guides
3. **Evening:** Final polish and commit

---

## 📦 Deliverables

### Code Artifacts
- [ ] `lib/hooks/useWorkflowCommon.ts` - Shared workflow logic
- [ ] `lib/utils/workflow-helpers.ts` - Common workflow utilities
- [ ] `lib/utils/error-utils.ts` - Unified error handling
- [ ] Enhanced ESLint configuration
- [ ] 20+ new test files

### Documentation
- [ ] `ARCHITECTURE.md` - System architecture
- [ ] `TESTING.md` - Testing guidelines
- [ ] `CONTRIBUTING.md` - Contribution guide
- [ ] Updated `README.md`
- [ ] `REFACTOR_WEEK_4_SUMMARY.md`

### Configuration
- [ ] Vitest configuration
- [ ] Test coverage thresholds
- [ ] Enhanced ESLint rules
- [ ] CI/CD test integration

---

## 🎯 Expected Outcomes

**After Week 4:**
- Code Quality: A (95) → **A+ (98)**
- Test Coverage: 8% → **15%**
- Code Duplication: -50%
- Developer Experience: Significantly improved
- Maintainability: Enhanced with better structure

**Long-term Benefits:**
- Faster onboarding for new developers
- Reduced bugs through testing
- Better code quality enforcement
- Easier refactoring in future
- Production-ready codebase

---

## 🔄 Next Steps (Week 5+)

1. **Week 5:** Increase test coverage to 25%+
2. **Week 6:** Performance optimization round 2
3. **Week 7:** Production monitoring setup (Sentry)
4. **Week 8:** Final polish and deployment preparation

---

**Week 4 Start:** ✅ Ready to begin!
**Estimated Duration:** 6 working days
**Risk Level:** Low (non-breaking changes)
**Dependencies:** None (all prerequisites complete)