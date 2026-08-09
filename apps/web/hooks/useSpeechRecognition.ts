import { useState, useEffect, useRef, useCallback } from 'react';

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export type RecognitionMode = 'WAKE' | 'COMMAND' | 'OFF';

interface UseSpeechRecognitionProps {
  onWakeWordDetected: () => void;
  onCommandRecognized: (text: string) => void;
  onSilenceTimeout: () => void;
  onError: (errorMsg: string) => void;
  silenceTimeoutMs?: number;
}

export function useSpeechRecognition({
  onWakeWordDetected,
  onCommandRecognized,
  onSilenceTimeout,
  onError,
  silenceTimeoutMs = 6000
}: UseSpeechRecognitionProps) {
  const [isSupported, setIsSupported] = useState(true);
  const [interimTranscriptState, setInterimTranscriptState] = useState('');
  const [finalTranscriptState, setFinalTranscriptState] = useState('');
  const transcriptRef = useRef({ interim: '', final: '' });
  
  const recognitionRef = useRef<any>(null);
  const modeRef = useRef<RecognitionMode>('OFF');
  const runningRef = useRef(false);
  
  const retryCountRef = useRef(0);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Callback refs to avoid stale closures in event listeners
  const callbacksRef = useRef({
    onWakeWordDetected,
    onCommandRecognized,
    onSilenceTimeout,
    onError
  });
  
  useEffect(() => {
    callbacksRef.current = {
      onWakeWordDetected,
      onCommandRecognized,
      onSilenceTimeout,
      onError
    };
  }, [onWakeWordDetected, onCommandRecognized, onSilenceTimeout, onError]);

  const clearSilenceTimeout = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const commitCommandRef = useRef<() => void>(() => {});

  const resetSilenceTimeout = useCallback(() => {
    clearSilenceTimeout();
    if (modeRef.current === 'COMMAND') {
      silenceTimerRef.current = setTimeout(() => {
        commitCommandRef.current();
      }, silenceTimeoutMs);
    }
  }, [clearSilenceTimeout, silenceTimeoutMs]);

  const scheduleRestart = useCallback((delayMs: number) => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    restartTimeoutRef.current = setTimeout(() => {
      handleRecognitionStart(modeRef.current);
    }, delayMs);
  }, []);

  const handleRecognitionStart = useCallback((mode: RecognitionMode) => {
    if (!recognitionRef.current || mode === 'OFF') return;
    
    // Prevent duplicate start
    if (runningRef.current) {
      return;
    }
    
    try {
      runningRef.current = true;
      recognitionRef.current.start();
    } catch (err) {
      runningRef.current = false;
      console.debug('[Partner Voice] Failed to start recognition:', err);
    }
  }, []);

  const stopRecognition = useCallback(() => {
    modeRef.current = 'OFF';
    clearSilenceTimeout();
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    if (recognitionRef.current && runningRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
    }
    // runningRef will be set to false in onend
  }, [clearSilenceTimeout]);

  const changeMode = useCallback((newMode: RecognitionMode) => {
    // If we're already in this mode and running, just reset silence
    if (runningRef.current && modeRef.current === newMode) {
      if (newMode === 'COMMAND') resetSilenceTimeout();
      return;
    }
    
    modeRef.current = newMode;
    retryCountRef.current = 0; // Reset retries on deliberate mode change
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (newMode === 'COMMAND') {
      transcriptRef.current.interim = '';
      transcriptRef.current.final = '';
      setInterimTranscriptState('');
      setFinalTranscriptState('');
      resetSilenceTimeout();
    } else {
      clearSilenceTimeout();
    }
    
    if (newMode === 'OFF') {
      stopRecognition();
    } else {
      if (runningRef.current) {
        // Stop the current one, the 'onend' handler will pick up the new mode and restart
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      } else {
        handleRecognitionStart(newMode);
      }
    }
  }, [resetSilenceTimeout, clearSilenceTimeout, stopRecognition, handleRecognitionStart]);

  // Initialize SpeechRecognition once
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      runningRef.current = true;
      if (modeRef.current === 'COMMAND') {
        resetSilenceTimeout();
      }
    };

    recognition.onresult = (event: any) => {
      if (modeRef.current === 'COMMAND') {
        resetSilenceTimeout();
      }
      
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (modeRef.current === 'WAKE') {
        // Evaluate wake word
        const fullTranscript = final + interim;
        const normalized = fullTranscript.toLowerCase().trim().replace(/[.,!?;:]/g, '');
        if (normalized.includes('hey partner')) {
          // Immediately stop and trigger callback
          changeMode('OFF');
          callbacksRef.current.onWakeWordDetected();
        }
      } else if (modeRef.current === 'COMMAND') {
        transcriptRef.current.interim = interim;
        setInterimTranscriptState(interim);
        if (final) {
          transcriptRef.current.final += final;
          setFinalTranscriptState(transcriptRef.current.final);
        }
      }
    };

    recognition.onerror = (event: any) => {
      const error = event.error;
      console.debug('[Partner Voice] Error:', error);

      if (error === 'no-speech') {
        // no-speech is a normal condition. Let onend handle the restart.
        return;
      }
      
      if (error === 'aborted') {
        // Ignore aborted error from manual stop
        return;
      }
      
      if (error === 'network') {
        if (retryCountRef.current < 3) {
          retryCountRef.current++;
          const delay = retryCountRef.current === 1 ? 1000 : (retryCountRef.current === 2 ? 2000 : 4000);
          callbacksRef.current.onError('Voice recognition temporarily unavailable.');
          // Stop current session; onend will handle the restart via retryCount logic if needed, 
          // or we just schedule it here and stop.
          // Better: schedule it, and stop.
          scheduleRestart(delay);
          try { recognition.stop(); } catch(e) {}
        } else {
          callbacksRef.current.onError('Voice recognition unavailable. Tap the microphone to retry.');
          changeMode('OFF');
        }
        return;
      }
      
      if (error === 'not-allowed') {
        callbacksRef.current.onError('PERMISSION_REQUIRED');
        changeMode('OFF');
        return;
      }
      
      if (error === 'audio-capture') {
        callbacksRef.current.onError('Microphone unavailable.');
        changeMode('OFF');
        return;
      }

      if (error === 'service-not-allowed') {
        callbacksRef.current.onError('Voice recognition service unavailable.');
        changeMode('OFF');
        return;
      }

      if (error === 'language-not-supported') {
        callbacksRef.current.onError('Language not supported.');
        changeMode('OFF');
        return;
      }
      
      // Unknown error
      callbacksRef.current.onError('An unknown voice error occurred.');
      changeMode('OFF');
    };

    recognition.onend = () => {
      runningRef.current = false;
      
      // Centralized restart logic
      if (modeRef.current !== 'OFF') {
        // If we didn't explicitly schedule a restart with a delay (like network error),
        // restart immediately (e.g. no-speech or browser auto-stop)
        if (!restartTimeoutRef.current) {
          scheduleRestart(100);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      stopRecognition();
    };
  }, [changeMode, scheduleRestart, stopRecognition]);

  const commitCommand = useCallback(() => {
    // We are done gathering the command
    changeMode('OFF');
    const finalResult = transcriptRef.current.final.trim() + ' ' + transcriptRef.current.interim.trim();
    if (finalResult.trim()) {
      callbacksRef.current.onCommandRecognized(finalResult.trim());
    } else {
      callbacksRef.current.onSilenceTimeout();
    }
  }, [changeMode]);

  useEffect(() => {
    commitCommandRef.current = commitCommand;
  }, [commitCommand]);

  return {
    isSupported,
    interimTranscript: interimTranscriptState,
    finalTranscript: finalTranscriptState,
    startWakeListening: () => changeMode('WAKE'),
    startCommandListening: () => changeMode('COMMAND'),
    stopListening: () => changeMode('OFF'),
    commitCommand
  };
}
