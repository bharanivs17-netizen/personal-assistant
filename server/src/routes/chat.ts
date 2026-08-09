import { Router, Request, Response } from 'express';
import { GeminiProvider } from '@partner/ai';
import { ChatMessage } from '@partner/shared';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body as { message: string; history: ChatMessage[] };

    if (!message) {
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

    // Set up Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Make sure we catch client disconnects to prevent runaway processes
    req.on('close', () => {
      // Clean up if needed
      res.end();
    });

    await provider.streamChat(history || [], message, {
      onContent: (text) => {
        // We write JSON encoded strings inside SSE data chunks to handle newlines
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      },
      onError: (error) => {
        console.error('Chat error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`);
        res.end();
      },
      onComplete: () => {
        res.write(`data: [DONE]\n\n`);
        res.end();
      }
    });

  } catch (err) {
    console.error('Unexpected error in chat route:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.end();
    }
  }
});

export default router;
