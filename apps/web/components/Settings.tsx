'use client';

import type { PartnerSettings } from '@partner/shared';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PartnerSettings;
  onSettingsChange: (settings: PartnerSettings) => void;
  permissionStatus: string;
  isListening: boolean;
}

export default function Settings({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  permissionStatus,
  isListening,
}: SettingsProps) {
  const displayPermission = 
    permissionStatus === 'granted' ? 'Granted' : 
    permissionStatus === 'denied' ? 'Denied' : 'Not requested';
  return (
    <>
      {/* Overlay */}
      <div
        className={`settings-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`settings-panel ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-label="Settings"
        aria-hidden={!isOpen}
      >
        <div className="settings-header">
          <h2 className="settings-title">Partner</h2>
          <button
            className="settings-close"
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className="settings-body">
          {/* Partner Features */}
          <div className="settings-group">
            <span className="settings-group-title">Partner Features</span>
            
            <div className="settings-row">
              <span className="settings-row-label">Voice Assistant</span>
              <div
                className={`toggle-switch ${settings.voiceAssistant ? 'on' : ''}`}
                onClick={() => onSettingsChange({ ...settings, voiceAssistant: !settings.voiceAssistant })}
              >
                <div className="toggle-switch-knob" />
              </div>
            </div>

            <div className="settings-row">
              <span className="settings-row-label">Continuous Conversation</span>
              <div
                className={`toggle-switch ${settings.continuousConversation ? 'on' : ''}`}
                onClick={() => onSettingsChange({ ...settings, continuousConversation: !settings.continuousConversation })}
              >
                <div className="toggle-switch-knob" />
              </div>
            </div>

            <div className="settings-row">
              <span className="settings-row-label">Chat with Partner</span>
              <div
                className={`toggle-switch ${settings.chatWithPartner ? 'on' : ''}`}
                onClick={() => onSettingsChange({ ...settings, chatWithPartner: !settings.chatWithPartner })}
              >
                <div className="toggle-switch-knob" />
              </div>
            </div>

            <div className="settings-row">
              <span className="settings-row-label">Offline Knowledge</span>
              <div
                className={`toggle-switch ${settings.offlineKnowledge ? 'on' : ''}`}
                onClick={() => onSettingsChange({ ...settings, offlineKnowledge: !settings.offlineKnowledge })}
              >
                <div className="toggle-switch-knob" />
              </div>
            </div>

            <div className="settings-row">
              <span className="settings-row-label">Gemini AI</span>
              <div
                className={`toggle-switch ${settings.geminiAI ? 'on' : ''}`}
                onClick={() => onSettingsChange({ ...settings, geminiAI: !settings.geminiAI })}
              >
                <div className="toggle-switch-knob" />
              </div>
            </div>

            <div className="settings-row">
              <span className="settings-row-label">System Controls</span>
              <div
                className={`toggle-switch ${settings.systemControls ? 'on' : ''}`}
                onClick={() => onSettingsChange({ ...settings, systemControls: !settings.systemControls })}
              >
                <div className="toggle-switch-knob" />
              </div>
            </div>

            <div className="settings-row">
              <span className="settings-row-label">Voice Response</span>
              <div
                className={`toggle-switch ${settings.voiceResponse ? 'on' : ''}`}
                onClick={() => onSettingsChange({ ...settings, voiceResponse: !settings.voiceResponse })}
              >
                <div className="toggle-switch-knob" />
              </div>
            </div>

            <div className="settings-row">
              <span className="settings-row-label">TTS Debug Panel</span>
              <div
                className={`toggle-switch ${settings.showTTSDebug ? 'on' : ''}`}
                onClick={() => onSettingsChange({ ...settings, showTTSDebug: !settings.showTTSDebug })}
              >
                <div className="toggle-switch-knob" />
              </div>
            </div>

            <div className="settings-row">
              <span className="settings-row-label">Microphone Panel</span>
              <div
                className={`toggle-switch ${settings.showMicToggle ? 'on' : ''}`}
                onClick={() => onSettingsChange({ ...settings, showMicToggle: !settings.showMicToggle })}
              >
                <div className="toggle-switch-knob" />
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="settings-group">
            <span className="settings-group-title">System Status</span>
            <div className="settings-row">
              <span className="settings-row-label">Frontend</span>
              <span className="settings-row-value accent">CONNECTED</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Backend</span>
              <span className="settings-row-value accent">CONNECTED</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Gemini</span>
              <span className="settings-row-value accent">AVAILABLE</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Microphone</span>
              <span className="settings-row-value">{permissionStatus === 'granted' ? 'AVAILABLE' : 'DENIED'}</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Speech Recognition</span>
              <span className="settings-row-value accent">AVAILABLE</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">TTS</span>
              <span className="settings-row-value accent">AVAILABLE</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Tamil Voice</span>
              <span className="settings-row-value accent">AVAILABLE</span>
            </div>
          </div>

          {/* System Controls Details */}
          <div className="settings-group">
            <span className="settings-group-title">System Controls (Desktop)</span>
            
            {/* The web app doesn't have system controls natively, we just list them here for UI accuracy */}
            <div className="settings-row">
              <span className="settings-row-label">Brightness</span>
              <span className="settings-row-value accent">Available on Desktop</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Volume</span>
              <span className="settings-row-value accent">Available on Desktop</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Microphone</span>
              <span className="settings-row-value accent">Partner MIC Only</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Lock / Sleep / Power</span>
              <span className="settings-row-value accent">Available on Desktop</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Applications</span>
              <span className="settings-row-value accent">Available on Desktop</span>
            </div>
          </div>

          {/* Wake Word */}
          <div className="settings-group">
            <span className="settings-group-title">Wake Word</span>
            <div className="settings-row">
              <span className="settings-row-label">Activation phrase</span>
              <span className="settings-row-value accent">Hey Partner</span>
            </div>
          </div>

          {/* Languages */}
          <div className="settings-group">
            <span className="settings-group-title">Language</span>
            
            <div className="settings-row">
              <span className="settings-row-label">Speech recognition</span>
              <select 
                className="settings-select"
                value={settings.language || 'auto'}
                onChange={(e) => onSettingsChange({
                  ...settings,
                  language: e.target.value as 'auto' | 'en-IN' | 'ta-IN'
                })}
              >
                <option value="auto">Auto Detect</option>
                <option value="en-IN">English (India)</option>
                <option value="ta-IN">தமிழ் (Tamil)</option>
              </select>
            </div>
            
            <div className="settings-row">
              <span className="settings-row-label">Partner response</span>
              <select 
                className="settings-select"
                value={settings.responseLanguage || 'auto'}
                onChange={(e) => onSettingsChange({
                  ...settings,
                  responseLanguage: e.target.value as 'auto' | 'english' | 'tamil'
                })}
              >
                <option value="auto">Auto (Match input)</option>
                <option value="english">English always</option>
                <option value="tamil">தமிழ் always</option>
              </select>
            </div>
          </div>

          {/* Always Ready */}
          <div className="settings-group">
            <span className="settings-group-title">Always Ready</span>
            <div className="settings-row">
              <span className="settings-row-label">Background listening</span>
              <div
                className={`toggle-switch ${settings.alwaysReady ? 'on' : ''}`}
                onClick={() =>
                  onSettingsChange({ ...settings, alwaysReady: !settings.alwaysReady })
                }
                role="switch"
                aria-checked={settings.alwaysReady}
                tabIndex={0}
                aria-label="Always Ready toggle"
              >
                <div className="toggle-switch-knob" />
              </div>
            </div>
          </div>

          {/* Voice */}
          <div className="settings-group">
            <span className="settings-group-title">Voice</span>
            <div className="settings-row">
              <span className="settings-row-label">Voice selection</span>
              <span className="settings-row-value">Default</span>
            </div>
          </div>

          {/* Speech Speed */}
          <div className="settings-group">
            <span className="settings-group-title">Speech Speed</span>
            <div className="settings-row">
              <span className="settings-row-label">{settings.speechSpeed.toFixed(1)}×</span>
              <input
                type="range"
                className="settings-slider"
                min="0.8"
                max="1.2"
                step="0.1"
                value={settings.speechSpeed}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    speechSpeed: parseFloat(e.target.value),
                  })
                }
                aria-label="Speech speed"
              />
            </div>
          </div>

          {/* AI Model */}
          <div className="settings-group">
            <span className="settings-group-title">AI Model</span>
            <div className="settings-row">
              <span className="settings-row-label">Active model</span>
              <span className="settings-row-value accent">Gemini 3.6 Flash</span>
            </div>
          </div>

          {/* Microphone */}
          <div className="settings-group">
            <span className="settings-group-title">Microphone</span>
            <div className="settings-row">
              <span className="settings-row-label">Permission status</span>
              <span className="settings-row-value">{displayPermission}</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Input</span>
              <span className="settings-row-value">{isListening ? 'Active' : 'Inactive'}</span>
            </div>
          </div>

          {/* Privacy */}
          <div className="settings-group">
            <span className="settings-group-title">Privacy</span>
            <div className="settings-row">
              <span className="settings-row-label">Wake detection</span>
              <span className="settings-row-value accent">Web Speech API</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Pre-wake processing</span>
              <span className="settings-row-value accent">Browser speech recognition</span>
            </div>
            <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '0.5rem 1rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', lineHeight: 1.4 }}>
                Wake-word detection depends on browser speech-recognition availability and requires the Partner page to remain active.
              </span>
            </div>
          </div>

          {/* Notifications */}
          <div className="settings-group">
            <span className="settings-group-title">Notifications</span>
            <div className="settings-row">
              <span className="settings-row-label">Enable notifications</span>
              <div
                className={`toggle-switch ${settings.notificationsEnabled ? 'on' : ''}`}
                onClick={() =>
                  onSettingsChange({
                    ...settings,
                    notificationsEnabled: !settings.notificationsEnabled,
                  })
                }
                role="switch"
                aria-checked={settings.notificationsEnabled}
                tabIndex={0}
                aria-label="Notifications toggle"
              >
                <div className="toggle-switch-knob" />
              </div>
            </div>
          </div>

          {/* Platform Notice */}
          <div className="settings-group">
            <span className="settings-group-title">Platform</span>
            <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span className="settings-row-label" style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', lineHeight: 1.5 }}>
                The Web/PWA version supports voice interaction and wake-word detection
                while the application is actively running and the browser permits
                microphone access. Background wake-word availability depends on the
                browser and operating system. The native Android application is the
                primary always-ready mobile implementation.
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
