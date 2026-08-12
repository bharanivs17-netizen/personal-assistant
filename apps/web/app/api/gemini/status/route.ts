import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const modelName = process.env.GOOGLE_MODEL || 'gemini-3.6-flash';

  const isConfigured = !!apiKey && apiKey !== 'YOUR_NEW_API_KEY_HERE';

  return NextResponse.json({
    configured: isConfigured,
    model: modelName,
    provider: 'Google Gemini',
    apiKeyPresent: !!apiKey
  });
}
