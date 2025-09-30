# Tasks: Hysio Pre-intake Module Implementation

**Based on**: PRD Hysio Pre-intake Module Generatie.docx
**Document Version**: 1.0
**Generated**: 2025-09-30
**Status**: Complete with Detailed Sub-tasks

---

## Overview

This task list guides the implementation of the Hysio Pre-intake Module, a digital bridge between patients (Hysio Go) and therapists (Hysio Pro). The module enables structured pre-consultation data collection, transforming the intake process by allowing therapists to begin appointments with comprehensive patient context.

**Core Value Proposition**:
- **For Patients (Sanne)**: Guided, asynchronous information submission that makes them feel prepared and heard
- **For Therapists (Martijn)**: 10+ minutes time savings per intake with pre-loaded HHSB-structured patient data
- **For Hysio**: Strategic acquisition tool and seamless ecosystem integration

**Target KPIs**:
- >75% adoption rate (% of patients who start pre-intake after booking)
- >90% completion rate (% of started pre-intakes that are submitted)
- >10 min therapist time savings per intake
- >50 NPS score (patient satisfaction)

---

## Relevant Files

### New Files to Create

**Frontend - Patient Questionnaire (Hysio Go)**
- `hysio/src/app/pre-intake/page.tsx` - Main pre-intake questionnaire landing page
- `hysio/src/app/pre-intake/[sessionId]/page.tsx` - Resume incomplete questionnaire
- `hysio/src/components/pre-intake/QuestionnaireFlow.tsx` - Multi-step form orchestrator with navigation
- `hysio/src/components/pre-intake/BodyMap.tsx` - Interactive SVG body region selector
- `hysio/src/components/pre-intake/ProgressBar.tsx` - Visual progress indicator with step labels
- `hysio/src/components/pre-intake/questions/PersonaliaSection.tsx` - Personal data collection (name, DOB, insurance)
- `hysio/src/components/pre-intake/questions/ComplaintSection.tsx` - LOFTIG framework questions
- `hysio/src/components/pre-intake/questions/RedFlagsSection.tsx` - DTF safety screening
- `hysio/src/components/pre-intake/questions/MedicalHistorySection.tsx` - Previous conditions, medications, surgeries
- `hysio/src/components/pre-intake/questions/GoalsSection.tsx` - SCEGS framework (goals and expectations)
- `hysio/src/components/pre-intake/questions/FunctionalLimitationsSection.tsx` - Participation/activity limitations
- `hysio/src/components/pre-intake/ConsentDialog.tsx` - GDPR consent with clear explanation
- `hysio/src/components/pre-intake/QuestionCard.tsx` - Reusable question container component
- `hysio/src/components/pre-intake/VASScale.tsx` - Pain intensity slider (0-10)

**Backend - API & Processing**
- `hysio/src/app/api/pre-intake/submit/route.ts` - Final submission with consent validation
- `hysio/src/app/api/pre-intake/save-draft/route.ts` - Auto-save progress every 30 seconds
- `hysio/src/app/api/pre-intake/[sessionId]/route.ts` - GET draft, DELETE draft
- `hysio/src/app/api/pre-intake/process-hhsb/route.ts` - Transform raw data to HHSB structure
- `hysio/src/lib/pre-intake/hhsb-mapper.ts` - Core mapping logic from questionnaire to HHSB
- `hysio/src/lib/pre-intake/red-flags-detector.ts` - Rule-based red flags identification
- `hysio/src/lib/pre-intake/nlp-summarizer.ts` - LLM calls for text summarization
- `hysio/src/lib/pre-intake/validation.ts` - Form validation schemas (Zod)
- `hysio/src/lib/pre-intake/consent-manager.ts` - Consent logging with immutable audit trail
- `hysio/src/lib/pre-intake/constants.ts` - Question definitions, body regions, red flags criteria

**Frontend - Therapist Dashboard (Hysio Pro)**
- `hysio/src/app/dashboard/pre-intakes/page.tsx` - List of all pre-intakes with filters
- `hysio/src/app/dashboard/pre-intakes/[id]/page.tsx` - Detailed single pre-intake view
- `hysio/src/components/dashboard/PreIntakeSummaryCard.tsx` - Compact summary with red flag alerts
- `hysio/src/components/dashboard/HHSBAnamneseView.tsx` - Structured HHSB display with collapsible sections
- `hysio/src/components/dashboard/PreIntakeNotificationBadge.tsx` - Real-time notification indicator
- `hysio/src/components/dashboard/ImportToScribeButton.tsx` - One-click import to Scribe
- `hysio/src/components/dashboard/PreIntakeListItem.tsx` - Individual list item with patient info

**State Management & Types**
- `hysio/src/lib/state/pre-intake-store.ts` - Zustand store for questionnaire state, auto-save, progress
- `hysio/src/types/pre-intake.ts` - All TypeScript interfaces: PreIntakeData, QuestionnaireResponse, HHSBStructure, etc.

**Database Schema**
- Migration file for `pre_intake_submissions`, `pre_intake_drafts`, `consent_logs` tables

### Existing Files to Modify

- `hysio/src/lib/state/scribe-store.ts` - Add `importPreIntakeData(preIntakeId: string)` method
- `hysio/src/app/scribe/intake-stapsgewijs/page.tsx` - Add "Importeer Pre-intake" button at top
- `hysio/src/app/scribe/intake-automatisch/page.tsx` - Add "Importeer Pre-intake" button at top
- `hysio/src/app/dashboard/page.tsx` - Add "Recent Pre-intakes" widget showing latest 3 submissions
- `hysio/src/lib/api/groq.ts` - Add `summarizePreIntakeText()` function for NLP processing
- `hysio/src/components/ui/navigation.tsx` - Add pre-intake link if user has therapist role
- `hysio/src/types/api.ts` - Add `PreIntakeResult` type to existing API types

### Test Files

- `hysio/src/lib/pre-intake/__tests__/hhsb-mapper.test.ts` - Unit tests for HHSB mapping logic
- `hysio/src/lib/pre-intake/__tests__/red-flags-detector.test.ts` - Test all red flag scenarios
- `hysio/src/lib/pre-intake/__tests__/validation.test.ts` - Test form validation rules
- `hysio/src/lib/pre-intake/__tests__/consent-manager.test.ts` - Test consent logging
- `hysio/src/app/api/pre-intake/__tests__/submit.test.ts` - API endpoint integration tests
- `hysio/src/components/pre-intake/__tests__/QuestionnaireFlow.test.tsx` - Flow navigation tests
- `hysio/src/components/pre-intake/__tests__/BodyMap.test.tsx` - Body map interaction tests

### Notes

- All new components must follow existing Hysio Brand Style Guide (Mintgroen #A5E1C5, Deep Green, Inter font)
- Patient-facing text must be B1 Dutch language level with empathetic, friendly-professional tone
- All API endpoints require authentication via existing auth middleware
- Rate limiting: 10 requests per minute per session for draft saves
- WCAG 2.2 AA compliance mandatory: keyboard navigation, focus states, color contrast 4.5:1
- End-to-end encryption (TLS 1.3) and NEN7510-compliant data storage
- All timestamps in ISO 8601 format
- Use existing UI components from `@/components/ui` where possible
- Follow existing error handling patterns (try-catch with user-friendly messages)

---

## Tasks

### [ ] 1.0 Database Schema & Backend Infrastructure

**Goal**: Establish the foundational data models, API architecture, and security framework required to store, retrieve, and manage pre-intake submissions with full GDPR/AVG compliance.

- [x] **1.1 Define TypeScript Types and Interfaces**
  - Create `hysio/src/types/pre-intake.ts` with comprehensive type definitions
  - Define `PreIntakeQuestionnaireData` interface matching all question sections (Personalia, Complaint, RedFlags, MedicalHistory, Goals, FunctionalLimitations)
  - Define `HHSBStructuredData` interface with `hulpvraag`, `historie`, `stoornissen`, `beperkingen` properties
  - Define `PreIntakeSubmission` type with metadata (id, sessionId, patientId, therapistId, submittedAt, consentGiven, status)
  - Define `ConsentLogEntry` type with timestamp, ipAddress, userAgent, consentText
  - Add `RedFlag` type with severity levels (emergency, urgent, referral)
  - **Acceptance**: All types exported, properly documented with JSDoc comments, no `any` types

- [ ] **1.2 Design and Create Database Schema**
  - Create migration file for `pre_intake_submissions` table: id (UUID), patient_id, therapist_id, session_id, questionnaire_data (JSONB), hhsb_structured_data (JSONB), red_flags (JSONB array), status (enum: draft/submitted/reviewed), consent_given (boolean), submitted_at, created_at, updated_at
  - Create `pre_intake_drafts` table: id, session_id, questionnaire_data (JSONB), last_saved_at, expires_at (30 days auto-delete)
  - Create `consent_logs` table: id, pre_intake_id, patient_id, consent_given_at, ip_address, user_agent, consent_text (immutable), audit_hash
  - Add indexes: patient_id, therapist_id, session_id, submitted_at, status
  - Ensure NEN7510 compliance: encrypted at rest, EU data residency
  - **Acceptance**: Migration runs successfully, all tables created with proper constraints, indexes verified

- [ ] **1.3 Implement API Authentication and Authorization Middleware**
  - Review existing auth patterns in `hysio/src/app/api/` endpoints
  - Create `hysio/src/lib/middleware/pre-intake-auth.ts` for role-based access (patient can submit/save own, therapist can view assigned)
  - Implement session validation using existing auth system
  - Add therapist-patient relationship verification before data access
  - **Acceptance**: Middleware rejects unauthorized requests with 401/403, allows valid requests, integrates with existing auth

- [ ] **1.4 Set Up Rate Limiting for API Endpoints**
  - Install/configure rate limiting library (e.g., `@upstash/ratelimit` or custom Redis-based)
  - Implement rate limiter for draft auto-save: 10 requests/minute per session
  - Implement rate limiter for submission: 3 requests/hour per patient
  - Add rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining)
  - **Acceptance**: Rate limits enforced, returns 429 when exceeded, headers present in responses

- [ ] **1.5 Create Consent Management System**
  - Implement `hysio/src/lib/pre-intake/consent-manager.ts` with functions: `logConsent()`, `verifyConsent()`, `getConsentHistory()`
  - Generate immutable audit hash (SHA-256) of consent event
  - Create API endpoint `POST /api/pre-intake/consent` to log consent separately
  - Implement consent retrieval for audit purposes
  - **Acceptance**: Consent logged with immutable hash, retrievable for audits, GDPR-compliant logging

- [ ] **1.6 Implement API Error Handling and Logging**
  - Create standardized error response format: `{ success: false, error: string, code: string }`
  - Implement error logging to monitoring service (preserve existing patterns)
  - Add request ID tracking for debugging
  - Create error sanitization (hide sensitive data from logs)
  - **Acceptance**: All API errors return consistent format, sensitive data excluded from logs, request IDs traceable

---

### [ ] 2.0 Patient-Facing Dynamic Questionnaire (Hysio Go)

**Goal**: Build the interactive, multi-step questionnaire interface that guides patients through structured data collection using body maps, sliders, and conditional logic.

- [x] **2.1 Create Pre-intake Zustand Store**
  - Implement `hysio/src/lib/state/pre-intake-store.ts` following existing scribe-store patterns
  - State properties: `currentStep`, `questionnaireData`, `sessionId`, `isDirty`, `lastSavedAt`, `errors`
  - Actions: `setCurrentStep()`, `updateQuestionData()`, `saveProgress()`, `resetQuestionnaire()`, `loadDraft()`
  - Implement auto-save logic: trigger save 30 seconds after last change
  - **Acceptance**: Store persists across page refreshes, auto-save works, integrates with existing patterns

- [ ] **2.2 Build Main Questionnaire Page and Routing**
  - Create `hysio/src/app/pre-intake/page.tsx` as entry point
  - Implement welcome screen with clear explanation (B1 language): "Vul rustig thuis deze vragenlijst in. Uw therapeut bereidt zich zo beter voor."
  - Create `hysio/src/app/pre-intake/[sessionId]/page.tsx` for resuming drafts
  - Generate unique session ID on start, persist in URL
  - Add meta tags for SEO and Open Graph
  - **Acceptance**: Page loads <2s on 3G, generates session ID, resume link works, mobile-responsive

- [ ] **2.3 Implement Multi-Step Form Flow Component**
  - Create `hysio/src/components/pre-intake/QuestionnaireFlow.tsx` as main orchestrator
  - Define step order: Welcome → Personalia → Complaint → RedFlags → MedicalHistory → Goals → FunctionalLimitations → Review → Consent
  - Implement navigation: Next, Back, Save & Exit buttons
  - Add unsaved changes warning (browser beforeunload event)
  - Handle conditional logic: if red flags = high severity, show warning message
  - **Acceptance**: Smooth step transitions, back button preserves data, conditional branches work, unsaved warning triggers

- [x] **2.4 Create Progress Bar Component**
  - Implement `hysio/src/components/pre-intake/ProgressBar.tsx` with step labels
  - Show "Vraag X van Y" or visual progress bar (0-100%)
  - Highlight completed steps with checkmark icon
  - Use Hysio Mintgroen color for progress, Deep Green for text
  - Make it sticky at top on mobile
  - **Acceptance**: Progress updates on step change, visually clear, WCAG AA compliant, mobile-optimized

- [x] **2.5 Build Personalia Section Component**
  - Create `hysio/src/components/pre-intake/questions/PersonaliaSection.tsx`
  - Fields: Naam (text), Geboortedatum (date picker), Telefoonnummer (phone input), Email (email input), Verzekering (dropdown)
  - Pre-fill from existing Hysio Go profile if available
  - Validate all fields (required, format checks)
  - Use existing UI components from `@/components/ui`
  - **Acceptance**: All fields render correctly, validation works, pre-fill from profile, keyboard accessible

- [x] **2.6 Build Complaint Section (LOFTIG Framework)**
  - Create `hysio/src/components/pre-intake/questions/ComplaintSection.tsx`
  - **Locatie (L)**: Integrate BodyMap component (sub-task 2.7)
  - **Ontstaan (O)**: "Hoe is de klacht ontstaan?" (textarea, 500 char limit)
  - **Frequentie (F)**: "Hoe vaak heeft u last?" (dropdown: Constant / Dagelijks / Wekelijks / Af en toe)
  - **Tijdsduur (T)**: "Hoe lang heeft u al last?" (dropdown: < 1 week / 1-4 weken / 1-3 maanden / > 3 maanden)
  - **Intensiteit (I)**: Integrate VASScale component (sub-task 2.8)
  - **Geschiedenis (G)**: "Heeft u deze klacht eerder gehad?" (Yes/No toggle, if Yes: textarea for details)
  - **Acceptance**: All LOFTIG elements present, conditional logic for G works, character limits enforced, B1 language

- [x] **2.7 Build Interactive Body Map Component**
  - Create `hysio/src/components/pre-intake/BodyMap.tsx` using SVG
  - Define clickable regions: Head, Neck, Shoulders (L/R), Arms (L/R), Hands (L/R), Upper back, Lower back, Chest, Abdomen, Hips (L/R), Legs (L/R), Knees (L/R), Ankles (L/R), Feet (L/R)
  - Implement multi-select: patient can click multiple regions
  - Visual feedback: selected regions highlighted in Hysio Mintgroen
  - Front/back body toggle
  - Mobile-friendly touch targets (min 44x44px)
  - **Acceptance**: All regions clickable, multi-select works, visual feedback clear, touch-friendly, WCAG compliant

- [ ] **2.8 Build VAS Pain Scale Slider Component**
  - Create `hysio/src/components/pre-intake/VASScale.tsx` as interactive slider (0-10)
  - Visual indicators: 0 = "Geen pijn" (green), 5 = "Matige pijn" (yellow), 10 = "Ondraaglijke pijn" (red)
  - Large touch target for mobile
  - Show current value prominently
  - Keyboard accessible (arrow keys)
  - **Acceptance**: Slider smooth, value visible, color-coded, keyboard navigable, WCAG AA compliant

- [ ] **2.9 Build Red Flags Screening Section**
  - Create `hysio/src/components/pre-intake/questions/RedFlagsSection.tsx`
  - Implement DTF (Directe Toegang Fysiotherapie) screening questions as Yes/No toggles:
    - "Heeft u onverklaarbaar gewichtsverlies?"
    - "Heeft u last van nachtelijk zweten of koorts?"
    - "Heeft u problemen met plassen of ontlasting?"
    - "Voelt u zich zeer ziek of zwak?"
    - "Heeft u pijn die niet vermindert bij rust?"
    - Add region-specific questions based on BodyMap selection
  - Clear, non-alarming language (B1 level)
  - If any "Yes": show reassuring message "We bespreken dit tijdens uw afspraak"
  - **Acceptance**: All red flag questions present, conditional display works, reassuring tone, no false positives

- [ ] **2.10 Build Medical History Section**
  - Create `hysio/src/components/pre-intake/questions/MedicalHistorySection.tsx`
  - Questions:
    - "Heeft u recente operaties gehad?" (Yes/No + details textarea)
    - "Gebruikt u medicatie?" (Yes/No + list input with add/remove)
    - "Heeft u andere aandoeningen?" (textarea, 1000 char limit)
    - "Rookt u?" (Yes/No/Gestopt)
    - "Gebruikt u alcohol?" (dropdown: Nooit / Soms / Regelmatig)
  - Dynamic list component for medications (add/remove rows)
  - **Acceptance**: All fields functional, list input works, character limits, B1 language, mobile-friendly

- [ ] **2.11 Build Goals Section (SCEGS Framework)**
  - Create `hysio/src/components/pre-intake/questions/GoalsSection.tsx`
  - Questions based on SCEGS (Somatisch, Cognitief, Emotioneel, Gedragsmatig, Sociaal):
    - "Wat hoopt u met fysiotherapie te bereiken?" (textarea, 500 chars)
    - "Wat zijn uw gedachten over de oorzaak?" (textarea, 300 chars)
    - "Hoe beïnvloedt de klacht uw stemming?" (dropdown: Niet / Weinig / Matig / Veel)
    - "Welke activiteiten kunt u niet meer doen?" (textarea, 500 chars)
  - Empathetic microcopy: "Uw antwoorden helpen ons u beter te begrijpen"
  - **Acceptance**: All SCEGS elements covered, empathetic tone, character limits, B1 language

- [ ] **2.12 Build Functional Limitations Section**
  - Create `hysio/src/components/pre-intake/questions/FunctionalLimitationsSection.tsx`
  - Checkbox list of common activities: Werk, Sport, Huishouden, Autorijden, Slapen, Hobby's, Sociale activiteiten
  - "Anders" option with text input
  - For each selected: severity slider (0-10: "Niet beperkt" to "Volledig beperkt")
  - **Acceptance**: Checkboxes work, sliders appear for selected items, "Anders" input functional

- [ ] **2.13 Build Review and Consent Dialog**
  - Create `hysio/src/components/pre-intake/ConsentDialog.tsx` as final step
  - Show summary of all answered questions (read-only, editable via back button)
  - Display clear GDPR consent text (B1 language):
    - "Ik geef toestemming om deze gegevens te delen met [Therapeut Naam]"
    - "Mijn gegevens worden veilig opgeslagen volgens AVG-richtlijnen"
    - Link to privacy policy
  - Mandatory checkbox before submit
  - Submit button disabled until consent checked
  - **Acceptance**: Summary displays all data, consent text clear, checkbox required, submit only when checked, WCAG compliant

- [ ] **2.14 Implement Auto-Save Functionality**
  - Add auto-save trigger in QuestionnaireFlow: debounced 30 seconds after last input change
  - Call `POST /api/pre-intake/save-draft` with sessionId and current questionnaireData
  - Show "Opgeslagen" indicator when save succeeds
  - Handle offline: queue save, retry when online
  - Store lastSavedAt timestamp in state
  - **Acceptance**: Auto-saves after 30s idle, visual feedback, offline handling, no data loss on refresh

- [ ] **2.15 Add Loading States and Error Handling**
  - Implement loading spinners for: page load, draft load, auto-save, submit
  - Error messages for: network failures, validation errors, session expired
  - User-friendly Dutch error messages (B1 level): "Er ging iets mis. Probeer het opnieuw."
  - Retry button for failed saves/submissions
  - **Acceptance**: All async actions have loading states, errors display clearly, retry works, WCAG accessible

- [ ] **2.16 Implement Mobile Optimization and Responsive Design**
  - Test on mobile viewport (375px width minimum)
  - Ensure touch targets ≥ 44x44px
  - Stack form elements vertically on mobile
  - Optimize input types (tel, email, date for native keyboards)
  - Test body map and sliders on touch devices
  - **Acceptance**: All components responsive, touch-friendly, native keyboards appear, no horizontal scroll

---

### [ ] 3.0 Backend Data Processing & HHSB Structuring

**Goal**: Implement the intelligent backend layer that transforms raw patient responses into therapist-ready HHSB-structured anamnesis using NLP/LLM and automated red flags detection.

- [x] **3.1 Create HHSB Mapping Logic**
  - Implement `hysio/src/lib/pre-intake/hhsb-mapper.ts` with core function `mapToHHSB(questionnaireData: PreIntakeQuestionnaireData): HHSBStructuredData`
  - **Hulpvraag** section: Combine Goals data (SCEGS responses)
  - **Historie** section: Combine Complaint data (LOFTIG), Medical History
  - **Stoornissen** section: Extract from Complaint description, pain scores, body regions
  - **Beperkingen** section: Functional Limitations responses
  - Handle missing/incomplete data gracefully (use "Niet ingevuld" placeholders)
  - Add unit tests covering all mappings and edge cases
  - **Acceptance**: Function maps all data correctly, handles missing data, tests pass with >95% coverage

- [x] **3.2 Implement NLP Text Summarization**
  - Create `hysio/src/lib/pre-intake/nlp-summarizer.ts` with function `summarizeText(text: string, maxLength: number): Promise<string>`
  - Integrate with existing Groq API setup (`hysio/src/lib/api/groq.ts`)
  - Create summarization prompt: "Vat de volgende patiëntbeschrijving samen in maximaal [maxLength] woorden, behoud alle klinisch relevante details:"
  - Implement for open-text fields (Ontstaan, Gedachten over oorzaak, Doelen)
  - Add error handling: if LLM fails, return original text (graceful degradation)
  - **Acceptance**: Summaries are concise, preserve key details, handle errors gracefully, async with <2s response time

- [x] **3.3 Build Red Flags Detection System**
  - Implement `hysio/src/lib/pre-intake/red-flags-detector.ts` with function `detectRedFlags(questionnaireData): RedFlag[]`
  - Rule-based detection logic:
    - Any "Yes" in RedFlagsSection → flag with severity from question mapping
    - Age >50 + unexplained weight loss → "Emergency"
    - Night pain + fever → "Urgent"
    - Bladder/bowel dysfunction → "Emergency"
    - Region-specific rules (e.g., chest pain + shortness of breath)
  - Return array of `{ type: string, severity: 'emergency' | 'urgent' | 'referral', description: string }`
  - Create comprehensive test suite with all red flag scenarios
  - **Acceptance**: Detects all defined red flags, correct severity levels, no false negatives, tests cover all scenarios

- [x] **3.4 Create Validation Schemas**
  - Implement `hysio/src/lib/pre-intake/validation.ts` using Zod
  - Define schema for each section: `PersonaliaSchema`, `ComplaintSchema`, etc.
  - Overall schema: `PreIntakeQuestionnaireSchema`
  - Validation rules:
    - Required fields: name, birthdate, pain location, complaint description
    - Format: email, phone, date
    - Length limits: textareas (500-1000 chars)
    - Custom: body map must have ≥1 region selected
  - Export validation function: `validateQuestionnaire(data)`
  - **Acceptance**: All schemas defined, validation catches invalid data, error messages in Dutch (B1), comprehensive tests

- [x] **3.5 Create Draft Save API Endpoint**
  - Implement `hysio/src/app/api/pre-intake/save-draft/route.ts` (POST)
  - Accept: `{ sessionId, questionnaireData (partial), currentStep }`
  - Validate sessionId format (UUID)
  - Upsert to `pre_intake_drafts` table (insert or update based on sessionId)
  - Set `expires_at` to 30 days from now
  - Return: `{ success: true, lastSavedAt: ISO timestamp }`
  - Apply rate limiting (10/min per session)
  - **Acceptance**: Saves draft successfully, upserts correctly, rate limited, returns timestamp, handles errors

- [x] **3.6 Create Draft Retrieval API Endpoint**
  - Implement `hysio/src/app/api/pre-intake/[sessionId]/route.ts` (GET)
  - Fetch draft from database by sessionId
  - Verify draft hasn't expired (delete if expired)
  - Return: `{ success: true, draft: { questionnaireData, currentStep, lastSavedAt } }`
  - Return 404 if not found or expired
  - **Acceptance**: Retrieves existing drafts, handles expired drafts, 404 for missing, auth verified

- [x] **3.7 Create Final Submission API Endpoint**
  - Implement `hysio/src/app/api/pre-intake/submit/route.ts` (POST)
  - Accept: `{ sessionId, questionnaireData (complete), consentGiven: true }`
  - Validate consent = true (reject if false with 400)
  - Validate data completeness using Zod schemas
  - Process data:
    1. Map to HHSB structure
    2. Detect red flags
    3. Summarize open-text fields
  - Insert into `pre_intake_submissions` table with status='submitted'
  - Log consent to `consent_logs` table
  - Delete draft from `pre_intake_drafts`
  - Trigger notification to therapist (future: webhook/email)
  - Return: `{ success: true, submissionId: UUID, redirectUrl: '/pre-intake/success' }`
  - **Acceptance**: Full validation, HHSB processing works, consent logged, draft cleaned up, rate limited (3/hour)

- [x] **3.8 Create HHSB Processing API Endpoint**
  - Implement `hysio/src/app/api/pre-intake/process-hhsb/route.ts` (POST) for therapist use
  - Accept: `{ submissionId }`
  - Verify therapist authorization (assigned to this patient)
  - Retrieve submission from database
  - Return: `{ success: true, hhsbData: HHSBStructuredData, redFlags: RedFlag[] }`
  - Cache processed data to avoid re-processing
  - **Acceptance**: Therapist-only access, returns HHSB structure, caching works, 403 if unauthorized

- [ ] **3.9 Add Comprehensive API Error Handling**
  - Wrap all API endpoints in try-catch
  - Log errors to monitoring system (preserve existing patterns)
  - Return standardized error responses:
    - 400: Validation errors with field-specific messages
    - 401: Unauthorized (missing/invalid auth)
    - 403: Forbidden (insufficient permissions)
    - 404: Resource not found
    - 429: Rate limit exceeded
    - 500: Server error (generic message, detailed log)
  - Add request correlation IDs for debugging
  - **Acceptance**: All errors handled consistently, logs contain correlation IDs, sensitive data excluded

---

### [ ] 4.0 Therapist Dashboard Integration (Hysio Pro)

**Goal**: Create the therapist-facing UI components that display pre-intake summaries, enable detailed review, and provide actionable notifications for new submissions.

- [ ] **4.1 Create Pre-intake List Page**
  - Implement `hysio/src/app/dashboard/pre-intakes/page.tsx`
  - Display table/list of all pre-intakes for this therapist
  - Columns: Patient Name, Submission Date, Status (New/Reviewed), Red Flags (icon), Actions (View button)
  - Filters: Date range, Status, Red flags presence
  - Sort by: Date (newest first default), Patient name
  - Pagination: 20 per page
  - Show badge count for unreviewed submissions
  - **Acceptance**: List loads all submissions, filters work, sorting works, pagination, mobile-responsive

- [ ] **4.2 Build Pre-intake Summary Card Component**
  - Create `hysio/src/components/dashboard/PreIntakeSummaryCard.tsx`
  - Display at-a-glance information:
    - Patient name, age, submission date
    - Primary complaint (1-2 sentences)
    - Pain score (VAS) with visual indicator
    - Body map thumbnail showing affected regions
    - Red flags: prominent visual alert if present (red badge with count)
  - Card design: Hysio Brand Style Guide colors, rounded corners, shadow
  - Clickable to open detailed view
  - **Acceptance**: All key info visible, red flags prominent, visual design matches brand, clickable, WCAG AA

- [ ] **4.3 Build Detailed Pre-intake View Page**
  - Implement `hysio/src/app/dashboard/pre-intakes/[id]/page.tsx`
  - Structured layout with collapsible sections (similar to existing SOEP/HHSB patterns):
    - Patient Info (collapsible)
    - HHSB Anamnesis (expand all by default)
    - Red Flags (always visible if present, highlighted)
    - Raw Responses (collapsible, optional detailed view)
  - Add "Mark as Reviewed" button → changes status to 'reviewed'
  - Add "Import to Scribe" button (sub-task 4.6)
  - Add "Print/Export" dropdown (PDF, TXT)
  - **Acceptance**: All data displays correctly, sections collapsible, mark reviewed works, export works

- [ ] **4.4 Build HHSB Anamnese Display Component**
  - Create `hysio/src/components/dashboard/HHSBAnamneseView.tsx`
  - Display 4 main sections: Hulpvraag, Historie, Stoornissen, Beperkingen
  - Each section: collapsible card with icon, section title, content
  - Format content with proper spacing, bullet points where appropriate
  - Use consistent typography (Inter font, hierarchy from Brand Style Guide)
  - Copy-to-clipboard button for each section
  - **Acceptance**: HHSB structure clear, formatting professional, collapsible, copy buttons work, WCAG compliant

- [ ] **4.5 Implement Notification System**
  - Create `hysio/src/components/dashboard/PreIntakeNotificationBadge.tsx`
  - Show unread count badge in main dashboard navigation
  - Real-time updates (polling every 30s or WebSocket if available)
  - Badge displays number of unreviewed pre-intakes
  - Click badge → navigate to pre-intakes list page
  - Store "last viewed" timestamp to determine "new" submissions
  - **Acceptance**: Badge shows correct count, updates in real-time, clicking navigates, persists across sessions

- [ ] **4.6 Build Import to Scribe Button Component**
  - Create `hysio/src/components/dashboard/ImportToScribeButton.tsx`
  - Button text: "In verslag plaatsen" or "Start Scribe-sessie"
  - On click: call API to fetch HHSB data, populate scribe-store, navigate to Scribe intake page
  - Show loading spinner during import
  - Confirmation dialog: "Pre-intake gegevens worden geïmporteerd. Wilt u doorgaan?"
  - Handle errors: "Import mislukt. Probeer opnieuw."
  - **Acceptance**: Button triggers import, populates scribe store, navigates to scribe, loading state, error handling

- [ ] **4.7 Add Pre-intake Widget to Main Dashboard**
  - Modify `hysio/src/app/dashboard/page.tsx`
  - Add "Recent Pre-intakes" widget showing latest 3 submissions
  - Display: Patient name, submission date, red flag indicator
  - "View All" link → navigate to full pre-intakes list
  - Show placeholder if no pre-intakes: "Geen pre-intakes ontvangen"
  - **Acceptance**: Widget shows latest 3, "View All" works, placeholder displays correctly, responsive

- [ ] **4.8 Implement Export Functionality**
  - Add export methods to `hysio/src/lib/utils/export.ts`:
    - `exportPreIntakePDF()`: Generate PDF with HHSB structure
    - `exportPreIntakeTXT()`: Plain text format
  - Use existing export patterns from SOEP/HHSB exports
  - Include: Patient info, submission date, HHSB sections, red flags
  - Filename: `Pre-intake_[Patient Initials]_[Date].pdf`
  - Trigger download on export button click
  - **Acceptance**: PDF well-formatted, TXT readable, downloads trigger, follows existing patterns

---

### [ ] 5.0 Scribe Workflow Integration & E2E Testing

**Goal**: Integrate pre-intake data as a seamless import source for Hysio Medical Scribe and conduct comprehensive end-to-end testing to validate the complete patient-to-therapist workflow.

- [ ] **5.1 Extend Scribe Store with Pre-intake Import**
  - Modify `hysio/src/lib/state/scribe-store.ts`
  - Add method: `importPreIntakeData(preIntakeId: string): Promise<void>`
  - Method logic:
    1. Fetch pre-intake HHSB data from API
    2. Populate `anamneseData.preparation` with HHSB content
    3. Set `patientInfo` from pre-intake patient data
    4. Mark anamnese step as "pre-filled" (not completed, but has context)
  - Add state property: `preIntakeSource: { id: string, importedAt: string } | null`
  - **Acceptance**: Import method works, populates anamnese data, patient info set, state persisted

- [ ] **5.2 Add Import Button to Intake Stapsgewijs Page**
  - Modify `hysio/src/app/scribe/intake-stapsgewijs/page.tsx`
  - Add "Importeer Pre-intake" button at top of page (before workflow starts)
  - On click: open modal/dialog listing available pre-intakes for selected patient
  - Patient selector: dropdown/search if patient not yet selected
  - Pre-intake list: show submission date, status, red flags
  - Select pre-intake → confirm → call `importPreIntakeData()` → navigate to anamnese step
  - **Acceptance**: Button visible, modal shows pre-intakes, selection imports data, navigates correctly

- [ ] **5.3 Add Import Button to Intake Automatisch Page**
  - Modify `hysio/src/app/scribe/intake-automatisch/page.tsx`
  - Same import button as 5.2 (can extract to shared component)
  - Import pre-intake → populate preparation field with HHSB text
  - Patient info pre-filled
  - User can still add audio recording (pre-intake serves as base context)
  - **Acceptance**: Import button works, HHSB text pre-fills preparation, patient info set, audio still recordable

- [ ] **5.4 Create Import Pre-intake API Endpoint**
  - Implement `hysio/src/app/api/pre-intake/import/[id]/route.ts` (GET)
  - Verify therapist authorization (assigned to this patient)
  - Fetch pre-intake submission with HHSB structured data
  - Return: `{ success: true, patientInfo, hhsbData, redFlags, submittedAt }`
  - Mark pre-intake as "imported" (add imported_at timestamp to DB)
  - **Acceptance**: Returns all data for import, auth verified, imported timestamp updated, 403 if unauthorized

- [ ] **5.5 Show Pre-intake Source Indicator in Scribe**
  - Modify anamnese display in Scribe workflows
  - If `preIntakeSource` is set, show badge: "Geïmporteerd van Pre-intake ([Date])"
  - Add link to view original pre-intake submission
  - Show in preparation section header
  - **Acceptance**: Badge displays when imported, link navigates to pre-intake detail, visual distinction clear

- [ ] **5.6 Write Unit Tests for Core Business Logic**
  - `hysio/src/lib/pre-intake/__tests__/hhsb-mapper.test.ts`:
    - Test all LOFTIG → HHSB mappings
    - Test missing data handling
    - Test edge cases (empty strings, special characters)
  - `hysio/src/lib/pre-intake/__tests__/red-flags-detector.test.ts`:
    - Test all red flag scenarios (emergency, urgent, referral)
    - Test combinations of flags
    - Test false negatives and positives
  - `hysio/src/lib/pre-intake/__tests__/validation.test.ts`:
    - Test all Zod schemas
    - Test invalid data rejection
    - Test partial data validation (for drafts)
  - Target: >90% code coverage for all lib functions
  - **Acceptance**: All tests pass, coverage >90%, no flaky tests

- [ ] **5.7 Write API Integration Tests**
  - `hysio/src/app/api/pre-intake/__tests__/submit.test.ts`:
    - Test successful submission with full data
    - Test rejection without consent
    - Test validation errors
    - Test rate limiting
  - Test draft save/retrieve endpoints
  - Test HHSB processing endpoint
  - Use test database or mocked data
  - **Acceptance**: All API tests pass, auth tested, error cases covered, rate limiting verified

- [ ] **5.8 Write Component Integration Tests**
  - `hysio/src/components/pre-intake/__tests__/QuestionnaireFlow.test.tsx`:
    - Test navigation (next, back)
    - Test data persistence between steps
    - Test conditional logic (red flags branches)
  - `hysio/src/components/pre-intake/__tests__/BodyMap.test.tsx`:
    - Test region selection
    - Test multi-select
    - Test touch/click events
  - Use React Testing Library
  - **Acceptance**: Component tests pass, user interactions tested, accessibility tested

- [ ] **5.9 Conduct End-to-End Testing**
  - Test complete patient flow:
    1. Patient starts pre-intake questionnaire
    2. Fills all sections with test data
    3. Submits with consent
    4. Therapist receives notification
    5. Therapist views pre-intake
    6. Therapist imports to Scribe
    7. Scribe shows pre-filled anamnese
  - Test edge cases:
    - Draft save and resume
    - Multiple red flags
    - Missing optional fields
    - Session expiration
  - Test on: Chrome, Firefox, Safari, Edge
  - Test on mobile: iOS Safari, Android Chrome
  - **Acceptance**: Complete flow works, no breaks, all browsers tested, mobile responsive

- [ ] **5.10 Perform WCAG 2.2 AA Accessibility Audit**
  - Run automated accessibility checker (Axe, Lighthouse)
  - Manual keyboard navigation test: tab through all forms, no keyboard traps
  - Screen reader test: all labels, ARIA attributes correct
  - Color contrast check: all text meets 4.5:1 ratio
  - Focus indicators: clearly visible on all interactive elements
  - Document accessibility statement
  - **Acceptance**: No critical accessibility issues, keyboard navigation works, screen reader compatible, contrast compliant

- [ ] **5.11 Conduct Performance Testing**
  - Test page load times:
    - Questionnaire page: <2s on 3G
    - Dashboard pre-intake list: <1s on 4G
  - Test API response times:
    - Draft save: <500ms
    - Submit: <2s (includes NLP processing)
    - HHSB processing: <1s
  - Test database query performance with 1000+ submissions
  - Test auto-save doesn't degrade UX (no input lag)
  - Use Lighthouse, WebPageTest
  - **Acceptance**: All performance targets met, no blocking operations, smooth UX

- [ ] **5.12 Security Audit and Penetration Testing**
  - Verify end-to-end encryption (TLS 1.3)
  - Test rate limiting effectiveness
  - Test auth bypass attempts (should fail)
  - Test SQL injection prevention (parameterized queries)
  - Test XSS prevention (sanitized inputs)
  - Test CSRF protection
  - Verify NEN7510 compliance (encrypted at rest, EU data residency)
  - Review consent logging (immutable, auditable)
  - **Acceptance**: No security vulnerabilities found, all auth works, data encrypted, compliance verified

- [ ] **5.13 User Acceptance Testing (UAT)**
  - Recruit 3-5 test patients (internal or beta users)
  - Recruit 2-3 test therapists
  - Provide UAT test scenarios
  - Collect feedback on:
    - Questionnaire clarity (B1 language level)
    - Ease of completion
    - Time to complete
    - Therapist dashboard usability
    - Scribe integration smoothness
  - Document feedback and prioritize fixes
  - **Acceptance**: UAT completed, feedback documented, critical issues fixed, NPS-like scores collected

- [ ] **5.14 Create User Documentation**
  - Write patient guide: "Hoe vul ik de Pre-intake in?" (B1 language, screenshots)
  - Write therapist guide: "Pre-intake bekijken en importeren" (workflow screenshots)
  - Add help tooltips in questionnaire (? icon with explanations)
  - Create FAQ section
  - Add privacy policy link (existing policy, ensure pre-intake covered)
  - **Acceptance**: All guides written, tooltips added, FAQ published, links functional

- [ ] **5.15 Final Pre-Launch Checklist**
  - [ ] All parent tasks (1.0-5.0) completed
  - [ ] All tests passing (unit, integration, E2E)
  - [ ] Performance targets met
  - [ ] Security audit passed
  - [ ] WCAG AA compliance verified
  - [ ] UAT feedback addressed
  - [ ] Documentation published
  - [ ] Database migrations tested on staging
  - [ ] Monitoring and logging configured
  - [ ] Rollback plan documented
  - [ ] Launch communication prepared (internal, patients, therapists)
  - **Acceptance**: All checklist items verified, stakeholder sign-off received, ready for production deployment

---

## Implementation Notes

### Development Sequence Recommendation

1. **Phase 1 (Week 1-2)**: Tasks 1.0 (Infrastructure) + 3.1-3.4 (Core logic, no API yet)
2. **Phase 2 (Week 2-3)**: Tasks 2.1-2.8 (Questionnaire UI, basic sections)
3. **Phase 3 (Week 3-4)**: Tasks 2.9-2.16 (Complete questionnaire) + 3.5-3.9 (API endpoints)
4. **Phase 4 (Week 4-5)**: Tasks 4.0 (Therapist dashboard)
5. **Phase 5 (Week 5-6)**: Tasks 5.0 (Integration + Testing)

### Key Dependencies

- Task 2.x depends on 1.1 (types) and 2.1 (store)
- Task 3.5-3.8 depend on 1.2 (database) and 3.1-3.4 (logic)
- Task 4.x depends on 3.8 (HHSB API)
- Task 5.1-5.5 depend on all previous tasks
- Testing (5.6-5.15) should run continuously from Phase 2 onwards

### Testing Strategy

- **Unit tests**: Write alongside implementation (TDD where possible)
- **Integration tests**: After API endpoints complete
- **E2E tests**: After all features complete
- **UAT**: Before production launch

### Deployment Strategy

- **Staging deployment**: After Phase 4 complete
- **Beta release**: Limited therapist group (5-10 practices)
- **Iterate**: Based on beta feedback
- **Production launch**: After UAT and all tests passing

---

**Status**: ✅ Complete - Ready for Implementation

All 5 parent tasks broken down into 62 detailed, actionable sub-tasks with clear acceptance criteria, file references, and implementation guidance.