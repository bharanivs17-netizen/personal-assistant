/**
 * Partner — Shared Types
 *
 * Core type definitions shared across all Partner platforms.
 */

/** All possible states of the Partner assistant */
export enum AssistantState {
  /** Assistant is completely off */
  OFF = 'OFF',
  /** Ready and listening for wake word */
  READY = 'READY',
  /** Wake word "Hey Partner" was detected */
  WAKE_DETECTED = 'WAKE_DETECTED',
  /** Actively listening for user command */
  LISTENING = 'LISTENING',
  /** Processing user command through AI */
  PROCESSING = 'PROCESSING',
  /** Speaking AI response via TTS */
  SPEAKING = 'SPEAKING',
  /** An error occurred (auto-recoverable) */
  ERROR = 'ERROR',
  /** Microphone permission is required */
  PERMISSION_REQUIRED = 'PERMISSION_REQUIRED',
  /** No network connection available */
  NO_NETWORK = 'NO_NETWORK',
  /** Actively in a continuous conversation loop */
  CONTINUOUS_LISTENING = 'CONTINUOUS_LISTENING',
  /** Asking user for confirmation of a disruptive action */
  CONFIRMING = 'CONFIRMING',
  /** User has manually stopped listening */
  STOPPED = 'STOPPED',
}

/** Events that trigger state transitions */
export enum AssistantEvent {
  ENABLE = 'ENABLE',
  DISABLE = 'DISABLE',
  WAKE_WORD = 'WAKE_WORD',
  ACKNOWLEDGE_DONE = 'ACKNOWLEDGE_DONE',
  SPEECH_RECOGNIZED = 'SPEECH_RECOGNIZED',
  SILENCE_TIMEOUT = 'SILENCE_TIMEOUT',
  AI_RESPONSE_READY = 'AI_RESPONSE_READY',
  AI_FAILURE = 'AI_FAILURE',
  SPEECH_COMPLETE = 'SPEECH_COMPLETE',
  BARGE_IN = 'BARGE_IN',
  ERROR_RECOVER = 'ERROR_RECOVER',
  MIC_DENIED = 'MIC_DENIED',
  MIC_GRANTED = 'MIC_GRANTED',
  NETWORK_LOST = 'NETWORK_LOST',
  NETWORK_RESTORED = 'NETWORK_RESTORED',
  CONFIRM_YES = 'CONFIRM_YES',
  CONFIRM_NO = 'CONFIRM_NO',
}

/** Partner settings configurable by the user */
export interface PartnerSettings {
  /** Whether "Always Ready" wake-word detection is enabled */
  alwaysReady: boolean;
  /** Selected TTS voice identifier */
  voiceId: string;
  /** Speech speed multiplier (0.8 – 1.2) */
  speechSpeed: number;
  /** Speech volume (0 – 1) */
  speechVolume: number;
  /** Whether notifications are enabled */
  notificationsEnabled: boolean;
  /** Speech recognition language */
  language: 'auto' | 'en-IN' | 'ta-IN';
  /** TTS Response language */
  responseLanguage: 'auto' | 'english' | 'tamil';
  /** New Feature Toggles */
  voiceAssistant: boolean;
  continuousConversation: boolean;
  chatWithPartner: boolean;
  offlineKnowledge: boolean;
  geminiAI: boolean;
  systemControls: boolean;
  voiceResponse: boolean;
  showTTSDebug: boolean;
  showMicToggle: boolean;
}

/** Default settings */
export const DEFAULT_SETTINGS: PartnerSettings = {
  alwaysReady: false,
  voiceId: 'default',
  speechSpeed: 1.0,
  speechVolume: 1.0,
  notificationsEnabled: true,
  language: 'auto',
  responseLanguage: 'auto',
  voiceAssistant: true,
  continuousConversation: true,
  chatWithPartner: true,
  offlineKnowledge: true,
  geminiAI: true,
  systemControls: true,
  voiceResponse: true,
  showTTSDebug: true,
  showMicToggle: true,
};

/** A single message in a conversation */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/** Microphone permission status */
export type MicPermissionStatus = 'granted' | 'denied' | 'prompt' | 'unknown';
