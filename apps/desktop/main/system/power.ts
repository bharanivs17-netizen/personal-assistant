import { registry } from '@partner/tools';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export function registerPowerTools() {
  registry.register({
    name: 'shutdown_computer',
    description: 'Shuts down the PC',
    requiresConfirmation: true,
    execute: async () => {
      try {
        if (process.platform === 'win32') {
          await execAsync('shutdown /s /t 0');
          return { success: true, message: 'Shutting down your computer.' };
        } else if (process.platform === 'darwin') {
          await execAsync('osascript -e \'tell app "System Events" to shut down\'');
          return { success: true, message: 'Shutting down your Mac.' };
        }
        return { success: false, message: 'Unsupported platform for shutdown.' };
      } catch (error) {
        return { success: false, message: 'Failed to shut down.' };
      }
    }
  });

  registry.register({
    name: 'restart_computer',
    description: 'Restarts the PC',
    requiresConfirmation: true,
    execute: async () => {
      try {
        if (process.platform === 'win32') {
          await execAsync('shutdown /r /t 0');
          return { success: true, message: 'Restarting your computer.' };
        } else if (process.platform === 'darwin') {
          await execAsync('osascript -e \'tell app "System Events" to restart\'');
          return { success: true, message: 'Restarting your Mac.' };
        }
        return { success: false, message: 'Unsupported platform for restart.' };
      } catch (error) {
        return { success: false, message: 'Failed to restart.' };
      }
    }
  });

  registry.register({
    name: 'lock_computer',
    description: 'Locks the PC',
    requiresConfirmation: false,
    execute: async () => {
      try {
        if (process.platform === 'win32') {
          await execAsync('rundll32.exe user32.dll,LockWorkStation');
          return { success: true, message: 'Locking your computer.' };
        } else if (process.platform === 'darwin') {
          await execAsync('pmset displaysleepnow'); // Close enough to lock
          return { success: true, message: 'Locking your Mac.' };
        }
        return { success: false, message: 'Unsupported platform for lock.' };
      } catch (error) {
        return { success: false, message: 'Failed to lock.' };
      }
    }
  });

  registry.register({
    name: 'sleep_computer',
    description: 'Puts the PC to sleep',
    requiresConfirmation: true,
    execute: async () => {
      try {
        if (process.platform === 'win32') {
          await execAsync('rundll32.exe powrprof.dll,SetSuspendState 0,1,0');
          return { success: true, message: 'Putting your computer to sleep.' };
        } else if (process.platform === 'darwin') {
          await execAsync('pmset sleepnow');
          return { success: true, message: 'Putting your Mac to sleep.' };
        }
        return { success: false, message: 'Unsupported platform for sleep.' };
      } catch (error) {
        return { success: false, message: 'Failed to put to sleep.' };
      }
    }
  });
}
