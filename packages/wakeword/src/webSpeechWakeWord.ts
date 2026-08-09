import { WakeWordEngine, WakeWordCallbacks } from './engine';

export class WebSpeechWakeWordEngine implements WakeWordEngine {
  private recognition: any = null;
  private running = false;
  private restartTimeout: NodeJS.Timeout | null = null;

  async start(callbacks: WakeWordCallbacks): Promise<void> {
    if (this.running) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      callbacks.onError(new Error("Speech recognition not supported"));
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.running = true;
        callbacks.onReady();
      };

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }

        const normalized = transcript.toLowerCase().trim().replace(/[.,!?;:]/g, '');
        if (normalized.includes('hey partner')) {
          // Immediately stop recognition so command engine can take over
          this.stop();
          callbacks.onWakeWordDetected();
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // No speech timeout occurred. Restart silently.
          this.silentRestart(callbacks);
        } else if (event.error === 'aborted') {
          // Do nothing if we manually stopped it
        } else {
          this.running = false;
          callbacks.onError(new Error(event.error));
        }
      };

      this.recognition.onend = () => {
        // If we didn't manually stop it (e.g. browser stopped it), try to restart
        // unless we are permanently stopped. For this prototype, we'll let the controller handle it.
        this.running = false;
      };

      this.recognition.start();
    } catch (err) {
      this.running = false;
      callbacks.onError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  private silentRestart(callbacks: WakeWordCallbacks) {
    this.stop().then(() => {
      this.restartTimeout = setTimeout(() => {
        this.start(callbacks);
      }, 500);
    });
  }

  async stop(): Promise<void> {
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore errors during stop
      }
    }
    this.running = false;
  }

  isRunning(): boolean {
    return this.running;
  }
}
