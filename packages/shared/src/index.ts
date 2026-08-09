/**
 * @partner/shared — Public API
 */

export {
  AssistantState,
  AssistantEvent,
  DEFAULT_SETTINGS,
  type PartnerSettings,
  type ChatMessage,
  type MicPermissionStatus,
} from './types';

export { transition, canTransition, validEvents } from './state-machine';
