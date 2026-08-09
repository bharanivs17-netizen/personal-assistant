export interface TTSOptions {
  voice?: string;
  speed?: number;
  volume?: number;
}

export interface TTSProvider {
  /**
   * Speak the given text
   * @param text The text to speak
   * @param options Optional configuration for this speech
   * @returns A promise that resolves when speech is complete
   */
  speak(text: string, options?: TTSOptions): Promise<void>;
  
  /**
   * Stop any current speech immediately
   */
  stop(): void;
  
  /**
   * Preload and prepare the TTS engine
   */
  initialize(): Promise<void>;
  
  /**
   * Get available voices
   */
  getVoices(): Promise<{ id: string; name: string }[]>;
}
