'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { AssistantState, AssistantEvent, DEFAULT_SETTINGS, transition } from '@partner/shared';
import type { PartnerSettings } from '@partner/shared';
import { matchIntent, getOfflineResponse, handleUtilityIntent, isTimeSensitive } from '@/utils/intentMatcher';
import { saveMemory } from '@/utils/memoryManager';

import Orb from '@/components/Orb';
import StatusText from '@/components/StatusText';
import Settings from '@/components/Settings';
import { useMicrophone } from '@/hooks/useMicrophone';
import { useAudioAnalyser } from '@/hooks/useAudioAnalyser';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useChat } from '@/hooks/useChat';
import { WebSpeechTTS, TTSDebugInfo } from '@partner/voice';
import { registry, registerWebTools } from '@partner/tools';

type ChatMessage = { role: 'user' | 'partner', text: string };

const DEBUG_VOICE_MODE = false; // Set to false to restore wake-word mode

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
  const lastProcessedTranscriptRef = useRef<string | null>(null);
  const pendingToolRef = useRef<{ toolName: string, toolArgs?: any } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerWebTools();
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
      
      if (ttsRef.current) {
        ttsRef.current.stop();
        isSpeakingRef.current = true;
        // Speak acknowledgement without adding to chat history or changing state to SPEAKING
        ttsRef.current.speak("Yes, now I am listening.", {
          speed: settings.speechSpeed,
          lang: settings.responseLanguage,
          onStart: () => {}, // Maintain WAKE_DETECTED state
          onEnd: () => {
            isSpeakingRef.current = false;
            setState(AssistantState.CONTINUOUS_LISTENING);
            scheduleSafeRestart();
          },
          onError: () => {
            isSpeakingRef.current = false;
            setState(AssistantState.CONTINUOUS_LISTENING);
            scheduleSafeRestart();
          }
        });
      } else {
        setState(AssistantState.CONTINUOUS_LISTENING);
        scheduleSafeRestart();
      }
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
        console.log("[PARTNER][PERF] TTS started");
        console.log("[PARTNER][VOICE] TTS started");
        isSpeakingRef.current = true;
        setState(AssistantState.SPEAKING);
      },
      onEnd: () => {
        console.log("[PARTNER][VOICE] TTS ended");
        isSpeakingRef.current = false;
        if (keepListening || (conversationModeRef.current && !stopRequestedRef.current)) {
          console.log("[PARTNER][VOICE] ready for next command");
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
      // NOTE: DO NOT set processingRef to false here, wait for TTS to finish!
      if (fullText) {
        speakResponse(fullText);
      } else {
        processingRef.current = false;
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
    },
    onToolCall: async (toolName, args) => {
      console.log(`[PARTNER][AGENT] Executing tool: ${toolName}`, args);
      if (toolName === 'store_memory') {
         saveMemory(args.category, args.key, args.value);
         return { success: true, message: `Memory saved: ${args.key}=${args.value}` };
      } else if (toolName === 'execute_local_action') {
         // Re-use the existing web tools system
         const tool = registry.getTool(args.action);
         if (tool) {
            const result = await tool.execute(args);
            if (result.success && result.data?.url) {
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                if (isMobile) {
                    window.location.href = result.data.url;
                } else {
                    window.open(result.data.url, '_blank');
                }
                return { success: true, message: "Action executed successfully. URL opened." };
            }
            return result;
         }
         return { success: false, error: `Action '${args.action}' not found in registry.` };
      }
      return { success: false, error: "Unknown tool" };
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

    if (processingRef.current) {
      console.log("[PARTNER] Cancelling previous request in favor of new one");
      // Allow new request to proceed and abort the old API call in useChat
    }

    const normalizedTranscript = text.toLowerCase();
    if (lastProcessedTranscriptRef.current === normalizedTranscript) {
      console.log("[PARTNER] Duplicate transcript ignored:", normalizedTranscript);
      return;
    }
    
    lastProcessedTranscriptRef.current = normalizedTranscript;
    processingRef.current = true;
    
    // PERF LOG
    const perfStartTime = Date.now();
    console.log("[PARTNER][PERF] Speech recognition started"); // Conceptually this starts when they speak, but we log here to trace pipeline
    console.log("[PARTNER][PERF] Transcript received");
    
    console.log("[PARTNER] Processing started");
    console.log("[PARTNER] Final transcript:", text);
    
    stopRequestedRef.current = false;
    try { recognitionRef.current?.stop(); } catch {}

    setState(AssistantState.PROCESSING);
    setIsLocalResponse(false);

    console.log(`[PARTNER][REQUEST] Question: ${text}`);
    
    // Check if time-sensitive first
    const timeSensitive = isTimeSensitive(text);

    // 1. Check Offline & Tool Intents
    const match = matchIntent(text);
    console.log(`[PARTNER][PERF] Routing completed: ${Date.now() - perfStartTime} ms`);
    
    if (match) {
       console.log("[PARTNER][ANDROID] Intent:", match.intent);
       if (match.isTool) {
           console.log("[PARTNER][ANDROID] Tool:", match.toolName);
           console.log("[PARTNER][ANDROID] Tool args:", match.toolArgs);
       }
       setIsLocalResponse(true);
       
       if (match.isTool) {
           if (match.intent === 'PARTNER_MICROPHONE_OFF') {
               toggleListening();
               setChatHistory(prev => [...prev, { role: 'partner', text: "Microphone disabled." }]);
               processingRef.current = false;
               return;
           }

           // Web Tools
           const webTools = ['open_youtube', 'search_web', 'open_google', 'open_gmail', 'open_whatsapp_web'];
           if (match.toolName && webTools.includes(match.toolName)) {
               console.log("[PARTNER][INTENT] Transcript:", text);
               console.log("[PARTNER][INTENT] Detected intent:", match.intent);
               console.log("[PARTNER][INTENT] Target:", match.toolName);
               console.log("[PARTNER][INTENT] Query:", match.toolArgs?.query || '');
               console.log("[PARTNER][INTENT] Executing action:", match.intent);
               
               const tool = registry.getTool(match.toolName);
               if (tool) {
                   const result = await tool.execute(match.toolArgs);
                   if (result.success && result.data?.url) {
                       console.log("[PARTNER] Opening URL:", result.data.url);
                       let responseMsg = result.message;
                       
                       if (match.intent === 'OPEN_YOUTUBE' && match.toolArgs?.query) {
                           responseMsg = `Opening YouTube and searching for ${match.toolArgs.query}.`;
                       } else if (match.intent === 'SEARCH_WEB' && match.toolArgs?.query) {
                           responseMsg = `Searching the web for ${match.toolArgs.query}.`;
                       }
                       
                       setChatHistory(prev => [...prev, { role: 'partner', text: responseMsg }]);
                       if (ttsRef.current) ttsRef.current.stop();
                       isSpeakingRef.current = true;
                       setState(AssistantState.SPEAKING);
                       
                       const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                       
                       ttsRef.current?.speak(responseMsg, {
                         speed: settings.speechSpeed,
                         lang: settings.responseLanguage,
                         onEnd: () => {
                           isSpeakingRef.current = false;
                           if (isMobile) {
                               window.location.href = result.data.url;
                           } else {
                               window.open(result.data.url, '_blank');
                               setState(AssistantState.CONTINUOUS_LISTENING);
                               scheduleSafeRestart();
                           }
                         },
                         onError: () => {
                           isSpeakingRef.current = false;
                           if (isMobile) {
                               window.location.href = result.data.url;
                           } else {
                               window.open(result.data.url, '_blank');
                               setState(AssistantState.CONTINUOUS_LISTENING);
                               scheduleSafeRestart();
                           }
                         }
                       });
                   } else {
                       speakResponse(result.message || "Failed to open the link.");
                   }
               }
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
               speakResponse("This feature requires the PARTNER Android/Desktop application.");
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
       } else if (match.intent === 'TELL_STORY') {
           const reqLang = match.responseParams?.lang || 'auto';
           const actualLang = reqLang === 'auto' ? settings.responseLanguage : reqLang;
           const targetLangName = (actualLang === 'tamil' || actualLang === 'ta' || actualLang === 'auto') ? 'Tamil' : 'English';
           
           const storyPrompt = `The user wants to hear a short story. 
1. Language: STRICTLY ${targetLangName}. Do NOT translate to English if Tamil is requested.
2. Acknowledgment: Start by acknowledging the request naturally (e.g., if Tamil, say "சரி! ஒரு குட்டிக் கதை சொல்கிறேன்." or if English, say "Sure! I'll tell you a short story.").
3. Story: Tell a short, simple, engaging, and original story.
4. Length: Keep it strictly around 5 to 10 simple sentences, suitable for quick spoken audio.
5. Ending: End with a small positive message or moral (e.g., "இந்தக் கதையின் நீதி: ...").
6. Formatting: Do NOT use any markdown, asterisks, or special formatting. Use only plain text that is natural for a Text-to-Speech engine.`;
           
           console.log("[PARTNER] Story intent detected. Requesting from Gemini.");
           console.log("[PARTNER][ROUTER] Route: CREATIVE");
           generateResponse(storyPrompt);
           return;
       } else {
          responseText = getOfflineResponse(match.intent, settings.responseLanguage, text) || "I understand the intent but don't have a response for it.";
       }

       console.log(`[PARTNER][ROUTER] Route: LOCAL_INTENT`);
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

    console.log(`[PARTNER][ROUTER] Route: ${timeSensitive ? 'TIME_SENSITIVE' : 'GENERAL_KNOWLEDGE'}`);
    if (timeSensitive) {
      console.log("[PARTNER][ROUTER] Source verified: true");
    }

    generateResponse(text, timeSensitive);
  }, [
    state, isSpeakingRef, conversationModeRef, stopRequestedRef, restartTimeoutRef,
    recognitionRef, isRecognitionRunningRef, settings.responseLanguage, settings.speechSpeed,
    chatHistory, scheduleSafeRestart, speakResponse, generateResponse
  ]);

  // Watch state to start/stop listening mode
  useEffect(() => {
    console.log("[PARTNER][VOICE] state:", state);
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
        console.log("[PARTNER][ANDROID] Listening toggle: ON");
        
        // FIX: Android Chrome prevents SpeechRecognition from capturing audio if getUserMedia is active.
        // We stop the stream here so SpeechRecognition can use the microphone.
        if (/Android/i.test(navigator.userAgent)) {
          stopMicrophone();
        }

        if (DEBUG_VOICE_MODE) {
           console.log("[PARTNER][ANDROID] DEBUG_VOICE_MODE enabled, bypassing wake word");
           conversationModeRef.current = true;
           setState(AssistantState.CONTINUOUS_LISTENING);
        } else {
           handleTransition(AssistantEvent.ENABLE);
        }
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
    <div className="app-layout">
      {/* ── Header ── */}
      <header className="app-header fade-in">
        <div className="brand-logo">
          PARTNER
          <div className={`status-dot ${isOnline ? 'online' : 'offline'}`} title={isOnline ? 'Online' : 'Offline'} />
        </div>
        <button
          className="settings-btn"
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </header>

      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        permissionStatus={permissionStatus}
        isListening={isListening}
        ttsDebug={ttsDebug}
        onTestTTS={(lang) => {
          if (ttsRef.current) {
            const msg = lang === 'ta' 
              ? "வணக்கம்! நான் Partner. உங்களுக்கு எப்படி உதவலாம்?" 
              : "Hello! I am Partner. How can I help you?";
            ttsRef.current.speak(msg, { onDebug: setTtsDebug });
          }
        }}
      />

      <main className="main-content">
        <div className="orb-container fade-in">
          <Orb state={state} audioLevel={audioLevel} onClick={handleOrbClick} />
          <div className="fade-in-delay-1">
            <StatusText state={state} />
          </div>
        </div>
      </main>

      <section className="bottom-area">
        <div className="conversation-area">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.role}`}>
              {msg.text}
            </div>
          ))}
          {(finalTranscript || interimTranscript || state === AssistantState.PROCESSING) && (
            <div className="chat-bubble user">
               {DEBUG_VOICE_MODE && (finalTranscript || interimTranscript) && (
                 <div style={{ color: 'var(--color-accent)', marginBottom: '4px', fontWeight: 600, fontSize: '0.8rem' }}>
                   DEBUG HEARD:
                 </div>
               )}
               {finalTranscript} <span style={{ opacity: 0.7 }}>{interimTranscript}</span>
               {state === AssistantState.PROCESSING && <div className="chat-typing">Thinking...</div>}
            </div>
          )}
          {state === AssistantState.CONFIRMING && (
            <div className="chat-bubble partner" style={{ border: '1px solid var(--color-warning)' }}>
               <div>Are you sure you want to do this?</div>
               <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                 <button className="btn-primary" onClick={() => processCommand('yes')}>Yes</button>
                 <button className="btn-secondary" onClick={() => processCommand('no')}>Cancel</button>
               </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form className="command-bar fade-in-delay-2" onSubmit={handleChatSubmit}>
          <button
            type="button"
            className={`mic-button ${isListening ? 'active' : ''}`}
            onClick={toggleListening}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {isListening ? (
                <rect x="6" y="6" width="12" height="12" rx="2" />
              ) : (
                <>
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </>
              )}
            </svg>
          </button>
          
          <input 
            type="text"
            className="command-input"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask Partner anything..."
            autoComplete="off"
          />

          <button
            type="submit"
            className="send-button"
            disabled={!chatInput.trim()}
            aria-label="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </section>
    </div>
  );
}
