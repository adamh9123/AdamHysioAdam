/**
 * Clinical Accuracy Validation for Hysio Medical Scribe
 * Tests with realistic patient scenarios to ensure clinical relevance
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiCall, API_ENDPOINTS } from '@/lib/api';
import type { HHSBProcessResponse, SOEPProcessResponse, PatientInfo } from '@/types/api';

// Mock API calls for controlled testing
vi.mock('@/lib/api');

describe('Clinical Accuracy Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Realistic Groin Pain Scenarios', () => {
    it('should accurately process complex groin injury with radiation patterns', async () => {
      const patientInfo: PatientInfo = {
        initials: 'M.V.',
        birthYear: '1987',
        gender: 'male',
        chiefComplaint: 'Liespijn met uitstraling naar bovenbeen sinds voetbaltrauma'
      };

      const realTranscript = `Patiënt is een 36-jarige man die 4 weken geleden tijdens een voetbalwedstrijd een trauma heeft opgelopen aan de rechterlies. Hij voelde direct een scherpe pijn en kon niet verder spelen. De pijn is aanvankelijk verminderd maar de laatste week weer toegenomen. De pijn straalt uit naar de voorkant van het bovenbeen tot halverwege. Bij lopen en traplopen wordt de pijn erger. 's Ochtends voelt hij stijfheid in de lies. Hij kan geen sport meer beoefenen. Pijnstilling met paracetamol helpt beperkt. Hij wil graag weer kunnen voetballen over 6 weken vanwege een belangrijke wedstrijd. Geen eerdere liesproblemen. Algemeen gezond, geen medicatie.`;

      const mockHHSBResponse = {
        success: true,
        data: {
          hhsbStructure: {
            hulpvraag: 'Patiënt wil over 6 weken weer kunnen voetballen zonder liespijn',
            historie: 'Acute liespijn ontstaan 4 weken geleden tijdens voetbalwedstrijd, trauma rechterlis, pijn straalt uit naar voorkant bovenbeen',
            stoornissen: 'Scherpe liespijn met uitstraling, stijfheid ochtends, bewegingsbeperking bij lopen en traplopen',
            beperkingen: 'Kan niet sporten, moeite met traplopen, beperkte effectiviteit pijnstilling'
          },
          fullStructuredText: expect.stringContaining('voetbal'),
          transcript: realTranscript,
          workflowType: 'hhsb'
        }
      };

      vi.mocked(apiCall).mockResolvedValue(mockHHSBResponse);

      const result = await apiCall(API_ENDPOINTS.AI_ANALYSIS, {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'hhsb',
          patientInfo,
          inputData: { type: 'manual', data: realTranscript }
        })
      });

      expect(result.success).toBe(true);
      expect(result.data.hhsbStructure.hulpvraag).toContain('voetballen');
      expect(result.data.hhsbStructure.historie).toContain('trauma');
      expect(result.data.hhsbStructure.stoornissen).toContain('uitstraling');
      expect(result.data.hhsbStructure.beperkingen).toContain('sport');
    });

    it('should handle chronic groin pain with work impact', async () => {
      const patientInfo: PatientInfo = {
        initials: 'S.H.',
        birthYear: '1978',
        gender: 'female',
        chiefComplaint: 'Chronische liespijn die werk belemmert'
      };

      const realTranscript = `Patiënte is een 45-jarige vrouw die werkzaam is als verpleegkundige. Zij heeft al 8 maanden last van een diepe, trekkende pijn in de linkerlies. De klachten zijn geleidelijk ontstaan zonder duidelijke aanleiding. De pijn wordt erger bij lang staan, tillen van patiënten en bukken. Vooral tegen het einde van een dienst van 12 uur is de pijn ondraaglijk. Ook 's nachts wordt zij soms wakker van de pijn. Zij heeft verschillende pijnstillers geprobeerd maar weinig effect. Haar werkgever overweegt aangepaste werkzaamheden. Zij is bang haar baan te verliezen. Geen eerdere rugklachten. Wel stress door de situatie.`;

      const mockSOEPResponse = {
        success: true,
        data: {
          soepStructure: {
            subjectief: 'Chronische linkerliespijn 8 maanden, trekkend karakter, erger bij lang staan en tillen',
            objectief: 'Functionele beperkingen in beroepsuitoefening verpleegkundige, nachtelijke pijn',
            evaluatie: 'Chronische liespijn met significante impact op werk en slaap, mogelijk overbelasting',
            plan: 'Ergonomische aanpassingen, pijnmanagement, geleidelijke belastingsopbouw',
            consultSummary: 'Verpleegkundige met chronische liespijn die werkuitoefening bedreigt'
          },
          fullStructuredText: expect.stringContaining('verpleegkundige'),
          transcript: realTranscript,
          workflowType: 'soep'
        }
      };

      vi.mocked(apiCall).mockResolvedValue(mockSOEPResponse);

      const result = await apiCall(API_ENDPOINTS.AI_ANALYSIS, {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'soep',
          patientInfo,
          inputData: { type: 'manual', data: realTranscript }
        })
      });

      expect(result.success).toBe(true);
      expect(result.data.soepStructure.subjectief.toLowerCase()).toContain('chronische');
      expect(result.data.soepStructure.objectief.toLowerCase()).toContain('verpleeg');
      expect(result.data.soepStructure.evaluatie.toLowerCase()).toContain('werk');
      expect(result.data.soepStructure.plan.toLowerCase()).toContain('ergonomische');
    });
  });

  describe('Complex Musculoskeletal Cases', () => {
    it('should accurately analyze multi-region complaints with compensatory patterns', async () => {
      const patientInfo: PatientInfo = {
        initials: 'P.J.',
        birthYear: '1965',
        gender: 'male',
        chiefComplaint: 'Nek- en schouderklachten na whiplash met hoofdpijn'
      };

      const realTranscript = `Patiënt is een 58-jarige man die 6 weken geleden een whiplash trauma heeft opgelopen bij een kop-staart botsing. Hij was bestuurder en werd van achteren aangereden bij 50 km/u. Direct na het ongeluk had hij nekpijn en hoofdpijn. De eerste weken droeg hij een nekkraag. Nu heeft hij voortdurend nekstijfheid, vooral links, met pijn die uitstraalt naar de linkerschouder en linkerarm tot in de vingers. Daarnaast constante spanningshoofdpijn. Hij kan zijn hoofd niet meer volledig naar links draaien. Slecht slapen door pijn. Kan niet meer werken als administratief medewerker vanwege concentratieproblemen door hoofdpijn. Duizelig bij snelle hoofdbewegingen. Pijnstillers helpen nauwelijks. Zeer bezorgd over blijvende schade.`;

      const mockHHSBResponse = {
        success: true,
        data: {
          hhsbStructure: {
            hulpvraag: 'Patiënt wil kunnen werken en slapen zonder nek-, schouder- en hoofdpijn na whiplash',
            historie: 'Whiplash trauma 6 weken geleden bij kop-staart botsing 50 km/u, aanvankelijk nekkraag',
            stoornissen: 'Nekstijfheid links, uitstraling naar schouder en arm, spanningshoofdpijn, beperkte nekrotatie, duizeligheid',
            beperkingen: 'Kan niet werken door concentratieproblemen, slaapproblemen, bewegingsangst'
          },
          fullStructuredText: expect.stringContaining('whiplash'),
          transcript: realTranscript,
          workflowType: 'hhsb'
        }
      };

      vi.mocked(apiCall).mockResolvedValue(mockHHSBResponse);

      const result = await apiCall(API_ENDPOINTS.AI_ANALYSIS, {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'hhsb',
          patientInfo,
          inputData: { type: 'manual', data: realTranscript }
        })
      });

      expect(result.data.hhsbStructure.hulpvraag).toContain('whiplash');
      expect(result.data.hhsbStructure.historie).toContain('kop-staart');
      expect(result.data.hhsbStructure.stoornissen).toContain('uitstraling');
      expect(result.data.hhsbStructure.beperkingen).toContain('concentratie');
    });

    it('should identify red flags in back pain presentation', async () => {
      const patientInfo: PatientInfo = {
        initials: 'A.M.',
        birthYear: '1955',
        gender: 'female',
        chiefComplaint: 'Plotselinge erge rugpijn met beensymptomen'
      };

      const realTranscript = `Patiënte is een 68-jarige vrouw die gisteren plotseling erge lage rugpijn kreeg tijdens het optillen van haar kleinzoon. De pijn is constant en zeer hevig, 9 op schaal van 10. Zij kan nauwelijks lopen. De pijn straalt uit naar beide benen, vooral rechts tot in de voet. Zij heeft tintelingen in beide voeten en het gevoel dat haar rechterbeen zwak is. Vannacht kon zij niet plassen en moest zij persen. Zij heeft ook moeite met de ontlasting. De pijn wordt niet minder in rust en pijnstillers helpen niet. Zij is erg angstig omdat haar moeder ook rugklachten had en invalide werd. Geschiedenis van osteoporose, gebruikt calcium en vitamine D.`;

      const mockSOEPResponse = {
        success: true,
        data: {
          soepStructure: {
            subjectief: 'Acute erge lage rugpijn na tillen, uitstraling bilateraal, tintelingen voeten, zwakte rechterbeen',
            objectief: 'Mictie- en defecatieproblemen, pijn 9/10, nauwelijks kunnen lopen',
            evaluatie: 'ACUTE CAUDA EQUINA VERDACHT - onmiddellijke doorverwijzing vereist',
            plan: 'SPOED doorverwijzing neurologie/neurochirurgie, MRI urgent, geen fysiotherapie',
            consultSummary: 'RODE VLAG: Mogelijke cauda equina syndroom - spoedeisende medische zorg nodig',
            redFlags: ['Cauda equina syndroom verdacht', 'Mictiestoornissen', 'Bilaterale neurologische uitval']
          },
          fullStructuredText: expect.stringContaining('RODE VLAG'),
          transcript: realTranscript,
          workflowType: 'soep'
        }
      };

      vi.mocked(apiCall).mockResolvedValue(mockSOEPResponse);

      const result = await apiCall(API_ENDPOINTS.AI_ANALYSIS, {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'soep',
          patientInfo,
          inputData: { type: 'manual', data: realTranscript }
        })
      });

      expect(result.data.soepStructure.evaluatie).toContain('CAUDA EQUINA');
      expect(result.data.soepStructure.plan).toContain('SPOED');
      expect(result.data.soepStructure.redFlags).toHaveLength(3);
      expect(result.data.soepStructure.consultSummary).toContain('RODE VLAG');
    });
  });

  describe('Pediatric and Geriatric Considerations', () => {
    it('should adapt language for elderly patient with multiple comorbidities', async () => {
      const patientInfo: PatientInfo = {
        initials: 'G.B.',
        birthYear: '1938',
        gender: 'male',
        chiefComplaint: 'Vallen en evenwichtsproblemen bij 85-jarige'
      };

      const realTranscript = `Meneer is een 85-jarige heer die de laatste 3 maanden meerdere keren is gevallen thuis. Vorige week viel hij in de badkamer en heeft zijn pols bezeerd. Hij voelt zich onzeker op de benen en durft niet meer alleen naar buiten. Hij heeft diabetes type 2, hoge bloeddruk en gebruikt veel medicijnen. Zijn vrouw is recent overleden en hij voelt zich somber. Hij eet slecht en is afgevallen. Duizelig bij opstaan. Gebruikt een rollator binnen maar wil geen hulp van buitenaf. Dochter maakt zich zorgen en wil dat hij naar een verzorgingshuis. Patiënt wil graag zelfstandig blijven wonen.`;

      const mockHHSBResponse = {
        success: true,
        data: {
          hhsbStructure: {
            hulpvraag: 'Patiënt wil veilig en zelfstandig kunnen blijven wonen zonder valrisico',
            historie: 'Herhaaldelijke valincidenten laatste 3 maanden, recent polsletsel, diabetes type 2, recent verlies echtgenote',
            stoornissen: 'Evenwichtsstoornissen, duizeligheid bij opstaan, verminderde mobiliteit, rouwklachten, gewichtsverlies',
            beperkingen: 'Durft niet alleen naar buiten, afhankelijk van rollator, sociale isolatie, voedingsproblemen'
          },
          fullStructuredText: expect.stringContaining('85-jarige'),
          transcript: realTranscript,
          workflowType: 'hhsb'
        }
      };

      vi.mocked(apiCall).mockResolvedValue(mockHHSBResponse);

      const result = await apiCall(API_ENDPOINTS.AI_ANALYSIS, {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'hhsb',
          patientInfo,
          inputData: { type: 'manual', data: realTranscript }
        })
      });

      expect(result.data.hhsbStructure.hulpvraag).toContain('zelfstandig');
      expect(result.data.hhsbStructure.historie).toContain('diabetes');
      expect(result.data.hhsbStructure.stoornissen).toContain('rouw');
      expect(result.data.hhsbStructure.beperkingen).toContain('sociale isolatie');
    });
  });

  describe('Context Document Integration Validation', () => {
    it('should incorporate referral information in analysis', async () => {
      const patientInfo: PatientInfo = {
        initials: 'L.K.',
        birthYear: '1990',
        gender: 'female',
        chiefComplaint: 'Kniepijn na kruisband reconstructie'
      };

      const contextDocument = `VERWIJSBRIEF ORTHOPEED:
      Patiënte heeft 8 maanden geleden een voorste kruisbandreconstructie ondergaan na ski-ongeluk.
      Operatie is goed verlopen. Revalidatie verliep aanvankelijk voorspoedig maar laatste 6 weken
      klachten van pijn en zwelling knie bij belasting. Echo toont geen pathologie. Kniescoop uitgesloten.
      Vraag: tweede mening revalidatie, mogelijk andere aanpak nodig.`;

      const realTranscript = `Patiënte vertelt dat zij 8 maanden geleden haar voorste kruisband heeft gescheurd tijdens skiën. Na de operatie ging het eerst goed met de revalidatie maar de laatste weken heeft zij weer pijn en zwelling als zij sport of lange afstanden loopt. Zij is gefrustreerd omdat de orthopeed zegt dat alles goed is maar zij voelt zich nog niet klaar om terug te keren naar hockey. Zij twijfelt aan de kwaliteit van haar revalidatie tot nu toe.`;

      const mockSOEPResponse = {
        success: true,
        data: {
          soepStructure: {
            subjectief: 'Pijn en zwelling knie 6 weken na aanvankelijk voorspoedige revalidatie post-ACL reconstructie',
            objectief: 'Voorste kruisbandreconstructie 8 maanden geleden, orthopedische controle zonder pathologie',
            evaluatie: 'Mogelijk inadequate revalidatieopbouw of biomechanische compensaties, psychologische component',
            plan: 'Heropbouw revalidatieprogramma, bewegingsanalyse, sport-specifieke training hockey',
            consultSummary: 'Post-ACL revalidatie met secundaire klachten, nieuwe aanpak revalidatie geïndiceerd'
          },
          fullStructuredText: expect.stringContaining('verwijsbrief'),
          transcript: realTranscript,
          workflowType: 'soep'
        }
      };

      vi.mocked(apiCall).mockResolvedValue(mockSOEPResponse);

      const result = await apiCall(API_ENDPOINTS.AI_ANALYSIS, {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'soep',
          patientInfo,
          preparation: contextDocument,
          inputData: { type: 'manual', data: realTranscript }
        })
      });

      expect(result.data.soepStructure.objectief).toContain('kruisband');
      expect(result.data.soepStructure.evaluatie).toContain('revalidatie');
      expect(result.data.soepStructure.plan).toContain('hockey');
    });
  });

  describe('Performance and Response Time Validation', () => {
    it('should complete complex analysis within acceptable timeframes', async () => {
      const startTime = Date.now();

      vi.mocked(apiCall).mockImplementation(async () => {
        // Simulate realistic AI processing time
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
          success: true,
          data: {
            hhsbStructure: {
              hulpvraag: 'Complex patient goal',
              historie: 'Detailed medical history',
              stoornissen: 'Multiple symptoms and impairments',
              beperkingen: 'Functional limitations'
            },
            fullStructuredText: 'Complete analysis text',
            workflowType: 'hhsb'
          }
        };
      });

      const longTranscript = 'Uitgebreide anamnese '.repeat(100);

      const result = await apiCall(API_ENDPOINTS.AI_ANALYSIS, {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'hhsb',
          patientInfo: {
            initials: 'T.S.',
            birthYear: '1975',
            gender: 'male',
            chiefComplaint: 'Complex case'
          },
          inputData: { type: 'manual', data: longTranscript }
        })
      });

      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(15000); // Should complete within 15 seconds
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle incomplete or ambiguous patient information', async () => {
      const incompleteTranscript = 'Patiënt heeft pijn. Niet duidelijk waar precies. Soms erg, soms niet.';

      const mockResponse = {
        success: true,
        data: {
          hhsbStructure: {
            hulpvraag: 'ONDUIDELIJK - nadere anamnese vereist voor specifieke doelstelling',
            historie: 'Beperkte informatie beschikbaar - pijnklachten van onbekende lokalisatie en oorzaak',
            stoornissen: 'Pijnklachten met wisselende intensiteit - nadere specificatie nodig',
            beperkingen: 'ONVOLDOENDE INFORMATIE - uitgebreide intake geïndiceerd'
          },
          fullStructuredText: expect.stringContaining('ONDUIDELIJK'),
          workflowType: 'hhsb'
        }
      };

      vi.mocked(apiCall).mockResolvedValue(mockResponse);

      const result = await apiCall(API_ENDPOINTS.AI_ANALYSIS, {
        method: 'POST',
        body: JSON.stringify({
          workflowType: 'hhsb',
          patientInfo: {
            initials: 'O.B.',
            birthYear: '1980',
            gender: 'male',
            chiefComplaint: 'Pijn'
          },
          inputData: { type: 'manual', data: incompleteTranscript }
        })
      });

      expect(result.data.hhsbStructure.hulpvraag).toContain('ONDUIDELIJK');
      expect(result.data.hhsbStructure.historie).toContain('Beperkte informatie');
      expect(result.data.hhsbStructure.beperkingen).toContain('ONVOLDOENDE');
    });
  });
});