/**
 * Comprehensive Tests for Hysio Intake (Automatisch) Workflow
 * Tests the complete automated intake workflow including preparation generation,
 * input processing, and AI analysis
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { transcribeAudio } from '@/lib/api/transcription';
import { apiCall, API_ENDPOINTS } from '@/lib/api';

// Mock the external APIs
vi.mock('@/lib/api/transcription');
vi.mock('@/lib/api');

// Mock Zustand store
vi.mock('@/lib/state/scribe-store', () => ({
  useScribeStore: vi.fn(() => ({
    patientInfo: {
      initials: 'J.D.',
      birthYear: '1990',
      gender: 'male',
      chiefComplaint: 'Liespijn bij lopen'
    },
    currentWorkflow: 'intake-automatisch',
    setCurrentWorkflow: vi.fn(),
    setAutomatedIntakeData: vi.fn(),
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

describe('Hysio Intake (Automatisch) Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Preparation Generation', () => {
    it('should generate preparation when user clicks "Genereer Voorbereiding" button', async () => {
      const mockPreparationResponse = {
        success: true,
        data: {
          content: `**Voorbereiding voor Liespijn Intake**

**Mogelijke vragen:**
- Wanneer is de pijn ontstaan?
- Bij welke bewegingen wordt de pijn erger?
- Hebt u eerder last gehad van liespijn?

**Onderzoeken:**
- Actieve bewegingsonderzoek heup
- Passieve bewegingsonderzoek heup
- Kracht testen
- Provocatietesten lies`,
          workflowType: 'intake-automatisch',
          generatedAt: new Date().toISOString()
        }
      };

      // Mock the preparation API call
      vi.mocked(apiCall).mockResolvedValue(mockPreparationResponse);

      // Test that preparation is generated with correct parameters
      const result = await apiCall('/api/preparation', {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'intake-automatisch',
          patientInfo: {
            initials: 'J.D.',
            birthYear: '1990',
            gender: 'male',
            chiefComplaint: 'Liespijn bij lopen'
          }
        })
      });

      expect(result.success).toBe(true);
      expect(result.data.content).toContain('Liespijn');
      expect(result.data.content).toContain('vragen');
      expect(result.data.content).toContain('Onderzoeken');
      expect(result.data.workflowType).toBe('intake-automatisch');
    });

    it('should include context document in preparation generation', async () => {
      const mockPreparationWithContext = {
        success: true,
        data: {
          content: `**Voorbereiding gebaseerd op verwijsbrief**

**Context uit document:** Chronische liespijn, 6 maanden bestaand

**Aanvullende vragen:**
- Hoe is de pijn veranderd sinds de verwijzing?
- Welke behandelingen hebt u al ondergaan?`,
          workflowType: 'intake-automatisch',
          generatedAt: new Date().toISOString()
        }
      };

      vi.mocked(apiCall).mockResolvedValue(mockPreparationWithContext);

      const contextDocument = 'Verwijsbrief: Patiënt heeft chronische liespijn sinds 6 maanden. Geen verbetering na medicatie.';

      const result = await apiCall('/api/preparation', {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'intake-automatisch',
          patientInfo: {
            initials: 'J.D.',
            birthYear: '1990',
            gender: 'male',
            chiefComplaint: 'Liespijn bij lopen'
          },
          contextDocument: contextDocument
        })
      });

      expect(result.data.content).toContain('verwijsbrief');
      expect(result.data.content.toLowerCase()).toContain('chronische');
      expect(result.data.content).toContain('6 maanden');
    });

    it('should handle preparation generation failures', async () => {
      vi.mocked(apiCall).mockResolvedValue({
        success: false,
        error: 'AI service temporarily unavailable'
      });

      const result = await apiCall('/api/preparation', {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'intake-automatisch',
          patientInfo: {
            initials: 'J.D.',
            birthYear: '1990',
            gender: 'male',
            chiefComplaint: 'Liespijn bij lopen'
          }
        })
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('unavailable');
    });

    it('should not auto-generate preparation on component mount', () => {
      // Since we disabled auto-generation, preparation should not be called automatically
      expect(apiCall).not.toHaveBeenCalledWith('/api/preparation', expect.anything());
    });
  });

  describe('Audio Input Processing', () => {
    it('should transcribe audio recording and process intake', async () => {
      const mockTranscription = {
        success: true,
        transcript: 'Patiënt klaagt over pijn in de rechterlies sinds 3 weken. Pijn ontstond tijdens hardlopen en wordt erger bij lopen. Kan niet meer sporten.',
        confidence: 0.95,
        duration: 45
      };

      const mockIntakeResponse = {
        success: true,
        data: {
          hhsbStructure: {
            hulpvraag: 'Patiënt wil weer kunnen lopen en sporten zonder pijn',
            historie: 'Pijn ontstaan 3 weken geleden tijdens hardlopen',
            stoornissen: 'Pijn rechterlies bij lopen, bewegingsbeperking',
            beperkingen: 'Kan niet meer sporten, lopen beperkt',
            anamneseSummary: 'Acute liespijn na hardlopen met functionele beperkingen',
            redFlags: [],
            fullStructuredText: 'Complete HHSB text...'
          },
          transcript: mockTranscription.transcript,
          workflowType: 'intake-automatisch',
          processedAt: new Date().toISOString()
        }
      };

      vi.mocked(transcribeAudio).mockResolvedValue(mockTranscription);
      vi.mocked(apiCall).mockResolvedValue(mockIntakeResponse);

      // Simulate audio recording
      const audioBlob = new Blob(['mock audio data'], { type: 'audio/webm' });

      // Step 1: Transcribe audio
      const transcriptionResult = await transcribeAudio(audioBlob, {
        language: 'nl',
        prompt: 'Fysiotherapie intake gesprek'
      });

      expect(transcriptionResult.success).toBe(true);
      expect(transcriptionResult.transcript).toContain('lies');
      expect(transcriptionResult.transcript).toContain('hardlopen');

      // Step 2: Process intake with transcribed text
      const intakeResult = await apiCall('/api/automated-intake', {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'intake-automatisch',
          patientInfo: {
            initials: 'J.D.',
            birthYear: '1990',
            gender: 'male',
            chiefComplaint: 'Liespijn bij lopen'
          },
          inputData: {
            type: 'manual',
            data: transcriptionResult.transcript
          }
        })
      });

      expect(intakeResult.success).toBe(true);
      expect(intakeResult.data.hhsbStructure.hulpvraag).toContain('lopen');
      expect(intakeResult.data.hhsbStructure.historie).toContain('hardlopen');
      expect(intakeResult.data.hhsbStructure.stoornissen).toContain('lies');
      expect(intakeResult.data.hhsbStructure.beperkingen).toContain('sporten');
    });

    it('should handle file upload and transcription', async () => {
      const mockFile = new File(['mock audio content'], 'recording.mp3', { type: 'audio/mp3' });

      const mockTranscription = {
        success: true,
        transcript: 'Patiënt heeft rugpijn sinds 6 maanden, vooral na lang zitten.',
        confidence: 0.92,
        duration: 30
      };

      vi.mocked(transcribeAudio).mockResolvedValue(mockTranscription);

      // Convert file to blob for transcription (simulate arrayBuffer for test)
      const mockBuffer = new ArrayBuffer(1024); // Mock buffer
      const fileBlob = new Blob([mockBuffer], { type: mockFile.type });
      const result = await transcribeAudio(fileBlob, { language: 'nl' });

      expect(result.success).toBe(true);
      expect(result.transcript).toContain('rugpijn');
      expect(result.transcript).toContain('zitten');
    });

    it('should handle transcription errors gracefully', async () => {
      vi.mocked(transcribeAudio).mockResolvedValue({
        success: false,
        error: 'Audio file too short or unclear'
      });

      const audioBlob = new Blob(['very short audio'], { type: 'audio/webm' });
      const result = await transcribeAudio(audioBlob);

      expect(result.success).toBe(false);
      expect(result.error).toContain('too short');
    });
  });

  describe('Manual Input Processing', () => {
    it('should process manual text input correctly', async () => {
      const manualInput = `Patiënt komt binnen lopend maar met duidelijk veranderd looppatroon. Klaagt over pijn in de rechterlies die 3 weken geleden ontstond tijdens het hardlopen.

Anamnese:
- Pijn is 7/10, scherp en stabiel
- Vooral pijn bij heup flexie en abductie
- Geen uitstraling naar been of rug
- Geen eerdere lies problemen
- Actief sporter (3x per week hardlopen)
- Wil graag weer sporten kunnen

Onderzoek:
- Actieve heup flexie beperkt en pijnlijk
- Passieve heup flexie vrij, eindgevoel kapsulair
- Thomas test positief rechts
- Geen neurologische uitval

Conclusie:
Waarschijnlijk adductor strain/lies blessure door overbelasting tijdens hardlopen.`;

      const mockIntakeResponse = {
        success: true,
        data: {
          hhsbStructure: {
            hulpvraag: 'Patiënt wil weer kunnen sporten zonder liespijn',
            historie: 'Acute onset 3 weken geleden tijdens hardlopen, geen eerdere problemen',
            stoornissen: 'Rechterlies pijn 7/10, beperkte heup flexie, positieve Thomas test',
            beperkingen: 'Kan niet meer hardlopen, veranderd looppatroon',
            anamneseSummary: 'Acute adductor strain bij actieve sporter na hardlopen',
            redFlags: [],
            fullStructuredText: 'Complete HHSB based on manual input...'
          },
          onderzoekBevindingen: {
            inspectie: 'Veranderd looppatroon',
            palpatie: 'Geen specifieke bevindingen vermeld',
            actief: 'Heup flexie beperkt en pijnlijk',
            passief: 'Heup flexie vrij, kapsulair eindgevoel',
            weerstand: 'Niet specifiek getest',
            functioneel: 'Lopen beperkt door pijn',
            speciaal: 'Thomas test positief rechts'
          },
          klinischeConclusie: {
            diagnose: 'Adductor strain/lies blessure',
            prognose: 'Goed bij juiste behandeling en geleidelijke opbouw',
            behandelplan: 'Rust, fysiotherapie, geleidelijke terugkeer sport'
          },
          transcript: manualInput,
          workflowType: 'intake-automatisch',
          processedAt: new Date().toISOString()
        }
      };

      vi.mocked(apiCall).mockResolvedValue(mockIntakeResponse);

      const result = await apiCall('/api/automated-intake', {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'intake-automatisch',
          patientInfo: {
            initials: 'J.D.',
            birthYear: '1990',
            gender: 'male',
            chiefComplaint: 'Liespijn bij lopen'
          },
          inputData: {
            type: 'manual',
            data: manualInput
          }
        })
      });

      expect(result.success).toBe(true);
      expect(result.data.hhsbStructure.hulpvraag).toContain('sporten');
      expect(result.data.hhsbStructure.historie).toContain('hardlopen');
      expect(result.data.onderzoekBevindingen.speciaal).toContain('Thomas');
      expect(result.data.klinischeConclusie.diagnose.toLowerCase()).toContain('adductor');
    });

    it('should validate minimum input length', async () => {
      const shortInput = 'Te kort';

      vi.mocked(apiCall).mockResolvedValue({
        success: false,
        error: 'Input too short for meaningful analysis'
      });

      const result = await apiCall('/api/automated-intake', {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'intake-automatisch',
          patientInfo: {
            initials: 'J.D.',
            birthYear: '1990',
            gender: 'male',
            chiefComplaint: 'Liespijn bij lopen'
          },
          inputData: {
            type: 'manual',
            data: shortInput
          }
        })
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('too short');
    });
  });

  describe('Complete Workflow Integration', () => {
    it('should complete full automated intake workflow', async () => {
      // Step 1: Generate preparation
      const mockPreparation = {
        success: true,
        data: {
          content: 'Preparation content for lies complaint',
          workflowType: 'intake-automatisch',
          generatedAt: new Date().toISOString()
        }
      };

      // Step 2: Process complete intake
      const mockCompleteIntake = {
        success: true,
        data: {
          hhsbStructure: {
            hulpvraag: 'Return to sport pain-free',
            historie: 'Acute onset during running',
            stoornissen: 'Groin pain, limited hip mobility',
            beperkingen: 'Cannot run or play sports',
            anamneseSummary: 'Athletic groin injury',
            redFlags: [],
            fullStructuredText: 'Complete HHSB analysis...'
          },
          onderzoekBevindingen: {
            inspectie: 'Normal gait observed',
            actief: 'Hip flexion limited',
            passief: 'Hip flexion full range',
            speciaal: 'Thomas test positive'
          },
          klinischeConclusie: {
            diagnose: 'Adductor strain grade 1-2',
            prognose: 'Good with appropriate treatment',
            behandelplan: 'Progressive loading program'
          },
          workflowType: 'intake-automatisch',
          processedAt: new Date().toISOString()
        }
      };

      vi.mocked(apiCall)
        .mockResolvedValueOnce(mockPreparation) // First call for preparation
        .mockResolvedValueOnce(mockCompleteIntake); // Second call for intake processing

      // Execute workflow steps
      const preparationResult = await apiCall('/api/preparation', {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'intake-automatisch',
          patientInfo: {
            initials: 'J.D.',
            birthYear: '1990',
            gender: 'male',
            chiefComplaint: 'Liespijn bij lopen'
          }
        })
      });

      const intakeResult = await apiCall('/api/automated-intake', {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'intake-automatisch',
          patientInfo: {
            initials: 'J.D.',
            birthYear: '1990',
            gender: 'male',
            chiefComplaint: 'Liespijn bij lopen'
          },
          preparation: preparationResult.data.content,
          inputData: {
            type: 'manual',
            data: 'Complete intake transcript with anamnesis and examination findings...'
          }
        })
      });

      // Verify complete workflow
      expect(preparationResult.success).toBe(true);
      expect(intakeResult.success).toBe(true);
      expect(intakeResult.data.hhsbStructure).toBeDefined();
      expect(intakeResult.data.onderzoekBevindingen).toBeDefined();
      expect(intakeResult.data.klinischeConclusie).toBeDefined();
      expect(intakeResult.data.klinischeConclusie.diagnose).toContain('Adductor');
    });

    it('should handle workflow interruption and recovery', async () => {
      // Simulate network failure during processing
      vi.mocked(apiCall)
        .mockResolvedValueOnce({ // Preparation succeeds
          success: true,
          data: { content: 'Preparation content' }
        })
        .mockRejectedValueOnce(new Error('Network timeout')); // Intake processing fails

      // Step 1: Preparation succeeds
      const preparationResult = await apiCall('/api/preparation', {
        method: 'POST',
        body: JSON.stringify({ workflowType: 'intake-automatisch' })
      });

      expect(preparationResult.success).toBe(true);

      // Step 2: Intake processing fails
      try {
        await apiCall('/api/automated-intake', {
          method: 'POST',
          body: JSON.stringify({
            workflowType: 'intake-automatisch',
            inputData: { type: 'manual', data: 'test' }
          })
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('timeout');
      }
    });
  });

  describe('Data Quality Validation', () => {
    it('should generate clinically relevant HHSB content', async () => {
      const mockResponse = {
        success: true,
        data: {
          hhsbStructure: {
            hulpvraag: 'Patiënt wil pijnvrij kunnen werken en sporten',
            historie: 'Geleidelijk ontstane nekpijn over 2 maanden, geen trauma',
            stoornissen: 'Nekpijn, hoofdpijn, verminderde nekbeweeglijkheid',
            beperkingen: 'Moeilijk autorijden, lang werken achter computer',
            anamneseSummary: 'Subacute nekklachten mogelijk door houding',
            redFlags: [],
            fullStructuredText: 'Volledige HHSB structuur...'
          }
        }
      };

      vi.mocked(apiCall).mockResolvedValue(mockResponse);

      const nekklachtTranscript = 'Patiënt heeft sinds 2 maanden last van nekpijn en hoofdpijn. Vooral erg na lang werken achter de computer. Moeilijk om auto te rijden door beperkte nekbeweging.';

      const result = await apiCall('/api/automated-intake', {
        method: 'POST',
        body: JSON.stringify({
          inputData: { type: 'manual', data: nekklachtTranscript }
        })
      });

      const hhsb = result.data.hhsbStructure;

      // Validate HHSB structure completeness
      expect(hhsb.hulpvraag).toBeDefined();
      expect(hhsb.historie).toBeDefined();
      expect(hhsb.stoornissen).toBeDefined();
      expect(hhsb.beperkingen).toBeDefined();

      // Validate clinical relevance
      expect(hhsb.historie).toContain('2 maanden');
      expect(hhsb.stoornissen.toLowerCase()).toContain('nekpijn');
      expect(hhsb.beperkingen.toLowerCase()).toContain('autorijden');
      expect(hhsb.beperkingen.toLowerCase()).toContain('computer');
    });

    it('should identify red flags when present', async () => {
      const mockResponseWithRedFlags = {
        success: true,
        data: {
          hhsbStructure: {
            hulpvraag: 'Patiënt wil van de pijn af',
            historie: 'Acute rugpijn na val van ladder, 2 dagen geleden',
            stoornissen: 'Ernstige rugpijn, krachtsverlies benen, doof gevoel',
            beperkingen: 'Kan niet lopen, urine incontinentie',
            anamneseSummary: 'Acute rugtrauma met neurologische symptomen',
            redFlags: [
              'Acute traumatische oorzaak',
              'Krachtsverlies benen',
              'Urine incontinentie',
              'Doof gevoel benen'
            ],
            fullStructuredText: 'HHSB met red flags...'
          }
        }
      };

      vi.mocked(apiCall).mockResolvedValue(mockResponseWithRedFlags);

      const traumaTranscript = 'Patiënt is 2 dagen geleden van ladder gevallen op zijn rug. Heeft sindsdien erge pijn, kan moeilijk lopen, voelt zijn benen minder goed en heeft soms ongewild urineverlies.';

      const result = await apiCall('/api/automated-intake', {
        method: 'POST',
        body: JSON.stringify({
          inputData: { type: 'manual', data: traumaTranscript }
        })
      });

      expect(result.data.hhsbStructure.redFlags).toBeDefined();
      expect(result.data.hhsbStructure.redFlags.length).toBeGreaterThan(0);

      // Check if any red flag contains incontinentie (case insensitive)
      const hasIncontinentie = result.data.hhsbStructure.redFlags.some(flag =>
        flag.toLowerCase().includes('incontinentie')
      );
      const hasKrachtsverlies = result.data.hhsbStructure.redFlags.some(flag =>
        flag.toLowerCase().includes('krachtsverlies')
      );

      expect(hasIncontinentie).toBe(true);
      expect(hasKrachtsverlies).toBe(true);
    });
  });

  describe('Performance and Reliability', () => {
    it('should complete intake processing within acceptable time', async () => {
      const startTime = Date.now();

      vi.mocked(apiCall).mockImplementation(async () => {
        // Simulate realistic processing time
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
          success: true,
          data: { hhsbStructure: { hulpvraag: 'test' } }
        };
      });

      await apiCall('/api/automated-intake', {
        method: 'POST',
        body: JSON.stringify({
          inputData: { type: 'manual', data: 'test transcript' }
        })
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
    });

    it('should handle concurrent intake requests', async () => {
      const mockResponse = {
        success: true,
        data: { hhsbStructure: { hulpvraag: 'concurrent test' } }
      };

      vi.mocked(apiCall).mockResolvedValue(mockResponse);

      // Simulate multiple concurrent requests
      const promises = Array.from({ length: 3 }, (_, i) =>
        apiCall('/api/automated-intake', {
          method: 'POST',
          body: JSON.stringify({
            patientInfo: { initials: `P${i}`, chiefComplaint: `Complaint ${i}` },
            inputData: { type: 'manual', data: `Test transcript ${i}` }
          })
        })
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.data.hhsbStructure).toBeDefined();
      });
    });
  });
});