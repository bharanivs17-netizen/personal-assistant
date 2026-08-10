import { registry } from '@partner/tools';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const ALLOWED_APPS: Record<string, string> = {
  'calculator': 'calc.exe',
  'notepad': 'notepad.exe',
  'browser': 'start msedge'
};

export function registerAppTools() {
  registry.register({
    name: 'open_whitelisted_app',
    description: 'Opens a whitelisted application (calculator, notepad, browser)',
    execute: async (args: { appName: string }) => {
      try {
        if (process.platform === 'win32') {
          const appName = args?.appName?.toLowerCase();
          const cmd = ALLOWED_APPS[appName];
          
          if (!cmd) {
            return { success: false, message: `Application ${appName} is not in the allowed list.` };
          }
          
          exec(cmd); // Don't await since we don't want to block until app closes
          return { success: true, message: `Opening ${appName}.` };
        }
        return { success: false, message: 'Opening apps is not supported on this platform.' };
      } catch (error) {
        return { success: false, message: 'Failed to open application.' };
      }
    }
  });
}
