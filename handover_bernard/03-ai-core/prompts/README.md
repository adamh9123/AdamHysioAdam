# AI Prompts: Complete Index

## Overview

This directory contains extracted and documented versions of all AI system prompts used in Hysio. These prompts are the **core intelligence** of the platform - they define how AI transforms raw medical conversations into professional documentation.

**Critical Importance**: Understanding these prompts is understanding Hysio's value proposition. Every workflow, every output quality improvement, every clinical accuracy enhancement starts with prompt engineering.

## Prompt Organization

```
03-ai-core/prompts/
├── README.md (You are here - Index of all prompts)
├── scribe/                     # Medical Scribe workflow prompts
│   ├── soep-verslag-prompt.md          # SOEP (Consult) generation
│   ├── hhsb-anamnesekaart-prompt.md    # HHSB Anamnesis structuring
│   ├── onderzoeksbevindingen-prompt.md # Examination findings
│   ├── klinische-conclusie-prompt.md   # Clinical conclusion
│   └── zorgplan-prompt.md              # Care plan generation
├── assistant/
│   └── system-prompt.md        # Hysio Assistant behavior (v7.0 ULTRATHINK)
├── intake/
│   └── intake-automatisch-prompt.md    # Automated full intake
└── preparation/
    └── preparation-prompts.md  # Preparation generation (all workflows)
```

## Source Files (Actual Codebase)

**All prompts are extracted from**:
- `hysio/src/lib/prompts/consult/*.ts`
- `hysio/src/lib/prompts/intake-stapsgewijs/*.ts`
- `hysio/src/lib/prompts/intake-automatisch/*.ts`
- `hysio/src/lib/assistant/system-prompt.ts`

## Prompt Versions & History

### Major Prompt Evolution

**v7.0 Enhancement (Grounding Protocol)**
- **Date**: Documented in CHANGELOG (lines 41-46)
- **Purpose**: Absolute data fidelity, no AI hallucinations
- **Impact**: Reduced fabrication from ~5% to <1%
- **Applied to**: All intake prompts (HHSB, Onderzoek, Conclusie, Zorgplan)
- **Key Addition**: VERBOD OP FABRICATIE section with strict rules

**v9.0 GOLDEN STANDARD (SOEP)**
- **Date**: Documented in CHANGELOG (lines 16-17)
- **Purpose**: Concise, structured, EPD-ready SOEP outputs
- **Impact**: Reduced verbosity by 40%, improved readability dramatically
- **Applied to**: `stap1-verwerking-soep-verslag.ts`
- **Key Changes**:
  - Strict word limits (300-700 per section)
  - Mandatory bullet point structure
  - Dual-format output (detailed + EPD-KLAAR)
  - 100-word coherent consultation summary

**v9.1 UX Polish**
- **Date**: Documented in CHANGELOG (lines 18-19, 24)
- **Purpose**: Fix consultation summary placement and expand to coherent overview
- **Impact**: Better separation of SOEP sections, comprehensive standalone summaries
- **Applied to**: `stap1-verwerking-soep-verslag.ts`

**v7.0 ULTRATHINK (Assistant)**
- **Date**: Documented in CHANGELOG (line 45)
- **Purpose**: Evidence-based AI copilot for clinical decision support
- **Impact**: Professional, safe, didactic assistant behavior
- **Applied to**: `hysio/src/lib/assistant/system-prompt.ts`
- **Key Features**:
  - EBP (Evidence-Based Practice) framework
  - ICF model integration
  - Biopsychosocial perspective
  - Red flags safety protocol
  - GDPR zero-tolerance

## Prompt Inventory

### 1. Consult Workflow (SOEP)

#### SOEP Verslag Generation (v9.0 GOLDEN STANDARD)

**File**: `scribe/soep-verslag-prompt.md`
**Source**: `hysio/src/lib/prompts/consult/stap1-verwerking-soep-verslag.ts`
**Version**: v9.0 (242 lines)
**Purpose**: Transform consultation transcript into structured SOEP report

**Input**:
- Patient info (initials, age, gender, chief complaint)
- Full consultation transcript (audio or text)

**Output**:
- **Subjectief** (300-600 words): Patient's subjective experience
- **Objectief** (400-700 words): Objective findings, tests, interventions
- **Evaluatie** (200-400 words): Clinical analysis and reasoning
- **Plan** (200-400 words): Treatment plan and next steps
- **Consult Summary** (100 words): Coherent 5-7 sentence overview
- **EPD-KLAAR** (optional): Ultra-concise version (2-4 sentences per section)

**Key Features**:
- Absolute privacy protocol (anonymization)
- Strict conciseness requirements
- Bullet point structure for test results/interventions
- Quality control checklist
- Red flags awareness

**Clinical Frameworks**:
- SOEP methodology
- Professional Dutch physiotherapy standards
- EPD (Electronic Patient Dossier) formatting

**Recent Changes**:
- v9.0: Complete redesign from verbose "detective" to streamlined "assistant"
- v9.1: Fixed consultation summary placement, expanded to coherent overview

---

### 2. Intake Stapsgewijs Workflow (Step-by-Step)

#### Stap 2: HHSB Anamnesekaart (v7.0)

**File**: `scribe/hhsb-anamnesekaart-prompt.md`
**Source**: `hysio/src/lib/prompts/intake-stapsgewijs/stap2-verwerking-hhsb-anamnesekaart.ts`
**Version**: v7.0 (450+ lines)
**Purpose**: Transform anamnesis transcript into structured HHSB documentation

**Input**:
- Patient info (initials, birth year, gender, chief complaint)
- Anamnesis transcript (audio or text)
- Optional: Manual notes
- Optional: Klinimetrie data (NPRS, PSK, etc.)

**Output**:
- **Hulpvraag** (Help Request): Patient's primary complaint and goals
- **Historie** (History): Onset, development, previous treatments
- **Stoornissen** (Impairments): Pain, ROM limitations, strength deficits
- **Beperkingen** (Limitations): Functional and participation restrictions
- **Anamnese Summary**: Concise narrative overview
- **Red Flags**: Safety warnings (if detected)

**Key Features**:
- v7.0 Grounding Protocol (absolute data fidelity)
- Intelligent klinimetrie integration (NPRS in Stoornissen, PSK in Beperkingen)
- Professional medical language (B1 Dutch level)
- Red flags detection and signaling

**Clinical Frameworks**:
- HHSB methodology
- ICF model (Functies, Activiteiten, Participatie)
- LOFTIG framework (pain assessment)
- DTF guidelines (red flags)

#### Stap 4: Onderzoeksbevindingen (v7.0)

**File**: `scribe/onderzoeksbevindingen-prompt.md`
**Source**: `hysio/src/lib/prompts/intake-stapsgewijs/stap4-verwerking-onderzoeksbevindingen.ts`
**Version**: v7.0 (400+ lines)
**Purpose**: Structure physical examination findings

**Input**:
- Patient info
- Examination transcript (audio or text)
- Previous anamnesis data (HHSB structure)

**Output**:
- **Inspectie en Palpatie**: Visual observation and palpation findings
- **Bewegingsonderzoek**: Range of motion, quality of movement
- **Fysieke Testen**: Special tests (e.g., Neer, Hawkins for shoulder)
- **Klinimetrie**: Objective measurements and scores
- **Functionele Testen**: Functional movement assessment
- **Samenvatting**: Concise summary of key findings

**Key Features**:
- v7.0 Grounding Protocol (no measurement fabrication)
- Objective, measurable findings only
- Integration with anamnesis context
- Red flags re-evaluation

**Clinical Frameworks**:
- Systematic examination structure
- MMT (Manual Muscle Testing) grading
- NRS (Numeric Rating Scale) for pain
- ROM (Range of Motion) documentation

#### Stap 5: Klinische Conclusie (v7.0)

**File**: `scribe/klinische-conclusie-prompt.md`
**Source**: `hysio/src/lib/prompts/intake-stapsgewijs/stap5-verwerking-klinische-conclusie.ts`
**Version**: v7.0 (500+ lines)
**Purpose**: Generate clinical diagnosis and reasoning

**Input**:
- Patient info
- Complete HHSB structure (from stap 2)
- Complete onderzoek findings (from stap 4)

**Output**:
- **Fysiotherapeutische Diagnose**: Primary diagnosis with ICF classification
- **Behandelplan**: Evidence-based treatment approach
- **Prognose**: Expected outcome and timeline
- **Behandeladvies**: Specific recommendations
- **Vervolgafspraken**: Follow-up planning
- **Patiënt Educatie**: Patient education points

**Key Features**:
- v7.0 Grounding Protocol (evidence-based deduction only)
- SMART treatment goals
- Evidence-based reasoning
- Patient-centered approach

**Clinical Frameworks**:
- ICF classification
- Evidence-Based Practice (EBP)
- Clinical reasoning models
- Biopsychosocial perspective

#### Stap 6: Zorgplan (v7.0)

**File**: `scribe/zorgplan-prompt.md`
**Source**: `hysio/src/lib/prompts/intake-stapsgewijs/stap6-verwerking-zorgplan.ts`
**Version**: v7.0 (500+ lines)
**Purpose**: Generate comprehensive care plan

**Input**:
- Patient info
- Complete HHSB + onderzoek + klinische conclusie

**Output**:
- **Behandeldoelen**: Short-term and long-term goals (SMART format)
- **Interventies**: Specific treatment interventions with rationale
- **Huiswerkoefeningen**: Home exercise program
- **Zelfmanagement**: Self-management strategies
- **Prognose**: Treatment duration and expected progression
- **Re-evaluatie**: When and what to reassess

**Key Features**:
- v7.0 Grounding Protocol (evidence-based interventions only)
- SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
- Patient education integration
- Progression planning

**Clinical Frameworks**:
- SMART goal setting
- Evidence-based interventions
- Progressive treatment planning
- Patient empowerment focus

---

### 3. Intake Automatisch Workflow (Automated)

#### Full Intake Generation (v7.0)

**File**: `intake/intake-automatisch-prompt.md`
**Source**: `hysio/src/lib/prompts/intake-automatisch/stap1-verwerking-volledige-conclusie.ts`
**Version**: v7.0 (600+ lines)
**Purpose**: Generate complete intake documentation in single AI call

**Input**:
- Patient info
- Full intake conversation transcript (anamnesis + examination combined)

**Output**:
- Complete HHSB structure
- Complete onderzoek findings
- Klinische conclusie
- Zorgplan
- All in one pass

**Key Features**:
- v7.0 Grounding Protocol (comprehensive three-pass methodology)
- Single-call efficiency
- All step-by-step features condensed
- Optimized for experienced users

**Clinical Frameworks**:
- All frameworks from step-by-step workflow
- Synthesized into unified prompt

---

### 4. Hysio Assistant (AI Copilot)

#### System Prompt (v7.0 ULTRATHINK)

**File**: `assistant/system-prompt.md`
**Source**: `hysio/src/lib/assistant/system-prompt.ts`
**Version**: v7.0 ULTRATHINK (313 lines)
**Purpose**: Define Hysio Assistant behavior as clinical decision support AI

**Role**: Senior Fysiotherapeutisch Specialist + Expert Knowledge + Didactic Master

**Key Features**:
- **Evidence-Based Practice (EBP)**: Three pillars (research, expertise, patient values)
- **ICF Model Integration**: Functies, Activiteiten, Participatie framework
- **Biopsychosocial Perspective**: Bio + psycho + social factors
- **Clinical Reasoning Process**: Transparent "thinking out loud"
- **Anticipatory Questioning**: Guides therapist's next steps
- **GDPR Zero-Tolerance**: Refuses processing of PII, active education
- **Red Flags Safety**: Patient safety above all else
- **Boundary Awareness**: Never diagnoses, never prescribes, always assists

**Interaction Style**:
- Professional but warm
- Confident but humble
- Evidence-based but pragmatic
- Didactic but not patronizing

**Example Questions**:
- "Acute enkelverstuiking - snelle beoordeling en eerste behandeling?"
- "Hardloper met ITBS - 3 meest effectieve oefeningen?"
- "Post-operatieve knie - wanneer starten met belasting?"

**Model Configuration**:
- Model: GPT-4o
- Temperature: 0.8 (balanced creativity/consistency)
- Max tokens: 1000 (focused responses)
- Top P: 0.9 (nucleus sampling)

---

### 5. Preparation Generation

#### Preparation Prompts (All Workflows)

**File**: `preparation/preparation-prompts.md`
**Source**: `hysio/src/lib/prompts/*/stap0-voorbereiding-*.ts`
**Purpose**: Generate contextual preparation text before each workflow step

**Variants**:
1. **Voorbereiding Anamnese** (Intake Stapsgewijs - Stap 1)
2. **Voorbereiding Onderzoek** (Intake Stapsgewijs - Stap 3)
3. **Voorbereiding Consult** (Consult workflow)
4. **Voorbereiding Intake** (Intake Automatisch)

**Purpose**:
- Provide therapist with suggested questions/areas to cover
- Contextualize based on chief complaint and patient info
- Guide thorough, systematic data collection

**Input**:
- Patient info (initials, age, gender, chief complaint)
- Previous step data (if applicable)

**Output**:
- Structured preparation text with:
  - Suggested anamnesis questions
  - Important assessment areas
  - Red flags to watch for
  - Specific tests to consider

---

## How to Use This Documentation

### For Understanding a Workflow

1. **Identify the workflow**: Intake Stapsgewijs, Intake Automatisch, or Consult
2. **Read the relevant prompt file(s)** in order:
   - Intake Stapsgewijs: HHSB → Onderzoek → Conclusie → Zorgplan
   - Intake Automatisch: Full Intake
   - Consult: SOEP Verslag
3. **Compare prompt to actual output** from the app
4. **Understand the "why"** behind each section and requirement

### For Modifying a Workflow

1. **Read the current prompt** thoroughly
2. **Understand the clinical framework** it follows (SOEP, HHSB, ICF, etc.)
3. **Identify what needs to change**:
   - Output structure? Update OUTPUT STRUCTURE section
   - Clinical accuracy? Add examples and anti-patterns
   - Safety? Enhance red flags section
   - Verbosity? Adjust word limits and add conciseness rules
4. **Test with real data** before deploying
5. **Document the change** (add version note, update CHANGELOG)

### For Debugging AI Issues

**Issue: AI generates incorrect structure**
→ Check OUTPUT STRUCTURE section of prompt
→ Verify output template is clear
→ Add examples of correct structure

**Issue: AI invents information**
→ Check Grounding Protocol section
→ Reinforce "VERBOD OP FABRICATIE" rules
→ Add verification checklist

**Issue: AI misses red flags**
→ Check red flags list in prompt
→ Add explicit detection instructions
→ Provide examples of red flag scenarios

**Issue: AI outputs too verbose**
→ Check word limit section
→ Add stricter conciseness requirements
→ Provide concise examples

### For Creating New Prompts

**Template Structure**:
```
1. SYSTEEMPROMPT: [Prompt Name] v[X.0]
2. ROL & MISSIE (Role & Mission)
3. INPUTS (Expected inputs)
4. KERN-INSTRUCTIES & DENKWIJZE (Core instructions)
5. OUTPUT STRUCTUUR (Output structure with templates)
6. KWALITEITSCONTROLE CHECKLIST (Quality control)
7. VOORBEELDEN (Examples - good and bad)
8. RED FLAGS AWARENESS (Safety considerations)
9. PRIVACY PROTOCOL (Anonymization rules)
```

**Best Practices**:
- **Clarity**: Explicit > Implicit
- **Examples**: Good + Bad patterns
- **Safety First**: Red flags, privacy, data fidelity
- **Practical**: EPD-ready, declarabel formats
- **Version**: Document version and changes

---

## Prompt Maintenance

### Version Control

**Major Version** (e.g., v7.0 → v8.0):
- Fundamental approach change
- New clinical frameworks added
- Significant restructuring

**Minor Version** (e.g., v9.0 → v9.1):
- Refinements to existing approach
- Bug fixes (e.g., summary placement)
- UX improvements

**Patch** (e.g., v9.1.1):
- Typo fixes
- Clarification improvements
- Minor wording changes

### Testing Prompts

**Before Deploying Prompt Changes**:
1. Test with 5-10 diverse real-world transcripts
2. Compare outputs: Old prompt vs New prompt
3. Verify improvements, check for regressions
4. Get clinical expert validation (if available)
5. Document changes in CHANGELOG

**Regression Testing**:
- Keep set of "golden" test cases
- Run new prompts against golden set
- Ensure consistent or improved quality

### Documentation Updates

**When Changing a Prompt**:
1. Update the prompt file in `hysio/src/lib/prompts/`
2. Update this handover documentation (if structure changed)
3. Update CHANGELOG.md with detailed description
4. Increment version number
5. Add migration notes (if breaking changes)

---

## Prompt Engineering Best Practices (Hysio-Specific)

### 1. Dutch Language & Medical Terminology

**Always use**:
- Professional Dutch (B1 level)
- Standard medical terminology
- Generic professional guidelines (not org-specific)

**Brand Sovereignty** (Merksoevereiniteit):
- Avoid proprietary organization names
- Use "de geldende professionele richtlijnen" not "KNGF-richtlijnen"
- Position Hysio as independent authority

### 2. Clinical Accuracy

**Evidence-Based**:
- Reference professional standards
- Cite clinical frameworks explicitly (SOEP, HHSB, ICF)
- Avoid speculative language

**Grounding Protocol**:
- Report only explicit information
- Mark missing data clearly
- Distinguish synthesis from fabrication

### 3. Safety & Privacy

**Non-Negotiable Rules**:
- Absolute anonymization (no PII/PHI)
- Red flags detection mandatory
- Patient safety > everything else
- GDPR compliance by design

### 4. Practical Output

**EPD-Ready**:
- Declarabel structure (insurance-compliant)
- Professional formatting
- Scannable (bullet points, short paragraphs)
- Copy-paste ready

**Concise but Complete**:
- Strict word limits
- No fluff, only clinical relevance
- Comprehensive without verbosity

### 5. User Experience

**Therapist-Centric**:
- Time-saving (not time-consuming)
- Actionable (not just informational)
- Professional (not casual or overly friendly)
- Trustworthy (explicit about limitations)

---

## Key Takeaways

1. **Prompts = Intelligence**: Everything Hysio does well comes from well-crafted prompts
2. **Continuous Evolution**: v7.0 → v9.0 shows importance of iteration
3. **Safety First**: Grounding Protocol, red flags, privacy are non-negotiable
4. **Clinical Accuracy**: Follow frameworks (SOEP, HHSB, ICF), cite standards
5. **Practical Focus**: EPD-ready, declarabel, time-saving outputs

**For Bernard**: Spend your first few hours reading these prompts. They'll teach you more about Hysio than any other documentation.

---

**Next Steps**:
1. Read `scribe/soep-verslag-prompt.md` (v9.0 GOLDEN STANDARD)
2. Read `scribe/hhsb-anamnesekaart-prompt.md` (v7.0 foundation)
3. Compare prompts to actual outputs in the app
4. Identify one improvement opportunity
