/**
 * Clinical Data Formatter Utility
 *
 * Formats structured clinical JSON data (klinische conclusie, zorgplan, etc.)
 * into readable, professional Dutch text for display in the UI.
 *
 * @module lib/utils/clinical-formatter
 */

/**
 * Format klinische conclusie data into readable text
 */
export function formatKlinischeConclusie(data: any): string {
  if (typeof data === 'string') {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return 'Geen conclusie data beschikbaar';
  }

  const sections: string[] = [];

  // Fysiotherapeutische Diagnose
  if (data.fysiotherapeutischeDiagnose) {
    sections.push('═══ FYSIOTHERAPEUTISCHE DIAGNOSE ═══\n');

    const diagnose = data.fysiotherapeutischeDiagnose.primaireDiagnose;
    if (diagnose) {
      sections.push(`📋 Primaire Diagnose: ${diagnose.diagnose || 'Niet opgegeven'}`);
      sections.push(`🎯 Zekerheid: ${diagnose.zekerheid || 'Niet opgegeven'}`);

      if (diagnose.klinischeRedenering) {
        sections.push(`\n💭 Klinische Redenering:\n${diagnose.klinischeRedenering}`);
      }
    }
    sections.push('');
  }

  // Behandelplan
  if (data.behandelplan) {
    sections.push('═══ BEHANDELPLAN ═══\n');

    // Behandeldoelen
    if (data.behandelplan.behandeldoelen && data.behandelplan.behandeldoelen.length > 0) {
      sections.push('🎯 Behandeldoelen:');
      data.behandelplan.behandeldoelen.forEach((doel: any, index: number) => {
        const termijn = doel.type === 'korte termijn' ? '📅 Korte termijn' : '📆 Lange termijn';
        sections.push(`\n${index + 1}. ${termijn} (${doel.tijdstermijn || 'geen tijdstermijn'})`);
        sections.push(`   ${doel.doel || doel.meetcriteria || 'Geen doel opgegeven'}`);
        if (doel.prioriteit) {
          sections.push(`   Prioriteit: ${doel.prioriteit}`);
        }
      });
      sections.push('');
    }

    // Interventies
    if (data.behandelplan.interventies && data.behandelplan.interventies.length > 0) {
      sections.push('🏥 Interventies:');
      data.behandelplan.interventies.forEach((interventie: any, index: number) => {
        sections.push(`\n${index + 1}. ${interventie.type || 'Interventie'}`);
        sections.push(`   ${interventie.beschrijving || interventie.interventie || 'Geen beschrijving'}`);
        if (interventie.frequentie) {
          sections.push(`   Frequentie: ${interventie.frequentie}`);
        }
        if (interventie.duur) {
          sections.push(`   Duur per sessie: ${interventie.duur}`);
        }
      });
      sections.push('');
    }

    // Behandelfrequentie
    if (data.behandelplan.behandelfrequentie) {
      const freq = data.behandelplan.behandelfrequentie;
      sections.push(`⏰ Behandelfrequentie: ${freq.sessiesPerWeek || 0}x per week, ${freq.duurPerSessie || '45 minuten'} per sessie`);
      sections.push('');
    }

    // Geschatte duur
    if (data.behandelplan.geschatteDuur) {
      const duur = data.behandelplan.geschatteDuur;
      sections.push(`📊 Geschatte behandelduur: ${duur.totaalWeken || 0} weken totaal`);
      if (duur.fase1Weken || duur.fase2Weken) {
        sections.push(`   Fase 1: ${duur.fase1Weken || 0} weken | Fase 2: ${duur.fase2Weken || 0} weken`);
      }
      sections.push('');
    }
  }

  // Prognose
  if (data.prognose) {
    sections.push('═══ PROGNOSE ═══\n');

    // Verwacht herstel
    if (data.prognose.verwachtHerstel) {
      const herstel = data.prognose.verwachtHerstel;
      sections.push('📈 Verwacht herstel:');
      if (herstel.functioneelHerstel) sections.push(`   • Functioneel: ${herstel.functioneelHerstel}`);
      if (herstel.pijnReductie) sections.push(`   • Pijnreductie: ${herstel.pijnReductie}`);
      if (herstel.activiteitenHerstel) sections.push(`   • Activiteiten: ${herstel.activiteitenHerstel}`);
      if (herstel.participatieHerstel) sections.push(`   • Participatie: ${herstel.participatieHerstel}`);
      sections.push('');
    }

    // Tijdlijn
    if (data.prognose.tijdlijn && data.prognose.tijdlijn.kortetermijn) {
      sections.push('⏱️ Tijdlijn:');
      sections.push(`${data.prognose.tijdlijn.kortetermijn}`);
      sections.push('');
    }

    // Prognostische factoren
    if (data.prognose.prognostischeFactoren && data.prognose.prognostischeFactoren.length > 0) {
      const gunstig = data.prognose.prognostischeFactoren.filter((f: any) => f.type === 'gunstig');
      const ongunstig = data.prognose.prognostischeFactoren.filter((f: any) => f.type === 'ongunstig');

      if (gunstig.length > 0) {
        sections.push('✅ Gunstige factoren:');
        gunstig.forEach((f: any) => sections.push(`   • ${f.factor || f.beschrijving}`));
        sections.push('');
      }

      if (ongunstig.length > 0) {
        sections.push('⚠️ Ongunstige factoren:');
        ongunstig.forEach((f: any) => sections.push(`   • ${f.factor || f.beschrijving}`));
        sections.push('');
      }
    }
  }

  // Behandeladvies
  if (data.behandeladvies) {
    sections.push('═══ BEHANDELADVIES ═══\n');

    // Zelfmanagement
    if (data.behandeladvies.zelfmanagement && data.behandeladvies.zelfmanagement.length > 0) {
      sections.push('🏠 Zelfmanagement:');
      data.behandeladvies.zelfmanagement.forEach((advies: any) => {
        const freq = advies.frequentie ? ` (${advies.frequentie})` : '';
        sections.push(`   • ${advies.advies}${freq}`);
      });
      sections.push('');
    }

    // Leefstijladvies
    if (data.behandeladvies.leefstijladvies && data.behandeladvies.leefstijladvies.length > 0) {
      sections.push('💪 Leefstijladvies:');
      data.behandeladvies.leefstijladvies.forEach((advies: string) => {
        sections.push(`   • ${advies}`);
      });
      sections.push('');
    }
  }

  // Samenvatting Conclusie
  if (data.samenvattingConclusie) {
    sections.push('═══ SAMENVATTING ═══\n');

    if (data.samenvattingConclusie.kernConclusies && data.samenvattingConclusie.kernConclusies.length > 0) {
      sections.push('🔑 Kernconclusies:');
      data.samenvattingConclusie.kernConclusies.forEach((conclusie: string) => {
        if (conclusie && conclusie.trim()) {
          sections.push(`   ${conclusie.trim()}`);
        }
      });
      sections.push('');
    }

    if (data.samenvattingConclusie.behandelRationale) {
      sections.push('📝 Behandelrationale:');
      sections.push(`${data.samenvattingConclusie.behandelRationale}`);
      sections.push('');
    }
  }

  return sections.join('\n');
}

/**
 * Format zorgplan data into readable text
 */
export function formatZorgplan(data: any): string {
  if (typeof data === 'string') {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return 'Geen zorgplan data beschikbaar';
  }

  // If data has same structure as klinische conclusie, use that formatter
  if (data.fysiotherapeutischeDiagnose || data.behandelplan || data.prognose) {
    return formatKlinischeConclusie(data);
  }

  const sections: string[] = [];

  // Generic zorgplan structure
  if (data.doelen) {
    sections.push('═══ BEHANDELDOELEN ═══\n');
    if (Array.isArray(data.doelen)) {
      data.doelen.forEach((doel: any, index: number) => {
        sections.push(`${index + 1}. ${typeof doel === 'string' ? doel : doel.doel || 'Geen doel opgegeven'}`);
      });
    } else if (typeof data.doelen === 'string') {
      sections.push(data.doelen);
    }
    sections.push('');
  }

  if (data.strategie) {
    sections.push('═══ BEHANDELSTRATEGIE ═══\n');
    sections.push(data.strategie);
    sections.push('');
  }

  if (data.evaluatie) {
    sections.push('═══ EVALUATIE ═══\n');
    sections.push(data.evaluatie);
    sections.push('');
  }

  // Fallback: if no recognized structure, stringify nicely
  if (sections.length === 0) {
    return formatKlinischeConclusie(data);
  }

  return sections.join('\n');
}

/**
 * Format any structured clinical text for context cards
 */
export function formatContextData(data: any): string {
  if (typeof data === 'string') {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return 'Geen data beschikbaar';
  }

  // Extract hhsbStructure if present (anamnese)
  if (data.hhsbStructure) {
    const hhsb = data.hhsbStructure;
    const sections: string[] = [];

    if (hhsb.hulpvraag) {
      sections.push('═══ HULPVRAAG ═══');
      sections.push(hhsb.hulpvraag);
      sections.push('');
    }

    if (hhsb.historie) {
      sections.push('═══ HISTORIE ═══');
      sections.push(hhsb.historie);
      sections.push('');
    }

    if (hhsb.stoornissen) {
      sections.push('═══ STOORNISSEN ═══');
      sections.push(hhsb.stoornissen);
      sections.push('');
    }

    if (hhsb.beperkingen) {
      sections.push('═══ BEPERKINGEN ═══');
      sections.push(hhsb.beperkingen);
      sections.push('');
    }

    if (sections.length > 0) {
      return sections.join('\n');
    }
  }

  // Extract onderzoeksbevindingen if present (onderzoek)
  if (data.onderzoeksBevindingen || data.examinationFindings) {
    const onderzoek = data.onderzoeksBevindingen || data.examinationFindings;
    const sections: string[] = [];

    if (onderzoek.inspectie) {
      sections.push('═══ INSPECTIE ═══');
      sections.push(onderzoek.inspectie);
      sections.push('');
    }

    if (onderzoek.palpatie) {
      sections.push('═══ PALPATIE ═══');
      sections.push(onderzoek.palpatie);
      sections.push('');
    }

    if (onderzoek.bewegingsonderzoek) {
      sections.push('═══ BEWEGINGSONDERZOEK ═══');
      sections.push(onderzoek.bewegingsonderzoek);
      sections.push('');
    }

    if (onderzoek.summary) {
      sections.push('═══ SAMENVATTING ═══');
      sections.push(onderzoek.summary);
      sections.push('');
    }

    if (sections.length > 0) {
      return sections.join('\n');
    }
  }

  // Fallback: Pretty print JSON
  return JSON.stringify(data, null, 2);
}

/**
 * Get copyable text from formatted data (strips emojis for professional documents)
 */
export function getCopyableText(data: any, formatter: (data: any) => string): string {
  const formatted = formatter(data);

  // Remove emojis for professional copy
  return formatted
    .replace(/[📋🎯💭═🏥⏰📊📈✅⚠️🏠💪🔑📝⏱️📅📆]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
