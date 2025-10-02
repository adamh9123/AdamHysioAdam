# Hysio Assistant - Module Documentation

**Module**: Hysio Assistant  
**Version**: 7.0 (ULTRATHINK)  
**AI Calls**: 1 per question (streaming)  
**Model**: GPT-4.1-mini  
**Cost**: ~$0.001/question | $0.50/month (500 questions)

---

## Module Overview

Real-time AI clinical decision support for physiotherapists. Functions as evidence-based sparring partner with streaming responses.

**Key Features:**
- v7.0 ULTRATHINK prompt (EBP + ICF + Biopsychosocial)
- Real-time streaming (SSE)
- Conversation history
- Red flags safety protocol
- GDPR zero-tolerance
- Clinical disclaimer system

---

## Workflow

1. User types question
2. API streams response (GPT-4.1-mini)
3. Real-time display with formatting
4. Optional follow-up in same conversation

**Processing Time**: 2-5 seconds (streaming starts <1s)

---

## Token & Cost Analysis

**Per Question** (average):
- Input: 4,500 tokens (system 3,500 + history 500 + question 200 + context 300)
- Output: 550 tokens
- Total: ~5,050 tokens
- Cost: $0.001

**Monthly** (500 questions):
- Total cost: $0.50
- Time saved: 83 hours (10 min/question)
- ROI: 90,000%

---

## Code References

- API: `hysio/src/app/api/assistant/route.ts`
- Prompt: `hysio/src/lib/assistant/system-prompt.ts` (line 11-92)
- Frontend: `hysio/src/app/assistant/page.tsx`
- Chat: `hysio/src/components/assistant/chat-interface.tsx`

---

## System Prompt (v7.0)

**Core Principles:**
1. Evidence-Based Practice (verplichte bronvermelding)
2. ICF-Model als structuur
3. Biopsychosociaal perspectief
4. Klinisch redeneren ("denk hardop")
5. Volgende stap anticiperen

**Safety Protocols:**
- GDPR: Weigert persoonsgegevens onmiddellijk
- Red Flags: Prioriteit op veiligheid, verwijs naar arts
- Geen diagnoses/voorschriften: Enkel ter overweging therapeut

---

## Example Usage

**Simple Question:**
```
Q: "Wat zijn de 3 tests voor SAPS?"
A: [Direct antwoord met Neer, Hawkins-Kennedy, Jobe tests + bron]
   Tokens: ~300
```

**Complex Question:**
```
Q: "45-jarige acute enkeldistorsie, kan niet belasten. Eerste beoordeling?"
A: [Uitgebreid: Ottawa rules → Anamnese → Onderzoek → Classificatie → Behandeling]
   Tokens: ~1,200
```

**Privacy Violation:**
```
Q: "Mijn patiënt Jan de Vries..."
A: [Automatische weigering + educatie over anonimisering]
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Streaming interrupted | Network/rate limit | Check connection, verify 100/min limit |
| No citations | Prompt not loaded | Verify HYSIO_ASSISTANT_SYSTEM_PROMPT |
| GDPR too aggressive | Sensitive detection | Use "patiënt A", avoid ALL names |
| High token usage | Long history | Trim to last 6 messages, summarize after 10 |

---

## Optimization Tips

1. **Conversation Management**: Keep last 3 exchanges only → 50-70% token reduction
2. **FAQ Caching**: Cache common questions for 1 hour → 30% cost reduction
3. **Adaptive Prompt**: Short questions use lighter prompt → 20% savings
4. **Token Limit**: Set max_tokens: 800 → prevents verbose responses

---

For complete technical details, see:
- [guides/AI_INTEGRATION_COMPLETE_GUIDE.md](../guides/AI_INTEGRATION_COMPLETE_GUIDE.md) Section 4.3
- [guides/COST_CALCULATOR.md](../guides/COST_CALCULATOR.md) for detailed cost scenarios

**Last Updated**: 2025-10-02
