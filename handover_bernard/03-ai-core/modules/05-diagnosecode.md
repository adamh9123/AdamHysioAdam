# Hysio DiagnoseCode - Module Documentation

**Module**: Hysio DiagnoseCode  
**Version**: 1.0  
**AI Calls**: 1-3 per lookup  
**Model**: GPT-4.1-mini  
**Cost**: ~$0.001/lookup | $0.10/month (100 lookups)

---

## Module Overview

Intelligent diagnosis code finder for DCSPH (Dutch Classification System for Physiotherapy) and ICF codes based on clinical description.

**Key Features:**
- Natural language input → codes
- DCSPH primary classification
- ICF secondary classification
- Confidence scores
- Alternative suggestions

---

## Workflow

1. Enter clinical description (e.g., "schouderimpingement na trauma")
2. AI analyzes and suggests codes
3. Display DCSPH + ICF codes with confidence
4. Select appropriate codes
5. Copy to EPD/declaration system

**Processing Time**: 2-4 seconds

---

## Token & Cost Analysis

**Per Lookup** (average):
- Input: 1,200 tokens (system 600 + description 400 + context 200)
- Output: 400 tokens (codes + explanations)
- Total: ~1,600 tokens
- Cost: $0.001

**Monthly** (100 lookups):
- Total cost: $0.10
- Time saved: 17 hours (10 min/lookup manual search)
- ROI: 10,000%

---

## Code References

- API: `hysio/src/app/api/diagnosecode/find/route.ts`
- Frontend: `hysio/src/app/diagnosecode/page.tsx`
- Database: DCSPH classification (hardcoded or external)

---

## DCSPH Classification

**Primary Categories:**
- L: Locomotor system (most common)
- N: Neurological
- R: Respiratory
- C: Cardiovascular
- G: Geriatric
- U: Urogenital
- P: Pediatric

**Example Codes:**
- L01: Cervical spine disorders
- L08: Shoulder disorders
- L12: Knee disorders
- N02: Peripheral nerve lesions

---

## Example Usage

**Input:**
```
"Chronische lage rugpijn met uitstraling naar been, 
 bewegingsbeperking, geen neurologische uitval"
```

**Output:**
```
DCSPH Codes (gesorteerd op relevantie):

1. L05 (Lage rugaandoeningen) - Confidence: 95%
   → Meest specifiek voor lumbale klachten

2. L05.2 (Lumbale radiculopathie) - Confidence: 75%
   → Bij uitstraling, geen neurologische uitval wijst op niet-specifiek

ICF Codes:

- b280 (Pijn) - Primair symptoom
- b710 (Mobiliteit van gewricht functies) - Bewegingsbeperking
- d410 (Basale lichaamshouding veranderen) - Functionele beperking
- d450 (Lopen) - Activiteitsbeperking

Advies: L05 als primaire code, ICF voor functionele impact
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Irrelevant codes | Vague description | Add specific symptoms, location, duration |
| Low confidence | Ambiguous presentation | Request differential codes |
| Missing ICF | Focus on diagnosis | Include functional limitations in description |

---

## Optimization Tips

1. **Specific Descriptions**: Include location + duration + mechanism → better accuracy
2. **Batch Mode**: Enter multiple conditions at once
3. **Template Use**: Save common code combinations for practice patterns

---

For complete classification tables, see [guides/AI_INTEGRATION_COMPLETE_GUIDE.md](../guides/AI_INTEGRATION_COMPLETE_GUIDE.md) Section 4.5

**Last Updated**: 2025-10-02
