// Session Data Parser for Hysio EduPack Module
// Extracts relevant information from SOEP notes, transcripts, and clinical data

import type { SOEPStructure, PatientInfo } from '@/lib/types';
import type { EduPackGenerationRequest } from '@/lib/types/edupack';

export interface ExtractedSessionData {
  // Patient context
  patientInfo: {
    name?: string;
    age?: number;
    condition?: string;
    complaints?: string[];
  };

  // Clinical findings
  findings: {
    symptoms: string[];
    limitations: string[];
    painLevel?: number;
    functionalStatus?: string;
  };

  // Assessment and diagnosis
  assessment: {
    primaryDiagnosis?: string;
    secondaryDiagnoses?: string[];
    clinicalReasoningv?: string;
    prognosis?: string;
  };

  // Treatment information
  treatment: {
    goals: string[];
    interventions: string[];
    exercises?: string[];
    advice: string[];
    timeline?: string;
  };

  // Session metadata
  sessionInfo: {
    type: 'intake' | 'followup';
    date: Date;
    duration?: number;
    therapistNotes?: string;
  };

  // Follow-up planning
  followUp: {
    nextAppointment?: string;
    homeExercises?: string[];
    warningSignals?: string[];
    expectations?: string;
  };
}

export class SessionDataParser {
  // Main parsing function that coordinates all extraction methods
  parseSessionData(request: EduPackGenerationRequest): ExtractedSessionData {
    const extracted: ExtractedSessionData = {
      patientInfo: {},
      findings: { symptoms: [], limitations: [] },
      assessment: { secondaryDiagnoses: [] },
      treatment: { goals: [], interventions: [], advice: [] },
      sessionInfo: { type: 'intake', date: new Date() },
      followUp: { homeExercises: [], warningSignals: [] }
    };

    // Parse from SOEP data if available
    if (request.sessionData?.soepData) {
      this.parseSOEPData(request.sessionData.soepData, extracted);
    }

    // Parse from transcript if available
    if (request.sessionData?.transcript) {
      this.parseTranscript(request.sessionData.transcript, extracted);
    }

    // Parse from patient info
    if (request.sessionData?.patientInfo) {
      this.parsePatientInfo(request.sessionData.patientInfo, extracted);
    }

    // Parse from clinical notes
    if (request.sessionData?.clinicalNotes) {
      this.parseClinicalNotes(request.sessionData.clinicalNotes, extracted);
    }

    // Parse manual input if no session data
    if (request.manualInput) {
      this.parseManualInput(request.manualInput, extracted);
    }

    // Post-process and validate
    this.validateAndCleanup(extracted);

    return extracted;
  }

  private parseSOEPData(soepData: SOEPStructure, extracted: ExtractedSessionData): void {
    // Subjective (S) - Patient's complaints and symptoms
    if (soepData.subjective) {
      const subjectiveText = typeof soepData.subjective === 'string'
        ? soepData.subjective
        : JSON.stringify(soepData.subjective);

      extracted.findings.symptoms.push(...this.extractSymptoms(subjectiveText));
      extracted.patientInfo.complaints = this.extractComplaints(subjectiveText);

      // Extract pain level if mentioned
      const painMatch = subjectiveText.match(/pijn\s*(?:niveau|schaal|score)?\s*:?\s*(\d+)(?:\/10)?/i);
      if (painMatch) {
        extracted.findings.painLevel = parseInt(painMatch[1]);
      }
    }

    // Objective (O) - Examination findings
    if (soepData.objective) {
      const objectiveText = typeof soepData.objective === 'string'
        ? soepData.objective
        : JSON.stringify(soepData.objective);

      extracted.findings.limitations.push(...this.extractLimitations(objectiveText));
      extracted.findings.functionalStatus = this.extractFunctionalStatus(objectiveText);
    }

    // Evaluation/Assessment (E) - Clinical reasoning and diagnosis
    if (soepData.evaluation) {
      const evaluationText = typeof soepData.evaluation === 'string'
        ? soepData.evaluation
        : JSON.stringify(soepData.evaluation);

      extracted.assessment.primaryDiagnosis = this.extractPrimaryDiagnosis(evaluationText);
      extracted.assessment.secondaryDiagnoses = this.extractSecondaryDiagnoses(evaluationText);
      extracted.assessment.clinicalReasoningv = this.extractClinicalReasoning(evaluationText);
      extracted.assessment.prognosis = this.extractPrognosis(evaluationText);
    }

    // Plan (P) - Treatment plan and interventions
    if (soepData.plan) {
      const planText = typeof soepData.plan === 'string'
        ? soepData.plan
        : JSON.stringify(soepData.plan);

      extracted.treatment.goals.push(...this.extractGoals(planText));
      extracted.treatment.interventions.push(...this.extractInterventions(planText));
      extracted.treatment.exercises = this.extractExercises(planText);
      extracted.treatment.advice.push(...this.extractAdvice(planText));
      extracted.treatment.timeline = this.extractTimeline(planText);

      // Extract follow-up information
      extracted.followUp.nextAppointment = this.extractNextAppointment(planText);
      extracted.followUp.homeExercises = this.extractHomeExercises(planText);
      extracted.followUp.warningSignals = this.extractWarningSignals(planText);
    }
  }

  private parseTranscript(transcript: string, extracted: ExtractedSessionData): void {
    // Clean and normalize transcript
    const cleanTranscript = transcript
      .replace(/\[.*?\]/g, '') // Remove timestamp markers
      .replace(/Speaker \d+:/g, '') // Remove speaker labels
      .toLowerCase();

    // Extract patient statements (complaints, symptoms)
    const patientStatements = this.extractPatientStatements(cleanTranscript);
    extracted.findings.symptoms.push(...this.extractSymptomsFromStatements(patientStatements));

    // Extract therapist assessments and plans
    const therapistStatements = this.extractTherapistStatements(cleanTranscript);
    extracted.treatment.interventions.push(...this.extractInterventionsFromStatements(therapistStatements));
    extracted.treatment.advice.push(...this.extractAdviceFromStatements(therapistStatements));

    // Extract mentioned exercises or home care
    extracted.followUp.homeExercises?.push(...this.extractExercisesFromTranscript(cleanTranscript));

    // Determine session type from content
    if (cleanTranscript.includes('eerste keer') || cleanTranscript.includes('nieuwe patiënt')) {
      extracted.sessionInfo.type = 'intake';
    } else if (cleanTranscript.includes('controle') || cleanTranscript.includes('vorige keer')) {
      extracted.sessionInfo.type = 'followup';
    }
  }

  private parsePatientInfo(patientInfo: PatientInfo, extracted: ExtractedSessionData): void {
    extracted.patientInfo.name = patientInfo.name;
    extracted.patientInfo.age = patientInfo.age;
    extracted.patientInfo.condition = patientInfo.condition;

    // Extract additional info if available
    if (patientInfo.medicalHistory) {
      extracted.assessment.secondaryDiagnoses?.push(...this.extractFromMedicalHistory(patientInfo.medicalHistory));
    }
  }

  private parseClinicalNotes(notes: string, extracted: ExtractedSessionData): void {
    // Extract structured information from clinical notes
    extracted.treatment.goals.push(...this.extractGoalsFromNotes(notes));
    extracted.treatment.interventions.push(...this.extractInterventionsFromNotes(notes));
    extracted.followUp.warningSignals?.push(...this.extractWarningSignalsFromNotes(notes));
  }

  private parseManualInput(manualInput: NonNullable<EduPackGenerationRequest['manualInput']>, extracted: ExtractedSessionData): void {
    // Patient information
    if (manualInput.patientInfo) {
      extracted.patientInfo = {
        name: manualInput.patientInfo.name,
        age: manualInput.patientInfo.age,
        condition: manualInput.patientInfo.condition
      };
    }

    // Session context
    if (manualInput.sessionContext) {
      extracted.sessionInfo.therapistNotes = manualInput.sessionContext;

      // Extract information from context
      extracted.findings.symptoms.push(...this.extractSymptomsFromText(manualInput.sessionContext));
      extracted.treatment.advice.push(...this.extractAdviceFromText(manualInput.sessionContext));
    }

    // Pathology
    if (manualInput.pathology) {
      extracted.assessment.primaryDiagnosis = manualInput.pathology;
    }

    // Focus areas
    if (manualInput.focusAreas) {
      extracted.treatment.goals.push(...manualInput.focusAreas);
    }
  }

  // Extraction helper methods using Dutch medical terminology patterns
  private extractSymptoms(text: string): string[] {
    const symptoms: string[] = [];
    const symptomPatterns = [
      /pijn(?:\s+(?:in|aan|bij|van))?\s+([^.,;]+)/gi,
      /(?:klacht|klachten)(?:\s+(?:over|van|bij))?\s+([^.,;]+)/gi,
      /(?:last|problemen)(?:\s+(?:van|met|bij))?\s+([^.,;]+)/gi,
      /(?:stijfheid|beperking|zwakte)(?:\s+(?:in|van|bij))?\s+([^.,;]+)/gi,
      /(?:tintelingen|gevoelloosheid|kramp)(?:\s+(?:in|van|bij))?\s+([^.,;]+)/gi
    ];

    symptomPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 2) {
          symptoms.push(match[1].trim());
        }
      }
    });

    return this.deduplicateAndClean(symptoms);
  }

  private extractComplaints(text: string): string[] {
    const complaints: string[] = [];
    const complaintPatterns = [
      /(?:hoofdklacht|primaire klacht|belangrijkste probleem):\s*([^.,;]+)/gi,
      /(?:patiënt klaagt over|meldt|geeft aan)\s+([^.,;]+)/gi,
      /(?:sinds|begonnen)\s+.*?\s+(pijn|klachten|problemen)\s+([^.,;]+)/gi
    ];

    complaintPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 2) {
          complaints.push(match[1].trim());
        }
      }
    });

    return this.deduplicateAndClean(complaints);
  }

  private extractLimitations(text: string): string[] {
    const limitations: string[] = [];
    const limitationPatterns = [
      /(?:beperkt|beperking)(?:\s+(?:in|bij|van))?\s+([^.,;]+)/gi,
      /(?:kan niet|niet mogelijk|moeite met)\s+([^.,;]+)/gi,
      /(?:verminderd|verslechterd)\s+([^.,;]+)/gi,
      /(?:range of motion|ROM|mobiliteit)\s+([^.,;]+)/gi
    ];

    limitationPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 2) {
          limitations.push(match[1].trim());
        }
      }
    });

    return this.deduplicateAndClean(limitations);
  }

  private extractPrimaryDiagnosis(text: string): string | undefined {
    const diagnosisPatterns = [
      /(?:diagnose|conclusie|bevinding):\s*([^.,;]+)/i,
      /(?:primaire diagnose|hoofddiagnose):\s*([^.,;]+)/i,
      /(?:werkdiagnose|voorlopige diagnose):\s*([^.,;]+)/i
    ];

    for (const pattern of diagnosisPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  private extractGoals(text: string): string[] {
    const goals: string[] = [];
    const goalPatterns = [
      /(?:doel|doelstelling|doelen):\s*([^.,;]+)/gi,
      /(?:streven naar|beogen|willen bereiken)\s+([^.,;]+)/gi,
      /(?:verbetering van|herstel van)\s+([^.,;]+)/gi,
      /(?:terug naar|kunnen om)\s+([^.,;]+)/gi
    ];

    goalPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 2) {
          goals.push(match[1].trim());
        }
      }
    });

    return this.deduplicateAndClean(goals);
  }

  private extractInterventions(text: string): string[] {
    const interventions: string[] = [];
    const interventionPatterns = [
      /(?:behandeling|therapie|interventie):\s*([^.,;]+)/gi,
      /(?:manuele therapie|mobilisatie|manipulatie)\s+([^.,;]*)/gi,
      /(?:oefeningen|training|revalidatie)\s+([^.,;]*)/gi,
      /(?:massage|elektrostimulatie|warmte|koude)\s+([^.,;]*)/gi
    ];

    interventionPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 2) {
          interventions.push(match[1].trim());
        } else if (match[0]) {
          interventions.push(match[0].trim());
        }
      }
    });

    return this.deduplicateAndClean(interventions);
  }

  private extractExercises(text: string): string[] {
    const exercises: string[] = [];
    const exercisePatterns = [
      /(?:oefening|oefeningen):\s*([^.,;]+)/gi,
      /(?:rekoefening|krachtoefening|stabiliteitsoefening)\s*:?\s*([^.,;]*)/gi,
      /(?:stretchen|rekken|kracht|stabiliteit)\s+([^.,;]+)/gi
    ];

    exercisePatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 2) {
          exercises.push(match[1].trim());
        }
      }
    });

    return this.deduplicateAndClean(exercises);
  }

  private extractAdvice(text: string): string[] {
    const advice: string[] = [];
    const advicePatterns = [
      /(?:advies|aanbeveling|tip):\s*([^.,;]+)/gi,
      /(?:belangrijk om|zorg ervoor dat|let op)\s+([^.,;]+)/gi,
      /(?:vermijd|voorkom|niet doen)\s+([^.,;]+)/gi,
      /(?:houding|ergonomie|werk)\s+([^.,;]+)/gi
    ];

    advicePatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 2) {
          advice.push(match[1].trim());
        }
      }
    });

    return this.deduplicateAndClean(advice);
  }

  // Helper methods for transcript parsing
  private extractPatientStatements(transcript: string): string[] {
    // Simple heuristic: lines that contain "ik", "mijn", "me"
    return transcript.split('\n').filter(line =>
      /\b(?:ik|mijn|me|mij)\b/.test(line) && line.length > 10
    );
  }

  private extractTherapistStatements(transcript: string): string[] {
    // Lines that contain professional language
    return transcript.split('\n').filter(line =>
      /\b(?:behandeling|therapie|oefening|advies|diagnose)\b/.test(line) && line.length > 10
    );
  }

  private extractSymptomsFromStatements(statements: string[]): string[] {
    const symptoms: string[] = [];
    statements.forEach(statement => {
      symptoms.push(...this.extractSymptomsFromText(statement));
    });
    return symptoms;
  }

  private extractSymptomsFromText(text: string): string[] {
    return this.extractSymptoms(text);
  }

  private extractAdviceFromText(text: string): string[] {
    return this.extractAdvice(text);
  }

  // Additional extraction methods for specific patterns
  private extractFunctionalStatus(text: string): string | undefined {
    const functionalPatterns = [
      /(?:ADL|dagelijkse activiteiten):\s*([^.,;]+)/i,
      /(?:functioneel niveau|functionele status):\s*([^.,;]+)/i
    ];

    for (const pattern of functionalPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  private extractTimeline(text: string): string | undefined {
    const timelinePatterns = [
      /(?:behandelduur|tijdsduur|verwachte duur):\s*([^.,;]+)/i,
      /(?:binnen|over|na)\s+(\d+\s*(?:weken|maanden|dagen))/i
    ];

    for (const pattern of timelinePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  private extractNextAppointment(text: string): string | undefined {
    const appointmentPatterns = [
      /(?:volgende afspraak|controle|vervolgafspraak):\s*([^.,;]+)/i,
      /(?:over|na)\s+(\d+\s*(?:weken|dagen))\s+(?:terug|controle)/i
    ];

    for (const pattern of appointmentPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  // Utility methods
  private deduplicateAndClean(items: string[]): string[] {
    return [...new Set(items)]
      .map(item => item.trim())
      .filter(item => item.length > 2)
      .slice(0, 10); // Limit to prevent overwhelming content
  }

  private validateAndCleanup(extracted: ExtractedSessionData): void {
    // Ensure we have at least basic information
    if (extracted.findings.symptoms.length === 0 && extracted.patientInfo.complaints) {
      extracted.findings.symptoms = extracted.patientInfo.complaints;
    }

    // Set default session type if not determined
    if (!extracted.sessionInfo.type) {
      extracted.sessionInfo.type = extracted.assessment.primaryDiagnosis ? 'intake' : 'followup';
    }

    // Clean up empty arrays
    Object.keys(extracted).forEach(key => {
      const value = (extracted as any)[key];
      if (typeof value === 'object' && value !== null) {
        Object.keys(value).forEach(subKey => {
          if (Array.isArray(value[subKey]) && value[subKey].length === 0) {
            delete value[subKey];
          }
        });
      }
    });
  }

  // Additional helper methods for missing implementations
  private extractSecondaryDiagnoses(text: string): string[] {
    const diagnoses: string[] = [];
    const patterns = [
      /(?:secundaire|bijkomende|additionele)\s+(?:diagnose|diagnoses):\s*([^.,;]+)/gi,
      /(?:comorbiditeit|nevenbevinding):\s*([^.,;]+)/gi
    ];

    patterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          diagnoses.push(match[1].trim());
        }
      }
    });

    return this.deduplicateAndClean(diagnoses);
  }

  private extractClinicalReasoning(text: string): string | undefined {
    const reasoningPatterns = [
      /(?:klinisch redeneren|overweging|verklaring):\s*([^.,;]+)/i,
      /(?:waarschijnlijk|mogelijk|gezien)\s+([^.,;]+)/i
    ];

    for (const pattern of reasoningPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  private extractPrognosis(text: string): string | undefined {
    const prognosisPatterns = [
      /(?:prognose|vooruitzicht|verwachting):\s*([^.,;]+)/i,
      /(?:herstelkans|verbetering)\s+([^.,;]+)/i
    ];

    for (const pattern of prognosisPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  private extractHomeExercises(text: string): string[] {
    const exercises: string[] = [];
    const patterns = [
      /(?:thuisoefening|thuisoefeningen|huiswerk):\s*([^.,;]+)/gi,
      /(?:thuis)\s+.*?(?:oefening|oefeningen)\s*([^.,;]*)/gi
    ];

    patterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 2) {
          exercises.push(match[1].trim());
        }
      }
    });

    return this.deduplicateAndClean(exercises);
  }

  private extractWarningSignals(text: string): string[] {
    const signals: string[] = [];
    const patterns = [
      /(?:waarschuwingssignaal|alarm|let op):\s*([^.,;]+)/gi,
      /(?:bij|als)\s+([^.,;]*(?:pijn|koorts|zwelling)[^.,;]*)/gi,
      /(?:contact opnemen|bellen)\s+(?:bij|als)\s+([^.,;]+)/gi
    ];

    patterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 2) {
          signals.push(match[1].trim());
        }
      }
    });

    return this.deduplicateAndClean(signals);
  }

  private extractFromMedicalHistory(history: string): string[] {
    const conditions: string[] = [];
    const patterns = [
      /(?:eerder|voorgeschiedenis|bekend met)\s+([^.,;]+)/gi,
      /(?:diagnose|aandoening|conditie)\s+([^.,;]+)/gi
    ];

    patterns.forEach(pattern => {
      const matches = history.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 2) {
          conditions.push(match[1].trim());
        }
      }
    });

    return this.deduplicateAndClean(conditions);
  }

  private extractGoalsFromNotes(notes: string): string[] {
    return this.extractGoals(notes);
  }

  private extractInterventionsFromNotes(notes: string): string[] {
    return this.extractInterventions(notes);
  }

  private extractWarningSignalsFromNotes(notes: string): string[] {
    return this.extractWarningSignals(notes);
  }

  private extractInterventionsFromStatements(statements: string[]): string[] {
    const interventions: string[] = [];
    statements.forEach(statement => {
      interventions.push(...this.extractInterventions(statement));
    });
    return interventions;
  }

  private extractAdviceFromStatements(statements: string[]): string[] {
    const advice: string[] = [];
    statements.forEach(statement => {
      advice.push(...this.extractAdvice(statement));
    });
    return advice;
  }

  private extractExercisesFromTranscript(transcript: string): string[] {
    return this.extractExercises(transcript);
  }
}

// Export singleton instance
export const sessionDataParser = new SessionDataParser();