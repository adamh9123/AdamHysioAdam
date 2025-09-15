# 🩺 Hysio V2 - Intelligente Fysiotherapie Platform

[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![AI Powered](https://img.shields.io/badge/AI-GPT--4o%20%7C%20Groq-green.svg)](https://openai.com/)

**Revolutioneer uw fysiotherapie praktijk met AI-gedreven intelligentie**

Hysio V2 is een geavanceerd, AI-aangedreven platform dat speciaal ontwikkeld is voor Nederlandse fysiotherapeuten. Het platform automatiseert medische documentatie, biedt intelligente diagnose-ondersteuning en stroomlijnt de gehele patiëntworkflow - van intake tot follow-up consultaties.

---

## 📋 Inhoudsopgave

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📜 Available Scripts](#-available-scripts)
- [📁 Projectstructuur](#-projectstructuur)
- [🔧 Environment Variables](#-environment-variables)
- [📄 Licentie](#-licentie)

---

## ✨ Features

### 🚀 **Hysio Scribe - Intelligente Medische Workflows**
- **Nieuwe Intake Workflow**: Volledig begeleide 3-fasen proces (Anamnese, Onderzoek, Klinische Conclusie)
- **Gestroomlijnde Follow-up**: Efficiënte vervolgconsult documentatie volgens SOEP-methodiek
- **Real-time Audio Transcriptie**: Geavanceerde spraak-naar-tekst met Groq Whisper Large v3 Turbo
- **PHSB & SOEP Structurering**: Automatische omzetting naar professionele klinische formaten

### 🧠 **Hysio Diagnosecode - DCSPH Intelligentie**
- **Interactieve Patroonherkenning**: AI-gedreven diagnose code suggesties
- **Nederlandse Klinische Classificatie**: Volledige DCSPH integratie voor fysiotherapie
- **Confidence Scoring**: Machine learning-gebaseerde betrouwbaarheidsscores
- **Klinische Rationale**: Gedetailleerde uitleg voor code suggesties

### 📧 **SmartMail - Professionele Communicatie**
- **Healthcare-Specifieke Templates**: Medisch geoptimaliseerde communicatiesjablonen
- **Privacy-First Design**: AVG-conforme e-mail generatie met anonimisering
- **Contextafhankelijke Suggesties**: AI-gedreven aanbevelingen op basis van workflow fase
- **Meertalige Ondersteuning**: Nederlands en Engels

### 🤖 **Hysio Assistant - AI Co-piloot**
- **Evidence-Based Responses**: AI-assistent getraind op fysiotherapie best practices
- **Conversatie Management**: Persistente chatgeschiedenis en context
- **Klinische Veiligheidsgrenzen**: Ingebouwde waarborgen en red flag detectie
- **Nederlandse Healthcare Context**: Gespecialiseerd voor Nederlandse fysiotherapie praktijk

### 🔧 **Intelligente Sessievoorbereiding**
- **Anatomische Regio Detectie**: Automatische identificatie van lichaamsregio's uit klachten
- **Dynamische Vraag Generatie**: Contextbewuste voorbereidingsvragen
- **Assessment Test Aanbevelingen**: Relevante klinische tests op basis van presenterende klacht
- **Document Context Integratie**: Verwerking van geüploade patiëntdocumenten

### 🔒 **Enterprise-Grade Security & Compliance**
- **AVG/GDPR Conform**: Volledige compliance met Europese privacy wetgeving
- **Veilige Data Verwerking**: End-to-end encryptie voor alle patiëntgegevens
- **Audit Trails**: Uitgebreide logging voor compliance tracking

---

## 🛠️ Tech Stack

### **Core Framework & Language**
- **Next.js 15.5.2** - Modern React framework met App Router
- **React 19.1.0** - Latest React met concurrent features
- **TypeScript 5** - Strict type checking voor code kwaliteit

### **AI & Machine Learning**
- **OpenAI 5.16.0** - GPT-4o voor content generatie en analyse
- **Groq SDK 0.30.0** - Whisper Large v3 Turbo voor audio transcriptie

### **UI & Styling**
- **Tailwind CSS 4** - Utility-first styling met custom Hysio theme
- **Radix UI** - Accessible component primitives
- **Lucide React 0.542.0** - Modern icon library
- **Class Variance Authority** - Component variant management

### **Document Processing**
- **PDF.js 5.4.149** - PDF parsing en rendering
- **Mammoth 1.10.0** - Word document verwerking
- **docx 9.5.1** - Word document generatie
- **jsPDF 3.0.2** - PDF generatie

### **Development & Quality**
- **Jest 30.1.1** - Unit testing met React Testing Library
- **ESLint 9** - Code linting met Next.js optimalisaties
- **TypeScript** strict configuratie voor maximale type veiligheid

---

## 🚀 Getting Started

### **Vereisten**
- **Node.js** 18.0 of hoger
- **npm** of **yarn** package manager
- **OpenAI API Key** voor AI functionaliteit
- **Groq API Key** voor audio transcriptie

### **Installatie**

1. **Clone de repository:**
   ```bash
   git clone https://github.com/adamh9123/AdamHysioAdam.git
   cd AdamHysioAdam
   ```

2. **Navigeer naar de hysio-medical-scribe directory:**
   ```bash
   cd hysio-medical-scribe
   ```

3. **Installeer dependencies:**
   ```bash
   npm install
   ```

4. **Environment Setup:**

   Maak een `.env.local` bestand in de root directory en voeg de volgende variabelen toe:
   ```env
   # AI Integration
   OPENAI_API_KEY=your_openai_api_key_here
   GROQ_API_KEY=your_groq_api_key_here

   # Optional: Additional Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Start de development server:**
   ```bash
   npm run dev
   ```

6. **Open in browser:**

   Navigeer naar [http://localhost:3000](http://localhost:3000) om de applicatie te gebruiken.

---

## 📜 Available Scripts

Alle beschikbare scripts voor development, testing en deployment:

```bash
# Development
npm run dev          # Start development server
npm run build        # Build productie versie
npm run start        # Start productie server
npm run lint         # Run ESLint voor code kwaliteit

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests met coverage report

# Type Checking
npm run type-check   # Run TypeScript compiler check
```

---

## 📁 Projectstructuur

```
hysio-medical-scribe/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # Backend API endpoints
│   │   │   ├── assistant/     # AI Assistant API
│   │   │   ├── diagnosecode/  # DCSPH diagnose codes
│   │   │   ├── smartmail/     # Email generatie
│   │   │   └── transcribe/    # Audio transcriptie
│   │   ├── dashboard/         # Hoofddashboard
│   │   ├── scribe/           # Medische workflows
│   │   ├── diagnosecode/     # Diagnose code finder
│   │   └── smartmail/        # Email compositie
│   ├── components/            # React componenten
│   │   ├── scribe/           # Medische workflow UI
│   │   ├── diagnosecode/     # Diagnose code componenten
│   │   ├── assistant/        # AI Assistant interface
│   │   ├── smartmail/        # Email UI componenten
│   │   └── ui/               # Herbruikbare UI componenten
│   ├── lib/                  # Core business logic
│   │   ├── api/              # API utilities
│   │   ├── diagnosecode/     # DCSPH systeem logic
│   │   ├── preparation/      # Intelligente voorbereiding
│   │   ├── smartmail/        # Email generatie logic
│   │   └── utils/            # Utility functies
│   ├── hooks/                # Custom React hooks
│   ├── context/              # React context providers
│   └── styles/               # Globale styling
├── public/                   # Statische bestanden
├── tests/                    # Test bestanden
└── docs/                     # Project documentatie
```

---

## 🔧 Environment Variables

### **Vereiste API Keys**

| Variable | Beschrijving | Waar te verkrijgen |
|----------|-------------|-------------------|
| `OPENAI_API_KEY` | OpenAI API key voor GPT-4o integratie | [OpenAI Platform](https://platform.openai.com/) |
| `GROQ_API_KEY` | Groq API key voor Whisper transcriptie | [Groq Console](https://console.groq.com/) |

### **Optionele Configuratie**

| Variable | Beschrijving | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Base URL van de applicatie | `http://localhost:3000` |

---

## 🤝 Bijdragen

Dit is een proprietary project. Voor vragen over bijdragen, neem contact op met het development team.

---

## 📞 Support

Voor technische ondersteuning of vragen over het platform:

- **Email**: [Voeg contact email toe]
- **Documentation**: Zie de `/docs` directory voor uitgebreide documentatie
- **Issues**: Gebruik GitHub Issues voor bug reports en feature requests

---

## 📄 Licentie

© 2024 Hysio. Alle rechten voorbehouden.

Dit project is proprietary software. Ongeautoriseerde distributie, modificatie of gebruik is niet toegestaan zonder expliciete schriftelijke toestemming.

---

**Ontwikkeld met ❤️ voor Nederlandse fysiotherapeuten**

*Hysio V2 - Waar AI en gezondheidszorg samenkomen voor betere patiëntenzorg*