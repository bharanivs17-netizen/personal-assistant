'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { AssistantState, AssistantEvent, DEFAULT_SETTINGS, transition } from '@partner/shared';
import type { PartnerSettings } from '@partner/shared';

import Orb from '@/components/Orb';
import StatusText from '@/components/StatusText';
import ListeningToggle from '@/components/ListeningToggle';
import Settings from '@/components/Settings';
import { useMicrophone } from '@/hooks/useMicrophone';
import { useAudioAnalyser } from '@/hooks/useAudioAnalyser';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useChat } from '@/hooks/useChat';
import { WebSpeechTTS } from '@partner/voice';

export default function Home() {
  const [state, setState] = useState<AssistantState>(AssistantState.STOPPED);
  const [settings, setSettings] = useState<PartnerSettings>(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const { stream, permissionStatus, micError, startMicrophone, stopMicrophone } = useMicrophone();
  const { audioLevel, rmsValue, contextState, trackState } = useAudioAnalyser(stream, !!stream);

  useEffect(() => {
    if (micError) setVoiceError(micError);
  }, [micError]);
  
  // Initialize TTS
  const ttsRef = useRef<WebSpeechTTS | null>(null);
  useEffect(() => {
    const tts = new WebSpeechTTS();
    tts.initialize();
    ttsRef.current = tts;
  }, []);

  const handleTransition = useCallback(
    (event: AssistantEvent) => {
      setState((current) => {
        const next = transition(current, event);
        return next ?? current;
      });
    },
    []
  );

  const { messages, isGenerating, generateResponse } = useChat({
    onChunk: () => {
      // Transition to speaking on first chunk if we are in processing state
      setState((current) => {
        if (current === AssistantState.PROCESSING) {
          return transition(current, AssistantEvent.AI_RESPONSE_READY) ?? current;
        }
        return current;
      });
    },
    onComplete: (fullText) => {
      if (ttsRef.current && fullText) {
        ttsRef.current.speak(fullText, { speed: settings.speechSpeed }).then(() => {
          handleTransition(AssistantEvent.SPEECH_COMPLETE);
        });
      } else {
        handleTransition(AssistantEvent.SPEECH_COMPLETE);
      }
    }
  });

  const {
    startWakeListening,
    startCommandListening,
    stopListening,
    commitCommand,
    interimTranscript,
    finalTranscript,
    isSupported: isSttSupported
  } = useSpeechRecognition({
    onWakeWordDetected: () => {
      handleTransition(AssistantEvent.WAKE_WORD);
      if (ttsRef.current) {
        ttsRef.current.speak("Yes?", { speed: settings.speechSpeed }).then(() => {
          handleTransition(AssistantEvent.ACKNOWLEDGE_DONE);
        });
      } else {
        setTimeout(() => handleTransition(AssistantEvent.ACKNOWLEDGE_DONE), 500);
      }
    },
    onCommandRecognized: (text: string) => {
      handleTransition(AssistantEvent.SPEECH_RECOGNIZED);
      generateResponse(text);
    },
    onSilenceTimeout: () => {
      handleTransition(AssistantEvent.SILENCE_TIMEOUT);
    },
    onError: (errorMsg: string) => {
      if (errorMsg === 'PERMISSION_REQUIRED') {
        handleTransition(AssistantEvent.MIC_DENIED);
        setIsListening(false);
      } else {
        setVoiceError(errorMsg);
        // Do not disable the entire UI for other errors, just return to READY if in a listening state
        if (state === AssistantState.LISTENING) {
           handleTransition(AssistantEvent.DISABLE);
        }
      }
    },
    silenceTimeoutMs: 6000
  });

  // Watch state to start/stop listening mode
  useEffect(() => {
    if (state === AssistantState.READY) {
      startWakeListening();
    } else if (state === AssistantState.LISTENING) {
      startCommandListening();
    } else {
      stopListening();
    }
  }, [state, startWakeListening, startCommandListening, stopListening]);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopMicrophone();
      setIsListening(false);
      setVoiceError(null);
      handleTransition(AssistantEvent.DISABLE);
    } else {
      setVoiceError(null);
      const newStream = await startMicrophone();
      if (newStream) {
        setIsListening(true);
        handleTransition(AssistantEvent.ENABLE);
      } else {
        setIsListening(false);
        handleTransition(AssistantEvent.MIC_DENIED);
      }
    }
  }, [isListening, startMicrophone, stopMicrophone, handleTransition]);

  // Handle permission changes
  useEffect(() => {
    if (permissionStatus === 'denied') {
      handleTransition(AssistantEvent.MIC_DENIED);
      setIsListening(false);
    } else if (permissionStatus === 'granted' && state === AssistantState.PERMISSION_REQUIRED) {
      handleTransition(AssistantEvent.MIC_GRANTED);
    }
  }, [permissionStatus, handleTransition, state]);

  const handleOrbClick = useCallback(() => {
    setVoiceError(null);
    if (state === AssistantState.READY) {
      // Manual trigger overrides wake word
      stopListening();
      handleTransition(AssistantEvent.WAKE_WORD);
      if (ttsRef.current) {
        ttsRef.current.speak("Yes?", { speed: settings.speechSpeed }).then(() => {
          handleTransition(AssistantEvent.ACKNOWLEDGE_DONE);
        });
      } else {
        setTimeout(() => handleTransition(AssistantEvent.ACKNOWLEDGE_DONE), 500);
      }
    } else if (state === AssistantState.LISTENING) {
      commitCommand();
    } else if (state === AssistantState.SPEAKING) {
      // Barge-in: stop TTS and transition back to READY
      if (ttsRef.current) {
        ttsRef.current.stop();
      }
      handleTransition(AssistantEvent.SPEECH_COMPLETE);
    }
  }, [state, commitCommand, handleTransition, stopListening, settings.speechSpeed]);

  return (
    <>
      {/* Settings gear button */}
      <button
        id="settings-button"
        className="settings-btn"
        onClick={() => setSettingsOpen(true)}
        aria-label="Open settings"
      >
        ⚙
      </button>

      {/* Settings panel */}
      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        permissionStatus={permissionStatus}
        isListening={isListening}
      />

      {/* Main content */}
      <main className="app-container">
        <section className="orb-section">
          {/* Animated Orb */}
          <div className="fade-in">
            <Orb state={state} audioLevel={audioLevel} onClick={handleOrbClick} />
          </div>

          {/* Brand */}
          <h1 className="brand-name fade-in-delay-1">Partner</h1>

          {/* Status */}
          <div className="fade-in-delay-2">
            <StatusText state={state} />
          </div>

          {/* Hint */}
          {state === AssistantState.READY && (
            <p className="hint-text fade-in-delay-3">
              {voiceError ? (
                <span style={{ color: '#ff6b6b' }}>{voiceError} (Tap orb to talk)</span>
              ) : (
                isSttSupported ? 'Say "Hey Partner" or click orb' : 'Voice recognition isn\'t supported in this browser (Tap orb to talk)'
              )}
            </p>
          )}

          {/* Transcript Area */}
          <div className={`transcript-area ${
            state === AssistantState.LISTENING || 
            state === AssistantState.PROCESSING || 
            state === AssistantState.SPEAKING 
              ? 'visible' : ''
          }`}>
            <span className="user-text">
              {finalTranscript} <span style={{ opacity: 0.7 }}>{interimTranscript}</span>
            </span>
            {state === AssistantState.PROCESSING && <div className="ai-text mt-2">Thinking...</div>}
            {state === AssistantState.SPEAKING && messages.length > 0 && (
              <div className="ai-text mt-2">{messages[messages.length - 1].content}</div>
            )}
          </div>

          {/* Listening toggle */}
          <div className="fade-in-delay-3">
            <ListeningToggle isOn={isListening} onToggle={toggleListening} />
          </div>

          {/* Developer Diagnostics */}
          <div className="diagnostics-panel fade-in-delay-3" style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#00d4ff',
            textAlign: 'left',
            width: '100%',
            maxWidth: '300px'
          }}>
            <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>DEVELOPER DIAGNOSTICS</strong>
              <button 
                onClick={toggleListening}
                style={{ padding: '4px 8px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Test Microphone
              </button>
            </div>
            <div>MICROPHONE<br/><span style={{color: stream ? '#00e68a' : '#ff4466'}}>{stream ? 'ACTIVE' : 'INACTIVE'}</span></div><br/>
            <div>AUDIO TRACK<br/><span style={{color: trackState === 'live' ? '#00e68a' : '#ffaa00'}}>{trackState.toUpperCase()}</span></div><br/>
            <div>AUDIO CONTEXT<br/><span style={{color: contextState === 'running' ? '#00e68a' : '#ffaa00'}}>{contextState.toUpperCase()}</span></div><br/>
            <div>RMS<br/>{rmsValue.toFixed(4)}</div><br/>
            <div>INPUT LEVEL<br/>{Math.round(audioLevel * 100)}%</div>
            <div style={{ marginTop: '5px', letterSpacing: '2px' }}>
              {'█'.repeat(Math.round(audioLevel * 10))}{'░'.repeat(10 - Math.round(audioLevel * 10))}
            </div>
            {stream && trackState !== 'live' && (
              <div style={{ marginTop: '10px', color: '#ff4466' }}>✕ Microphone input unavailable</div>
            )}
            {stream && trackState === 'live' && audioLevel > 0 && (
              <div style={{ marginTop: '10px', color: '#00e68a' }}>✓ Microphone working</div>
            )}
          </div>
        </section>
      </main>

    </>
  );
}
