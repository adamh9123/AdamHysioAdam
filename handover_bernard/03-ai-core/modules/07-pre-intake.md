# Hysio Pre-Intake - Module Documentation

**Module**: Hysio Pre-Intake
**Version**: 1.0
**AI Calls**: 1 per pre-intake
**Model**: GPT-4.1-mini
**Cost**: ~$0.001/intake | $0.025/month (25 intakes)

---

## Module Overview

Pre-intake questionnaire processing. Analyzes patient's pre-intake form responses and generates initial clinical hypothesis and preparation suggestions for first appointment.

**Use Case**:
- Patient fills online pre-intake form
- AI analyzes responses
- Generates: Initial hypothesis, red flags check, preparation suggestions
- Therapist reviews before first appointment

---

## Workflow

1. Patient submits pre-intake form online
2. API processes responses (HHSB-based structure)
3. AI generates initial analysis
4. Therapist reviews pre-appointment
5. Saves time during actual intake

**Processing Time**: 5-8 seconds

---

## Token & Cost Analysis

**Per Pre-Intake**:
- Input: 1,500 tokens (system 800 + form responses 500 + context 200)
- Output: 600 tokens (hypothesis + red flags + prep)
- Total: ~2,100 tokens
- Cost: $0.001

**Monthly** (25 pre-intakes):
- Total cost: $0.025
- Time saved: 12.5 hours (30 min/intake reading forms)
- ROI: 30,000%

---

## Code References

- API: `hysio/src/app/api/pre-intake/process-hhsb/route.ts`
- Frontend: `hysio/src/app/pre-intake/page.tsx`
- Form: Patient-facing questionnaire (separate)

---

## Analysis Output

**Generated Content:**

1. **Initial Clinical Hypothesis**
   - Likely diagnosis based on responses
   - Differential diagnoses to consider
   - Confidence level

2. **Red Flags Screening**
   - Automatic detection based on keywords
   - Severity classification
   - Referral recommendations

3. **Preparation Suggestions**
   - Which tests to prepare
   - Special equipment needed
   - Estimated appointment duration

4. **Key Points for Therapist**
   - Important anamnesis focus areas
   - Patient expectations/concerns
   - Psychosocial factors noted

---

## Optimization Tips

1. **Smart Forms**: Dynamic questions based on chief complaint
2. **Auto-Triage**: Urgent cases flagged automatically
3. **Template Integration**: Pre-fill intake documentation

---

For integration with main intake workflow, see [modules/01-intake-stapsgewijs.md](./01-intake-stapsgewijs.md)

**Last Updated**: 2025-10-02
