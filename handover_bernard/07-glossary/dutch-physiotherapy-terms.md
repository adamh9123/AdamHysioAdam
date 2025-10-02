# Dutch Physiotherapy Terminology

## Overview

This glossary contains essential Dutch physiotherapy terms, clinical frameworks, and medical terminology used throughout Hysio. Understanding these terms is critical for working with the AI prompts and understanding user workflows.

**Note**: All prompts and UI text in Hysio use Dutch language and Dutch healthcare standards.

---

## Clinical Documentation Frameworks

### SOEP (Subjectief, Objectief, Evaluatie, Plan)

**English**: SOAP (Subjective, Objective, Assessment, Plan)

**Used for**: Follow-up consultation documentation

**Components**:
- **Subjectief (S)**: What the patient reports (symptoms, complaints, feelings)
  - Dutch: "Wat zegt de patiënt?"
  - Example: "Patiënt meldt schouderpijn rechts sinds 2 weken"

- **Objectief (O)**: What the therapist observes and measures
  - Dutch: "Wat observeer/meet/doe je als therapeut?"
  - Example: "ROM schouder elevatie: 140° (was 120° vorig consult)"

- **Evaluatie (E)**: Clinical analysis and interpretation
  - Dutch: "Klinische analyse en redenering"
  - Example: "Progressie in ROM, behandeling effectief"

- **Plan (P)**: Treatment plan and next steps
  - Dutch: "Behandelplan en vervolgstappen"
  - Example: "Voortzetten mobilisatie, toevoegen krachtoefeningen"

**File**: `hysio/src/lib/prompts/consult/stap1-verwerking-soep-verslag.ts`

---

### HHSB (Hulpvraag, Historie, Stoornissen, Beperkingen)

**English**: Roughly translates to: Help Request, History, Impairments, Limitations

**Used for**: Initial intake anamnesis documentation

**Components**:
- **Hulpvraag (H)**: Patient's help request and goals
  - "What does the patient want help with?"
  - Example: "Patiënt wil schouderpijn verminderen om weer te kunnen sporten"

- **Historie (H)**: Medical and treatment history
  - "How did this develop? What treatments tried?"
  - Example: "Sinds 2 weken, acute onset na val, eerder geen schouderproblematiek"

- **Stoornissen (S)**: Impairments (physical dysfunctions)
  - "What is objectively limited or dysfunctional?"
  - Example: "Pijn NPRS 7/10, ROM beperking elevatie 140° (normaal 180°)"

- **Beperkingen (B)**: Functional and participation limitations
  - "How does this affect daily life?"
  - Example: "Kan niet sporten, moeite met aankleden, werk beperkt uitgevoerd"

**Note**: Sometimes seen as "PHSB" in older code (legacy naming), but HHSB is standard

**File**: `hysio/src/lib/prompts/intake-stapsgewijs/stap2-verwerking-hhsb-anamnesekaart.ts`

---

### ICF Model (International Classification of Functioning)

**Dutch**: Internationale Classificatie van het menselijk Functioneren

**Used for**: Comprehensive patient assessment framework

**Components**:
1. **Functies en Anatomische Eigenschappen**: Body functions and structures
   - Example: ROM, strength, pain

2. **Activiteiten**: Activities (individual level)
   - Example: Walking, dressing, lifting

3. **Participatie**: Participation (social level)
   - Example: Work, sports, hobbies

4. **Externe Factoren**: Environmental factors
   - Example: Home setup, work demands

5. **Persoonlijke Factoren**: Personal factors
   - Example: Age, motivation, beliefs

---

## Clinical Assessment Frameworks

### LOFTIG (Pain Assessment)

**Dutch pain assessment framework**

**Components**:
- **L**ocatie: Location (where is the pain?)
- **O**ntstaan: Onset (how did it start?)
- **F**requentie: Frequency (how often?)
- **T**ijdsduur: Duration (how long does it last?)
- **I**ntensiteit: Intensity (how severe? 0-10 scale)
- **G**eschiedenis: History (previous episodes?)

**Example in Prompt**:
```
"Gebruik LOFTIG framework voor pijnbeschrijving:
- Locatie: Schouder rechts, lateraal
- Ontstaan: Acute trauma, val op schouder
- Frequentie: Continue, verergert bij beweging
- Tijdsduur: Sinds 2 weken
- Intensiteit: NPRS 7/10
- Geschiedenis: Geen eerdere schouderklachten"
```

---

### SCEGS (Goals Assessment)

**Dutch framework for assessing patient goals**

**Components**:
- **S**omatisch: Somatic/Physical goals
  - Example: "Vermindering pijn, verbetering ROM"

- **C**ognitief: Cognitive aspects
  - Example: "Begrijpen van blessure, realistische verwachtingen"

- **E**motioneel: Emotional aspects
  - Example: "Frustratie over beperking, angst voor chronische pijn"

- **G**edragsmatig: Behavioral aspects
  - Example: "Bereidheid tot huisoefeningen, therapietrouw"

- **S**ociaal: Social aspects
  - Example: "Impact op werk, sport, sociale activiteiten"

---

### DTF (Directe Toegang Fysiotherapie)

**English**: Direct Access Physiotherapy

**Used for**: Red flags screening guidelines for physiotherapists with direct patient access (no doctor referral required)

**Purpose**: Safety screening to identify conditions requiring medical referral

**Red Flag Categories**:
1. **Cardiovasculair**: Chest pain, shortness of breath, AAA signs
2. **Neurologisch**: Sudden severe headache, loss of consciousness, saddle anesthesia
3. **Oncologisch**: Unexplained weight loss, night sweats, malignancy history
4. **Infectieus**: Fever, systemic illness
5. **Traumatisch**: Recent significant trauma

**File**: `hysio/src/lib/medical/red-flags-detection.ts`

---

## Common Medical Terminology

### Pain Assessment

- **NPRS / NRS**: Numeric Pain Rating Scale (0-10)
  - 0 = geen pijn (no pain)
  - 10 = ergst voorstelbare pijn (worst imaginable pain)

- **VAS**: Visual Analog Scale
  - Continuous 0-100 scale

- **Pijnschaal**: Pain scale (generic term)

- **Stekend**: Stabbing pain
- **Dof**: Dull/aching pain
- **Brandend**: Burning pain
- **Schietend**: Shooting pain

### Range of Motion (ROM)

- **ROM**: Range of Motion (Nederlandse term: Bewegingsuitslag)
- **Actief ROM**: Active ROM (patient moves)
- **Passief ROM**: Passive ROM (therapist moves)
- **Eindgevoel**: End-feel (quality of resistance at end of ROM)

**Common Measurements**:
- **Elevatie**: Elevation (overhead movement)
- **Abductie**: Abduction (movement away from body)
- **Flexie**: Flexion (bending)
- **Extensie**: Extension (straightening)
- **Rotatie**: Rotation
  - **Exorotatie**: External rotation
  - Endorotatie**: Internal rotation

### Muscle Testing

- **MMT**: Manual Muscle Testing
- **Krachtsverlies**: Strength loss
- **Spierkracht**: Muscle strength

**MMT Grading**:
- Grade 0: Geen contractie (no contraction)
- Grade 1: Zichtbare/voelbare contractie (visible/palpable contraction)
- Grade 2: Beweging zonder zwaartekracht (movement without gravity)
- Grade 3: Beweging tegen zwaartekracht (movement against gravity)
- Grade 4: Beweging tegen lichte weerstand (movement against light resistance)
- Grade 5: Normale kracht (normal strength)

### Functional Tests

- **ADL**: Activities of Daily Living (Activiteiten van het Dagelijks Leven)
- **Functionele beperkingen**: Functional limitations
- **Participatieproblemen**: Participation restrictions

**Common Functional Tests**:
- **Timed Up and Go (TUG)**: Balance and mobility test
- **6-Minute Walk Test**: Endurance test
- **Functional Reach Test**: Balance test

---

## Specific Conditions & Tests

### Shoulder (Schouder)

**Common Conditions**:
- **SAPS**: Subacromiale Pijn Syndroom (Subacromial Pain Syndrome)
- **Frozen Shoulder**: Capsulitis adhesiva (adhesive capsulitis)
- **Rotator Cuff**: Rotator cuff scheur (tear)
- **Impingement**: Impingement syndroom

**Common Tests**:
- **Neer Test**: Impingement test
- **Hawkins-Kennedy Test**: Impingement test
- **Empty Can Test**: Supraspinatus test
- **Painful Arc**: Pijnlijke boog (pain during specific ROM)

### Knee (Knie)

**Common Conditions**:
- **Meniscusletsel**: Meniscus tear
- **Voorste Kruisbandletsel**: Anterior cruciate ligament (ACL) tear
- **Patellofemorale pijn**: Patellofemoral pain syndrome
- **Artrose**: Osteoarthritis

**Common Tests**:
- **Lachman Test**: ACL test
- **McMurray Test**: Meniscus test
- **Valgus/Varus Stress Test**: Ligament stability

### Ankle (Enkel)

**Common Conditions**:
- **Enkelverzwikking**: Ankle sprain
- **Laterale ligamentletsel**: Lateral ligament injury
- **Achillespeestendinopathie**: Achilles tendinopathy

**Common Tests**:
- **Anterior Drawer Test**: Ankle stability
- **Thompson Test**: Achilles tendon rupture

### Lower Back (Lage Rug)

**Common Conditions**:
- **Lage rugpijn**: Low back pain
- **Hernia nuclei pulposi (HNP)**: Herniated disc
- **Radiculopathie**: Radiculopathy (nerve root compression)
- **Lumbago**: Acute low back pain

**Common Tests**:
- **Straight Leg Raise (SLR)**: Lasègue test (nerve root irritation)
- **Slump Test**: Neural tension test
- **FABERE Test**: Hip and SI joint test

---

## Treatment Terminology

### Interventions (Interventies)

- **Manuele therapie**: Manual therapy
- **Mobilisatie**: Mobilization (joint/soft tissue)
- **Manipulatie**: Manipulation (high-velocity thrust)
- **Massage**: Massage
- **Dry needling**: Dry needling
- **Taping**: Taping (kinesio tape, sport tape)
- **Elektrofysiotherapie**: Electrotherapy
- **Echografie**: Ultrasound therapy

### Exercises (Oefeningen)

- **Krachtoefeningen**: Strength exercises
- **Rekoefeningen**: Stretching exercises
- **Mobilisatieoefeningen**: Mobility exercises
- **Stabilisatieoefeningen**: Stabilization exercises
- **Plyometrische oefeningen**: Plyometric exercises
- **Proprioceptieve oefeningen**: Proprioceptive exercises
- **Balans oefeningen**: Balance exercises
- **Aerobe training**: Aerobic training

### Treatment Plan Terms

- **Behandeldoel**: Treatment goal
- **Behandelfrequentie**: Treatment frequency
- **Behandelduur**: Treatment duration (total)
- **Prognose**: Prognosis
- **Huiswerkoefeningen**: Home exercises
- **Zelfmanagement**: Self-management
- **Re-evaluatie**: Re-evaluation
- **Ontslagcriteria**: Discharge criteria

---

## Documentation Terminology

### EPD Terms

- **EPD**: Elektronisch Patiënten Dossier (Electronic Patient Record)
- **Verslaglegging**: Documentation/reporting
- **Declarabel**: Billable (insurance-reimbursable)
- **Declaratie**: Insurance claim
- **DBC**: Diagnose Behandeling Combinatie (Diagnosis-Treatment Combination code)

### Quality & Compliance

- **AVG**: Algemene Verordening Gegevensbescherming (GDPR)
- **GDPR**: General Data Protection Regulation
- **BIG-register**: Healthcare professionals registry (Beroepen in de Individuele Gezondheidszorg)
- **NEN 7510**: Dutch healthcare information security standard
- **Beroepsgeheim**: Professional confidentiality
- **Informed consent**: Geïnformeerde toestemming

---

## Insurance & Billing

- **Zorgverzekering**: Health insurance
- **Basisverzekering**: Basic health insurance
- **Aanvullende verzekering**: Supplementary insurance
- **Eigen risico**: Deductible
- **Verwijzing**: Referral
- **Vergoeding**: Reimbursement

---

## Patient Communication

### Common Phrases in Prompts

- **Patiënt meldt**: Patient reports
- **Patiënt geeft aan**: Patient indicates
- **Patiënt klaagt over**: Patient complains of
- **Op verzoek van patiënt**: At patient's request
- **In overleg met patiënt**: In consultation with patient

### Education Terms

- **Voorlichting**: Patient education
- **Uitleg**: Explanation
- **Instructie**: Instruction
- **Zelfredzaamheid**: Self-sufficiency
- **Compliance**: Therapietrouw (treatment adherence)

---

## Red Flags (Rode Vlaggen)

**Dutch term**: Rode vlaggen or Red flags (English term used)

**Categories**:

1. **Spoed (Emergency)**:
   - Acute cardiaal (acute cardiac)
   - Acute neurologisch (acute neurological)
   - Acute vasculair (acute vascular)

2. **Verwijzing binnen 24-48u (Urgent referral)**:
   - Cauda equina syndroom (cauda equina syndrome)
   - Neurologische uitval (neurological deficit)
   - Infectie tekenen (signs of infection)

3. **Verwijzing huisarts (GP referral)**:
   - Onverklaard gewichtsverlies (unexplained weight loss)
   - Nachtelijke pijn (night pain)
   - Progressieve symptomen (progressive symptoms)

**Key Phrases**:
- **Let op**: Warning/attention
- **Mogelijk**: Possibly/potentially
- **Twijfel aan**: Doubt about
- **Verdenking op**: Suspicion of
- **Verwijzen naar**: Refer to

---

## Hysio-Specific Terms

### Workflows

- **Intake Stapsgewijs**: Step-by-step intake (controlled workflow)
- **Intake Automatisch**: Automated intake (single-step)
- **Consult**: Follow-up consultation
- **Vervolgconsult**: Follow-up consultation (synonym)

### Workflow Steps

- **Voorbereiding**: Preparation (AI-generated)
- **Anamnese**: Anamnesis/history taking
- **Onderzoek**: Physical examination
- **Onderzoeksbevindingen**: Examination findings
- **Klinische conclusie**: Clinical conclusion
- **Zorgplan**: Care plan

### UI Terms

- **Verwerk**: Process (button text)
- **Ga verder**: Continue/proceed
- **Handmatige invoer**: Manual input
- **Live opname**: Live recording
- **Bestand selecteren**: Select file
- **Exporteren**: Export
- **Kopiëren naar klembord**: Copy to clipboard

---

## Clinical Reasoning Terms

### EBP (Evidence-Based Practice)

**Dutch**: Evidence-Based Practice (EBP) - English term used

**Components**:
1. **Beste wetenschappelijke bewijs**: Best scientific evidence
2. **Klinische expertise**: Clinical expertise
3. **Waarden en context patiënt**: Patient values and context

### Biopsychosocial Model

**Dutch**: Biopsychosociaal model

**Components**:
- **Bio**: Biological factors
- **Psycho**: Psychological factors
- **Sociaal**: Social factors

### Clinical Reasoning Models

- **Hypothetisch-deductief**: Hypothetical-deductive reasoning
- **Patroonherkenning**: Pattern recognition
- **Narratief redeneren**: Narrative reasoning

---

## Key Takeaways for Bernard

1. **SOEP = Follow-up documentation** (like SOAP in English)
2. **HHSB = Intake anamnesis** (unique Dutch framework)
3. **ICF = International assessment framework** (used globally)
4. **LOFTIG = Pain assessment** (Dutch-specific)
5. **DTF = Red flags guidelines** (safety screening)
6. **EPD = Electronic Patient Record** (like EMR/EHR)
7. **Declarabel = Billable/Reimbursable** (insurance compliance)

**Pro Tip**: When reading prompts, keep this glossary open. Many prompt instructions reference these frameworks explicitly.

**Common Gotcha**: "HHSB" sometimes appears as "PHSB" in older code (legacy naming). They're the same thing - always use HHSB.

---

**Next**: Read actual prompt files and see how these terms are used in context.
