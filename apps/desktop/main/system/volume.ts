import { registry } from '@partner/tools';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export function registerVolumeTools() {
  registry.register({
    name: 'volume_up',
    description: 'Increases the system volume',
    execute: async () => {
      try {
        if (process.platform === 'win32') {
          // SendKeys 175 is Volume Up
          await execAsync(`powershell -c (new-object -com wscript.shell).SendKeys([char]175)`);
          return { success: true, message: 'Volume increased.' };
        }
        return { success: false, message: 'Volume control isn\'t available on this device.' };
      } catch (error) {
        return { success: false, message: 'Failed to increase volume.' };
      }
    }
  });

  registry.register({
    name: 'volume_down',
    description: 'Decreases the system volume',
    execute: async () => {
      try {
        if (process.platform === 'win32') {
          // SendKeys 174 is Volume Down
          await execAsync(`powershell -c (new-object -com wscript.shell).SendKeys([char]174)`);
          return { success: true, message: 'Volume decreased.' };
        }
        return { success: false, message: 'Volume control isn\'t available on this device.' };
      } catch (error) {
        return { success: false, message: 'Failed to decrease volume.' };
      }
    }
  });

  registry.register({
    name: 'volume_mute',
    description: 'Mutes the system volume',
    execute: async () => {
      try {
        if (process.platform === 'win32') {
          // SendKeys 173 is Volume Mute
          await execAsync(`powershell -c (new-object -com wscript.shell).SendKeys([char]173)`);
          return { success: true, message: 'Volume muted.' };
        }
        return { success: false, message: 'Volume control isn\'t available on this device.' };
      } catch (error) {
        return { success: false, message: 'Failed to mute volume.' };
      }
    }
  });
  
  registry.register({
    name: 'volume_unmute',
    description: 'Unmutes the system volume',
    execute: async () => {
      try {
        if (process.platform === 'win32') {
          // SendKeys 173 toggles mute
          await execAsync(`powershell -c (new-object -com wscript.shell).SendKeys([char]173)`);
          return { success: true, message: 'Volume unmuted.' };
        }
        return { success: false, message: 'Volume control isn\'t available on this device.' };
      } catch (error) {
        return { success: false, message: 'Failed to unmute volume.' };
      }
    }
  });
}
