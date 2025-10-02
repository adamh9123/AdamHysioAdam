# Setup Guide: Get Hysio Running Locally

## Prerequisites

### Required Software

**Node.js 18+ (LTS)**
```bash
# Check your version
node --version  # Should be v18.x.x or higher

# If you don't have it, download from:
# https://nodejs.org/
```

**npm or pnpm or yarn**
```bash
npm --version   # Should be 9.x.x or higher
```

**Git**
```bash
git --version  # Any recent version works
```

**Code Editor**
- Recommended: **Visual Studio Code** with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense

### Required API Keys

**OpenAI API Key** (Required)
- Sign up at: https://platform.openai.com/
- Create API key: https://platform.openai.com/api-keys
- Cost: ~$0.002-0.005 per workflow (GPT-4o pricing)
- Billing: Ensure you have credits on your account

**Groq API Key** (Required)
- Sign up at: https://console.groq.com/
- Create API key: https://console.groq.com/keys
- Cost: FREE (Whisper Large v3 Turbo is free on Groq)
- Note: Groq has rate limits on free tier (~30 requests/min)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
# Clone the repo (replace with actual repo URL)
git clone https://github.com/adamh9123/AdamHysioAdam.git

# Navigate to the project
cd AdamHysioAdam/hysio
```

**Current Branch**: `hysio-v7.1`
```bash
# Switch to the latest development branch
git checkout hysio-v7.1
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# This will take 2-5 minutes depending on your internet speed
# Expected packages: ~1,200 packages
```

**What gets installed:**
- Next.js 15.5 + React 19.1
- Zustand (state management)
- OpenAI SDK
- Groq SDK
- Radix UI components
- Tailwind CSS
- PDF generation libraries (pdf-lib, docx)
- TypeScript and all type definitions

### 3. Configure Environment Variables

**Create `.env.local` file**:
```bash
# Copy the example file
cp .env.example .env.local
```

**Edit `.env.local`** with your API keys:
```bash
# Open in your editor
code .env.local  # or nano .env.local
```

**Minimum required configuration**:
```env
# ===== REQUIRED =====

# OpenAI API Key (for AI generation)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Groq API Key (for audio transcription)
GROQ_API_KEY=gsk-your-groq-api-key-here

# ===== OPTIONAL (but recommended for dev) =====

# Application Environment
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# Application URLs
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# ===== EVERYTHING ELSE =====
# The .env.example file contains 370+ lines of configuration
# Most of these are for production/future features
# You can safely ignore them for local development
```

**⚠️ CRITICAL: Never commit `.env.local` to Git**
- The `.gitignore` already excludes it
- But double-check: `git status` should NOT show `.env.local`

### 4. Verify Configuration

**Test your setup**:
```bash
# Run Next.js config check
npm run build -- --no-lint

# This will:
# - Check TypeScript compilation
# - Verify all imports resolve
# - Test environment variable access
# - Should complete without errors
```

**Expected output**:
```
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (XX/XX)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    XXX kB          XXX kB
├ ○ /scribe                              XXX kB          XXX kB
└ ... (more routes)

○  (Static)  prerendered as static content
```

### 5. Start Development Server

```bash
# Start the dev server
npm run dev
```

**Expected output**:
```
  ▲ Next.js 15.5.0
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 3.2s
```

**Verify it's working**:
1. Open browser: http://localhost:3000
2. You should see the Hysio landing page
3. Navigate to: http://localhost:3000/scribe
4. You should see the patient info form

### 6. Test a Workflow (Critical Validation)

**Test Intake Stapsgewijs (Recommended First Test)**:

1. **Navigate to Scribe**:
   - Go to http://localhost:3000/scribe
   - Fill in patient info:
     - Voorletters: "J.D."
     - Geboortejaar: "1985"
     - Geslacht: "Male"
     - Hoofdklacht: "Schouderpijn rechts"
   - Click "Ga verder naar workflow"

2. **Choose Workflow**:
   - Select "Intake Stapsgewijs"
   - You'll be redirected to `/scribe/intake-stapsgewijs/anamnese`

3. **Test Audio Transcription**:
   - Option A: Use manual text input (easiest test)
     - Switch to "Handmatige Invoer" tab
     - Type: "Patiënt meldt schouderpijn rechts sinds 2 weken na sportblessure. Pijn vooral bij heffen van arm boven schouderhoogte. NPRS 7/10. Kan niet meer sporten."
   - Option B: Upload audio file (if you have one)
   - Option C: Record live (requires microphone permission)

4. **Process Anamnesis**:
   - Click "Verwerk Anamnese"
   - Wait 10-30 seconds (depending on input size)
   - You should see:
     - Processing indicator
     - Then automatic redirect to `/scribe/intake-stapsgewijs/anamnese-resultaat`
     - HHSB structured output displayed

5. **Verify Success**:
   - Check that HHSB structure is displayed:
     - Hulpvraag: Should contain main complaint
     - Historie: Should contain history details
     - Stoornissen: Should contain impairments
     - Beperkingen: Should contain limitations
   - Copy to clipboard button should work
   - Navigation to next step should be available

**Expected Processing Time**:
- Manual text: 5-10 seconds
- Audio file: 15-30 seconds (transcription + generation)
- Live recording: 20-40 seconds (recording + transcription + generation)

**If something fails**:
- Check browser console (F12) for errors
- Check terminal where `npm run dev` is running for server errors
- See "Troubleshooting" section below

## Project Structure Overview

**After setup, your directory should look like this**:
```
AdamHysioAdam/
├── hysio/                          # Main application
│   ├── src/                        # Source code
│   │   ├── app/                    # Next.js App Router pages & API routes
│   │   ├── components/             # React components
│   │   ├── lib/                    # Business logic, API clients, prompts
│   │   └── types/                  # TypeScript type definitions
│   ├── public/                     # Static assets
│   ├── .env.local                  # Your local environment config (you created this)
│   ├── .env.example                # Template for env variables
│   ├── package.json                # Dependencies
│   ├── next.config.ts              # Next.js configuration
│   ├── tsconfig.json               # TypeScript configuration
│   └── tailwind.config.ts          # Tailwind CSS configuration
├── handover_bernard/               # This documentation
├── CHANGELOG.md                    # Complete change history
└── README.md                       # Project README
```

## Development Workflow

### Running the Application

**Development mode** (hot reload enabled):
```bash
npm run dev
```
- Changes to code auto-refresh browser
- Fast Refresh for React components
- API routes restart on changes

**Production build**:
```bash
npm run build
npm run start
```
- Optimized build for performance
- No hot reload
- Tests production configuration

**Linting**:
```bash
npm run lint
```
- Checks code quality
- Identifies potential issues
- Currently set to ignore during builds (see `next.config.ts`)

**Type Checking**:
```bash
npx tsc --noEmit
```
- Validates TypeScript types
- No output if successful
- Shows type errors if any

### Testing

**Run tests**:
```bash
npm run test           # Run all tests once
npm run test:watch     # Run in watch mode
npm run test:ui        # Run with Vitest UI
npm run test:coverage  # Generate coverage report
```

**Current test coverage**: ~15% (needs improvement)
- Utilities: Good coverage
- Components: Sparse coverage
- API routes: Minimal coverage
- Prompts: No coverage (high priority gap)

## Troubleshooting Common Issues

### Issue: "Cannot find module 'next'"

**Cause**: Dependencies not installed
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "OPENAI_API_KEY is not defined"

**Cause**: Environment variables not loaded
**Solution**:
1. Verify `.env.local` exists in `hysio/` directory
2. Verify it contains `OPENAI_API_KEY=sk-...`
3. Restart dev server: `Ctrl+C` then `npm run dev`
4. Check terminal output - should NOT show "OPENAI_API_KEY is not defined"

### Issue: "403 Forbidden" on Groq transcription

**Cause**: Cloudflare WAF blocking Groq requests
**Solution**: This is a known issue, fixed in codebase
- See `hysio/src/lib/api/groq.ts` for custom fetch implementation
- Ensure `GROQ_API_KEY` is correct
- Check Groq console for API key validity

### Issue: "Transcript truncation" or incomplete SOEP

**Cause**: Fixed in v8.5 (see CHANGELOG line 15-16)
**Solution**: Verify you're on latest code
```bash
git log --oneline -1  # Should show recent commit
git pull origin hysio-v7.1  # Update to latest
```

### Issue: Audio recording doesn't work

**Cause**: Browser permissions
**Solution**:
1. Chrome/Edge: Click microphone icon in address bar → Allow
2. Firefox: Click microphone icon in address bar → Allow
3. Safari: Safari → Preferences → Websites → Microphone → Allow
4. Or use file upload / manual text input instead

### Issue: "Module not found" errors after pulling changes

**Cause**: New dependencies added
**Solution**:
```bash
npm install  # Install any new dependencies
```

### Issue: Port 3000 already in use

**Cause**: Another process using port 3000
**Solution**:
```bash
# Option 1: Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Option 2: Use different port
npm run dev -- -p 3001  # Run on port 3001 instead
```

### Issue: TypeScript errors in IDE but code runs fine

**Cause**: IDE TypeScript version mismatch
**Solution** (VS Code):
1. Open any `.ts` file
2. Press `Ctrl+Shift+P`
3. Type "TypeScript: Select TypeScript Version"
4. Choose "Use Workspace Version"

### Issue: Tailwind classes not applying

**Cause**: Tailwind not watching files or build cache issue
**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

### Issue: API requests failing with CORS errors

**Cause**: CORS configuration issue
**Solution**: Verify `next.config.ts` has CORS headers (should already be configured)
```typescript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        // ... other headers
      ],
    },
  ];
}
```

## Advanced Configuration

### Customizing AI Models

**OpenAI Model** (default: GPT-4o):
```env
# In .env.local
OPENAI_MODEL=gpt-4o  # or gpt-4-turbo, gpt-3.5-turbo
```

**Groq Model** (default: Whisper Large v3 Turbo):
```env
# In .env.local
GROQ_MODEL=whisper-large-v3-turbo  # or whisper-large-v3
```

**AI Parameters**:
- Configured in `hysio/src/lib/api/openai.ts`
- Temperature: 0.7 (clinical content generation)
- Max tokens: 3500-4000 (varies by workflow)
- Top P: 0.9

### Enabling Experimental Features

**Feature flags** (in `.env.local`):
```env
FEATURE_VOICE_COMMANDS=true            # Voice commands (future)
FEATURE_REAL_TIME_COLLABORATION=false  # Multi-user (future)
BETA_AI_DIAGNOSIS_SUGGESTIONS=false    # Diagnosis AI (future)
```

### Database Setup (Future)

**Not currently required** - all state in localStorage

When database is added:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/hysio_dev
```

## IDE Setup (VS Code Recommended)

### Recommended Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",          // ESLint
    "esbenp.prettier-vscode",          // Prettier
    "bradlc.vscode-tailwindcss",       // Tailwind IntelliSense
    "ms-vscode.vscode-typescript-next", // TypeScript
    "usernamehw.errorlens",            // Inline errors
    "streetsidesoftware.code-spell-checker" // Spell checker
  ]
}
```

### Recommended Settings

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## Next Steps

Now that you're set up:

1. **Read the prompts** - `handover_bernard/03-ai-core/prompts/README.md`
2. **Understand state** - `handover_bernard/04-code-deep-dive/state-management.md`
3. **Review API contracts** - `handover_bernard/04-code-deep-dive/api-contracts.md`
4. **Pick a quick win** - `handover_bernard/04-code-deep-dive/technical-debt.md`

## Getting Help

**Documentation**:
- This handover package: `handover_bernard/`
- Change history: `CHANGELOG.md`
- Code comments: Inline in source files

**Common Locations**:
- Patient info form: `hysio/src/components/scribe/patient-info-form.tsx`
- API routes: `hysio/src/app/api/`
- State management: `hysio/src/lib/state/scribe-store.ts`
- AI prompts: `hysio/src/lib/prompts/`

**Debugging Tips**:
- Browser DevTools (F12) → Console for frontend errors
- Browser DevTools → Network for API requests/responses
- Terminal (where `npm run dev` runs) for server-side errors
- Add `console.log()` liberally - Next.js shows both client and server logs

---

**You're ready to build!**

→ Next: Read `handover_bernard/03-ai-core/ai-pipelines-overview.md`
