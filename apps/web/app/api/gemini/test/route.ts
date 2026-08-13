import { NextResponse } from 'next/server';
import { GeminiProvider } from '@partner/ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { message } = await req.json() as { message: string };

    let apiKey = process.env.GOOGLE_API_KEY || '';
    apiKey = apiKey.replace(/^["']|["']$/g, '');
    if (!apiKey || apiKey === 'YOUR_NEW_API_KEY_HERE') {
      return NextResponse.json({ success: false, code: 'GEMINI_NOT_CONFIGURED', message: 'Gemini API key is not configured.' }, { status: 500 });
    }

    const modelName = process.env.GOOGLE_MODEL || 'gemini-3.6-flash';
    const provider = new GeminiProvider(apiKey, modelName);

    try {
      const result = await provider.generateResponse([], message || 'Reply with exactly: PARTNER GEMINI TEST OK');
      return NextResponse.json({ success: true, model: modelName, text: result });
    } catch (err: any) {
      const errMessage = (err.message || '').toLowerCase();
      const status = err.status || 500;
      
      if (status === 429 || errMessage.includes('resource_exhausted') || errMessage.includes('quota')) {
        return NextResponse.json({ success: false, code: 'GEMINI_QUOTA_ERROR', message: 'Gemini API quota has been reached. Your local voice commands are still available.', model: modelName }, { status: 429 });
      }
      
      if (status === 404 || errMessage.includes('model_not_found') || errMessage.includes('not found')) {
        return NextResponse.json({ success: false, code: 'GEMINI_MODEL_ERROR', message: 'The configured Gemini model is unavailable.', model: modelName }, { status: 404 });
      }

      if (status === 401 || errMessage.includes('api key') || errMessage.includes('unauthenticated')) {
        return NextResponse.json({ success: false, code: 'GEMINI_AUTH_ERROR', message: 'Gemini API authentication failed.', model: modelName }, { status: 401 });
      }
      
      if (status === 403 || errMessage.includes('permission denied')) {
        return NextResponse.json({ success: false, code: 'GEMINI_PERMISSION_ERROR', message: 'Gemini API permission denied.', model: modelName }, { status: 403 });
      }

      return NextResponse.json({ success: false, code: 'GEMINI_UNKNOWN_ERROR', message: err.message || 'An unknown error occurred while contacting Gemini.', model: modelName }, { status: status });
    }

  } catch (err: any) {
    return NextResponse.json({ success: false, code: 'GEMINI_SERVER_ERROR', message: 'Internal server error processing Gemini test request.' }, { status: 500 });
  }
}
