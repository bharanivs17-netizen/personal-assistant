'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { AssistantState, AssistantEvent, DEFAULT_SETTINGS, transition } from '@partner/shared';
import type { PartnerSettings } from '@partner/shared';
import { matchIntent, getOfflineResponse, handleUtilityIntent } from '@/utils/intentMatcher';

import Orb from '@/components/Orb';
import StatusText from '@/components/StatusText';
import ListeningToggle from '@/components/ListeningToggle';
import Settings from '@/components/Settings';
import { useMicrophone } from '@/hooks/useMicrophone';
import { useAudioAnalyser } from '@/hooks/useAudioAnalyser';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useChat } from '@/hooks/useChat';
import { WebSpeechTTS, TTSDebugInfo } from '@partner/voice';

type ChatMessage = { role: 'user' | 'partner', text: string };

export default function Home() {
  const [state, setState] = useState<AssistantState>(AssistantState.STOPPED);
  const [settings, setSettings] = useState<PartnerSettings>(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isLocalResponse, setIsLocalResponse] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [ttsDebug, setTtsDebug] = useState<TTSDebugInfo | null>(null);
  const processingRef = useRef(false);
  const pendingToolRef = useRef<{ toolName: string, toolArgs?: any } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const { stream, permissionStatus, micError, startMicrophone, stopMicrophone } = useMicrophone();
  const { audioLevel, rmsValue, contextState, trackState } = useAudioAnalyser(stream, !!stream);

  useEffect(() => {
    if (micError) setVoiceError(micError);
  }, [micError]);
  
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

  const {
    startWakeListening,
    startCommandListening,
    stopListening,
    commitCommand,
    interimTranscript,
    finalTranscript,
    isSupported: isSttSupported,
    conversationModeRef,
    isSpeakingRef,
    stopRequestedRef,
    isRecognitionRunningRef,
    recognitionRef,
    restartTimeoutRef,
    scheduleSafeRestart
  } = useSpeechRecognition({
    onWakeWordDetected: () => {
      conversationModeRef.current = true;
      stopRequestedRef.current = false;
      setState(AssistantState.WAKE_DETECTED);
      speakResponse("Yes?");
    },
    onCommandRecognized: (text: string) => {
      processCommand(text);
    },
    onSilenceTimeout: () => {
      if (conversationModeRef.current && state === AssistantState.CONTINUOUS_LISTENING) {
        scheduleSafeRestart();
      } else if (state === AssistantState.CONFIRMING) {
         // Keep waiting for confirmation or timeout
         scheduleSafeRestart();
      } else {
        handleTransition(AssistantEvent.SILENCE_TIMEOUT);
      }
    },
    onError: (errorMsg: string) => {
      if (errorMsg === 'PERMISSION_REQUIRED') {
        conversationModeRef.current = false;
        setState(AssistantState.PERMISSION_REQUIRED);
        setIsListening(false);
      } else {
        setVoiceError(errorMsg);
        if (conversationModeRef.current && state !== AssistantState.SPEAKING) {
          scheduleSafeRestart();
        } else if (!conversationModeRef.current && state === AssistantState.LISTENING) {
          handleTransition(AssistantEvent.DISABLE);
        }
      }
    },
    silenceTimeoutMs: 6000,
    language: settings.language
  });

  const speakResponse = useCallback((text: string, keepListening = false, nextState = AssistantState.READY) => {
    if (!ttsRef.current) return;
    
    setChatHistory(prev => [...prev, { role: 'partner', text }]);
    ttsRef.current.stop();
    isSpeakingRef.current = true;
    setState(AssistantState.SPEAKING);

    ttsRef.current.speak(text, {
      speed: settings.speechSpeed,
      lang: settings.responseLanguage,
      onDebug: setTtsDebug,
      onStart: () => {
        isSpeakingRef.current = true;
        setState(AssistantState.SPEAKING);
      },
      onEnd: () => {
        isSpeakingRef.current = false;
        if (keepListening || (conversationModeRef.current && !stopRequestedRef.current)) {
          setState(nextState === AssistantState.READY ? AssistantState.CONTINUOUS_LISTENING : nextState);
          scheduleSafeRestart();
        } else {
          setState(nextState);
        }
      },
      onError: () => {
        isSpeakingRef.current = false;
        if (keepListening || (conversationModeRef.current && !stopRequestedRef.current)) {
          setState(nextState === AssistantState.READY ? AssistantState.CONTINUOUS_LISTENING : nextState);
          scheduleSafeRestart();
        } else {
          setState(nextState);
        }
      }
    });
  }, [settings.speechSpeed, settings.responseLanguage, conversationModeRef, isSpeakingRef, stopRequestedRef, scheduleSafeRestart]);

  const { isGenerating, generateResponse } = useChat({
    onChunk: () => {},
    onComplete: (fullText) => {
      processingRef.current = false;
      if (fullText) {
        speakResponse(fullText);
      } else {
        if (conversationModeRef.current) {
          setState(AssistantState.CONTINUOUS_LISTENING);
          scheduleSafeRestart();
        } else {
          setState(AssistantState.READY);
        }
      }
    },
    onError: (err) => {
      processingRef.current = false;
      setVoiceError(err.message || "Sorry, I couldn't connect to Partner's AI service.");
      const actualLang = settings.responseLanguage === 'auto' ? 'english' : settings.responseLanguage;
      const fallbackMsg = actualLang === 'tamil' ? "மன்னிக்கவும், பிழை ஏற்பட்டுள்ளது." : "Gemini is unavailable right now. Please try again.";
      speakResponse(fallbackMsg);
    }
  });

  const processCommand = useCallback(async (commandText: string) => {
    const text = commandText.trim();
    if (!text) return;
    if (isSpeakingRef.current) return;

    setChatHistory(prev => [...prev, { role: 'user', text }]);
    
    // Check stop commands immediately
    const stopCommands = [
      'stop', 'stop listening', 'stop conversation', 'stop talking',
      'goodbye', 'bye', 'bye partner', 'cancel', 'exit', 'exit conversation',
      'போதும்', 'நிறுத்து', 'கேட்பதை நிறுத்து', 'பேசுவதை நிறுத்து', 'நன்றி போதும்',
      'stop listening pannu', 'pesuratha niruthu', 'kekuratha niruthu', 'ippo pothum'
    ];
    
    if (stopCommands.some(cmd => text.toLowerCase().includes(cmd))) {
      conversationModeRef.current = false;
      stopRequestedRef.current = true;
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (ttsRef.current) ttsRef.current.stop();
      isSpeakingRef.current = false;
      try { recognitionRef.current?.abort(); } catch {}
      isRecognitionRunningRef.current = false;
      setState(AssistantState.READY);
      pendingToolRef.current = null;
      
      const actualLang = settings.responseLanguage === 'auto' ? 'english' : settings.responseLanguage;
      const okMsg = actualLang === 'tamil' ? "சரி, நான் கேட்பதை நிறுத்துகிறேன்." : "Okay, I'll stop listening.";
      setChatHistory(prev => [...prev, { role: 'partner', text: okMsg }]);
      ttsRef.current?.speak(okMsg, { speed: settings.speechSpeed, lang: settings.responseLanguage });
      return;
    }

    // Handle CONFIRMING state
    if (state === AssistantState.CONFIRMING && pendingToolRef.current) {
        const affirmative = ['yes', 'ok', 'do it', 'sure', 'yeah', 'ஆம்', 'சரி'];
        const isYes = affirmative.some(a => text.toLowerCase().includes(a));
        
        if (isYes) {
            const tool = pendingToolRef.current;
            pendingToolRef.current = null;
            
            // Execute tool
            if (typeof window !== 'undefined' && (window as any).partnerDesktop) {
               try {
                   const result = await (window as any).partnerDesktop.executeTool(tool.toolName, tool.toolArgs);
                   speakResponse(result.message);
               } catch (err) {
                   speakResponse("Failed to execute the system command.");
               }
            }
        } else {
            pendingToolRef.current = null;
            speakResponse("Operation cancelled.");
        }
        return;
    }

    if (processingRef.current) return;
    processingRef.current = true;
    
    stopRequestedRef.current = false;
    try { recognitionRef.current?.stop(); } catch {}

    setState(AssistantState.PROCESSING);
    setIsLocalResponse(false);

    // 1. Check Offline & Tool Intents
    const match = matchIntent(text);
    if (match) {
       setIsLocalResponse(true);
       
       if (match.isTool) {
           if (match.intent === 'PARTNER_MICROPHONE_OFF') {
               toggleListening();
               setChatHistory(prev => [...prev, { role: 'partner', text: "Microphone disabled." }]);
               processingRef.current = false;
               return;
           }

           // PC Controls
           if (typeof window !== 'undefined' && (window as any).partnerDesktop) {
               const requiresConfirmation = ['SHUTDOWN_COMPUTER', 'RESTART_COMPUTER', 'SLEEP_COMPUTER'].includes(match.intent);
               if (requiresConfirmation) {
                   pendingToolRef.current = { toolName: match.toolName!, toolArgs: match.toolArgs };
                   speakResponse("Are you sure you want to do this?", true, AssistantState.CONFIRMING);
                   processingRef.current = false;
                   return;
               } else {
                   try {
                       const result = await (window as any).partnerDesktop.executeTool(match.toolName, match.toolArgs);
                       speakResponse(result.message);
                   } catch (err) {
                       speakResponse("Failed to execute the system command.");
                   }
                   processingRef.current = false;
                   return;
               }
           } else {
               speakResponse("Open the PARTNER desktop app to use PC controls.");
               processingRef.current = false;
               return;
           }
       }

       let responseText = '';
       if (['GET_TIME', 'GET_DATE', 'GET_DAY', 'CALCULATE', 'ONLINE_STATUS', 'OFFLINE_STATUS'].includes(match.intent)) {
          const actualLang = settings.responseLanguage === 'auto' 
             ? (text.match(/[\u0B80-\u0BFF]/) || text.includes('enna') || text.includes('epdi') ? 'tamil' : 'english') 
             : settings.responseLanguage;
          responseText = handleUtilityIntent(match.intent, actualLang, match.responseParams);
       } else if (match.intent === 'REPEAT') {
          // Find last partner message
          const lastPartnerMsg = [...chatHistory].reverse().find(m => m.role === 'partner');
          responseText = lastPartnerMsg ? lastPartnerMsg.text : "I haven't said anything yet.";
       } else {
          responseText = getOfflineResponse(match.intent, settings.responseLanguage, text) || "I understand the intent but don't have a response for it.";
       }

       if (responseText) {
          speakResponse(responseText);
       } else {
          if (conversationModeRef.current) {
            setState(AssistantState.CONTINUOUS_LISTENING);
            scheduleSafeRestart();
          } else {
            setState(AssistantState.READY);
          }
       }
       processingRef.current = false;
       return;
    }

    // 2. Check Network and fallback to Gemini
    if (!navigator.onLine) {
       setIsLocalResponse(true);
       const actualLang = settings.responseLanguage === 'auto' 
          ? (text.match(/[\u0B80-\u0BFF]/) || text.includes('enna') ? 'tamil' : 'english') 
          : settings.responseLanguage;
       
       const fallbackMsg = actualLang === 'tamil' 
          ? "மன்னிக்கவும், நான் ஆஃப்லைனில் உள்ளேன். இணையத்துடன் இணைக்கவும்." 
          : "Sorry, I am currently offline and couldn't process that command.";
       
       speakResponse(fallbackMsg);
       processingRef.current = false;
       return;
    }

    generateResponse(text);
  }, [
    state, isSpeakingRef, conversationModeRef, stopRequestedRef, restartTimeoutRef,
    recognitionRef, isRecognitionRunningRef, settings.responseLanguage, settings.speechSpeed,
    chatHistory, scheduleSafeRestart, speakResponse, generateResponse
  ]);

  // Watch state to start/stop listening mode
  useEffect(() => {
    if (state === AssistantState.READY) {
      startWakeListening();
    } else if (state === AssistantState.LISTENING || state === AssistantState.CONTINUOUS_LISTENING || state === AssistantState.CONFIRMING) {
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
      conversationModeRef.current = false;
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
  }, [isListening, startMicrophone, stopMicrophone, handleTransition, conversationModeRef]);

  // Handle permission changes
  useEffect(() => {
    if (permissionStatus === 'denied') {
      conversationModeRef.current = false;
      handleTransition(AssistantEvent.MIC_DENIED);
      setIsListening(false);
    } else if (permissionStatus === 'granted' && state === AssistantState.PERMISSION_REQUIRED) {
      handleTransition(AssistantEvent.MIC_GRANTED);
    }
  }, [permissionStatus, handleTransition, state, conversationModeRef]);

  const handleOrbClick = useCallback(() => {
    setVoiceError(null);
    if (state === AssistantState.READY) {
      stopListening();
      conversationModeRef.current = true;
      stopRequestedRef.current = false;
      setState(AssistantState.WAKE_DETECTED);
      speakResponse("Yes?");
    } else if (state === AssistantState.LISTENING || state === AssistantState.CONTINUOUS_LISTENING || state === AssistantState.CONFIRMING) {
      commitCommand();
    } else if (state === AssistantState.SPEAKING) {
      if (ttsRef.current) ttsRef.current.stop();
      isSpeakingRef.current = false;
      setState(AssistantState.CONTINUOUS_LISTENING);
      scheduleSafeRestart();
    }
  }, [state, commitCommand, stopListening, speakResponse, conversationModeRef, stopRequestedRef, isSpeakingRef, scheduleSafeRestart]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      processCommand(chatInput);
      setChatInput('');
    }
  };

  return (
    <>
      <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-dim)', fontWeight: 600, background: 'rgba(0,0,0,0.4)', padding: '4px 12px', borderRadius: '12px' }}>
           <span style={{ 
              display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', 
              backgroundColor: isOnline ? '#00e68a' : '#ff6b6b',
              boxShadow: isOnline ? '0 0 8px #00e68a' : '0 0 8px #ff6b6b'
           }} />
           {isOnline ? 'Online' : 'Offline'}
        </div>
        <button
          id="settings-button"
          className="settings-btn"
          style={{ position: 'static' }}
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
        >
          ⚙
        </button>
      </div>

      {/* TTS Debug Panel */}
      {settings.showTTSDebug && (
        <div style={{ position: 'fixed', top: '1.5rem', left: '1.5rem', background: 'rgba(0,0,0,0.8)', padding: '1rem', borderRadius: '12px', border: '1px solid #444', color: '#00d4ff', fontSize: '0.85rem', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '300px' }}>
          <h3 style={{ margin: 0, color: '#fff' }}>TTS Debug</h3>
          <div><strong>Language:</strong> {ttsDebug?.language || '-'}</div>
          <div><strong>Voice:</strong> {ttsDebug?.voiceName || '-'}</div>
          <div><strong>Status:</strong> {ttsDebug?.status || '-'}</div>
          <div style={{ color: ttsDebug?.status === 'ERROR' ? '#ff6b6b' : 'inherit', wordBreak: 'break-word' }}><strong>Error:</strong> {ttsDebug?.error || '-'}</div>
          <div><strong>Tamil Voices:</strong> {ttsDebug ? (ttsDebug.hasTamilVoice ? 'YES' : 'NO') : '-'}</div>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button onClick={() => {
              if (ttsRef.current) ttsRef.current.speak("வணக்கம்! நான் Partner. உங்களுக்கு எப்படி உதவலாம்?", { onDebug: setTtsDebug });
            }} style={{ padding: '6px 8px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>
              🔊 Test Tamil
            </button>
            <button onClick={() => {
              if (ttsRef.current) ttsRef.current.speak("Hello! I am Partner. How can I help you?", { onDebug: setTtsDebug });
            }} style={{ padding: '6px 8px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>
              🔊 Test English
            </button>
          </div>
        </div>
      )}

      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        permissionStatus={permissionStatus}
        isListening={isListening}
      />

      <main className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '2rem 1rem' }}>
        
        {/* Chat History Area (Flexible space) */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem', marginTop: '3rem' }}>
          {chatHistory.length === 0 && state === AssistantState.READY && (
             <div style={{ margin: 'auto', textAlign: 'center', opacity: 0.5, color: '#fff', fontSize: '0.9rem' }}>
               {isSttSupported ? 'Say "Hey Partner" or click the orb to start' : 'Type a message to start'}
             </div>
          )}
          {chatHistory.map((msg, idx) => (
            <div key={idx} style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              background: msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(0, 212, 255, 0.1)',
              border: msg.role === 'partner' ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid rgba(255,255,255,0.05)',
              padding: '10px 16px',
              borderRadius: '16px',
              borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
              borderBottomLeftRadius: msg.role === 'partner' ? '4px' : '16px',
              maxWidth: '80%',
              color: '#fff',
              fontSize: '0.95rem',
              lineHeight: '1.4'
            }}>
              {msg.text}
            </div>
          ))}
          {/* Ongoing Transcript / Typing indicator */}
          {(finalTranscript || interimTranscript || state === AssistantState.PROCESSING) && (
            <div style={{ alignSelf: 'flex-end', opacity: 0.7, padding: '10px 16px', fontSize: '0.9rem' }}>
               <span className="user-text">
                  {finalTranscript} <span>{interimTranscript}</span>
               </span>
               {state === AssistantState.PROCESSING && <span style={{ fontStyle: 'italic', marginLeft: '10px' }}>Processing...</span>}
            </div>
          )}
          {state === AssistantState.CONFIRMING && (
            <div style={{ alignSelf: 'center', background: 'rgba(255,170,0,0.1)', border: '1px solid #ffaa00', padding: '12px 20px', borderRadius: '8px', color: '#ffaa00', display: 'flex', gap: '1rem', alignItems: 'center' }}>
               <span>Are you sure you want to do this?</span>
               <button onClick={() => processCommand('yes')} style={{ padding: '6px 12px', background: '#ffaa00', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Yes</button>
               <button onClick={() => processCommand('no')} style={{ padding: '6px 12px', background: 'transparent', color: '#ffaa00', border: '1px solid #ffaa00', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Fixed Bottom Section (Orb & Controls) */}
        <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          
          <div className="fade-in">
            <Orb state={state} audioLevel={audioLevel} onClick={handleOrbClick} />
          </div>

          <div className="fade-in-delay-2">
            <StatusText state={state} />
          </div>

          {voiceError && <p className="hint-text fade-in-delay-3" style={{ color: '#ff6b6b' }}>{voiceError}</p>}

          {settings.showMicToggle && (
            <div className="fade-in-delay-3">
              <ListeningToggle isOn={isListening} onToggle={toggleListening} />
            </div>
          )}

          {/* Text Input */}
          <form onSubmit={handleChatSubmit} style={{ display: 'flex', width: '100%', maxWidth: '600px', gap: '0.5rem', background: 'rgba(0,0,0,0.4)', padding: '8px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
             <input 
               type="text" 
               value={chatInput}
               onChange={(e) => setChatInput(e.target.value)}
               placeholder="Type a message or command..." 
               style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', padding: '0 12px', fontSize: '1rem', outline: 'none' }}
             />
             <button type="submit" disabled={!chatInput.trim()} style={{ background: chatInput.trim() ? '#00d4ff' : 'rgba(255,255,255,0.1)', color: chatInput.trim() ? '#000' : '#888', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: chatInput.trim() ? 'pointer' : 'default', transition: 'all 0.2s' }}>
                ➤
             </button>
          </form>
          
        </section>
      </main>
    </>
  );
}
