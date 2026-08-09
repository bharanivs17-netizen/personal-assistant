import { GoogleGenerativeAI, ChatSession, GenerativeModel } from '@google/generative-ai';
import { AIProvider, StreamCallbacks } from './provider';
import { ChatMessage } from '@partner/shared';

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  
  private systemPrompt = `You are Partner, a highly advanced, 24/7 personal voice assistant. 
Your personality is calm, friendly, natural, intelligent, concise, and confident.
Since you are a voice assistant, your responses will be spoken aloud via text-to-speech.
Follow these strict rules:
1. ALWAYS be concise. Do not give long-winded answers unless explicitly asked.
2. NEVER use markdown formatting like asterisks, bolding, code blocks, or URLs, as they sound terrible when spoken. 
3. Use natural conversational language.
4. If you don't know something, confidently state that you don't know.`;

  constructor(apiKey: string, modelName: string = 'gemini-3.6-flash') {
    if (!apiKey) {
      throw new Error("Google Gemini API key is missing");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: this.systemPrompt,
    });
  }

  async streamChat(
    history: ChatMessage[],
    prompt: string,
    callbacks: StreamCallbacks
  ): Promise<void> {
    try {
      // Convert our ChatMessage format to Gemini's format
      const formattedHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const chat: ChatSession = this.model.startChat({
        history: formattedHistory,
      });

      const result = await chat.sendMessageStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          callbacks.onContent(chunkText);
        }
      }

      callbacks.onComplete();
    } catch (error) {
      console.error('Gemini Provider Error:', error);
      callbacks.onError(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
