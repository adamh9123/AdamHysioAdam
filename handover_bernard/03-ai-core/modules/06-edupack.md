# Hysio EduPack - Module Documentation

**Module**: Hysio EduPack
**Version**: 1.0
**AI Calls**: 1-7 per package
**Model**: GPT-4.1-mini
**Cost**: ~$0.002/package | $0.10/month (50 packages)

---

## Module Overview

Automated patient education material generation. Creates personalized, condition-specific educational content with exercises, anatomy explanations, and self-management advice.

**Content Types:**
- Anatomy & pathology explanation (B1 level Dutch)
- Exercise instructions with images
- Do's and Don'ts
- Recovery timeline
- Red flags awareness
- Self-management tips

---

## Workflow

1. Select condition (e.g., "Tennis Elbow")
2. Customize content sections
3. AI generates educational package
4. Preview and edit
5. Export as PDF/print for patient

**Processing Time**: 10-15 seconds (multiple AI calls for comprehensive content)

---

## Token & Cost Analysis

**Per Package** (7 sections average):
- Input per section: 600 tokens (system 300 + condition 200 + template 100)
- Output per section: 400 tokens
- Total: 7 sections × 1,000 tokens = ~7,000 tokens
- Cost: $0.002

**Monthly** (50 packages):
- Total cost: $0.10
- Time saved: 42 hours (50 min/package manual creation)
- ROI: 25,000%

---

## Code References

- API: `hysio/src/app/api/edu-pack/generate/route.ts`
- Privacy Filter: `hysio/src/lib/edupack/privacy-filter.ts`
- Frontend: `hysio/src/app/edupack/page.tsx`

---

## Content Sections

1. **Wat is [Conditie]?**: Anatomie en pathofysiologie (B1 niveau)
2. **Oorzaken & Risicofactoren**: Waarom ontstaat dit?
3. **Symptomen Herkenning**: Wat kunt u verwachten?
4. **Behandeling**: Wat doen wij? (incl. fysiotherapie rol)
5. **Oefeningen**: 5-8 oefeningen met uitleg
6. **Do's & Don'ts**: Praktische tips
7. **Herstel Timeline**: Wat verwachten wanneer?
8. **Rode Vlaggen**: Wanneer direct contact opnemen?

---

## Optimization Tips

1. **Template Library**: Save common conditions → instant generation
2. **Modular Content**: Reuse exercise descriptions across conditions
3. **Batch Export**: Generate multiple packages in session
4. **Multi-language**: Prepare English versions for expat patients

---

For complete template library, see [guides/AI_INTEGRATION_COMPLETE_GUIDE.md](../guides/AI_INTEGRATION_COMPLETE_GUIDE.md) Section 4.6

**Last Updated**: 2025-10-02
