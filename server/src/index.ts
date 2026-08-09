import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import chatRouter from './routes/chat';

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

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Start server
app.listen(PORT, () => {
  console.log(`Partner backend listening on port ${PORT}`);
  if (!process.env.GOOGLE_API_KEY) {
    console.warn('⚠️ WARNING: GOOGLE_API_KEY is not set. Chat will not work.');
  }
});
