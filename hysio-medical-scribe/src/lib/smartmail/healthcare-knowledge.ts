// Healthcare knowledge integration for SmartMail
// Provides evidence-based suggestions for follow-up actions and next steps

import type {
  CommunicationObjective,
  RecipientCategory,
  SupportedLanguage,
  SmartSuggestion
} from '@/lib/types/smartmail';

// Healthcare knowledge base for follow-up actions
export interface HealthcareGuideline {
  id: string;
  title: string;
  description: string;
  category: 'assessment' | 'treatment' | 'referral' | 'education' | 'monitoring';
  applicableObjectives: CommunicationObjective[];
  recipientTypes: RecipientCategory[];
  language: SupportedLanguage;
  urgencyLevel: 'low' | 'medium' | 'high';
  evidenceLevel: 'A' | 'B' | 'C' | 'expert';
  followUpActions: string[];
}

// Red flag conditions requiring immediate attention
export const RED_FLAG_CONDITIONS = {
  nl: [
    {
      condition: 'Cauda equina syndroom',
      symptoms: ['zadelvormige gevoelloosheid', 'blaas-/darmstoornissen', 'bilaterale beensymptomen'],
      urgency: 'immediate',
      action: 'Directe verwijzing naar spoedeisende hulp'
    },
    {
      condition: 'Fractuur verdenking',
      symptoms: ['trauma geschiedenis', 'lokale pijn bij belasten', 'zwelling', 'functieverlies'],
      urgency: 'urgent',
      action: 'Röntgendiagnostiek binnen 24 uur'
    },
    {
      condition: 'Infectie verdenking',
      symptoms: ['koorts', 'roodheid', 'warmte', 'zwelling', 'functieverlies'],
      urgency: 'urgent',
      action: 'Medische evaluatie binnen 24 uur'
    },
    {
      condition: 'Vasculaire problemen',
      symptoms: ['koude extremiteit', 'blauwe verkleuring', 'afwezige pulsaties'],
      urgency: 'urgent',
      action: 'Directe medische evaluatie'
    }
  ],
  en: [
    {
      condition: 'Cauda equina syndrome',
      symptoms: ['saddle anesthesia', 'bladder/bowel dysfunction', 'bilateral leg symptoms'],
      urgency: 'immediate',
      action: 'Immediate referral to emergency department'
    },
    {
      condition: 'Fracture suspicion',
      symptoms: ['trauma history', 'localized weight-bearing pain', 'swelling', 'loss of function'],
      urgency: 'urgent',
      action: 'X-ray within 24 hours'
    },
    {
      condition: 'Infection suspicion',
      symptoms: ['fever', 'redness', 'warmth', 'swelling', 'loss of function'],
      urgency: 'urgent',
      action: 'Medical evaluation within 24 hours'
    },
    {
      condition: 'Vascular problems',
      symptoms: ['cold extremity', 'blue discoloration', 'absent pulses'],
      urgency: 'urgent',
      action: 'Immediate medical evaluation'
    }
  ]
} as const;

// Common physiotherapy assessment guidelines
export const ASSESSMENT_GUIDELINES = {
  nl: [
    {
      category: 'bewegingsonderzoek',
      recommendations: [
        'Actief bewegingsonderzoek van alle relevante gewrichten',
        'Passief bewegingsonderzoek bij bewegingsbeperking',
        'Weerstandstest bij verdenking krachtverlies',
        'Functieonderzoek voor dagelijkse activiteiten'
      ],
      followUp: [
        'Herhaal assessment na 2-3 behandelingen',
        'Documenteer objectieve verbeteringen',
        'Pas behandeling aan op basis van bevindingen'
      ]
    },
    {
      category: 'pijnanalyse',
      recommendations: [
        'VAS/NRS score voor pijnintensiteit',
        'Locatie en uitstraling van pijn',
        'Provocerende en verlichtende factoren',
        'Pijnpatroon gedurende de dag'
      ],
      followUp: [
        'Wekelijkse pijnscore evaluatie',
        'Aanpassing pijnmanagement indien nodig',
        'Educatie over pijnbegrip en coping'
      ]
    }
  ],
  en: [
    {
      category: 'movement assessment',
      recommendations: [
        'Active range of motion testing of all relevant joints',
        'Passive range of motion testing for movement restrictions',
        'Resistance testing for suspected strength loss',
        'Functional testing for daily activities'
      ],
      followUp: [
        'Repeat assessment after 2-3 treatments',
        'Document objective improvements',
        'Adjust treatment based on findings'
      ]
    },
    {
      category: 'pain analysis',
      recommendations: [
        'VAS/NRS score for pain intensity',
        'Location and radiation of pain',
        'Provoking and relieving factors',
        'Pain pattern throughout the day'
      ],
      followUp: [
        'Weekly pain score evaluation',
        'Adjust pain management if needed',
        'Education about pain understanding and coping'
      ]
    }
  ]
} as const;

// Treatment progression guidelines
export const TREATMENT_GUIDELINES = {
  nl: [
    {
      condition: 'acute_lage_rugpijn',
      phases: [
        {
          phase: 'acute (0-2 weken)',
          goals: ['pijnreductie', 'beweging behouden', 'angst reduceren'],
          interventions: ['patiënteducatie', 'lichte mobilisatie', 'pijnmanagement'],
          followUp: 'evaluatie na 1 week'
        },
        {
          phase: 'subacute (2-6 weken)',
          goals: ['functie verbeteren', 'activiteit opbouwen', 'voorkomen chroniciteit'],
          interventions: ['graduele opbouw activiteit', 'krachttraining', 'ergonomieadvies'],
          followUp: 'evaluatie na 2 weken'
        }
      ]
    },
    {
      condition: 'schouder_impingement',
      phases: [
        {
          phase: 'pijnreductie',
          goals: ['inflammatie reduceren', 'bewegingsbereik behouden'],
          interventions: ['manuele therapie', 'mobilisatie', 'posturale correctie'],
          followUp: 'evaluatie na 1-2 weken'
        },
        {
          phase: 'functioneel herstel',
          goals: ['kracht opbouwen', 'stabiliteit verbeteren', 'functie herstellen'],
          interventions: ['progressieve krachttraining', 'proprioceptieve training'],
          followUp: 'evaluatie na 3-4 weken'
        }
      ]
    }
  ],
  en: [
    {
      condition: 'acute_lower_back_pain',
      phases: [
        {
          phase: 'acute (0-2 weeks)',
          goals: ['pain reduction', 'maintain movement', 'reduce anxiety'],
          interventions: ['patient education', 'gentle mobilization', 'pain management'],
          followUp: 'evaluation after 1 week'
        },
        {
          phase: 'subacute (2-6 weeks)',
          goals: ['improve function', 'activity progression', 'prevent chronicity'],
          interventions: ['gradual activity progression', 'strength training', 'ergonomic advice'],
          followUp: 'evaluation after 2 weeks'
        }
      ]
    },
    {
      condition: 'shoulder_impingement',
      phases: [
        {
          phase: 'pain reduction',
          goals: ['reduce inflammation', 'maintain range of motion'],
          interventions: ['manual therapy', 'mobilization', 'postural correction'],
          followUp: 'evaluation after 1-2 weeks'
        },
        {
          phase: 'functional recovery',
          goals: ['build strength', 'improve stability', 'restore function'],
          interventions: ['progressive strength training', 'proprioceptive training'],
          followUp: 'evaluation after 3-4 weeks'
        }
      ]
    }
  ]
} as const;

// Patient education topics
export const PATIENT_EDUCATION_TOPICS = {
  nl: [
    {
      topic: 'pijnbegrip',
      keyPoints: [
        'Pijn is een waarschuwingssignaal, niet altijd gelijk aan weefselschade',
        'Chronische pijn kan anders werken dan acute pijn',
        'Beweging is meestal veilig en bevorderlijk voor herstel',
        'Stress en angst kunnen pijn versterken'
      ],
      practicalTips: [
        'Luister naar je lichaam maar vermijd overprotectie',
        'Bouw activiteiten geleidelijk op',
        'Gebruik ontspanningstechnieken bij stress',
        'Communiceer open over je pijn en zorgen'
      ]
    },
    {
      topic: 'thuisoefeningprogramma',
      keyPoints: [
        'Consistentie is belangrijker dan intensiteit',
        'Start laag en bouw langzaam op',
        'Oefeningen moeten uitdagend maar haalbaar zijn',
        'Progressie kan variëren per persoon'
      ],
      practicalTips: [
        'Plan vaste tijden voor oefeningen',
        'Gebruik een oefendagboek voor motivatie',
        'Pas oefeningen aan bij pijn of ongemak',
        'Vraag om hulp bij onduidelijkheden'
      ]
    }
  ],
  en: [
    {
      topic: 'pain_understanding',
      keyPoints: [
        'Pain is a warning signal, not always equal to tissue damage',
        'Chronic pain can work differently than acute pain',
        'Movement is usually safe and beneficial for recovery',
        'Stress and anxiety can amplify pain'
      ],
      practicalTips: [
        'Listen to your body but avoid overprotection',
        'Build up activities gradually',
        'Use relaxation techniques during stress',
        'Communicate openly about your pain and concerns'
      ]
    },
    {
      topic: 'home_exercise_program',
      keyPoints: [
        'Consistency is more important than intensity',
        'Start low and build up slowly',
        'Exercises should be challenging but achievable',
        'Progress can vary per person'
      ],
      practicalTips: [
        'Schedule fixed times for exercises',
        'Use an exercise diary for motivation',
        'Adapt exercises if pain or discomfort occurs',
        'Ask for help when unclear'
      ]
    }
  ]
} as const;

/**
 * Generate follow-up action suggestions based on communication context
 */
export function generateFollowUpSuggestions(
  objective: CommunicationObjective,
  recipientCategory: RecipientCategory,
  chiefComplaint?: string,
  language: SupportedLanguage = 'nl'
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  
  // Objective-specific suggestions
  switch (objective) {
    case 'referral':
      suggestions.push(...generateReferralSuggestions(recipientCategory, chiefComplaint, language));
      break;
    case 'patient_education':
      suggestions.push(...generateEducationSuggestions(chiefComplaint, language));
      break;
    case 'follow_up':
      suggestions.push(...generateFollowUpActionSuggestions(chiefComplaint, language));
      break;
    case 'red_flag_notification':
      suggestions.push(...generateRedFlagSuggestions(language));
      break;
    default:
      suggestions.push(...generateGeneralSuggestions(objective, language));
  }
  
  return suggestions.slice(0, 5); // Limit to 5 suggestions
}

/**
 * Generate referral-specific suggestions
 */
function generateReferralSuggestions(
  recipientCategory: RecipientCategory,
  chiefComplaint?: string,
  language: SupportedLanguage = 'nl'
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  
  if (recipientCategory === 'specialist') {
    suggestions.push({
      id: 'referral_urgency',
      type: 'follow_up',
      title: language === 'nl' ? 'Urgentie specificeren' : 'Specify urgency',
      description: language === 'nl' 
        ? 'Geef duidelijk aan of dit een urgente verwijzing betreft'
        : 'Clearly indicate if this is an urgent referral',
      confidence: 0.9,
      metadata: {
        basedOn: 'healthcare_guidelines',
        relevanceScore: 0.9,
        timesSuggested: 0,
        timesAccepted: 0
      }
    });
    
    suggestions.push({
      id: 'referral_question',
      type: 'context',
      title: language === 'nl' ? 'Specifieke vraagstelling' : 'Specific question',
      description: language === 'nl'
        ? 'Formuleer een duidelijke vraag aan de specialist'
        : 'Formulate a clear question to the specialist',
      confidence: 0.85,
      metadata: {
        basedOn: 'healthcare_guidelines',
        relevanceScore: 0.85,
        timesSuggested: 0,
        timesAccepted: 0
      }
    });
  }
  
  return suggestions;
}

/**
 * Generate patient education suggestions
 */
function generateEducationSuggestions(
  chiefComplaint?: string,
  language: SupportedLanguage = 'nl'
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  
  suggestions.push({
    id: 'education_pain_management',
    type: 'template',
    title: language === 'nl' ? 'Pijnmanagement educatie' : 'Pain management education',
    description: language === 'nl'
      ? 'Bied informatie over pijnbegrip en zelfmanagement'
      : 'Provide information about pain understanding and self-management',
    confidence: 0.8,
    metadata: {
      basedOn: 'healthcare_guidelines',
      relevanceScore: 0.8,
      timesSuggested: 0,
      timesAccepted: 0
    }
  });
  
  suggestions.push({
    id: 'education_home_exercises',
    type: 'template',
    title: language === 'nl' ? 'Thuisoefenprogramma' : 'Home exercise program',
    description: language === 'nl'
      ? 'Verstrek duidelijke instructies voor thuisoefeningen'
      : 'Provide clear instructions for home exercises',
    confidence: 0.75,
    metadata: {
      basedOn: 'healthcare_guidelines',
      relevanceScore: 0.75,
      timesSuggested: 0,
      timesAccepted: 0
    }
  });
  
  return suggestions;
}

/**
 * Generate follow-up action suggestions
 */
function generateFollowUpActionSuggestions(
  chiefComplaint?: string,
  language: SupportedLanguage = 'nl'
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  
  suggestions.push({
    id: 'followup_progress_tracking',
    type: 'follow_up',
    title: language === 'nl' ? 'Voortgang monitoren' : 'Monitor progress',
    description: language === 'nl'
      ? 'Plan vervolgafspraak voor evaluatie van behandelresultaten'
      : 'Schedule follow-up appointment to evaluate treatment results',
    confidence: 0.9,
    metadata: {
      basedOn: 'healthcare_guidelines',
      relevanceScore: 0.9,
      timesSuggested: 0,
      timesAccepted: 0
    }
  });
  
  suggestions.push({
    id: 'followup_adjustment',
    type: 'follow_up',
    title: language === 'nl' ? 'Behandeling aanpassen' : 'Adjust treatment',
    description: language === 'nl'
      ? 'Evalueer noodzaak voor aanpassing van behandelplan'
      : 'Evaluate need for treatment plan adjustment',
    confidence: 0.8,
    metadata: {
      basedOn: 'healthcare_guidelines',
      relevanceScore: 0.8,
      timesSuggested: 0,
      timesAccepted: 0
    }
  });
  
  return suggestions;
}

/**
 * Generate red flag notification suggestions
 */
function generateRedFlagSuggestions(
  language: SupportedLanguage = 'nl'
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  
  suggestions.push({
    id: 'red_flag_urgency',
    type: 'follow_up',
    title: language === 'nl' ? 'Urgent medisch consult' : 'Urgent medical consultation',
    description: language === 'nl'
      ? 'Adviseer directe medische evaluatie bij rode vlag symptomen'
      : 'Advise immediate medical evaluation for red flag symptoms',
    confidence: 1.0,
    metadata: {
      basedOn: 'healthcare_guidelines',
      relevanceScore: 1.0,
      timesSuggested: 0,
      timesAccepted: 0
    }
  });
  
  suggestions.push({
    id: 'red_flag_documentation',
    type: 'context',
    title: language === 'nl' ? 'Symptomen documenteren' : 'Document symptoms',
    description: language === 'nl'
      ? 'Documenteer alle relevante rode vlag symptomen en bevindingen'
      : 'Document all relevant red flag symptoms and findings',
    confidence: 0.95,
    metadata: {
      basedOn: 'healthcare_guidelines',
      relevanceScore: 0.95,
      timesSuggested: 0,
      timesAccepted: 0
    }
  });
  
  return suggestions;
}

/**
 * Generate general suggestions for other objectives
 */
function generateGeneralSuggestions(
  objective: CommunicationObjective,
  language: SupportedLanguage = 'nl'
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  
  suggestions.push({
    id: 'general_clear_communication',
    type: 'context',
    title: language === 'nl' ? 'Duidelijke communicatie' : 'Clear communication',
    description: language === 'nl'
      ? 'Zorg voor heldere en begrijpelijke uitleg van de situatie'
      : 'Ensure clear and understandable explanation of the situation',
    confidence: 0.7,
    metadata: {
      basedOn: 'healthcare_guidelines',
      relevanceScore: 0.7,
      timesSuggested: 0,
      timesAccepted: 0
    }
  });
  
  return suggestions;
}

/**
 * Get evidence-based recommendations for specific conditions
 */
export function getConditionRecommendations(
  condition: string,
  language: SupportedLanguage = 'nl'
): string[] {
  const conditionMap = {
    'lower back pain': 'acute_lage_rugpijn',
    'lage rugpijn': 'acute_lage_rugpijn',
    'shoulder pain': 'schouder_impingement',
    'schouderpijn': 'schouder_impingement'
  };
  
  const mappedCondition = conditionMap[condition.toLowerCase() as keyof typeof conditionMap];
  if (!mappedCondition) return [];
  
  const guidelines = TREATMENT_GUIDELINES[language];
  const guideline = guidelines.find(g => g.condition === mappedCondition);
  
  if (!guideline) return [];
  
  const recommendations: string[] = [];
  guideline.phases.forEach(phase => {
    recommendations.push(`${phase.phase}: ${phase.goals.join(', ')}`);
    recommendations.push(`Interventies: ${phase.interventions.join(', ')}`);
    recommendations.push(`Follow-up: ${phase.followUp}`);
  });
  
  return recommendations;
}

/**
 * Check for red flag conditions in patient presentation
 */
export function checkRedFlags(
  symptoms: string[],
  language: SupportedLanguage = 'nl'
): Array<{ condition: string; urgency: string; action: string }> {
  const redFlags = RED_FLAG_CONDITIONS[language];
  const matches: Array<{ condition: string; urgency: string; action: string }> = [];
  
  redFlags.forEach(redFlag => {
    const symptomMatches = redFlag.symptoms.filter(symptom =>
      symptoms.some(patientSymptom => 
        patientSymptom.toLowerCase().includes(symptom.toLowerCase())
      )
    );
    
    if (symptomMatches.length >= 1) {
      matches.push({
        condition: redFlag.condition,
        urgency: redFlag.urgency,
        action: redFlag.action
      });
    }
  });
  
  return matches;
}

/**
 * Get patient education content for specific topics
 */
export function getPatientEducationContent(
  topic: string,
  language: SupportedLanguage = 'nl'
): { keyPoints: string[]; practicalTips: string[] } | null {
  const educationTopics = PATIENT_EDUCATION_TOPICS[language];
  const foundTopic = educationTopics.find(t => t.topic === topic);
  
  if (!foundTopic) return null;
  
  return {
    keyPoints: foundTopic.keyPoints,
    practicalTips: foundTopic.practicalTips
  };
}

/**
 * Generate treatment progression suggestions
 */
export function generateTreatmentProgression(
  currentPhase: string,
  condition: string,
  language: SupportedLanguage = 'nl'
): string[] {
  const guidelines = TREATMENT_GUIDELINES[language];
  const guideline = guidelines.find(g => g.condition.includes(condition.toLowerCase()));
  
  if (!guideline) return [];
  
  const currentPhaseIndex = guideline.phases.findIndex(p => 
    p.phase.toLowerCase().includes(currentPhase.toLowerCase())
  );
  
  if (currentPhaseIndex === -1 || currentPhaseIndex === guideline.phases.length - 1) {
    return [];
  }
  
  const nextPhase = guideline.phases[currentPhaseIndex + 1];
  return [
    `Volgende fase: ${nextPhase.phase}`,
    `Doelen: ${nextPhase.goals.join(', ')}`,
    `Interventies: ${nextPhase.interventions.join(', ')}`,
    `Evaluatie: ${nextPhase.followUp}`
  ];
}