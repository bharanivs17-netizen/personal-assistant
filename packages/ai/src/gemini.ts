import { GoogleGenAI } from '@google/genai';
import { AIProvider, StreamCallbacks } from './provider';
import { ChatMessage } from '@partner/shared';

export class GeminiProvider implements AIProvider {
  private ai: GoogleGenAI;
  private modelName: string;
  
  private systemPrompt = `You are Partner, a highly advanced, 24/7 personal voice assistant. 
Your personality is calm, friendly, natural, intelligent, concise, and confident.
Since you are a voice assistant, your responses will be spoken aloud via text-to-speech.
Follow these strict rules:
1. ALWAYS be concise. Do not give long-winded answers unless explicitly asked.
2. NEVER use markdown formatting like asterisks, bolding, code blocks, or URLs, as they sound terrible when spoken. 
3. Use natural conversational language.
4. If you don't know something, confidently state that you don't know.`;

  constructor(apiKey: string, modelName: string = 'gemini-1.5-flash') {
    if (!apiKey) {
      throw new Error("Google Gemini API key is missing");
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey });
    this.modelName = modelName;
  }

  async streamChat(
    history: ChatMessage[],
    prompt: string,
    callbacks: StreamCallbacks
  ): Promise<void> {
    try {
      const formattedHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      // In modern SDK we typically use generateContentStream
      const responseStream = await this.ai.models.generateContentStream({
        model: this.modelName,
        contents: [...formattedHistory, { role: 'user', parts: [{ text: prompt }] }],
        config: { systemInstruction: this.systemPrompt }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          callbacks.onContent(chunk.text);
        }
      }

      callbacks.onComplete();
    } catch (error) {
      console.error('Gemini Provider Error:', error);
      callbacks.onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async generateResponse(history: ChatMessage[], prompt: string): Promise<string> {
    try {
      const formattedHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: [...formattedHistory, { role: 'user', parts: [{ text: prompt }] }],
        config: { systemInstruction: this.systemPrompt }
      });

      return response.text || '';
    } catch (error) {
      console.error('Gemini generateResponse Error:', error);
      throw error;
    }
  }
}
