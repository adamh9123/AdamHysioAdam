# API Contracts: Complete Reference

## Overview

All Hysio API routes are located in `hysio/src/app/api/` and follow Next.js App Router conventions. This document provides complete request/response contracts for every endpoint.

## Type Definitions

**Source**: `hysio/src/types/api.ts`

All API contracts use these TypeScript types. Review the source file for complete definitions.

## Core API Endpoints

### 1. Preparation Generation

**Endpoint**: `POST /api/preparation`

**Purpose**: Generate contextual preparation text before workflow steps

**Request**:
```typescript
{
  workflowType: 'intake-automatisch' | 'intake-stapsgewijs' | 'consult',
  step?: 'preparation' | 'anamnese' | 'onderzoek' | 'klinische-conclusie' | 'consult',
  patientInfo: {
    initials: string,         // e.g., "J.D."
    birthYear: string,        // e.g., "1985"
    gender: 'male' | 'female',
    chiefComplaint: string,   // e.g., "Schouderpijn rechts"
    additionalInfo?: string
  },
  previousStepData?: {
    anamneseResult?: any,
    onderzoekResult?: any
  }
}
```

**Response** (Success - 200):
```typescript
{
  content: string,          // Generated preparation text
  workflowType: string,     // Echo of request
  step?: string,            // Echo of request
  generatedAt: string       // ISO timestamp
}
```

**Response** (Error - 400/500):
```typescript
{
  error: string,            // Error message in Dutch
  details?: string          // Additional error context
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/preparation \
  -H "Content-Type: application/json" \
  -d '{
    "workflowType": "intake-stapsgewijs",
    "step": "anamnese",
    "patientInfo": {
      "initials": "J.D.",
      "birthYear": "1985",
      "gender": "male",
      "chiefComplaint": "Schouderpijn rechts"
    }
  }'
```

---

### 2. HHSB Processing (Intake Workflows)

**Endpoint**: `POST /api/hhsb/process`

**Purpose**: Process intake workflows (both automated and step-by-step)

**Request**:
```typescript
{
  workflowType: string,     // 'intake-automatisch' or 'intake-stapsgewijs'
  step?: string,            // For step-by-step: 'anamnese', 'onderzoek', 'klinische-conclusie', 'zorgplan'
  patientInfo: {
    initials: string,
    birthYear: string,
    gender: 'male' | 'female',
    chiefComplaint: string,
    additionalInfo?: string
  },
  preparation?: string | null,  // Optional preparation text
  inputData: {
    // Audio input
    type: 'recording' | 'file',
    data: Blob | File,
    duration?: number
  } | {
    // Transcribed audio
    type: 'transcribed-audio',
    data: string,                   // Transcript text
    originalSource: 'recording' | 'file',
    duration?: number,
    transcriptionConfidence?: number
  } | {
    // Manual text input
    type: 'manual',
    data: string                    // User-entered text
  },
  previousStepData?: {
    anamneseResult?: any,         // For onderzoek step
    onderzoekResult?: any         // For conclusie/zorgplan steps
  }
}
```

**Response** (Success - 200):
```typescript
{
  hhsbStructure: {
    hulpvraag: string,            // Help request
    historie: string,             // History
    stoornissen: string,          // Impairments
    beperkingen: string,          // Limitations
    anamneseSummary: string,      // Summary
    redFlags: string[],           // Safety warnings
    fullStructuredText: string    // Complete formatted text
  },
  fullStructuredText: string,     // Duplicate for backwards compatibility
  transcript: string,             // Transcribed or provided text
  workflowType: string,
  processedAt: string,            // ISO timestamp
  patientInfo: {
    initials: string,
    age: number,                  // Calculated from birthYear
    gender: string,
    chiefComplaint: string
  },
  redFlagsDetailed?: RedFlagResult[],  // Detailed red flags detection
  redFlagsSummary?: string       // Human-readable summary
}
```

**Processing Time**:
- With transcription: 15-30 seconds
- Without transcription: 5-15 seconds

**File**: `hysio/src/app/api/hhsb/process/route.ts`

---

### 3. SOEP Processing (Consult Workflow)

**Endpoint**: `POST /api/soep/process`

**Purpose**: Process follow-up consultation to generate SOEP report

**Request**:
```typescript
{
  workflowType: 'consult',      // Always 'consult'
  patientInfo: {
    initials: string,
    birthYear: string,
    gender: 'male' | 'female',
    chiefComplaint: string,
    additionalInfo?: string
  },
  preparation?: string | null,
  inputData: {
    // Same structure as HHSB endpoint
    type: 'recording' | 'file' | 'transcribed-audio' | 'manual',
    data: Blob | File | string,
    ...
  }
}
```

**Response** (Success - 200):
```typescript
{
  soepStructure: {
    subjectief: string,           // Subjective (300-600 words)
    objectief: string,            // Objective (400-700 words)
    evaluatie: string,            // Evaluation (200-400 words)
    plan: string,                 // Plan (200-400 words)
    consultSummary: string,       // 100-word coherent summary
    redFlags: string[],
    fullStructuredText: string
  },
  fullStructuredText: string,
  transcript: string,
  workflowType: 'consult',
  processedAt: string,
  patientInfo: {
    initials: string,
    age: number,
    gender: string,
    chiefComplaint: string
  },
  redFlagsDetailed?: RedFlagResult[],
  redFlagsSummary?: string
}
```

**File**: `hysio/src/app/api/soep/process/route.ts`

**Key Differences from HHSB**:
- Output structure: SOEP instead of HHSB
- No step parameter (single-step workflow)
- Optimized for follow-up consultations, not initial intakes

---

### 4. Onderzoek Processing (Examination Step)

**Endpoint**: `POST /api/onderzoek/process`

**Purpose**: Process examination step in step-by-step workflow

**Request**:
```typescript
{
  patientInfo: {
    initials: string,
    birthYear: string,
    gender: 'male' | 'female',
    chiefComplaint: string,
    additionalInfo?: string
  },
  preparation?: string | null,
  inputData: {
    // Same structure as other endpoints
    type: 'recording' | 'file' | 'transcribed-audio' | 'manual',
    data: Blob | File | string,
    ...
  },
  previousStepData: {
    anamneseResult: any         // Required: HHSB structure from anamnesis step
  }
}
```

**Response** (Success - 200):
```typescript
{
  onderzoekResult: {
    inspectieEnPalpatie: string,  // Inspection and palpation
    bewegingsonderzoek: string,   // Movement examination
    fysiekeTesten: string,        // Physical tests
    klinimetrie: string,          // Measurements and scores
    functioneleTesten: string,    // Functional tests
    samenvatting: string,         // Summary
    redFlags: string[]
  },
  transcript: string,
  processedAt: string,
  patientInfo: {
    initials: string,
    age: number,
    gender: string,
    chiefComplaint: string
  }
}
```

**File**: `hysio/src/app/api/onderzoek/process/route.ts`

---

### 5. Audio Transcription

**Endpoint**: `POST /api/transcribe`

**Purpose**: Transcribe audio file to text (used internally by other endpoints)

**Request** (FormData):
```typescript
// FormData with single field:
{
  audio: File  // Audio file (MP3, WAV, M4A, etc.)
}
```

**Response** (Success - 200):
```typescript
{
  transcript: string,     // Transcribed text
  duration?: number       // Audio duration in seconds
}
```

**Response** (Error):
```typescript
{
  error: string
}
```

**File**: `hysio/src/app/api/transcribe/route.ts`

**Note**: This endpoint is typically not called directly by frontend. Other endpoints handle transcription internally.

---

### 6. Hysio Assistant

**Endpoint**: `POST /api/assistant`

**Purpose**: Chat with Hysio Assistant for clinical decision support

**Request**:
```typescript
{
  messages: Array<{
    role: 'user' | 'assistant',
    content: string
  }>,
  conversationId?: string  // Optional, for conversation tracking
}
```

**Response**: Streaming text (Server-Sent Events)

**Example**:
```typescript
// Frontend code
const response = await fetch('/api/assistant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Acute enkelverstuiking - snelle beoordeling?' }
    ]
  })
});

const reader = response.body.getReader();
// Stream response chunks
```

**File**: `hysio/src/app/api/assistant/route.ts`

---

## Error Responses (All Endpoints)

### Standard Error Format

```typescript
{
  error: string,      // User-friendly Dutch error message
  status?: number,    // HTTP status code (redundant but sometimes included)
  details?: string    // Technical details (dev mode only)
}
```

### Common Error Codes

**400 Bad Request**:
- Invalid patient info
- Missing required fields
- Invalid input data type

**500 Internal Server Error**:
- OpenAI API error
- Groq API error
- Parsing failure
- Unexpected server error

**Examples**:
```typescript
// 400 Bad Request
{
  error: "Ongeldige patiëntinformatie. Controleer alle velden."
}

// 500 Internal Server Error
{
  error: "Er is een fout opgetreden bij het verwerken van uw verzoek. Probeer het opnieuw."
}
```

---

## Request/Response Flow

### Complete Flow Example (Intake Stapsgewijs - Anamnesis)

**1. Frontend sends request**:
```typescript
const response = await fetch('/api/hhsb/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workflowType: 'intake-stapsgewijs',
    step: 'anamnese',
    patientInfo: {
      initials: 'J.D.',
      birthYear: '1985',
      gender: 'male',
      chiefComplaint: 'Schouderpijn rechts'
    },
    inputData: {
      type: 'manual',
      data: 'Patiënt meldt schouderpijn rechts sinds 2 weken...'
    }
  })
});
```

**2. Backend processes**:
- Validates request
- Loads system prompt (stap2-verwerking-hhsb-anamnesekaart.ts)
- Calls OpenAI GPT-4o with prompt + input
- Parses AI response into HHSB structure
- Detects red flags
- Returns structured response

**3. Frontend receives**:
```typescript
const data = await response.json();
// data = { hhsbStructure: {...}, transcript: '...', ... }
```

**4. Frontend updates state**:
```typescript
setAnamneseData({
  result: data.hhsbStructure,
  transcript: data.transcript,
  completed: true,
  completedAt: new Date().toISOString()
});
```

---

## API Client Libraries

### OpenAI Client

**File**: `hysio/src/lib/api/openai.ts`

**Configuration**:
```typescript
export const HYSIO_LLM_MODEL = 'gpt-4o';

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function call syntax
export function getOpenAIClient() {
  return openaiClient;
}
```

**Usage**:
```typescript
import { openaiClient, HYSIO_LLM_MODEL } from '@/lib/api/openai';

const response = await openaiClient.chat.completions.create({
  model: HYSIO_LLM_MODEL,
  messages: [...],
  temperature: 0.7,
  max_tokens: 3500,
});
```

### Groq Client

**File**: `hysio/src/lib/api/groq.ts`

**Configuration**:
```typescript
import Groq from 'groq-sdk';

export const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  // Custom fetch to bypass Cloudflare WAF
  fetch: customFetch,
});
```

**Custom Fetch** (Cloudflare WAF bypass):
```typescript
// Adds browser-like headers to avoid bot detection
const customFetch = (url: RequestInfo, init?: RequestInit) => {
  return fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
      'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
      'Accept': 'application/json',
      'Origin': 'https://api.groq.com',
      'Referer': 'https://api.groq.com/',
    },
    duplex: 'half', // Required for Node.js fetch with body
  });
};
```

### Transcription Service

**File**: `hysio/src/lib/api/transcription.ts`

**Function**: `transcribeAudio(audioFile: File | Blob): Promise<{ transcript: string }>`

**Usage**:
```typescript
import { transcribeAudio } from '@/lib/api/transcription';

const audioFile: File = ...;
const result = await transcribeAudio(audioFile);
console.log(result.transcript);
```

**Internal Flow**:
1. Validates audio file
2. Creates FormData with audio file
3. Calls Groq Whisper API via groqClient
4. Returns transcript text

---

## Rate Limiting & Performance

### Current Implementation

**No rate limiting implemented** - relying on API provider limits

**API Provider Limits**:
- **Groq**: ~30 requests/min (free tier)
- **OpenAI**: Depends on account tier (typically 3-10 req/sec)

### Recommended Implementation (Future)

**Rate Limiter** (not yet implemented):
```typescript
// Example using upstash/ratelimit
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
});

// In API route
const { success } = await ratelimit.limit(userId);
if (!success) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
}
```

### Performance Targets

**Current Performance**:
- Transcription: 2-5 seconds per minute of audio
- AI Generation: 5-20 seconds per workflow step
- Total (audio → structured output): 15-30 seconds

**Target Performance** (future optimizations):
- Transcription: <2 seconds per minute
- AI Generation: <5 seconds per step
- Total: <10 seconds for most workflows

---

## Security Considerations

### Authentication

**Current**: No authentication (development phase)

**Future**:
- JWT-based authentication
- Session management (Redis)
- Role-based access control (RBAC)

### Authorization

**Current**: No authorization checks

**Future**:
- User-specific data access
- Therapist-patient relationship verification
- Practice-level permissions

### Data Protection

**Current Implementation**:
- **No PII stored server-side** (all client-side in localStorage)
- **Automatic anonymization** in AI outputs (enforced via prompts)
- **Input sanitization** (XSS protection via DOMPurify)
- **File validation** (type, size, extension matching)

**Environment Variables**:
- API keys stored in `.env.local` (never committed)
- Server-side only (not exposed to client)

---

## Testing API Endpoints

### Manual Testing (cURL)

**Example: Test preparation endpoint**:
```bash
curl -X POST http://localhost:3000/api/preparation \
  -H "Content-Type: application/json" \
  -d '{
    "workflowType": "intake-stapsgewijs",
    "step": "anamnese",
    "patientInfo": {
      "initials": "J.D.",
      "birthYear": "1985",
      "gender": "male",
      "chiefComplaint": "Schouderpijn rechts"
    }
  }'
```

**Example: Test HHSB endpoint with manual text**:
```bash
curl -X POST http://localhost:3000/api/hhsb/process \
  -H "Content-Type: application/json" \
  -d '{
    "workflowType": "intake-stapsgewijs",
    "step": "anamnese",
    "patientInfo": {
      "initials": "J.D.",
      "birthYear": "1985",
      "gender": "male",
      "chiefComplaint": "Schouderpijn rechts"
    },
    "inputData": {
      "type": "manual",
      "data": "Patiënt meldt schouderpijn rechts sinds 2 weken na sportblessure. Pijn vooral bij heffen van arm boven schouderhoogte. NPRS 7/10. Kan niet meer sporten."
    }
  }'
```

### Automated Testing (Vitest)

**Example test** (`hysio/src/app/api/**/*.test.ts`):
```typescript
import { describe, it, expect } from 'vitest';
import { POST } from './route';

describe('/api/hhsb/process', () => {
  it('should process anamnesis with manual input', async () => {
    const request = new Request('http://localhost:3000/api/hhsb/process', {
      method: 'POST',
      body: JSON.stringify({
        workflowType: 'intake-stapsgewijs',
        step: 'anamnese',
        patientInfo: { /* ... */ },
        inputData: { type: 'manual', data: '...' }
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.hhsbStructure).toBeDefined();
    expect(data.hhsbStructure.hulpvraag).toBeTypeOf('string');
  });
});
```

---

## API Documentation Tools

### Swagger/OpenAPI (Future)

**Not currently implemented**, but prepared for:

**Configuration** (`.env`):
```env
ENABLE_SWAGGER_UI=true  # Enable API docs in dev mode
```

**Access**: http://localhost:3000/api-docs (when implemented)

### Postman Collection (Recommended)

**Create Postman collection** with:
- All endpoints documented above
- Example requests for each workflow
- Environment variables for API keys
- Pre-request scripts for authentication (when implemented)

---

## Key Takeaways

1. **All APIs are Next.js API routes** - serverless-ready
2. **Three main processing endpoints**: `/api/preparation`, `/api/hhsb/process`, `/api/soep/process`
3. **Unified input structure**: `inputData` supports audio, transcribed audio, or manual text
4. **Structured outputs**: HHSB for intakes, SOEP for consults
5. **No authentication yet** - prepared for future JWT-based auth
6. **Performance**: 15-30 seconds typical processing time
7. **Error handling**: User-friendly Dutch error messages
8. **Testing**: Manual (cURL) and automated (Vitest) options available

**For Bernard**: Test each endpoint manually with cURL before diving into the frontend code. Understanding the API contracts is essential for debugging and extending workflows.

**Next**: Read `state-management.md` to understand how API responses flow into application state.
