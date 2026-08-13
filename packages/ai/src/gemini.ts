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
4. If you don't know something, confidently state that you don't know.
5. For normal knowledge questions, answer the actual question concisely, avoid hallucinating facts, clearly state uncertainty when appropriate, never invent sources, and prefer accurate explanations over overly confident guesses.
6. If the user asks you to remember something, use the store_memory tool.
7. If the user asks you to open YouTube, play a song, or perform a local action, use the execute_local_action tool.`;

  constructor(apiKey: string, modelName: string = 'gemini-3.6-flash') {
    if (!apiKey) {
      throw new Error("Google Gemini API key is missing");
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey });
    this.modelName = modelName;
  }

  async streamChat(
    history: ChatMessage[],
    prompt: string,
    callbacks: StreamCallbacks,
    enableSearch: boolean = false
  ): Promise<void> {
    try {
      const formattedHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));
      
      const config: any = { systemInstruction: this.systemPrompt };
      if (enableSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      // In modern SDK we typically use generateContentStream
      const responseStream = await this.ai.models.generateContentStream({
        model: this.modelName,
        contents: [...formattedHistory, { role: 'user', parts: [{ text: prompt }] }],
        config
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

  async generateResponse(history: ChatMessage[], prompt: string, enableSearch: boolean = false, memoryContext: string = ''): Promise<string> {
    try {
      const formattedHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const config: any = { systemInstruction: this.systemPrompt + (memoryContext ? `\n\n${memoryContext}` : '') };
      
      const tools: any[] = [];
      if (enableSearch) {
        tools.push({ googleSearch: {} });
      }
      
      tools.push({
        functionDeclarations: [
          {
            name: 'store_memory',
            description: 'Save user preferences, personal details, or facts they ask you to remember.',
            parameters: {
              type: 'OBJECT',
              properties: {
                category: { type: 'STRING', description: 'One of: preference, project, learning, fact' },
                key: { type: 'STRING', description: 'A short descriptive key (e.g., preferred_programming_language)' },
                value: { type: 'STRING', description: 'The value to remember' }
              },
              required: ['category', 'key', 'value']
            }
          },
          {
            name: 'execute_local_action',
            description: 'Execute local computer actions like opening YouTube or checking the time.',
            parameters: {
              type: 'OBJECT',
              properties: {
                action: { type: 'STRING', description: 'The action to perform, e.g., "youtube_search", "youtube_play", "get_time", "open_notepad"' },
                query: { type: 'STRING', description: 'Any search query or parameter for the action' }
              },
              required: ['action']
            }
          }
        ]
      });
      
      config.tools = tools;

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: [...formattedHistory, { role: 'user', parts: [{ text: prompt }] }],
        config
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        return JSON.stringify({
           success: true,
           text: response.text || '',
           toolCalls: response.functionCalls.map(fc => ({ name: fc.name, args: fc.args }))
        });
      }

      return JSON.stringify({
         success: true,
         text: response.text || ''
      });
    } catch (error) {
      console.error('Gemini generateResponse Error:', error);
      throw error;
    }
  }
}
