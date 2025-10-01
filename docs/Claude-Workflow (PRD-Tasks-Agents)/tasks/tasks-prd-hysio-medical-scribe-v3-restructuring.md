# Task List: Hysio Medical Scribe v3 Complete Application Restructuring

Based on PRD: `prd-hysio-medical-scribe-v3-restructuring.md`

## Relevant Files

### Core Application Architecture
- `src/app/scribe/page.tsx` - Main scribe page requiring complete restructuring for multi-page architecture
- `src/app/scribe/workflow/page.tsx` - New workflow selection hub (to be created)
- `src/app/scribe/intake-automatisch/page.tsx` - Automated intake workflow page (to be created)
- `src/app/scribe/intake-automatisch/conclusie/page.tsx` - Automated intake results page (to be created)
- `src/app/scribe/intake-stapsgewijs/anamnese/page.tsx` - Step-by-step anamnesis page (to be created)
- `src/app/scribe/intake-stapsgewijs/onderzoek/page.tsx` - Step-by-step examination page (to be created)
- `src/app/scribe/intake-stapsgewijs/klinische-conclusie/page.tsx` - Step-by-step clinical conclusion page (to be created)
- `src/app/scribe/consult/page.tsx` - Follow-up consultation workflow page (to be created)
- `src/app/scribe/consult/soep-verslag/page.tsx` - SOEP report results page (to be created)
- `src/app/scribe/layout.tsx` - Scribe section layout with shared navigation (to be created)

### Enhanced Components
- `src/components/scribe/patient-info-form.tsx` - Requires enhancement with context information and field updates
- `src/components/scribe/workflow-selection-hub.tsx` - New central workflow selection component (to be created)
- `src/components/scribe/automated-intake-workflow.tsx` - Dedicated automated intake component (to be created)
- `src/components/scribe/stepwise-anamnesis.tsx` - Step-by-step anamnesis component (to be created)
- `src/components/scribe/stepwise-examination.tsx` - Step-by-step examination component (to be created)
- `src/components/scribe/stepwise-clinical-conclusion.tsx` - Step-by-step clinical conclusion component (to be created)
- `src/components/scribe/followup-consultation.tsx` - Follow-up consultation component (to be created)
- `src/components/scribe/soep-report-display.tsx` - SOEP report display component (to be created)
- `src/components/scribe/preparation-panel.tsx` - Reusable preparation display component (to be created)
- `src/components/scribe/results-display.tsx` - Enhanced results display with HHSB formatting (to be created)
- `src/components/scribe/export-panel.tsx` - Advanced export functionality component (to be created)

### Navigation and UI Components
- `src/components/ui/workflow-progress-indicator.tsx` - Progress tracking for multi-step workflows (to be created)
- `src/components/ui/workflow-breadcrumbs.tsx` - Breadcrumb navigation component (to be created)
- `src/components/ui/workflow-stepper.tsx` - Enhanced stepper component for step-by-step workflows
- `src/components/ui/collapsible-section.tsx` - Enhanced collapsible sections with edit/copy functionality

### State Management and Hooks
- `src/hooks/useWorkflowNavigation.ts` - Custom hook for workflow navigation and URL management (to be created)
- `src/hooks/useWorkflowState.ts` - Enhanced workflow state management (to be created)
- `src/hooks/usePreparationGeneration.ts` - Hook for preparation document generation (to be created)
- `src/hooks/useHHSBProcessing.ts` - Hook for HHSB methodology processing (to be created)
- `src/hooks/useSOEPProcessing.ts` - Hook for SOEP methodology processing (to be created)

### Types and Utilities
- `src/lib/types/workflows.ts` - Enhanced workflow type definitions (to be created)
- `src/lib/types/hhsb.ts` - HHSB methodology types (to be created)
- `src/lib/types/soep.ts` - SOEP methodology types (to be created)
- `src/lib/utils/workflow-routing.ts` - Workflow URL routing utilities (to be created)
- `src/lib/utils/preparation-loader.ts` - Utility for loading preparation documents (to be created)
- `src/lib/utils/hhsb-processor.ts` - HHSB data processing utilities (to be created)
- `src/lib/utils/export-manager.ts` - Enhanced export functionality (to be created)

### API Routes and Services
- `src/app/api/preparation/route.ts` - API for preparation document generation (to be created)
- `src/app/api/hhsb/process/route.ts` - API for HHSB data processing (to be created)
- `src/app/api/soep/process/route.ts` - API for SOEP data processing (to be created)
- `src/app/api/export/advanced/route.ts` - Enhanced export API (to be created)

### Test Files
- `src/components/scribe/workflow-selection-hub.test.tsx` - Unit tests for workflow selection
- `src/components/scribe/automated-intake-workflow.test.tsx` - Unit tests for automated intake
- `src/hooks/useWorkflowNavigation.test.ts` - Unit tests for navigation hook
- `src/lib/utils/hhsb-processor.test.ts` - Unit tests for HHSB processing
- `src/lib/utils/export-manager.test.ts` - Unit tests for export functionality

### Configuration and Documentation
- `docs/preparation-documents/` - Directory for preparation document templates
- `src/lib/constants/workflow-config.ts` - Workflow configuration constants (to be created)
- `src/lib/constants/hhsb-config.ts` - HHSB methodology configuration (to be created)

### Notes

- Unit tests should be placed alongside their corresponding components and utilities
- Use `npx jest [optional/path/to/test/file]` to run tests
- All new pages should follow Next.js App Router conventions
- Maintain existing Hysio brand styling throughout new components
- Ensure proper TypeScript typing for all new code

## Tasks

- [ ] 1.0 Transform Application Architecture from Single-Page to Multi-Page with URL Routing
  - [ ] 1.1 Create new App Router structure for scribe section with nested routes
  - [ ] 1.2 Create `src/app/scribe/layout.tsx` with shared navigation and state management
  - [ ] 1.3 Update `src/app/scribe/page.tsx` to redirect to patient info collection
  - [ ] 1.4 Create `src/hooks/useWorkflowNavigation.ts` for URL-based navigation management
  - [ ] 1.5 Create `src/hooks/useWorkflowState.ts` for persistent state across page navigation
  - [ ] 1.6 Create `src/lib/utils/workflow-routing.ts` with route generation and validation utilities
  - [ ] 1.7 Create `src/lib/types/workflows.ts` with comprehensive workflow type definitions
  - [ ] 1.8 Update existing session state management to work with multi-page architecture
  - [ ] 1.9 Implement browser back/forward button support for workflow navigation
  - [ ] 1.10 Add route-based code splitting for optimized loading performance

- [ ] 2.0 Create Central Workflow Selection Hub and Enhanced Patient Information Page
  - [ ] 2.1 Enhance `src/components/scribe/patient-info-form.tsx` with contextual information about Hysio Medical Scribe
  - [ ] 2.2 Update patient info form to mark "Hoofdklacht" as required (remove "optioneel" label)
  - [ ] 2.3 Change patient info form submission button text from "Ga verder naar intake workflow" to "Ga verder"
  - [ ] 2.4 Add form validation to prevent progression without required fields
  - [ ] 2.5 Create `src/app/scribe/workflow/page.tsx` for central workflow selection
  - [ ] 2.6 Create `src/components/scribe/workflow-selection-hub.tsx` with three workflow options
  - [ ] 2.7 Design comprehensive workflow descriptions explaining purpose, duration, and use cases
  - [ ] 2.8 Implement workflow selection routing to appropriate URLs (automated, step-by-step, follow-up)
  - [ ] 2.9 Add Hysio brand styling and responsive design to workflow selection hub
  - [ ] 2.10 Create `src/components/scribe/workflow-selection-hub.test.tsx` with comprehensive test coverage

- [ ] 3.0 Implement Automated Intake Workflow with Dedicated Pages
  - [ ] 3.1 Create `src/app/scribe/intake-automatisch/page.tsx` for automated intake input
  - [ ] 3.2 Create `src/components/scribe/automated-intake-workflow.tsx` with single-step processing
  - [ ] 3.3 Implement optional intake preparation generation based on patient information
  - [ ] 3.4 Create `src/lib/utils/preparation-loader.ts` to load preparation documents from file system
  - [ ] 3.5 Integrate preparation logic from "Stap 0 - Hysio Intake Automatisch - Voorbereiding Intake.txt"
  - [ ] 3.6 Create `src/app/api/preparation/route.ts` for preparation document generation
  - [ ] 3.7 Implement audio recording, file upload, and manual notes input for automated workflow
  - [ ] 3.8 Create `src/app/scribe/intake-automatisch/conclusie/page.tsx` for results display
  - [ ] 3.9 Create `src/components/scribe/results-display.tsx` with HHSB-formatted output
  - [ ] 3.10 Ensure all result sections are collapsible, copyable, and editable
  - [ ] 3.11 Add proper error handling and loading states for automated processing
  - [ ] 3.12 Create unit tests for automated intake workflow components

- [ ] 4.0 Implement Step-by-Step Intake Workflow with Multi-Page Navigation
  - [ ] 4.1 Create `src/app/scribe/intake-stapsgewijs/anamnese/page.tsx` for anamnesis step
  - [ ] 4.2 Create `src/components/scribe/stepwise-anamnesis.tsx` with preparation generation
  - [ ] 4.3 Integrate anamnesis preparation logic from "Stap 1 - Hysio Intake Stapsgewijs - Voorbereiding Anamnese.txt"
  - [ ] 4.4 Implement HHSB-structured anamnesis card generation after processing
  - [ ] 4.5 Create `src/app/scribe/intake-stapsgewijs/onderzoek/page.tsx` for examination step
  - [ ] 4.6 Create `src/components/scribe/stepwise-examination.tsx` with examination preparation
  - [ ] 4.7 Integrate examination preparation logic from "Stap 3 - Hysio Intake Stapsgewijs - Onderzoeksvoorbereiding.txt"
  - [ ] 4.8 Implement examination findings generation based on anamnesis results
  - [ ] 4.9 Create `src/app/scribe/intake-stapsgewijs/klinische-conclusie/page.tsx` for clinical conclusion
  - [ ] 4.10 Create `src/components/scribe/stepwise-clinical-conclusion.tsx` integrating all previous data
  - [ ] 4.11 Integrate clinical conclusion logic from "Stap 5 - Hysio Intake Stapsgewijs - Klinische Conclusie.txt"
  - [ ] 4.12 Create `src/components/ui/workflow-progress-indicator.tsx` for step tracking
  - [ ] 4.13 Implement navigation between steps with progress preservation
  - [ ] 4.14 Add ability to return to previous completed steps for review/editing
  - [ ] 4.15 Create comprehensive test suite for step-by-step workflow

- [ ] 5.0 Implement Follow-up Consultation Workflow with SOEP Methodology
  - [ ] 5.1 Create `src/app/scribe/consult/page.tsx` for follow-up consultation input
  - [ ] 5.2 Create `src/components/scribe/followup-consultation.tsx` with SOEP methodology
  - [ ] 5.3 Create `src/lib/types/soep.ts` with SOEP structure type definitions
  - [ ] 5.4 Create `src/hooks/useSOEPProcessing.ts` for SOEP data processing
  - [ ] 5.5 Implement consultation preparation generation from "Stap 0 - Hysio Consult - Voorbereiding Consult.txt"
  - [ ] 5.6 Create `src/app/api/soep/process/route.ts` for SOEP data processing
  - [ ] 5.7 Implement audio recording, file upload, and manual notes for consultation workflow
  - [ ] 5.8 Create `src/app/scribe/consult/soep-verslag/page.tsx` for SOEP report display
  - [ ] 5.9 Create `src/components/scribe/soep-report-display.tsx` with structured SOEP documentation
  - [ ] 5.10 Implement two-panel UI design (input right, preparation left) for consultation page
  - [ ] 5.11 Add export options (HTML, TXT, DOCX, PDF) for SOEP reports
  - [ ] 5.12 Create unit tests for SOEP workflow and processing logic

- [ ] 6.0 Transform Documentation Standards from PHSB to HHSB Throughout Application
  - [ ] 6.1 Create `src/lib/types/hhsb.ts` with HHSB methodology type definitions
  - [ ] 6.2 Create `src/lib/utils/hhsb-processor.ts` for HHSB data processing and formatting
  - [ ] 6.3 Create `src/hooks/useHHSBProcessing.ts` for HHSB processing logic
  - [ ] 6.4 Create `src/app/api/hhsb/process/route.ts` for HHSB data processing API
  - [ ] 6.5 Update all existing PHSB references to HHSB throughout the codebase
  - [ ] 6.6 Update PHSB structure (Patiëntbehoeften → Hulpvraag, Historie, Stoornissen, Beperkingen)
  - [ ] 6.7 Remove all references to "FysioRoadmap" from the application
  - [ ] 6.8 Update documentation generation logic to use HHSB methodology
  - [ ] 6.9 Update existing components to display HHSB format instead of PHSB
  - [ ] 6.10 Create migration utilities for existing PHSB data to HHSB format
  - [ ] 6.11 Update all preparation documents and prompts to reference HHSB
  - [ ] 6.12 Create comprehensive test suite for HHSB processing and validation

- [ ] 7.0 Implement Advanced Export Functionality and UI Polish
  - [ ] 7.1 Create `src/components/scribe/export-panel.tsx` with multiple format options
  - [ ] 7.2 Create `src/lib/utils/export-manager.ts` for advanced export functionality
  - [ ] 7.3 Create `src/app/api/export/advanced/route.ts` for enhanced export processing
  - [ ] 7.4 Implement HTML export with preserved Hysio brand styling
  - [ ] 7.5 Implement TXT export with properly formatted plain text
  - [ ] 7.6 Implement DOCX export with professional document formatting
  - [ ] 7.7 Implement PDF export with Hysio branding and professional layout
  - [ ] 7.8 Add collapsible/expandable functionality to all documentation sections
  - [ ] 7.9 Implement copy-to-clipboard functionality for all content sections
  - [ ] 7.10 Add in-place editing capabilities for all generated documentation
  - [ ] 7.11 Apply consistent Hysio brand styling across all new pages and components
  - [ ] 7.12 Implement responsive design for desktop and tablet usage
  - [ ] 7.13 Add proper loading states, error handling, and user feedback throughout
  - [ ] 7.14 Create `src/components/ui/workflow-breadcrumbs.tsx` for navigation clarity
  - [ ] 7.15 Implement accessibility improvements (WCAG 2.1 AA compliance)
  - [ ] 7.16 Add keyboard navigation support for all interactive elements
  - [ ] 7.17 Create comprehensive test suite for export functionality
  - [ ] 7.18 Optimize performance with lazy loading and code splitting
  - [ ] 7.19 Add analytics tracking for workflow usage and completion rates
  - [ ] 7.20 Create final integration testing for complete user journey flows