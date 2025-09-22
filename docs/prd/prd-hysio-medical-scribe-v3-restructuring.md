# Product Requirements Document (PRD)
# Hysio Medical Scribe v3: Complete Application Restructuring

## 1. Introduction/Overview

The Hysio Medical Scribe v3 represents a fundamental architectural transformation from the current single-page application to a sophisticated, multi-workflow, multi-page system. This restructuring addresses critical user experience limitations and creates a logical, workflow-driven interface that guides physiotherapists through specialized treatment documentation processes.

**Problem Statement:** The current single-page application lacks intuitive navigation, workflow clarity, and proper user guidance. Users are immediately thrown into a complex interface without understanding their options or being guided through appropriate workflows for their specific needs.

**Goal:** Transform Hysio Medical Scribe into a structured, multi-page application with dedicated workflows for different consultation types, featuring proper URL routing, enhanced user guidance, and specialized preparation systems.

## 2. Goals

### Primary Goals
1. **Transform Architecture**: Convert from single-page to multi-page application with proper URL routing
2. **Implement Workflow Hub**: Create central workflow selection page with clear user guidance
3. **Establish Three Distinct Workflows**: Automated intake, step-by-step intake, and follow-up consultation
4. **Enhance User Experience**: Provide intuitive navigation and workflow-specific guidance
5. **Improve Clinical Documentation**: Implement HHSB methodology and SOEP reporting
6. **Standardize Brand Experience**: Apply consistent Hysio brand styling throughout

### Secondary Goals
1. **Optimize Performance**: Ensure fast loading times across all workflow pages
2. **Enhance Accessibility**: Meet WCAG 2.1 AA standards
3. **Enable Scalability**: Create architecture that supports future workflow additions
4. **Improve Analytics**: Track user journey through different workflows

## 3. User Stories

### Primary User: Physiotherapist

**Core Navigation Stories:**
- As a physiotherapist, I want to clearly understand my workflow options so that I can choose the most appropriate documentation method for my consultation type
- As a physiotherapist, I want unique URLs for each workflow step so that I can bookmark, share, or return to specific stages
- As a physiotherapist, I want clear navigation between workflow steps so that I understand my progress and can move efficiently through the process

**Workflow-Specific Stories:**

**Automated Intake Workflow:**
- As a busy physiotherapist, I want a fully automated intake option so that I can complete documentation quickly in a single step
- As a physiotherapist, I want optional intake preparation so that I can review relevant questions and examination points before starting
- As a physiotherapist, I want immediate access to all results (HHSB, examination findings, clinical conclusion) after processing

**Step-by-Step Intake Workflow:**
- As a thorough physiotherapist, I want a detailed step-by-step process so that I can ensure comprehensive patient documentation
- As a physiotherapist, I want anamnesis preparation generation so that I have targeted questions based on patient information
- As a physiotherapist, I want examination preparation based on anamnesis results so that my physical examination is focused and relevant
- As a physiotherapist, I want to move through anamnesis → examination → clinical conclusion with clear transitions

**Follow-up Consultation Workflow:**
- As a physiotherapist conducting follow-up consultations, I want a SOEP-focused workflow so that I can efficiently document treatment progress
- As a physiotherapist, I want consultation preparation so that I'm ready for structured follow-up documentation
- As a physiotherapist, I want properly formatted SOEP reports with export options

**Documentation & Export Stories:**
- As a physiotherapist, I want all documentation to be collapsible, copyable, and editable so that I can customize outputs for my needs
- As a physiotherapist, I want multiple export formats (HTML/TXT/DOCX/PDF) so that I can integrate with my practice management system
- As a physiotherapist, I want consistent Hysio brand styling so that my documentation looks professional

## 4. Functional Requirements

### 4.1 Application Architecture

**REQ-001**: The application MUST be restructured from single-page to multi-page architecture with unique URLs for each workflow and step.

**REQ-002**: The application MUST implement proper React Router or Next.js routing with SEO-friendly URLs.

**REQ-003**: The application MUST maintain session state across page navigation within a workflow.

**REQ-004**: The application MUST provide browser back/forward button support for navigation.

### 4.2 Enhanced Patient Information Page (Starting Page)

**REQ-005**: The patient information page MUST include contextual information about Hysio Medical Scribe functionality and purpose.

**REQ-006**: The "Hoofdklacht" (Chief Complaint) field MUST be marked as required and have the "(optioneel)" label removed.

**REQ-007**: The "Context Document" field MUST remain optional as currently implemented.

**REQ-008**: The submission button MUST be changed from "Ga verder naar intake workflow" to simply "Ga verder".

**REQ-009**: The page MUST validate required fields before allowing progression.

### 4.3 Central Workflow Selection Hub

**REQ-010**: The application MUST create a new "Kies uw Workflow" (Choose Your Workflow) page accessible at `/scribe/workflow`.

**REQ-011**: The workflow selection page MUST present three primary workflow options with comprehensive descriptions:
- Hysio Intake (Volledig Automatisch)
- Hysio Intake (Stapsgewijs)
- Hysio Consult (Vervolgconsult)

**REQ-012**: Each workflow option MUST include detailed descriptions explaining:
- Purpose and use cases
- Expected duration
- Target consultation type
- Benefits and advantages

**REQ-013**: The workflow selection MUST route to appropriate URLs:
- Automated: `/scribe/intake-automatisch`
- Step-by-step: `/scribe/intake-stapsgewijs/anamnese`
- Follow-up: `/scribe/consult`

### 4.4 Automated Intake Workflow

**REQ-014**: The automated intake workflow MUST be accessible at `/scribe/intake-automatisch`.

**REQ-015**: The workflow MUST provide optional intake preparation generation based on patient information.

**REQ-016**: The preparation logic MUST integrate with the document located at `C:\Users\adamh\Desktop\AdamHysioAdam\docs\VariableDocumente\Stap 0 - Hysio Intake Automatisch - Voorbereiding Intake.txt`.

**REQ-017**: The workflow MUST support single-step processing of complete intake (recording upload or manual notes).

**REQ-018**: After processing, the system MUST route to `/scribe/intake-automatisch/conclusie`.

**REQ-019**: The results page MUST display HHSB Anamnesis Card, Examination Findings, and Clinical Conclusion in a structured format.

**REQ-020**: All result sections MUST be collapsible, copyable, and editable.

### 4.5 Step-by-Step Intake Workflow

**REQ-021**: The step-by-step workflow MUST be divided into three distinct pages:
- Anamnesis: `/scribe/intake-stapsgewijs/anamnese`
- Examination: `/scribe/intake-stapsgewijs/onderzoek`
- Clinical Conclusion: `/scribe/intake-stapsgewijs/klinische-conclusie`

**REQ-022**: **Anamnesis Step Requirements:**
- MUST provide anamnesis preparation generation
- MUST integrate with preparation logic from `C:\Users\adamh\Desktop\AdamHysioAdam\docs\VariableDocumente\Stap 1 - Hysio Intake Stapsgewijs - Voorbereiding Anamnese.txt`
- MUST support audio recording, file upload, and manual notes input
- MUST generate HHSB-structured anamnesis card after processing
- MUST provide navigation to examination step

**REQ-023**: **Examination Step Requirements:**
- MUST provide examination preparation generation based on anamnesis results
- MUST integrate with preparation logic from `C:\Users\adamh\Desktop\AdamHysioAdam\docs\VariableDocumente\Stap 3 - Hysio Intake Stapsgewijs - Onderzoeksvoorbereiding.txt`
- MUST support audio recording, file upload, and manual notes input
- MUST generate structured examination findings after processing
- MUST provide navigation to clinical conclusion step

**REQ-024**: **Clinical Conclusion Step Requirements:**
- MUST integrate all previous step data
- MUST integrate with logic from `C:\Users\adamh\Desktop\AdamHysioAdam\docs\VariableDocumente\Stap 5 - Hysio Intake Stapsgewijs - Klinische Conclusie.txt`
- MUST generate comprehensive clinical conclusion
- MUST provide final documentation with export options

**REQ-025**: Each step MUST maintain progress indicators showing current position in the workflow.

**REQ-026**: Each step MUST allow navigation back to previous completed steps for review/editing.

### 4.6 Follow-up Consultation Workflow

**REQ-027**: The follow-up consultation workflow MUST be accessible at `/scribe/consult`.

**REQ-028**: The workflow MUST implement SOEP (Subjective, Objective, Evaluation, Plan) methodology.

**REQ-029**: The workflow MUST provide consultation preparation generation.

**REQ-030**: The preparation logic MUST integrate with `C:\Users\adamh\Desktop\AdamHysioAdam\docs\VariableDocumente\Stap 0 - Hysio Consult - Voorbereiding Consult.txt`.

**REQ-031**: The workflow MUST support audio recording, file upload, and manual notes input.

**REQ-032**: After processing, the system MUST route to `/scribe/consult/soep-verslag`.

**REQ-033**: The SOEP report page MUST display structured SOEP documentation.

**REQ-034**: The SOEP report MUST include export options for HTML, TXT, DOCX, and PDF formats.

### 4.7 Documentation Standards

**REQ-035**: All workflows MUST implement HHSB methodology (replacing PHSB):
- H: Hulpvraag (Help Request)
- H: Historie (History)
- S: Stoornissen (Disorders)
- B: Beperkingen (Limitations)

**REQ-036**: All references to "FysioRoadmap" MUST be removed from the application.

**REQ-037**: All references to "PHSB" MUST be replaced with "HHSB".

**REQ-038**: All documentation outputs MUST be styled with consistent Hysio brand styling.

**REQ-039**: All documentation sections MUST support:
- Collapsible/expandable display
- Copy to clipboard functionality
- In-place editing capabilities
- Export to multiple formats

### 4.8 User Interface Requirements

**REQ-040**: The application MUST implement consistent Hysio brand styling across all pages.

**REQ-041**: The application MUST use a responsive design supporting desktop and tablet usage.

**REQ-042**: Each page MUST include appropriate navigation elements (breadcrumbs, back buttons, progress indicators).

**REQ-043**: The application MUST provide clear visual feedback for processing states and completed actions.

**REQ-044**: Error states MUST be handled gracefully with user-friendly messages and recovery options.

### 4.9 Technical Integration Requirements

**REQ-045**: The application MUST integrate with existing backend services for:
- Audio transcription
- AI content generation
- Document processing
- Export functionality

**REQ-046**: The application MUST maintain compatibility with existing authentication and session management.

**REQ-047**: The application MUST implement proper error handling and logging for all workflow steps.

**REQ-048**: The application MUST support progressive enhancement for users with disabled JavaScript.

## 5. Non-Goals (Out of Scope)

### 5.1 Features Explicitly Excluded

- **Real-time collaboration**: Multi-user editing of the same patient documentation
- **Advanced scheduling integration**: Calendar or appointment booking functionality
- **Patient portal access**: Direct patient access to documentation
- **Mobile application**: Native iOS/Android apps (responsive web design only)
- **Advanced analytics dashboard**: Detailed usage analytics and reporting
- **Third-party EHR integration**: Direct integration with external Electronic Health Record systems
- **Multi-language support**: Languages other than Dutch
- **Offline functionality**: Working without internet connection
- **Advanced user management**: Role-based access control beyond basic authentication

### 5.2 Technical Limitations

- **Legacy browser support**: No support for Internet Explorer or browsers older than 2 years
- **Advanced video processing**: Video recording/processing capabilities
- **Real-time audio processing**: Live transcription during recording
- **Advanced export formats**: Formats beyond HTML, TXT, DOCX, PDF

## 6. Design Considerations

### 6.1 Visual Design Requirements

**Typography and Brand**: All pages must use the established Hysio brand guidelines including:
- Primary colors: Hysio Mint Green (#A5E1C5), Deep Green (#004B3A), Off-white (#F8F8F5)
- Typography: Consistent font hierarchy with Inter font family
- Component styling: Rounded corners, subtle shadows, mint green accents

**Layout Patterns**:
- **Two-panel layout**: Left panel for results/guidance, right panel for input (established pattern)
- **Card-based design**: Use cards for workflow options, documentation sections, and result displays
- **Collapsible sections**: All major content areas should be collapsible with clear expand/collapse indicators
- **Progress indicators**: Visual progress tracking for multi-step workflows

### 6.2 User Experience Patterns

**Navigation Flow**:
- Consistent back button placement and behavior
- Breadcrumb navigation for complex workflows
- Clear "next step" call-to-action buttons
- Save and exit options on each major step

**Content Organization**:
- Logical information hierarchy with clear headings
- Scannable content with bullet points and short paragraphs
- Contextual help and guidance integrated into forms
- Clear visual separation between different content types

**Interactive Elements**:
- Hover states for all interactive elements
- Loading states for processing actions
- Success/error feedback for all user actions
- Keyboard navigation support

### 6.3 Responsive Design

- **Primary target**: Desktop (1920x1080 and 1366x768)
- **Secondary target**: Tablets (768px and up)
- **Breakpoint strategy**: Desktop-first with tablet adaptations
- **Touch considerations**: Adequate touch targets for tablet users

## 7. Technical Considerations

### 7.1 Architecture Requirements

**Frontend Framework**: Continue using Next.js with React for consistency with existing codebase.

**Routing Strategy**: Implement Next.js App Router for:
- Dynamic route generation
- Nested layouts for workflow pages
- Server-side rendering capabilities
- SEO optimization

**State Management**:
- Use React Context or Zustand for workflow state management
- Implement persistent state across page navigation
- Session storage for temporary data
- Local storage for user preferences

### 7.2 Performance Considerations

**Code Splitting**: Implement route-based code splitting to ensure:
- Fast initial page load
- Workflow-specific bundle loading
- Optimized asset delivery

**Caching Strategy**:
- Static asset caching for UI components
- API response caching for preparation documents
- Session data persistence

### 7.3 Integration Points

**Existing Backend Services**:
- Audio transcription API endpoints
- OpenAI/LLM content generation services
- Document processing services
- Export functionality services

**New Integration Requirements**:
- Preparation document loading from file system
- Enhanced routing middleware
- Session state persistence
- Multi-format export services

### 7.4 Data Flow Architecture

**Workflow State Management**:
```
Patient Info → Workflow Selection → Step-by-Step Execution → Result Generation → Export
     ↓              ↓                      ↓                    ↓              ↓
  Session         Route               Progressive            Database      File System
  Storage         Change              State Updates          Storage        Export
```

**Document Processing Pipeline**:
```
Preparation Doc → AI Processing → User Input → Transcription → LLM Analysis → Structured Output
       ↓              ↓             ↓             ↓              ↓               ↓
   File System    OpenAI API    User Interface  Audio API    Content Gen     Database
```

## 8. Success Metrics

### 8.1 User Experience Metrics

**Navigation Efficiency**:
- **Target**: 90% of users complete their intended workflow without navigation errors
- **Measurement**: Track completion rates for each workflow type
- **Baseline**: Establish current completion rate and improve by 25%

**User Satisfaction**:
- **Target**: 85% user satisfaction score for new workflow selection interface
- **Measurement**: Post-session surveys and user feedback
- **Baseline**: Current single-page application feedback as baseline

**Task Completion Time**:
- **Target**: 20% reduction in average time to complete documentation
- **Measurement**: Time tracking from patient info to final export
- **Segmentation**: Measure separately for each workflow type

### 8.2 Technical Performance Metrics

**Page Load Performance**:
- **Target**: All pages load within 2 seconds on standard broadband
- **Measurement**: Core Web Vitals (LCP, FID, CLS)
- **Monitoring**: Implement performance monitoring for all routes

**Application Reliability**:
- **Target**: 99.5% uptime for all workflow pages
- **Measurement**: Error rate tracking and uptime monitoring
- **Recovery**: Maximum 30-second recovery time for temporary failures

### 8.3 Business Impact Metrics

**Feature Adoption**:
- **Target**: 70% of users try multiple workflow types within first month
- **Measurement**: Workflow selection analytics
- **Trend**: Month-over-month growth in workflow diversity

**Documentation Quality**:
- **Target**: 30% reduction in incomplete documentation sessions
- **Measurement**: Track sessions with missing required fields
- **Quality**: Measure average documentation completeness score

**User Retention**:
- **Target**: 15% increase in daily active users
- **Measurement**: DAU tracking with cohort analysis
- **Engagement**: Average sessions per user per week

### 8.4 Clinical Workflow Metrics

**Workflow Distribution**:
- **Measurement**: Track usage distribution across three workflow types
- **Analysis**: Identify most popular workflows and optimization opportunities
- **Trends**: Monitor seasonal or practice-type variations

**Preparation Usage**:
- **Target**: 60% of users utilize preparation features when available
- **Measurement**: Track preparation generation and usage rates
- **Impact**: Correlate preparation usage with documentation quality

**Export Utilization**:
- **Target**: 80% of completed sessions result in successful export
- **Measurement**: Export completion rates by format type
- **Formats**: Track most popular export formats for future optimization

## 9. Open Questions

### 9.1 Technical Implementation Questions

**Question**: Should the application implement progressive web app (PWA) capabilities for offline functionality?
**Implications**: Would enable limited offline usage but increases complexity
**Decision Needed**: Determine if offline capability aligns with user workflow patterns

**Question**: How should the application handle partial workflow completion and resumption?
**Implications**: Users may need to pause and resume complex workflows
**Decision Needed**: Define session persistence strategy and timeout policies

**Question**: Should we implement real-time auto-save functionality during documentation input?
**Implications**: Prevents data loss but increases server load and complexity
**Decision Needed**: Balance user experience with technical complexity

### 9.2 User Experience Questions

**Question**: Should the application provide workflow recommendations based on patient information?
**Implications**: Could improve workflow selection but requires additional AI logic
**Decision Needed**: Determine if intelligent workflow suggestion adds value

**Question**: How should the application handle workflow switching mid-process?
**Implications**: Users may realize they chose wrong workflow after starting
**Decision Needed**: Define switching policies and data preservation rules

**Question**: Should preparation documents be editable by users or remain read-only?
**Implications**: Editing allows customization but may reduce consistency
**Decision Needed**: Balance flexibility with standardization requirements

### 9.3 Integration and Migration Questions

**Question**: How will existing user data and preferences be migrated to the new architecture?
**Implications**: Smooth transition requires data migration strategy
**Decision Needed**: Define migration timeline and compatibility requirements

**Question**: Should the new architecture maintain backward compatibility with existing API endpoints?
**Implications**: Eases transition but may limit architectural improvements
**Decision Needed**: Determine breaking change tolerance and versioning strategy

**Question**: How should the application handle concurrent users working on same patient documentation?
**Implications**: Prevents data conflicts but requires conflict resolution system
**Decision Needed**: Define multi-user access policies and conflict resolution

### 9.4 Future Enhancement Questions

**Question**: Should the architecture support plugin or extension capabilities for future workflow additions?
**Implications**: Enables scalability but increases initial complexity
**Decision Needed**: Evaluate long-term extensibility requirements

**Question**: Should the application implement audit trails for documentation changes?
**Implications**: Improves compliance but requires additional database design
**Decision Needed**: Determine regulatory requirements and compliance needs

**Question**: How should the application support integration with future AI models or services?
**Implications**: Flexibility for improvement but requires abstraction layers
**Decision Needed**: Define AI service abstraction and upgrade strategies

---

## Implementation Priority Matrix

### Phase 1: Core Architecture (Weeks 1-4)
- **High Priority**: Multi-page routing, workflow selection hub, basic navigation
- **Dependencies**: None
- **Risk**: High (architectural foundation)

### Phase 2: Automated Workflow (Weeks 5-7)
- **High Priority**: Single-step processing, basic result display
- **Dependencies**: Phase 1 completion
- **Risk**: Medium (existing functionality adaptation)

### Phase 3: Step-by-Step Workflow (Weeks 8-12)
- **High Priority**: Multi-step navigation, preparation integration
- **Dependencies**: Phase 1-2 completion
- **Risk**: High (complex state management)

### Phase 4: Follow-up Workflow (Weeks 13-15)
- **Medium Priority**: SOEP implementation, consultation flow
- **Dependencies**: Phase 1 completion
- **Risk**: Medium (new workflow pattern)

### Phase 5: Enhancement & Polish (Weeks 16-18)
- **Medium Priority**: Advanced exports, UI polish, performance optimization
- **Dependencies**: Phase 1-4 completion
- **Risk**: Low (refinement phase)

---

*This PRD serves as the comprehensive specification for transforming Hysio Medical Scribe into a world-class, workflow-driven physiotherapy documentation platform.*