# Issue Templates

Please choose the appropriate template below and fill out all required sections.

---

## 🐛 Bug Report Template

**Summary**
A clear and concise description of the bug.

**Environment**
- Hysio Version: [e.g., v2.1.0]
- Browser: [e.g., Chrome 91.0.4472.124]
- Operating System: [e.g., Windows 10, macOS 11.5]
- Node.js Version: [e.g., 18.17.0]

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
A clear and concise description of what you expected to happen.

**Actual Behavior**
A clear and concise description of what actually happened.

**Screenshots/Logs**
If applicable, add screenshots or error logs to help explain your problem.

**Medical Data Impact**
- [ ] This bug affects patient data processing
- [ ] This bug affects medical transcription accuracy
- [ ] This bug affects diagnosis code generation
- [ ] This bug affects data security/privacy
- [ ] No medical data impact

**Healthcare Compliance Check**
- [ ] Bug may affect HIPAA compliance
- [ ] Bug may affect GDPR/AVG compliance
- [ ] Bug may affect medical device regulations
- [ ] No compliance impact

**Additional Context**
Add any other context about the problem here.

---

## ✨ Feature Request Template

**Summary**
A clear and concise description of the feature you'd like to see implemented.

**Medical Use Case**
Describe the specific healthcare scenario where this feature would be beneficial:
- Medical specialty: [e.g., Cardiology, General Practice]
- Workflow integration: [e.g., During patient consultation, Post-visit documentation]
- Clinical benefit: [e.g., Improved diagnosis accuracy, Reduced documentation time]

**Problem Statement**
What problem does this feature solve? What is the current pain point?

**Proposed Solution**
Describe your preferred solution in detail:
- User interface changes
- Backend functionality
- Integration requirements
- Performance considerations

**Alternative Solutions**
Describe any alternative solutions or features you've considered.

**Healthcare Compliance Requirements**
- [ ] Must comply with HIPAA regulations
- [ ] Must comply with GDPR/AVG regulations
- [ ] Must maintain audit trail
- [ ] Must support data encryption
- [ ] Must support user access controls
- [ ] No specific compliance requirements

**Technical Requirements**
- [ ] API changes required
- [ ] Database schema changes required
- [ ] UI/UX changes required
- [ ] Third-party integrations required
- [ ] Performance optimization required

**Priority Level**
- [ ] Critical (System broken/security issue)
- [ ] High (Major feature gap affecting core workflows)
- [ ] Medium (Quality of life improvement)
- [ ] Low (Nice to have enhancement)

**Additional Context**
Add any other context, mockups, or examples about the feature request here.

---

## 🔒 Security Vulnerability Template

**⚠️ IMPORTANT: Do not include sensitive details in public issues**

For security vulnerabilities, please follow our responsible disclosure process:

1. **Email**: security@hysio.com (if available) or use private communication
2. **Include**: Brief description without sensitive details
3. **Provide**: Your contact information for follow-up
4. **Timeline**: We aim to respond within 24 hours

**Public Information (Safe to Share)**
- General area affected: [e.g., Authentication, Data validation]
- Severity estimate: [Critical/High/Medium/Low]
- Affected versions: [e.g., v2.0.0 - v2.1.0]

**Healthcare Data Impact**
- [ ] Patient data potentially exposed
- [ ] Medical records potentially affected
- [ ] Authentication/authorization bypass
- [ ] Data integrity concerns
- [ ] Audit trail compromise

**Reporter Information**
- Security researcher: [Yes/No]
- Coordinated disclosure preferred: [Yes/No]
- Public credit desired: [Yes/No]

---

## 📚 Documentation Request Template

**Documentation Type**
- [ ] API documentation
- [ ] User guide/tutorial
- [ ] Developer documentation
- [ ] Compliance documentation
- [ ] Architecture documentation
- [ ] Other: ___________

**Current State**
Describe what documentation currently exists (if any) and what's missing.

**Target Audience**
- [ ] Healthcare professionals
- [ ] System administrators
- [ ] Software developers
- [ ] Compliance officers
- [ ] End users
- [ ] Other: ___________

**Scope and Detail Level**
- [ ] High-level overview
- [ ] Step-by-step guide
- [ ] Technical reference
- [ ] Best practices guide
- [ ] Troubleshooting guide

**Healthcare Context**
If applicable, describe the medical workflow or compliance requirement this documentation supports.

**Priority**
- [ ] Blocking current work
- [ ] Needed for upcoming release
- [ ] Quality improvement
- [ ] Nice to have

---

## 🔧 Technical Debt/Refactoring

**Component/Area Affected**
Specify which part of the codebase needs attention.

**Current Issues**
- [ ] Performance problems
- [ ] Code maintainability
- [ ] Security concerns
- [ ] Technical obsolescence
- [ ] Compliance gaps
- [ ] Other: ___________

**Impact Assessment**
- [ ] Affects development velocity
- [ ] Affects system reliability
- [ ] Affects healthcare data security
- [ ] Affects compliance requirements
- [ ] Affects user experience

**Proposed Approach**
Describe the refactoring or improvement approach:
- Scope of changes
- Breaking changes (if any)
- Migration strategy
- Testing approach
- Timeline estimate

**Healthcare Considerations**
- [ ] Must maintain data integrity during refactoring
- [ ] Must preserve audit trails
- [ ] Must maintain compliance during transition
- [ ] Must ensure zero downtime for critical healthcare workflows

**Dependencies**
List any dependencies on other components, teams, or external factors.

---

## Issue Triage Guidelines

**Labels Applied Automatically:**
- `bug` - Bug reports
- `enhancement` - Feature requests
- `security` - Security vulnerabilities
- `documentation` - Documentation requests
- `technical-debt` - Technical debt/refactoring

**Priority Labels:**
- `priority-critical` - System broken, security issue, or compliance violation
- `priority-high` - Major feature gap affecting core workflows
- `priority-medium` - Quality of life improvements
- `priority-low` - Nice to have enhancements

**Healthcare Labels:**
- `healthcare-compliance` - HIPAA, GDPR, or other compliance related
- `medical-workflow` - Affects clinical workflows
- `patient-data` - Involves patient data processing
- `audit-trail` - Affects audit and logging requirements

**Component Labels:**
- `scribe` - Medical transcription functionality
- `diagnosecode` - AI diagnosis code generation
- `smartmail` - Email automation
- `assistant` - AI assistant features
- `api` - Backend API
- `ui` - User interface
- `infrastructure` - DevOps and deployment