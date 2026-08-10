'use client';

import { AssistantState } from '@partner/shared';

interface StatusTextProps {
  state: AssistantState;
}

/** Maps each state to its display text and CSS class */
function getStatusConfig(state: AssistantState): { text: string; className: string } {
  switch (state) {
    case AssistantState.OFF:
      return { text: 'Offline', className: '' };
    case AssistantState.READY:
      return { text: 'Say Hey Partner', className: '' };
    case AssistantState.WAKE_DETECTED:
      return { text: 'Yes?', className: 'active' };
    case AssistantState.LISTENING:
    case AssistantState.CONTINUOUS_LISTENING:
      return { text: 'Listening...', className: 'active' };
    case AssistantState.CONFIRMING:
      return { text: 'Waiting for confirmation...', className: 'active' };
    case AssistantState.PROCESSING:
      return { text: 'Processing...', className: 'active' };
    case AssistantState.SPEAKING:
      return { text: 'Speaking...', className: 'active' };
    case AssistantState.ERROR:
      return { text: 'Something went wrong', className: 'error' };
    case AssistantState.PERMISSION_REQUIRED:
      return { text: 'Microphone permission required', className: 'error' };
    case AssistantState.NO_NETWORK:
      return { text: "I'm offline right now", className: 'error' };
    case AssistantState.STOPPED:
      return { text: 'Listening paused', className: '' };
    default:
      return { text: '', className: '' };
  }
}

export default function StatusText({ state }: StatusTextProps) {
  const { text, className } = getStatusConfig(state);

  return (
    <p className={`status-text ${className}`} aria-live="polite">
      {text}
    </p>
  );
}
