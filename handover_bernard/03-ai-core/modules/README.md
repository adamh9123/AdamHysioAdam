# Hysio AI Modules - Individual Documentation

**Purpose**: Detailed documentation for each AI-powered module in the Hysio platform
**Template**: Each module follows the structure of `01-intake-stapsgewijs.md`

---

## Module Index

| # | Module | Status | Priority | Purpose | AI Calls |
|---|--------|--------|----------|---------|----------|
| 01 | [Intake Stapsgewijs](./01-intake-stapsgewijs.md) | ✅ Complete | Critical | Step-by-step intake workflow | 8 |
| 02 | [Consult SOEP](./02-consult-soep.md) | ✅ Complete | High | SOEP consultation reports | 3 |
| 03 | [Assistant](./03-assistant.md) | ✅ Complete | High | AI clinical decision support | 1 |
| 04 | [SmartMail](./04-smartmail.md) | ✅ Complete | Medium | Automated email generation | 1 |
| 05 | [DiagnoseCode](./05-diagnosecode.md) | ✅ Complete | Medium | Diagnosis code finder (DCSPH/ICF) | 1 |
| 06 | [EduPack](./06-edupack.md) | ✅ Complete | Medium | Patient education materials | 1-7 |
| 07 | [Pre-Intake](./07-pre-intake.md) | ✅ Complete | Low | Pre-intake processing | 1 |
| 08 | [Intake Automatisch](./08-intake-automatisch.md) | ✅ Complete | Low | Automated full intake | 4 |

---

## Documentation Structure

Each module documentation follows this comprehensive structure:

### 1. Module Overview
- Purpose and key features
- User journey (mermaid diagram)
- Integration points

### 2. Complete Workflow
- Step-by-step breakdown
- Duration estimates
- User interaction points

### 3. AI Integration Points
- API endpoints used
- Models & configuration
- Data flow (mermaid sequence diagram)

### 4. Token Usage Analysis
- Token breakdown per AI call
- Input/output token estimates
- Variable factors affecting token count

### 5. Cost Analysis
- Cost per single use
- Monthly cost projection (based on realistic usage)
- Annual cost projection
- Optimization opportunities

### 6. Code References
- Frontend components (with file paths and line numbers)
- API routes
- Prompt files
- State management

### 7. Prompt Documentation
- System prompt (full text)
- User prompt template
- Prompt version history

### 8. Example Input/Output
- Typical use case
- Edge cases
- Error scenarios

### 9. Troubleshooting
- Common issues
- Error messages
- Debugging steps

### 10. Optimization Tips
- Performance improvements
- Cost reduction strategies
- Quality enhancement

---

## Usage Scenarios

### For New Developers (Bernard)
1. Start with `01-intake-stapsgewijs.md` to understand the documentation pattern
2. Read modules relevant to your current task
3. Use code references to navigate codebase

### For Cost Analysis
- Section 5 in each module provides cost breakdowns
- See `guides/COST_CALCULATOR.md` for combined analysis

### For Troubleshooting
- Section 9 in each module has common issues
- Check `guides/AI_INTEGRATION_COMPLETE_GUIDE.md` Section 8 for system-wide issues

### For Prompt Engineering
- Section 7 in each module shows current prompts
- See `prompts/` directory for extracted markdown versions

---

## Cost Summary (All Modules)

**Monthly Cost** (Realistic Practice Scenario):
- 50 Intake Stapsgewijs
- 100 Consult SOEP
- 500 Assistant questions
- 100 SmartMail
- 100 DiagnoseCode lookups
- 50 EduPack generations
- 25 Pre-Intake processing
- 25 Intake Automatisch

**Total**: ~$2.38/month (OpenAI $1.45 + Groq $0.93)

See individual modules for detailed breakdowns.

---

## Related Documentation

- **Master Guide**: [guides/AI_INTEGRATION_COMPLETE_GUIDE.md](../guides/AI_INTEGRATION_COMPLETE_GUIDE.md)
- **Cost Calculator**: [guides/COST_CALCULATOR.md](../guides/COST_CALCULATOR.md)
- **Prompt Library**: [prompts/](../prompts/)
- **Architecture Plan**: [ARCHITECTURE_IMPROVEMENT_PLAN.md](../ARCHITECTURE_IMPROVEMENT_PLAN.md)

---

**Last Updated**: 2025-10-02
**Maintained By**: Bernard (Hysio Technical Lead)
