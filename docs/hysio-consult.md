# BLAUWDRUK: Hysio Consult

## 1. Visie & Gebruikersprofiel (De "Waarom")

### Doel van de module
De Hysio Consult module lost het probleem op van inefficiënte en inconsistente documentatie van terugkomconsulten en vervolgbehandelingen in de fysiotherapiepraktijk. In plaats van handmatig SOEP-notities uittypen na elk consult, kan de therapeut tijdens of direct na de behandelsessie een audio-opname maken of notities invoeren, en binnen 10-15 seconden een professioneel gestructureerde SOEP-notitie krijgen die direct geschikt is voor het patiëntendossier en declaratie.

### Doelgroep
Deze module is ideaal voor **therapeuten die regelmatig vervolgconsulten doen en waarde hechten aan snelle, consistente documentatie**. Dit zijn therapeuten die:
- Dagelijks meerdere patiënten behandelen en efficiënte documentatie nodig hebben
- Vertrouwd zijn met de SOEP-methodiek (Subjectief, Objectief, Evaluatie, Plan)
- Waarde hechten aan tijdsbesparing zonder kwaliteitsverlies
- Consistent willen documenteren volgens professionele standaarden
- Snel willen schakelen tussen patiënten zonder administratieve overhead

### Kernfilosofie
**"Van behandeling naar documentatie in één beweging"**

De filosofie is naadloze integratie tussen behandeling en documentatie. De therapeut focust volledig op de patiënt tijdens het consult, en de technologie zorgt ervoor dat alle relevante informatie automatisch wordt omgezet naar professionele, declarabele documentatie volgens de SOEP-standaard.

---

## 2. De Gebruikersjourney (De "Wat" - Golden Path)

1. **Quick Start**: De gebruiker navigeert naar `/scribe/consult` vanuit het dashboard of via quick-access vanuit een vorige sessie. Het scherm toont direct de consult-interface zonder onnodige setup stappen.

2. **Patient Context**: Het systeem toont de laatst geselecteerde patiëntinformatie of vraagt om snelle patiënt selectie via een typeahead search. Vorige consulten zijn zichtbaar als context.

3. **Optionele Voorbereiding**: In het linkerpaneel kan de gebruiker optioneel een snelle voorbereiding genereren gebaseerd op vorige consulten en behandeldoelen. Dit duurt 2-3 seconden.

4. **Live Consult Input**: Tijdens of na het consult kiest de gebruiker één van de input-methoden:
   - **Live Opname**: Start opname tijdens consult, therapeut behandelt normaal en praat hardop over bevindingen
   - **Post-Consult Opname**: Na het consult, korte opname van de belangrijkste punten
   - **Quick Notes**: Snelle handmatige notities tussendoor of na afloop

5. **One-Click Processing**: Gebruiker klikt "Verwerk Consult". Het systeem toont real-time processing:
   - "🎤 Audio wordt geanalyseerd..." (alleen bij audio)
   - "📝 SOEP-notitie wordt gegenereerd..."
   - Totale duur: 8-12 seconden

6. **Immediate Results**: Direct preview van de SOEP-gestructureerde notitie met vier duidelijke secties: Subjectief, Objectief, Evaluatie, en Plan. Gebruiker kan direct edits maken.

7. **Save & Continue**: Eén klik op "Opslaan & Volgende" slaat de notitie op in het systeem en bereidt de interface voor voor de volgende patiënt of keert terug naar het dashboard.

8. **Export Integration**: Optioneel kunnen consulten direct worden geëxporteerd naar EPD-systemen, gemaild naar patiënten, of gedeclareerd via zorgverzekering-integraties.

---

## 3. User Interface (UI) & Componenten-Analyse (De "Hoe het eruitziet")

### Pagina Layout

**Hoofdpagina (`/scribe/consult`)**:
- **Minimale Header**: Patient info + quick patient switcher + session timer
- **Split Layout (Optioneel)**:
  - Links (30%): Compacte voorbereiding/context (collapsible)
  - Rechts (70%): Hoofdconsult interface
- **Single Panel Mode**: Volledige focus op consult input (default)
- **Floating Actions**: Save, Export, Next Patient knoppen

**Resultaten View (Embedded)**:
- **In-place Results**: SOEP-output verschijnt direct onder input area
- **Quick Edit**: Inline editing per SOEP-sectie
- **Action Bar**: Save, Copy, Export, Start Nieuwe Consult

### Sleutelcomponenten

#### `ConsultPage` (`/app/scribe/consult/page.tsx`)
- **Functie**: Ultra-focused single-page consult interface
- **Locatie**: Primary consult workflow page
- **Key Features**:
  - Minimalist design voor snelle workflows
  - Single-click patient switching
  - Real-time session timer
  - Live audio processing feedback
  - Immediate SOEP output display

#### `QuickPatientSelector` (Nieuw Component - Nodig)
- **Functie**: Fast patient selection zonder full navigation
- **Locatie**: Header van consult page
- **Key Features**:
  - Typeahead search door patiënt database
  - Recent patients quick access
  - New patient quick-add functionality
  - Session continuation indicators

#### `LiveConsultInput` (Enhanced UnifiedAudioInput)
- **Functie**: Consult-optimized audio en text input
- **Locatie**: Center van consult page
- **Key Features**:
  - Background audio recording (hands-free)
  - Voice activation detection
  - Quick manual notes overlay
  - Session pause/resume functionality
  - Real-time transcription preview

#### `SOEPResultsDisplay` (`/components/ui/soep-results-display.tsx`)
- **Functie**: Structured SOEP output met editing capabilities
- **Locatie**: Lower section van consult page
- **Key Features**:
  - Four-section SOEP layout (S-O-E-P)
  - Inline editing per sectie
  - Auto-save functionality
  - Copy individual sections
  - Export integration buttons

#### `ConsultSessionManager` (Nieuwe Service - Nodig)
- **Functie**: Session state en workflow management
- **Locatie**: Background service
- **Key Features**:
  - Multi-patient session tracking
  - Auto-save van work-in-progress
  - Session timeout handling
  - Cross-device session sync

### Component States

#### Consult Input States
- **Idle**: Wachten op input, "Start nieuwe consult" prominently displayed
- **Live Recording**: Discrete recording indicator, behandeling kan doorgaan
- **Processing**: Minimale overlay, "SOEP wordt gegenereerd..."
- **Results Ready**: SOEP output zichtbaar, edit controls beschikbaar
- **Saving**: Brief save confirmation, ready voor volgende

#### Patient Selector States
- **No Patient**: Prominent patient selection required
- **Current Patient**: Compact info display met change option
- **Switching**: Brief loading state tijdens patient data load
- **Multi-Session**: Indicator voor multiple active sessions

#### Session Management States
- **Single Consult**: Standard workflow voor één patiënt
- **Multi-Patient Session**: Advanced mode voor busy practice days
- **Background Processing**: Meerdere consulten in verschillende states
- **Batch Export**: End-of-day processing van alle consulten

---

## 4. Backend Processen & API-Flow (De "Wat er achter de schermen gebeurt")

### Streamlined Consult Processing

1. **Frontend**: User klikt "Verwerk Consult" → `processConsult()` functie
2. **Input Processing**: Audio of text input wordt voorbereid voor processing
3. **Audio Path** (indien van toepassing):
   - **3a**: Direct transcription via `/api/transcribe`
   - **3b**: Real-time streaming transcription (advanced feature)
   - **3c**: Background noise filtering en enhancement
4. **SOEP Generation**: `POST /api/soep/process` met:
   ```json
   {
     "workflowType": "consult",
     "patientInfo": {...},
     "previousConsults": [...], // Context van vorige consulten
     "preparation": "...", // Indien gegenereerd
     "inputData": {
       "type": "transcribed-audio" | "manual",
       "data": "consult transcript/notes",
       "sessionDuration": 1200, // in seconds
       "timestamp": "2025-01-26T14:30:00Z"
     }
   }
   ```
5. **Backend**: SOEP-specific AI processing:
   - Load patient history voor context
   - Apply consult-specific prompt templates
   - Generate structured SOEP output
   - Detect treatment progress indicators
   - Identify next treatment goals
6. **Response**: Structured SOEP data:
   ```json
   {
     "soepStructure": {
       "subjectief": "Patient reports...",
       "objectief": "Upon examination...",
       "evaluatie": "Assessment shows...",
       "plan": "Treatment plan includes..."
     },
     "redFlags": [...],
     "progressIndicators": {...},
     "nextSessionRecommendations": "...",
     "processingDuration": 8.2
   }
   ```
7. **Frontend**: Immediate display van results met edit capabilities

### Session Management Flow

**Single Consult Flow**:
1. Patient selection → Context loading → Input → Processing → Save → Next

**Multi-Patient Session Flow**:
1. Patient A: Input → Background processing
2. Patient B: Input → Background processing (A continues)
3. Patient A: Results ready → Review & Save
4. Patient C: Input → Continue pattern
5. End-of-session: Batch review en export

### Real-time Features

**Live Transcription** (Advanced):
- WebSocket connection naar transcription service
- Real-time text updates tijdens audio input
- Immediate feedback op audio quality
- Background processing van partial transcripts

**Auto-Save System**:
- Save work-in-progress elke 30 seconden
- Immediate save bij patient switching
- Recovery van interrupted sessions
- Cross-device sync voor tablet/desktop workflows

---

## 5. AI & Prompt Engineering (De "Magie")

### SOEP-Specific Prompt Engineering

**Primary SOEP System Prompt** (OpenAI GPT-4):
```
Je bent een ervaren fysiotherapeut die een vervolgconsult documenteert volgens de SOEP-methodiek.

SOEP STRUCTUUR (VERPLICHT):

**SUBJECTIEF** - Wat zegt de patiënt?
- Huidige klachten en veranderingen sinds vorig consult
- Pijnschaal en functionele beperkingen
- Activiteitenniveau en thuissituatie
- Medicatiegebruik en algemeen welzijn
- Verwachtingen en zorgen van patiënt

**OBJECTIEF** - Wat observeer je als therapeut?
- Fysieke bevindingen (houding, beweging, spiertonus)
- Testresultaten (kracht, mobiliteit, stabiliteit)
- Meetbare parameters (ROM, pijn VAS, functionele testen)
- Behandeling uitgevoerd tijdens dit consult
- Patiënt respons op interventies

**EVALUATIE** - Wat betekent dit?
- Progressie ten opzichte van vorige sessie
- Effectiviteit van huidige behandelplan
- Belemmerende of bevorderende factoren
- Aanpassing van werkdiagnose indien nodig
- Overall prognose update

**PLAN** - Wat gaan we doen?
- Concrete behandeldoelen voor komende periode
- Specifieke interventies en oefeningen
- Huiswerkopdrachten voor patiënt
- Frequentie en duur van vervolgbehandelingen
- Evaluatiemomenten en criteria

DOCUMENTATIE EISEN:
- Professionele, objectieve taal
- Meetbare en specifieke informatie waar mogelijk
- Duidelijke progressie-indicatoren
- Declarabel volgens zorgverzekering standaarden
- Geschikt voor overdracht naar collega's

CONTEXT: [Patiënt informatie en vorige consulten worden hier toegevoegd]
```

### Context-Aware Enhancements

**Patient History Integration**:
```
BEHANDELGESCHIEDENIS:
[Vorige 3-5 consulten worden automatisch toegevoegd voor context]

Let op patronen in:
- Progressie trends (verbetering/verslechtering)
- Behandelrespons (wat werkt wel/niet)
- Patiënt compliance en motivatie
- Externe factoren (werk, thuis, stress)
```

**Consult Type Variations**:

**Intake Consult Prompt** (Eerste bezoek):
```
FOCUS: Dit is een eerste consult na intake.
- Verificatie van intake bevindingen
- Eerste behandelplan implementatie
- Basislijn metingen vastleggen
- Patiënt educatie en verwachtingen afstemmen
```

**Behandel Consult Prompt** (Reguliere sessie):
```
FOCUS: Dit is een reguliere behandelsessie.
- Progressie evaluatie sinds vorig bezoek
- Behandeling uitgevoerd en patient respons
- Aanpassingen in behandelplan
- Volgende stappen en huiswerk
```

**Evaluatie Consult Prompt** (Herevaluatie):
```
FOCUS: Dit is een evaluatieconsult.
- Systematische herevaluatie van doelen
- Meetbare progressie-indicatoren
- Behandelplan bijstelling
- Vervolgbehandeling of afsluiting beslissing
```

### Smart Content Suggestions

**Auto-Generated Elements**:
- **Progressie-indicatoren** uit vorige consulten
- **Behandel-consistentie** checks (vergelijkbare patiënten)
- **Red flags** detectie voor verwijzing
- **Declaratie-optimalisatie** voor zorgverzekeringen

---

## 6. State Management (Het "Geheugen" van de app)

### Consult-Specific State Structure

```typescript
interface ScribeState {
  currentWorkflow: 'consult' | null,

  // Current consult session
  consultSession: {
    currentPatient: PatientInfo | null,
    sessionStartTime: Date,
    consultHistory: ConsultResult[], // Recent consulten deze sessie

    // Active consult data
    activeConsult: {
      preparation?: string,
      recording?: File,
      transcript?: string,
      manualNotes?: string,
      result?: SOEPStructure,
      saved: boolean
    } | null,

    // Multi-patient session support
    backgroundConsults: {
      [patientId: string]: {
        state: 'input' | 'processing' | 'ready' | 'saved',
        data: ActiveConsultData,
        timestamp: Date
      }
    }
  },

  // Consult preferences
  consultPreferences: {
    autoSaveInterval: number, // default: 30 seconds
    showPreparation: boolean, // default: false (for speed)
    audioQuality: 'standard' | 'high',
    defaultConsultType: 'behandeling' | 'evaluatie' | 'intake'
  }
}
```

### Fast-Paced State Patterns

**Rapid Patient Switching**:
1. Current consult → Background processing
2. New patient selected → Context loaded
3. Previous consult completes → Notification
4. User kan switchen tussen multiple active consulten

**Auto-Save Strategy**:
```typescript
// Auto-save elke 30 seconden
useInterval(() => {
  if (hasUnsavedChanges && !isProcessing) {
    autoSaveConsult();
  }
}, 30000);

// Immediate save bij patient switch
const switchPatient = (newPatient) => {
  if (hasUnsavedChanges) {
    saveCurrentConsult();
  }
  loadPatientContext(newPatient);
};
```

**Session Recovery**:
```typescript
// Bij page load/refresh
useEffect(() => {
  const savedSession = localStorage.getItem('consultSession');
  if (savedSession) {
    const { timestamp } = JSON.parse(savedSession);
    if (Date.now() - timestamp < 3600000) { // 1 hour
      showSessionRecoveryDialog();
    }
  }
}, []);
```

### Performance Optimization

**Lazy Loading**:
- Patient history loaded on-demand
- Previous consulten loaded when needed
- Background processing queue management

**Memory Management**:
- Automatic cleanup van oude consulten
- Background consult state compression
- Efficient audio blob handling

---

## 7. Status & Openstaande Taken (De "Werklijst")

### Wat is werkend ✅

1. **Basic Consult Infrastructure**:
   - Page routing naar `/scribe/consult`
   - Patient info integration
   - Audio input via UnifiedAudioInput
   - Manual text input capability

2. **SOEP Processing Pipeline**:
   - API route `/api/soep/process` exists
   - Basic SOEP prompt template
   - OpenAI integration voor text generation
   - Structured output formatting

3. **State Management Foundation**:
   - Basic consult state in Zustand store
   - Patient info persistence
   - Session management framework

### Wat is gebroken of ontbreekt ❌

#### Critical Missing Components (Blocker Issues)

1. **Complete ConsultPage Implementation**:
   - Current `/consult/page.tsx` is bare-bones
   - Geen proper UI layout voor consult workflow
   - Ontbrekende integration tussen input en results
   - Geen session management UI

2. **SOEP Results Display Component**:
   - `SOEPResultsDisplay` component bestaat niet
   - Geen structured display van S-O-E-P secties
   - Ontbrekende inline editing capabilities
   - Geen copy/export functionality

3. **Patient Selection System**:
   - Geen patient selector in consult interface
   - Ontbrekende patient switching capability
   - Geen integration met patient history
   - Geen quick patient creation

4. **Session Management**:
   - Geen multi-patient session support
   - Ontbrekende auto-save functionality
   - Geen session recovery system
   - Geen background processing voor multiple consulten

#### High Priority Features (MVP Gaps)

5. **Enhanced SOEP Processing**:
   - AI prompts zijn nog basis en niet consult-optimized
   - Geen patient history context integration
   - Ontbrekende consult type differentiation
   - Geen progressie tracking tussen consulten

6. **Real-time Features**:
   - Geen live transcription tijdens consult
   - Ontbrekende background audio processing
   - Geen real-time SOEP preview
   - Geen voice activation detection

7. **Export & Integration**:
   - Ontbrekende EPD export functionality
   - Geen email integration naar patiënten
   - Geen declaratie-ready output formatting
   - Geen batch export voor einde van dag

#### Medium Priority Enhancements

8. **Advanced Audio Features**:
   - Geen noise cancellation voor practice environments
   - Ontbrekende audio quality optimization
   - Geen speaker identification (therapeut vs patiënt)
   - Geen audio bookmarking voor lange consulten

9. **Workflow Optimizations**:
   - Geen template system voor frequent conditions
   - Ontbrekende keyboard shortcuts voor power users
   - Geen quick-access voor frequent patients
   - Geen time tracking per consult voor billing

10. **Quality & Compliance**:
    - Geen compliance checking voor zorgverzekering eisen
    - Ontbrekende quality scoring voor SOEP completeness
    - Geen peer review functionality
    - Geen audit trail voor changes

#### Low Priority Future Features

11. **Advanced Intelligence**:
    - Geen predictive text voor frequent phrases
    - Ontbrekende treatment suggestion engine
    - Geen outcome prediction based op patient history
    - Geen automated follow-up scheduling

12. **Collaboration & Practice Management**:
    - Geen multi-therapeut patient sharing
    - Ontbrekende practice-wide analytics
    - Geen supervisor review workflows
    - Geen resource planning integration

### Development Priority Matrix

#### Sprint 1 (Critical - 2 weeks)
- [ ] Complete `ConsultPage` implementation
- [ ] Build `SOEPResultsDisplay` component
- [ ] Implement basic patient selection
- [ ] Add session auto-save functionality

#### Sprint 2 (High Priority - 2 weeks)
- [ ] Enhanced SOEP AI prompts met context
- [ ] Patient history integration
- [ ] Basic export functionality
- [ ] Multi-patient session support

#### Sprint 3 (MVP Completion - 2 weeks)
- [ ] Real-time transcription features
- [ ] Advanced audio processing
- [ ] EPD integration framework
- [ ] Quality assurance tools

#### Sprint 4+ (Enhancements - Ongoing)
- [ ] Advanced workflow optimizations
- [ ] Compliance en declaratie tools
- [ ] Practice management integration
- [ ] Advanced AI features

### Success Criteria

**Technical Milestones**:
- [ ] Complete consult in <60 seconds (input to save)
- [ ] Support 10+ consulten per hour workflow
- [ ] 99.9% uptime tijdens practice hours
- [ ] <5 seconds SOEP generation time

**User Experience Goals**:
- [ ] Zero learning curve voor existing SOEP users
- [ ] <3 clicks from start to saved consult
- [ ] Mobile-responsive voor tablet workflows
- [ ] Offline capability voor network issues

**Business Impact Targets**:
- [ ] 60%+ reduction in consult documentation time
- [ ] 95%+ SOEP compliance score
- [ ] Integration ready voor top 5 EPD systems
- [ ] ROI positive binnen 2 maanden gebruik

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Maintained by**: Lead Product Architecture Team
**Next Review**: Q2 2025