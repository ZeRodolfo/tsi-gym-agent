const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  saveTokenData: (data) => ipcRenderer.send('save-token', data),
  getTokenData: () => ipcRenderer.invoke('get-token'),
  saveCatracaData: (data) => ipcRenderer.send('save-catraca', data),
  getCatracaData: () => ipcRenderer.invoke('get-catraca'),
});
