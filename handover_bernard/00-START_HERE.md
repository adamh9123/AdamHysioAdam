# Welcome to Hysio, Bernard

## Your 5-Minute Orientation

Welcome to the Hysio codebase. This handover package contains everything you need to become productive from day one. Here's your roadmap:

### Quick Facts
- **Product**: AI-powered medical documentation platform for Dutch physiotherapists
- **Tech Stack**: Next.js 15.5, React 19.1, TypeScript 5, Zustand, Groq Whisper, OpenAI GPT-4o
- **Code Quality**: Post-refactor, enterprise-ready (v7.1 on branch `hysio-v7.1`)
- **Total Complexity**: ~40k+ lines of TypeScript, 3 core workflows, 6 AI modules
- **Time to First Deploy**: ~30 minutes (with proper env setup)

### Critical First Steps

**BEFORE YOU CODE:**
1. Read `01-big-picture/product-vision.md` - understand the "why"
2. Read `02-getting-started/setup-guide.md` - get your environment running
3. Review `03-ai-core/README.md` - understand the AI orchestration layer
4. Scan `04-code-deep-dive/api-contracts.md` - grasp the data flows

**YOUR FIRST HOUR PRIORITY LIST:**
```
[ ] Environment setup (Node 18+, dependencies, env vars)
[ ] Read product vision + architecture overview
[ ] Understand the 3 core workflows
[ ] Run dev server and test one workflow end-to-end
[ ] Review all AI prompts in 03-ai-core/prompts/
[ ] Identify one "quick win" from technical-debt.md
```

### The "Holy Trinity" of Hysio

Hysio has **three core clinical workflows**. Everything revolves around these:

1. **Intake Stapsgewijs** (Step-by-Step Intake)
   - File: `hysio/src/app/scribe/intake-stapsgewijs/`
   - Flow: Anamnese → Onderzoek → Klinische Conclusie → Zorgplan
   - Generates: HHSB-structured documentation

2. **Intake Automatisch** (Automated Intake)
   - File: `hysio/src/app/scribe/intake-automatisch/`
   - Flow: Single audio/text input → Full HHSB + clinical conclusion
   - Generates: Complete intake documentation in one step

3. **Consult** (Follow-up Consultation)
   - File: `hysio/src/app/scribe/consult/`
   - Flow: Single consult recording → SOEP report
   - Generates: SOEP (Subjectief, Objectief, Evaluatie, Plan) documentation

**Each workflow has:**
- Preparation step (AI-generated context)
- Audio transcription (Groq Whisper)
- AI processing (OpenAI GPT-4o with workflow-specific prompts)
- Structured output generation
- Export functionality (PDF, DOCX, HTML, TXT)

### The AI Brain: System Prompts

**THE MOST IMPORTANT THING TO UNDERSTAND:**

Hysio's intelligence comes from meticulously crafted system prompts. These are located in:
```
hysio/src/lib/prompts/
├── consult/
│   ├── stap0-voorbereiding-consult.ts
│   └── stap1-verwerking-soep-verslag.ts (v9.0 GOLDEN STANDARD)
├── intake-automatisch/
│   ├── stap0-voorbereiding-intake.ts
│   ├── stap1-verwerking-volledige-conclusie.ts (with v7.0 Grounding Protocol)
│   └── stap2-verwerking-zorgplan.ts
├── intake-stapsgewijs/
│   ├── stap1-voorbereiding-anamnese.ts
│   ├── stap2-verwerking-hhsb-anamnesekaart.ts (v7.0 with Data Fidelity)
│   ├── stap3-voorbereiding-onderzoek.ts
│   ├── stap4-verwerking-onderzoeksbevindingen.ts
│   ├── stap5-verwerking-klinische-conclusie.ts
│   └── stap6-verwerking-zorgplan.ts
└── assistant/
    └── system-prompt.ts (Hysio Assistant v7.0 ULTRATHINK)
```

**Read these prompts first.** They define what Hysio does better than any documentation.

### Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│  USER INPUT (Audio/Text/File)                               │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  TRANSCRIPTION (Groq Whisper Large v3 Turbo)                │
│  Location: hysio/src/lib/api/transcription.ts               │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  API ROUTES (Next.js API Routes)                            │
│  /api/preparation → Preparation generation                   │
│  /api/hhsb/process → HHSB processing                        │
│  /api/soep/process → SOEP processing                        │
│  /api/onderzoek/process → Examination processing            │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  AI ORCHESTRATION (OpenAI GPT-4o)                           │
│  System Prompts + User Data → Structured Clinical Output    │
│  Location: hysio/src/lib/api/openai.ts                      │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  STATE MANAGEMENT (Zustand with Immer + Persist)            │
│  Location: hysio/src/lib/state/scribe-store.ts              │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  UI COMPONENTS (React 19.1 + Tailwind)                      │
│  Location: hysio/src/components/                            │
└─────────────────────────────────────────────────────────────┘
```

### Critical Files You MUST Know

**State Management:**
- `hysio/src/lib/state/scribe-store.ts` - Central Zustand store, controls all workflow state

**AI Core:**
- `hysio/src/lib/api/openai.ts` - OpenAI client configuration
- `hysio/src/lib/api/groq.ts` - Groq transcription client
- `hysio/src/lib/api/transcription.ts` - Audio transcription service

**API Routes (backend):**
- `hysio/src/app/api/preparation/route.ts` - Preparation generation
- `hysio/src/app/api/hhsb/process/route.ts` - HHSB processing
- `hysio/src/app/api/soep/process/route.ts` - SOEP processing

**Type Definitions:**
- `hysio/src/types/api.ts` - All API request/response types

**Workflow Pages (frontend):**
- `hysio/src/app/scribe/intake-stapsgewijs/*` - Step-by-step workflow pages
- `hysio/src/app/scribe/intake-automatisch/*` - Automated workflow pages
- `hysio/src/app/scribe/consult/*` - Consult workflow pages

### Your "Read This First" Checklist

**Essential Reading (Priority 1 - Do Today):**
1. `01-big-picture/product-vision.md` - The "why" behind Hysio
2. `01-big-picture/architecture-overview.md` - System design
3. `02-getting-started/setup-guide.md` - Get running
4. `03-ai-core/ai-pipelines-overview.md` - Understand AI flows
5. `03-ai-core/prompts/README.md` - Index of all prompts
6. `04-code-deep-dive/api-contracts.md` - Data contracts

**Important Reading (Priority 2 - Do This Week):**
7. `01-big-picture/user-lifecycles.md` - User journeys
8. `03-ai-core/llm-orchestration.md` - LLM integration patterns
9. `04-code-deep-dive/state-management.md` - Zustand patterns
10. `04-code-deep-dive/data-models.md` - Type system
11. `04-code-deep-dive/technical-debt.md` - Known issues

**Reference Material (As Needed):**
12. All prompt files in `03-ai-core/prompts/` - Understand each workflow
13. `05-path-to-enterprise/*` - Scaling considerations
14. `07-glossary/*` - Dutch medical terminology

### Top 3 Things Bernard Should Focus On First

Based on codebase analysis, here are your immediate priorities:

**1. Prompt Engineering & AI Safety**
- Location: `hysio/src/lib/prompts/`
- Issue: Recent fixes (v9.0-v9.1) indicate prompt iteration is critical
- Action: Review CHANGELOG for prompt evolution history, understand v7.0 Grounding Protocol
- Impact: This is where 80% of value creation happens

**2. State Management & Navigation**
- Location: `hysio/src/lib/state/scribe-store.ts`
- Issue: Recent "phantom redirect" bugs fixed via state-aware navigation
- Action: Understand `resetWorkflowState()`, workflow isolation, Immer usage
- Impact: Prevents data corruption between workflows

**3. Export Functionality**
- Location: `hysio/src/lib/utils/document-export.ts`
- Recent: Unified export system (Week 4 refactor)
- Action: Review consolidated export logic, understand PDF/DOCX/HTML/TXT generation
- Impact: Critical user-facing feature

### Quick Wins You Can Tackle This Week

From `04-code-deep-dive/technical-debt.md`:

1. **Add Unit Tests for Prompt Utilities** (4 hours)
   - File: `hysio/src/lib/prompts/optimized-prompts.ts`
   - Missing: Test coverage for prompt generation functions
   - Win: Prevent prompt regression

2. **Improve Error Messages** (2 hours)
   - Files: Various API routes
   - Issue: Generic error messages don't help users
   - Win: Better DX and user experience

3. **Document Environment Variables** (1 hour)
   - File: `.env.example` is comprehensive but needs inline docs
   - Win: Faster onboarding for future devs

### Need Help?

**Codebase Questions:**
- Check `07-glossary/dutch-physiotherapy-terms.md` for Dutch medical terminology
- Check `07-glossary/internal-jargon.md` for Hysio-specific terms

**Architecture Questions:**
- See `01-big-picture/architecture-overview.md` for system design
- See `04-code-deep-dive/api-contracts.md` for data flows

**Historical Context:**
- Read `CHANGELOG.md` (at repo root) - comprehensive change history
- Recent critical fixes documented with detailed root cause analysis

### What Makes Hysio Different?

**Brand Identity:**
- "AI colleague, not a replacement"
- Empathetic, efficient, evidence-based
- Dutch-first: All prompts, UI, terminology

**Compliance:**
- AVG/GDPR compliant by design
- NEN 7510/7512/7513 standards
- Medical data handling (PII/PHI protection)
- Privacy-first anonymization in all outputs

**Quality Standards:**
- v9.0 "GOLDEN STANDARD" prompts (concise, structured, professional)
- v7.0 Grounding Protocol (absolute data fidelity, no AI hallucinations)
- Enterprise-level error boundaries and state management

### Final Pro Tips

**For Understanding Hysio Fast:**
1. Run a workflow end-to-end (Intake Stapsgewijs recommended)
2. Enable browser DevTools, watch Network tab during processing
3. Read the AI response from `/api/hhsb/process` in Network tab
4. Compare AI output to the system prompt that generated it
5. You'll understand Hysio's architecture in 15 minutes

**For Contributing Effectively:**
1. Always read the relevant system prompt before touching workflow code
2. Check CHANGELOG.md for recent changes to areas you're working on
3. Test all three workflows when making state management changes
4. Preserve Dutch language and medical terminology accuracy

**For Staying Productive:**
1. Bookmark `03-ai-core/prompts/README.md` - your prompt index
2. Keep `04-code-deep-dive/api-contracts.md` open - your API reference
3. Use `07-glossary/` liberally - Dutch medical terms are complex

### Your Next 30 Minutes

1. **Clone and install** (5 min):
   ```bash
   git clone [repo-url]
   cd hysio
   npm install
   ```

2. **Configure environment** (10 min):
   - Copy `.env.example` to `.env.local`
   - Add `OPENAI_API_KEY` and `GROQ_API_KEY`
   - See `02-getting-started/setup-guide.md` for details

3. **Run dev server** (2 min):
   ```bash
   npm run dev
   ```

4. **Test a workflow** (10 min):
   - Go to http://localhost:3000/scribe
   - Enter patient info
   - Choose "Intake Stapsgewijs"
   - Record or type sample anamnesis
   - Watch the magic happen

5. **Inspect the code** (3 min):
   - Open `hysio/src/app/api/hhsb/process/route.ts`
   - See how API receives request → calls OpenAI → returns response
   - Open `hysio/src/lib/prompts/intake-stapsgewijs/stap2-verwerking-hhsb-anamnesekaart.ts`
   - See the exact prompt that generates that output

Welcome aboard. You're going to build something that genuinely helps people.

— The Hysio Team

---

**Document Structure:**
```
handover_bernard/
├── 00-START_HERE.md (You are here)
├── 01-big-picture/
├── 02-getting-started/
├── 03-ai-core/
├── 04-code-deep-dive/
├── 05-path-to-enterprise/
├── 06-forward-looking/
└── 07-glossary/
```

**Next Steps:**
→ Read `01-big-picture/product-vision.md`
→ Then `02-getting-started/setup-guide.md`
