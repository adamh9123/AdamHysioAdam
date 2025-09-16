# Welkom bij Hysio! 🚀 Onboarding Gids voor Ontwikkelaars

Deze gids helpt je om binnen **60 minuten** volledig operationeel te zijn met de Hysio codebase. Je gaat van "ik heb net toegang gekregen" naar "ik kan features bouwen en pull requests maken". Laten we beginnen!

---

## 1. Wat is Hysio? Een 5-Minuten Context

**Hysio** is een AI-gestuurde fysiotherapie platform dat bestaat uit 4 hoofdmodules:

- **🩺 Hysio Scribe**: AI-ondersteunde SOEP-documentatie met spraakherkenning
- **🤖 AI Assistant**: Intelligente fysiotherapie-assistent voor behandeladvies
- **📧 SmartMail**: Geautomatiseerde patiënt- en huisartscommunicatie
- **🔍 Diagnosecode**: Slimme herkenning en suggestie van ICD-10/ICPC-2 codes

**Tech Stack Snapshotë**
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, PostgreSQL, Redis
- **AI Services**: OpenAI GPT-4o, Groq Whisper
- **Infrastructure**: Docker, Nginx, Elasticsearch, Prometheus/Grafana

**Architectuur Filosofie:**
Hysio gebruikt een **Feature-Sliced Design** aanpak waarbij de code georganiseerd is rondom business features in plaats van technische lagen. Je vindt logische scheiding tussen `lib` (business logica), `components` (UI componenten), en `app` (routing/pages).

---

## 2. Lokale Setup: Van Zero naar Running

### Vereisten

Zorg ervoor dat je de volgende software geïnstalleerd hebt op je machine:

| Software | Versie | Download Link | Verificatie Command |
|----------|--------|---------------|-------------------|
| **Node.js** | 18.x of hoger | [nodejs.org](https://nodejs.org) | `node --version` |
| **npm** | 10.x of hoger | (komt met Node.js) | `npm --version` |
| **Docker** | 20.x of hoger | [docker.com](https://docker.com) | `docker --version` |
| **Docker Compose** | 2.x of hoger | (komt met Docker Desktop) | `docker-compose --version` |
| **Git** | 2.x of hoger | [git-scm.com](https://git-scm.com) | `git --version` |

### Stap-voor-stap Installatie

**1. Clone de repository:**
```bash
git clone https://github.com/your-org/hysio.git
cd hysio
```

**2. Navigeer naar de applicatie directory:**
```bash
cd hysio-medical-scribe
```

**3. Installeer dependencies:**
```bash
npm install
```

**4. Configureer omgevingsvariabelen:**

Kopieer het environment template:
```bash
cp .env.example .env.local
```

**Bewerk `.env.local` en vul de volgende essentiële variabelen in:**

| Variabele | Omschrijving | Waar krijg je dit | Voorbeeld |
|-----------|--------------|-------------------|-----------|
| `OPENAI_API_KEY` | OpenAI API sleutel voor GPT-4 | [OpenAI Platform](https://platform.openai.com) | `sk-...` |
| `GROQ_API_KEY` | Groq API sleutel voor Whisper | [Groq Console](https://console.groq.com) | `gsk_...` |
| `NEXTAUTH_SECRET` | NextAuth.js encryptie sleutel | Genereer zelf (min. 32 chars) | `your-super-secret-32-char-key-here` |
| `ENCRYPTION_KEY` | PHI data encryptie sleutel | Genereer zelf (exact 32 chars) | `your-32-character-encryption-key` |

**🔐 API Keys verkrijgen:**
- **OpenAI**: Registreer op [platform.openai.com](https://platform.openai.com), ga naar API Keys, maak een nieuwe key
- **Groq**: Registreer op [console.groq.com](https://console.groq.com), ga naar API Keys, maak een nieuwe key

**5. Start de volledige ontwikkelomgeving:**

Ga terug naar de root directory:
```bash
cd ..
```

Start alle services met Docker:
```bash
docker-compose up -d
```

**6. Verificatie - Controleer of alles werkt:**

Wacht ~60 seconden voor alle services opgestart zijn, open dan je browser:

| Service | URL | Wat je zou moeten zien |
|---------|-----|------------------------|
| **Hysio App** | http://localhost:3000 | Hysio homepage met navigatie |
| **pgAdmin** | http://localhost:5050 | Database management interface |
| **MailHog** | http://localhost:8025 | Email testing interface |
| **Grafana** | http://localhost:3001 | Monitoring dashboard |
| **Redis Commander** | http://localhost:8081 | Redis data browser |

**✅ Success Check:**
- [ ] Hysio homepage laadt zonder errors
- [ ] Je kunt naar `/dashboard` navigeren
- [ ] Console toont geen kritieke errors

---

## 3. De Codebase Navigeren: Waar vind je wat?

### 📁 Hoofdstructuur `/hysio-medical-scribe/src`

```
src/
├── app/                    # 🚪 Next.js App Router - alle pagina's en routing
│   ├── (marketing)/        # Marketing pagina's (homepage, pricing, etc.)
│   ├── dashboard/          # Dashboard overzicht
│   ├── scribe/            # Medical Scribe functionaliteit
│   ├── assistant/         # AI Assistant interface
│   ├── diagnosecode/      # Diagnosis code finder
│   └── api/               # Backend API routes
├── components/             # 🧩 React componenten georganiseerd per feature
│   ├── ui/                # "Domme" UI componenten (Button, Card, Input)
│   ├── scribe/            # Scribe-specifieke componenten
│   ├── assistant/         # Assistant-specifieke componenten
│   ├── smartmail/         # SmartMail componenten
│   └── diagnosecode/      # Diagnosecode componenten
├── lib/                    # 🧠 Business logica en utilities
│   ├── types/             # TypeScript type definities
│   ├── api/               # API client functies
│   ├── utils/             # Helper functies
│   └── hooks/             # Shared React hooks (deprecated - zie /hooks)
├── hooks/                  # 🪝 Custom React hooks
├── context/               # 🌐 React Context providers
└── styles/                # 🎨 Globale CSS en Tailwind configuratie
```

### 🎯 Waar te beginnen per taak type:

| Als je wilt... | Begin hier... |
|----------------|---------------|
| **Nieuwe UI component maken** | `src/components/ui/` |
| **Nieuwe pagina toevoegen** | `src/app/` |
| **API endpoint bouwen** | `src/app/api/` |
| **Business logica wijzigen** | `src/lib/` |
| **Styling aanpassen** | `src/styles/globals.css` |
| **Type definities toevoegen** | `src/lib/types/` |

### 🏗️ Architectuur Patronen

**Component Hiërarchie:**
- **UI Components** (`/ui`): Herbruikbaar, geen business logica
- **Feature Components** (`/scribe`, `/assistant`): Business logica, gebruikt UI components
- **Page Components** (`/app`): Orchestratie, gebruikt feature components

**State Management:**
- **Local State**: React useState/useReducer
- **Shared State**: React Context (zie `/context`)
- **Server State**: API calls met built-in caching

**Data Flow:**
```
Page Component → Feature Component → UI Component
     ↓                    ↓               ↓
   API Call          Business Logic   Presentation
```

---

## 4. Jouw Eerste Taak: Een Vliegende Start ✈️

De beste manier om te leren is door te doen. Hier is een veilige, eenvoudige eerste taak om je wegwijs te maken in de codebase:

### 🎯 **Opdracht: Voeg een "Info" button variant toe**

**Wat ga je doen:**
Je gaat een nieuwe button stijl toevoegen en deze gebruiken in de dashboard.

**Stappen:**

**1. Vind de Button component:**
```bash
# Open dit bestand in je editor
code src/components/ui/button.tsx
```

**2. Voeg een nieuwe variant toe:**

Voeg in de `buttonVariants` cva configuratie deze nieuwe variant toe:
```typescript
// Voeg toe aan de variants object, rond regel 12
info: 'bg-blue-100 border border-blue-300 text-blue-800 hover:bg-blue-200 hover:border-blue-400',
```

**3. Test je nieuwe button:**

Open de dashboard pagina:
```bash
code src/app/dashboard/page.tsx
```

Voeg ergens in de JSX een testknop toe (bijvoorbeeld rond regel 200):
```tsx
<Button variant="info" size="sm">
  ℹ️ Dit is mijn nieuwe info button!
</Button>
```

**4. Controleer je werk:**
```bash
# Start de dev server als hij nog niet draait
npm run dev

# Open http://localhost:3000/dashboard
# Je zou je nieuwe blauwe button moeten zien
```

**5. Voer tests uit:**
```bash
# Controleer of je niets hebt gebroken
npm run test

# Check code formatting
npm run lint
```

**6. Maak een Pull Request:**
```bash
# Maak een nieuwe branch
git checkout -b feature/add-info-button-variant

# Stage je wijzigingen
git add .

# Commit met een duidelijke message
git commit -m "feat: add info variant to Button component

- Added new 'info' variant with blue styling
- Added test button to dashboard for demonstration
- Maintains existing Button API compatibility"

# Push naar je fork/branch
git push origin feature/add-info-button-variant
```

**🎉 Gefeliciteerd!** Je hebt zojuist je eerste Hysio feature geïmplementeerd en een PR gemaakt!

---

## 5. Belangrijke Scripts & Commands

### 📜 NPM Scripts (in `/hysio-medical-scribe`)

| Command | Functie | Wanneer gebruiken |
|---------|---------|-------------------|
| `npm run dev` | Start ontwikkelserver op :3000 | Dagelijkse development |
| `npm run build` | Bouwt productie-optimized build | Voor deployment testing |
| `npm run start` | Start productie server | Na `npm run build` |
| `npm run lint` | ESLint code checking | Voor PR's, debugging |
| `npm test` | Voert Jest tests uit | Voor elke wijziging |
| `npm run test:watch` | Tests in watch mode | Tijdens test development |

### 🐳 Docker Commands (vanuit root directory)

| Command | Functie | Wanneer gebruiken |
|---------|---------|-------------------|
| `docker-compose up -d` | Start alle services | Dagelijkse setup |
| `docker-compose down` | Stop alle services | Einde werkdag |
| `docker-compose logs -f hysio-medical-scribe` | Bekijk app logs | Debugging |
| `docker-compose restart hysio-medical-scribe` | Herstart alleen de app | Na code wijzigingen |
| `docker-compose exec postgres psql -U hysio_user -d hysio_dev` | Database console | Database debugging |

### 🔧 Handige Development Commands

```bash
# Database reset (als je data corrupt hebt)
docker-compose down -v
docker-compose up -d

# Bekijk alle draaiende containers
docker-compose ps

# Check application logs
docker-compose logs -f

# Complete cleanup (nuclear option)
docker system prune -a
```

---

## 6. Development Workflow & Best Practices

### 🌊 Git Flow

**Branch Naming:**
```bash
feature/short-description      # Nieuwe features
bugfix/issue-description      # Bug fixes
hotfix/critical-fix          # Production fixes
chore/maintenance-task       # Refactoring, deps updates
```

**Commit Messages:**
```bash
feat: add user authentication system
fix: resolve dashboard loading issue
docs: update API documentation
style: format code with prettier
refactor: extract utility functions
test: add unit tests for Button component
```

### 🧪 Testing Strategy

**Before Every PR:**
```bash
# Volledige check sequence
npm run lint          # Code style
npm run test          # Unit tests
npm run build         # Production build test
```

**Writing Tests:**
- Unit tests voor utility functions in `/lib`
- Component tests voor UI components
- Integration tests voor API routes

### 🐛 Debugging Tips

**Common Issues & Solutions:**

| Probleem | Oplossing |
|----------|-----------|
| **Port 3000 bezet** | `lsof -ti:3000 \| xargs kill -9` |
| **Docker niet responsive** | `docker-compose restart` |
| **Database connectie fout** | Check of PostgreSQL container draait |
| **API key errors** | Verifieer `.env.local` configuratie |
| **Build errors** | `rm -rf .next && npm run build` |

**Handige Debug Commands:**
```bash
# Check environment variables
npm run dev -- --debug

# Inspect database
docker-compose exec postgres psql -U hysio_user -d hysio_dev -c "\dt"

# Redis data inspection
docker-compose exec redis redis-cli
```

---

## 7. Resources & Hulp

### 📚 Documentatie

| Document | Wanneer lezen |
|----------|---------------|
| `ARCHITECTURE.md` | Voor system design begrip |
| `API_DOCUMENTATION.md` | Voor backend integration |
| `FRONTEND_PERFECTION_AUDIT.md` | Voor UI/UX requirements |
| `DEVELOPMENT.md` | Voor geavanceerde development setup |

### 🆘 Hulp Krijgen

**Debugging Checklist:**
1. [ ] Check console voor JavaScript errors
2. [ ] Verifieer environment variables in `.env.local`
3. [ ] Controleer of alle Docker containers draaien
4. [ ] Bekijk application logs met `docker-compose logs`
5. [ ] Test API endpoints handmatig

**Team Contact:**
- **Tech Lead**: Voor architectuur vragen
- **Product Owner**: Voor feature requirements
- **DevOps**: Voor infrastructure problemen

### 🎯 Volgende Stappen

Na je eerste taak, hier zijn goede "volgende stappen" om je Hysio kennis uit te breiden:

1. **Week 1**: Bestudeer een van de hoofdmodules (Scribe, Assistant, SmartMail, Diagnosecode)
2. **Week 2**: Bouw een kleine feature improvement in je gekozen module
3. **Week 3**: Werk aan een cross-module integration feature
4. **Week 4**: Contribute aan de documentatie of testing coverage

---

## 🚀 Success! Je bent nu klaar om te bouwen

Je hebt nu:
- ✅ Een werkende lokale development environment
- ✅ Begrip van de codebase architectuur
- ✅ Je eerste feature geïmplementeerd
- ✅ Een complete development workflow doorlopen

**Welkom bij het Hysio team!** 🎉

De volgende keer dat je begint met development, hoef je alleen maar te doen:
```bash
cd hysio && docker-compose up -d && cd hysio-medical-scribe && npm run dev
```

En je bent klaar om te bouwen aan de toekomst van AI-gestuurde fysiotherapie! 💪

---

*Laatste update: $(date). Voor vragen of verbeteringen aan deze gids, maak een issue aan of vraag het aan je tech lead.*