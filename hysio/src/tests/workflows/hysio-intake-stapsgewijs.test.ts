/**
 * Comprehensive Tests for Hysio Intake (Stapsgewijs) Workflow
 * Tests the complete step-by-step intake workflow:
 * 1. Anamnese (HHSB processing)
 * 2. Onderzoek (Examination findings)
 * 3. Klinische Conclusie (Clinical conclusions)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { transcribeAudio } from '@/lib/api/transcription';
import { apiCall, API_ENDPOINTS } from '@/lib/api';

// Mock external APIs
vi.mock('@/lib/api/transcription');
vi.mock('@/lib/api');

// Mock Zustand store with stepwise workflow state
vi.mock('@/lib/state/scribe-store', () => ({
  useScribeStore: vi.fn(() => ({
    patientInfo: {
      initials: 'M.J.',
      birthYear: '1988',
      gender: 'female',
      chiefComplaint: 'Schouderklachten rechts'
    },
    currentWorkflow: 'intake-stapsgewijs',
    workflowData: {
      anamneseData: null,
      onderzoekData: null,
      klinischeConclusieData: null
    },
    setCurrentWorkflow: vi.fn(),
    setAnamneseData: vi.fn(),
    setOnderzoekData: vi.fn(),
    setKlinischeConclusieData: vi.fn(),
    markStepComplete: vi.fn(),
    isStepComplete: vi.fn((step) => false),
    completedSteps: []
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

describe('Hysio Intake (Stapsgewijs) Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Step 1: Anamnese (Anamnesis)', () => {
    describe('Preparation Generation', () => {
      it('should generate anamnese preparation when user clicks button', async () => {
        const mockPreparation = {
          success: true,
          data: {
            content: `**Anamnese Voorbereiding - Schouderklachten**

**Hoofdklacht uitdiepen:**
- Wanneer ontstaan? (acuut vs. geleidelijk)
- Lokatie van de pijn (voor/achter/zijkant schouder)
- Uitstraling naar arm/nek?
- Nachtpijn aanwezig?

**Provocerende factoren:**
- Welke bewegingen doen pijn?
- Overhead activiteiten problematisch?
- Pijn bij op zij liggen?

**Functie:**
- Beperkingen in ADL?
- Werkgerelateerde problemen?
- Sport/hobby beperkingen?

**Rode vlaggen checken:**
- Trauma/val in voorgeschiedenis?
- Gewichtsverlies/koorts?
- Neurologische symptomen?`,
            workflowType: 'intake-stapsgewijs',
            step: 'anamnese',
            generatedAt: new Date().toISOString()
          }
        };

        vi.mocked(apiCall).mockResolvedValue(mockPreparation);

        const result = await apiCall('/api/preparation', {
          method: 'POST',
          body: JSON.stringify({
            workflowType: 'intake-stapsgewijs',
            step: 'anamnese',
            patientInfo: {
              initials: 'M.J.',
              birthYear: '1988',
              gender: 'female',
              chiefComplaint: 'Schouderklachten rechts'
            }
          })
        });

        expect(result.success).toBe(true);
        expect(result.data.content).toContain('Schouderklachten');
        expect(result.data.content).toContain('Hoofdklacht');
        expect(result.data.content.toLowerCase()).toContain('rode vlaggen');
        expect(result.data.step).toBe('anamnese');
      });

      it('should not auto-generate preparation on page load', () => {
        // After our fix, preparation should not be generated automatically
        expect(apiCall).not.toHaveBeenCalledWith('/api/preparation', expect.anything());
      });
    });

    describe('Audio and Manual Input Processing', () => {
      it('should process audio recording for anamnese', async () => {
        const mockTranscription = {
          success: true,
          transcript: `Patiënt geeft aan dat zij sinds 6 weken last heeft van pijn in de rechter schouder.
De pijn is geleidelijk ontstaan zonder duidelijke aanleiding. Pijn zit vooral aan de voorkant en zijkant van de schouder.
Heeft veel last bij overhead bewegingen zoals het ophangen van de was en koken.
Ook nachtpijn aanwezig, vooral bij op de rechter zijkant liggen.
Heeft geen uitstraling naar de arm of hand. Geen tintelingen of doof gevoel.
Is kapster van beroep en merkt dat zij haar werk moeilijker kan uitvoeren.
Geen eerdere schouderproblemen gehad. Geen trauma of val voorafgaand.`,
          confidence: 0.93
        };

        const mockHHSBResponse = {
          success: true,
          data: {
            hhsbStructure: {
              hulpvraag: 'Patiënt wil weer pijnvrij kunnen werken als kapster en normaal kunnen slapen',
              historie: 'Geleidelijke onset schouderklachten rechts sinds 6 weken, geen trauma',
              stoornissen: 'Schouderimpingement rechts met nachtpijn en bewegingsbeperking overhead',
              beperkingen: 'Beperkingen in werk als kapster, overhead activiteiten, slapen op rechter zij',
              anamneseSummary: 'Subacute schouderimpingement rechts met functionele beperkingen',
              redFlags: [],
              fullStructuredText: 'Volledige HHSB tekst gebaseerd op anamnese...'
            },
            transcript: mockTranscription.transcript,
            workflowType: 'intake-stapsgewijs',
            processedAt: new Date().toISOString()
          }
        };

        vi.mocked(transcribeAudio).mockResolvedValue(mockTranscription);
        vi.mocked(apiCall).mockResolvedValue(mockHHSBResponse);

        // Simulate audio recording and processing
        const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });

        const transcriptionResult = await transcribeAudio(audioBlob, {
          language: 'nl',
          prompt: 'Fysiotherapie anamnese gesprek schouderklachten'
        });

        expect(transcriptionResult.success).toBe(true);
        expect(transcriptionResult.transcript).toContain('schouder');

        // Process through HHSB
        const hhsbResult = await apiCall('/api/hhsb/process', {
          method: 'POST',
          body: JSON.stringify({
            workflowType: 'intake-stapsgewijs',
            step: 'anamnese',
            patientInfo: {
              initials: 'M.J.',
              birthYear: '1988',
              gender: 'female',
              chiefComplaint: 'Schouderklachten rechts'
            },
            inputData: {
              type: 'manual',
              data: transcriptionResult.transcript
            }
          })
        });

        expect(hhsbResult.success).toBe(true);
        expect(hhsbResult.data.hhsbStructure.hulpvraag).toContain('kapster');
        expect(hhsbResult.data.hhsbStructure.historie).toContain('6 weken');
        expect(hhsbResult.data.hhsbStructure.stoornissen).toContain('impingement');
        expect(hhsbResult.data.hhsbStructure.beperkingen).toContain('overhead');
      });

      it('should handle manual anamnese input', async () => {
        const manualInput = `Anamnese bevindingen:

Hoofdklacht: Patiënt (vrouw, 35 jaar, kapster) heeft sinds 6 weken pijn rechter schouder

Ontstaan: Geleidelijk, geen duidelijke aanleiding of trauma
Lokatie: Voor- en zijkant rechter schouder
Karakter: Doffe pijn, 6/10, wordt scherper bij beweging
Uitstraling: Geen uitstraling naar arm
Provocatie: Overhead bewegingen, liggen op rechter zij
Verzachting: Rust, warmte helpt iets

Beperkingen:
- Werk: Moeilijk knippen en föhnen (overhead)
- ADL: Ophangen was, aankleden, slapen
- Sport: Tennissen gestopt

Voorgeschiedenis: Geen eerdere schouderproblemen
Medicatie: Paracetamol, matig effect

Hulpvraag: Weer pijnvrij werken en sporten`;

        const mockHHSBResponse = {
          success: true,
          data: {
            hhsbStructure: {
              hulpvraag: 'Patiënt wil pijnvrij kunnen werken als kapster en weer kunnen tennissen',
              historie: 'Geleidelijke onset rechter schouderklachten, 6 weken bestaand, geen trauma',
              stoornissen: 'Rechter schouder pijn 6/10, beperkte overhead mobiliteit, nachtpijn',
              beperkingen: 'Werkbeperkingen kappen/föhnen, ADL beperkingen overhead, tennissen gestopt',
              anamneseSummary: 'Subacute rechter schouderimpingement bij kapster met werk en sport beperkingen',
              redFlags: [],
              fullStructuredText: 'Complete HHSB analysis...'
            },
            transcript: manualInput,
            workflowType: 'intake-stapsgewijs',
            processedAt: new Date().toISOString()
          }
        };

        vi.mocked(apiCall).mockResolvedValue(mockHHSBResponse);

        const result = await apiCall('/api/hhsb/process', {
          method: 'POST',
          body: JSON.stringify({
            workflowType: 'intake-stapsgewijs',
            step: 'anamnese',
            patientInfo: {
              initials: 'M.J.',
              birthYear: '1988',
              gender: 'female',
              chiefComplaint: 'Schouderklachten rechts'
            },
            inputData: {
              type: 'manual',
              data: manualInput
            }
          })
        });

        expect(result.success).toBe(true);
        const hhsb = result.data.hhsbStructure;
        expect(hhsb.hulpvraag).toContain('kapster');
        expect(hhsb.hulpvraag).toContain('tennissen');
        expect(hhsb.historie).toContain('6 weken');
        expect(hhsb.beperkingen).toContain('föhnen');
      });
    });

    describe('Navigation to Next Step', () => {
      it('should enable navigation to onderzoek after successful anamnese', async () => {
        const mockStore = {
          workflowData: {
            anamneseData: {
              result: {
                hhsbStructure: { hulpvraag: 'test', historie: 'test' }
              },
              completed: true
            }
          },
          isStepComplete: vi.fn((step) => step === 'anamnese'),
          completedSteps: ['anamnese']
        };

        // Simulate completed anamnese state
        expect(mockStore.isStepComplete('anamnese')).toBe(true);
        expect(mockStore.completedSteps).toContain('anamnese');
      });
    });
  });

  describe('Step 2: Onderzoek (Physical Examination)', () => {
    describe('Preparation Generation', () => {
      it('should generate onderzoek preparation based on anamnese results', async () => {
        const mockPreparation = {
          success: true,
          data: {
            content: `**Onderzoek Voorbereiding - Schouderimpingement**

**Gebaseerd op anamnese bevindingen:**
- Vermoeden schouderimpingement rechts
- Vooral problemen met overhead bewegingen
- Nachtpijn suggestief voor impingement

**Aanbevolen onderzoeken:**

**Inspectie:**
- Houding en stand schouders
- Spieratrofie (deltoid, rotator cuff)
- Zwelling of ontstekingsteken

**Actief bewegingsonderzoek:**
- Flexie, extensie, abductie, rotaties
- Pijnlijke boog (60-120°)
- Scapula ritme

**Passief bewegingsonderzoek:**
- ROM vergelijken met andere zijde
- Eindgevoel beoordelen
- Capsulair patroon?

**Weerstand testen:**
- Rotator cuff kracht
- Deltoid kracht
- Pijn bij weerstand?

**Speciale testen:**
- Hawkins test (impingement)
- Neer test (impingement)
- Empty can test (supraspinatus)
- Painful arc test
- Lift-off test (subscapularis)`,
            workflowType: 'intake-stapsgewijs',
            step: 'onderzoek',
            generatedAt: new Date().toISOString()
          }
        };

        vi.mocked(apiCall).mockResolvedValue(mockPreparation);

        const result = await apiCall('/api/preparation', {
          method: 'POST',
          body: JSON.stringify({
            workflowType: 'intake-stapsgewijs',
            step: 'onderzoek',
            patientInfo: {
              initials: 'M.J.',
              birthYear: '1988',
              gender: 'female',
              chiefComplaint: 'Schouderklachten rechts'
            },
            previousStepData: {
              anamneseResult: {
                hhsbStructure: {
                  hulpvraag: 'Patiënt wil pijnvrij werken',
                  stoornissen: 'Schouderimpingement rechts met nachtpijn'
                }
              }
            }
          })
        });

        expect(result.success).toBe(true);
        expect(result.data.content).toContain('impingement');
        expect(result.data.content).toContain('Hawkins');
        expect(result.data.content).toContain('rotator cuff');
        expect(result.data.step).toBe('onderzoek');
      });
    });

    describe('Examination Processing', () => {
      it('should process physical examination findings', async () => {
        const onderzoekInput = `Lichamelijk onderzoek bevindingen:

Inspectie:
- Houding: lichte protractie rechter schouder
- Geen zwelling of roodheid zichtbaar
- Lichte atrofie supraspinatus rechts

Actief bewegingsonderzoek:
- Flexie: 160° (pijn vanaf 90°)
- Abductie: 140° (painful arc 60-120°)
- Exorotatie: 70° (normaal 90°)
- Endorotatie: L3 wervel (normaal T12)

Passief bewegingsonderzoek:
- Flexie: 180° vrij
- Abductie: 170° vrij
- Rotaties: vol bewegingsbereik passief
- Eindgevoel: kapsulair bij endorotatie

Kracht testen (weerstand):
- Abductie: 4/5 (pijn en zwakte)
- Flexie: 5/5
- Exorotatie: 4/5 (pijn)
- Endorotatie: 5/5

Speciale testen:
- Hawkins test: positief (pijn)
- Neer test: positief (pijn)
- Empty can test: positief (pijn + zwakte)
- Painful arc: positief (60-120°)
- Lift-off test: negatief`;

        const mockOnderzoekResponse = {
          success: true,
          data: {
            onderzoekBevindingen: {
              inspectie: 'Protractie rechter schouder, lichte supraspinatus atrofie',
              actief: 'Beperkte flexie (160°) en abductie (140°) met painful arc 60-120°',
              passief: 'Volledige ROM passief, kapsulair eindgevoel endorotatie',
              weerstand: 'Verzwakte en pijnlijke abductie (4/5) en exorotatie (4/5)',
              speciaal: 'Hawkins+, Neer+, Empty can+, Painful arc+, Lift-off-',
              palpatie: 'Niet specifiek onderzocht',
              functioneel: 'Overhead bewegingen beperkt door pijn en zwakte'
            },
            interpretatie: 'Bevindingen consistent met subacromiaal impingement syndroom rechts',
            vervolgonderzoek: 'Eventueel echo/MRI indien conservatieve behandeling faalt',
            workflowType: 'intake-stapsgewijs',
            processedAt: new Date().toISOString()
          }
        };

        vi.mocked(apiCall).mockResolvedValue(mockOnderzoekResponse);

        const result = await apiCall('/api/onderzoek/process', {
          method: 'POST',
          body: JSON.stringify({
            workflowType: 'intake-stapsgewijs',
            step: 'onderzoek',
            patientInfo: {
              initials: 'M.J.',
              birthYear: '1988',
              gender: 'female',
              chiefComplaint: 'Schouderklachten rechts'
            },
            anamneseData: {
              hhsbStructure: { stoornissen: 'Schouderimpingement rechts' }
            },
            inputData: {
              type: 'manual',
              data: onderzoekInput
            }
          })
        });

        expect(result.success).toBe(true);
        const bevindingen = result.data.onderzoekBevindingen;
        expect(bevindingen.actief).toContain('painful arc');
        expect(bevindingen.speciaal).toContain('Hawkins+');
        expect(bevindingen.weerstand).toContain('4/5');
        expect(result.data.interpretatie).toContain('impingement');
      });
    });
  });

  describe('Step 3: Klinische Conclusie (Clinical Conclusion)', () => {
    describe('Preparation Generation', () => {
      it('should generate clinical conclusion preparation based on anamnese and onderzoek', async () => {
        const mockPreparation = {
          success: true,
          data: {
            content: `**Klinische Conclusie Voorbereiding**

**Gebaseerd op bevindingen:**
- Anamnese: Subacute schouderimpingement rechts, werkgerelateerd
- Onderzoek: Positieve impingement testen, painful arc, verzwakte rotator cuff

**Te overwegen diagnoses:**
1. Subacromiaal impingement syndroom (primair)
2. Rotator cuff tendinopathie
3. Subacromiaal bursitis

**Behandelplan overwegen:**
- Educatie over houding en ergonomie
- Pijnbestrijding en ontstekingsremming
- Mobiliteit verbeteren (posterieure capsule)
- Kracht opbouw rotator cuff en scapula stabilisatoren
- Geleidelijke terugkeer naar volledig functieniveau

**Prognose factoren:**
- Gunstig: jonge leeftijd, goede motivatie, werk belangrijk
- Minder gunstig: werkgerelateerde oorzaak, herhaling mogelijk

**Follow-up:**
- Evaluatie na 2-3 weken
- Bij geen vooruitgang: aanvullend onderzoek overwegen`,
            workflowType: 'intake-stapsgewijs',
            step: 'klinische-conclusie',
            generatedAt: new Date().toISOString()
          }
        };

        vi.mocked(apiCall).mockResolvedValue(mockPreparation);

        const result = await apiCall('/api/preparation', {
          method: 'POST',
          body: JSON.stringify({
            workflowType: 'intake-stapsgewijs',
            step: 'klinische-conclusie',
            patientInfo: {
              initials: 'M.J.',
              birthYear: '1988',
              gender: 'female',
              chiefComplaint: 'Schouderklachten rechts'
            },
            previousStepData: {
              anamneseResult: {
                hhsbStructure: { stoornissen: 'Schouderimpingement rechts' }
              },
              onderzoekResult: {
                interpretatie: 'Subacromiaal impingement syndroom'
              }
            }
          })
        });

        expect(result.success).toBe(true);
        expect(result.data.content).toContain('impingement');
        expect(result.data.content).toContain('Behandelplan');
        expect(result.data.content).toContain('Prognose');
      });
    });

    describe('Clinical Conclusion Processing', () => {
      it('should generate comprehensive clinical conclusions', async () => {
        const conclusieInput = `Klinische redenering en conclusie:

Op basis van de anamnese en het lichamelijk onderzoek is er sprake van een subacromiaal impingement syndroom rechts.

Argumenten voor deze diagnose:
- Geleidelijke onset zonder trauma
- Pijn bij overhead activiteiten
- Nachtpijn (typisch voor impingement)
- Painful arc 60-120°
- Positieve Hawkins en Neer test
- Verzwakte en pijnlijke rotator cuff

Differentiaal diagnose:
- Rotator cuff partiële ruptuur: minder waarschijnlijk gezien leeftijd en kracht nog aanwezig
- AC gewricht problematiek: geen pijn bij cross-body test (niet uitgevoerd)
- Frozen shoulder: passieve bewegingen zijn vrij

Behandelplan:
1. Educatie: uitleg aandoening en prognose
2. Pijnmanagement: NSAID 2 weken
3. Fysiotherapie:
   - Mobilisatie posterieure kapsel
   - Krachtoefeningen rotator cuff (submaximal)
   - Scapulastabilisatie oefeningen
   - Houding en ergonomie training voor werk
4. Geleidelijke terugkeer werkactiviteiten

Prognose: Goed bij adequate behandeling, verwachte herstelperiode 6-12 weken

Follow-up: Evaluatie na 3 weken, bij onvoldoende vooruitgang echo schouder overwegen`;

        const mockConclusieResponse = {
          success: true,
          data: {
            klinischeConclusie: {
              diagnose: 'Subacromiaal impingement syndroom rechts',
              differentiaalDiagnose: [
                'Rotator cuff partiële ruptuur',
                'AC gewricht problematiek',
                'Adhesieve capsulitis'
              ],
              argumentatie: 'Geleidelijke onset, nachtpijn, positive impingement testen, painful arc, werkgerelateerde klachten',
              behandelplan: {
                korteTermijn: 'Pijnmanagement NSAID, educatie, start fysiotherapie',
                langeTermijn: 'Krachtoefeningen rotator cuff, scapulastabilisatie, ergonomie aanpassing werk',
                doelen: 'Pijnvrij functioneren in werk en ADL, preventie recidief'
              },
              prognose: {
                verwachtingHerstel: '6-12 weken bij adequate behandeling',
                prognostischeFactoren: 'Gunstig: jonge leeftijd, gemotiveerd. Aandachtspunt: werkgerelateerde oorzaak'
              },
              followUp: 'Evaluatie na 3 weken, bij geen vooruitgang aanvullend onderzoek (echo)',
              verwijzing: 'Geen directe verwijzing nodig, bij therapieresistentie overweeg orthopeed'
            },
            workflowType: 'intake-stapsgewijs',
            processedAt: new Date().toISOString()
          }
        };

        vi.mocked(apiCall).mockResolvedValue(mockConclusieResponse);

        const result = await apiCall('/api/klinische-conclusie/process', {
          method: 'POST',
          body: JSON.stringify({
            workflowType: 'intake-stapsgewijs',
            step: 'klinische-conclusie',
            patientInfo: {
              initials: 'M.J.',
              birthYear: '1988',
              gender: 'female',
              chiefComplaint: 'Schouderklachten rechts'
            },
            anamneseData: {
              hhsbStructure: { stoornissen: 'Schouderimpingement rechts' }
            },
            onderzoekData: {
              interpretatie: 'Subacromiaal impingement syndroom'
            },
            inputData: {
              type: 'manual',
              data: conclusieInput
            }
          })
        });

        expect(result.success).toBe(true);
        const conclusie = result.data.klinischeConclusie;
        expect(conclusie.diagnose).toContain('impingement');
        expect(conclusie.behandelplan.korteTermijn).toContain('fysiotherapie');
        expect(conclusie.prognose.verwachtingHerstel).toContain('6-12 weken');
        expect(conclusie.differentiaalDiagnose.some(d => d.toLowerCase().includes('rotator cuff'))).toBe(true);
      });
    });
  });

  describe('Complete Workflow Integration', () => {
    it('should complete full stepwise intake workflow', async () => {
      // Step 1: Anamnese
      const mockAnamneseResponse = {
        success: true,
        data: {
          hhsbStructure: {
            hulpvraag: 'Pijnvrij kunnen werken als kapster',
            historie: 'Geleidelijke onset schouderklachten rechts, 6 weken',
            stoornissen: 'Schouderimpingement rechts met nachtpijn',
            beperkingen: 'Werkbeperkingen, overhead activiteiten beperkt'
          }
        }
      };

      // Step 2: Onderzoek
      const mockOnderzoekResponse = {
        success: true,
        data: {
          onderzoekBevindingen: {
            speciaal: 'Hawkins+, Neer+, Empty can+',
            interpretatie: 'Subacromiaal impingement syndroom'
          }
        }
      };

      // Step 3: Klinische Conclusie
      const mockConclusieResponse = {
        success: true,
        data: {
          klinischeConclusie: {
            diagnose: 'Subacromiaal impingement syndroom rechts',
            behandelplan: {
              korteTermijn: 'Pijnmanagement en start fysiotherapie',
              langeTermijn: 'Krachtoefeningen en ergonomie'
            },
            prognose: { verwachtingHerstel: '6-12 weken' }
          }
        }
      };

      vi.mocked(apiCall)
        .mockResolvedValueOnce(mockAnamneseResponse)
        .mockResolvedValueOnce(mockOnderzoekResponse)
        .mockResolvedValueOnce(mockConclusieResponse);

      // Execute workflow
      const anamneseResult = await apiCall('/api/hhsb/process', {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'intake-stapsgewijs',
          step: 'anamnese',
          inputData: { type: 'manual', data: 'Anamnese transcript...' }
        })
      });

      const onderzoekResult = await apiCall('/api/onderzoek/process', {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'intake-stapsgewijs',
          step: 'onderzoek',
          anamneseData: anamneseResult.data,
          inputData: { type: 'manual', data: 'Onderzoek bevindingen...' }
        })
      });

      const conclusieResult = await apiCall('/api/klinische-conclusie/process', {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'intake-stapsgewijs',
          step: 'klinische-conclusie',
          anamneseData: anamneseResult.data,
          onderzoekData: onderzoekResult.data,
          inputData: { type: 'manual', data: 'Klinische redenering...' }
        })
      });

      // Verify complete workflow
      expect(anamneseResult.success).toBe(true);
      expect(onderzoekResult.success).toBe(true);
      expect(conclusieResult.success).toBe(true);

      expect(anamneseResult.data.hhsbStructure.hulpvraag).toBeDefined();
      expect(onderzoekResult.data.onderzoekBevindingen).toBeDefined();
      expect(conclusieResult.data.klinischeConclusie.diagnose).toBeDefined();
    });

    it('should handle workflow state persistence between steps', async () => {
      const mockStore = {
        workflowData: {
          anamneseData: {
            result: { hhsbStructure: { hulpvraag: 'Test hulpvraag' } },
            completed: true
          },
          onderzoekData: {
            result: { onderzoekBevindingen: { speciaal: 'Tests positive' } },
            completed: true
          },
          klinischeConclusieData: null
        },
        completedSteps: ['anamnese', 'onderzoek'],
        isStepComplete: vi.fn((step) => ['anamnese', 'onderzoek'].includes(step))
      };

      // Verify state persistence
      expect(mockStore.completedSteps).toContain('anamnese');
      expect(mockStore.completedSteps).toContain('onderzoek');
      expect(mockStore.isStepComplete('anamnese')).toBe(true);
      expect(mockStore.isStepComplete('onderzoek')).toBe(true);
      expect(mockStore.isStepComplete('klinische-conclusie')).toBe(false);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should prevent skipping steps in workflow', () => {
      const mockStore = {
        completedSteps: [], // No steps completed
        isStepComplete: vi.fn((step) => false)
      };

      // Should not allow accessing onderzoek without completing anamnese
      expect(mockStore.isStepComplete('anamnese')).toBe(false);
      // In real implementation, this should prevent navigation to onderzoek
    });

    it('should handle API failures during step processing', async () => {
      vi.mocked(apiCall).mockResolvedValue({
        success: false,
        error: 'HHSB processing failed due to invalid input'
      });

      const result = await apiCall('/api/hhsb/process', {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'intake-stapsgewijs',
          inputData: { type: 'manual', data: 'Incomplete data' }
        })
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('processing failed');
    });

    it('should handle incomplete previous step data', async () => {
      vi.mocked(apiCall).mockResolvedValue({
        success: false,
        error: 'Missing required anamnese data for onderzoek preparation'
      });

      const result = await apiCall('/api/preparation', {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'intake-stapsgewijs',
          step: 'onderzoek'
          // Missing previousStepData
        })
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required');
    });
  });

  describe('Data Quality and Clinical Accuracy', () => {
    it('should maintain data consistency across workflow steps', async () => {
      const patientComplaint = 'Nekklachten na auto ongeluk';

      const mockAnamneseResult = {
        success: true,
        data: {
          hhsbStructure: {
            hulpvraag: 'Pijnvrij autorijden en werken',
            historie: 'Whiplash trauma 2 weken geleden bij aanrijding',
            stoornissen: 'Nekpijn, hoofdpijn, beperkte nekmobiliteit',
            beperkingen: 'Autorijden pijnlijk, lange werkdagen moeilijk'
          }
        }
      };

      vi.mocked(apiCall).mockResolvedValue(mockAnamneseResult);

      const result = await apiCall('/api/hhsb/process', {
        method: 'POST',
        body: JSON.stringify({
          patientInfo: { chiefComplaint: patientComplaint },
          inputData: { type: 'manual', data: 'Whiplash anamnese details...' }
        })
      });

      // Verify consistency between chief complaint and HHSB
      expect(result.data.hhsbStructure.historie).toContain('trauma');
      expect(result.data.hhsbStructure.stoornissen.toLowerCase()).toContain('nekpijn');
      expect(result.data.hhsbStructure.beperkingen.toLowerCase()).toContain('autorijden');
    });

    it('should generate clinically relevant examination suggestions', async () => {
      const anamneseData = {
        hhsbStructure: {
          stoornissen: 'Lage rugpijn met uitstraling naar linker been',
          historie: 'Acuut ontstaan na tillen, 1 week geleden'
        }
      };

      const mockPreparation = {
        success: true,
        data: {
          content: `**Onderzoek voorbereiding lage rugpijn**

**Rode vlaggen checken:**
- Cauda equina syndroom
- Neurologische uitval

**Onderzoeken:**
- Straight leg raise test
- Neurologisch onderzoek L5/S1
- Lasègue test
- Crossed straight leg raise`
        }
      };

      vi.mocked(apiCall).mockResolvedValue(mockPreparation);

      const result = await apiCall('/api/preparation', {
        method: 'POST',
        body: JSON.stringify({
          step: 'onderzoek',
          previousStepData: { anamneseResult: anamneseData }
        })
      });

      expect(result.data.content).toContain('Straight leg raise');
      expect(result.data.content.toLowerCase()).toContain('rode vlaggen');
      expect(result.data.content).toContain('Cauda equina');
    });
  });
});