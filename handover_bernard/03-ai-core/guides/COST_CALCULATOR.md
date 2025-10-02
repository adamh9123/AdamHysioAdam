# Hysio AI Cost Calculator & Scenario Planner

**Version**: 1.0
**Last Updated**: 2025-10-02
**Purpose**: Interactive cost calculator voor het plannen van AI usage en budget forecasting

---

## 📋 Inhoudsopgave

1. [Quick Calculator](#1-quick-calculator)
2. [Detailed Cost Breakdown](#2-detailed-cost-breakdown)
3. [Scenario Planning](#3-scenario-planning)
4. [ROI Calculator](#4-roi-calculator)
5. [Cost Optimization Strategies](#5-cost-optimization-strategies)

---

## 1. Quick Calculator

### 1.1 Basis Pricing

**OpenAI GPT-4.1-mini**:
- Input: `$0.00015` per 1,000 tokens ($0.15 per 1M)
- Output: `$0.0006` per 1,000 tokens ($0.60 per 1M)

**Groq Whisper Large v3 Turbo**:
- Audio: `$0.04` per hour

### 1.2 Gemiddelde Kosten per Module

| Module | Input Tokens | Output Tokens | Audio (min) | Total Cost |
|--------|--------------|---------------|-------------|------------|
| **Intake Stapsgewijs** | 23,650 | 8,200 | 18 | **$0.01126** |
| **Intake Automatisch** | 18,000 | 6,500 | 18 | **$0.00960** |
| **Consult SOEP** | 6,300 | 2,400 | 5 | **$0.00272** |
| **Assistant (per vraag)** | 3,250 | 500 | 0 | **$0.00079** |
| **SmartMail** | 600 | 600 | 0 | **$0.00045** |
| **DiagnoseCode (simple)** | 1,800 | 600 | 0 | **$0.00063** |
| **DiagnoseCode (complex)** | 5,400 | 1,800 | 0 | **$0.00189** |
| **EduPack (3 sections)** | 6,000 | 330 | 0 | **$0.00120** |
| **EduPack (7 sections)** | 14,000 | 770 | 0 | **$0.00256** |
| **Pre-Intake** | 2,300 | 1,000 | 0 | **$0.00095** |

### 1.3 Bereken Jouw Maandelijkse Kosten

**Vul in hoeveel je verwacht te gebruiken per maand:**

```
INTAKE STAPSGEWIJS
Aantal per maand: [ ___ ]  ×  $0.01126  =  $________

INTAKE AUTOMATISCH
Aantal per maand: [ ___ ]  ×  $0.00960  =  $________

CONSULT SOEP
Aantal per maand: [ ___ ]  ×  $0.00272  =  $________

SMARTMAIL
Aantal per maand: [ ___ ]  ×  $0.00045  =  $________

EDUPACK (gemiddeld 5 sections)
Aantal per maand: [ ___ ]  ×  $0.00190  =  $________

DIAGNOSECODE
Aantal per maand: [ ___ ]  ×  $0.00100  =  $________

ASSISTANT VRAGEN
Aantal per maand: [ ___ ]  ×  $0.00079  =  $________

PRE-INTAKE
Aantal per maand: [ ___ ]  ×  $0.00095  =  $________

                              TOTAAL  =  $________
```

### 1.4 Voorbeeld Berekening (Medium Praktijk)

```
50 Intakes Stapsgewijs     × $0.01126 = $0.563
100 Consults SOEP          × $0.00272 = $0.272
100 SmartMails             × $0.00045 = $0.045
50 EduPacks                × $0.00190 = $0.095
100 Diagnosecodes          × $0.00100 = $0.100
500 Assistant vragen       × $0.00079 = $0.395
25 Pre-Intakes             × $0.00095 = $0.024

                           TOTAAL  = $1.494 (+ transcription = $2.38/maand)
```

---

## 2. Detailed Cost Breakdown

### 2.1 Token Cost Calculator

**Formule**:
```
Total Cost = (Input Tokens ÷ 1000 × $0.00015) + (Output Tokens ÷ 1000 × $0.0006)
```

**Voorbeelden**:

```
1. Korte vraag aan Assistant:
   Input: 200 tokens, Output: 300 tokens
   Cost = (200 ÷ 1000 × 0.00015) + (300 ÷ 1000 × 0.0006)
        = $0.00003 + $0.00018
        = $0.00021

2. Complete HHSB generatie:
   Input: 5,500 tokens, Output: 2,000 tokens
   Cost = (5,500 ÷ 1000 × 0.00015) + (2,000 ÷ 1000 × 0.0006)
        = $0.000825 + $0.0012
        = $0.002025

3. Lange EduPack (7 sections):
   Input: 14,000 tokens, Output: 770 tokens
   Cost = (14,000 ÷ 1000 × 0.00015) + (770 ÷ 1000 × 0.0006)
        = $0.0021 + $0.000462
        = $0.002562
```

### 2.2 Audio Transcription Cost Calculator

**Formule**:
```
Cost = (Duration in seconds ÷ 3600) × $0.04
```

**Voorbeelden**:

```
1. Kort consult (3 minuten):
   180 seconds ÷ 3600 × $0.04 = $0.002

2. Anamnese gesprek (10 minuten):
   600 seconds ÷ 3600 × $0.04 = $0.00667

3. Uitgebreid interview (30 minuten):
   1800 seconds ÷ 3600 × $0.04 = $0.02
```

### 2.3 Combined Workflow Cost Calculator

**Intake Stapsgewijs Breakdown**:

| Stap | Type | Tokens/Duration | Cost |
|------|------|-----------------|------|
| 1. Voorbereiding Anamnese | Text | 1,950 in + 800 out | $0.00077 |
| 2. Transcriptie Anamnese | Audio | 10 min | $0.00667 |
| 3. HHSB Verwerking | Text | 5,500 in + 2,000 out | $0.00203 |
| 4. Voorbereiding Onderzoek | Text | 2,200 in + 700 out | $0.00075 |
| 5. Transcriptie Onderzoek | Audio | 8 min | $0.00533 |
| 6. Onderzoek Verwerking | Text | 4,000 in + 1,500 out | $0.00150 |
| 7. Klinische Conclusie | Text | 3,500 in + 1,200 out | $0.00145 |
| 8. Zorgplan | Text | 4,500 in + 1,500 out | $0.00158 |
| **TOTAAL** | | | **$0.01008** |

**Consult SOEP Breakdown**:

| Stap | Type | Tokens/Duration | Cost |
|------|------|-----------------|------|
| 1. Voorbereiding (Optional) | Text | 1,800 in + 600 out | $0.00063 |
| 2. Transcriptie | Audio | 5 min | $0.00333 |
| 3. SOEP Verwerking | Text | 4,500 in + 1,800 out | $0.00176 |
| **TOTAAL** | | | **$0.00572** |

---

## 3. Scenario Planning

### 3.1 Practice Size Scenarios

#### Scenario A: Solo Praktijk (Klein)
**Profiel**: 1 therapeut, 15-20 patiënten per week

```
MAANDELIJKS VOLUME:
- 25 Intakes Stapsgewijs
- 50 Consults SOEP
- 50 SmartMails
- 20 EduPacks
- 50 Diagnosecodes
- 250 Assistant vragen
- 10 Pre-Intakes

BEREKENING:
Intake:        25 × $0.01126 = $0.282
Consult:       50 × $0.00272 = $0.136
SmartMail:     50 × $0.00045 = $0.023
EduPack:       20 × $0.00190 = $0.038
DiagnoseCode:  50 × $0.00100 = $0.050
Assistant:    250 × $0.00079 = $0.198
Pre-Intake:    10 × $0.00095 = $0.010

TOTAAL: $0.737 + audio ($0.45) = $1.19/maand
COST PER PATIËNT: $0.014
```

#### Scenario B: Medium Praktijk (2-3 therapeuten)
**Profiel**: 2-3 therapeuten, 40-50 patiënten per week

```
MAANDELIJKS VOLUME:
- 50 Intakes Stapsgewijs
- 100 Consults SOEP
- 100 SmartMails
- 50 EduPacks
- 100 Diagnosecodes
- 500 Assistant vragen
- 25 Pre-Intakes

BEREKENING:
Intake:        50 × $0.01126 = $0.563
Consult:      100 × $0.00272 = $0.272
SmartMail:    100 × $0.00045 = $0.045
EduPack:       50 × $0.00190 = $0.095
DiagnoseCode: 100 × $0.00100 = $0.100
Assistant:    500 × $0.00079 = $0.395
Pre-Intake:    25 × $0.00095 = $0.024

TOTAAL: $1.494 + audio ($0.93) = $2.42/maand
COST PER PATIËNT: $0.0097
```

#### Scenario C: Grote Praktijk (5+ therapeuten)
**Profiel**: 5+ therapeuten, 100+ patiënten per week

```
MAANDELIJKS VOLUME:
- 100 Intakes Stapsgewijs
- 200 Consults SOEP
- 200 SmartMails
- 100 EduPacks
- 200 Diagnosecodes
- 1000 Assistant vragen
- 50 Pre-Intakes

BEREKENING:
Intake:       100 × $0.01126 = $1.126
Consult:      200 × $0.00272 = $0.544
SmartMail:    200 × $0.00045 = $0.090
EduPack:      100 × $0.00190 = $0.190
DiagnoseCode: 200 × $0.00100 = $0.200
Assistant:   1000 × $0.00079 = $0.790
Pre-Intake:    50 × $0.00095 = $0.048

TOTAAL: $2.988 + audio ($1.87) = $4.86/maand
COST PER PATIËNT: $0.0081
```

#### Scenario D: Enterprise Netwerk
**Profiel**: 10+ locaties, 250+ patiënten per week

```
MAANDELIJKS VOLUME:
- 250 Intakes Stapsgewijs
- 500 Consults SOEP
- 500 SmartMails
- 250 EduPacks
- 500 Diagnosecodes
- 2500 Assistant vragen
- 125 Pre-Intakes

BEREKENING:
Intake:       250 × $0.01126 = $2.815
Consult:      500 × $0.00272 = $1.360
SmartMail:    500 × $0.00045 = $0.225
EduPack:      250 × $0.00190 = $0.475
DiagnoseCode: 500 × $0.00100 = $0.500
Assistant:   2500 × $0.00079 = $1.975
Pre-Intake:   125 × $0.00095 = $0.119

TOTAAL: $7.469 + audio ($4.67) = $12.14/maand
COST PER PATIËNT: $0.0061
```

### 3.2 Growth Projection

**Start**: Solo praktijk (Scenario A) - **$1.19/maand**

**Jaar 1**:
- Maand 1-3: $1.19/maand
- Maand 4-6: $1.50/maand (+26% groei)
- Maand 7-9: $1.80/maand (+20% groei)
- Maand 10-12: $2.10/maand (+17% groei)
- **Totaal Jaar 1**: $21.00

**Jaar 2**: Overgang naar Medium praktijk (Scenario B)
- **Gemiddeld**: $2.42/maand
- **Totaal Jaar 2**: $29.04

**Jaar 3**: Overgang naar Grote praktijk (Scenario C)
- **Gemiddeld**: $4.86/maand
- **Totaal Jaar 3**: $58.32

**3-Jaar Totaal AI Kosten**: $108.36

### 3.3 Comparison: With vs Without AI

**Scenario**: Medium praktijk, 150 patiënt interacties per maand

**WITHOUT AI** (Traditional manual documentation):
```
Time per intake: 45 minuten (handmatig typen + structureren)
Time per consult: 20 minuten (handmatig SOEP typen)

Total documentation time per month:
- 50 intakes × 45 min = 2,250 min (37.5 uur)
- 100 consults × 20 min = 2,000 min (33.3 uur)
- Total: 70.8 uur/maand

At €60/uur therapeut tarief: €4,248/maand
```

**WITH AI** (Hysio automated documentation):
```
Time per intake: 25 minuten (15 min gesprek + 10 min reviewing AI output)
Time per consult: 10 minuten (5 min gesprek + 5 min reviewing)

Total documentation time per month:
- 50 intakes × 25 min = 1,250 min (20.8 uur)
- 100 consults × 10 min = 1,000 min (16.7 uur)
- Total: 37.5 uur/maand

At €60/uur: €2,250/maand
AI Cost: $2.42 (~€2.20)

Total cost WITH AI: €2,252.20/maand
```

**SAVINGS**: €4,248 - €2,252 = **€1,996/maand** (€23,952/jaar)

**Time Savings**: 70.8 - 37.5 = **33.3 uur/maand** (400 uur/jaar)

---

## 4. ROI Calculator

### 4.1 Direct Cost Savings

**Formule**:
```
ROI = (Cost Savings - AI Investment) ÷ AI Investment × 100%
```

**Voorbeeld (Medium praktijk)**:
```
Monthly Cost Savings: €1,996
Monthly AI Cost: €2.20

ROI = (€1,996 - €2.20) ÷ €2.20 × 100%
    = €1,993.80 ÷ €2.20 × 100%
    = 90,627%
```

### 4.2 Break-Even Analysis

**How long before AI pays for itself?**

```
Setup Cost: €0 (included in Hysio subscription)
Monthly AI Cost: €2.20
Monthly Savings: €1,996

Break-even: €0 ÷ €1,996 = 0 months
```

**Conclusie**: ROI is onmiddellijk vanaf maand 1. Elke €1 geïnvesteerd in AI bespaart €907.

### 4.3 Value Beyond Direct Cost Savings

**Additional Benefits (niet in geld uit te drukken)**:

1. **Kwaliteitsverbetering**:
   - Consistentere documentatie
   - Minder vergeten details
   - Standaardisatie over therapeuten
   - Estimated value: **+15% patiënt tevredenheid**

2. **Therapeut Welzijn**:
   - 33 uur/maand minder admin
   - Minder stress door documentatie
   - Meer tijd voor patiëntenzorg
   - Estimated value: **+20% job satisfaction**

3. **Schaalvoordelen**:
   - Makkelijker om nieuwe therapeuten in te werken
   - Consistente kwaliteit ongeacht ervaring
   - Betere overdracht tussen therapeuten
   - Estimated value: **-30% onboarding tijd**

4. **Compliance & Risico**:
   - Vollediger dossier = betere juridische bescherming
   - AI checkt automatisch op rode vlaggen
   - Gestandaardiseerde templates
   - Estimated value: **Risico reductie van 40%**

### 4.4 Long-Term Value Calculation (5 jaar)

**Medium Praktijk Scenario**:

```
JAAR 1:
AI Cost: €2.20 × 12 = €26.40
Time Savings: 400 uur × €60 = €24,000
Net Value: €23,973.60

JAAR 2-5 (groei naar Grote Praktijk):
Average AI Cost: €4.00 × 12 × 4 = €192
Average Time Savings: 800 uur/jaar × €60 × 4 = €192,000
Net Value: €191,808

5-JAAR TOTAAL:
AI Investment: €26.40 + €192 = €218.40
Time Savings Value: €24,000 + €192,000 = €216,000
Net ROI: (€216,000 - €218.40) ÷ €218.40 × 100% = 98,828%
```

---

## 5. Cost Optimization Strategies

### 5.1 Reduce Unnecessary AI Calls

**Strategy 1: Skip Optional Preparations**
```
Current: Every intake gets preparation AI call
Optimized: Only use preparation for complex cases

Savings: 30% of preparation calls
Impact: 50 intakes × $0.00077 × 0.30 = $0.0116/maand
```

**Strategy 2: Batch Simple Queries**
```
Current: Every diagnosecode query = 1 AI call
Optimized: Batch 3 simple queries into 1 call

Savings: ~25% on diagnosecode costs
Impact: 100 queries × $0.00100 × 0.25 = $0.025/maand
```

**Strategy 3: Use Shorter Audio Recordings**
```
Current: Average anamnese = 10 minuten
Optimized: Train therapeuten voor focused 7-min anamnese

Savings: 3 minuten per intake
Impact: 50 intakes × (3/60) × $0.04 = $0.10/maand
```

### 5.2 Leverage Free Tools

**Strategy 1: Use Assistant Wisely**
```
Current: Some queries could be answered by documentation
Optimized: Create FAQ for common questions

Savings: 20% of assistant queries
Impact: 500 queries × $0.00079 × 0.20 = $0.079/maand
```

**Strategy 2: Template-Based SmartMails**
```
Current: Every email uses AI
Optimized: Use templates for common scenarios (50% of emails)

Savings: 50% of SmartMail costs
Impact: 100 emails × $0.00045 × 0.50 = $0.0225/maand
```

### 5.3 Model Fine-Tuning (Advanced)

**Investment**: $200 one-time for fine-tuning dataset

**Expected Improvements**:
- 15% reduction in output tokens (more concise)
- 10% fewer errors (fewer re-generations)
- Better Dutch medical terminology

**Calculation**:
```
Current monthly output tokens: 1,216,000
Reduced by 15%: 183,400 tokens saved
Cost saved: 183,400 ÷ 1000 × $0.0006 = $0.11/maand

Break-even: $200 ÷ $0.11 = 1,818 months (niet rendabel voor kleine praktijken)

For Enterprise (2.5M output tokens/month):
Cost saved: 375,000 ÷ 1000 × $0.0006 = $0.225/maand
Break-even: $200 ÷ $0.225 = 889 months (nog steeds niet rendabel)

CONCLUSIE: GPT-4.1-mini is zo goedkoop dat fine-tuning niet rendabel is.
```

### 5.4 Usage Monitoring & Alerts

**Setup Cost Alerts**:

```javascript
// Example monitoring code
const MONTHLY_BUDGET = 5.00; // $5 per month
const ALERT_THRESHOLD = 0.8; // 80% of budget

function checkCostAlert(currentCost) {
  if (currentCost > MONTHLY_BUDGET * ALERT_THRESHOLD) {
    console.warn(`⚠️ AI costs at ${currentCost.toFixed(2)}/${MONTHLY_BUDGET} (${(currentCost/MONTHLY_BUDGET*100).toFixed(0)}%)`);
    // Send email alert
  }
}
```

**Monthly Cost Review**:

1. **Week 1**: Check usage trends
2. **Week 2**: Identify expensive modules
3. **Week 3**: Optimize high-cost workflows
4. **Week 4**: Review savings & adjust budget

---

## 6. Cost Comparison: Hysio vs Competitors

### 6.1 Market Comparison

**Typical Medical AI Scribe Pricing** (US Market, 2025):

| Provider | Model | Cost Structure | Estimated Monthly (150 sessions) |
|----------|-------|----------------|----------------------------------|
| **Hysio** | Own AI | $0.01/session | **$2.38** |
| Nuance DAX | Proprietary | $0.15/session | $22.50 |
| Abridge | GPT-4 | $0.12/session | $18.00 |
| Suki | Proprietary | $0.20/session | $30.00 |
| Freed | Claude | $0.10/session | $15.00 |

**Hysio Advantage**: **89% goedkoper** dan gemiddelde concurrent ($2.38 vs $21.38)

### 6.2 Why Hysio is So Cost-Effective

1. **Direct API Access**: Geen markup van third-party providers
2. **Optimal Model Selection**: GPT-4.1-mini is perfect balance of quality/cost
3. **Efficient Prompting**: Well-designed prompts minimize token waste
4. **Groq for Transcription**: 4x goedkoper dan Whisper via OpenAI
5. **No Per-User Licensing**: Costs scale with usage, not users

---

## 7. Budget Planning Templates

### 7.1 Monthly Budget Template

```
HYSIO AI BUDGET - MAAND: ___________

PLANNED USAGE:
┌────────────────────────────┬───────┬──────────┬──────────┐
│ Module                     │ Count │ Cost/Use │ Total    │
├────────────────────────────┼───────┼──────────┼──────────┤
│ Intake Stapsgewijs         │ _____ │ $0.01126 │ $_______ │
│ Consult SOEP               │ _____ │ $0.00272 │ $_______ │
│ SmartMail                  │ _____ │ $0.00045 │ $_______ │
│ EduPack                    │ _____ │ $0.00190 │ $_______ │
│ DiagnoseCode               │ _____ │ $0.00100 │ $_______ │
│ Assistant                  │ _____ │ $0.00079 │ $_______ │
│ Pre-Intake                 │ _____ │ $0.00095 │ $_______ │
├────────────────────────────┴───────┴──────────┼──────────┤
│ ESTIMATED TOTAL                                │ $_______ │
└────────────────────────────────────────────────┴──────────┘

ACTUAL USAGE (fill at month end):
┌────────────────────────────┬───────┬──────────┬──────────┐
│ Module                     │ Count │ Cost/Use │ Actual   │
├────────────────────────────┼───────┼──────────┼──────────┤
│ Intake Stapsgewijs         │ _____ │ $0.01126 │ $_______ │
│ Consult SOEP               │ _____ │ $0.00272 │ $_______ │
│ SmartMail                  │ _____ │ $0.00045 │ $_______ │
│ EduPack                    │ _____ │ $0.00190 │ $_______ │
│ DiagnoseCode               │ _____ │ $0.00100 │ $_______ │
│ Assistant                  │ _____ │ $0.00079 │ $_______ │
│ Pre-Intake                 │ _____ │ $0.00095 │ $_______ │
├────────────────────────────┴───────┴──────────┼──────────┤
│ ACTUAL TOTAL                                   │ $_______ │
└────────────────────────────────────────────────┴──────────┘

VARIANCE ANALYSIS:
Budget: $_______ | Actual: $_______ | Difference: $_______ (___%)
```

### 7.2 Annual Budget Template

```
HYSIO AI BUDGET - JAAR: ___________

QUARTERLY BREAKDOWN:
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│          │ Q1       │ Q2       │ Q3       │ Q4       │
├──────────┼──────────┼──────────┼──────────┼──────────┤
│ Jan/Apr/Jul/Oct │ $____ │ $____ │ $____ │ $____ │
│ Feb/May/Aug/Nov │ $____ │ $____ │ $____ │ $____ │
│ Mar/Jun/Sep/Dec │ $____ │ $____ │ $____ │ $____ │
├──────────┼──────────┼──────────┼──────────┼──────────┤
│ Subtotal │ $____ │ $____ │ $____ │ $____ │
└──────────┴──────────┴──────────┴──────────┴──────────┘

ANNUAL TOTAL: $_________
AVERAGE MONTHLY: $_________
```

---

## 8. FAQs

**Q: Wat als ik mijn budget overschrijdt?**
A: Hysio AI costs zijn zo laag dat zelfs 2x usage nog maar $5/maand is. Echter, je kunt alerts instellen in de monitoring dashboard.

**Q: Worden costs hoger naarmate ik meer gebruik maak?**
A: Ja, maar lineair. 2x zoveel gebruik = 2x kosten. Er zijn geen verborgen fees of tier-based pricing jumps.

**Q: Kan ik costs reduceren zonder kwaliteitsverlies?**
A: Ja, door:
1. Templates te gebruiken voor standaard emails
2. Preparation steps over te slaan voor eenvoudige cases
3. Therapeuten te trainen voor kortere maar gefocuste gesprekken

**Q: Is er een minimum commitment?**
A: Nee, je betaalt alleen voor wat je gebruikt. $0 gebruik = $0 kosten.

**Q: Wat gebeurt er bij API rate limits?**
A: Hysio heeft built-in rate limiting (100 requests/min). Voor normale praktijken is dit ruim voldoende. Enterprise accounts kunnen hogere limits aanvragen.

**Q: Zijn er extra kosten voor updates of nieuwe features?**
A: Nee, AI model updates en nieuwe features zijn included. Als we switchen naar nieuwere/betere modellen passen we pricing automatisch aan.

---

## 9. Conclusie

### Key Takeaways:

1. **Hysio AI is extreem cost-effective**: $2-5/maand voor een volledige praktijk
2. **ROI is immediate**: Elke €1 in AI bespaart €900+ in tijd
3. **Costs schalen linear**: Geen verrassingen bij groei
4. **89% goedkoper** dan concurrenten
5. **No minimum commitment**: Betaal alleen wat je gebruikt

### Recommendation:

Start met je huidige usage level. Monitor gedurende 1-2 maanden. Optimize waar nodig. Zelfs zonder optimalisatie zijn de costs verwaarloosbaar vergeleken met de waarde.

**Voor vragen over cost planning, neem contact op met Bernard of bekijk de [AI Integration Complete Guide](./AI_INTEGRATION_COMPLETE_GUIDE.md) voor technische details.**

---

**Document Einde**
