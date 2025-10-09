/**
 * Pre-intake Module Translations
 *
 * Bilingual support for Dutch (NL) and English (EN)
 *
 * @module lib/pre-intake/translations
 */

export type Language = 'nl' | 'en' | 'ar';

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
  screeningQuestions: string;
  medicalHistory: string;
  goals: string;
  functionalLimitations: string;
  psk: string;
  review: string;
  consent: string;
  exportSection: string;

  // Personalia fields
  fullName: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  genderMale: string;
  genderFemale: string;
  phone: string;
  email: string;
  address: string;
  postalCode: string;
  city: string;
  insurance: string;
  insuranceNumber: string;

  // LOFTIG framework
  location: string;
  onset: string;
  mainComplaint: string;
  mainComplaintSubtitle: string;
  frequency: string;
  duration: string;
  intensity: string;
  history: string;

  // LOFTIG prompts (voice dictation helpers)
  loftigPromptsTitle: string;
  loftigPrompt1: string;
  loftigPrompt2: string;
  loftigPrompt3: string;
  loftigPrompt4: string;
  loftigPrompt5: string;
  loftigPrompt6: string;

  // Voice dictation
  voiceRecording: string;
  voiceClickToRecord: string;
  voiceClickToStop: string;
  voiceBrowserNotSupported: string;
  voiceTimeRemaining: string;

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
  welcomeTitle: string;
  welcomeDescription: string;
  welcomeIntro: string;
  reviewDescription: string;
  consentText: string;
  consentPrivacyPolicy: string;
  submitSuccess: string;
  exportSuccess: string;
  draftSaved: string;
  draftExpired: string;

  // Export functionality
  exportTitle: string;
  exportDescription: string;
  exportPDF: string;
  exportDOCX: string;
  exportHTML: string;
  exportTXT: string;
  exportGenerating: string;
  exportComplete: string;
  exportError: string;
  sendEmail: string;
  sendEmailDescription: string;
  sendEmailSuccess: string;
  sendEmailError: string;
  sendingEmail: string;
  downloadAs: string;
  previewData: string;
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
    screeningQuestions: 'Screeningsvragen',
    medicalHistory: 'Medische Geschiedenis',
    goals: 'Doelen',
    functionalLimitations: 'Functionele Beperkingen',
    psk: 'Patiënt Specifieke Klachtenlijst (PSK)',
    review: 'Controle',
    consent: 'Toestemming',
    exportSection: 'Verzenden & Exporteren',

    // Personalia fields
    fullName: 'Volledige naam',
    firstName: 'Voornaam',
    lastName: 'Achternaam',
    dateOfBirth: 'Geboortedatum',
    gender: 'Geslacht',
    genderMale: 'Man',
    genderFemale: 'Vrouw',
    phone: 'Telefoonnummer',
    email: 'E-mailadres',
    address: 'Adres',
    postalCode: 'Postcode',
    city: 'Plaats',
    insurance: 'Zorgverzekeraar',
    insuranceNumber: 'Polisnummer',

    // LOFTIG framework
    location: 'Locatie',
    onset: 'Ontstaan',
    mainComplaint: 'Hoofdklacht',
    mainComplaintSubtitle: 'Beschrijf zo uitgebreid mogelijk uw klacht',
    frequency: 'Frequentie',
    duration: 'Duur',
    intensity: 'Intensiteit',
    history: 'Geschiedenis',

    // LOFTIG prompts
    loftigPromptsTitle: 'Geheugensteun',
    loftigPrompt1: 'Waar precies zit de pijn of klacht? Straalt het uit?',
    loftigPrompt2: 'Hoe is de klacht begonnen? Was er een specifiek moment?',
    loftigPrompt3: 'Wanneer heeft u er last van? (ochtend, avond, bij bewegen, in rust?)',
    loftigPrompt4: 'Wat voor soort pijn is het? (stekend, zeurend, brandend?)',
    loftigPrompt5: 'Wat maakt de klacht erger? En wat maakt het beter?',
    loftigPrompt6: 'Welke invloed heeft de klacht op uw dagelijks leven (werk, sport, hobby\'s)?',

    // Voice dictation
    voiceRecording: 'Opname loopt...',
    voiceClickToRecord: 'Klik om op te nemen (max 5 minuten)',
    voiceClickToStop: 'Klik om te stoppen',
    voiceBrowserNotSupported: 'Uw browser ondersteunt geen spraakherkenning. Gebruik het tekstveld.',
    voiceTimeRemaining: 'Tijd over',

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
    welcomeTitle: 'Welkom bij Hysio pre-intake',
    welcomeDescription: 'Om u zo efficiënt en persoonlijk mogelijk te helpen, vragen we u deze intake alvast in te vullen. Zo hebben we tijdens uw eerste afspraak alle tijd voor u en uw klacht.',
    welcomeIntro: 'De vragenlijst duurt ongeveer 10-15 minuten. U kunt de vragenlijst op elk moment opslaan en later verder gaan.',
    reviewDescription: 'Controleer uw antwoorden voordat u de vragenlijst verstuurt.',
    consentText: 'Ik ga akkoord met het verwerken van mijn gegevens volgens het privacybeleid van Hysio.',
    consentPrivacyPolicy: 'Voor meer informatie, zie ons privacybeleid.',
    submitSuccess: 'Bedankt! Uw pre-intake is succesvol verzonden.',
    exportSuccess: 'Bedankt! Uw intake is succesvol ontvangen.',
    draftSaved: 'Uw concept is opgeslagen',
    draftExpired: 'Uw concept is verlopen',

    // Export functionality
    exportTitle: 'Download uw intake',
    exportDescription: 'U kunt uw ingevulde intake nu downloaden in verschillende formaten.',
    exportPDF: 'Download als PDF',
    exportDOCX: 'Download als Word',
    exportHTML: 'Download als HTML',
    exportTXT: 'Download als Tekst',
    exportGenerating: 'Bezig met genereren...',
    exportComplete: 'Download gereed!',
    exportError: 'Fout bij het genereren van de download.',
    sendEmail: 'Verzend naar e-mail',
    sendEmailDescription: 'Verstuur een kopie naar uw e-mailadres en de praktijk.',
    sendEmailSuccess: 'E-mail succesvol verzonden!',
    sendEmailError: 'Fout bij het verzenden van e-mail.',
    sendingEmail: 'Bezig met verzenden...',
    downloadAs: 'Download als',
    previewData: 'Bekijk gegevens',
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
    screeningQuestions: 'Screening Questions',
    medicalHistory: 'Medical History',
    goals: 'Goals',
    functionalLimitations: 'Functional Limitations',
    psk: 'Patient-Specific Complaints List (PSK)',
    review: 'Review',
    consent: 'Consent',
    exportSection: 'Submit & Export',

    // Personalia fields
    fullName: 'Full Name',
    firstName: 'First Name',
    lastName: 'Last Name',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    genderMale: 'Male',
    genderFemale: 'Female',
    phone: 'Phone Number',
    email: 'Email Address',
    address: 'Address',
    postalCode: 'Postal Code',
    city: 'City',
    insurance: 'Insurance Provider',
    insuranceNumber: 'Policy Number',

    // LOFTIG framework
    location: 'Location',
    onset: 'Onset',
    mainComplaint: 'Main Complaint',
    mainComplaintSubtitle: 'Describe your complaint in as much detail as possible',
    frequency: 'Frequency',
    duration: 'Duration',
    intensity: 'Intensity',
    history: 'History',

    // LOFTIG prompts
    loftigPromptsTitle: 'Memory Aids',
    loftigPrompt1: 'Where exactly is the pain or complaint? Does it radiate?',
    loftigPrompt2: 'How did the complaint start? Was there a specific moment?',
    loftigPrompt3: 'When do you experience it? (morning, evening, when moving, at rest?)',
    loftigPrompt4: 'What type of pain is it? (sharp, aching, burning?)',
    loftigPrompt5: 'What makes the complaint worse? And what makes it better?',
    loftigPrompt6: 'What impact does the complaint have on your daily life (work, sports, hobbies)?',

    // Voice dictation
    voiceRecording: 'Recording...',
    voiceClickToRecord: 'Click to record (max 5 minutes)',
    voiceClickToStop: 'Click to stop',
    voiceBrowserNotSupported: 'Your browser does not support speech recognition. Please use the text field.',
    voiceTimeRemaining: 'Time remaining',

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
    welcomeTitle: 'Welcome to Hysio pre-intake',
    welcomeDescription: 'To help you as efficiently and personally as possible, we ask you to complete this intake form in advance. This way we have all the time for you and your complaint during your first appointment.',
    welcomeIntro: 'The questionnaire takes approximately 10-15 minutes. You can save the questionnaire at any time and continue later.',
    reviewDescription: 'Review your answers before submitting the questionnaire.',
    consentText: 'I agree to the processing of my data according to the Hysio privacy policy.',
    consentPrivacyPolicy: 'For more information, see our privacy policy.',
    submitSuccess: 'Thank you! Your pre-intake has been successfully submitted.',
    exportSuccess: 'Thank you! Your intake has been successfully received.',
    draftSaved: 'Your draft has been saved',
    draftExpired: 'Your draft has expired',

    // Export functionality
    exportTitle: 'Download your intake',
    exportDescription: 'You can now download your completed intake in various formats.',
    exportPDF: 'Download as PDF',
    exportDOCX: 'Download as Word',
    exportHTML: 'Download as HTML',
    exportTXT: 'Download as Text',
    exportGenerating: 'Generating...',
    exportComplete: 'Download ready!',
    exportError: 'Error generating download.',
    sendEmail: 'Send via email',
    sendEmailDescription: 'Send a copy to your email address and the practice.',
    sendEmailSuccess: 'Email sent successfully!',
    sendEmailError: 'Error sending email.',
    sendingEmail: 'Sending...',
    downloadAs: 'Download as',
    previewData: 'Preview data',
  },
  ar: {
    // Common UI
    continue: 'التالي',
    previous: 'السابق',
    submit: 'إرسال',
    loading: 'جار التحميل...',
    error: 'خطأ',
    required: 'مطلوب',
    optional: 'اختياري',

    // Questionnaire sections
    personalia: 'المعلومات الشخصية',
    complaint: 'الشكوى',
    redFlags: 'علامات التحذير',
    screeningQuestions: 'أسئلة الفحص',
    medicalHistory: 'التاريخ الطبي',
    goals: 'الأهداف',
    functionalLimitations: 'القيود الوظيفية',
    psk: 'قائمة الشكاوى الخاصة بالمريض (PSK)',
    review: 'المراجعة',
    consent: 'الموافقة',
    exportSection: 'إرسال وتصدير',

    // Personalia fields
    fullName: 'الاسم الكامل',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    dateOfBirth: 'تاريخ الميلاد',
    gender: 'الجنس',
    genderMale: 'ذكر',
    genderFemale: 'أنثى',
    phone: 'رقم الهاتف',
    email: 'البريد الإلكتروني',
    address: 'العنوان',
    postalCode: 'الرمز البريدي',
    city: 'المدينة',
    insurance: 'شركة التأمين',
    insuranceNumber: 'رقم الوثيقة',

    // LOFTIG framework
    location: 'الموقع',
    onset: 'البداية',
    mainComplaint: 'الشكوى الرئيسية',
    mainComplaintSubtitle: 'صف شكواك بأكبر قدر ممكن من التفاصيل',
    frequency: 'التكرار',
    duration: 'المدة',
    intensity: 'الشدة',
    history: 'التاريخ',

    // LOFTIG prompts
    loftigPromptsTitle: 'مساعدات التذكير',
    loftigPrompt1: 'أين بالضبط الألم أو الشكوى؟ هل ينتشر؟',
    loftigPrompt2: 'كيف بدأت الشكوى؟ هل كانت هناك لحظة معينة؟',
    loftigPrompt3: 'متى تشعر به؟ (صباحاً، مساءً، عند الحركة، في الراحة؟)',
    loftigPrompt4: 'ما نوع الألم؟ (حاد، مؤلم، حارق؟)',
    loftigPrompt5: 'ما الذي يجعل الشكوى أسوأ؟ وما الذي يجعلها أفضل؟',
    loftigPrompt6: 'ما تأثير الشكوى على حياتك اليومية (العمل، الرياضة، الهوايات)؟',

    // Voice dictation
    voiceRecording: 'جاري التسجيل...',
    voiceClickToRecord: 'انقر للتسجيل (بحد أقصى 5 دقائق)',
    voiceClickToStop: 'انقر للإيقاف',
    voiceBrowserNotSupported: 'متصفحك لا يدعم التعرف على الكلام. يرجى استخدام حقل النص.',
    voiceTimeRemaining: 'الوقت المتبقي',

    // SCEGS framework
    treatmentGoals: 'أهداف العلاج',
    thoughtsOnCause: 'أفكار حول السبب',
    moodImpact: 'التأثير على المزاج',
    limitedActivities: 'الأنشطة المحدودة',

    // Red flags
    redFlagsTitle: 'علامات التحذير',
    redFlagsDescription: 'تساعدنا هذه الأسئلة على تحديد ما إذا كنت بحاجة إلى فحص إضافي.',
    noRedFlags: 'لم يتم اكتشاف علامات تحذير',

    // Medical history
    recentSurgeries: 'العمليات الجراحية الأخيرة',
    medication: 'الأدوية',
    otherConditions: 'حالات أخرى',
    smokingStatus: 'حالة التدخين',
    alcoholConsumption: 'استهلاك الكحول',

    // Messages
    welcome: 'مرحباً بك في Hysio للفحص المبدئي',
    welcomeTitle: 'مرحباً بك في Hysio للفحص المبدئي',
    welcomeDescription: 'لمساعدتك بأكبر قدر ممكن من الكفاءة والشخصية، نطلب منك إكمال نموذج الفحص هذا مسبقاً. بهذه الطريقة لدينا كل الوقت لك ولشكواك خلال موعدك الأول.',
    welcomeIntro: 'يستغرق الاستبيان حوالي 10-15 دقيقة. يمكنك حفظ الاستبيان في أي وقت والمتابعة لاحقاً.',
    reviewDescription: 'راجع إجاباتك قبل إرسال الاستبيان.',
    consentText: 'أوافق على معالجة بياناتي وفقاً لسياسة الخصوصية في Hysio.',
    consentPrivacyPolicy: 'لمزيد من المعلومات، راجع سياسة الخصوصية الخاصة بنا.',
    submitSuccess: 'شكراً لك! تم إرسال الفحص المبدئي بنجاح.',
    exportSuccess: 'شكراً لك! تم استلام الفحص بنجاح.',
    draftSaved: 'تم حفظ مسودتك',
    draftExpired: 'انتهت صلاحية مسودتك',

    // Export functionality
    exportTitle: 'تنزيل الفحص الخاص بك',
    exportDescription: 'يمكنك الآن تنزيل الفحص المكتمل الخاص بك بتنسيقات مختلفة.',
    exportPDF: 'تنزيل بصيغة PDF',
    exportDOCX: 'تنزيل بصيغة Word',
    exportHTML: 'تنزيل بصيغة HTML',
    exportTXT: 'تنزيل كنص',
    exportGenerating: 'جاري الإنشاء...',
    exportComplete: 'التنزيل جاهز!',
    exportError: 'خطأ في إنشاء التنزيل.',
    sendEmail: 'إرسال عبر البريد الإلكتروني',
    sendEmailDescription: 'إرسال نسخة إلى بريدك الإلكتروني والعيادة.',
    sendEmailSuccess: 'تم إرسال البريد الإلكتروني بنجاح!',
    sendEmailError: 'خطأ في إرسال البريد الإلكتروني.',
    sendingEmail: 'جاري الإرسال...',
    downloadAs: 'تنزيل بصيغة',
    previewData: 'معاينة البيانات',
  },
};

export function getTranslations(lang: Language = 'nl'): Translations {
  return translations[lang] || translations.nl;
}