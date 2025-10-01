# Hysio V2 API Documentation

## Overview

The Hysio V2 REST API provides secure, HIPAA-compliant endpoints for medical transcription, diagnosis code analysis, intelligent email generation, and healthcare assistant functionality. All endpoints require proper authentication and implement healthcare data protection standards.

**Base URL**: `https://api.hysio.com` (Production) | `http://localhost:3000/api` (Development)
**API Version**: 2.0
**Authentication**: Bearer Token (JWT) or API Key
**Content Type**: `application/json` (unless specified otherwise)

## Table of Contents

- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Medical Transcription](#medical-transcription)
- [Diagnosis Code Analysis](#diagnosis-code-analysis)
- [Smart Email Generation](#smart-email-generation)
- [Healthcare Assistant](#healthcare-assistant)
- [Document Processing](#document-processing)
- [System Utilities](#system-utilities)
- [Webhooks](#webhooks)
- [SDK Examples](#sdk-examples)

## Authentication

### Overview
All API endpoints require authentication using either JWT tokens or API keys. Healthcare data access requires additional authorization based on provider credentials and patient consent.

### Authentication Methods

#### 1. JWT Bearer Token (Recommended)
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. API Key
```http
X-API-Key: hysio_sk_live_abc123...
Content-Type: application/json
```

### Getting Started
1. Register for a Hysio developer account
2. Complete HIPAA compliance verification
3. Generate API keys in the developer dashboard
4. Implement proper secret management

### Authentication Endpoints

#### POST `/auth/login`
Authenticate healthcare provider and receive JWT token.

**Request:**
```json
{
  "email": "provider@clinic.com",
  "password": "secure_password",
  "mfa_code": "123456",
  "provider_id": "NPI-1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "provider": {
      "id": "provider_abc123",
      "name": "Dr. Jane Smith",
      "npi": "1234567890",
      "specialties": ["Physical Therapy", "Sports Medicine"]
    }
  }
}
```

#### POST `/auth/refresh`
Refresh expired JWT token.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "audio_file",
      "issue": "File size exceeds 25MB limit"
    },
    "request_id": "req_abc123",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `413` - Payload Too Large (file size limits)
- `422` - Unprocessable Entity (business logic errors)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `503` - Service Unavailable (maintenance mode)

### Healthcare-Specific Error Codes
- `HIPAA_COMPLIANCE_ERROR` - Data access violates HIPAA requirements
- `PATIENT_CONSENT_REQUIRED` - Patient consent needed for data access
- `PROVIDER_VERIFICATION_FAILED` - Healthcare provider credentials invalid
- `PHI_ENCRYPTION_ERROR` - Protected health information encryption failed

## Rate Limiting

### Limits by Endpoint Category
- **Transcription**: 100 requests per hour per provider
- **Diagnosis Analysis**: 500 requests per hour per provider
- **Email Generation**: 200 requests per hour per provider
- **Assistant Queries**: 1000 requests per hour per provider

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1642697600
X-RateLimit-Retry-After: 3600
```

## Medical Transcription

### POST `/transcribe`
Transcribe audio recordings to text using AI-powered medical speech recognition.

**Supported Formats**: MP3, WAV, M4A, MP4, WEBM
**Max File Size**: 25MB (automatic splitting for larger files)
**Languages**: Dutch (nl), English (en), German (de), French (fr)

**Request:**
```http
POST /api/transcribe
Content-Type: multipart/form-data
Authorization: Bearer {token}

audio: [File] (required) - Audio file to transcribe
language: string (optional, default: "nl") - Language code
prompt: string (optional) - Medical context prompt
temperature: number (optional, default: 0.0) - AI creativity (0.0-1.0)
provider_id: string (required) - Healthcare provider identifier
patient_id: string (optional) - Patient identifier for audit trail
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transcription": "Patient presents with lower back pain radiating to the left leg. Pain started 3 days ago after lifting heavy objects. No neurological deficits observed.",
    "confidence": 0.95,
    "duration": 45.2,
    "language": "nl",
    "segments": [
      {
        "start": 0.0,
        "end": 15.5,
        "text": "Patient presents with lower back pain radiating to the left leg.",
        "confidence": 0.98
      }
    ],
    "metadata": {
      "model": "whisper-large-v3-turbo",
      "processing_time": 2.3,
      "file_size": 5242880,
      "detected_language": "nl",
      "medical_terms_detected": ["lower back pain", "radiating", "neurological deficits"]
    }
  },
  "audit": {
    "request_id": "transcribe_abc123",
    "provider_id": "provider_xyz789",
    "timestamp": "2025-01-15T10:30:00Z",
    "hipaa_compliant": true
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": {
    "code": "UNSUPPORTED_FORMAT",
    "message": "Audio format not supported",
    "supported_formats": ["mp3", "wav", "m4a", "mp4", "webm"]
  }
}
```

### Audio Processing Features
- **Automatic Splitting**: Files >25MB are automatically split into segments
- **Noise Reduction**: Advanced noise filtering for clinical environments
- **Medical Terminology**: Optimized for medical and healthcare vocabulary
- **Multi-language Support**: Accurate transcription in multiple languages
- **HIPAA Compliance**: All audio files are encrypted and securely processed

## Diagnosis Code Analysis

### POST `/diagnosecode/analyze`
Analyze clinical descriptions and suggest appropriate diagnosis codes using AI-powered medical coding.

**Request:**
```json
{
  "clinicalDescription": "Patient presents with acute lower back pain radiating to left leg, positive straight leg raise test, decreased sensation in L5 dermatome",
  "includeMetadata": true,
  "maxSuggestions": 5,
  "codeSystem": "ICD-10",
  "specialty": "physical_therapy",
  "provider_id": "provider_xyz789",
  "patient_demographics": {
    "age": 45,
    "gender": "M",
    "medical_history": ["previous_back_surgery"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "code": "M54.16",
        "name": "Radiculopathy, lumbar region",
        "rationale": "Clinical presentation with radiating pain and positive neurological signs suggests lumbar radiculopathy",
        "confidence": 0.92,
        "category": "Musculoskeletal disorders",
        "clinicalNotes": "Consider MRI if conservative treatment fails",
        "billable": true,
        "gender_specific": false,
        "age_restrictions": null
      },
      {
        "code": "M51.16",
        "name": "Intervertebral disc disorders with radiculopathy, lumbar region",
        "rationale": "Combination of back pain and radicular symptoms indicates possible disc involvement",
        "confidence": 0.85,
        "category": "Musculoskeletal disorders",
        "clinicalNotes": "Document specific nerve root involvement",
        "billable": true,
        "gender_specific": false,
        "age_restrictions": null
      }
    ],
    "analysis": {
      "primary_symptoms": ["back pain", "radicular pain", "neurological deficit"],
      "anatomical_regions": ["lumbar spine", "L5 nerve root"],
      "diagnostic_tests": ["straight leg raise"],
      "differential_diagnoses": ["lumbar radiculopathy", "disc herniation", "spinal stenosis"]
    },
    "recommendations": {
      "additional_documentation": [
        "Specify exact nerve root involvement",
        "Document pain intensity scale",
        "Include relevant imaging findings"
      ],
      "follow_up_codes": ["M25.511", "M79.3"],
      "exclusion_codes": ["M48.06", "M53.3"]
    }
  },
  "metadata": {
    "processing_time": 1.2,
    "model_version": "dcsph-v2.1",
    "confidence_threshold": 0.7,
    "total_codes_analyzed": 15847
  }
}
```

### GET `/diagnosecode/find`
Search for specific diagnosis codes by keyword or code.

**Parameters:**
```http
GET /api/diagnosecode/find?query=back+pain&category=musculoskeletal&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "codes": [
      {
        "code": "M54.5",
        "name": "Low back pain",
        "category": "Musculoskeletal and connective tissue diseases",
        "billable": true,
        "description": "Pain in the lower back region"
      }
    ],
    "total": 157,
    "page": 1,
    "limit": 10
  }
}
```

### POST `/diagnosecode/validate`
Validate diagnosis codes for accuracy and billing compliance.

**Request:**
```json
{
  "codes": ["M54.16", "M51.16"],
  "patient_demographics": {
    "age": 45,
    "gender": "M"
  },
  "date_of_service": "2025-01-15"
}
```

## Smart Email Generation

### POST `/smartmail/simple`
Generate professional healthcare emails using AI.

**Request:**
```json
{
  "recipientType": "patient",
  "context": "Follow-up appointment reminder for physical therapy session next Tuesday at 2 PM",
  "tone": "professional",
  "language": "nl",
  "includeDisclaimer": true,
  "provider_info": {
    "name": "Dr. Jane Smith",
    "title": "Fysiotherapeut",
    "clinic": "Hysio Therapy Center"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subject": "Herinnering: Fysiotherapie afspraak aanstaande dinsdag",
    "body": "Beste patiënt,\n\nDit is een vriendelijke herinnering voor uw fysiotherapie afspraak op dinsdag 16 januari om 14:00.\n\nVergeet niet:\n- Draag comfortabele kleding\n- Neem uw vorige behandelrapporten mee\n- Kom 10 minuten voor de afspraak\n\nMocht u vragen hebben of de afspraak moeten verzetten, neem dan contact met ons op.\n\nMet vriendelijke groet,\nDr. Jane Smith\nFysiotherapeut\nHysio Therapy Center\n\n---\nDeze e-mail is automatisch gegenereerd met Hysio SmartMail.",
    "estimated_reading_time": "30 seconds",
    "word_count": 87,
    "formality_score": 0.85
  },
  "metadata": {
    "generation_time": 0.8,
    "model": "gpt-4o",
    "language_detected": "nl",
    "compliance_checked": true
  }
}
```

### POST `/smartmail/generate`
Advanced email generation with templates and customization.

**Request:**
```json
{
  "template": "appointment_confirmation",
  "variables": {
    "patient_name": "John Doe",
    "appointment_date": "2025-01-20",
    "appointment_time": "14:30",
    "treatment_type": "Manual Therapy",
    "provider_name": "Dr. Smith"
  },
  "customizations": {
    "add_preparation_instructions": true,
    "include_contact_info": true,
    "attach_forms": ["intake_form", "consent_form"]
  }
}
```

## Healthcare Assistant

### POST `/assistant`
Interact with the AI healthcare assistant for medical information and guidance.

**Request:**
```json
{
  "message": "What are the contraindications for lumbar spine manipulation?",
  "context": "physical_therapy",
  "provider_level": "licensed_pt",
  "include_references": true,
  "patient_case": {
    "age": 65,
    "conditions": ["osteoporosis", "hypertension"],
    "medications": ["alendronate", "lisinopril"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Based on current clinical guidelines, contraindications for lumbar spine manipulation include:\n\n**Absolute Contraindications:**\n- Suspected fracture or malignancy\n- Cauda equina syndrome\n- Severe osteoporosis (which applies to your patient case)\n- Spinal cord compression\n\n**Relative Contraindications:**\n- Inflammatory arthritis\n- Anticoagulant therapy\n- Neurological deficits\n\n**Specific to your patient:** Given the history of osteoporosis, high-velocity thrust manipulation is contraindicated. Consider gentle mobilization techniques instead.",
    "clinical_level": "evidence_based",
    "confidence": 0.94,
    "references": [
      {
        "title": "Clinical Guidelines for Manual Therapy",
        "source": "IFOMPT 2024",
        "url": "https://ifompt.org/guidelines",
        "evidence_level": "A"
      }
    ],
    "related_topics": ["osteoporosis_management", "alternative_techniques", "patient_safety"],
    "follow_up_questions": [
      "What alternative techniques are safe for osteoporotic patients?",
      "How to assess bone density before treatment?",
      "Medication interactions with manual therapy?"
    ]
  }
}
```

### GET `/assistant/conversations`
Retrieve conversation history with the healthcare assistant.

**Parameters:**
```http
GET /api/assistant/conversations?provider_id=provider_xyz&limit=20&offset=0
```

## Document Processing

### POST `/document/process`
Process and extract information from medical documents.

**Supported Formats**: PDF, DOCX, TXT, Images (JPG, PNG)
**Max File Size**: 10MB per file

**Request:**
```http
POST /api/document/process
Content-Type: multipart/form-data

document: [File] - Document to process
extraction_type: string - "summary", "diagnosis_codes", "medications", "patient_info"
language: string - Document language (default: "auto-detect")
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document_type": "medical_report",
    "extracted_text": "Patient: John Doe, Age: 45...",
    "structured_data": {
      "patient_info": {
        "name": "John Doe",
        "age": 45,
        "dob": "1979-03-15",
        "mrn": "MRN123456"
      },
      "diagnoses": [
        {
          "text": "Lumbar radiculopathy",
          "icd10_code": "M54.16",
          "confidence": 0.89
        }
      ],
      "medications": [
        {
          "name": "Ibuprofen",
          "dosage": "400mg",
          "frequency": "TID",
          "route": "PO"
        }
      ],
      "procedures": [
        {
          "name": "Physical therapy evaluation",
          "cpt_code": "97161",
          "date": "2025-01-15"
        }
      ]
    },
    "summary": "45-year-old male presenting with lumbar radiculopathy. Initiated on anti-inflammatory medication and physical therapy.",
    "confidence_score": 0.92
  }
}
```

## System Utilities

### GET `/health`
System health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "version": "2.0.0",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "ai_services": "healthy",
    "file_storage": "healthy"
  },
  "performance": {
    "response_time": 12,
    "cpu_usage": 45.2,
    "memory_usage": 67.8,
    "active_connections": 156
  }
}
```

### GET `/ready`
Readiness probe for deployment systems.

**Response:**
```json
{
  "ready": true,
  "checks": {
    "database_connection": "pass",
    "ai_model_loaded": "pass",
    "required_services": "pass"
  }
}
```

### POST `/test`
API connectivity test endpoint (development only).

**Response:**
```json
{
  "success": true,
  "message": "Hysio API is working correctly",
  "timestamp": "2025-01-15T10:30:00Z",
  "environment": "development"
}
```

## Webhooks

### Overview
Hysio supports webhooks for real-time notifications of important events.

### Supported Events
- `transcription.completed` - Audio transcription finished
- `diagnosis.analyzed` - Diagnosis code analysis completed
- `document.processed` - Document processing finished
- `patient.consent.updated` - Patient consent status changed
- `provider.verified` - Healthcare provider verification completed

### Webhook Configuration
```json
{
  "url": "https://your-app.com/webhooks/hysio",
  "events": ["transcription.completed", "diagnosis.analyzed"],
  "secret": "webhook_secret_key",
  "active": true
}
```

### Webhook Payload Example
```json
{
  "id": "evt_abc123",
  "type": "transcription.completed",
  "data": {
    "transcription_id": "trans_xyz789",
    "provider_id": "provider_abc123",
    "status": "completed",
    "result": {
      "transcription": "Patient presents with...",
      "confidence": 0.95,
      "duration": 45.2
    }
  },
  "created": "2025-01-15T10:30:00Z"
}
```

### Webhook Security
- All webhooks are signed with HMAC-SHA256
- Verify signatures using the webhook secret
- Implement idempotency handling for duplicate events
- Use HTTPS endpoints only

## SDK Examples

### JavaScript/Node.js
```javascript
const HysioAPI = require('@hysio/api-client');

const client = new HysioAPI({
  apiKey: 'hysio_sk_live_abc123',
  baseURL: 'https://api.hysio.com'
});

// Transcribe audio
const transcription = await client.transcribe({
  audioFile: audioBlob,
  language: 'nl',
  providerId: 'provider_xyz789'
});

// Analyze diagnosis
const analysis = await client.diagnosecode.analyze({
  clinicalDescription: 'Patient with lower back pain',
  providerId: 'provider_xyz789'
});

// Generate email
const email = await client.smartmail.generate({
  recipientType: 'patient',
  context: 'Appointment reminder',
  providerInfo: {
    name: 'Dr. Smith',
    clinic: 'Hysio Center'
  }
});
```

### Python
```python
from hysio import HysioClient

client = HysioClient(
    api_key='hysio_sk_live_abc123',
    base_url='https://api.hysio.com'
)

# Transcribe audio
with open('audio.mp3', 'rb') as audio_file:
    transcription = client.transcribe(
        audio_file=audio_file,
        language='nl',
        provider_id='provider_xyz789'
    )

# Analyze diagnosis
analysis = client.diagnosecode.analyze(
    clinical_description='Patient with lower back pain',
    provider_id='provider_xyz789'
)

# Generate email
email = client.smartmail.generate(
    recipient_type='patient',
    context='Appointment reminder',
    provider_info={
        'name': 'Dr. Smith',
        'clinic': 'Hysio Center'
    }
)
```

### cURL Examples
```bash
# Transcribe audio
curl -X POST https://api.hysio.com/transcribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@recording.mp3" \
  -F "language=nl" \
  -F "provider_id=provider_xyz789"

# Analyze diagnosis
curl -X POST https://api.hysio.com/diagnosecode/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clinicalDescription": "Patient with lower back pain",
    "providerId": "provider_xyz789"
  }'

# Generate email
curl -X POST https://api.hysio.com/smartmail/simple \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientType": "patient",
    "context": "Appointment reminder",
    "language": "nl"
  }'
```

## Best Practices

### Security
1. **Never expose API keys** in client-side code
2. **Use HTTPS** for all API requests
3. **Implement proper authentication** and session management
4. **Validate and sanitize** all input data
5. **Follow HIPAA guidelines** for PHI handling

### Performance
1. **Implement caching** for frequently accessed data
2. **Use compression** for large payloads
3. **Batch requests** when possible
4. **Monitor rate limits** and implement backoff strategies
5. **Optimize file sizes** before uploading

### Error Handling
1. **Always check response status** codes
2. **Implement retry logic** with exponential backoff
3. **Log errors appropriately** (without exposing PHI)
4. **Provide meaningful error messages** to users
5. **Have fallback mechanisms** for critical operations

### Healthcare Compliance
1. **Obtain patient consent** before processing PHI
2. **Implement audit logging** for all PHI access
3. **Use encryption** for data at rest and in transit
4. **Follow minimum necessary principle** for data access
5. **Regularly review access logs** and permissions

## Support

### Documentation
- **API Reference**: https://docs.hysio.com/api
- **Developer Guides**: https://docs.hysio.com/guides
- **SDK Documentation**: https://docs.hysio.com/sdks

### Support Channels
- **Technical Support**: support@hysio.com
- **Security Issues**: security@hysio.com
- **Compliance Questions**: compliance@hysio.com
- **Developer Community**: https://community.hysio.com

### Status Page
- **API Status**: https://status.hysio.com
- **Incident Reports**: https://status.hysio.com/incidents
- **Maintenance Notifications**: Subscribe at https://status.hysio.com

---

**Last Updated**: January 15, 2025
**API Version**: 2.0
**Documentation Version**: 1.0

*This documentation is maintained by the Hysio development team and updated regularly to reflect the latest API changes and best practices.*