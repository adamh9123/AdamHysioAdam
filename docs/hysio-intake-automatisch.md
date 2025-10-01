# BLAUWDRUK: Hysio Intake Automatisch

## 1. Visie & Gebruikersprofiel (De "Waarom")

### Doel van de module
De Hysio Intake Automatisch module lost het kernprobleem op van tijdrovende, handmatige intake-documentatie voor fysiotherapeuten. In plaats van 30-45 minuten te besteden aan het uittypen van een gestructureerde anamnese, onderzoeksbevindingen en behandelplan, kan de therapeut in één enkele sessie alle intake-informatie vastleggen via audio-opname of handmatige invoer, en binnen 15-20 seconden een volledig gestructureerde HHSB-conforme intake krijgen die direct bruikbaar is voor het patiëntendossier.

### Doelgroep
Deze module is ideaal voor **ervaren fysiotherapeuten die efficiëntie boven alles stellen**. Dit zijn therapeuten die:
- Vertrouwd zijn met de HHSB-methodiek en weten wat er in elk onderdeel hoort
- Geen stapsgewijze begeleiding nodig hebben bij het afnemen van een intake
- Waarde hechten aan snelheid en automatisering
- Comfortabel zijn met het voeren van een volledige intake-sessie in één keer
- Vertrouwen hebben in AI-gegenereerde output die zij kunnen valideren en aanpassen

### Kernfilosofie
**"Één gesprek, één klik, één compleet dossier"**

De filosofie is maximale efficiëntie door AI-geassisteerde automatisering. De therapeut voert het intake-gesprek zoals altijd, maar de technologie neemt alle documentatielast weg en zorgt voor een directe transformatie van gesproken woorden naar professionele, gestructureerde documentatie.

---

## 2. De Gebruikersjourney (De "Wat" - Golden Path)

1. **Landing & Setup**: De gebruiker navigeert naar `/scribe/intake-automatisch`. Het scherm toont twee hoofdpanelen: links de "Intake Voorbereiding" (leeg) en rechts "Intake Opname" met drie invoermethoden.

2. **Optionele Voorbereiding**: De gebruiker kan optioneel een context-document uploaden (verwijsbrief, vorig verslag) en klikt "Voorbereiding Genereren". Een AI-gegenereerde voorbereidingstekst verschijnt in het linkerpaneel binnen 3-5 seconden.

3. **Input Keuze**: De gebruiker kiest tussen drie invoermethoden in het rechterpaneel:
   - **Live Opname**: Klikt "Start opname", voert de volledige intake uit (anamnese + onderzoek + conclusie), klikt "Stop opname"
   - **Upload Audio**: Sleept een audiobestand naar het upload-gebied of klikt "selecteer bestand"
   - **Handmatige Invoer**: Typt de intake-informatie direct in het tekstveld

4. **Verificatie**: Het systeem toont een bevestiging van de input (groene indicator met bestandsgrootte/opname-duur of tekstlengte).

5. **Processing**: Gebruiker klikt "Verwerk Volledige Intake". Het systeem toont:
   - Eerste fase: "🎤 Audio wordt getranscribeerd..." (alleen bij audio-input)
   - Tweede fase: "🤖 AI analyseert intake gegevens..."
   - Duur: 15-30 seconden afhankelijk van de lengte van de input

6. **Success State**: Het scherm toont een succesbericht met verwerkingsinformatie en navigeert automatisch naar `/scribe/intake-automatisch/conclusie` binnen 2 seconden.

7. **Resultaten Review**: De conclusiepagina toont drie uitklapbare secties:
   - **HHSB Anamnesekaart**: Hulpvraag, Historie, Stoornissen, Beperkingen + Samenvatting
   - **Onderzoeksbevindingen**: Inspectie, Palpatie, Bewegingsonderzoek, Functionele Testen
   - **Klinische Conclusie**: Diagnose, Behandelplan, Prognose, Vervolgafspraken

8. **Export & Afsluiting**: Gebruiker kan individuele secties kopiëren, de volledige intake exporteren naar PDF/DOCX, of teruggaan naar het dashboard.

---

## 3. User Interface (UI) & Componenten-Analyse (De "Hoe het eruitziet")

### Pagina Layout

**Hoofdpagina (`/scribe/intake-automatisch`)**:
- **Header**: Logo + titel "Hysio Intake (Automatisch)" + patient info + status badges
- **Twee-koloms layout**:
  - Links (50%): Voorbereiding paneel
  - Rechts (50%): Input paneel
- **Footer**: Proces uitleg in drie stappen

**Conclusie Pagina (`/scribe/intake-automatisch/conclusie`)**:
- **Header**: Success state met completion info
- **Enkele kolom**: Drie uitklapbare result cards
- **Floating Actions**: Export en navigatie knoppen

### Sleutelcomponenten

#### `AutomatedIntakePage` (`/app/scribe/intake-automatisch/page.tsx`)
- **Functie**: De hoofd-orchestrator van de intake workflow
- **Locatie**: Volledige pagina component
- **Key Features**:
  - Dual-panel layout management
  - State orchestration voor preparation, audio, manual input
  - Integration met transcription API en HHSB processing API
  - Automatic navigation naar resultaten

#### `UnifiedAudioInput` (`/components/ui/unified-audio-input.tsx`)
- **Functie**: Multi-modal audio input component
- **Locatie**: Rechterpaneel van de hoofdpagina
- **Key Features**:
  - Live audio recording met Web Audio API
  - File upload met drag-and-drop
  - Real-time recording feedback (timer, waveform simulatie)
  - Audio playback controls
  - Automatic file validation (type, size)
  - Tips carousel tijdens opname

#### `FileUpload` (`/components/ui/file-upload.tsx`)
- **Functie**: Context document upload voor preparation
- **Locatie**: Bovenkant van linkerpaneel
- **Key Features**:
  - PDF, DOC, DOCX, TXT support
  - 10MB size limit
  - Visual feedback voor uploaded files

#### `AutomatedIntakeConclusie` (`/app/scribe/intake-automatisch/conclusie/page.tsx`)
- **Functie**: Results display en export functionality
- **Locatie**: Dedicated results page
- **Key Features**:
  - Collapsible sections voor elke result category
  - Copy-to-clipboard voor individuele secties
  - Export naar PDF/DOCX
  - Red flags highlighting

### Component States

#### Preparation Panel States
- **Empty State**: "Geen voorbereiding beschikbaar" met generate button
- **Loading State**: Spinner + "Voorbereiding genereren..."
- **Generated State**: AI content in styled box + "Regenereren" button
- **Error State**: Error message met retry optie

#### Audio Input States
- **Idle State**: Record button + upload area + manual text field
- **Recording State**: Stop button + timer + animated waveform + tips carousel
- **Recorded State**: Groene bevestiging + playback controls + reset optie
- **Processing State**: "🎤 Audio wordt getranscribeerd..." met spinner

#### Process Button States
- **Disabled**: Grijs, "Selecteer een invoermethode..."
- **Ready**: Groen, "Verwerk Volledige Intake"
- **Processing**: Spinner + "Transcriberen..." of "Verwerken..."
- **Complete**: Checkmark + "Voltooid"

---

## 4. Backend Processen & API-Flow (De "Wat er achter de schermen gebeurt")

### Preparation Generation Flow

1. **Frontend**: User klikt "Voorbereiding Genereren" → `generatePreparation()` functie
2. **Frontend**: Context document wordt gelezen (indien geüpload) via `FileReader` API
3. **API Call**: `POST /api/preparation` met body:
   ```json
   {
     "workflowType": "intake-automatisch",
     "step": "preparation",
     "patientInfo": {...},
     "previousStepData": "context document content"
   }
   ```
4. **Backend**: OpenAI API call met preparation system prompt
5. **Backend**: Response wordt teruggestuurd als `{ data: { content: "..." } }`
6. **Frontend**: Zustand store wordt geüpdatet → UI re-render

### Main Processing Flow

1. **Frontend**: User klikt "Verwerk Volledige Intake" → `processIntake()` functie
2. **Frontend**: Input data wordt verzameld en gevalideerd
3. **Audio Path**:
   - **3a**: `transcribeAudio(blob)` → `POST /api/transcribe`
   - **3b**: Server-side audio splitting (indien >25MB) met `splitAudioFile()`
   - **3c**: Groq Whisper API call(s) voor transcriptie
   - **3d**: Response: `{ success: true, transcript: "...", duration: 123 }`
4. **Manual Path**: Direct naar stap 5 met user input
5. **API Call**: `POST /api/hhsb/process` met body:
   ```json
   {
     "workflowType": "intake-automatisch",
     "patientInfo": {...},
     "preparation": "...",
     "inputData": {
       "type": "transcribed-audio" | "manual",
       "data": "transcript text",
       "originalSource": "recording" | "file"
     }
   }
   ```
6. **Backend**: Input validation met transcript lengte check (>10 karakters)
7. **Backend**: `generateCompleteIntakeAnalysis()` functie:
   - Enhanced HHSB generation met `createEnhancedHHSBPrompt()`
   - Red flags detection met `detectRedFlags()`
   - Quality validation met `validateHHSBCompleteness()`
8. **Backend**: Response met complete intake structuur:
   ```json
   {
     "hhsbStructure": {...},
     "enhancedHHSBStructure": {...},
     "fullStructuredText": "...",
     "transcript": "...",
     "redFlagsDetailed": [...],
     "processingDuration": 23.4
   }
   ```
9. **Frontend**: Store update → automatic navigation naar `/conclusie`

### Error Handling Flow

- **Transcription Failures**: 413 errors → automatic retry via splitting
- **Empty Transcripts**: Client-side validation voorkomt API call
- **API Errors**: Structured error logging + user-friendly messages
- **Network Issues**: Fallback naar manual navigation buttons

---

## 5. AI & Prompt Engineering (De "Magie")

### Preparation Generation

**System Prompt** (OpenAI GPT-4):
```
Je bent een ervaren fysiotherapeut die een intake voorbereidt. Genereer een gerichte voorbereidingstekst op basis van de patiëntinformatie en eventuele context documenten.

Structuur je voorbereiding als volgt:
1. **Verwachtingen**: Wat ga je onderzoeken?
2. **Aandachtspunten**: Waar let je extra op?
3. **Mogelijke Hypotheses**: Wat zou er aan de hand kunnen zijn?
4. **Onderzoeksstrategie**: Welke testen ga je doen?

Houd het praktisch, concreet en gericht op de hoofdklacht.
```

**Input**: Patient info + optional context document
**Output**: Gestructureerde preparation tekst (markdown format)

### Complete Intake Analysis

**System Prompt** (OpenAI GPT-4 via `createEnhancedHHSBPrompt()`):
```
Je bent een ervaren fysiotherapeut die een gestructureerde HHSB anamnese uitvoert volgens de Nederlandse fysiotherapie richtlijnen.

HHSB is de kern van de fysiotherapeutische anamnese en moet volledig en systematisch ingevuld worden:

**H - HULPVRAAG:**
- Wat wil de patiënt concreet bereiken? (functionele doelen)
- Welke activiteiten wil de patiënt weer kunnen uitvoeren?
- Wat zijn de verwachtingen van de behandeling?
- Hoe ervaart de patiënt de impact op kwaliteit van leven?

**H - HISTORIE:**
- Wanneer en hoe zijn de klachten ontstaan? (trauma, geleidelijk, acuut)
- Hoe zijn de klachten verlopen? (progressief, stabiel, fluctuerend)
- Eerdere behandelingen en resultaten?
- Relevante medische voorgeschiedenis?

**S - STOORNISSEN:**
- Pijn: lokalisatie, karakter, intensiteit (NRS 0-10), uitlokkende/verzachtende factoren
- Bewegingsbeperkingen: welke gewrichten, welke bewegingen, mate van beperking
- Krachtverlies: welke spiergroepen, functionele impact
- Sensibiliteitsstoornissen: lokalisatie, aard van de stoornis
- Andere symptomen: zwelling, instabiliteit, vermoeidheid

**B - BEPERKINGEN:**
- ADL: wat kan de patiënt niet meer of moeilijk uitvoeren?
- Werk: welke werkzaamheden zijn problematisch?
- Sport/recreatie: welke activiteiten zijn beperkt?
- Sociale participatie: impact op sociaal functioneren?

Daarnaast genereer je ook:
**ONDERZOEKSBEVINDINGEN** en **KLINISCHE CONCLUSIE**

Geef je antwoord in een gestructureerd format met duidelijke headers.
```

**Data Structuur Output**:
```typescript
{
  hhsbStructure: {
    hulpvraag: string,
    historie: string,
    stoornissen: string,
    beperkingen: string,
    anamneseSummary: string | {
      keyFindings: string[],
      clinicalImpression: string,
      priorityAreas: string[],
      redFlagsNoted: string[]
    },
    redFlags: string[]
  },
  enhancedHHSBStructure: {
    // Detailed nested object with structured data
  },
  onderzoeksBevindingen: {
    inspectie: string,
    palpatie: string,
    bewegingsonderzoek: string,
    functioneleTesten: string
  },
  klinischeConclusie: {
    diagnose: string,
    behandelplan: string,
    prognose: string,
    vervolgafspraken: string
  }
}
```

### Red Flags Detection

**Automated Detection**: De `detectRedFlags()` functie scant de transcript op kritieke termen:
- Neurologische symptoms (uitval, tintelingen, krachtverlies)
- Trauma indicaties (valongeluk, whiplash)
- Systemische symptomen (koorts, gewichtsverlies)
- Medicatie interacties

**Output**: Structured array met severity levels en aanbevelingen

---

## 6. State Management (Het "Geheugen" van de app)

### Zustand Store Structure (`scribe-store.ts`)

**Relevante State Slices voor Intake Automatisch**:

```typescript
interface ScribeState {
  // Patient data (persistent across workflows)
  patientInfo: {
    initials: string,
    birthYear: string,
    gender: 'male' | 'female',
    chiefComplaint: string,
    additionalInfo?: string
  } | null,

  // Current workflow tracking
  currentWorkflow: 'intake-automatisch' | null,

  // Automated intake specific data
  workflowData: {
    automatedIntakeData: {
      preparation?: string,
      recording?: File,
      transcript?: string,
      result?: CompleteIntakeResult,
      completed: boolean
    } | null
  }
}
```

### Data Flow Patterns

**Preparation Flow**:
1. User generates preparation → `setAutomatedIntakeData({ preparation: content })`
2. Component re-renders met nieuwe preparation content
3. Preparation blijft beschikbaar tijdens hele workflow

**Input Processing Flow**:
1. Audio/manual input → `setAutomatedIntakeData({ recording/transcript: data })`
2. Processing completes → `setAutomatedIntakeData({ result: data, completed: true })`
3. Navigation naar conclusie → state wordt gelezen door conclusie page
4. `markStepComplete('automated-intake')` voor completion tracking

**Persistence**:
- State wordt automatisch gepersisteert naar localStorage
- Bij page reload worden data hersteld
- Cross-tab synchronisatie via storage events

### Critical State Transitions

1. **Empty → Preparation Generated**: `automatedIntakeData.preparation` set
2. **Input Ready → Processing**: `isProcessing: true` + loading states
3. **Processing → Complete**: `result` set + `completed: true` + auto-navigation
4. **Complete → Viewing Results**: State gelezen door conclusie component

---

## 7. Status & Openstaande Taken (De "Werklijst")

### Wat is werkend ✅

1. **Complete Audio Pipeline**:
   - Live recording via Web Audio API
   - File upload met validation (100MB limit)
   - Automatic splitting voor grote bestanden (>25MB)
   - Groq Whisper transcription met retry logic

2. **AI Processing Chain**:
   - Preparation generation met OpenAI
   - Complete HHSB analysis met enhanced prompts
   - Red flags detection en validation
   - Quality scoring voor output

3. **State Management**:
   - Persistent state via Zustand + localStorage
   - Cross-workflow data sharing
   - Automatic navigation tussen stappen

4. **User Experience**:
   - Real-time feedback tijdens alle stappen
   - Comprehensive error handling
   - Loading states en progress indicators
   - Responsive design voor alle screen sizes

5. **Results Display**:
   - Structured output met collapsible sections
   - Copy-to-clipboard functionality
   - Export naar verschillende formaten

### Wat is gebroken of ontbreekt ❌

#### High Priority Issues

1. **Export Functionality Incomplete**:
   - PDF export is geïmplementeerd maar niet thoroughly tested
   - DOCX export ontbreekt volledig
   - Email integration voor directe verzending naar patiënt/collega

2. **Enhanced Results Editing**:
   - Results zijn read-only op conclusie page
   - Geen inline editing van HHSB secties
   - Geen version history of change tracking

3. **Advanced Audio Features**:
   - Noise reduction preprocessing ontbreekt
   - Speaker identification voor patient vs therapeut
   - Audio bookmarking voor later terug te vinden secties

#### Medium Priority Issues

4. **Integration Gaps**:
   - Geen directe EPD (Electronic Patient Record) integration
   - Ontbrekende API voor third-party system connectors
   - Geen automatische sync met practice management software

5. **Quality Assurance Tools**:
   - Geen confidence scoring voor AI output
   - Ontbrekende validation rules voor incomplete intakes
   - Geen peer review workflow voor junior therapeuts

6. **Analytics & Insights**:
   - Geen usage analytics (completion rates, common errors)
   - Ontbrekende performance metrics (processing times, accuracy)
   - Geen reporting dashboard voor practice management

#### Low Priority Enhancements

7. **Advanced Personalization**:
   - Geen user-specific prompt customization
   - Ontbrekende template system voor frequent conditions
   - Geen learning from user corrections

8. **Collaboration Features**:
   - Geen multi-therapeut workflows (supervisor review)
   - Ontbrekende comment system voor internal notes
   - Geen task assignment voor follow-up actions

### Immediate Action Items

**Week 1**:
- Fix DOCX export implementation
- Add inline editing voor results
- Implement confidence scoring display

**Week 2**:
- Complete PDF export testing
- Add email integration
- Implement basic analytics tracking

**Week 3**:
- EPD integration planning
- Audio enhancement research
- User feedback collection system

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Maintained by**: Lead Product Architecture Team
**Next Review**: Q2 2025