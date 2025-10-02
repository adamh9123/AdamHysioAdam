# Hysio SmartMail - Module Documentation

**Module**: Hysio SmartMail  
**Version**: 1.0  
**AI Calls**: 1 per email  
**Model**: GPT-4.1-mini  
**Cost**: ~$0.0005/email | $0.05/month (100 emails)

---

## Module Overview

Automated professional email generation for patient communication. Creates personalized emails based on context and template selection.

**Use Cases:**
- Appointment confirmations
- Treatment updates
- Exercise instructions
- Follow-up reminders
- Administrative communication

---

## Workflow

1. Select email type (confirmation/update/instructions/reminder)
2. Provide context (patient info, treatment details)
3. AI generates professional email
4. Review and edit if needed
5. Send or copy to email client

**Processing Time**: 3-5 seconds

---

## Token & Cost Analysis

**Per Email** (average):
- Input: 800 tokens (system 400 + context 200 + template 200)
- Output: 300 tokens
- Total: ~1,100 tokens
- Cost: $0.0005

**Monthly** (100 emails):
- Total cost: $0.05
- Time saved: 25 hours (15 min/email manual)
- ROI: 30,000%

---

## Code References

- API: `hysio/src/app/api/smartmail/generate/route.ts`
- Frontend: `hysio/src/app/smartmail/page.tsx`
- Templates: Inline in API route

---

## Email Templates

**Available Types:**
1. **Appointment Confirmation**: Datum, tijd, locatie, voorbereiding
2. **Treatment Update**: Progressie, volgende stappen
3. **Exercise Instructions**: Oefenprogramma, frequentie, tips
4. **Follow-up Reminder**: Controle-afspraak, symptomen monitoring
5. **Administrative**: Verzuim, declaratie, algemeen

**Tone**: Professional, empathisch, helder

---

## Example Usage

**Input:**
```
Type: Exercise Instructions
Patient: 45-jarige man, schouderklachten
Context: ROM-oefeningen, 3x daags, 2 weken
```

**Output:**
```
Beste [Patiënt],

Naar aanleiding van uw behandeling vandaag, stuur ik u het 
besproken oefenprogramma voor thuis.

**Schouder Mobiliteit Oefeningen:**

1. Pendelen: 2x15 per arm, 3x per dag
2. Actieve elevatie: 3x10, binnen pijngrens
3. Externe rotatie: 2x10 met elastiek

Uitvoering: 3x per dag gedurende 2 weken. Bij toenemende pijn 
of vragen, neem contact op.

Volgende afspraak: [Datum] om [Tijd]

Met vriendelijke groet,
[Therapeut naam]
[Praktijknaam]
```

---

## Optimization Tips

1. **Template Caching**: Reuse common formats → 0 AI cost for repeats
2. **Batch Generation**: Generate multiple emails in one session
3. **Quick Edits**: Minor changes manually, avoid regeneration

---

For complete details, see [guides/AI_INTEGRATION_COMPLETE_GUIDE.md](../guides/AI_INTEGRATION_COMPLETE_GUIDE.md) Section 4.4

**Last Updated**: 2025-10-02
