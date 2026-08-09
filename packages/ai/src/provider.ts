import { ChatMessage } from '@partner/shared';

export interface StreamCallbacks {
  onContent: (text: string) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
}

export interface AIProvider {
  /**
   * Stream a chat response from the AI provider
   * @param history The conversation history
   * @param prompt The new user message
   * @param callbacks Callbacks for streaming events
   */
  streamChat(
    history: ChatMessage[],
    prompt: string,
    callbacks: StreamCallbacks
  ): Promise<void>;
}
