/**
 * Pre-intake Module Translations
 *
 * Bilingual support for Dutch (NL) and English (EN)
 *
 * @module lib/pre-intake/translations
 */

export type Language = 'nl' | 'en';

export interface Translations {
  // Common UI
  continue: string;
  previous: string;
  submit: string;
  loading: string;
  error: string;
  required: string;
  optional: string;

  // Questionnaire sections
  personalia: string;
  complaint: string;
  redFlags: string;
  medicalHistory: string;
  goals: string;
  functionalLimitations: string;
  review: string;
  consent: string;

  // Personalia fields
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  postalCode: string;
  city: string;
  insurance: string;

  // LOFTIG framework
  location: string;
  onset: string;
  frequency: string;
  duration: string;
  intensity: string;
  history: string;

  // SCEGS framework
  treatmentGoals: string;
  thoughtsOnCause: string;
  moodImpact: string;
  limitedActivities: string;

  // Red flags
  redFlagsTitle: string;
  redFlagsDescription: string;
  noRedFlags: string;

  // Medical history
  recentSurgeries: string;
  medication: string;
  otherConditions: string;
  smokingStatus: string;
  alcoholConsumption: string;

  // Messages
  welcome: string;
  welcomeDescription: string;
  reviewDescription: string;
  consentText: string;
  submitSuccess: string;
  draftSaved: string;
  draftExpired: string;
}

export const translations: Record<Language, Translations> = {
  nl: {
    // Common UI
    continue: 'Volgende',
    previous: 'Vorige',
    submit: 'Versturen',
    loading: 'Laden...',
    error: 'Fout',
    required: 'Verplicht',
    optional: 'Optioneel',

    // Questionnaire sections
    personalia: 'Persoonlijke Gegevens',
    complaint: 'Klacht',
    redFlags: 'Red Flags',
    medicalHistory: 'Medische Geschiedenis',
    goals: 'Doelen',
    functionalLimitations: 'Functionele Beperkingen',
    review: 'Controle',
    consent: 'Toestemming',

    // Personalia fields
    firstName: 'Voornaam',
    lastName: 'Achternaam',
    dateOfBirth: 'Geboortedatum',
    gender: 'Geslacht',
    phone: 'Telefoonnummer',
    email: 'E-mailadres',
    address: 'Adres',
    postalCode: 'Postcode',
    city: 'Plaats',
    insurance: 'Verzekeraar',

    // LOFTIG framework
    location: 'Locatie',
    onset: 'Ontstaan',
    frequency: 'Frequentie',
    duration: 'Duur',
    intensity: 'Intensiteit',
    history: 'Geschiedenis',

    // SCEGS framework
    treatmentGoals: 'Behandeldoelen',
    thoughtsOnCause: 'Gedachten over oorzaak',
    moodImpact: 'Invloed op stemming',
    limitedActivities: 'Beperkte activiteiten',

    // Red flags
    redFlagsTitle: 'Waarschuwingssignalen',
    redFlagsDescription: 'Deze vragen helpen ons om te bepalen of u aanvullend onderzoek nodig heeft.',
    noRedFlags: 'Geen waarschuwingssignalen gedetecteerd',

    // Medical history
    recentSurgeries: 'Recente operaties',
    medication: 'Medicatie',
    otherConditions: 'Andere aandoeningen',
    smokingStatus: 'Rookstatus',
    alcoholConsumption: 'Alcoholgebruik',

    // Messages
    welcome: 'Welkom bij Hysio Pre-intake',
    welcomeDescription: 'Vul deze vragenlijst in om uw fysiotherapeut optimaal voor te bereiden op uw eerste afspraak.',
    reviewDescription: 'Controleer uw antwoorden voordat u de vragenlijst verstuurt.',
    consentText: 'Ik ga akkoord met het verwerken van mijn gegevens volgens het privacybeleid van Hysio.',
    submitSuccess: 'Bedankt! Uw pre-intake is succesvol verzonden.',
    draftSaved: 'Uw concept is opgeslagen',
    draftExpired: 'Uw concept is verlopen',
  },
  en: {
    // Common UI
    continue: 'Continue',
    previous: 'Previous',
    submit: 'Submit',
    loading: 'Loading...',
    error: 'Error',
    required: 'Required',
    optional: 'Optional',

    // Questionnaire sections
    personalia: 'Personal Information',
    complaint: 'Complaint',
    redFlags: 'Red Flags',
    medicalHistory: 'Medical History',
    goals: 'Goals',
    functionalLimitations: 'Functional Limitations',
    review: 'Review',
    consent: 'Consent',

    // Personalia fields
    firstName: 'First Name',
    lastName: 'Last Name',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    phone: 'Phone Number',
    email: 'Email Address',
    address: 'Address',
    postalCode: 'Postal Code',
    city: 'City',
    insurance: 'Insurance Provider',

    // LOFTIG framework
    location: 'Location',
    onset: 'Onset',
    frequency: 'Frequency',
    duration: 'Duration',
    intensity: 'Intensity',
    history: 'History',

    // SCEGS framework
    treatmentGoals: 'Treatment Goals',
    thoughtsOnCause: 'Thoughts on Cause',
    moodImpact: 'Impact on Mood',
    limitedActivities: 'Limited Activities',

    // Red flags
    redFlagsTitle: 'Warning Signs',
    redFlagsDescription: 'These questions help us determine if you need additional examination.',
    noRedFlags: 'No warning signs detected',

    // Medical history
    recentSurgeries: 'Recent Surgeries',
    medication: 'Medication',
    otherConditions: 'Other Conditions',
    smokingStatus: 'Smoking Status',
    alcoholConsumption: 'Alcohol Consumption',

    // Messages
    welcome: 'Welcome to Hysio Pre-intake',
    welcomeDescription: 'Complete this questionnaire to optimally prepare your physiotherapist for your first appointment.',
    reviewDescription: 'Review your answers before submitting the questionnaire.',
    consentText: 'I agree to the processing of my data according to the Hysio privacy policy.',
    submitSuccess: 'Thank you! Your pre-intake has been successfully submitted.',
    draftSaved: 'Your draft has been saved',
    draftExpired: 'Your draft has expired',
  },
};

export function getTranslations(lang: Language = 'nl'): Translations {
  return translations[lang] || translations.nl;
}