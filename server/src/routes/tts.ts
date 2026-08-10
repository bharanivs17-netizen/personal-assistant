import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { text, lang } = req.query;
    if (!text || !lang) {
      res.status(400).json({ error: 'Text and lang are required' });
      return;
    }

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text as string)}&tl=${lang}&client=tw-ob`;
    
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    if (!response.ok) {
        throw new Error(`Google TTS failed: ${response.status} ${response.statusText}`);
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Access-Control-Allow-Origin', '*'); // explicitly allow for audio src
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));

  } catch (err: any) {
    console.error('Error in TTS route:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
