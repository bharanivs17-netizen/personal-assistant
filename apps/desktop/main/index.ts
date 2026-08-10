import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { setupIpc } from './ipc';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the Next.js web app running locally (or build static if configured)
  mainWindow.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
  setupIpc();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
