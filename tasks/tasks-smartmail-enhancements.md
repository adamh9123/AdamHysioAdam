# Tasks: SmartMail UI/UX Enhancements & Homepage Redesign

## Relevant Files

- `src/components/smartmail/smartmail-simple.tsx` - Main SmartMail component requiring tone to length replacement and dictation integration
- `src/app/smartmail-simple/page.tsx` - SmartMail simple page requiring recipient type updates and document upload simplification
- `src/lib/smartmail/simple-templates.ts` - Template definitions requiring specialist to huisarts conversion
- `src/lib/smartmail/enums.ts` - Enum definitions requiring specialist to huisarts conversion
- `src/lib/smartmail/validation.ts` - Validation logic requiring specialist to huisarts updates
- `src/lib/smartmail/prompt-engineering.ts` - AI prompts requiring specialist to huisarts updates and length integration
- `src/components/ui/audio-recorder.tsx` - Existing audio recorder component to be integrated into SmartMail context input
- `src/components/ui/document-uploader.tsx` - Document uploader requiring UI text simplification
- `src/app/page.tsx` - Homepage requiring complete redesign with proper module separation
- `src/app/api/smartmail/simple/route.ts` - API route requiring length parameter integration instead of tone
- `src/lib/types/smartmail-simple.ts` - Type definitions requiring length field addition and specialist to huisarts conversion

### Notes

- Audio recording functionality already exists in `src/components/ui/audio-recorder.tsx` and can be leveraged
- Document upload functionality is complete but needs UI text simplification
- Extensive specialist references exist across 15+ files requiring systematic conversion
- Homepage structure needs complete overhaul to separate Intake, Consult, Assistant, SmartMail, and Dashboard

## Tasks

- [x] 1.0 Convert Specialist References to Huisarts Throughout SmartMail System
  - [x] 1.1 Update specialist enum values to huisarts in `src/lib/smartmail/enums.ts`
  - [x] 1.2 Replace specialist types with huisarts in TypeScript interfaces and type definitions
  - [x] 1.3 Update specialist templates to huisarts templates in `src/lib/smartmail/simple-templates.ts`
  - [x] 1.4 Modify specialist validation logic to huisarts in `src/lib/smartmail/validation.ts`
  - [x] 1.5 Update AI prompt engineering references from specialist to huisarts
  - [x] 1.6 Replace specialist UI labels with huisarts in SmartMail components
  - [x] 1.7 Update specialist test cases to huisarts in all test files
  - [x] 1.8 Modify API route specialist handling to huisarts logic

- [x] 2.0 Simplify Document Upload UI Text and Labels
  - [x] 2.1 Change "Context Document (optioneel) - Ultra Think AI" to "Upload Bestand"
  - [x] 2.2 Replace "Voeg verwijzing/document toe" button text with simpler alternative
  - [x] 2.3 Simplify help text from long explanation to concise description
  - [x] 2.4 Update document upload success/error messages to be more user-friendly
  - [x] 2.5 Ensure consistent simplified labeling across both SmartMail pages

- [x] 3.0 Integrate Voice Dictation into SmartMail Context Input
  - [x] 3.1 Add AudioRecorder component import to SmartMail components
  - [x] 3.2 Integrate AudioRecorder into context textarea area of SmartMail forms
  - [x] 3.3 Implement transcription result handling and textarea population
  - [x] 3.4 Add proper state management for recording status in SmartMail workflow
  - [x] 3.5 Style and position AudioRecorder appropriately within SmartMail UI
  - [x] 3.6 Add loading states and error handling for transcription process
  - [x] 3.7 Test audio recording functionality integration in both SmartMail pages

- [x] 4.0 Replace Tone Selection with Email Length Options
  - [x] 4.1 Remove tone state and setter from SmartMail components
  - [x] 4.2 Add email length state with options (kort, gemiddeld, lang)
  - [x] 4.3 Update SmartMail UI to show length selection instead of tone buttons
  - [x] 4.4 Modify API route to accept length parameter instead of tone
  - [x] 4.5 Update AI prompt engineering to incorporate email length requirements
  - [x] 4.6 Update TypeScript interfaces to replace tone field with length field
  - [x] 4.7 Test length-based email generation with different length options

- [x] 5.0 Redesign Homepage with Proper Module Structure
  - [x] 5.1 Create separate navigation sections for each major module
  - [x] 5.2 Replace current Medical Scribe button with "Hysio Intake" button
  - [x] 5.3 Add dedicated "Hysio Consult" button separate from Intake
  - [x] 5.4 Ensure "Hysio Assistant" button navigates correctly
  - [x] 5.5 Update "Hysio SmartMail" button and description
  - [x] 5.6 Keep Dashboard button but improve its positioning and styling
  - [x] 5.7 Redesign grid layout to accommodate 5 separate modules cleanly
  - [x] 5.8 Update homepage copy and descriptions to reflect separate modules
  - [x] 5.9 Test all navigation links to ensure correct routing to respective modules