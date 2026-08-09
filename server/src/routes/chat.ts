import { Router, Request, Response } from 'express';
import { GeminiProvider } from '@partner/ai';
import { ChatMessage } from '@partner/shared';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  console.log('[BACKEND] Received POST /api/chat request');
  try {
    const { message, history } = req.body as { message: string; history: ChatMessage[] };

    if (!message) {
      console.log('[BACKEND] Message is required');
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Server configuration error: Missing API Key' });
      return;
    }

    const modelName = process.env.GOOGLE_MODEL || 'gemini-3.6-flash';
    const provider = new GeminiProvider(apiKey, modelName);

    // Retry logic for transient errors
    let result = '';
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        result = await provider.generateResponse(history || [], message);
        break; // Success, exit loop
      } catch (err: any) {
        // Detect Quota Exceeded (429 or RESOURCE_EXHAUSTED)
        const isQuotaError = 
          err.status === 429 || 
          (err.message && (
            err.message.includes('RESOURCE_EXHAUSTED') || 
            err.message.includes('Quota exceeded') || 
            err.message.includes('429')
          ));
        
        if (isQuotaError) {
          console.error('[BACKEND] Gemini Quota Exceeded detected. Not retrying.');
          res.status(429).json({
            error: {
              code: "QUOTA_EXCEEDED",
              message: "Gemini API quota temporarily exceeded."
            }
          });
          return;
        }

        // Check if transient error (e.g. 500, 503)
        const isTransient = err.status >= 500 || (err.message && (err.message.includes('503') || err.message.includes('500')));
        
        if (isTransient && retries < maxRetries) {
          retries++;
          console.warn(`[BACKEND] Transient Gemini error, retrying (${retries}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // backoff
          continue;
        }
        
        // Not transient or out of retries, throw to outer catch
        throw err;
      }
    }

    res.json({ text: result });

  } catch (err: any) {
    console.error('Unexpected error in chat route:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    } else {
      res.end();
    }
  }
});

export default router;
