import { registry } from '@partner/tools';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export function registerBrightnessTools() {
  registry.register({
    name: 'brightness_down',
    description: 'Reduces the screen brightness',
    execute: async () => {
      try {
        if (process.platform === 'win32') {
          // Simplistic WMI approach - only works on internal laptop displays
          await execAsync(`powershell (Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1, 20)`);
          return { success: true, message: 'Brightness reduced.' };
        }
        return { success: false, message: 'Brightness control isn\'t available on this device.' };
      } catch (error) {
        return { success: false, message: 'Brightness control isn\'t available on this device.' };
      }
    }
  });

  registry.register({
    name: 'brightness_up',
    description: 'Increases the screen brightness',
    execute: async () => {
      try {
        if (process.platform === 'win32') {
          await execAsync(`powershell (Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1, 80)`);
          return { success: true, message: 'Brightness increased.' };
        }
        return { success: false, message: 'Brightness control isn\'t available on this device.' };
      } catch (error) {
        return { success: false, message: 'Brightness control isn\'t available on this device.' };
      }
    }
  });

  registry.register({
    name: 'brightness_set',
    description: 'Sets the screen brightness to a specific percentage',
    execute: async (args: { amount: number }) => {
      try {
        if (process.platform === 'win32' && args?.amount !== undefined) {
          await execAsync(`powershell (Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1, ${Math.min(100, Math.max(0, args.amount))})`);
          return { success: true, message: `Brightness set to ${args.amount} percent.` };
        }
        return { success: false, message: 'Brightness control isn\'t available on this device.' };
      } catch (error) {
        return { success: false, message: 'Brightness control isn\'t available on this device.' };
      }
    }
  });
}
