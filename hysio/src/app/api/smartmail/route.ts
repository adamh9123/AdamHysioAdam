import { NextRequest, NextResponse } from 'next/server';
import { generateContentWithOpenAI, HYSIO_LLM_MODEL, getAPIMetrics, healthCheck } from '@/lib/api/openai';

// Enhanced interface for SmartMail requests
interface SmartMailRequest {
  recipientType: 'general' | 'patient' | 'colleague' | 'huisarts';
  subject: string;
  context: string;
  tone: {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
    examples: string[];
  };
  language?: 'nl' | 'en' | 'ar' | 'fr' | 'de' | 'es' | 'zh' | 'hi';
  contentLength?: 'short' | 'medium' | 'extended';
  documents?: Array<{
    filename: string;
    type: string;
    content: string;
    source: string;
    timestamp: string;
    size?: number;
  }>;
  documentContext?: string; // Legacy support
  patientInfo?: {
    initials: string;
    age: number;
    chiefComplaint: string;
  };
  templateId?: string;
}

interface SmartMailResponse {
  success: boolean;
  email?: string;
  error?: string;
  metadata?: {
    recipientType: string;
    tone: string;
    wordCount: number;
    processingTime: number;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<SmartMailResponse>> {
  try {
    const startTime = Date.now();
    const data: SmartMailRequest = await request.json();

    // Validate required fields
    if (!data.context?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Context is required for email generation'
      }, { status: 400 });
    }

    if (!data.recipientType || !['general', 'patient', 'colleague', 'huisarts'].includes(data.recipientType)) {
      return NextResponse.json({
        success: false,
        error: 'Valid recipient type is required'
      }, { status: 400 });
    }

    if (!data.tone?.systemPrompt) {
      return NextResponse.json({
        success: false,
        error: 'Tone configuration is required'
      }, { status: 400 });
    }

    // Determine language and build language-specific prompts
    const selectedLanguage = data.language || 'nl';

    // Language-specific base prompts
    const baseSystemPrompts = {
      nl: `Je bent een professionele fysiotherapeut die een email schrijft.`,
      en: `You are a professional physiotherapist writing an email.`,
      ar: `أنت أخصائي علاج طبيعي محترف تكتب رسالة إلكترونية.`,
      fr: `Vous êtes un physiothérapeute professionnel qui écrit un e-mail.`,
      de: `Sie sind ein professioneller Physiotherapeut, der eine E-Mail schreibt.`,
      es: `Eres un fisioterapeuta profesional escribiendo un correo electrónico.`,
      zh: `你是一名专业的物理治疗师，正在写一封电子邮件。`,
      hi: `आप एक पेशेवर फिजियोथेरेपिस्ट हैं जो एक ईमेल लिख रहे हैं।`
    };

    const recipientSpecificPrompts = {
      nl: {
        general: `Schrijf een professionele, algemene email. Pas de toon aan aan de context zonder specifieke doelgroep aannames. Gebruik heldere, begrijpelijke taal die geschikt is voor diverse ontvangers.`,
        patient: `De ontvanger is een patiënt. Schrijf op een toegankelijke, empathische manier. Vermijd medisch jargon en leg complexe begrippen uit. Toon begrip voor hun situatie en geef duidelijke instructies.`,
        colleague: `De ontvanger is een collega-fysiotherapeut. Je kunt vakjargon gebruiken en technische details delen. Focus op professionele samenwerking en kennisdeling.`,
        huisarts: `De ontvanger is een huisarts. Schrijf formeel en professioneel met medische precisie. Geef relevante klinische informatie en duidelijke aanbevelingen.`
      },
      en: {
        general: `Write a professional, general email. Adapt the tone to the context without specific audience assumptions. Use clear, understandable language suitable for diverse recipients.`,
        patient: `The recipient is a patient. Write in an accessible, empathetic manner. Avoid medical jargon and explain complex terms. Show understanding for their situation and provide clear instructions.`,
        colleague: `The recipient is a fellow physiotherapist. You can use professional jargon and share technical details. Focus on professional collaboration and knowledge sharing.`,
        huisarts: `The recipient is a general practitioner. Write formally and professionally with medical precision. Provide relevant clinical information and clear recommendations.`
      },
      ar: {
        general: `اكتب رسالة إلكترونية مهنية عامة. اضبط النبرة حسب السياق دون افتراضات جمهور محددة. استخدم لغة واضحة ومفهومة تناسب المتلقين المتنوعين.`,
        patient: `المستقبل هو مريض. اكتب بطريقة سهلة الفهم ومتعاطفة. تجنب المصطلحات الطبية واشرح المفاهيم المعقدة. أظهر فهماً لحالتهم وقدم تعليمات واضحة.`,
        colleague: `المستقبل هو زميل أخصائي علاج طبيعي. يمكنك استخدام المصطلحات المهنية ومشاركة التفاصيل التقنية. ركز على التعاون المهني وتبادل المعرفة.`,
        huisarts: `المستقبل هو طبيب عام. اكتب بشكل رسمي ومهني مع الدقة الطبية. قدم معلومات سريرية ذات صلة وتوصيات واضحة.`
      },
      fr: {
        general: `Rédigez un e-mail professionnel général. Adaptez le ton au contexte sans suppositions d'audience spécifique. Utilisez un langage clair et compréhensible adapté à divers destinataires.`,
        patient: `Le destinataire est un patient. Écrivez de manière accessible et empathique. Évitez le jargon médical et expliquez les termes complexes. Montrez de la compréhension pour leur situation et donnez des instructions claires.`,
        colleague: `Le destinataire est un collègue physiothérapeute. Vous pouvez utiliser le jargon professionnel et partager des détails techniques. Concentrez-vous sur la collaboration professionnelle et le partage de connaissances.`,
        huisarts: `Le destinataire est un médecin généraliste. Écrivez de manière formelle et professionnelle avec précision médicale. Fournissez des informations cliniques pertinentes et des recommandations claires.`
      },
      de: {
        general: `Schreiben Sie eine professionelle, allgemeine E-Mail. Passen Sie den Ton an den Kontext an, ohne spezifische Zielgruppenannahmen. Verwenden Sie klare, verständliche Sprache, die für verschiedene Empfänger geeignet ist.`,
        patient: `Der Empfänger ist ein Patient. Schreiben Sie zugänglich und empathisch. Vermeiden Sie medizinisches Fachjargon und erklären Sie komplexe Begriffe. Zeigen Sie Verständnis für ihre Situation und geben Sie klare Anweisungen.`,
        colleague: `Der Empfänger ist ein Kollege Physiotherapeut. Sie können Fachjargon verwenden und technische Details teilen. Konzentrieren Sie sich auf professionelle Zusammenarbeit und Wissensaustausch.`,
        huisarts: `Der Empfänger ist ein Hausarzt. Schreiben Sie formal und professionell mit medizinischer Präzision. Geben Sie relevante klinische Informationen und klare Empfehlungen.`
      },
      es: {
        general: `Escribe un correo electrónico profesional general. Adapta el tono al contexto sin suposiciones de audiencia específica. Usa un lenguaje claro y comprensible adecuado para diversos destinatarios.`,
        patient: `El destinatario es un paciente. Escribe de manera accesible y empática. Evita la jerga médica y explica términos complejos. Muestra comprensión por su situación y proporciona instrucciones claras.`,
        colleague: `El destinatario es un colega fisioterapeuta. Puedes usar jerga profesional y compartir detalles técnicos. Enfócate en la colaboración profesional y el intercambio de conocimientos.`,
        huisarts: `El destinatario es un médico general. Escribe de manera formal y profesional con precisión médica. Proporciona información clínica relevante y recomendaciones claras.`
      },
      zh: {
        general: `写一封专业的一般电子邮件。根据上下文调整语调，不做特定受众假设。使用适合不同收件人的清晰易懂的语言。`,
        patient: `收件人是患者。以易懂、有同理心的方式写作。避免医学术语，解释复杂概念。对他们的情况表示理解，并提供清晰的指导。`,
        colleague: `收件人是同事物理治疗师。您可以使用专业术语并分享技术细节。专注于专业合作和知识分享。`,
        huisarts: `收件人是全科医生。以正式和专业的方式写作，确保医学精确性。提供相关的临床信息和明确的建议。`
      },
      hi: {
        general: `एक पेशेवर, सामान्य ईमेल लिखें। विशिष्ट दर्शक धारणाओं के बिना संदर्भ के अनुसार स्वर को अनुकूलित करें। विविध प्राप्तकर्ताओं के लिए उपयुक्त स्पष्ट, समझने योग्य भाषा का उपयोग करें।`,
        patient: `प्राप्तकर्ता एक मरीज है। सुलभ, सहानुभूतिपूर्ण तरीके से लिखें। चिकित्सा शब्दजाल से बचें और जटिल शब्दों को समझाएं। उनकी स्थिति के लिए समझ दिखाएं और स्पष्ट निर्देश दें।`,
        colleague: `प्राप्तकर्ता एक साथी फिजियोथेरेपिस्ट है। आप पेशेवर शब्दजाल का उपयोग कर सकते हैं और तकनीकी विवरण साझा कर सकते हैं। पेशेवर सहयोग और ज्ञान साझाकरण पर ध्यान दें।`,
        huisarts: `प्राप्तकर्ता एक सामान्य चिकित्सक है। चिकित्सा सटीकता के साथ औपचारिक और पेशेवर तरीके से लिखें। प्रासंगिक नैदानिक जानकारी और स्पष्ट सिफारिशें प्रदान करें।`
      }
    };

    const baseSystemPrompt = baseSystemPrompts[selectedLanguage] || baseSystemPrompts.nl;

    const contextualElements = [];

    // Add patient context if available
    if (data.patientInfo) {
      contextualElements.push(`Patiëntgegevens: ${data.patientInfo.initials} (${data.patientInfo.age} jaar), klacht: ${data.patientInfo.chiefComplaint}`);
    }

    // Add document context if available (new format) - Process ALL documents
    if (data.documents && data.documents.length > 0) {
      const documentSummary = data.documents.map((doc, index) =>
        `Document ${index + 1}: ${doc.filename} (${doc.type}, ${doc.size ? Math.round(doc.size/1024) + 'KB' : 'unknown size'})`
      ).join(', ');
      contextualElements.push(`\nDocumenten toegevoegd (${data.documents.length} bestanden): ${documentSummary}`);

      // Add all document contents with clear separators
      data.documents.forEach((doc, index) => {
        contextualElements.push(`\n=== DOCUMENT ${index + 1}: ${doc.filename.toUpperCase()} ===`);
        contextualElements.push(doc.content);
        contextualElements.push(`=== EINDE DOCUMENT ${index + 1} ===\n`);
      });

      // Add instruction to use all documents
      const documentInstruction = selectedLanguage === 'nl'
        ? `\nBELANGRIJK: Gebruik informatie uit ALLE ${data.documents.length} bovenstaande documenten waar relevant. Verwijs naar specifieke documenten bij naam wanneer je informatie gebruikt.`
        : `\nIMPORTANT: Use information from ALL ${data.documents.length} documents above where relevant. Reference specific documents by name when using information.`;
      contextualElements.push(documentInstruction);
    }

    // Legacy document context support
    if (data.documentContext && !data.documents) {
      contextualElements.push(`Extra documentcontext: ${data.documentContext}`);
    }

    // Language-specific instructions
    const languageInstructions = {
      nl: {
        write: 'Schrijf in het Nederlands',
        professional: 'Gebruik een professionele maar toegankelijke taal',
        greeting: 'Begin met een gepaste aanhef',
        closing: 'Eindig met een gepaste afsluiting',
        structure: 'Zorg voor een duidelijke structuur',
        privacy: 'Houd rekening met privacy en geen gevoelige medische informatie in detail',
        subject: 'Onderwerp',
        context: 'Context om te communiceren',
        generate: 'Genereer een volledige, professionele email.'
      },
      en: {
        write: 'Write in English',
        professional: 'Use professional but accessible language',
        greeting: 'Start with an appropriate greeting',
        closing: 'End with an appropriate closing',
        structure: 'Ensure clear structure',
        privacy: 'Consider privacy and no sensitive medical information in detail',
        subject: 'Subject',
        context: 'Context to communicate',
        generate: 'Generate a complete, professional email.'
      },
      ar: {
        write: 'اكتب باللغة العربية',
        professional: 'استخدم لغة مهنية ولكن مفهومة',
        greeting: 'ابدأ بتحية مناسبة',
        closing: 'انته بخاتمة مناسبة',
        structure: 'تأكد من وضوح الهيكل',
        privacy: 'راع الخصوصية ولا تذكر معلومات طبية حساسة بالتفصيل',
        subject: 'الموضوع',
        context: 'السياق للتواصل',
        generate: 'قم بإنشاء رسالة إلكترونية كاملة ومهنية.'
      },
      fr: {
        write: 'Écrivez en français',
        professional: 'Utilisez un langage professionnel mais accessible',
        greeting: 'Commencez par une salutation appropriée',
        closing: 'Terminez par une conclusion appropriée',
        structure: 'Assurez-vous d\'une structure claire',
        privacy: 'Respectez la confidentialité et ne donnez pas d\'informations médicales sensibles en détail',
        subject: 'Sujet',
        context: 'Contexte à communiquer',
        generate: 'Générez un e-mail complet et professionnel.'
      },
      de: {
        write: 'Schreiben Sie auf Deutsch',
        professional: 'Verwenden Sie professionelle aber zugängliche Sprache',
        greeting: 'Beginnen Sie mit einer angemessenen Begrüßung',
        closing: 'Beenden Sie mit einem angemessenen Abschluss',
        structure: 'Sorgen Sie für eine klare Struktur',
        privacy: 'Berücksichtigen Sie Datenschutz und keine sensiblen medizinischen Informationen im Detail',
        subject: 'Betreff',
        context: 'Zu kommunizierender Kontext',
        generate: 'Erstellen Sie eine vollständige, professionelle E-Mail.'
      },
      es: {
        write: 'Escribe en español',
        professional: 'Usa un lenguaje profesional pero accesible',
        greeting: 'Comienza con un saludo apropiado',
        closing: 'Termina con un cierre apropiado',
        structure: 'Asegura una estructura clara',
        privacy: 'Considera la privacidad y no información médica sensible en detalle',
        subject: 'Asunto',
        context: 'Contexto a comunicar',
        generate: 'Genera un correo electrónico completo y profesional.'
      },
      zh: {
        write: '用中文写作',
        professional: '使用专业但易懂的语言',
        greeting: '以适当的问候开始',
        closing: '以适当的结束语结尾',
        structure: '确保结构清晰',
        privacy: '考虑隐私，不要详细说明敏感的医疗信息',
        subject: '主题',
        context: '需要沟通的背景',
        generate: '生成一封完整、专业的电子邮件。'
      },
      hi: {
        write: 'हिंदी में लिखें',
        professional: 'पेशेवर लेकिन सुलभ भाषा का उपयोग करें',
        greeting: 'उचित अभिवादन के साथ शुरू करें',
        closing: 'उचित समापन के साथ समाप्त करें',
        structure: 'स्पष्ट संरचना सुनिश्चित करें',
        privacy: 'गोपनीयता का ध्यान रखें और संवेदनशील चिकित्सा जानकारी का विस्तार न दें',
        subject: 'विषय',
        context: 'संवाद करने का संदर्भ',
        generate: 'एक पूर्ण, पेशेवर ईमेल बनाएं।'
      }
    };

    const instructions = languageInstructions[selectedLanguage] || languageInstructions.nl;
    const recipientPrompt = recipientSpecificPrompts[selectedLanguage]?.[data.recipientType] ||
                           recipientSpecificPrompts.nl[data.recipientType];

    // Add content length instructions
    const contentLength = data.contentLength || 'medium';
    const lengthInstructions = {
      nl: {
        short: 'Houd de email KORT en bondig: ongeveer 100 woorden. Wees direct en to-the-point.',
        medium: 'Schrijf een email van GEMIDDELDE lengte: ongeveer 300 woorden. Geef voldoende detail zonder uitweiden.',
        extended: 'Schrijf een UITGEBREIDE email: 500+ woorden. Geef uitgebreide uitleg en context waar nodig.'
      },
      en: {
        short: 'Keep the email SHORT and concise: approximately 100 words. Be direct and to-the-point.',
        medium: 'Write a MEDIUM length email: approximately 300 words. Provide sufficient detail without elaborating too much.',
        extended: 'Write an EXTENDED email: 500+ words. Provide comprehensive explanation and context where needed.'
      }
    };

    const lengthInstruction = lengthInstructions[selectedLanguage]?.[contentLength] || lengthInstructions.nl[contentLength];

    // Build the complete prompt
    const systemPrompt = `${baseSystemPrompt}

${recipientPrompt}

${data.tone.systemPrompt}

${instructions.write === 'Schrijf in het Nederlands' ? 'Specifieke instructies:' : 'Specific instructions:'}
- ${instructions.write}
- ${lengthInstruction}
- ${instructions.professional}
- ${instructions.greeting}
- ${instructions.closing}
- ${instructions.structure}
- ${instructions.privacy}
${contextualElements.length > 0 ? '\n' + contextualElements.join('\n') : ''}

${instructions.subject}: ${data.subject}
${instructions.context}: ${data.context}

${instructions.generate}`;

    // Determine reasoning effort based on email complexity
    // Context analysis for optimization (informational only for GPT-4.1-mini)
    const hasDocuments = data.documents && data.documents.length > 0;
    const hasMultipleDocuments = data.documents && data.documents.length > 1;
    const isComplexRecipient = data.recipientType === 'huisarts'; // Medical professional requires more precision
    const hasLongContext = systemPrompt.length > 3000;

    // Generate the email using OpenAI
    const aiResponse = await generateContentWithOpenAI(
      systemPrompt,
      '', // Empty user prompt since we include everything in system prompt
      {
        model: HYSIO_LLM_MODEL,
        temperature: 0.7, // Balanced for professional email communication
        max_tokens: 1000, // Sufficient tokens for email content
      }
    );

    if (!aiResponse.success || !aiResponse.content) {
      return NextResponse.json({
        success: false,
        error: aiResponse.error || 'Failed to generate email content'
      }, { status: 500 });
    }

    const processingTime = Date.now() - startTime;
    const wordCount = aiResponse.content.split(' ').length;

    return NextResponse.json({
      success: true,
      email: aiResponse.content,
      metadata: {
        recipientType: data.recipientType,
        tone: data.tone.name,
        wordCount,
        processingTime
      }
    });

  } catch (error) {
    console.error('SmartMail API Error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// Health check endpoint with enhanced monitoring
export async function GET(): Promise<NextResponse> {
  try {
    const health = await healthCheck();
    const metrics = getAPIMetrics();

    return NextResponse.json({
      status: health.status,
      service: 'SmartMail API',
      version: '2.0.0',
      features: [
        'Multi-recipient support',
        'Tone customization',
        'Patient context integration',
        'Document context support',
        'Template support',
        'Rate limiting',
        'Cost monitoring',
        'Enhanced error handling'
      ],
      health: health.status,
      metrics: {
        totalRequests: metrics.requestCount,
        totalCost: parseFloat(metrics.totalCost.toFixed(6)),
        averageLatency: parseFloat(metrics.averageLatency.toFixed(2))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      service: 'SmartMail API',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}