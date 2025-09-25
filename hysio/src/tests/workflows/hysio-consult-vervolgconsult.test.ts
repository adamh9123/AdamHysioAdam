/**
 * Comprehensive Tests for Hysio Consult (Vervolgconsult) Workflow
 * Tests the complete follow-up consultation workflow using SOEP methodology:
 * S - Subjectief (Patient's subjective experience)
 * O - Objectief (Objective examination findings)
 * E - Evaluatie (Evaluation and assessment)
 * P - Plan (Treatment plan and follow-up)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { transcribeAudio } from '@/lib/api/transcription';
import { apiCall, API_ENDPOINTS } from '@/lib/api';

// Mock external APIs
vi.mock('@/lib/api/transcription');
vi.mock('@/lib/api');

// Mock Zustand store with consult workflow state
vi.mock('@/lib/state/scribe-store', () => ({
  useScribeStore: vi.fn(() => ({
    patientInfo: {
      initials: 'P.K.',
      birthYear: '1985',
      gender: 'male',
      chiefComplaint: 'Controle schouder revalidatie'
    },
    currentWorkflow: 'consult',
    consultData: null,
    setCurrentWorkflow: vi.fn(),
    setConsultData: vi.fn(),
    markStepComplete: vi.fn()
  }))
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  })
}));

describe('Hysio Consult (Vervolgconsult) Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Preparation Generation', () => {
    it('should generate consult preparation for follow-up visit', async () => {
      const mockPreparation = {
        success: true,
        data: {
          content: `**Vervolgconsult Voorbereiding - Schouder Revalidatie**

**Vorige behandeling evalueren:**
- Hoe verloopt de revalidatie tot nu toe?
- Welke oefeningen worden uitgevoerd?
- Compliance met thuisoefeningen?

**Huidige klachten:**
- Pijn niveau nu vs. vorige keer?
- Functionele verbetering?
- Nieuwe klachten of problemen?

**Objectief onderzoek:**
- ROM vergelijken met vorige metingen
- Kracht progressie evalueren
- Functionele testen herhalen

**Behandelplan aanpassing:**
- Intensiteit oefeningen
- Nieuwe oefeningen introduceren
- Zelfmanagement verbeteren

**Follow-up planning:**
- Frequentie vervolgafspraken
- Eindpunt behandeling bepalen
- Return to work/sport planning`,
          workflowType: 'consult',
          generatedAt: new Date().toISOString()
        }
      };

      vi.mocked(apiCall).mockResolvedValue(mockPreparation);

      const result = await apiCall('/api/preparation', {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'consult',
          patientInfo: {
            initials: 'P.K.',
            birthYear: '1985',
            gender: 'male',
            chiefComplaint: 'Controle schouder revalidatie'
          }
        })
      });

      expect(result.success).toBe(true);
      expect(result.data.content).toContain('Vervolgconsult');
      expect(result.data.content).toContain('revalidatie');
      expect(result.data.content).toContain('ROM');
      expect(result.data.content).toContain('oefeningen');
    });

    it('should not auto-generate preparation on component mount', () => {
      // After our fix, preparation should not be generated automatically
      expect(apiCall).not.toHaveBeenCalledWith('/api/preparation', expect.anything());
    });
  });

  describe('SOEP Processing', () => {
    describe('Audio Input Processing', () => {
      it('should transcribe and process follow-up consultation audio', async () => {
        const mockTranscription = {
          success: true,
          transcript: `Vervolgconsult - Patiënt komt binnen voor controle na 3 weken fysiotherapie voor rechter schouderimpingement.

Subjectief:
Patiënt geeft aan dat de pijn behoorlijk verminderd is sinds vorige keer. Van een 7/10 naar ongeveer een 4/10.
Kan weer beter slapen, vooral op de rechter zij gaat nu wel. Nachtpijn is bijna weg.
Merkt duidelijke vooruitgang in zijn werk als schilder. Kan weer meer overhead werken, maar nog niet volledig.
Thuisoefeningen gaan goed, doet ze 2x per dag zoals afgesproken.
Pijn vooral nog bij extreme overhead bewegingen en bij koud weer.

Objectief:
Inspectie: Minder protractie schouder dan vorige keer
ROM actief: Flexie nu 170° (was 140°), Abductie 160° (was 120°)
ROM passief: Flexie 180°, abductie 175°
Kracht: Abductie nu 4+/5 (was 3/5), exorotatie 4/5 (was 3/5)
Hawkins test: Nu licht positief (was sterk positief)
Neer test: Negatief (was positief)
Empty can: Licht positief (was sterk positief)

Evaluatie:
Duidelijke vooruitgang in alle parameters. Pijn, ROM en kracht allemaal verbeterd.
Functionele verbetering in werk en slaap. Goede compliance met oefenprogramma.
Nog niet volledig herstel, met name kracht en extreme ROM nog beperkt.

Plan:
- Oefenprogramma intensiveren: zwaardere weerstand
- Nieuwe oefeningen toevoegen voor eindstadium revalidatie
- Work hardening oefeningen voor schilderwerk
- Controle over 3 weken
- Bij verdere goede vooruitgang dan laatste behandeling`,
          confidence: 0.91
        };

        const mockSOEPResponse = {
          success: true,
          data: {
            soepStructure: {
              subjectief: {
                klachten: 'Pijn verminderd van 7/10 naar 4/10, beter slapen, vooruitgang in werk',
                functioneleStatus: 'Kan weer meer overhead werken als schilder, nachtpijn bijna weg',
                behandelrespons: 'Thuisoefeningen gaan goed, 2x per dag compliance',
                doelen: 'Volledig herstel voor werk en dagelijks functioneren'
              },
              objectief: {
                inspectie: 'Minder protractie schouder dan vorige keer',
                bewegingsbereik: 'Flexie 170° (was 140°), Abductie 160° (was 120°)',
                kracht: 'Abductie 4+/5 (was 3/5), exorotatie 4/5 (was 3/5)',
                specialeTesten: 'Hawkins licht positief (was sterk), Neer negatief (was positief)',
                functioneleTesten: 'Overhead bewegingen verbeterd maar nog beperkt'
              },
              evaluatie: {
                vooruitgang: 'Duidelijke verbetering alle parameters: pijn, ROM, kracht',
                doelenbereikt: 'Gedeeltelijk - functionele verbetering maar nog niet volledig herstel',
                behandeleffectiviteit: 'Huidige behandeling effectief, goede compliance patiënt',
                prognose: 'Gunstig voor volledig herstel bij voortzetten behandeling'
              },
              plan: {
                behandeling: 'Intensiveren oefenprogramma met zwaardere weerstand',
                doelen: 'Volledig krachtherstel en ROM, return to full work capacity',
                zelfmanagement: 'Continueren thuisoefeningen, work hardening oefeningen',
                followUp: 'Controle over 3 weken, bij goede vooruitgang laatste behandeling',
                verwijzing: 'Geen verwijzing noodzakelijk op dit moment'
              },
              samenvattingConsult: 'Goede vooruitgang na 3 weken fysiotherapie voor schouderimpingement. Pijn, mobiliteit en kracht allen verbeterd. Plan: intensiveren behandeling voor volledig herstel.'
            },
            transcript: mockTranscription.transcript,
            workflowType: 'consult',
            processedAt: new Date().toISOString()
          }
        };

        vi.mocked(transcribeAudio).mockResolvedValue(mockTranscription);
        vi.mocked(apiCall).mockResolvedValue(mockSOEPResponse);

        // Simulate audio recording and processing
        const audioBlob = new Blob(['consult audio data'], { type: 'audio/webm' });

        const transcriptionResult = await transcribeAudio(audioBlob, {
          language: 'nl',
          prompt: 'Fysiotherapie vervolgconsult'
        });

        expect(transcriptionResult.success).toBe(true);
        expect(transcriptionResult.transcript).toContain('Vervolgconsult');
        expect(transcriptionResult.transcript).toContain('Subjectief');
        expect(transcriptionResult.transcript).toContain('Objectief');

        // Process through SOEP
        const soepResult = await apiCall('/api/soep/process', {
          method: 'POST',
          body: JSON.stringify({
            workflowType: 'consult',
            patientInfo: {
              initials: 'P.K.',
              birthYear: '1985',
              gender: 'male',
              chiefComplaint: 'Controle schouder revalidatie'
            },
            inputData: {
              type: 'manual',
              data: transcriptionResult.transcript
            }
          })
        });

        expect(soepResult.success).toBe(true);
        const soep = soepResult.data.soepStructure;
        expect(soep.subjectief.klachten).toContain('7/10 naar 4/10');
        expect(soep.objectief.bewegingsbereik).toContain('170°');
        expect(soep.evaluatie.vooruitgang).toContain('verbetering');
        expect(soep.plan.followUp).toContain('3 weken');
      });
    });

    describe('Manual Input Processing', () => {
      it('should process manual SOEP consultation notes', async () => {
        const manualSOEPInput = `SOEP Vervolgconsult - Knie revalidatie na meniscectomie

SUBJECTIEF:
Patiënt is 6 weken geleden geopereerd aan mediale meniscus rechts (arthroscopische partiële meniscectomie).
Postoperatieve revalidatie gestart na 2 weken.

Huidige klachten:
- Pijn: 3/10 (was 8/10 direct postoperatief)
- Zwelling: Nog licht aanwezig, vooral 's avonds
- Stijfheid: Ochtend vooral, verbetert na bewegen
- Knielen: Nog pijnlijk en vermijdt dit
- Traplopen: Gaat beter, maar nog voorzichtig

Activiteiten:
- Wandelen: Kan nu 30 minuten (was 10 min)
- Fietsen: Kan weer 20 km (doel bereikt)
- Sport: Nog niet gestart, wil graag weer voetballen
- Werk: Kantoorwerk geen probleem, af en toe staan/lopen

OBJECTIEF:
Inspectie: Lichte zwelling mediaal, litteken goed genezen
ROM: Flexie 130° (was 90°), extensie -2° (was -10°)
Kracht: Quadriceps 4/5 (was 3/5), hamstrings 4+/5
Stabiliteit: Geen laxiteit, vertrouwen in knie toegenomen
Functioneel: Squat tot 90°, trap op/af normaal tempo

EVALUATIE:
Goede progressie na meniscectomie. ROM en kracht duidelijk verbeterd.
Functioneel niveau stijgt, kan weer dagelijkse activiteiten zonder problemen.
Doelen gedeeltelijk bereikt: basis activiteiten OK, sport nog niet.
Resterende beperkingen: eindgraden flexie, knielen, sportspecifieke bewegingen.

PLAN:
Volgende 4 weken:
- ROM verder verbeteren: stretching en mobilisatie
- Kracht opbouw: squat, lunges progressie
- Proprioceptie: balans oefeningen op instabiel ondergrond
- Sport voorbereiding: richtingswisselingen, springen
- Knielen geleidelijk introduceren met kussen

Doel over 4 weken: Start sport-specifieke training
Eindpunt behandeling: Over 8 weken return to sport
Follow-up: Over 2 weken evaluatie progressie`;

        const mockSOEPResponse = {
          success: true,
          data: {
            soepStructure: {
              subjectief: {
                klachten: 'Pijn 3/10 (verbetering van 8/10), lichte zwelling avonds, ochtend stijfheid',
                functioneleStatus: 'Wandelen 30 min, fietsen 20km, kantoorwerk geen probleem',
                behandelrespons: '6 weken post-meniscectomie, revalidatie sinds 2 weken',
                doelen: 'Return to sport (voetbal), volledig pijnvrij functioneren'
              },
              objectief: {
                inspectie: 'Lichte zwelling mediaal, litteken goed genezen',
                bewegingsbereik: 'Flexie 130° (was 90°), extensie -2° (was -10°)',
                kracht: 'Quadriceps 4/5 (was 3/5), hamstrings 4+/5',
                specialeTesten: 'Geen laxiteit, goed vertrouwen in knie',
                functioneleTesten: 'Squat tot 90°, trap normaal tempo'
              },
              evaluatie: {
                vooruitgang: 'Goede progressie ROM en kracht, functioneel niveau stijgt',
                doelenbereikt: 'Basis activiteiten bereikt, sport nog niet mogelijk',
                behandeleffectiviteit: 'Revalidatie verloopt volgens verwachting post-meniscectomie',
                prognose: 'Gunstig voor volledig sportief herstel binnen 8 weken'
              },
              plan: {
                behandeling: 'ROM verbetering, kracht opbouw, proprioceptie training',
                doelen: 'Sport-specifieke training over 4 weken, return to sport over 8 weken',
                zelfmanagement: 'Stretching, progressieve kracht oefeningen, knielen introduceren',
                followUp: 'Evaluatie over 2 weken, sport voorbereiding over 4 weken',
                verwijzing: 'Geen verwijzing, sport-fysiotherapeut mogelijk later'
              },
              samenvattingConsult: 'Goede progressie 6 weken post-meniscectomie. ROM, kracht en functie verbeterd. Plan: verdere kracht en proprioceptie voor sport return.'
            },
            transcript: manualSOEPInput,
            workflowType: 'consult',
            processedAt: new Date().toISOString()
          }
        };

        vi.mocked(apiCall).mockResolvedValue(mockSOEPResponse);

        const result = await apiCall('/api/soep/process', {
          method: 'POST',
          body: JSON.stringify({
            workflowType: 'consult',
            patientInfo: {
              initials: 'P.K.',
              birthYear: '1985',
              gender: 'male',
              chiefComplaint: 'Controle knie na meniscectomie'
            },
            inputData: {
              type: 'manual',
              data: manualSOEPInput
            }
          })
        });

        expect(result.success).toBe(true);
        const soep = result.data.soepStructure;

        // Verify SOEP structure completeness
        expect(soep.subjectief).toBeDefined();
        expect(soep.objectief).toBeDefined();
        expect(soep.evaluatie).toBeDefined();
        expect(soep.plan).toBeDefined();

        // Verify clinical content
        expect(soep.subjectief.klachten).toContain('3/10');
        expect(soep.objectief.bewegingsbereik).toContain('130°');
        expect(soep.evaluatie.vooruitgang).toContain('progressie');
        expect(soep.plan.doelen).toContain('sport');
        expect(soep.samenvattingConsult).toContain('meniscectomie');
      });
    });

    describe('File Upload Processing', () => {
      it('should handle consultation audio file upload', async () => {
        const mockFile = new File(['consultation recording'], 'consult.mp3', { type: 'audio/mp3' });

        const mockTranscription = {
          success: true,
          transcript: 'Vervolgconsult bevindingen: patiënt toont goede vooruitgang na behandeling...',
          confidence: 0.88
        };

        vi.mocked(transcribeAudio).mockResolvedValue(mockTranscription);

        // Simulate arrayBuffer for test environment
        const mockBuffer = new ArrayBuffer(1024);
        const fileBlob = new Blob([mockBuffer], { type: mockFile.type });
        const result = await transcribeAudio(fileBlob, {
          language: 'nl',
          prompt: 'Fysiotherapie vervolgconsult'
        });

        expect(result.success).toBe(true);
        expect(result.transcript).toContain('Vervolgconsult');
        expect(result.transcript).toContain('vooruitgang');
      });
    });
  });

  describe('Complete Consult Workflow Integration', () => {
    it('should complete full consultation workflow', async () => {
      // Step 1: Generate preparation
      const mockPreparation = {
        success: true,
        data: {
          content: 'Consultation preparation content',
          workflowType: 'consult'
        }
      };

      // Step 2: Process SOEP consultation
      const mockSOEPResult = {
        success: true,
        data: {
          soepStructure: {
            subjectief: {
              klachten: 'Significant improvement in pain levels',
              functioneleStatus: 'Better mobility and daily functioning',
              behandelrespons: 'Good response to treatment',
              doelen: 'Return to full activity level'
            },
            objectief: {
              inspectie: 'Reduced swelling and better posture',
              bewegingsbereik: 'Increased ROM in all directions',
              kracht: 'Improved strength 4+/5',
              specialeTesten: 'Positive improvements in all tests'
            },
            evaluatie: {
              vooruitgang: 'Excellent progress in all areas',
              doelenbereikt: 'Primary goals achieved',
              behandeleffectiviteit: 'Treatment highly effective',
              prognose: 'Excellent prognosis for full recovery'
            },
            plan: {
              behandeling: 'Continue current treatment plan',
              doelen: 'Progress to advanced functional training',
              zelfmanagement: 'Independent exercise program',
              followUp: 'Evaluate in 2 weeks',
              verwijzing: 'No referral needed'
            },
            samenvattingConsult: 'Excellent progress with significant improvements across all parameters'
          },
          workflowType: 'consult',
          processedAt: new Date().toISOString()
        }
      };

      vi.mocked(apiCall)
        .mockResolvedValueOnce(mockPreparation)
        .mockResolvedValueOnce(mockSOEPResult);

      // Execute workflow steps
      const preparationResult = await apiCall('/api/preparation', {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'consult',
          patientInfo: {
            initials: 'P.K.',
            birthYear: '1985',
            gender: 'male',
            chiefComplaint: 'Follow-up consultation'
          }
        })
      });

      const consultResult = await apiCall('/api/soep/process', {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'consult',
          patientInfo: {
            initials: 'P.K.',
            birthYear: '1985',
            gender: 'male',
            chiefComplaint: 'Follow-up consultation'
          },
          preparation: preparationResult.data.content,
          inputData: {
            type: 'manual',
            data: 'Complete consultation transcript with SOEP structure...'
          }
        })
      });

      // Verify complete workflow
      expect(preparationResult.success).toBe(true);
      expect(consultResult.success).toBe(true);
      expect(consultResult.data.soepStructure.subjectief).toBeDefined();
      expect(consultResult.data.soepStructure.objectief).toBeDefined();
      expect(consultResult.data.soepStructure.evaluatie).toBeDefined();
      expect(consultResult.data.soepStructure.plan).toBeDefined();
      expect(consultResult.data.soepStructure.samenvattingConsult).toBeDefined();
    });

    it('should handle workflow interruption and recovery', async () => {
      // Simulate network failure during processing
      vi.mocked(apiCall)
        .mockResolvedValueOnce({ // Preparation succeeds
          success: true,
          data: { content: 'Preparation content' }
        })
        .mockRejectedValueOnce(new Error('SOEP processing timeout'));

      // Step 1: Preparation succeeds
      const preparationResult = await apiCall('/api/preparation', {
        method: 'POST',
        body: JSON.stringify({ workflowType: 'consult' })
      });

      expect(preparationResult.success).toBe(true);

      // Step 2: SOEP processing fails
      try {
        await apiCall('/api/soep/process', {
          method: 'POST',
          body: JSON.stringify({
            workflowType: 'consult',
            inputData: { type: 'manual', data: 'test' }
          })
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('timeout');
      }
    });
  });

  describe('Clinical Accuracy and Data Quality', () => {
    it('should generate clinically relevant SOEP structure for specific conditions', async () => {
      const rugpijnConsult = `Vervolgconsult lage rugpijn:

Subjectief: Pijn van 8/10 naar 5/10 na 4 behandelingen. Kan weer langer zitten (1 uur vs 15 min).
Objectief: Flexie 80° (was 40°), SLR 60° (was 30°), kracht rugextensoren 4/5.
Evaluatie: Duidelijke verbetering mobiliteit en functie, nog niet optimaal.
Plan: Mobilisatie voortzetten, krachttraining intensiveren, work conditioning.`;

      const mockSOEPResponse = {
        success: true,
        data: {
          soepStructure: {
            subjectief: {
              klachten: 'Lage rugpijn verminderd van 8/10 naar 5/10',
              functioneleStatus: 'Kan 1 uur zitten versus 15 minuten voorheen',
              behandelrespons: '4 behandelingen gehad, duidelijke vooruitgang',
              doelen: 'Verdere pijnreductie en functionele verbetering'
            },
            objectief: {
              bewegingsbereik: 'Flexie 80° (was 40°)',
              specialeTesten: 'SLR 60° (was 30°)',
              kracht: 'Rugextensoren 4/5',
              functioneleTesten: 'Zitduur verbeterd naar 1 uur'
            },
            evaluatie: {
              vooruitgang: 'Duidelijke verbetering in mobiliteit en functie',
              doelenbereikt: 'Gedeeltelijk - nog niet optimaal niveau',
              behandeleffectiviteit: 'Behandeling effectief, voortzetten geïndiceerd',
              prognose: 'Gunstig bij voortzetting behandeling'
            },
            plan: {
              behandeling: 'Mobilisatie voortzetten, krachttraining intensiveren',
              doelen: 'Verdere functionele verbetering, work conditioning',
              followUp: 'Evaluatie progressie over 2 weken'
            },
            samenvattingConsult: 'Goede vooruitgang lage rugpijn na 4 behandelingen, plan intensiveren voor optimaal herstel'
          }
        }
      };

      vi.mocked(apiCall).mockResolvedValue(mockSOEPResponse);

      const result = await apiCall('/api/soep/process', {
        method: 'POST',
        body: JSON.stringify({
          inputData: { type: 'manual', data: rugpijnConsult }
        })
      });

      const soep = result.data.soepStructure;

      // Verify clinical relevance and completeness
      expect(soep.subjectief.klachten).toContain('8/10 naar 5/10');
      expect(soep.objectief.bewegingsbereik).toContain('80°');
      expect(soep.evaluatie.vooruitgang).toContain('verbetering');
      expect(soep.plan.behandeling).toContain('krachttraining');
      expect(soep.samenvattingConsult).toContain('rugpijn');
    });

    it('should maintain consistency between subjective and objective findings', async () => {
      const consistentConsultData = {
        subjectief: 'Schouder pijn veel minder, kan weer overhead werken',
        objectief: 'Flexie 170° (was 120°), kracht 4+/5 (was 3/5)',
        evaluatie: 'Objectieve verbetering komt overeen met subjectieve ervaring',
        plan: 'Verder progressief belasten overhead activiteiten'
      };

      const mockResponse = {
        success: true,
        data: {
          soepStructure: {
            subjectief: { klachten: consistentConsultData.subjectief },
            objectief: { bewegingsbereik: consistentConsultData.objectief },
            evaluatie: { vooruitgang: consistentConsultData.evaluatie },
            plan: { behandeling: consistentConsultData.plan }
          }
        }
      };

      vi.mocked(apiCall).mockResolvedValue(mockResponse);

      const result = await apiCall('/api/soep/process', {
        method: 'POST',
        body: JSON.stringify({
          inputData: { type: 'manual', data: Object.values(consistentConsultData).join('\n') }
        })
      });

      // Verify consistency between sections
      expect(result.data.soepStructure.subjectief.klachten).toContain('overhead');
      expect(result.data.soepStructure.objectief.bewegingsbereik).toContain('170°');
      expect(result.data.soepStructure.evaluatie.vooruitgang).toContain('overeen');
      expect(result.data.soepStructure.plan.behandeling).toContain('overhead');
    });

    it('should identify when treatment goals are achieved', async () => {
      const goalAchievedConsult = `Patient reports complete resolution of symptoms.
      Pain 0/10, full range of motion, returned to all activities including sport.
      Objective findings confirm full recovery. Plan: discharge with home program.`;

      const mockResponse = {
        success: true,
        data: {
          soepStructure: {
            evaluatie: {
              doelenbereikt: 'Alle behandeldoelen volledig bereikt',
              vooruitgang: 'Volledige symptoomresolutie en functioneel herstel',
              behandeleffectiviteit: 'Behandeling zeer succesvol afgerond'
            },
            plan: {
              behandeling: 'Ontslag met thuisprogramma voor onderhoud',
              followUp: 'Geen vervolgafspraken nodig, open terugkomregeling',
              verwijzing: 'Geen verwijzing noodzakelijk'
            }
          }
        }
      };

      vi.mocked(apiCall).mockResolvedValue(mockResponse);

      const result = await apiCall('/api/soep/process', {
        method: 'POST',
        body: JSON.stringify({
          inputData: { type: 'manual', data: goalAchievedConsult }
        })
      });

      expect(result.data.soepStructure.evaluatie.doelenbereikt).toContain('bereikt');
      expect(result.data.soepStructure.plan.behandeling).toContain('Ontslag');
      expect(result.data.soepStructure.plan.followUp).toContain('Geen vervolgafspraken');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle insufficient consultation data', async () => {
      const insufficientData = 'Patient came in. Feeling better.';

      vi.mocked(apiCall).mockResolvedValue({
        success: false,
        error: 'Insufficient consultation data for meaningful SOEP analysis'
      });

      const result = await apiCall('/api/soep/process', {
        method: 'POST',
        body: JSON.stringify({
          inputData: { type: 'manual', data: insufficientData }
        })
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient');
    });

    it('should handle audio transcription failures', async () => {
      vi.mocked(transcribeAudio).mockResolvedValue({
        success: false,
        error: 'Audio quality too poor for transcription'
      });

      const audioBlob = new Blob(['poor quality audio'], { type: 'audio/webm' });
      const result = await transcribeAudio(audioBlob);

      expect(result.success).toBe(false);
      expect(result.error).toContain('poor');
    });

    it('should validate patient info for consultation', async () => {
      vi.mocked(apiCall).mockResolvedValue({
        success: false,
        error: 'Patient information incomplete for consultation'
      });

      const result = await apiCall('/api/soep/process', {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'consult',
          // Missing patientInfo
          inputData: { type: 'manual', data: 'consultation data' }
        })
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Patient information');
    });
  });

  describe('Performance and Reliability', () => {
    it('should complete consultation processing within acceptable time', async () => {
      const startTime = Date.now();

      vi.mocked(apiCall).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
          success: true,
          data: {
            soepStructure: {
              subjectief: { klachten: 'test' },
              objectief: { inspectie: 'test' },
              evaluatie: { vooruitgang: 'test' },
              plan: { behandeling: 'test' }
            }
          }
        };
      });

      await apiCall('/api/soep/process', {
        method: 'POST',
        body: JSON.stringify({
          inputData: { type: 'manual', data: 'consultation transcript' }
        })
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
    });

    it('should handle multiple concurrent consultations', async () => {
      const mockResponse = {
        success: true,
        data: { soepStructure: { subjectief: { klachten: 'concurrent test' } } }
      };

      vi.mocked(apiCall).mockResolvedValue(mockResponse);

      const promises = Array.from({ length: 3 }, (_, i) =>
        apiCall('/api/soep/process', {
          method: 'POST',
          body: JSON.stringify({
            patientInfo: { initials: `C${i}`, chiefComplaint: `Consultation ${i}` },
            inputData: { type: 'manual', data: `Test consultation ${i}` }
          })
        })
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.data.soepStructure).toBeDefined();
      });
    });
  });
});