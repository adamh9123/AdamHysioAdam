/**
 * Comprehensive Red Flags Detection System for Hysio Medical Scribe
 *
 * Based on the medical red flags documentation, this module provides systematic
 * detection of potentially serious medical conditions that require immediate
 * attention or specialist referral.
 */

export interface RedFlagResult {
  detected: boolean;
  category: RedFlagCategory;
  severity: RedFlagSeverity;
  description: string;
  recommendations: string[];
  urgency: RedFlagUrgency;
}

export type RedFlagCategory =
  | 'general-systemic'
  | 'head-cervical'
  | 'thoracic-chest'
  | 'lumbar-spine'
  | 'shoulder-upper-extremity'
  | 'hip-knee-lower-extremity';

export type RedFlagSeverity = 'critical' | 'high' | 'moderate' | 'low';

export type RedFlagUrgency =
  | 'emergency-immediate'    // Emergency room immediately
  | 'urgent-today'          // Same day medical attention
  | 'urgent-24-48h'         // Within 24-48 hours
  | 'referral-soon';        // Specialist referral within weeks

interface RedFlagCriterion {
  keywords: string[];
  severity: RedFlagSeverity;
  urgency: RedFlagUrgency;
  description: string;
  recommendations: string[];
  minimumMatches?: number;
  exclusions?: string[];
}

/**
 * General/Systemic Red Flags - Always check regardless of primary complaint
 */
const GENERAL_SYSTEMIC_FLAGS: Record<string, RedFlagCriterion> = {
  unexplained_weight_loss: {
    keywords: ['gewichtsverlies', 'afgevallen', 'gewicht verloren', 'mager worden', 'gewichtsdaling'],
    severity: 'critical',
    urgency: 'urgent-24-48h',
    description: 'Onverklaard gewichtsverlies - mogelijk teken van maligniteit',
    recommendations: ['Onmiddellijke verwijzing naar huisarts', 'Uitgebreid lichamelijk onderzoek', 'Bloedonderzoek en imaging overwegen']
  },
  fever_chills_night_sweats: {
    keywords: ['koorts', 'rillingen', 'nachtzweet', 'nachtzweten', 'koortsig', 'transpireren nachts'],
    severity: 'high',
    urgency: 'urgent-today',
    description: 'Koorts, rillingen, nachtzweten - systemisch inflammatoir/infectieus proces',
    recommendations: ['Medische evaluatie vandaag', 'Bloedonderzoek', 'Infectie uitsluiten']
  },
  constant_night_pain: {
    keywords: ['nachtpijn', 'pijn snachts', 'wakker van pijn', 'constante pijn', 'onophoudelijke pijn', 'pijn verandert niet'],
    severity: 'high',
    urgency: 'urgent-24-48h',
    description: 'Constante, intense nachtpijn - mogelijk tumor of infectie',
    recommendations: ['Medische evaluatie binnen 48u', 'Imaging overwegen', 'Pijnmedicatie evalueren']
  },
  unexplained_fatigue: {
    keywords: ['extreme vermoeidheid', 'chronische vermoeidheid', 'uitputting', 'malaise', 'zeer moe'],
    severity: 'moderate',
    urgency: 'referral-soon',
    description: 'Recente, onverklaarde vermoeidheid',
    recommendations: ['Huisartscontrole', 'Bloedonderzoek', 'Onderliggende oorzaken uitsluiten']
  },
  malignancy_history: {
    keywords: ['kanker', 'tumor', 'maligniteit', 'chemo', 'chemotherapie', 'oncologie', 'uitzaaiingen'],
    severity: 'critical',
    urgency: 'urgent-24-48h',
    description: 'Voorgeschiedenis van maligniteit - verhoogd risico metastasen',
    recommendations: ['Onmiddellijke oncologie consulatie', 'Imaging protocol', 'Tumormarkers']
  },
  iv_drug_use_immunosuppression: {
    keywords: ['drugs intraveneus', 'iv drugs', 'immuunsuppressie', 'hiv', 'aids', 'corticosteroïden', 'immunosuppressive'],
    severity: 'high',
    urgency: 'urgent-today',
    description: 'IV drugsgebruik/immuunsuppressie - verhoogd infectierisico',
    recommendations: ['Acute medische zorg', 'Infectieprotocol', 'Bloedkweek overwegen']
  }
};

/**
 * Head & Cervical Spine Red Flags
 */
const HEAD_CERVICAL_FLAGS: Record<string, RedFlagCriterion> = {
  thunderclap_headache: {
    keywords: ['donderslaghoofdpijn', 'plotselinge hoofdpijn', 'ergste hoofdpijn ooit', 'hoofdpijn binnen minuut'],
    severity: 'critical',
    urgency: 'emergency-immediate',
    description: 'Donderslaghoofdpijn - mogelijk subarachnoïdale bloeding',
    recommendations: ['112 - SPOED!', 'Onmiddellijk naar SEH', 'CT-scan urgent']
  },
  cervical_artery_dysfunction: {
    keywords: ['duizeligheid', 'dubbelzien', 'diplopia', 'slikstoornissen', 'spraakstoornissen', 'dysarthrie', 'valaanvallen', 'ataxie', 'nystagmus', 'gevoelloosheid gelaat'],
    severity: 'critical',
    urgency: 'emergency-immediate',
    description: 'Cervicale arterie disfunctie (5 Ds en 3 Ns) - mogelijk dissectie',
    recommendations: ['112 - SPOED!', 'Onmiddellijk naar SEH', 'Geen manipulatie cervicale wervelkolom'],
    minimumMatches: 2
  },
  cervical_myelopathy: {
    keywords: ['loopstoornis', 'onhandige handen', 'bilaterale symptomen beide armen', 'blaasproblemen', 'incontinentie'],
    severity: 'high',
    urgency: 'urgent-today',
    description: 'Cervicale myelopathie - ruggenmergcompressie',
    recommendations: ['Spoedverwijzing neurologie', 'MRI cervicale wervelkolom', 'Geen manipulatie'],
    minimumMatches: 2
  },
  temporal_arteritis: {
    keywords: ['hoofdpijn slaap', 'temporalis drukpijn', 'kaakpijn kauwen', 'visusstoornissen', 'blindheid'],
    severity: 'critical',
    urgency: 'urgent-today',
    description: 'Arteriitis temporalis - risico permanente blindheid',
    recommendations: ['Spoed huisarts/oogarts', 'ESR/CRP urgent', 'Corticosteroïden overwegen']
  }
};

/**
 * Thoracic/Chest Red Flags
 */
const THORACIC_CHEST_FLAGS: Record<string, RedFlagCriterion> = {
  acute_coronary_syndrome: {
    keywords: ['pijn borst', 'druk borst', 'benauwdheid', 'uitstraling linkerarm', 'uitstraling kaak', 'kortademigheid', 'zweten', 'misselijkheid hartinfarct'],
    severity: 'critical',
    urgency: 'emergency-immediate',
    description: 'Mogelijk acuut coronair syndroom',
    recommendations: ['112 - SPOED!', 'Onmiddellijk naar SEH', 'ECG urgent'],
    minimumMatches: 2
  },
  aortic_aneurysm_dissection: {
    keywords: ['scheurende pijn', 'pijn tussen schouderbladen', 'plotselinge hevige pijn', 'pulserend gevoel buik'],
    severity: 'critical',
    urgency: 'emergency-immediate',
    description: 'Aorta-aneurysma/dissectie',
    recommendations: ['112 - SPOED!', 'Onmiddellijk naar SEH', 'CT-angiografie urgent']
  },
  pulmonary_embolism: {
    keywords: ['pleuritische pijn', 'kortademigheid plotseling', 'bloed ophoesten', 'snelle hartslag', 'recente operatie', 'immobilisatie'],
    severity: 'critical',
    urgency: 'emergency-immediate',
    description: 'Mogelijk longembolie',
    recommendations: ['112 - SPOED!', 'Onmiddellijk naar SEH', 'CT-PA urgent'],
    minimumMatches: 2
  },
  vertebral_fracture: {
    keywords: ['ernstig trauma', 'val van hoogte', 'auto-ongeluk', 'osteoporose trauma', 'hevige gelokaliseerde pijn', 'drukpijn processus spinosus'],
    severity: 'high',
    urgency: 'urgent-today',
    description: 'Mogelijk wervelfractuur',
    recommendations: ['Spoedverwijzing orthopeed', 'Röntgen/CT wervelkolom', 'Immobilisatie']
  }
};

/**
 * Lumbar Spine Red Flags
 */
const LUMBAR_SPINE_FLAGS: Record<string, RedFlagCriterion> = {
  cauda_equina_syndrome: {
    keywords: ['rijbroekanesthesie', 'gevoelloosheid billen', 'blaasproblemen', 'urine-retentie', 'fecale incontinentie', 'bilaterale beenzwakte', 'erectiestoornis'],
    severity: 'critical',
    urgency: 'emergency-immediate',
    description: 'Cauda Equina Syndroom - chirurgisch spoedgeval',
    recommendations: ['112 - SPOED!', 'Onmiddellijk naar SEH', 'MRI urgent', 'Neurochirurg consulteren'],
    minimumMatches: 2
  },
  abdominal_aortic_aneurysm: {
    keywords: ['diepe borende pijn', 'pulserende pijn buik', 'pijn lies', 'mannelijk 65+', 'roken', 'hart- en vaatziekten'],
    severity: 'critical',
    urgency: 'emergency-immediate',
    description: 'Mogelijk Aneurysma Aortae Abdominalis',
    recommendations: ['112 - SPOED!', 'Onmiddellijk naar SEH', 'Echo/CT abdomen urgent']
  },
  spinal_infection: {
    keywords: ['koorts rugpijn', 'gelokaliseerde drukpijn wervelkolom', 'urineweginfectie', 'huidinfectie', 'iv drugs rugpijn'],
    severity: 'high',
    urgency: 'urgent-today',
    description: 'Spinale infectie (osteomyelitis/discitis)',
    recommendations: ['Spoedverwijzing', 'Bloedkweek', 'MRI wervelkolom', 'Antibiotica overwegen']
  }
};

/**
 * Shoulder & Upper Extremity Red Flags
 */
const SHOULDER_UPPER_EXTREMITY_FLAGS: Record<string, RedFlagCriterion> = {
  pancoast_tumor: {
    keywords: ['schouderpijn mediale scapula', 'handspieratrofie', 'hangend ooglid', 'horner syndroom', 'vernauwde pupil'],
    severity: 'critical',
    urgency: 'urgent-24-48h',
    description: 'Pancoast tumor - longtop tumor',
    recommendations: ['Spoedverwijzing longarts', 'Thorax CT', 'Oncologie consultatie']
  },
  septic_arthritis: {
    keywords: ['acuut pijnlijk gewricht', 'rood warm gezwollen gewricht', 'koorts gewricht', 'niet bewegen gewricht'],
    severity: 'critical',
    urgency: 'urgent-today',
    description: 'Septische artritis - gewrichtsinfectie',
    recommendations: ['Spoedverwijzing', 'Gewrichtspunctie', 'Antibiotica urgent']
  },
  fracture_dislocation: {
    keywords: ['standsafwijking trauma', 'hemartros', 'onvermogen bewegen', 'anatomische snuifdoos drukpijn', 'scaphoid fractuur'],
    severity: 'high',
    urgency: 'urgent-today',
    description: 'Mogelijk fractuur/luxatie',
    recommendations: ['Spoedverwijzing orthopeed', 'Röntgen', 'Immobilisatie']
  },
  compartment_syndrome: {
    keywords: ['buitenproportionele pijn', 'bleekheid trauma', 'paresthesieën trauma', 'afwezige pulsaties', 'paralyse trauma', 'koude huid trauma'],
    severity: 'critical',
    urgency: 'emergency-immediate',
    description: 'Compartimentsyndroom - 6 Ps',
    recommendations: ['112 - SPOED!', 'Chirurgisch spoedgeval', 'Fasciotomie overwegen'],
    minimumMatches: 3
  }
};

/**
 * Hip, Knee & Lower Extremity Red Flags
 */
const HIP_KNEE_LOWER_EXTREMITY_FLAGS: Record<string, RedFlagCriterion> = {
  hip_fracture: {
    keywords: ['niet belasten been', 'verkort been', 'exorotatie been', 'heupfractuur val'],
    severity: 'high',
    urgency: 'urgent-today',
    description: 'Collumfractuur (gebroken heup)',
    recommendations: ['Spoedverwijzing orthopeed', 'Röntgen heup', 'Pijnstilling', 'Chirurgie overwegen']
  },
  slipped_capital_femoral_epiphysis: {
    keywords: ['adolescent manklopen', 'heuppijn lies knie', 'beperkte endorotatie', 'overgewicht jongen'],
    severity: 'high',
    urgency: 'urgent-24-48h',
    description: 'Epifysiolysis Capitis Femoris (ECF)',
    recommendations: ['Spoedverwijzing orthopeed kind', 'Röntgen heup', 'Niet belasten']
  },
  deep_vein_thrombosis: {
    keywords: ['unilaterale kuitpijn', 'been zwelling 3cm', 'pitting oedeem', 'warmte been', 'wells score'],
    severity: 'high',
    urgency: 'urgent-today',
    description: 'Diepveneuze trombose (DVT)',
    recommendations: ['Spoedverwijzing', 'Echo duplex', 'Anticoagulatie overwegen', 'Wells score']
  },
  peripheral_arterial_disease: {
    keywords: ['claudicatio intermittens', 'etalagebenen', 'pijn rust been', 'niet-genezende wonden', 'koude bleke huid'],
    severity: 'moderate',
    urgency: 'urgent-24-48h',
    description: 'Perifeer arterieel vaatlijden (PAV)',
    recommendations: ['Vaatchirurg verwijzing', 'Ankle-brachial index', 'Doppler onderzoek']
  }
};

/**
 * Main red flags detection function
 */
export function detectRedFlags(
  transcript: string,
  patientInfo: { age: number; gender: string; chiefComplaint: string }
): RedFlagResult[] {
  const detectedFlags: RedFlagResult[] = [];
  const lowerTranscript = transcript.toLowerCase();

  // Check all red flag categories
  const allFlags = {
    'general-systemic': GENERAL_SYSTEMIC_FLAGS,
    'head-cervical': HEAD_CERVICAL_FLAGS,
    'thoracic-chest': THORACIC_CHEST_FLAGS,
    'lumbar-spine': LUMBAR_SPINE_FLAGS,
    'shoulder-upper-extremity': SHOULDER_UPPER_EXTREMITY_FLAGS,
    'hip-knee-lower-extremity': HIP_KNEE_LOWER_EXTREMITY_FLAGS
  };

  for (const [category, flags] of Object.entries(allFlags)) {
    for (const [flagKey, criterion] of Object.entries(flags)) {
      const result = checkRedFlagCriterion(lowerTranscript, criterion, category as RedFlagCategory, patientInfo);
      if (result.detected) {
        detectedFlags.push(result);
      }
    }
  }

  // Sort by urgency and severity
  detectedFlags.sort((a, b) => {
    const urgencyOrder = ['emergency-immediate', 'urgent-today', 'urgent-24-48h', 'referral-soon'];
    const severityOrder = ['critical', 'high', 'moderate', 'low'];

    const urgencyDiff = urgencyOrder.indexOf(a.urgency) - urgencyOrder.indexOf(b.urgency);
    if (urgencyDiff !== 0) return urgencyDiff;

    return severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
  });

  return detectedFlags;
}

function checkRedFlagCriterion(
  transcript: string,
  criterion: RedFlagCriterion,
  category: RedFlagCategory,
  patientInfo: { age: number; gender: string; chiefComplaint: string }
): RedFlagResult {
  const matches = criterion.keywords.filter(keyword =>
    transcript.includes(keyword.toLowerCase())
  );

  const exclusionMatches = criterion.exclusions ?
    criterion.exclusions.filter(exclusion => transcript.includes(exclusion.toLowerCase())) : [];

  const minMatches = criterion.minimumMatches || 1;
  const detected = matches.length >= minMatches && exclusionMatches.length === 0;

  return {
    detected,
    category,
    severity: criterion.severity,
    description: criterion.description,
    recommendations: criterion.recommendations,
    urgency: criterion.urgency
  };
}

/**
 * Generate structured red flags summary for clinical documentation
 */
export function generateRedFlagsSummary(redFlags: RedFlagResult[]): string {
  if (redFlags.length === 0) {
    return "Geen rode vlaggen gedetecteerd op basis van systematische screening.";
  }

  let summary = "RODE VLAGGEN GEDETECTEERD:\n\n";

  const criticalFlags = redFlags.filter(flag => flag.urgency === 'emergency-immediate');
  const urgentFlags = redFlags.filter(flag => flag.urgency === 'urgent-today' || flag.urgency === 'urgent-24-48h');
  const referralFlags = redFlags.filter(flag => flag.urgency === 'referral-soon');

  if (criticalFlags.length > 0) {
    summary += "🚨 SPOEDEISEND (ONMIDDELLIJK):\n";
    criticalFlags.forEach(flag => {
      summary += `• ${flag.description}\n`;
      summary += `  Actie: ${flag.recommendations[0]}\n\n`;
    });
  }

  if (urgentFlags.length > 0) {
    summary += "⚠️ URGENT (Binnen 24-48u):\n";
    urgentFlags.forEach(flag => {
      summary += `• ${flag.description}\n`;
      summary += `  Actie: ${flag.recommendations[0]}\n\n`;
    });
  }

  if (referralFlags.length > 0) {
    summary += "📋 VERWIJZING NODIG:\n";
    referralFlags.forEach(flag => {
      summary += `• ${flag.description}\n`;
      summary += `  Actie: ${flag.recommendations[0]}\n\n`;
    });
  }

  return summary.trim();
}

/**
 * Extract simple red flags list for backward compatibility
 */
export function extractRedFlagsList(redFlags: RedFlagResult[]): string[] {
  return redFlags.map(flag => flag.description);
}