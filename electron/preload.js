const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  saveTokenData: (data) => ipcRenderer.send("save-token", data),
  getTokenData: () => ipcRenderer.invoke("get-token"),
  saveCatracaData: (data) => ipcRenderer.send("save-catraca", data),
  getCatracaData: () => ipcRenderer.invoke("get-catraca"),
  logoutCatracaData: () => ipcRenderer.invoke("logout-catraca"),
  saveHistoricUserAccessData: (data) =>
    ipcRenderer.send("save-historic-user-access", data),
  getHistoricUserAccessData: () =>
    ipcRenderer.invoke("get-historic-user-access"),
  // getMachineId: () => ipcRenderer.invoke("get-machine-id"),
});

contextBridge.exposeInMainWorld("system", {
  getMachineId: () => ipcRenderer.invoke("get-machine-id"),
});

contextBridge.exposeInMainWorld("printerAPI", {
  print: (text) => ipcRenderer.invoke("printer:print", text),
});
