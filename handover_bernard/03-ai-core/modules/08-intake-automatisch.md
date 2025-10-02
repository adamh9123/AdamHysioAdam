# Hysio Intake Automatisch - Module Documentation

**Module**: Hysio Intake Automatisch
**Version**: 1.0
**AI Calls**: 4 (transcription + 3 processing steps)
**Model**: Groq Whisper + GPT-4.1-mini
**Cost**: ~$0.015/intake | $0.375/month (25 intakes)

---

## Module Overview

Fully automated intake workflow. Single recording → complete intake documentation with HHSB, clinical conclusion, and care plan in one go.

**Difference from Stapsgewijs:**
- Stapsgewijs: 2 recordings, step-by-step guidance (10 AI calls)
- Automatisch: 1 recording, automatic processing (4 AI calls)
- Trade-off: Faster vs. More guided/thorough

---

## Workflow

1. Record complete intake conversation (20-30 min)
2. Audio transcription (Groq Whisper)
3. AI extracts HHSB structure
4. AI generates clinical conclusion
5. AI creates care plan
6. Review and export

**Total Time**: 25-35 min (20-30 recording + 5 processing)

---

## Token & Cost Analysis

**Per Automated Intake:**

AI Call 1 - Transcription:
- Audio: 25 min avg
- Cost: 0.417 hours × $0.04 = $0.0167

AI Call 2 - HHSB Processing:
- Input: 3,000 tokens (system + full transcript)
- Output: 1,500 tokens
- Cost: $0.0014

AI Call 3 - Clinical Conclusion:
- Input: 2,500 tokens (system + HHSB + transcript excerpts)
- Output: 800 tokens
- Cost: $0.0009

AI Call 4 - Care Plan:
- Input: 2,800 tokens (system + conclusion + HHSB)
- Output: 1,000 tokens
- Cost: $0.0010

**Total per Intake**: ~$0.020 (Groq $0.017 + OpenAI $0.003)

**Monthly** (25 automated intakes):
- Total cost: $0.50
- Time saved vs manual: 42 hours (100 min/intake manual)
- ROI: 5,000%

---

## Code References

- API Transcription: `hysio/src/app/api/transcribe/route.ts`
- API HHSB: `hysio/src/app/api/hhsb/process/route.ts`
- Prompt: `hysio/src/lib/prompts/intake-automatisch/stap1-verwerking-volledige-conclusie.ts`
- Frontend: `hysio/src/app/scribe/intake-automatisch/`

---

## Comparison with Intake Stapsgewijs

| Aspect | Automatisch | Stapsgewijs |
|--------|-------------|-------------|
| Recordings | 1 (full intake) | 2 (anamnese + onderzoek) |
| AI Calls | 4 | 10 |
| Duration | 25-35 min | 35-45 min |
| Cost | $0.020 | $0.012 |
| Guidance | Minimal | Step-by-step |
| Best For | Experienced therapists | Students/complex cases |
| Documentation Quality | Good | Excellent |

---

## Use Cases

**Ideal for Automated:**
- Routine follow-up intakes
- Experienced therapists who know workflow
- Time-sensitive situations
- Straightforward presentations

**Better for Stapsgewijs:**
- Complex multifactorial cases
- Students/junior therapists learning
- Comprehensive initial intakes
- Cases needing thorough investigation

---

## Optimization Tips

1. **Recording Quality**: Good microphone → better transcription → less errors
2. **Structured Conversation**: Follow logical flow (HHSB order) for better AI extraction
3. **Hybrid Approach**: Use Automatisch for anamnese, Stapsgewijs for onderzoek
4. **Quality Check**: Always review AI output, especially conclusions

---

For step-by-step alternative, see [modules/01-intake-stapsgewijs.md](./01-intake-stapsgewijs.md)

**Last Updated**: 2025-10-02
