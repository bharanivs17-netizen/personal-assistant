import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('partnerDesktop', {
  executeTool: (toolName: string, args?: any) => ipcRenderer.invoke('execute-tool', toolName, args),
});
