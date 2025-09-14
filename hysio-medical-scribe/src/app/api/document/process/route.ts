import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, mkdtemp } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    console.log(`Processing document: ${file.name} (${file.type})`);

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'Unsupported file type. Only PDF and Word documents are supported.',
        filename: file.name,
        type: file.type
      }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'File is too large. Maximum size is 10MB.',
        filename: file.name,
        type: file.type
      }, { status: 400 });
    }

    // Create temporary directory and file
    const tempDir = await mkdtemp(join(tmpdir(), 'hysio-doc-'));
    tempFilePath = join(tempDir, file.name);

    // Write file to temporary location
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(tempFilePath, new Uint8Array(arrayBuffer));

    let extractedText = '';

    if (file.type === 'application/pdf') {
      // Dynamically import pdf-parse to avoid module resolution issues
      console.log('Processing PDF document server-side');

      try {
        const { default: pdfParse } = await import('pdf-parse');
        const pdfBuffer = Buffer.from(arrayBuffer);
        const pdfData = await pdfParse(pdfBuffer);
        extractedText = pdfData.text;
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        throw new Error(`Failed to parse PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
      }

    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword'
    ) {
      // Dynamically import mammoth to avoid module resolution issues
      console.log('Processing Word document server-side');

      try {
        const { default: mammoth } = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
        extractedText = result.value;

        // If raw text extraction fails or returns empty, try formatted text
        if (!extractedText || extractedText.trim().length === 0) {
          const formattedResult = await mammoth.convertToHtml({ buffer: Buffer.from(arrayBuffer) });
          // Strip HTML tags to get plain text
          extractedText = formattedResult.value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        }
      } catch (wordError) {
        console.error('Word document parsing error:', wordError);
        throw new Error(`Failed to parse Word document: ${wordError instanceof Error ? wordError.message : 'Unknown error'}`);
      }
    }

    // Clean up temporary file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError);
      }
    }

    // Clean up extracted text
    const cleanText = extractedText
      .replace(/\s+/g, ' ')  // Replace multiple whitespaces with single space
      .replace(/\n{3,}/g, '\n\n')  // Replace multiple newlines with double newline
      .trim();

    console.log(`Successfully processed document: ${file.name}, extracted ${cleanText.length} characters`);

    return NextResponse.json({
      success: true,
      text: cleanText,
      filename: file.name,
      type: file.type,
      length: cleanText.length
    });

  } catch (error) {
    console.error('Error processing document:', error);

    // Clean up temporary file in case of error
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file after error:', cleanupError);
      }
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error processing document',
      filename: 'unknown',
      type: 'unknown'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}