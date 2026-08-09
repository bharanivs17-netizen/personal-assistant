'use client';

interface ListeningToggleProps {
  isOn: boolean;
  onToggle: () => void;
}

export default function ListeningToggle({ isOn, onToggle }: ListeningToggleProps) {
  return (
    <button
      id="listening-toggle"
      className={`listening-toggle ${isOn ? 'on' : ''}`}
      onClick={onToggle}
      aria-label={`Listening ${isOn ? 'on' : 'off'}`}
      aria-pressed={isOn}
    >
      <span className="toggle-icon">{isOn ? '🎤' : '🔇'}</span>
      <span className={`toggle-label ${isOn ? 'on' : ''}`}>
        Listening: {isOn ? 'ON' : 'OFF'}
      </span>
      <div className={`toggle-switch ${isOn ? 'on' : ''}`}>
        <div className="toggle-switch-knob" />
      </div>
    </button>
  );
}
