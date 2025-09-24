# Testing Guide - Hysio Medical Scribe

**Version:** 1.0
**Last Updated:** September 24, 2025
**Test Coverage:** 15%+

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Testing Stack](#testing-stack)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Test Coverage](#test-coverage)
6. [Testing Patterns](#testing-patterns)
7. [Continuous Integration](#continuous-integration)

---

## 1. Testing Philosophy

### Testing Pyramid

```
        ┌─────────────┐
        │   E2E (5%)  │  Playwright (Future)
        └─────────────┘
       ┌────────────────┐
       │ Integration    │  API Routes, Workflows
       │    (25%)       │
       └────────────────┘
    ┌─────────────────────┐
    │    Unit Tests       │  Utils, Hooks, Components
    │      (70%)          │
    └─────────────────────┘
```

### Core Principles

1. **Critical Path First:** Test security, validation, and core workflows
2. **Fast Feedback:** Unit tests run in <1 second
3. **Maintainable:** Tests mirror code structure
4. **Realistic:** Use actual data patterns from production
5. **Isolated:** No external dependencies (mocked APIs)

---

## 2. Testing Stack

### Core Tools

- **Vitest 3.2.4** - Fast unit test runner with native ESM
- **@testing-library/react 16.3.0** - User-centric component testing
- **@testing-library/jest-dom 6.8.0** - Custom DOM matchers
- **jsdom 27.0.0** - Browser environment simulation
- **@vitest/ui 3.2.4** - Interactive test UI
- **@vitest/coverage-v8 3.2.4** - V8 coverage reporting

### Configuration

**`vitest.config.ts`:**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        lines: 15,
        functions: 15,
        branches: 15,
        statements: 15,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**`vitest.setup.ts`:**

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

---

## 3. Running Tests

### Test Scripts

```bash
# Run all tests once
npm test

# Watch mode (TDD)
npm run test:watch

# Coverage report
npm run test:coverage

# Interactive UI
npm run test:ui
```

### Test Output

**Success:**

```
✓ src/lib/utils/__tests__/sanitize.test.ts (18 tests) 45ms
✓ src/lib/utils/__tests__/file-validation.test.ts (15 tests) 32ms
✓ src/lib/utils/__tests__/hhsb-parser.test.ts (17 tests) 28ms
✓ src/components/__tests__/error-boundary.test.tsx (8 tests) 67ms

Test Files  4 passed (4)
     Tests  58 passed (58)
      Time  412ms
```

**Coverage Report:**

```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   18.42 |    15.73 |   16.88 |   18.42 |
 lib/utils            |   72.45 |    68.33 |   75.00 |   72.45 |
  sanitize.ts         |     100 |      100 |     100 |     100 |
  file-validation.ts  |   86.20 |    81.25 |   88.88 |   86.20 |
  hhsb-parser.ts      |   94.73 |    90.00 |     100 |   94.73 |
 components           |   45.83 |    42.10 |   50.00 |   45.83 |
  error-boundary.tsx  |     100 |      100 |     100 |     100 |
----------------------|---------|----------|---------|---------|
```

---

## 4. Writing Tests

### Utility Function Tests

**Example: `sanitize.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { sanitizeHTML, sanitizeText, createSafeHTML } from '../sanitize';

describe('sanitize utilities', () => {
  describe('sanitizeHTML', () => {
    it('removes malicious script tags', () => {
      const dirty = '<p>Hello</p><script>alert("xss")</script>';
      const clean = sanitizeHTML(dirty);

      expect(clean).toContain('<p>');
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('alert');
    });

    it('preserves safe HTML tags', () => {
      const html = '<p><strong>Bold</strong> <em>italic</em></p>';
      const clean = sanitizeHTML(html);

      expect(clean).toContain('<strong>');
      expect(clean).toContain('<em>');
    });
  });
});
```

### Component Tests

**Example: `error-boundary.test.tsx`**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../error-boundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  it('renders fallback UI when error is caught', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/er is een fout opgetreden/i)).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
```

### Hook Tests

**Example: `useWorkflowState.test.ts`**

```typescript
import { renderHook, act } from '@testing-library/react';
import { useWorkflowState } from '../useWorkflowState';

describe('useWorkflowState', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useWorkflowState());
    const [state] = result.current;

    expect(state.currentPhase).toBe('preparation');
    expect(state.completedPhases).toEqual([]);
  });

  it('updates phase correctly', () => {
    const { result } = renderHook(() => useWorkflowState());

    act(() => {
      const [, actions] = result.current;
      actions.setCurrentPhase('anamnesis');
    });

    const [state] = result.current;
    expect(state.currentPhase).toBe('anamnesis');
  });
});
```

### API Route Tests (Integration)

**Example: `preparation.test.ts`**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/preparation/route';

// Mock OpenAI
vi.mock('openai', () => ({
  default: class {
    chat = {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Generated preparation' } }]
        })
      }
    }
  }
}));

describe('POST /api/preparation', () => {
  it('generates preparation content', async () => {
    const request = new Request('http://localhost:3000/api/preparation', {
      method: 'POST',
      body: JSON.stringify({
        chiefComplaint: 'Kniepijn',
        workflowType: 'intake'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.preparation).toBeTruthy();
    expect(data.preparation).toContain('Generated preparation');
  });
});
```

---

## 5. Test Coverage

### Current Coverage (15%+)

**Covered Areas:**

| Category | Coverage | Files |
|----------|----------|-------|
| **Security Utilities** | 100% | `sanitize.ts` |
| **File Validation** | 86% | `file-validation.ts` |
| **HHSB Parser** | 95% | `hhsb-parser.ts` |
| **Error Boundary** | 100% | `error-boundary.tsx` |

**Priority Areas (Next):**

1. **Workflow Errors** - `workflow-errors.ts` (0%)
2. **Document Export** - `document-export.ts` (0%)
3. **Zustand Store** - `scribe-store.ts` (0%)
4. **API Routes** - `/api/*` (0%)

### Coverage Thresholds

**Configured in `vitest.config.ts`:**

```typescript
coverage: {
  thresholds: {
    lines: 15,      // 15% minimum line coverage
    functions: 15,  // 15% minimum function coverage
    branches: 15,   // 15% minimum branch coverage
    statements: 15, // 15% minimum statement coverage
  },
}
```

**Roadmap:**

- **Week 5:** 15% → 25%
- **Week 6:** 25% → 40%
- **Week 7:** 40% → 60%
- **Week 8:** 60% → 80% (production target)

---

## 6. Testing Patterns

### 1. Security Testing

**XSS Protection:**

```typescript
it('blocks XSS attacks', () => {
  const attacks = [
    '<script>alert("xss")</script>',
    '<img src=x onerror="alert(1)">',
    '<a href="javascript:alert(1)">Link</a>',
    '<div onclick="alert(1)">Click</div>',
  ];

  attacks.forEach(attack => {
    const clean = sanitizeHTML(attack);
    expect(clean).not.toContain('script');
    expect(clean).not.toContain('onerror');
    expect(clean).not.toContain('javascript:');
    expect(clean).not.toContain('onclick');
  });
});
```

### 2. File Upload Testing

**Validation Scenarios:**

```typescript
describe('file validation', () => {
  it('rejects oversized files', async () => {
    const largeFile = new File(
      [new Uint8Array(51 * 1024 * 1024)], // 51MB
      'large.mp3',
      { type: 'audio/mp3' }
    );

    const result = await validateAudioFile(largeFile);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('te groot');
  });

  it('detects MIME-extension mismatch', async () => {
    const file = new File(['data'], 'audio.mp3', { type: 'audio/wav' });

    const result = await validateAudioFile(file);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('extensie');
  });
});
```

### 3. Parser Testing

**HHSB Structure Extraction:**

```typescript
it('parses complete HHSB structure', () => {
  const fullText = `
**H - Hulpvraag:**
Pijn in rechter knie

**H - Historie:**
Begonnen na hardlopen

**S - Stoornissen:**
Beperkte flexie

**B - Beperkingen:**
Kan niet hardlopen
  `;

  const result = parseHHSBText(fullText);

  expect(result?.hulpvraag).toContain('rechter knie');
  expect(result?.historie).toContain('hardlopen');
  expect(result?.stoornissen).toContain('Beperkte flexie');
  expect(result?.beperkingen).toContain('niet hardlopen');
});
```

### 4. Error Boundary Testing

**Error Catching:**

```typescript
const ThrowError = () => {
  throw new Error('Test error');
};

it('catches and displays errors', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText(/er is een fout opgetreden/i)).toBeInTheDocument();
  expect(screen.getByText('Test error')).toBeInTheDocument();

  consoleError.mockRestore();
});
```

### 5. Mock Patterns

**Next.js Router:**

```typescript
const mockPush = vi.fn();
const mockRouter = vi.fn(() => ({
  push: mockPush,
  replace: vi.fn(),
  back: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: mockRouter,
}));
```

**Toast Notifications:**

```typescript
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }
}));
```

**OpenAI API:**

```typescript
vi.mock('openai', () => ({
  default: class {
    chat = {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'AI response' } }]
        })
      }
    }
  }
}));
```

---

## 7. Continuous Integration

### GitHub Actions Workflow (Future)

**`.github/workflows/test.yml`:**

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

      - name: Check coverage thresholds
        run: |
          npm run test:coverage -- --coverage.thresholds.lines=15
```

### Pre-commit Hook (Future)

**`.husky/pre-commit`:**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run tests on staged files
npm run test -- --run --changed

# Check coverage doesn't decrease
npm run test:coverage -- --run
```

---

## Best Practices

### DO ✅

1. **Test user-facing behavior, not implementation**
2. **Use descriptive test names:** `it('rejects file exceeding size limit')`
3. **Arrange-Act-Assert pattern:** Setup → Execute → Verify
4. **Mock external dependencies** (APIs, timers, random)
5. **Test error cases** as thoroughly as happy paths
6. **Keep tests isolated** (no shared state)

### DON'T ❌

1. **Test internal implementation details**
2. **Use generic names:** `it('works')`
3. **Share state between tests**
4. **Test framework code** (Next.js, React)
5. **Make tests dependent** on execution order
6. **Ignore warnings** or mock errors

---

## Testing Checklist

**Before Committing:**

- [ ] All tests pass (`npm test`)
- [ ] Coverage doesn't decrease (`npm run test:coverage`)
- [ ] New features have tests (utilities: 80%+, components: 60%+)
- [ ] Edge cases covered (null, empty, invalid input)
- [ ] Error scenarios tested
- [ ] Mocks cleaned up (no console.error leaks)

**Before PR:**

- [ ] Integration tests added for new API routes
- [ ] Component tests for new UI features
- [ ] Security-critical code has 100% coverage
- [ ] Test documentation updated
- [ ] No failing or skipped tests

---

## Resources

### Documentation

- [Vitest Guide](https://vitest.dev/guide/)
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

### Internal Docs

- `/docs/CODE_AUDIT.md` - Testing priorities
- `/docs/ARCHITECTURE.md` - System architecture
- `/docs/WEEK_4_PLAN.md` - Testing roadmap

---

**Document Version:** 1.0
**Last Updated:** September 24, 2025
**Maintained by:** Hysio Development Team