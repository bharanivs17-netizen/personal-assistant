import { TTSProvider, TTSOptions, TTSDebugInfo } from './tts';

export class WebSpeechTTS implements TTSProvider {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  
  constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synth = window.speechSynthesis;
    }
  }

  private async loadVoices(): Promise<SpeechSynthesisVoice[]> {
    if (!this.synth) return [];
    
    return new Promise((resolve) => {
        const voices = this.synth!.getVoices();
        if (voices.length > 0) {
            resolve(voices);
            return;
        }

        const handler = () => {
            const loaded = this.synth!.getVoices();
            this.synth!.removeEventListener('voiceschanged', handler);
            resolve(loaded);
        };
        this.synth!.addEventListener('voiceschanged', handler);
    });
  }

  async initialize(): Promise<void> {
    if (!this.synth) return;
    this.voices = await this.loadVoices();
  }

  async getVoices(): Promise<{ id: string; name: string }[]> {
    if (this.voices.length === 0 && this.synth) {
      this.voices = await this.loadVoices();
    }
    return this.voices.map(v => ({ id: v.voiceURI, name: v.name }));
  }
  
  private containsTamil(text: string) {
    return /[\u0B80-\u0BFF]/.test(text);
  }

  private detectSpeechLanguage(text: string): string {
    if (this.containsTamil(text)) {
      return "ta-IN";
    }
    return "en-IN";
  }

  private getTamilVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
    return voices.find(v => v.lang === "ta-IN") ||
           voices.find(v => v.lang.startsWith("ta-")) ||
           voices.find(v => v.lang.startsWith("ta"));
  }

  async speak(text: string, options?: TTSOptions): Promise<void> {
    if (!this.synth) {
      console.warn('Speech synthesis not supported');
      return Promise.resolve();
    }

    this.stop(); // Stop any ongoing speech

    // 2. Wait for voices
    this.voices = await this.loadVoices();
    
    const hasTamilVoice = !!this.getTamilVoice(this.voices);
    
    let debugInfo: TTSDebugInfo = {
      language: '',
      voiceName: 'None',
      status: 'READY',
      error: 'None',
      hasTamilVoice: hasTamilVoice
    };
    
    const emitDebug = () => {
        if (options?.onDebug) options.onDebug({...debugInfo});
    };

    return new Promise((resolve, reject) => {
      // 3. Detect language
      const detectedLang = options?.lang === 'tamil' ? 'ta-IN' :
                           options?.lang === 'english' ? 'en-IN' : 
                           this.detectSpeechLanguage(text);
                           
      if (detectedLang === 'ta-IN' && !hasTamilVoice) {
         debugInfo.status = 'SPEAKING';
         debugInfo.error = 'None';
         debugInfo.voiceName = 'Google TTS Proxy';
         emitDebug();

         console.log('Using backend Google TTS fallback for Tamil voice.');

         const audio = new Audio();
         audio.src = `/api/tts?text=${encodeURIComponent(text)}&lang=ta`;
         audio.playbackRate = options?.speed || 0.95;
         
         audio.onplay = () => {
             options?.onStart?.();
         };
         
         audio.onended = () => {
             this.currentAudio = null;
             debugInfo.status = 'READY';
             emitDebug();
             options?.onEnd?.();
             resolve();
         };

         audio.onerror = (e) => {
             console.error('Backend TTS error', e);
             debugInfo.status = 'ERROR';
             debugInfo.error = 'Backend TTS proxy failed.';
             emitDebug();
             this.currentAudio = null;
             options?.onError?.(new Error("Backend TTS proxy failed"));
             resolve();
         };
         
         this.currentAudio = audio;
         audio.play().catch(e => {
             console.error("Audio playback blocked", e);
             debugInfo.status = 'ERROR';
             debugInfo.error = 'Audio blocked by browser';
             emitDebug();
             this.currentAudio = null;
             options?.onError?.(e);
             resolve();
         });
         return;
      }

      // 4. Create SpeechSynthesisUtterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // 6. Set language & 7-9. Set rate/pitch/volume
      if (detectedLang === 'ta-IN') {
        utterance.lang = "ta-IN";
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
      } else {
        utterance.lang = "en-IN";
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
      }
      
      if (options?.speed !== undefined) utterance.rate = options.speed;
      if (options?.volume !== undefined) utterance.volume = options.volume;
      
      // 5. Select matching voice
      if (options?.voice && options.voice !== 'default') {
        const selectedVoice = this.voices.find(v => v.voiceURI === options.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      } else {
         if (detectedLang === 'ta-IN') {
            const tamilVoice = this.getTamilVoice(this.voices);
            if (tamilVoice) utterance.voice = tamilVoice;
         } else {
            const enVoice = this.voices.find(v => v.lang === 'en-US' || v.lang === 'en-IN') || this.voices.find(v => v.lang.includes('en'));
            if (enVoice) utterance.voice = enVoice;
         }
      }

      debugInfo.language = utterance.lang;
      debugInfo.voiceName = utterance.voice ? utterance.voice.name : 'Default';
      emitDebug();

      utterance.onstart = () => {
        debugInfo.status = 'SPEAKING';
        emitDebug();
        options?.onStart?.();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        debugInfo.status = 'READY';
        emitDebug();
        options?.onEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.error('PARTNER TTS error:', event);
          debugInfo.error = String(event.error);
        }
        debugInfo.status = 'ERROR';
        emitDebug();
        this.currentUtterance = null;
        options?.onError?.(event.error);
        resolve(); // Never crash the assistant
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
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = '';
      this.currentAudio = null;
    }
  }
}
