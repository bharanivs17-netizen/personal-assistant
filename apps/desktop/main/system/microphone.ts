import { registry } from '@partner/tools';

export function registerMicrophoneTools() {
  registry.register({
    name: 'partner_microphone_off',
    description: 'Turns off Partner\'s microphone',
    execute: async () => {
      // In a real desktop app, this might stop the native audio stream.
      // However, the actual Web Speech API stopping is handled in the UI renderer.
      return { success: true, message: 'Microphone disabled.' };
    }
  });

  registry.register({
    name: 'partner_microphone_on',
    description: 'Turns on Partner\'s microphone',
    execute: async () => {
      return { success: true, message: 'Microphone enabled.' };
    }
  });
}
