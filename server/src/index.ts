import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import chatRouter from './routes/chat';
import ttsRouter from './routes/tts';

// Load environment variables
dotenv.config({ path: '../.env' }); // Load from root

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://partner-app.com' 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/chat', chatRouter);
app.use('/api/tts', ttsRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

async function validateGeminiModel() {
  let apiKey = process.env.GOOGLE_API_KEY || '';
  apiKey = apiKey.replace(/^["']|["']$/g, '');
  const configuredModel = process.env.GOOGLE_MODEL;

  if (apiKey && configuredModel) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (!response.ok) {
        console.error('⚠️ Could not validate Gemini model: API returned', response.status);
        return;
      }
      const data = await response.json();
      const models = data.models || [];
      const modelExists = models.find((m: any) => m.name === `models/${configuredModel}` || m.name === configuredModel);
      
      if (!modelExists) {
        console.error(`\n❌ Gemini model "${configuredModel}" is unavailable.`);
        console.error(`   Check GOOGLE_MODEL and the available models for this API key.\n`);
      } else if (!modelExists.supportedGenerationMethods?.includes('generateContent')) {
        console.error(`\n❌ Gemini model "${configuredModel}" does not support generateContent.\n`);
      } else {
        console.log(`✅ Gemini model validated: ${configuredModel}`);
      }
    } catch (err) {
      console.error('⚠️ Error validating Gemini model:', err);
    }
  }
}

// Start server
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Partner backend listening on port ${PORT}`);
  if (!process.env.GOOGLE_API_KEY) {
    console.warn('⚠️ WARNING: GOOGLE_API_KEY is not set. Chat will not work.');
  } else {
    validateGeminiModel();
  }
});
