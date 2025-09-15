# Product Requirements Document: Hysio Diagnosecode

## Introduction/Overview

Hysio Diagnosecode is an AI-powered diagnosis code identification module within the Hysio Toolkit that revolutionizes the DCSPH (Dutch Classification System for Physical Health) coding process for Dutch physiotherapists. Instead of manual table lookup through complex coding manuals, healthcare professionals can describe patient complaints in natural language and receive accurate, officially validated DCSPH codes within seconds.

The primary problem Hysio Diagnosecode addresses is the time-consuming and error-prone process of manually searching through DCSPH tables to find appropriate diagnosis codes. Current workflows require therapists to navigate complex combinations of location codes (Table A) and pathology codes (Table B), a process that can take several minutes per patient and is prone to coding errors.

**Goal**: Transform the diagnostic coding process from a tedious administrative task into an intelligent, conversational experience that takes less than 30 seconds while ensuring clinical accuracy and regulatory compliance.

## Goals

1. **Dramatic Time Reduction**: Reduce DCSPH coding time from 2-5 minutes to under 30 seconds per patient
2. **Coding Accuracy**: Achieve 95%+ accuracy in suggested codes through AI-powered pattern recognition
3. **Clinical Reasoning Enhancement**: Strengthen therapeutic decision-making through transparent rationale for each code suggestion
4. **Seamless Integration**: Integrate naturally into existing Hysio workflows and standalone usage scenarios
5. **Professional Validation**: Ensure all suggestions comply with official DCSPH systematiek and can be used for insurance claims
6. **User Experience Excellence**: Provide an intuitive, chat-like interface that requires no training
7. **Administrative Burden Reduction**: Eliminate the need to manually reference DCSPH coding manuals during patient consultations
8. **Quality Assurance**: Implement robust validation to prevent suggestion of non-existent or inappropriate codes

## User Stories

### Primary User: Dutch Physiotherapist

**As a** busy physiotherapist in a Dutch practice,
**I want to** quickly find the correct DCSPH code by describing a patient's complaint in my own words,
**So that** I can complete my administrative tasks efficiently and focus more time on patient care.

**As a** newly graduated physiotherapist,
**I want to** receive guidance and rationale for diagnosis codes,
**So that** I can improve my clinical reasoning skills and ensure accurate coding.

**As a** experienced therapist handling complex cases,
**I want to** see multiple code options with clear explanations,
**So that** I can choose the most appropriate code based on my clinical judgment.

**As a** practice manager tracking coding accuracy,
**I want to** ensure all codes generated comply with DCSPH standards,
**So that** our insurance claims are processed without issues.

### Integration Scenarios

**As a** therapist completing a Hysio Intake workflow,
**I want to** access diagnosis code suggestions directly within the clinical conclusion step,
**So that** I can seamlessly complete my documentation without switching contexts.

**As a** physiotherapist working outside the standard workflow,
**I want to** access a standalone diagnosis code finder,
**So that** I can quickly code any patient case regardless of how the consultation was conducted.

## Functional Requirements

### Core Functionality

1. **Natural Language Input Processing**
   - The system must accept free-form text descriptions of patient complaints in Dutch
   - The system must process medical terminology, lay language, and mixed descriptions
   - The system must handle abbreviations and common physiotherapy terms

2. **Intelligent Questioning System**
   - The system must automatically identify when additional information is needed
   - The system must ask 1-2 targeted clarifying questions maximum
   - Questions must focus on body region and pathology type when ambiguous
   - The system must accept user responses and update suggestions accordingly

3. **DCSPH Code Generation**
   - The system must combine 2-digit location codes (Table A) with 2-digit pathology codes (Table B)
   - The system must generate exactly 3 ranked code suggestions
   - All suggested codes must exist in the official DCSPH tables
   - The system must prioritize codes based on symptom pattern matching

4. **Professional Rationale System**
   - Each code suggestion must include a clear, clinical rationale in Dutch
   - Rationale must explain why the specific location + pathology combination fits the input
   - Explanations must be concise (50-100 words) and professionally appropriate
   - Language must be suitable for clinical documentation

5. **Results Display & Interaction**
   - Results must be displayed as 3 distinct cards in horizontal or vertical layout
   - Each card must show: 4-digit code, decoded name, clinical rationale, copy button
   - Cards must follow Hysio Brand Style Guide for consistency
   - One-click copying functionality for easy EPD integration

6. **Validation & Quality Assurance**
   - The system must validate all inputs for appropriate medical content
   - The system must verify all suggested codes exist in official DCSPH tables
   - The system must prevent generation of invalid or non-existent code combinations
   - The system must log all interactions for quality monitoring

### User Interface Requirements

7. **Chat Interface Design**
   - Single-page interface with conversational flow
   - Input field at bottom with "Vind Code" button
   - AI questions appear as chat bubbles above input
   - User responses displayed in conversation thread
   - Clear visual hierarchy following Hysio branding

8. **Responsive & Accessible Design**
   - Interface must work on desktop and tablet devices
   - Text must meet WCAG contrast requirements
   - Keyboard navigation support for all functionality
   - Clear focus indicators and screen reader compatibility

### Integration Requirements

9. **Standalone Module**
   - Accessible as dedicated card in Hysio Toolkit dashboard
   - Complete functionality without dependency on other modules
   - Direct navigation from main dashboard

10. **Workflow Integration**
    - Integration point in Hysio Intake clinical conclusion step
    - Side panel presentation option for context switching
    - Automatic population of results into existing workflows

### Technical Requirements

11. **API Architecture**
    - RESTful API endpoint: POST /api/diagnosecode/find
    - Request format: `{ "query": "user input", "conversationId": "uuid" }`
    - Response format: `{ "suggestions": [{"code": "7920", "name": "...", "rationale": "..."}] }`
    - Proper error handling with meaningful messages

12. **Performance Requirements**
    - Response time under 3 seconds for initial suggestions
    - Response time under 2 seconds for clarifying questions
    - Support for concurrent users without performance degradation

## Non-Goals (Out of Scope)

1. **Multi-language Support**: Initial version supports Dutch only
2. **Historical Code Analysis**: No tracking of previous coding patterns or analytics
3. **Educational Content**: No teaching materials about DCSPH methodology
4. **Integration with External EPD Systems**: Direct EPD integration beyond copy/paste functionality
5. **Custom Code Creation**: System only suggests existing DCSPH codes, cannot create new codes
6. **Patient Data Storage**: No persistent storage of patient-specific information
7. **Billing Integration**: No direct integration with insurance or billing systems
8. **Code Modification**: No ability to edit or customize existing DCSPH codes
9. **Batch Processing**: Single case processing only, no bulk coding functionality

## Design Considerations

### UI/UX Design

- **Conversational Interface**: Design mirrors modern chat applications for intuitive user experience
- **Card-Based Results**: Three suggestion cards with clear visual hierarchy and professional styling
- **Brand Consistency**: Strict adherence to Hysio Brand Style Guide colors, typography, and spacing
- **Progressive Disclosure**: Results appear only after sufficient information is gathered
- **Error States**: Graceful handling of unclear input with helpful guidance

### Visual Design Elements

- **Color Scheme**: Primary Hysio Mint (#A5E1C5) and Deep Green (#003728) with appropriate accents
- **Typography**: Hierarchical font sizing (large for codes, medium for names, small for rationale)
- **Card Design**: Soft shadows, rounded corners, consistent with existing Hysio components
- **Icons**: Copy button, question indicators, and status icons for clear user feedback

## Technical Considerations

### Frontend Architecture

- **React Components**:
  - `DiagnoseCodeFinderPage`: Main container component
  - `InputField`: Controlled input with submit handling
  - `ChatThread`: Conversation display component
  - `ResultCard`: Individual suggestion display component

### Backend Requirements

- **AI Integration**: GPT-4 or equivalent with specialized medical prompting
- **Knowledge Base**: JSON-encoded DCSPH tables (Location Table A + Pathology Table B)
- **Validation Layer**: Server-side code verification against official tables
- **Audit Logging**: Non-PII tracking of usage patterns for quality improvement

### Data Security

- **Privacy First**: No storage of patient-identifiable information
- **GDPR Compliance**: Minimal data collection with explicit consent
- **Audit Trails**: Logging of code selections for quality assurance (anonymized)
- **Secure Communication**: HTTPS encryption for all API communications

### Dependencies

- **Integration**: Existing Hysio authentication and user management systems
- **Styling**: Hysio UI component library and design system
- **API**: Hysio backend infrastructure and routing

## Success Metrics

### Primary Metrics
1. **Time Efficiency**: Average coding time reduced from 180 seconds to under 30 seconds
2. **User Adoption**: 80% of active Hysio users utilize diagnosis coding within 60 days
3. **Accuracy Rate**: 95% of first suggestions accepted by users without modification
4. **User Satisfaction**: Net Promoter Score (NPS) of 70+ for the coding experience

### Secondary Metrics
1. **Query Success Rate**: 98% of queries receive valid code suggestions
2. **Clarification Efficiency**: Average of 1.2 clarifying questions per successful coding session
3. **Integration Usage**: 60% of usage occurs within integrated workflows vs. standalone
4. **Error Prevention**: Zero invalid codes suggested to users
5. **System Performance**: 99.5% uptime with sub-3-second response times

### Business Impact
1. **Administrative Time Savings**: 5+ hours saved per therapist per month
2. **Coding Accuracy**: 25% reduction in insurance claim rejections due to coding errors
3. **User Engagement**: 15% increase in overall Hysio platform usage
4. **Professional Development**: Improved clinical reasoning scores in user feedback

## Open Questions

1. **Conversation State Management**: How long should conversation context be maintained between queries? Should we support returning to previous conversations?

2. **Uncertainty Handling**: When AI confidence is low, should the system show fewer than 3 suggestions or include a confidence indicator?

3. **Learning Integration**: Should the system learn from user selections to improve future suggestions (while maintaining privacy)?

4. **Offline Capability**: Is offline functionality needed for users with unreliable internet connections?

5. **Integration Priorities**: Should we prioritize standalone functionality or integrated workflow usage for initial release?

6. **Feedback Mechanism**: What level of user feedback collection is needed to improve suggestion accuracy without compromising privacy?

7. **Version Management**: How should we handle updates to DCSPH code tables? Automatic updates vs. manual verification?

8. **Multi-condition Support**: Should the system support coding for patients with multiple concurrent conditions in a single query?

---

*This PRD represents the foundation for implementing Hysio Diagnosecode as a premium addition to the Hysio Toolkit, combining cutting-edge AI technology with established medical coding practices to deliver exceptional value to Dutch healthcare professionals.*