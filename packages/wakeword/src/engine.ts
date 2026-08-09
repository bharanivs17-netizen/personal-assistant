export interface WakeWordCallbacks {
  onWakeWordDetected: () => void;
  onError: (error: Error) => void;
  onReady: () => void;
}

export interface WakeWordEngine {
  /**
   * Initialize and start listening for the wake word
   * @param callbacks Callbacks for wake word events
   */
  start(callbacks: WakeWordCallbacks): Promise<void>;
  
  /**
   * Stop listening and clean up resources
   */
  stop(): Promise<void>;
  
  /**
   * Check if the engine is currently running
   */
  isRunning(): boolean;
}
