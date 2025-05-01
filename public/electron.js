const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { startServer } = require("./server/app");

const tokenPath = path.join(app.getPath("userData"), "token.json");
const catracaPath = path.join(app.getPath("userData"), "catraca.json");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "..", "electron", "preload.js"), // Opcional
      contextIsolation: true, // ESSENCIAL
      nodeIntegration: false, // também é importante
    },
  });

  win.loadURL("http://localhost:3000"); // ou win.loadFile('index.html') em produção
}

app.whenReady().then(() => {
  createWindow();
  startServer(); // Inicia o mini servidor Node no mesmo app
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC para salvar token
ipcMain.on("save-token", (event, data) => {
  fs.writeFileSync(
    tokenPath,
    JSON.stringify({ ...data, lastCheck: new Date().toISOString() })
  );
});

// IPC para ler token
ipcMain.handle("get-token", () => {
  if (!fs.existsSync(tokenPath)) return null;
  return JSON.parse(fs.readFileSync(tokenPath, "utf-8"));
});

// IPC para salvar dados da catraca
ipcMain.on("save-catraca", (event, data) => {
  fs.writeFileSync(catracaPath, JSON.stringify(data));
});

// IPC para ler dados da catraca
ipcMain.handle("get-catraca", () => {
  if (!fs.existsSync(catracaPath)) return null;
  return JSON.parse(fs.readFileSync(catracaPath, "utf-8"));
});
