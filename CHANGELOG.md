# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **SCRIBE 3.1**: Enhanced patient information form with improved birth year input validation (4-digit limit)
- **SCRIBE 3.1**: Enhanced dynamic age calculation display with better validation and font styling
- **SCRIBE 3.0**: Complete multi-page workflow architecture transformation with dedicated pages for each workflow step
- **SCRIBE 3.0**: Comprehensive API infrastructure with `/api/preparation`, `/api/hhsb/process`, and `/api/soep/process` endpoints
- **SCRIBE 3.0**: Advanced preparation generation system with workflow-specific AI prompts for all intake types
- **SCRIBE 3.0**: Intelligent HHSB processing with automatic text parsing and structured output generation
- **SCRIBE 3.0**: Professional SOEP methodology implementation for follow-up consultation documentation
- **SCRIBE 3.0**: Enhanced summary sections - "Samenvatting van Anamnese" for HHSB workflows and "Samenvatting van Consult" for SOEP workflows
- **SCRIBE 3.0**: Restructured recording component layout with cohesive "Live Opname" and "Bestand selecteren" integration
- **SCRIBE 2.1**: TRUE unified workflow interface with integrated three-option selector (Volledig Automatisch, Stapsgewijs, Vervolgconsult)
- **SCRIBE 2.1**: Seamless conditional rendering system that dynamically switches workflow content without page reloads
- **SCRIBE 2.1**: Unified left/right panel architecture with workflow-specific input panels and result displays
- **SCRIBE 2.1**: Complete SOEP workflow integration for vervolgconsult functionality within unified interface
- **NEW**: Comprehensive Hysio Modules page (/modules) showcasing all platform capabilities
- Enhanced navigation structure with dedicated "Hysio Modules" section between Hysio Toolkit and Over Ons
- Detailed module explanations for Hysio Scribe, Assistant, SmartMail, Diagnosecode, and Dashboard
- Interactive module features with visual elements, problem-solution mapping, and benefit highlighting
- Integration benefits section demonstrating platform synergies
- **UX**: Contextual recording tips in AudioRecorder component - physiotherapist-specific guidance during recording
- **SMART**: Intelligent preparation step in Hysio Intake workflow - auto-generates preparation content based on chief complaint
- **CONTROL**: Manual processing control in Hysio Intake - users now control when analysis begins with "Verwerk" button
- **WORKFLOW**: Dual-mode workflow system with "Volledig Automatisch" and "Stapsgewijs" options for intake processing
- **PREPARATION**: Separate preparation generation for automation mode ("Intake Voorbereiding") and manual mode ("Anamnese Voorbereiding")
- **EDITING**: In-place editing capability for all generated workflow sections with save/cancel functionality
- **SCRIBE 2.0**: Central WorkflowSelectionHub component for unified workflow selection after patient info entry
- **SCRIBE 2.0**: "Samenvatting Anamnese" section in PHSB results for narrative anamnesis summary
- **SCRIBE 2.0**: "Samenvatting Consult" section in SOEP results for consultation summary
- **SCRIBE 2.0**: Enhanced PHSB data parsing with comprehensive regex patterns and error handling
- **SCRIBE 2.0**: Premium card-based layout for SOEP report presentation with Hysio brand styling

### Changed
- **SCRIBE 3.2**: Standardized recording component layout across all workflows with consistent vertical structure (Live Opname → Bestand selecteren → Handmatige Invoer)
- **SCRIBE 3.2**: Optimized state management for input method selection with automatic clearing of conflicting inputs
- **SCRIBE 3.1**: Enhanced visual hierarchy in patient information form with bold section titles ("Basisgegevens", "Medische informatie")
- **SCRIBE 3.1**: Improved button styling with semibold font-weight for better visual prominence
- **SCRIBE 3.1**: Refined age calculation display to show only for valid 4-digit birth years with enhanced styling
- **SCRIBE 3.0**: Transformed global application background from off-white to Hysio mint green (#A5E1C5) for consistent brand identity
- **SCRIBE 3.0**: Updated navigation button text from "Ga verder naar intake workflow" to "Kies uw workflow" for improved clarity
- **SCRIBE 3.0**: Restructured recording interface to eliminate redundant file section and create cohesive input flow
- **SCRIBE 3.0**: Enhanced card styling with improved shadows and borders for better visual hierarchy on mint background
- **SCRIBE 2.1**: Eliminated WorkflowSelectionHub component and integrated workflow selection directly into NewIntakeWorkflow
- **SCRIBE 2.1**: Transformed application flow from "patient-info → workflow-selection → workflow" to "patient-info → unified-workflow-with-integrated-selection"
- **SCRIBE 2.1**: Redesigned workflow selector with radio button-style cards and enhanced visual feedback
- **MAJOR**: Implemented complete visual rebrand across all informational pages (Blog, Over Ons, Contact, Prijzen)
- Updated primary background from Off-white to distinctive Hysio Mint Green across all pages
- Transformed content sections to use Off-white backgrounds for optimal contrast and readability
- Enhanced hero sections with streamlined Mint Green gradients for visual consistency
- **CONTENT**: Completely optimized copy for physiotherapist target audience with evidence-based messaging
- Upgraded blog content with specific ROI metrics, implementation timelines, and professional terminology
- Enhanced About Us page with concrete achievements (70% time reduction, ISO 27001 certification, 2,500+ users)
- Improved Contact page with implementation-focused FAQs and realistic ROI expectations
- Refined Pricing page with professional practice descriptions and measurable value propositions
- **BRAND**: Applied official Hysio color palette throughout Intake workflow components (Off-White #F8F8F5, Mint #A5E1C5, Deep Green #004B3A)
- **LAYOUT**: Redesigned automated workflow output from three-column grid to single-column collapsible sections for improved usability
- **UX**: Replaced yellow/amber color scheme in preparation sections with consistent Hysio mint green aesthetic
- **STEPPER**: Made workflow stepper conditionally visible (hidden in automation mode, visible in manual mode)
- **TEXT**: Updated automation panel description to explicitly mention "Anamnesekaart, Onderzoeksbevindingen en Klinische Conclusie"
- **SCRIBE 2.0**: Unified Scribe entry point to start directly with patient information form instead of session type selection
- **SCRIBE 2.0**: Redesigned patient info form with enhanced Hysio brand styling and welcoming header
- **SCRIBE 2.0**: Transformed SOEP report page with premium styling, Hysio brand colors, and enhanced visual hierarchy
- **SCRIBE 2.0**: Updated workflow routing to flow: patient info → workflow selection → specific workflow execution

### Enhanced
- Blog categories now emphasize practical implementation, evidence-based research, and ROI measurements
- Newsletter signup optimized for weekly evidence-based insights delivery
- Contact form streamlined for implementation and workflow optimization inquiries
- FAQ sections updated with implementation timelines, ROI metrics, and team training information
- Pricing descriptions refined with practice size specifications and capability expectations
- All call-to-action buttons enhanced with conversion-focused messaging
- **INTAKE**: Recording tips now include 14 comprehensive physiotherapist-specific prompts with rotating display every 8 seconds
- **PREPARATION**: Enhanced AI preparation generation with SOEP methodology integration and extended word limit (250 words)
- **WORKFLOW**: Improved user control with clear processing steps and manual workflow progression
- **MODES**: Added comprehensive explanation panels for both automation and manual workflow modes with feature highlights
- **AUTOMATION**: Streamlined preparation generation with simplified prompts for faster intake processing
- **SECTIONS**: All result sections now independently collapsible with individual copy-to-clipboard functionality

### Technical
- Consistent application of Hysio brand colors (Mint Green, Deep Green, Off-white) across all pages
- Improved visual hierarchy with proper contrast ratios for accessibility
- Enhanced component styling for cards, buttons, and interactive elements
- Optimized section backgrounds for better content separation and readability

### Removed
- **SCRIBE 3.2**: Removed automatic generatePreparation triggers that caused unwanted API calls on component mount
- **SCRIBE 3.2**: Eliminated unused Tabs component imports and handleInputMethodChange functions from all workflow pages
- **SCRIBE 3.2**: Removed tab-based navigation system in favor of unified vertical layout across all workflows
- **SCRIBE 3.0**: Removed redundant separate "Bestand" tab from recording interface in favor of integrated file selection
- **SCRIBE 3.0**: Eliminated tab-based navigation in recording components for streamlined linear workflow
- **SCRIBE 2.1**: Removed WorkflowSelectionHub component and intermediate workflow selection step for streamlined navigation
- **SCRIBE 2.1**: Removed duplicate workflow mode selectors from manual workflow phases
- **SCRIBE 2.1**: Removed redundant workflowMode state management in favor of unified selectedWorkflow state
- **UX**: Removed redundant blue informational box from automation workflow input panel for cleaner interface
- **WORKFLOW**: Removed "Overslaan" (Skip) button from preparation generation - streamlined to single action only
- **LEGACY**: Removed inconsistent amber/yellow color scheme from preparation sections in favor of unified brand colors
- **SCRIBE 2.0**: Removed SessionTypeSelector component and three-card selection screen for streamlined user experience

### Fixed
- **CRITICAL**: Fixed openaiClient duplicate declaration compilation error by refactoring export strategy in openai.ts module
- **CRITICAL**: Updated all API routes (/api/preparation, /api/hhsb/process, /api/soep/process) to use openaiClient function call syntax
- **EMERGENCY**: Fixed automatic generatePreparation function triggers causing unwanted API calls on page load across all workflow pages
- **EMERGENCY**: Resolved backend API endpoint failures by fixing missing openaiClient export in openai.ts module
- **CRITICAL**: Resolved complete workflow functionality breakdown by implementing missing API endpoints (`/api/preparation`, `/api/hhsb/process`, `/api/soep/process`)
- **CRITICAL**: Fixed 500 Internal Server Error in preparation generation across all workflows (intake-automatisch, intake-stapsgewijs, consult)
- **CRITICAL**: Resolved audio processing failures in intake/anamnese/consult workflows by creating proper backend processing infrastructure
- **CRITICAL**: Fixed TypeScript compilation errors by ensuring all UI components (progress, collapsible, tabs, alert, loading-spinner) are properly implemented
- **CRITICAL**: Restored complete application functionality after comprehensive debugging and API infrastructure implementation
- **EMERGENCY**: Fixed critical runtime crash in InputPanel component caused by undefined phaseLabels for new workflow phases
- **EMERGENCY**: Added comprehensive phase configurations for all workflow types (anamnesis, examination, clinical-conclusion, soep, followup)
- **EMERGENCY**: Implemented fallback phase configuration to prevent crashes from unknown phase types
- **EMERGENCY**: Fixed critical architectural failure in Scribe 2.1 where incorrect routing broke user workflow experience
- **EMERGENCY**: Resolved JSX syntax errors and structural issues preventing proper compilation
- **EMERGENCY**: Fixed default workflow selection to properly start with "Hysio Intake (Stapsgewijs)" as intended
- **EMERGENCY**: Corrected conditional rendering logic to ensure seamless workflow switching without page navigation
- **CRITICAL**: Fixed ReferenceError crash "Cannot access 'isRecording' before initialization" in AudioRecorder component affecting all workflows
- **CRITICAL**: Fixed PHSB Compact View data display issue - PHSBResultsPanel now correctly parses and displays structured anamnesis text in individual P, H, S, B sections
- **UX**: Removed debug information ("DEBUG: Navigation Hidden") from Hysio Intake Plus clinical-conclusion phase for professional appearance
- **WORKFLOW**: Fixed automatic processing behavior - Hysio Intake now requires manual "Verwerk" button click instead of auto-processing recordings
- **NAVIGATION**: Fixed unwanted page navigation - processing results now display in left panel instead of navigating to new page
- **STABILITY**: Resolved workflow crash issues across Hysio Intake, Hysio Intake Plus, and Hysio Consult workflows
- Fixed critical TypeError in Scribe workflow components caused by String.prototype.matchAll() being called with non-global regex patterns
- Fixed regex patterns in phsb-results-panel.tsx by adding global flag to prevent TypeError when parsing red flags
- Fixed regex patterns in streamlined-intake-workflow.tsx by adding global flag to red flag extraction patterns
- Fixed regex patterns in new-intake-workflow.tsx by adding global flag to red flag extraction patterns
- Added comprehensive error handling to parsePHSBText functions to prevent crashes from invalid input data
- Added input validation and try-catch blocks to all PHSB text parsing functions for improved stability
- Enhanced error boundaries in Scribe workflow to gracefully handle parsing failures
- **SCRIBE 2.0**: Fixed critical PHSB text parsing issues with comprehensive regex patterns for reliable section extraction
- **SCRIBE 2.0**: Resolved data synchronization between compact and full view modes in PHSB results panel

## Previous Releases

<!-- Add previous releases here as they are made -->