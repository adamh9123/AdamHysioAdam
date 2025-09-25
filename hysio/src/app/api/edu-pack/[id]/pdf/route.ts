// PDF Generation API for EduPack Module
// Generates downloadable PDF documents from EduPack content

import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { EduPackContent } from '@/lib/types/edupack';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eduPackId } = await params;

    // In a real implementation, you would fetch the EduPack content from database
    // For now, we'll get it from request headers or session storage
    const contentHeader = request.headers.get('x-edupack-content');

    if (!contentHeader) {
      return NextResponse.json(
        { error: 'EduPack content not found' },
        { status: 404 }
      );
    }

    let content: EduPackContent;
    try {
      content = JSON.parse(decodeURIComponent(contentHeader));
    } catch {
      return NextResponse.json(
        { error: 'Invalid EduPack content format' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBytes = await generatePDF(content);

    // Return PDF response
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="edupack-${content.patientName || 'patient'}-${new Date().toISOString().split('T')[0]}.pdf"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

async function generatePDF(content: EduPackContent): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  let currentPage = pdfDoc.addPage([595, 842]); // A4 size

  // Get fonts
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const smallFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = currentPage.getSize();
  let currentY = height - 60;

  // Colors
  const primaryColor = rgb(0.098, 0.365, 0.365); // Hysio deep green
  const textColor = rgb(0.2, 0.2, 0.2);
  const lightGray = rgb(0.5, 0.5, 0.5);

  // Header with Hysio branding
  currentPage.drawText('Hysio EduPack', {
    x: 50,
    y: currentY,
    size: 24,
    font: titleFont,
    color: primaryColor,
  });

  currentY -= 30;

  // Patient and session info
  if (content.patientName) {
    currentPage.drawText(`Voor: ${content.patientName}`, {
      x: 50,
      y: currentY,
      size: 12,
      font: bodyFont,
      color: textColor,
    });
    currentY -= 20;
  }

  currentPage.drawText(`Gegenereerd op: ${new Date(content.generatedAt).toLocaleDateString('nl-NL')}`, {
    x: 50,
    y: currentY,
    size: 10,
    font: smallFont,
    color: lightGray,
  });

  currentPage.drawText(`Sessie type: ${content.sessionType === 'intake' ? 'Eerste afspraak' : 'Controle'}`, {
    x: 300,
    y: currentY,
    size: 10,
    font: smallFont,
    color: lightGray,
  });

  currentY -= 40;

  // Content sections
  const enabledSections = content.sections.filter(s => s.enabled && s.content.trim());

  for (const section of enabledSections) {
    // Check if we need a new page
    if (currentY < 150) {
      currentPage = pdfDoc.addPage([595, 842]);
      currentY = height - 60;
    }

    // Section title with icon
    currentPage.drawText(section.icon + ' ' + section.title, {
      x: 50,
      y: currentY,
      size: 14,
      font: titleFont,
      color: primaryColor,
    });

    currentY -= 25;

    // Section content with text wrapping
    const lines = wrapText(section.content, bodyFont, 10, width - 100);

    for (const line of lines) {
      if (currentY < 50) {
        // Create new page if needed
        currentPage = pdfDoc.addPage([595, 842]);
        currentY = height - 60;
      }

      currentPage.drawText(line, {
        x: 50,
        y: currentY,
        size: 10,
        font: bodyFont,
        color: textColor,
      });
      currentY -= 15;
    }

    currentY -= 20; // Space between sections
  }

  // Footer disclaimer
  if (currentY < 120) {
    currentPage = pdfDoc.addPage([595, 842]);
    currentY = height - 60;
  }

  // Add separator line
  currentY -= 20;
  currentPage.drawLine({
    start: { x: 50, y: currentY },
    end: { x: width - 50, y: currentY },
    thickness: 1,
    color: lightGray,
  });

  currentY -= 30;

  const disclaimerText = [
    'Deze informatie is gegenereerd door Hysio Medical Scribe en is bedoeld ter',
    'ondersteuning van uw behandeling. De inhoud is gebaseerd op uw persoonlijke',
    'sessie en is afgestemd op uw specifieke situatie.',
    '',
    'Belangrijke opmerkingen:',
    '• Deze informatie vervangt geen professioneel medisch advies',
    '• Neem bij vragen altijd contact op met uw behandelaar',
    '• Volg de gegeven adviezen alleen op zoals besproken tijdens uw afspraak',
    '',
    'Voor vragen of onduidelijkheden kunt u contact opnemen met uw fysiotherapeut.'
  ];

  for (const line of disclaimerText) {
    if (currentY < 30) break; // Don't overflow page

    currentPage.drawText(line, {
      x: 50,
      y: currentY,
      size: 8,
      font: smallFont,
      color: lightGray,
    });
    currentY -= 12;
  }

  // Generate and return PDF bytes
  return await pdfDoc.save();
}

function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const textWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (textWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Word too long, force break
        lines.push(word);
        currentLine = '';
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}