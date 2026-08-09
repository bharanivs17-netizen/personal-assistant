/**
 * Partner — State Machine
 *
 * Defines valid state transitions for the Partner assistant.
 * No conflicting states are allowed. Every transition is explicit.
 */

import { AssistantState, AssistantEvent } from './types';

/** Map of valid transitions: [currentState][event] → nextState */
const TRANSITIONS: Partial<
  Record<AssistantState, Partial<Record<AssistantEvent, AssistantState>>>
> = {
  [AssistantState.OFF]: {
    [AssistantEvent.ENABLE]: AssistantState.READY,
  },

  [AssistantState.READY]: {
    [AssistantEvent.WAKE_WORD]: AssistantState.WAKE_DETECTED,
    [AssistantEvent.DISABLE]: AssistantState.STOPPED,
    [AssistantEvent.MIC_DENIED]: AssistantState.PERMISSION_REQUIRED,
    [AssistantEvent.NETWORK_LOST]: AssistantState.NO_NETWORK,
  },

  [AssistantState.WAKE_DETECTED]: {
    [AssistantEvent.ACKNOWLEDGE_DONE]: AssistantState.LISTENING,
  },

  [AssistantState.LISTENING]: {
    [AssistantEvent.SPEECH_RECOGNIZED]: AssistantState.PROCESSING,
    [AssistantEvent.SILENCE_TIMEOUT]: AssistantState.READY,
    [AssistantEvent.DISABLE]: AssistantState.STOPPED,
  },

  [AssistantState.PROCESSING]: {
    [AssistantEvent.AI_RESPONSE_READY]: AssistantState.SPEAKING,
    [AssistantEvent.AI_FAILURE]: AssistantState.ERROR,
  },

  [AssistantState.SPEAKING]: {
    [AssistantEvent.SPEECH_COMPLETE]: AssistantState.READY,
    [AssistantEvent.BARGE_IN]: AssistantState.LISTENING,
  },

  [AssistantState.ERROR]: {
    [AssistantEvent.ERROR_RECOVER]: AssistantState.READY,
  },

  [AssistantState.PERMISSION_REQUIRED]: {
    [AssistantEvent.MIC_GRANTED]: AssistantState.READY,
  },

  [AssistantState.NO_NETWORK]: {
    [AssistantEvent.NETWORK_RESTORED]: AssistantState.READY,
  },

  [AssistantState.STOPPED]: {
    [AssistantEvent.ENABLE]: AssistantState.READY,
  },
};

/**
 * Attempt a state transition.
 *
 * @returns The new state if the transition is valid, or null if the
 *          event is not allowed from the current state.
 */
export function transition(
  current: AssistantState,
  event: AssistantEvent
): AssistantState | null {
  const stateTransitions = TRANSITIONS[current];
  if (!stateTransitions) return null;

  const next = stateTransitions[event];
  return next ?? null;
}

/**
 * Check whether a transition is valid without performing it.
 */
export function canTransition(
  current: AssistantState,
  event: AssistantEvent
): boolean {
  return transition(current, event) !== null;
}

/**
 * Get all events that are valid from the current state.
 */
export function validEvents(current: AssistantState): AssistantEvent[] {
  const stateTransitions = TRANSITIONS[current];
  if (!stateTransitions) return [];
  return Object.keys(stateTransitions) as AssistantEvent[];
}
