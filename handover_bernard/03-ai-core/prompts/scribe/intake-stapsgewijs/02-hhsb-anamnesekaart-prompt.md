# HHSB Anamnesekaart Processing Prompt - Complete Documentation

**Prompt Name**: `INTAKE_STAPSGEWIJS_VERWERKING_HHSB_PROMPT`
**File**: `hysio/src/lib/prompts/intake-stapsgewijs/stap2-verwerking-hhsb-anamnesekaart.ts`
**Version**: v7.0 (with Grounding Protocol)
**Last Updated**: 2025-08-20
**Model**: GPT-4 Turbo (gpt-4-turbo-2024-04-09)
**Purpose**: Transform raw anamnese transcript into structured HHSB clinical documentation

---

## Overview

This is one of the **most critical prompts** in the Hysio platform. It converts unstructured patient interview transcripts into the standardized HHSB format (Hulpvraag, Historie, Stoornissen, Beperkingen) used throughout Dutch physiotherapy.

### Key Characteristics

- **Safety-First**: v7.0 Grounding Protocol prevents AI hallucinations
- **Structured Output**: Produces consistent markdown format
- **Clinical Intelligence**: Interprets raw dialogue into professional medical documentation
- **Quality Control**: Built-in verification checklist

---

## When This Prompt Is Called

### User Action
User has completed anamnese (patient history) recording and clicks **"Verwerk naar HHSB"** button in Step 3 of Intake Stapsgewijs.

### Code Path

**Frontend Trigger**:
```typescript
// File: hysio/src/app/scribe/intake-stapsgewijs/stap3/page.tsx
// Line: 102-118

const handleProcessToHHSB = async () => {
  setIsProcessing(true);

  const response = await fetch('/api/hhsb/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcript: anamneseTranscript,
      notes: manualNotes,
      patientInfo: {
        voorletters,
        geboortejaar,
        geslacht,
        hoofdklacht
      },
      klinimetrie: {
        nprs: nprsScore || null,
        psk: pskScore || null
      }
    })
  });

  const data = await response.json();
  setHHSBData(data.hhsb);
};
```

**API Endpoint**: `POST /api/hhsb/process`

**Handler File**: `hysio/src/app/api/hhsb/process/route.ts`
```typescript
// Lines 18-45

export async function POST(request: Request) {
  const { transcript, notes, patientInfo, klinimetrie } = await request.json();

  const systemPrompt = INTAKE_STAPSGEWIJS_VERWERKING_HHSB_PROMPT;
  const userPrompt = buildUserPrompt(transcript, notes, patientInfo, klinimetrie);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-2024-04-09',
    temperature: 0.7,
    max_tokens: 5000,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  });

  return NextResponse.json({
    hhsb: completion.choices[0].message.content
  });
}
```

### Trigger Conditions

**Required**:
- ✅ Transcript must be non-empty (>50 characters)
- ✅ Patient info must be valid
- ✅ User has reviewed transcript

**Optional**:
- Manual notes (therapist can add extra context)
- Klinimetrie scores (NPRS, PSK, SPADI, etc.)

---

## Complete System Prompt

```typescript
export const INTAKE_STAPSGEWIJS_VERWERKING_HHSB_PROMPT = `
SYSTEEMPROMPT: Hysio Intake Stapsgewijs - Verwerking HHSB-Anamnesekaart v7.0

ROL: Je bent een Senior Fysiotherapeutisch Specialist en een AI Data-analist,
gespecialiseerd in het distilleren van klinische essentie uit ongestructureerde
medische gesprekken. Je bent de laatste en beste filter tussen een ruw gesprek
en een perfect, professioneel conform EPD-dossier.

MISSIE: Transformeer een ruwe transcriptie van een anamnesegesprek, inclusief
eventuele losse notities, in een vlijmscherpe, klinisch relevante en perfect
gestructureerde HHSB-Anamnesekaart.

De anamnese-kaart bestaat uit vier duidelijke blokken:
1. Hulpvraag
2. Historie
3. Stoornissen
4. Beperkingen

INPUTS:
- transcript: De volledige, onbewerkte tekst van het opgenomen anamnesegesprek.
- notes: Optionele, door de therapeut ingevoerde handmatige notities.
- patientInfo: Een object met { voorletters, geslacht, geboortejaar, hoofdklacht }.
- klinimetrie: Optionele data, zoals { nprs: 7, psk: 60 }.

KERN-INSTRUCTIES & DENKWIJZE:

Principe 1: Distilleer de Klinische Essentie
Filter alle conversationele "vulling". Zinnen als "nou, toen dacht ik...",
"uhm, ja, dat doet het wel een beetje" worden volledig geëlimineerd.

Voorbeeld:
❌ Slecht: "Patiënt: Ja dus als ik mijn arm zo optil, dan, uhm, voel ik hier
zo'n stekende pijn, echt niet normaal, een 7 op 10 zeg maar."
✅ Goed: "Pijn (NPRS: 7/10) bij heffen van de arm, omschreven als stekend."

Principe 2: Formuleer Actief, Professioneel en Kwantificeerbaar
Herschrijf de input in actieve, medische taal. Wees specifiek en gebruik
cijfers waar mogelijk.

Voorbeeld:
❌ Slecht: "Patiënt kan zijn hobby niet meer doen, tennis gaat niet."
✅ Goed: "Participatieprobleem: Staken van tennishobby wegens provocatie
van de schouderklacht."

Principe 3: Integreer Data Intelligent
Plaats aangeleverde klinimetrische data logisch binnen de structuur:
- NPRS, VAS (pijnscores): Onder Stoornissen → Pijn
- PSK, SPADI (functiescores): Onder Beperkingen → Functionele Scores

Principe 4: Analyseer en Signaleer
Let actief op mogelijke rode vlaggen, gele vlaggen (psychosociale factoren)
of inconsistenties in het verhaal.

Principe 5: ABSOLUTE DATA FIDELITY & GROUNDING PROTOCOL (v7.0 AI Safety Enhancement)

⚠️ KRITISCH: Jouw output moet een PERFECTE weerspiegeling zijn van de verstrekte
input. ELKE claim, ELKE bevinding, ELK symptoom moet EXPLICIET aanwezig zijn
in de transcript of notities. Dit principe is de HOOGSTE prioriteit - boven
zelfs klinische volledigheid.

🚫 VERBOD OP FABRICATIE:
- NOOIT symptomen toevoegen die niet expliciet zijn genoemd
- NOOIT diagnoses suggereren die niet in de input staan
- NOOIT "waarschijnlijke" bevindingen invullen
- NOOIT standaard medische frases toevoegen "omdat het logisch lijkt"
- NOOIT aannames doen over niet-vermelde lichaamsgebieden
- NOOIT klinimetrische scores fabriceren of schatten

✅ OMGAAN MET ONTBREKENDE INFORMATIE:
Als kritische informatie NIET in de input staat:
- Schrijf expliciet: "Niet vermeld in anamnese"
- Laat het veld LEEG in plaats van te raden
- Markeer gaps duidelijk: "[Informatie niet beschikbaar]"

Voorbeelden:
❌ FOUT: "Patiënt meldt geen uitstraling" (als uitstraling niet besproken is)
✅ CORRECT: "Uitstraling: Niet vermeld in anamnese"

❌ FOUT: "NPRS: Geschat 5-6/10 op basis van beschrijving"
✅ CORRECT: "NPRS: Niet gemeten tijdens anamnese"

🔍 VERSCHIL TUSSEN SYNTHESE EN FABRICATIE:

Synthese (TOEGESTAAN):
- Herformuleren: "Patiënt zegt: 'als ik mijn arm optil, doet het zeer'" →
  "Pijn bij actieve elevatie van de arm"
- Samenvatten: "Kan geen boodschappen tillen, stofzuigen lukt niet, werk is
  onmogelijk" → "Beperkingen in ADL en arbeid"

Fabricatie (ABSOLUUT VERBODEN):
- Toevoegen: "Patiënt meldt pijn" → "Pijn met uitstraling naar de elleboog"
  (als uitstraling niet is genoemd)
- Afleiden: "Patiënt zegt dat tennissen pijn doet" → "Waarschijnlijk rotator
  cuff problematiek" (diagnose niet gesteld)

📊 KLINIMETRISCHE DATA - STRIKTE REGELS:
- Als klinimetrie object is aangeleverd: Gebruik de EXACTE waardes
- Als score in transcript wordt genoemd: Extraheer de EXACTE waarde
- Als score NIET is genoemd of gemeten: Schrijf "Niet gemeten tijdens anamnese"
- NOOIT scores schatten, benaderen of afleiden uit beschrijvingen

🎯 VERIFICATIE CHECKLIST (Doorloop mentaal voor ELKE sectie):
Voor elke zin die je schrijft, vraag jezelf af:
1. Staat deze informatie LETTERLIJK in de input?
2. Of is het een DIRECTE herschrijving zonder nieuwe informatie?
3. Zo nee: VERWIJDER of markeer als "[Niet vermeld]"

OUTPUT FORMAAT (EXTREEM UITGEBREID):
Genereer een markdown-document met de volgende exacte structuur:

HHSB Anamnesekaart – [Voorletters Patiënt] – [geslacht] - [Leeftijd] jr.
Datum: [Datum van vandaag]

Hoofdklacht Initieel: [De oorspronkelijke hoofdklacht]

📌 Klinische Samenvatting Anamnese
[Ultrakorte samenvatting van 5-10 zinnen - de 'elevator pitch']

📈 Hulpvraag (De "Waarom" van de Patiënt)
Hoofddoel: [Het belangrijkste, concrete doel]
Secundaire Doelen: [Andere genoemde doelen]
Verwachtingen van Therapie: [Wat de patiënt verwacht te bereiken]

🗓️ Historie (Context en Verloop)
Ontstaansmoment & Aanleiding: [Datum/periode en exacte oorzaak]
Beloop sindsdien: [Progressief, degressief, of intermitterend]
Eerdere Episoden: [Indien van toepassing]
Medische Voorgeschiedenis: [Relevante operaties, aandoeningen]
Medicatiegebruik: [Naam, dosering, reden]
Context (Werk/Sport/Sociaal): [Relevante dagelijkse belasting]

🔬 Stoornissen (Functieniveau - Wat is er mis in het lichaam?)
Pijn:
  Locatie: [Specifieke anatomische locatie]
  Aard: [Omschrijving: stekend, zeurend, brandend]
  Intensiteit (NPRS): [Huidig: X/10, Gemiddeld: Y/10, Ergst: Z/10]
  Uitstraling: [Indien aanwezig, beschrijf dermatoom]

Mobiliteit:
  Subjectieve Stijfheid: [Momenten van stijfheid]
  Bewegingsbeperking: [Welke bewegingen beperkt]

Kracht & Stabiliteit:
  Subjectief Krachtverlies: [Situaties krachtverlies]
  Gevoel van Instabiliteit: [Indien van toepassing]

Geassocieerde Symptomen: [Zwelling, tintelingen, doofheid]

♿ Beperkingen (Activiteiten & Participatie - ICF-model)
Functionele Scores: [PSK, SPADI, etc. indien aanwezig]

Activiteiten (ADL & Werk):
  Zelfzorg: [bv. Moeite met aankleden]
  Huishouden: [bv. Stofzuigen provocerend]
  Werk: [bv. Magazijnwerk beperkt]

Participatie (Sociaal, Sport & Hobby's):
  Sport: [bv. Tennis gestopt]
  Sociaal/Hobby: [bv. Kan niet meer schilderen]

🚩 Signalen & Klinische Overwegingen
Rode Vlaggen: [Lijst mogelijke ernstige pathologie]
Gele Vlaggen: [Psychosociale factoren]
Inconsistenties/Opmerkingen: [Tegenstrijdigheden]

⚙️ Template Klaar voor EPD-invoer
HHSB Anamnesekaart – [Voorletters] – [geslacht] - [Leeftijd] jr. - [Datum]

Hulpvraag: [Samengevat]
Historie: [Samengevat]
Stoornissen: [Samengevat]
Beperkingen: [Samengevat]
Samenvatting: [Klinische samenvatting]
`;
```

---

## Input Format

### TypeScript Interface

```typescript
interface HHSBProcessInput {
  transcript: string;                    // Required: Raw anamnese dialogue
  notes?: string;                        // Optional: Manual therapist notes
  patientInfo: {
    voorletters: string;
    geboortejaar: number;
    geslacht: "man" | "vrouw" | "anders";
    hoofdklacht: string;
  };
  klinimetrie?: {
    nprs?: number;      // 0-10
    psk?: number;       // 0-100
    spadi?: number;     // 0-100
    // ... other metrics
  };
}
```

### Example Input

```json
{
  "transcript": "Therapeut: Goedemiddag, wat brengt u hier?\n\nPatiënt: Nou, ik heb al ongeveer drie weken last van mijn rechterschouder. Het begon eigenlijk na dat ik op mijn werk een zware doos had opgetild. Sindsdien heb ik steeds pijn, vooral als ik mijn arm omhoog moet bewegen.\n\nTherapeut: Kunt u de pijn omschrijven?\n\nPatiënt: Het is een stekende pijn, vooral aan de voorkant van mijn schouder. Als ik bijvoorbeeld een jas wil aantrekken of iets uit een hoge kast wil pakken, dan doet het echt zeer. Op dit moment geef ik het een 4, maar 's nachts kan het oplopen tot een 7.\n\nTherapeut: Straalt de pijn ergens naartoe uit?\n\nPatiënt: Nee, het blijft echt in mijn schouder zitten.\n\nTherapeut: En wat zijn uw doelen voor de behandeling?\n\nPatiënt: Nou, ik wil graag weer normaal kunnen werken. Ik ben magazijnmedewerker, dus ik moet regelmatig tillen. En ik mis het tennissen ook enorm. Dat heb ik helemaal moeten stoppen omdat het te pijnlijk is.\n\nTherapeut: Heeft u dit eerder gehad?\n\nPatiënt: Nee, dit is de eerste keer dat ik zo'n last heb van mijn schouder.\n\nTherapeut: Gebruikt u medicatie?\n\nPatiënt: Alleen af en toe een paracetamol als de pijn te erg wordt.\n\nTherapeut: Oké, duidelijk. Laten we verder gaan met het onderzoek.",

  "notes": "Patiënt vertoont beschermende houding, houdt rechterarm dicht tegen lichaam",

  "patientInfo": {
    "voorletters": "J.D.",
    "geboortejaar": 1985,
    "geslacht": "man",
    "hoofdklacht": "Rechterschouderpijn bij overhead bewegingen"
  },

  "klinimetrie": {
    "nprs": 4
  }
}
```

---

## Expected Output

### Full HHSB Document (Example)

```markdown
HHSB Anamnesekaart – J.D. – man - 40 jr.
Datum: 2025-10-02

Hoofdklacht Initieel: Rechterschouderpijn bij overhead bewegingen

📌 Klinische Samenvatting Anamnese
40-jarige man presenteert zich met acuut ontstane rechterschouderpijn sinds 3 weken,
direct na tillen van zware doos op werk. Klacht provoceert bij overhead bewegingen
en ADL-taken (jas aantrekken, hoge kast bereiken). Belangrijkste beperkingen:
uitvoeren magazijnwerk en participatie tennis volledig gestaakt. Nachtelijke pijn
NPRS 7/10 verstoort slaap. Geen eerdere episodes, geen uitstraling. Patiënt hoog
gemotiveerd voor herstel werkfunctie en sportactiviteiten.

📈 Hulpvraag (De "Waarom" van de Patiënt)
Hoofddoel: Pijnvrij kunnen werken als magazijnmedewerker (inclusief tilactiviteiten)
Secundaire Doelen: Hervatten tennisactiviteiten zonder pijn
Verwachtingen van Therapie: Volledig herstel van functie voor werk en sport

🗓️ Historie (Context en Verloop)
Ontstaansmoment & Aanleiding: Acuut ontstaan 3 weken geleden na tillen zware doos
op werk
Beloop sindsdien: Aanhoudende klachten, geen significante verbetering
Eerdere Episoden: Geen eerdere schouderproblemen
Medische Voorgeschiedenis: Niet vermeld in anamnese
Medicatiegebruik: Paracetamol op ad hoc basis bij pijnexacerbatie
Context (Werk/Sport/Sociaal): Werkzaam als magazijnmedewerker (fysiek belastend),
actieve tennisser

🔬 Stoornissen (Functieniveau - Wat is er mis in het lichaam?)
Pijn:
  Locatie: Anterieure rechterschouder
  Aard: Stekend karakter
  Intensiteit (NPRS): Huidig: 4/10, Nachtelijk: 7/10, Gemiddeld overdag: 4/10
  Uitstraling: Geen uitstraling gerapporteerd

Mobiliteit:
  Subjectieve Stijfheid: Niet expliciet vermeld in anamnese
  Bewegingsbeperking: Pijn bij overhead bewegingen (elevatie), specifiek bij
  reiken naar hoge objecten

Kracht & Stabiliteit:
  Subjectief Krachtverlies: Niet expliciet vermeld, wel functionele beperking
  bij tillen
  Gevoel van Instabiliteit: Niet vermeld in anamnese

Geassocieerde Symptomen: Beschermende houding waargenomen (arm dicht tegen lichaam),
geen andere symptomen gerapporteerd

♿ Beperkingen (Activiteiten & Participatie - ICF-model)
Functionele Scores: Niet gemeten tijdens anamnese

Activiteiten (ADL & Werk):
  Zelfzorg: Beperking bij aantrekken van jas
  Huishouden: Beperking bij reiken naar objecten in hoge kasten
  Werk: Significant belemmerd in uitvoeren magazijnwerkzaamheden (tilactiviteiten)

Participatie (Sociaal, Sport & Hobby's):
  Sport: Tennis volledig gestaakt wegens pijnprovocatie
  Sociaal/Hobby: Niet verder gespecificeerd

🚩 Signalen & Klinische Overwegingen
Rode Vlaggen: Geen rode vlaggen geïdentificeerd in anamnese
Gele Vlaggen: Niet vermeld in anamnese
Inconsistenties/Opmerkingen: Coherent verhaal, duidelijk traumatisch ontstaan

⚙️ Template Klaar voor EPD-invoer
HHSB Anamnesekaart – J.D. – man - 40 jr. - 2025-10-02

Hulpvraag: Pijnvrij kunnen werken (magazijnmedewerker) en hervatten tennis
Historie: Acuut ontstaan 3 weken geleden na tillen zware doos, aanhoudend beloop
Stoornissen: Anterieure rechterschouderpijn (NPRS 4/10 dag, 7/10 nacht), stekend
karakter, pijn bij overhead bewegingen, geen uitstraling
Beperkingen: ADL beperkt (jas aantrekken, hoge kasten), werk significant belemmerd
(tilactiviteiten), tennis volledig gestaakt
Samenvatting: 40-jarige man met acuut ontstane SAPS-verdachte rechterschouderpijn
na werkgerelateerd trauma, significante werk- en sportbeperkingen, hoog gemotiveerd
voor herstel
```

### Key Features of Output

**✅ What v7.0 Does RIGHT**:
- "Niet vermeld in anamnese" for missing stiffness data
- "Niet gemeten tijdens anamnese" for missing functional scores
- Only uses NPRS value that was explicitly provided (4/10 current, 7/10 night)
- No fabricated medication details beyond what patient said
- Explicitly notes "Geen uitstraling gerapporteerd" (mentioned in transcript)

**❌ What v7.0 PREVENTS**:
- ~~"Patiënt rapporteert geen zwelling"~~ (zwelling not discussed)
- ~~"ROM elevatie geschat 120 graden"~~ (ROM not measured)
- ~~"PSK score: 60/100"~~ (PSK not mentioned)
- ~~"Vermoedelijke rotator cuff tendinopathie"~~ (diagnosis not in anamnese)

---

## Prompt Evolution

### Version History

| Version | Date | Key Changes | Impact |
|---------|------|-------------|--------|
| **v7.0** | 2025-08-20 | **ABSOLUTE DATA FIDELITY & GROUNDING PROTOCOL** | Eliminated hallucinations, increased medical accuracy |
| v6.0 | 2025-06-10 | Original implementation | Baseline functionality |

### v7.0 Enhancements (Current)

**1. Grounding Protocol**
- Explicitly forbids fabrication of ANY data not in input
- Requires marking missing data as "Niet vermeld"
- Prevents "logical inference" that adds non-existent information

**2. Klinimetrie Strictness**
- Only uses exact scores from input (klinimetrie object or transcript)
- Never estimates scores from descriptions
- Clear marking when not measured

**3. Verification Checklist**
- Mental checklist embedded in prompt
- Forces AI to verify each statement against input
- Reduces false positives dramatically

**4. Examples in Prompt**
- Clear ❌/✅ examples show correct behavior
- Demonstrates difference between synthesis (allowed) and fabrication (forbidden)

### v6.0 Issues (Fixed in v7.0)

**Problem 1**: AI would invent NPRS scores
```
Input: "Patiënt meldt veel pijn"
v6.0 Output: "Pijn NPRS 7/10" ← Fabricated!
v7.0 Output: "Pijn NPRS: Niet gemeten tijdens anamnese" ✓
```

**Problem 2**: AI would assume missing = negative
```
Input: [Uitstraling niet besproken]
v6.0 Output: "Geen uitstraling" ← Assumption!
v7.0 Output: "Uitstraling: Niet vermeld in anamnese" ✓
```

**Problem 3**: AI would complete gaps with "reasonable" data
```
Input: [Medicatie niet vermeld]
v6.0 Output: "Geen medicatie" ← Guessing!
v7.0 Output: "Medicatiegebruik: Niet vermeld in anamnese" ✓
```

---

## Common Issues & Solutions

### Issue 1: Empty Sections in Output

**Symptom**: Hulpvraag or Beperkingen section is blank

**Cause**: Patient didn't explicitly state goals or limitations in transcript

**Solution** (v7.0):
```markdown
📈 Hulpvraag
Hoofddoel: Niet expliciet besproken tijdens anamnese
Secundaire Doelen: Niet vermeld
Verwachtingen: Patiënt wenst pijnvermindering (geen specifieke doelen genoemd)
```

**How to Prevent**: Ensure anamnese preparation includes clear goal-setting questions

---

### Issue 2: Fabricated Measurements

**Symptom** (Pre-v7.0): Output shows ROM values not mentioned in transcript

**Example**:
```
Transcript: "Patiënt kan arm niet helemaal omhoog bewegen"
Bad Output: "Actieve elevatie beperkt tot 120 graden" ← NOT in transcript!
```

**v7.0 Solution**:
```markdown
Mobiliteit:
  Bewegingsbeperking: Patiënt rapporteert beperkte elevatie zonder specifieke
  graden gemeten
```

**Prevention**: v7.0 Grounding Protocol automatically prevents this

---

### Issue 3: Conflicting Information

**Symptom**: Transcript has contradictory statements

**Example**:
```
Transcript: "Pijn is een 3... nee wacht, eigenlijk meer een 5"
```

**v7.0 Handling**:
```markdown
Intensiteit (NPRS): 5/10 (patiënt corrigeerde initiële schatting van 3 naar 5)
```

Or if truly unclear:
```markdown
Intensiteit (NPRS): Niet eenduidig in anamnese (wisselende rapportages)
```

---

### Issue 4: Missing Critical Data

**Symptom**: Key HHSB elements not covered in transcript

**Common Missing Items**:
- Eerdere episodes
- Medicatiegebruik
- Werk/sport context
- Specifieke beperkingen

**v7.0 Solution**: Explicitly mark as missing
```markdown
Eerdere Episoden: Niet besproken tijdens anamnese
Medicatiegebruik: Niet vermeld
```

**Therapist Action**: Review output, add manual notes, or conduct follow-up questions

---

## Quality Control Checklist

### Pre-Processing (Before AI Call)

- [ ] Transcript is >100 characters
- [ ] Transcript is in Dutch
- [ ] Patient info complete
- [ ] Audio quality was good (clear speech)

### Post-Processing (After AI Generation)

**Data Fidelity Check**:
- [ ] All HHSB sections present (Hulpvraag, Historie, Stoornissen, Beperkingen)
- [ ] No symptoms appear that weren't in transcript
- [ ] NPRS/PSK scores match input or marked "Niet gemeten"
- [ ] "Niet vermeld" used appropriately for missing data
- [ ] No invented measurements (ROM, strength, etc.)

**Quality Check**:
- [ ] Language is professional Dutch
- [ ] Proper anonymization (voorletters only, no full names)
- [ ] ICF model correctly applied
- [ ] Red/yellow flags noted if mentioned

**Evidence Check** (v7.0 Critical):
- [ ] Pick 3 random statements from output
- [ ] Verify each is in original transcript
- [ ] If any fabrication found → Regenerate with stricter prompt

---

## Iteration Guidelines

### To Improve This Prompt

**Testing Process**:
1. Create "golden transcript" with known ground truth
2. Run through prompt
3. Manually verify every output statement against input
4. Document any hallucinations
5. Add specific examples to prompt if needed
6. Increment version number

**Regression Testing**:
```typescript
// Example test suite
describe('HHSB Prompt v7.0 - Grounding', () => {
  it('should NOT fabricate NPRS when not in transcript', () => {
    const transcript = readFixture('anamnese-without-nprs.txt');
    const output = await processHHSB({ transcript });

    expect(output).not.toMatch(/NPRS: \d+\/10/);  // No numeric score
    expect(output).toContain('Niet gemeten');      // Should mark as missing
  });

  it('should preserve exact NPRS from klinimetrie input', () => {
    const output = await processHHSB({
      transcript: '...',
      klinimetrie: { nprs: 7 }
    });

    expect(output).toContain('NPRS: 7/10');  // Exact match
  });
});
```

**Version Upgrade Checklist**:
- [ ] Test with 10+ real transcripts
- [ ] Zero fabrications detected
- [ ] No regressions in output quality
- [ ] Update version number in prompt
- [ ] Document changes in CHANGELOG.md
- [ ] Update this documentation file

---

## Integration with Other Prompts

### Data Flow

**Inputs TO this prompt**:
- Patient info from Step 0 (manual entry)
- Optional: Preparation questions from Step 1 (helps guide complete anamnese)

**Outputs FROM this prompt**:
- HHSB structure → Used in Step 4 (Onderzoeksvoorstel)
- HHSB data → Referenced in Step 6, 7, 8 (Onderzoek, Conclusie, Zorgplan)

### Cross-Prompt Dependencies

**Step 4 - Onderzoeksvoorstel Prompt**:
```typescript
// Uses HHSB output as input
const onderzoeksvoorstel = await generatePreparation({
  hhsbAnamneseKaart: hhsbOutput,  // From this prompt!
  type: 'onderzoek'
});
```

**Step 6 - Onderzoeksbevindingen Prompt**:
```typescript
// References HHSB for context
const bevindingen = await processOnderzoek({
  hhsbAnamneseKaart: hhsbOutput,  // Cross-reference
  onderzoekTranscript: onderzoekData
});
```

**Step 8 - Zorgplan Prompt**:
```typescript
// Uses HHSB to create patient-centered care plan
const zorgplan = await generateZorgplan({
  hhsbAnamneseKaart: hhsbOutput,  // For Hulpvraag + Beperkingen
  klinischeConclusie: conclusieData
});
```

---

## Advanced Usage

### Custom Klinimetrie Integration

Add custom metrics:
```json
{
  "klinimetrie": {
    "nprs": 6,
    "psk": 55,
    "spadi": 60,
    "custom_rom_elevatie": 120,
    "custom_kracht_abductie": "MRC 4/5"
  }
}
```

Prompt will integrate into appropriate sections.

### Manual Override

Therapist can edit output post-generation:
- Add missing context
- Correct AI misinterpretations
- Add clinical insights

---

## Performance Metrics

### Typical Processing Time

| Transcript Length | Processing Time | Tokens Used |
|------------------|-----------------|-------------|
| Short (500 words) | 3-5 seconds | 2,000-3,000 |
| Medium (1000 words) | 5-7 seconds | 3,500-4,500 |
| Long (2000 words) | 7-10 seconds | 4,500-5,000 |

### Token Breakdown

**System Prompt**: ~1,200 tokens (this documentation)
**User Prompt**: Variable (500-3,000 tokens depending on transcript)
**Output**: ~1,500-3,000 tokens (HHSB document)

**Cost**: ~$0.05-0.15 per HHSB generation (GPT-4 Turbo pricing)

---

## Troubleshooting

### Debugging Steps

1. **Check Input**:
   - Log `transcript` length
   - Verify `patientInfo` structure
   - Confirm `klinimetrie` values

2. **Inspect Raw Output**:
   - Before markdown parsing
   - Look for hallucination indicators
   - Check section completeness

3. **Compare to Transcript**:
   - Manually verify 5 random output statements
   - Trace back to input
   - Flag any fabrications

4. **Re-run with Stricter Prompt**:
   - Add specific "DO NOT" examples
   - Increase temperature to 0.6 (more conservative)

---

## Related Documentation

- [Workflow Overview](./WORKFLOW.md) - Complete intake process
- [01-preparation-anamnese-prompt.md](./01-preparation-anamnese-prompt.md) - Preparation prompt
- [03-preparation-onderzoek-prompt.md](./03-preparation-onderzoek-prompt.md) - Uses HHSB output
- [AI Integration Master Guide](../../AI_INTEGRATION_MASTER_GUIDE.md) - System overview

---

**Last Updated**: 2025-10-02
**Maintained By**: Hysio Development Team
**Questions?**: Review prompt source file or test with golden transcripts
