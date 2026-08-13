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
  language?: string;
}

export function useSpeechRecognition({
  onWakeWordDetected,
  onCommandRecognized,
  onSilenceTimeout,
  onError,
  silenceTimeoutMs = 6000,
  language = 'auto'
}: UseSpeechRecognitionProps) {
  const [isSupported, setIsSupported] = useState(true);
  const [interimTranscriptState, setInterimTranscriptState] = useState('');
  const [finalTranscriptState, setFinalTranscriptState] = useState('');
  const transcriptRef = useRef({ interim: '', final: '' });
  
  const recognitionRef = useRef<any>(null);
  const modeRef = useRef<RecognitionMode>('OFF');
  const runningRef = useRef(false);
  
  // Continuous conversation refs
  const conversationModeRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isRecognitionRunningRef = useRef(false);
  const stopRequestedRef = useRef(false);
  
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

  const startListeningSafely = useCallback(() => {
    if (!conversationModeRef.current) return;
    if (isSpeakingRef.current) return;
    if (isRecognitionRunningRef.current) return;
    if (stopRequestedRef.current) return;
    if (!recognitionRef.current) return;

    // Dynamically set language before starting
    recognitionRef.current.lang = language === 'ta-IN' ? 'ta-IN' : 'en-IN';

    try {
      console.log("[PARTNER][VOICE] recognition start");
      recognitionRef.current.start();
      isRecognitionRunningRef.current = true;
      runningRef.current = true;
    } catch (error: any) {
      if (error.name === "InvalidStateError") {
        // It was already running. This resolves the Android deadlock.
        isRecognitionRunningRef.current = true;
        runningRef.current = true;
      } else {
        console.error("[PARTNER][ANDROID] START ERROR:", error);
      }
    }
  }, [language]);

  const scheduleSafeRestart = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }

    restartTimeoutRef.current = setTimeout(() => {
      if (
        conversationModeRef.current &&
        modeRef.current !== 'OFF' &&
        !isSpeakingRef.current &&
        !isRecognitionRunningRef.current &&
        !stopRequestedRef.current
      ) {
        startListeningSafely();
      }
    }, 300);
  }, [startListeningSafely]);

  // Keep existing wake word start logic
  const handleRecognitionStart = useCallback((mode: RecognitionMode) => {
    if (!recognitionRef.current || mode === 'OFF') return;
    
    // Prevent duplicate start
    if (isRecognitionRunningRef.current || runningRef.current || isSpeakingRef.current || stopRequestedRef.current) {
      return;
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === 'ta-IN' ? 'ta-IN' : 'en-IN';
    }
    
    try {
      console.log("[PARTNER][VOICE] recognition start");
      runningRef.current = true;
      recognitionRef.current.start();
      isRecognitionRunningRef.current = true;
    } catch (err: any) {
      runningRef.current = false;
      console.debug('[Partner Voice] Failed to start recognition:', err);
      if (err.name === 'InvalidStateError') {
         runningRef.current = true; // it is already running
         isRecognitionRunningRef.current = true;
      }
    }
  }, [language]);

  const scheduleRestart = useCallback((delayMs: number) => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    restartTimeoutRef.current = setTimeout(() => {
      handleRecognitionStart(modeRef.current);
    }, delayMs);
  }, [handleRecognitionStart]);

  const stopRecognition = useCallback(() => {
    modeRef.current = 'OFF';
    clearSilenceTimeout();
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    if (recognitionRef.current && (runningRef.current || isRecognitionRunningRef.current)) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
    }
  }, [clearSilenceTimeout]);

  const changeMode = useCallback((newMode: RecognitionMode) => {
    // If we're already in this mode, just reset silence
    if (modeRef.current === newMode) {
      if (newMode === 'COMMAND' && (runningRef.current || isRecognitionRunningRef.current)) {
        resetSilenceTimeout();
      }
      return;
    }
    
    const previousMode = modeRef.current;
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
      if (previousMode === 'OFF') {
        isRecognitionRunningRef.current = false;
        runningRef.current = false;
      }
      
      // DO NOT aggressively stop the native recognition engine just to change our internal mode.
      // Stopping and restarting causes duplicate browser beeps on Android.
      if (!runningRef.current && !isRecognitionRunningRef.current) {
        if (newMode === 'COMMAND' && conversationModeRef.current) {
          startListeningSafely();
        } else {
          handleRecognitionStart(newMode);
        }
      }
    }
  }, [resetSilenceTimeout, clearSilenceTimeout, stopRecognition, handleRecognitionStart, startListeningSafely]);

  // Initialize SpeechRecognition once
  useEffect(() => {
    if (typeof window === 'undefined') return;

    console.log("[PARTNER][ANDROID] Browser:", navigator.userAgent);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    console.log("[PARTNER][ANDROID] SpeechRecognition supported:", !!SpeechRecognition);
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    // PER USER REQUIREMENT: DO NOT USE continuous=true
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("[PARTNER][VOICE] recognition started");
      isRecognitionRunningRef.current = true;
      runningRef.current = true;
      if (modeRef.current === 'COMMAND') {
        resetSilenceTimeout();
      }
    };

    recognition.onresult = (event: any) => {
      // PREVENT SELF-HEARING
      if (isSpeakingRef.current) {
        return;
      }

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
        if (normalized.includes('hey partner') || normalized.includes('hello partner') || normalized.includes('hi partner') || normalized === 'partner') {
          console.log("[PARTNER][ANDROID] Wake word detected:", normalized);
          // Immediately stop and trigger callback
          changeMode('OFF');
          callbacksRef.current.onWakeWordDetected();
        }
      } else if (modeRef.current === 'COMMAND') {
        transcriptRef.current.interim = interim;
        setInterimTranscriptState(interim);
        if (final) {
          console.log("[PARTNER][VOICE] final transcript:", final);
          transcriptRef.current.final += final;
          setFinalTranscriptState(transcriptRef.current.final);
          // Immediately process final transcript without waiting for silence
          commitCommandRef.current();
        }
      }
    };

    recognition.onerror = (event: any) => {
      const error = event.error;
      console.error('[PARTNER][VOICE] recognition error:', error);
      isRecognitionRunningRef.current = false;

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
          if (conversationModeRef.current) {
            scheduleSafeRestart();
          } else {
            scheduleRestart(delay);
          }
          try { recognition.stop(); } catch(e) {}
        } else {
          callbacksRef.current.onError('Voice recognition unavailable. Tap the microphone to retry.');
          changeMode('OFF');
        }
        return;
      }
      
      if (error === 'not-allowed') {
        conversationModeRef.current = false;
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
      console.log("[PARTNER][VOICE] recognition ended");
      isRecognitionRunningRef.current = false;
      runningRef.current = false;
      
      if (
        conversationModeRef.current &&
        modeRef.current !== 'OFF' &&
        !isSpeakingRef.current &&
        !stopRequestedRef.current
      ) {
        scheduleSafeRestart();
      } else if (modeRef.current === 'WAKE' || (modeRef.current === 'COMMAND' && !conversationModeRef.current)) {
        // Keep existing behavior for wake word waiting if not in conversation mode
        if (!restartTimeoutRef.current && !isSpeakingRef.current && !stopRequestedRef.current) {
          scheduleRestart(100);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      try {
        recognition.abort();
      } catch (e) {}
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.onstart = null;
      recognitionRef.current = null;
    };
  }, [changeMode, scheduleRestart, scheduleSafeRestart]);

  const commitCommand = useCallback(() => {
    // We are done gathering the command
    // DO NOT explicitly stop the native recognition engine here, as it causes unnecessary Android beeps.
    // The native engine with continuous=false will naturally pause when silence is detected,
    // and our state machine will ignore audio while processing/speaking.
    stopRequestedRef.current = false;

    const finalResult = transcriptRef.current.final.trim() + ' ' + transcriptRef.current.interim.trim();
    if (finalResult.trim()) {
      callbacksRef.current.onCommandRecognized(finalResult.trim());
    } else {
      callbacksRef.current.onSilenceTimeout();
    }
  }, []);

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
    commitCommand,
    
    // Export refs for page.tsx to coordinate
    conversationModeRef,
    isSpeakingRef,
    stopRequestedRef,
    isRecognitionRunningRef,
    recognitionRef,
    restartTimeoutRef,
    scheduleSafeRestart
  };
}
