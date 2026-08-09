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
          {/* Wake Word */}
          <div className="settings-group">
            <span className="settings-group-title">Wake Word</span>
            <div className="settings-row">
              <span className="settings-row-label">Activation phrase</span>
              <span className="settings-row-value accent">Hey Partner</span>
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
