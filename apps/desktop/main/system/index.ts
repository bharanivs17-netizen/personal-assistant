import { registerBrightnessTools } from './brightness';
import { registerPowerTools } from './power';
import { registerVolumeTools } from './volume';
import { registerMicrophoneTools } from './microphone';
import { registerAppTools } from './apps';

export function initializeSystemTools() {
  registerBrightnessTools();
  registerPowerTools();
  registerVolumeTools();
  registerMicrophoneTools();
  registerAppTools();
}
