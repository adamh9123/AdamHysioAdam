# BLAUWDRUK: Hysio Intake Stapsgewijs

## 1. Visie & Gebruikersprofiel (De "Waarom")

### Doel van de module
De Hysio Intake Stapsgewijs module lost het probleem op van ontbrekende structuur en begeleiding bij het afnemen van fysiotherapie-intakes. In plaats van een overweldigende "alles-in-één" aanpak, begeleidt deze module therapeuten systematisch door elke fase van de HHSB-methodiek, waarbij elke stap gefocused input vraagt en directe feedback geeft. Dit resulteert in consistente, complete en hoogwaardige intake-documentatie, ook voor beginnende of onzekere therapeuten.

### Doelgroep
Deze module is ideaal voor **therapeuten die structuur en begeleiding waarderen bij intake-processen**. Dit zijn therapeuten die:
- Nog niet volledig vertrouwd zijn met de HHSB-methodiek of deze willen perfectioneren
- Waarde hechten aan stap-voor-stap begeleiding en educatie
- Kwaliteit en volledigheid boven snelheid stellen
- Zekerheid willen dat ze niets vergeten of over het hoofd zien
- Leren door het proces te doorlopen en feedback te krijgen op elke stap

### Kernfilosofie
**"Stap voor stap naar perfecte intakes"**

De filosofie is kwaliteit door gestructureerde begeleiding. Elke stap in de HHSB-methodiek krijgt de tijd en aandacht die het verdient, met gerichte vragen, tips en validatie. De therapeut bouwt expertise op door het proces en leert tegelijkertijd de fijne kneepjes van professionele intake-documentatie.

---

## 2. De Gebruikersjourney (De "Wat" - Golden Path)

1. **Workflow Selectie**: De gebruiker navigeert naar `/scribe/workflow` en kiest "Intake Stapsgewijs". Het systeem toont een overzicht van de drie stappen met progress tracking.

2. **Stap 1 - Anamnese Setup**: De gebruiker gaat naar `/scribe/intake-stapsgewijs/anamnese`. Het scherm toont twee panelen: links "Anamnese Voorbereiding" (optioneel) en rechts "Anamnese Opname".

3. **Voorbereiding Genereren**: Gebruiker klikt optioneel "Genereer Voorbereiding" in het linkerpaneel. Een gerichte voorbereidingstekst verschijnt binnen 3-5 seconden.

4. **Anamnese Input**: Gebruiker kiest input-methode in rechterpaneel:
   - Live opname van anamnese-gesprek, OF
   - Upload van audio-bestand, OF
   - Handmatige notities invoer

5. **Anamnese Verwerking**: Gebruiker klikt "Verwerk Anamnese". Systeem toont twee-fase processing:
   - "🎤 Audio transcriptie..." (indien audio)
   - "🤖 AI analyseert anamnese..."
   - Duur: 10-15 seconden

6. **Anamnese Resultaten**: Automatische navigatie naar `/scribe/intake-stapsgewijs/anamnese-resultaat`. Toont gestructureerde HHSB anamnese-output met edit mogelijkheden.

7. **Stap 2 - Onderzoek**: Gebruiker navigeert naar `/scribe/intake-stapsgewijs/onderzoek`. Vergelijkbare twee-panelen layout met focus op fysiek onderzoek.

8. **Onderzoek Processing**: Herhaling van input → processing → resultaten cyclus, maar nu gericht op onderzoeksbevindingen.

9. **Stap 3 - Klinische Conclusie**: Gebruiker gaat naar `/scribe/intake-stapsgewijs/klinische-conclusie`. Combineert vorige stappen tot diagnose en behandelplan.

10. **Finale Review**: Complete intake wordt samengebracht op een overview pagina met alle drie componenten en export mogelijkheden.

---

## 3. User Interface (UI) & Componenten-Analyse (De "Hoe het eruitziet")

### Pagina Layout

**Workflow Overview (`/scribe/workflow`)**:
- **Header**: Patient info + workflow selector
- **Progress Card**: Visual progress indicator voor alle drie stappen
- **Quick Access**: Direct links naar elke stap met completion status

**Stap Pagina's (`/scribe/intake-stapsgewijs/{stap}`)**:
- **Header**: Step indicator (Stap X van 3) + progress bar
- **Twee-koloms layout**:
  - Links (40%): Preparation/guidance paneel
  - Rechts (60%): Input paneel
- **Navigation Footer**: Terug/Volgende knoppen met validatie

**Resultaat Pagina's (`/scribe/intake-stapsgewijs/{stap}-resultaat`)**:
- **Header**: Completion indicator + step info
- **Enkele kolom**: Structured results met edit capabilities
- **Action Bar**: Save, Export, Continue buttons

### Sleutelcomponenten

#### `WorkflowPage` (`/app/scribe/workflow/page.tsx`)
- **Functie**: Central workflow orchestrator en progress tracking
- **Locatie**: Hoofdpagina voor stap-selectie
- **Key Features**:
  - Visual progress tracking voor alle stappen
  - Step completion validation
  - Quick navigation tussen stappen
  - Workflow state persistence

#### `AnamnesePage` (`/app/scribe/intake-stapsgewijs/anamnese/page.tsx`)
- **Functie**: Gestructureerde anamnese input en processing
- **Locatie**: Eerste stap in de workflow
- **Key Features**:
  - Specifieke anamnese-focused guidance
  - Audio input met anamnese-tips carousel
  - Real-time input validation
  - Integration met anamnese-specific AI prompts

#### `OnderzoekPage` (`/app/scribe/intake-stapsgewijs/onderzoek/page.tsx`)
- **Functie**: Fysiek onderzoek documentatie en analyse
- **Locatie**: Tweede stap in de workflow
- **Key Features**:
  - Onderzoek-specific input forms
  - Visual guides voor test procedures
  - Photo upload mogelijkheid voor visuele bevindingen
  - Integration met onderzoek-specific AI analysis

#### `KlinischeConclusie` (`/app/scribe/intake-stapsgewijs/klinische-conclusie/page.tsx`)
- **Functie**: Diagnose en behandelplan formulering
- **Locatie**: Derde/finale stap in de workflow
- **Key Features**:
  - Combines vorige stappen data
  - Treatment planning wizard
  - Goal-setting templates
  - Integration met behandel-protocol database

#### `HHSBResultsPanel` (`/components/ui/hhsb-results-panel.tsx`)
- **Functie**: Unified results display component
- **Locatie**: Alle resultaat pagina's
- **Key Features**:
  - Editable result sections
  - Real-time save functionality
  - Copy-to-clipboard voor secties
  - Export integration

### Component States

#### Step Navigation States
- **Incomplete**: Grijs, disabled, "Vorige stap niet voltooid"
- **Available**: Blauw, enabled, "Stap X: {Naam}"
- **In Progress**: Oranje, enabled, "Actief: {Naam}"
- **Completed**: Groen, enabled, checkmark + "Voltooid: {Naam}"

#### Input Panel States
- **Empty**: Placeholder content met input instructions
- **Active Input**: Focus indicators en real-time validation
- **Validation Error**: Rood border met specific error messages
- **Ready for Processing**: Groen accent met process button enabled

#### Results Panel States
- **Loading**: Skeleton loading voor alle secties
- **Editable**: Inline editing controls zichtbaar
- **Saving**: Spinner op save actions
- **Saved**: Checkmark confirmation met timestamp

---

## 4. Backend Processen & API-Flow (De "Wat er achter de schermen gebeurt")

### Step-by-Step Processing Flow

#### Anamnese Flow
1. **Frontend**: User completes anamnese input → `processAnamnese()` functie
2. **Transcription** (indien audio): `POST /api/transcribe` → Groq Whisper processing
3. **API Call**: `POST /api/hhsb/process` met:
   ```json
   {
     "workflowType": "intake-stapsgewijs",
     "step": "anamnese",
     "patientInfo": {...},
     "preparation": "...",
     "inputData": {
       "type": "transcribed-audio" | "manual",
       "data": "transcript/notes"
     }
   }
   ```
4. **Backend**: Anamnese-specific AI processing met focused prompts
5. **Response**: Gestructureerde anamnese-output → store update
6. **Navigation**: Automatic redirect naar `/anamnese-resultaat`

#### Onderzoek Flow
1. **Frontend**: User input onderzoek data → `processOnderzoek()` functie
2. **Data Enrichment**: Previous anamnese data wordt gecombineerd
3. **API Call**: `POST /api/hhsb/process` met:
   ```json
   {
     "workflowType": "intake-stapsgewijs",
     "step": "onderzoek",
     "patientInfo": {...},
     "inputData": {...},
     "previousStepData": {
       "anamneseResult": {...}
     }
   }
   ```
4. **Backend**: Onderzoek-specific analysis met context van anamnese
5. **Integration**: Results worden gekoppeld aan anamnese data in store

#### Klinische Conclusie Flow
1. **Frontend**: User input conclusie data → `processConclusie()` functie
2. **Data Synthesis**: Alle vorige stappen worden gecombineerd
3. **API Call**: `POST /api/hhsb/process` met volledige context:
   ```json
   {
     "workflowType": "intake-stapsgewijs",
     "step": "klinische-conclusie",
     "patientInfo": {...},
     "inputData": {...},
     "previousStepData": {
       "anamneseResult": {...},
       "onderzoekResult": {...}
     }
   }
   ```
4. **Backend**: Comprehensive analysis met alle beschikbare data
5. **Final Assembly**: Complete intake wordt samengesteld en gevalideerd

### Progressive Data Building

**Step 1 Output** → **Step 2 Input** → **Step 3 Input** → **Final Output**

Elke stap bouwt voort op de vorige, waardoor de AI steeds meer context heeft en betere, meer geïntegreerde output kan genereren.

---

## 5. AI & Prompt Engineering (De "Magie")

### Step-Specific Prompts

#### Anamnese Prompt (Step 1)
```
Je bent een ervaren fysiotherapeut die zich volledig focust op de anamnese-fase van de intake.

FOCUS: Genereer alleen HHSB Anamnese-componenten:
- H: Hulpvraag (wat wil patiënt bereiken?)
- H: Historie (ontstaan, verloop, voorgeschiedenis)
- S: Stoornissen (pijn, beweging, kracht, sensibiliteit)
- B: Beperkingen (ADL, werk, sport, sociaal)

NIET genereren: Onderzoeksbevindingen of behandelplan - dat komt in volgende stappen.

Geef gedetailleerde, specifieke informatie per HHSB-component.
Markeer rode vlaggen duidelijk.
Houd het professioneel maar toegankelijk.
```

#### Onderzoek Prompt (Step 2)
```
Je bent een fysiotherapeut die het fysieke onderzoek analyseert.
Je hebt toegang tot de anamnese uit stap 1.

CONTEXT: [Anamnese resultaten worden hier ingevoegd]

FOCUS: Genereer gestructureerde onderzoeksbevindingen:
- Inspectie (houding, zwelling, kleur, etc.)
- Palpatie (drukpijn, spanning, temperatuur)
- Bewegingsonderzoek (ROM, kwaliteit, pijn)
- Functionele testen (kracht, stabiliteit, coördinatie)
- Specifieke testen (gebaseerd op anamnese hypotheses)

INTEGRATIE: Verbind bevindingen expliciet met anamnese-informatie.
Bevestig of weerleg hypotheses uit de anamnese.
```

#### Klinische Conclusie Prompt (Step 3)
```
Je bent een fysiotherapeut die de definitieve diagnose en behandelplan opstelt.
Je hebt volledige toegang tot anamnese EN onderzoek.

CONTEXT: [Alle vorige stap resultaten worden hier ingevoegd]

FOCUS: Genereer complete klinische conclusie:
- Diagnose (primair + eventueel secundair)
- Behandelplan (doelen, interventies, frequentie)
- Prognose (verwachte verbetering, tijdslijn)
- Vervolgafspraken (controle, herevaluatie)
- Patiënt-educatie aanbevelingen

SYNTHESE: Toon duidelijk hoe anamnese + onderzoek → conclusie leiden.
Maak het behandelplan SMART (Specific, Measurable, Achievable, Relevant, Time-bound).
```

### Progressive AI Enhancement

Elke stap heeft toegang tot meer context:
- **Stap 1**: Alleen patient info + huidige input
- **Stap 2**: Stap 1 resultaten + nieuwe input
- **Stap 3**: Stap 1 + 2 resultaten + nieuwe input

Dit zorgt voor steeds betere, meer geïntegreerde AI-output.

---

## 6. State Management (Het "Geheugen" van de app)

### Zustand Store Structure (`scribe-store.ts`)

**Stapsgewijs-specifieke State Slices**:

```typescript
interface ScribeState {
  currentWorkflow: 'intake-stapsgewijs' | null,

  workflowData: {
    // Step completion tracking
    completedSteps: string[], // ['anamnese', 'onderzoek', 'klinische-conclusie']

    // Individual step data
    anamneseData: {
      preparation?: string,
      recording?: File,
      transcript?: string,
      result?: HHSBStructure,
      completed: boolean
    } | null,

    onderzoekData: {
      preparation?: string,
      recording?: File,
      transcript?: string,
      photos?: File[],
      result?: OnderzoekResult,
      completed: boolean
    } | null,

    klinischeConclusieData: {
      preparation?: string,
      recording?: File,
      transcript?: string,
      result?: KlinischeConclusieResult,
      completed: boolean
    } | null,

    // Combined final result
    completeIntakeResult?: CompleteStapsgewijsResult
  }
}
```

### Progressive Data Flow

**Linear Progression**:
1. **Anamnese**: Patient info → `anamneseData` → mark 'anamnese' completed
2. **Onderzoek**: Anamnese data + new input → `onderzoekData` → mark 'onderzoek' completed
3. **Conclusie**: All previous + new input → `klinischeConclusieData` → final assembly

**Cross-Step Dependencies**:
- Onderzoek heeft toegang tot `anamneseData.result`
- Conclusie heeft toegang tot beide vorige resultaten
- Navigation validation checkt completion status

**State Persistence Layers**:
- **Session**: In-memory Zustand store
- **Browser**: localStorage voor page reloads
- **Cross-tab**: Storage events voor multi-tab sync

### Navigation State Logic

```typescript
const canNavigateToStep = (step: string) => {
  switch(step) {
    case 'anamnese': return true; // Always accessible
    case 'onderzoek': return completedSteps.includes('anamnese');
    case 'klinische-conclusie': return completedSteps.includes('onderzoek');
  }
}
```

---

## 7. Status & Openstaande Taken (De "Werklijst")

### Wat is werkend ✅

1. **Complete Stap 1 - Anamnese**:
   - Full audio pipeline met transcription
   - Anamnese-specific AI processing
   - Results display met editing capabilities
   - Navigation naar volgende stap

2. **Workflow State Management**:
   - Progressive step completion tracking
   - Data persistence tussen stappen
   - Navigation validation en protection
   - Cross-step data sharing

3. **Core Infrastructure**:
   - Unified audio input component
   - HHSB results display component
   - Error handling en recovery
   - Responsive design voor alle stappen

4. **AI Integration**:
   - Step-specific prompt engineering
   - Context building tussen stappen
   - Red flags detection per stap
   - Quality validation

### Wat is gebroken of ontbreekt ❌

#### High Priority - Critical Gaps

1. **Stap 2 - Onderzoek Implementation**:
   - `/onderzoek/page.tsx` is incomplete/basic
   - Geen onderzoek-specific UI components
   - Ontbrekende foto upload functionality
   - Geen onderzoek-specific AI prompts
   - Geen integration met anamnese context

2. **Stap 3 - Klinische Conclusie Implementation**:
   - `/klinische-conclusie/page.tsx` is minimal
   - Geen treatment planning wizard
   - Ontbrekende goal-setting templates
   - Geen protocol database integration
   - Geen synthesis van vorige stappen

3. **Results Integration**:
   - Geen unified overview na alle stappen
   - Ontbrekende final export functionality
   - Geen comparison tussen stappen
   - Geen version control voor edits

#### Medium Priority - UX Issues

4. **Navigation & Flow**:
   - Inconsistent navigation tussen stappen
   - Geen "save and continue later" functionality
   - Ontbrekende progress indicators
   - Geen breadcrumb navigation

5. **Content Quality**:
   - AI prompts zijn nog niet geoptimaliseerd per stap
   - Geen validation rules voor step completeness
   - Ontbrekende content templates
   - Geen user-specific customization

6. **Data Management**:
   - Geen data export tussen stappen
   - Ontbrekende backup/restore functionality
   - Geen audit trail van changes
   - Geen collaborative editing features

#### Low Priority - Enhancements

7. **Advanced Features**:
   - Geen step-specific help system
   - Ontbrekende tutorial/onboarding
   - Geen analytics per stap
   - Geen A/B testing voor prompts

8. **Integration & Automation**:
   - Geen EPD integration per stap
   - Ontbrekende API voor external tools
   - Geen automated quality checks
   - Geen peer review workflow

### Development Roadmap

#### Week 1-2: Complete Stap 2 (Onderzoek)
- Implement complete `OnderzoekPage` component
- Add photo upload en management
- Create onderzoek-specific AI prompts
- Build integration met anamnese data

#### Week 3-4: Complete Stap 3 (Klinische Conclusie)
- Implement complete `KlinischeConclusie` component
- Build treatment planning wizard
- Create goal-setting templates
- Implement data synthesis logic

#### Week 5-6: Integration & Polish
- Build unified final overview page
- Implement complete export functionality
- Add advanced navigation features
- Quality assurance en testing

#### Week 7-8: Advanced Features
- Add collaborative editing
- Implement audit trails
- Build analytics dashboard
- Create user onboarding system

### Critical Success Metrics

**Technical Completion**:
- [ ] All 3 stappen fully functional
- [ ] Complete data flow tussen stappen
- [ ] Robust error handling
- [ ] Mobile responsive design

**User Experience**:
- [ ] <30 seconds per stap processing time
- [ ] >95% step completion rate
- [ ] <5% user error rate
- [ ] Positive user feedback (>4.0/5.0)

**Business Value**:
- [ ] 50%+ reduction in intake documentation time
- [ ] 90%+ HHSB compliance score
- [ ] Integration ready voor EPD systems
- [ ] Scalable voor multi-practice deployment

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Maintained by**: Lead Product Architecture Team
**Next Review**: Q2 2025