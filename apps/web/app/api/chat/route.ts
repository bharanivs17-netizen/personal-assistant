import { NextResponse } from 'next/server';
import { GeminiProvider } from '@partner/ai';
import { ChatMessage } from '@partner/shared';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  console.log('[PARTNER][GEMINI] Request received');
  try {
    const { message, history, enableSearch, memoryContext } = await req.json() as { message: string; history: ChatMessage[]; enableSearch?: boolean; memoryContext?: string };

    if (!message) {
      console.log('[PARTNER][GEMINI] ERROR: Message is required');
      return NextResponse.json({ success: false, code: 'GEMINI_BAD_REQUEST', message: 'Message is required.' }, { status: 400 });
    }

    let apiKey = process.env.GOOGLE_API_KEY || '';
    apiKey = apiKey.replace(/^["']|["']$/g, ''); // Strip literal quotes if user added them
    console.log(`[PARTNER][GEMINI] API key stringified: >${apiKey}<`);
    
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
    
    // Check Environment
    const isVercel = process.env.VERCEL === '1';
    console.log(`[PARTNER][GEMINI] Environment: ${isVercel ? 'Vercel' : 'Local'}`);

    while (retries <= maxRetries) {
      try {
        console.log(`[PARTNER][GEMINI] Search enabled: ${!!enableSearch}`);
        console.log(`[PARTNER][GEMINI] Request started`);
        result = await provider.generateResponse(history || [], message, enableSearch, memoryContext);
        console.log('[PARTNER][GEMINI] Response received');
        break; // Success, exit loop
      } catch (err: any) {
        const errMessage = (err.message || '').toLowerCase();
        const status = err.status || err.response?.status || 500;
        
        console.error('\n--- [PARTNER][GEMINI] API ERROR ---');
        console.error(`Status: ${status}`);
        console.error(`Message: ${err.message || 'Unknown error'}`);
        console.error(`Model: ${modelName}`);
        if (err.response?.data) {
           console.error(`Response Body: ${JSON.stringify(err.response.data)}`);
        }
        console.error('-----------------------------------\n');
        
        // Quota
        if (status === 429 || errMessage.includes('resource_exhausted') || errMessage.includes('quota')) {
          if (enableSearch) console.error('[PARTNER][GEMINI][SEARCH ERROR]');
          return NextResponse.json({ success: false, code: 'GEMINI_QUOTA_ERROR', message: 'Gemini API quota has been reached. Your local voice commands are still available.', model: modelName }, { status: 429 });
        }
        
        // Model Not Found
        if (status === 404 || errMessage.includes('model_not_found') || errMessage.includes('not found')) {
          if (enableSearch) console.error('[PARTNER][GEMINI][SEARCH ERROR]');
          return NextResponse.json({ success: false, code: 'GEMINI_MODEL_ERROR', message: `The configured Gemini model (${modelName}) is unavailable.`, model: modelName }, { status: 404 });
        }

        // Auth
        if (status === 401 || errMessage.includes('api key') || errMessage.includes('unauthenticated')) {
          if (enableSearch) console.error('[PARTNER][GEMINI][SEARCH ERROR]');
          return NextResponse.json({ success: false, code: 'GEMINI_AUTH_ERROR', message: 'Gemini API authentication failed.', model: modelName }, { status: 401 });
        }
        
        // Permission
        if (status === 403 || errMessage.includes('permission denied')) {
          if (enableSearch) console.error('[PARTNER][GEMINI][SEARCH ERROR]');
          return NextResponse.json({ success: false, code: 'GEMINI_PERMISSION_ERROR', message: 'Gemini API permission denied.', model: modelName }, { status: 403 });
        }
        
        // Bad Request
        if (status === 400 || errMessage.includes('bad request') || errMessage.includes('invalid')) {
          if (enableSearch) console.error('[PARTNER][GEMINI][SEARCH ERROR]');
          return NextResponse.json({ success: false, code: 'GEMINI_BAD_REQUEST', message: 'Invalid request sent to Gemini API.', model: modelName }, { status: 400 });
        }

        // Check if transient error (500, 503)
        const isTransient = status >= 500 || errMessage.includes('503') || errMessage.includes('500');
        
        if (isTransient && retries < maxRetries) {
          retries++;
          console.warn(`[PARTNER][GEMINI] Transient Gemini error (Status ${status}), retrying (${retries}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // backoff
          continue;
        }
        
        if (enableSearch) console.error('[PARTNER][GEMINI][SEARCH ERROR]');
        // Not transient or out of retries
        return NextResponse.json({ success: false, code: 'GEMINI_SERVER_ERROR', message: 'An internal server error occurred while contacting Gemini.', model: modelName }, { status: status });
      }
    }

    try {
      const parsedResult = JSON.parse(result);
      return NextResponse.json({ ...parsedResult, model: modelName });
    } catch (e) {
      // Fallback if provider didn't stringify properly
      return NextResponse.json({ success: true, text: result, model: modelName });
    }

  } catch (err: any) {
    console.error('[PARTNER][GEMINI] Unexpected error in chat route:', err);
    if (req.url.includes('enableSearch')) console.error('[PARTNER][GEMINI][SEARCH ERROR]'); // Just in case, hard to know enableSearch here if parsing failed
    return NextResponse.json({ success: false, code: 'GEMINI_SERVER_ERROR', message: 'Internal server error processing Gemini request.' }, { status: 500 });
  }
}
