import { ipcMain } from 'electron';
import { registry } from '@partner/tools';
import { initializeSystemTools } from './system';

export function setupIpc() {
  initializeSystemTools();

  ipcMain.handle('execute-tool', async (event, toolName: string, args: any) => {
    return await registry.execute(toolName, args);
  });
}
