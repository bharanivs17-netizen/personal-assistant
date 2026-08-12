import { NextResponse } from 'next/server';
import { GeminiProvider } from '@partner/ai';
import { ChatMessage } from '@partner/shared';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  console.log('[PARTNER][GEMINI] Request received');
  try {
    const { message, history } = await req.json() as { message: string; history: ChatMessage[] };

    if (!message) {
      console.log('[PARTNER][GEMINI] ERROR: Message is required');
      return NextResponse.json({ success: false, code: 'GEMINI_BAD_REQUEST', message: 'Message is required.' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    console.log(`[PARTNER][GEMINI] API key configured: ${!!apiKey}`);
    
    if (!apiKey || apiKey === 'YOUR_NEW_API_KEY_HERE') {
      return NextResponse.json({ success: false, code: 'GEMINI_NOT_CONFIGURED', message: 'Gemini API key is not configured.' }, { status: 500 });
    }

    const modelName = process.env.GOOGLE_MODEL || 'gemini-3.6-flash';
    console.log(`[PARTNER][GEMINI] Model: ${modelName}`);
    
    const provider = new GeminiProvider(apiKey, modelName);

    // Retry logic for transient errors
    let result = '';
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        console.log('[PARTNER][GEMINI] Sending request');
        result = await provider.generateResponse(history || [], message);
        console.log('[PARTNER][GEMINI] Response received');
        break; // Success, exit loop
      } catch (err: any) {
        const errMessage = (err.message || '').toLowerCase();
        const status = err.status || 500;
        
        // Quota
        if (status === 429 || errMessage.includes('resource_exhausted') || errMessage.includes('quota')) {
          console.error('[PARTNER][GEMINI] ERROR: QUOTA_EXCEEDED');
          return NextResponse.json({ success: false, code: 'GEMINI_QUOTA_ERROR', message: 'Gemini API quota has been reached. Your local voice commands are still available.', model: modelName }, { status: 429 });
        }
        
        // Model Not Found
        if (status === 404 || errMessage.includes('model_not_found') || errMessage.includes('not found')) {
          console.error('[PARTNER][GEMINI] ERROR: MODEL_NOT_FOUND');
          return NextResponse.json({ success: false, code: 'GEMINI_MODEL_ERROR', message: 'The configured Gemini model is unavailable.', model: modelName }, { status: 404 });
        }

        // Auth
        if (status === 401 || errMessage.includes('api key') || errMessage.includes('unauthenticated')) {
          console.error('[PARTNER][GEMINI] ERROR: AUTH_ERROR');
          return NextResponse.json({ success: false, code: 'GEMINI_AUTH_ERROR', message: 'Gemini API authentication failed.', model: modelName }, { status: 401 });
        }
        
        // Permission
        if (status === 403 || errMessage.includes('permission denied')) {
          console.error('[PARTNER][GEMINI] ERROR: PERMISSION_ERROR');
          return NextResponse.json({ success: false, code: 'GEMINI_PERMISSION_ERROR', message: 'Gemini API permission denied.', model: modelName }, { status: 403 });
        }

        // Check if transient error (500, 503)
        const isTransient = status >= 500 || errMessage.includes('503') || errMessage.includes('500');
        
        if (isTransient && retries < maxRetries) {
          retries++;
          console.warn(`[PARTNER][GEMINI] Transient Gemini error, retrying (${retries}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // backoff
          continue;
        }
        
        // Not transient or out of retries
        console.error('[PARTNER][GEMINI] ERROR: UNKNOWN_ERROR', err);
        return NextResponse.json({ success: false, code: 'GEMINI_UNKNOWN_ERROR', message: 'An unknown error occurred while contacting Gemini.', model: modelName }, { status: status });
      }
    }

    return NextResponse.json({ success: true, text: result, model: modelName });

  } catch (err: any) {
    console.error('[PARTNER][GEMINI] Unexpected error in chat route:', err);
    return NextResponse.json({ success: false, code: 'GEMINI_SERVER_ERROR', message: 'Internal server error processing Gemini request.' }, { status: 500 });
  }
}
