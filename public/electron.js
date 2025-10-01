const {
  app,
  BrowserWindow,
  ipcMain,
  nativeImage,
  Tray,
  Menu,
} = require("electron");
// const isDev = require("electron-is-dev");
const path = require("path");
const fs = require("fs");
const { machineIdSync } = require("node-machine-id");
const { startServer } = require(process.env.NODE_ENV === "development"
  ? "../server/app"
  : "./server/app");

const tokenPath = path.join(app?.getPath("userData"), "token.json");
const catracaPath = path.join(app?.getPath("userData"), "catraca.json");
const historicUserAccessPath = path.join(
  app?.getPath("userData"),
  "historic_user_access.json"
);

let mainWindow;
let tray;

function createWindow() {
  if (mainWindow) {
    mainWindow.show(); // já estava criada → só mostra
    return;
  }

  // const appIcon = new Tray(__dirname + "/logo.png");
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "..", "electron", "preload.js"), // Opcional
      contextIsolation: true, // ESSENCIAL
      nodeIntegration: false, // também é importante
    },
    icon: __dirname + "/logo.png",
  });

  // win.loadURL(
  //   isDev
  //     ? "http://localhost:3001"
  //     : `file://${path.join(__dirname, "../build/index.html")}`
  // ); // ou win.loadFile('index.html') em produção

  // if (process.env.NODE_ENV === "development") {
  //   mainWindow.loadURL("http://localhost:3001"); // React dev server
  // } else {
  //   mainWindow.loadFile("build/index.html"); // React build
  // }

  mainWindow.loadURL(
    app.isPackaged
      ? `file://${path.join(__dirname, "build/index.html")}` // produção
      : "http://localhost:3001" // dev
  );

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  startServer(); // Inicia o mini servidor Node no mesmo app
});

app.on("ready", () => {
  // cria tray
  tray = new Tray(path.join(__dirname, "/logo.png"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Abrir",
      click: () => createWindow(),
    },
    {
      label: "Sair",
      click: () => app.quit(),
    },
  ]);

  tray.setToolTip("TSI Gym Agent");
  tray.setContextMenu(contextMenu);
  // 🔹 não abre janela automaticamente → só quando o usuário clicar
});

app.on("window-all-closed", (event) => {
  // if (process.platform !== "darwin") app.quit();
  // impede que o Electron finalize quando todas janelas fecharem
  event.preventDefault();
});

app.on("activate", () => {
  if (!mainWindow) {
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
  const exists = fs.existsSync(tokenPath);
  return fs.existsSync(tokenPath)
    ? JSON.parse(fs.readFileSync(tokenPath, "utf-8"))
    : null;
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

// IPC para remove dados da catraca
ipcMain.handle("logout-catraca", () => {
  try {
    if (fs.existsSync(catracaPath)) fs.rmSync(catracaPath, { force: true });
    if (fs.existsSync(tokenPath)) fs.rmSync(tokenPath, { force: true });
    if (fs.existsSync(historicUserAccessPath))
      fs.rmSync(historicUserAccessPath, { force: true });
    // fs.writeFileSync(catracaPath, null);
    // fs.writeFileSync(tokenPath, null);
    // fs.writeFileSync(historicUserAccessPath, null);
    return true;
  } catch (err) {
    console.error("Erro ao remover arquivos:", err);
    return false;
  }
});

// IPC para salvar dados de acesso na catraca
ipcMain.on("save-historic-user-access", (event, data) => {
  fs.writeFileSync(historicUserAccessPath, JSON.stringify(data));
});

// IPC para ler dados de acesso na catraca
ipcMain.handle("get-historic-user-access", () => {
  if (!fs.existsSync(historicUserAccessPath)) return null;
  return JSON.parse(fs.readFileSync(historicUserAccessPath, "utf-8"));
});

ipcMain.handle("get-machine-id", async () => {
  return machineIdSync(true);
});
