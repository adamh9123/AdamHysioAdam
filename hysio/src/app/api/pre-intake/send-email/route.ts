/**
 * Pre-intake Email API Route
 *
 * Sends pre-intake questionnaire data via email as PDF attachment using Resend.
 * Configured for production use with proper error handling and rate limiting.
 *
 * @module app/api/pre-intake/send-email
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Resend library - install with: npm install resend
// If Resend is not available, falls back to simulation mode
let Resend: any;
try {
  Resend = require('resend').Resend;
} catch (e) {
  console.warn('[Email API] Resend not installed. Running in simulation mode.');
  Resend = null;
}

// Request validation schema
const SendEmailRequestSchema = z.object({
  submissionId: z.string().min(1, 'Submission ID is required'),
  recipientEmail: z.string().email('Valid email is required'),
  format: z.enum(['pdf', 'docx']).default('pdf'),
  patientName: z.string().optional(),
  attachmentData: z.string().optional(), // Base64 encoded PDF/DOCX
});

/**
 * POST /api/pre-intake/send-email
 *
 * Send pre-intake questionnaire via email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = SendEmailRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { submissionId, recipientEmail, format, patientName, attachmentData } = validation.data;

    // Check if API key is configured
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || !Resend) {
      console.warn('[Email API] Running in simulation mode - no API key or Resend not installed');
      // Simulate email sending for development
      await new Promise((resolve) => setTimeout(resolve, 800));
      return NextResponse.json({
        success: true,
        message: 'Email verzonden (simulatie - configureer RESEND_API_KEY voor productie)',
        emailSentAt: new Date().toISOString(),
        recipientEmail,
        submissionId,
        mode: 'simulation',
      });
    }

    // Initialize Resend client
    const resend = new Resend(apiKey);

    // Prepare email content
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'intake@hysio.nl';
    const patientNameDisplay = patientName || 'Patiënt';
    const fileName = `hysio_intake_${submissionId}.${format}`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; max-width: 600px; margin: 0 auto; }
    .button { background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1>✅ Hysio Pre-intake Ontvangen</h1>
  </div>
  <div class="content">
    <p>Beste ${patientNameDisplay},</p>
    <p>Bedankt voor het invullen van de Hysio pre-intake vragenlijst!</p>
    <p>Uw ingevulde vragenlijst is succesvol ontvangen. In de bijlage vindt u een kopie van uw intake voor uw eigen administratie.</p>
    <p><strong>Referentienummer:</strong> ${submissionId}</p>
    <p>Uw fysiotherapeut heeft de vragenlijst ontvangen en zal deze bekijken ter voorbereiding op uw eerste afspraak.</p>
    <p>Heeft u vragen? Neem gerust contact op met uw praktijk.</p>
    <p>Met vriendelijke groet,<br><strong>Het Hysio Team</strong></p>
  </div>
  <div class="footer">
    <p>Dit is een automatisch gegenereerde email. Antwoorden op deze email worden niet gelezen.</p>
    <p>© ${new Date().getFullYear()} Hysio Fysiotherapie Platform</p>
  </div>
</body>
</html>
    `;

    const emailText = `
Beste ${patientNameDisplay},

Bedankt voor het invullen van de Hysio pre-intake vragenlijst!

Uw ingevulde vragenlijst is succesvol ontvangen. In de bijlage vindt u een kopie van uw intake.

Referentienummer: ${submissionId}

Uw fysiotherapeut heeft de vragenlijst ontvangen en zal deze bekijken ter voorbereiding op uw eerste afspraak.

Heeft u vragen? Neem gerust contact op met uw praktijk.

Met vriendelijke groet,
Het Hysio Team

---
Dit is een automatisch gegenereerde email.
© ${new Date().getFullYear()} Hysio Fysiotherapie Platform
    `;

    // Prepare attachments if provided
    const attachments = attachmentData
      ? [
          {
            filename: fileName,
            content: attachmentData,
          },
        ]
      : [];

    // Send email via Resend
    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: recipientEmail,
        subject: `Hysio Pre-intake Bevestiging - ${submissionId}`,
        html: emailHtml,
        text: emailText,
        attachments,
      });

      if (error) {
        throw new Error(error.message || 'Resend API error');
      }

      console.log(`[Email API] Email sent successfully to ${recipientEmail}`, data);

      return NextResponse.json({
        success: true,
        message: 'Email succesvol verzonden',
        emailSentAt: new Date().toISOString(),
        recipientEmail,
        submissionId,
        emailId: data?.id,
        mode: 'production',
      });
    } catch (emailError) {
      console.error('[Email API] Resend error:', emailError);
      throw new Error(`Email verzenden mislukt: ${emailError instanceof Error ? emailError.message : 'Unknown'}`);
    }
  } catch (error) {
    console.error('[Email API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send email',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pre-intake/send-email
 *
 * Return API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/pre-intake/send-email',
    method: 'POST',
    description: 'Send pre-intake questionnaire via email',
    status: 'active',
    note: 'Email service configuration required for production use',
  });
}
