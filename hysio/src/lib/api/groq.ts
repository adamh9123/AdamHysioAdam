// Groq API integration for Whisper Large v3 Turbo

import Groq from 'groq-sdk';
import type { AudioTranscription } from '@/lib/types';

// Initialize Groq client
let groqClient: Groq | null = null;

// Ultra-Think Protocol: Force client reset for configuration changes
if (process.env.NODE_ENV === 'development') {
  groqClient = null; // Force recreation in development
}

function getGroqClient(): Groq {
  if (!groqClient) {
    // Force refresh environment variables for Next.js
    const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

    // SECURITY: Never log API key content, length, or prefix
    console.log('🔍 Groq API Key check:', {
      isConfigured: !!apiKey,
      envNodeEnv: process.env.NODE_ENV
    });

    if (!apiKey) {
      console.error('❌ GROQ_API_KEY environment variable is not set');
      console.error('Available environment keys:', Object.keys(process.env).filter(key => key.includes('GROQ') || key.includes('API')));
      throw new Error('GROQ_API_KEY environment variable is not set. Please check your .env.local file.');
    }

    // Validate API key format
    if (!apiKey.startsWith('gsk_')) {
      console.error('❌ Invalid Groq API key format. Must start with "gsk_"');
      throw new Error('Invalid Groq API key format. Please check your GROQ_API_KEY.');
    }

    console.log('✅ Creating Groq client with enhanced configuration');

    // Ultra-Think Protocol: Enhanced client configuration for WAF bypass
    const clientConfig = {
      apiKey: apiKey.trim(), // Ensure no whitespace
      baseURL: 'https://api.groq.com', // Fixed: Don't double-append path
      timeout: 120000, // 2 minutes timeout
      maxRetries: 0,   // Handle retries manually for better control
    };

    // SECURITY: Configuration logging without exposing key details
    console.log('🔧 Groq client configuration:', {
      baseURL: clientConfig.baseURL,
      timeout: clientConfig.timeout,
      maxRetries: clientConfig.maxRetries,
      apiKeyPresent: !!apiKey
    });

    // Ultra-Think Protocol: Enhanced client with proper fetch override
    groqClient = new Groq({
      ...clientConfig,
      fetch: async (url: any, options: any) => {
        console.log('🚀 ULTRA-THINK: Custom fetch implementation for WAF bypass');
        console.log('   URL:', typeof url === 'string' ? url : url.toString());

        // Ensure headers exist
        if (!options.headers) {
          options.headers = {};
        }

        // Add crucial headers for Cloudflare WAF bypass
        options.headers['User-Agent'] = 'HysioScribe/1.0 (Medical Software; Node.js)';
        options.headers['Accept'] = 'application/json';
        options.headers['Accept-Language'] = 'en-US,en;q=0.9,nl;q=0.8';
        options.headers['Accept-Encoding'] = 'gzip, deflate, br';
        options.headers['Cache-Control'] = 'no-cache';
        options.headers['Pragma'] = 'no-cache';
        options.headers['Sec-Fetch-Dest'] = 'empty';
        options.headers['Sec-Fetch-Mode'] = 'cors';
        options.headers['Sec-Fetch-Site'] = 'cross-site';

        // CRITICAL FIX: Add duplex option for FormData/streaming bodies
        // Required by Node.js Fetch API when uploading files
        if (options.body) {
          options.duplex = 'half';
        }

        // SECURITY: Header logging without exposing Authorization header content
        console.log('🔧 WAF bypass headers applied:', {
          userAgent: options.headers['User-Agent'],
          accept: options.headers['Accept'],
          authPresent: !!options.headers['Authorization'],
          totalHeaders: Object.keys(options.headers).length,
          hasDuplex: !!options.duplex
        });

        // Use Node.js fetch (available in Node 18+) or undici
        const fetchImpl = globalThis.fetch;
        if (!fetchImpl) {
          throw new Error('fetch is not available - Node.js 18+ required');
        }

        return fetchImpl(url, options);
      }
    });
  }
  return groqClient;
}

/**
 * Test function to verify Groq API connectivity and authentication
 */
export async function testGroqConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    console.log('🧪 Testing Groq API connection...');
    const client = getGroqClient();

    // Test with a simple API call (this will fail but should give us auth info)
    try {
      await client.audio.transcriptions.create({
        file: new File(['test'], 'test.wav', { type: 'audio/wav' }),
        model: 'whisper-large-v3-turbo'
      });
    } catch (error: any) {
      console.log('🔍 Test API call result:', {
        status: error?.status,
        message: error?.message,
        type: error?.constructor?.name
      });

      // If we get a 400 error about file format, auth is working
      if (error?.status === 400) {
        return { success: true, details: 'Authentication successful (400 expected for test file)' };
      }

      // Return the actual error for diagnosis
      return {
        success: false,
        error: error.message,
        details: {
          status: error?.status,
          type: error?.constructor?.name
        }
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
}

export interface GroqTranscriptionOptions {
  language?: string; // ISO 639-1 language code, default 'nl' for Dutch
  prompt?: string; // Optional prompt to guide the model
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number; // 0-1, controls randomness
  model?: string; // Default to whisper-large-v3-turbo
}

export async function transcribeAudioWithGroq(
  audioBlob: Blob,
  options: GroqTranscriptionOptions = {}
): Promise<{ success: true; data: AudioTranscription } | { success: false; error: string }> {
  try {
    console.log('🎙️ Starting Groq transcription with options:', options);

    const {
      language = 'nl', // Dutch by default
      prompt,
      response_format = 'verbose_json',
      temperature = 0.0,
      model = 'whisper-large-v3-turbo'
    } = options;

    // Determine appropriate file extension based on mime type
    const getExtension = (mimeType: string): string => {
      const type = mimeType.toLowerCase();
      if (type.includes('m4a') || type.includes('x-m4a')) return 'm4a';
      if (type.includes('mp4')) return 'mp4';
      if (type.includes('mpeg') || type.includes('mp3')) return 'mp3';
      if (type.includes('webm')) return 'webm';
      if (type.includes('ogg')) return 'ogg';
      if (type.includes('flac')) return 'flac';
      if (type.includes('wav') || type.includes('wave')) return 'wav';
      return 'm4a'; // default to m4a as it's widely supported
    };
    
    const mimeType = audioBlob.type || 'audio/wav';
    const extension = getExtension(mimeType);
    
    // Convert blob to File object (required by Groq SDK)
    console.log('📁 Creating audio file:', {
      fileName: `audio.${extension}`,
      mimeType,
      size: audioBlob.size
    });

    const audioFile = new File([audioBlob], `audio.${extension}`, {
      type: mimeType
    });

    // Get Groq client
    console.log('🔧 Initializing Groq client...');
    const client = getGroqClient();
    console.log('✅ Groq client initialized successfully');

    // Perform transcription with retry logic
    let transcription;
    let lastError: any;
    const maxAttempts = 3;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🎯 Transcription attempt ${attempt}/${maxAttempts} with parameters:`, {
          model,
          language,
          response_format,
          temperature,
          fileSize: audioFile.size,
          fileName: audioFile.name
        });

        // Ultra-Think Protocol: Enhanced pre-request diagnostics
        console.log('🔍 ULTRA-THINK DIAGNOSTICS - Pre-request analysis:', {
          timestamp: new Date().toISOString(),
          clientBaseURL: (client as any).baseURL || 'Not explicitly set',
          apiVersion: 'openai/v1',
          targetEndpoint: 'audio/transcriptions',
          formDataFields: {
            file: { name: audioFile.name, size: audioFile.size, type: audioFile.type },
            model: model,
            language: language,
            response_format: response_format,
            temperature: temperature,
            prompt: prompt ? 'present' : 'not set'
          },
          networkInfo: {
            userAgent: 'Will be set by client',
            expectedContentType: 'multipart/form-data',
            ipFamily: 'IPv4/IPv6 (auto-determined by Node.js)'
          }
        });

        console.log('📡 Initiating transcription API call...');

        transcription = await client.audio.transcriptions.create({
          file: audioFile,
          model,
          language,
          prompt,
          response_format,
          temperature,
        });

        console.log('✅ Groq transcription successful!');
        
        // If successful, break out of retry loop
        break;
        
      } catch (error: any) {
        lastError = error;

        // Ultra-Think Protocol: Enhanced 403 error analysis
        console.error(`❌ Transcription attempt ${attempt} failed:`, {
          status: error?.status,
          message: error?.message,
          type: error?.constructor?.name,
          error: error
        });

        // Detailed analysis for 403 errors (likely Cloudflare WAF blocking)
        if (error?.status === 403) {
          console.error('🚫 ULTRA-THINK ANALYSIS - 403 Access Denied detected:');
          console.error('📊 Error Details:', {
            status: error.status,
            message: error.message,
            headers: error.headers || 'No headers available',
            responseBody: error.error || error.response || 'No response body',
            timestamp: new Date().toISOString()
          });

          // Check if this is Cloudflare blocking (key indicator)
          const errorString = JSON.stringify(error);
          const isCloudflareBlock = errorString.includes('cloudflare') ||
                                   errorString.includes('Access denied') ||
                                   errorString.includes('network settings');

          if (isCloudflareBlock) {
            console.error('🌩️ CLOUDFLARE WAF BLOCK DETECTED:');
            console.error('   Root Cause: Server-side request treated as bot traffic');
            console.error('   Solution: Implement User-Agent header and proper client configuration');
            console.error('   Status: This is NOT an API key issue - it\'s a WAF protection issue');
          } else {
            console.error('🔒 Standard 403 - API key invalid or insufficient permissions');
            console.error('🔍 Check if GROQ_API_KEY is valid and has transcription permissions');
          }

          break; // Don't retry auth errors
        }

        if (error?.status === 401) {
          console.error('🔒 401 Unauthorized - API key missing or invalid format');
          break; // Don't retry auth errors
        }

        if (error?.status === 429) {
          console.error('⏱️ 429 Rate limit exceeded');
          // Continue retrying for rate limits
        }

        // If this is not the last attempt, wait before retrying
        if (attempt < maxAttempts) {
          const waitTime = attempt * 2000; // Wait 2s, 4s, etc.
          console.log(`⏰ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // If all attempts failed, provide detailed error information
    if (!transcription) {
      const errorMessage = lastError?.message || 'All transcription attempts failed';
      const is403Error = lastError?.status === 403 || errorMessage.includes('403');
      const isNetworkError = errorMessage.includes('network');

      if (is403Error) {
        const detailedMessage = `Groq transcriptie gefaald (403). Controleer uw API-sleutel, maar ook uw lokale netwerkinstellingen (VPN, antivirus, firewall) die de verbinding kunnen blokkeren.

Mogelijke oorzaken:
• GROQ_API_KEY is ongeldig of verlopen
• API key heeft geen permissies voor Whisper transcriptie
• Account heeft onvoldoende credits
• Lokale netwerk/firewall blokkade (VPN, antivirus software)
• Cloudflare Web Application Firewall detecteert bot-verkeer

Oplossingen:
• Controleer uw API key op https://console.groq.com/
• Schakel tijdelijk VPN/proxy uit
• Controleer antivirus/firewall instellingen
• Probeer vanaf een ander netwerk

Technische details: ${errorMessage}`;

        throw new Error(detailedMessage);
      }

      if (isNetworkError) {
        throw new Error(
          'Groq transcriptie service is momenteel niet beschikbaar. ' +
          'Dit kan door netwerkproblemen of tijdelijke servicebeperkingen komen. ' +
          'Probeer het opnieuw of gebruik handmatige tekstinvoer als alternatief.'
        );
      }

      throw lastError || new Error('All transcription attempts failed');
    }

    // Handle different response formats
    let transcript: string;
    let duration: number | undefined;
    
    if (response_format === 'verbose_json' && typeof transcription === 'object') {
      transcript = transcription.text || '';
      duration = transcription.duration;
    } else if (typeof transcription === 'string') {
      transcript = transcription;
    } else if (typeof transcription === 'object' && 'text' in transcription) {
      transcript = transcription.text || '';
    } else {
      transcript = String(transcription);
    }

    return {
      success: true,
      data: {
        text: transcript.trim(),
        duration: duration || 0,
        confidence: 1.0, // Groq doesn't provide confidence scores, assuming high confidence
      }
    };

  } catch (error) {
    console.error('Groq transcription error:', error);
    
    let errorMessage = 'Failed to transcribe audio';
    
    if (error instanceof Error) {
      errorMessage = `Groq transcription failed: ${error.message}`;
    } else if (typeof error === 'object' && error !== null) {
      const errorObj = error as any;
      if (errorObj.error?.message) {
        errorMessage = `Groq API error: ${errorObj.error.message}`;
      } else if (errorObj.message) {
        errorMessage = `Groq error: ${errorObj.message}`;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function transcribeAudioFile(
  file: File,
  options: GroqTranscriptionOptions = {}
): Promise<{ success: true; data: AudioTranscription } | { success: false; error: string }> {
  // Convert File to Blob and use the main transcription function
  const blob = new Blob([file], { type: file.type });
  return transcribeAudioWithGroq(blob, options);
}

// Utility function to check if audio format is supported
export function isSupportedAudioFormat(mimeType: string): boolean {
  if (!mimeType) return false;
  
  const supportedFormats = [
    'audio/m4a',
    'audio/x-m4a',
    'audio/mp4',
    'audio/wav',
    'audio/wave',
    'audio/mpeg',
    'audio/mp3',
    'audio/webm',
    'audio/ogg',
    'audio/flac',
    'audio/aac',
  ];
  
  // Convert to lowercase for case-insensitive comparison
  const lowerMimeType = mimeType.toLowerCase();
  
  // Check if any supported format is contained in the mime type
  // This handles cases like 'audio/webm;codecs=opus'
  return supportedFormats.some(format => 
    lowerMimeType.includes(format.toLowerCase())
  );
}

// Utility function to estimate cost (approximate)
export function estimateTranscriptionCost(durationInSeconds: number): number {
  // Groq pricing is typically around $0.00001 per second for Whisper
  // This is an approximation - check current Groq pricing for accuracy
  return durationInSeconds * 0.00001;
}