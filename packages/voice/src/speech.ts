import { TTSProvider, TTSOptions } from './tts';

export class WebSpeechTTS implements TTSProvider {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  
  constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synth = window.speechSynthesis;
    }
  }

  async initialize(): Promise<void> {
    if (!this.synth) return;
    
    // Voices might take a moment to load
    return new Promise((resolve) => {
      const voices = this.synth!.getVoices();
      if (voices.length > 0) {
        this.voices = voices;
        resolve();
      } else {
        this.synth!.onvoiceschanged = () => {
          this.voices = this.synth!.getVoices();
          resolve();
        };
      }
    });
  }

  async getVoices(): Promise<{ id: string; name: string }[]> {
    if (this.voices.length === 0 && this.synth) {
      await this.initialize();
    }
    return this.voices.map(v => ({ id: v.voiceURI, name: v.name }));
  }

  async speak(text: string, options?: TTSOptions): Promise<void> {
    if (!this.synth) {
      console.warn('Speech synthesis not supported');
      return Promise.resolve();
    }

    this.stop(); // Stop any ongoing speech

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (options?.speed !== undefined) {
        utterance.rate = options.speed;
      }
      
      if (options?.volume !== undefined) {
        utterance.volume = options.volume;
      }
      
      if (options?.voice) {
        const selectedVoice = this.voices.find(v => v.voiceURI === options.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.error('Speech synthesis error:', event.error);
        }
        this.currentUtterance = null;
        resolve(); // Resolve anyway so we don't hang the state machine
      };

      this.currentUtterance = utterance;
      this.synth!.speak(utterance);
    });
  }

  stop(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }
}
