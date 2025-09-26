const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  // Atualizações: ouvir status e disparar ações
  onUpdateStatus: (cb) => {
    const listener = (_evt, data) => { try { cb && cb(data); } catch(_) {} };
    ipcRenderer.on('update-status', listener);
    return () => ipcRenderer.removeListener('update-status', listener);
  },
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  restartAndInstall: () => ipcRenderer.invoke('restart-and-install')
  , debugGetLatestYml: () => ipcRenderer.invoke('debug-get-latest-yml')
  , debugForceCheck: () => ipcRenderer.invoke('debug-force-check')
  , debugClearUpdaterCache: () => ipcRenderer.invoke('debug-clear-updater-cache')
});
