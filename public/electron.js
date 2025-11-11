const {
  app,
  BrowserWindow,
  ipcMain,
  nativeImage,
  Tray,
  Menu,
  Notification,
} = require("electron");
// const isDev = require("electron-is-dev");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { machineIdSync } = require("node-machine-id");
const { startServer } = require(process.env.NODE_ENV === "development"
  ? "../server/app"
  : "./server/app");
const { exec } = require("child_process");
// const ThermalPrinter = require("node-thermal-printer");
// const USB = require("escpos-usb");

const { isPortInUse } = require("./utils/isPortInUse");
const { Printer, Image } = require("@node-escpos/core");
const USB = require("@node-escpos/usb-adapter");
const {
  ThermalPrinter,
  PrinterTypes,
  BreakLine,
} = require("node-thermal-printer");
// const PrinterTypes = require("node-thermal-printer").types;
const Network = require("escpos-network");
const { Jimp, ResizeStrategy } = require("jimp");
// const printerTouchID = require("./printers/touchID");
const logger = require(process.env.NODE_ENV === "development"
  ? "../server/utils/logger"
  : "./server/utils/logger"); // Importe o logger configurado

const { formatCNPJ } = require("./libs/string");
const AutoLaunch = require("electron-auto-launch");

app.setAppUserModelId("br.com.tsitech.gym");
app.setName("TSI Gym Agente"); // ou o nome da sua aplicação

const tokenPath = path.join(app?.getPath("userData"), "token.json");
const catracaPath = path.join(app?.getPath("userData"), "catraca.json");
const historicUserAccessPath = path.join(
  app?.getPath("userData"),
  "historic_user_access.json"
);

const PORT = process.env.API_PORT || 4000;

let mainWindow;
let tray;
let splashWindow;

// Desative logs e devtools em produção:
// mainWindow.webContents.closeDevTools();
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: false,
    show: false,
  });

  // mainWindow.loadURL(
  //   app.isPackaged
  //     ? `file://${path.join(__dirname, "index.html")}` // produção
  //     : "http://localhost:3001" // dev
  // );

  splashWindow.loadURL(`file://${path.join(__dirname, "index.html")}`);
  // splashWindow.loadFile(path.join(__dirname, "splash.html"));
  splashWindow.once("ready-to-show", () => splashWindow.show());
}

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
      ? `file://${path.join(__dirname, "index.html")}` // produção
      : "http://localhost:3001" // dev
  );

  // mostra só quando o conteúdo estiver pronto
  mainWindow.once("ready-to-show", () => {
    if (splashWindow) splashWindow.close();
    splashWindow = null;
    mainWindow.show();
  });

  mainWindow.on("close", (event) => {
    console.log("Fechando a janela...", app.isQuiting, event);
    // Em vez de fechar, apenas esconde a janela (fica em background)
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// function showApp() {
//   if (mainWindow) {
//     if (mainWindow.isMinimized()) mainWindow.restore();
//     mainWindow.show();
//     mainWindow.focus();
//   } else {
//     createWindow();
//   }
// }

function createTray() {
  tray = new Tray(path.join(__dirname, "logo.png"));
  const contextMenu = Menu.buildFromTemplate([
    // { label: "Abrir", click: () => showApp() },
    { label: "Abrir", click: () => mainWindow.show() },
    {
      label: "Sair",
      click: () => {
        app.isQuiting = true;
        if (tray) {
          tray.destroy(); // 🔥 remove o ícone da bandeja
          tray = null;
        }

        app.quit();
      },
    },
  ]);

  tray.setToolTip("TSI Gym Agente");
  tray.setContextMenu(contextMenu);
  // tray.on("click", () => showApp()); // abre com clique esquerdo
  // Clique duplo no ícone da bandeja mostra a janela
  tray.on("double-click", () => {
    mainWindow.show();
  });
}

// app.whenReady().then(async () => {
//   createTray();
//   createSplashWindow();
//   createWindow();

//   const portBusy = await isPortInUse(PORT);
//   if (portBusy) {
//     logger.info(
//       `⚠️ Servidor já está rodando na porta ${PORT}, não será iniciado novamente.`
//     );
//   } else {
//     logger.info(`🚀 Iniciando servidor local na porta ${PORT}...`);
//     startServer();
//   }
// });

// app.whenReady().then(async () => {
//   createWindow();

//   const portBusy = await isPortInUse(PORT);
//   if (portBusy) {
//     logger.info(
//       `⚠️ Servidor já está rodando na porta ${PORT}, não será iniciado novamente.`
//     );
//   } else {
//     logger.info(`🚀 Iniciando servidor local na porta ${PORT}...`);
//     startServer();
//   }

//   // startServer(); // Inicia o mini servidor Node no mesmo app, verificar se a porta ou o servidor já esta de pé
// });

// app.on("ready", () => {
//   // cria tray
//   tray = new Tray(path.join(__dirname, "/logo.png"));
//   const contextMenu = Menu.buildFromTemplate([
//     {
//       label: "Abrir",
//       click: () => showApp(),
//     },
//     {
//       label: "Sair",
//       click: () => app.quit(),
//     },
//   ]);

//   tray.setToolTip("TSI Gym Agent");
//   tray.setContextMenu(contextMenu);
//   // 🔹 não abre janela automaticamente → só quando o usuário clicar

//   // 🔹 Clique esquerdo → abre a janela direto
//   tray.on("click", () => {
//     showApp();
//   });
// });

// 🔔 Função utilitária para mostrar notificações
function showNotification({ title, body, imagePath, iconPath, base64Image }) {
  let notificationOptions = {
    title,
    subtitle: "TSI",
    body,
    closeButtonText: "Fechar",
    icon: iconPath ? path.resolve(iconPath) : path.join(__dirname, "logo.png"),
    sound: true,
    silent: false,
    timeoutType: "default",
    urgency: "normal",
    actions: [{ type: "button", text: "Ver histórico" }],
  };

  // ⚙️ Se foi passada uma imagem (foto), adiciona ao corpo
  if (imagePath && fs.existsSync(imagePath)) {
    const image = nativeImage.createFromPath(path.resolve(imagePath));
    notificationOptions = { ...notificationOptions, image };
  }

  if (base64Image) {
    console.log("Adicionando imagem base64 na notificação", base64Image);
    // Remove o prefixo "data:image/...;base64," se existir
    const cleanedBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
    // Cria caminho temporário
    const tempPath = path.join(app.getPath("temp"), `notif-${Date.now()}.png`);
    const imageBuffer = Buffer.from(cleanedBase64, "base64");
    fs.writeFileSync(tempPath, imageBuffer);

    console.log("Imagem temporária criada em:", tempPath);
    notificationOptions = {
      ...notificationOptions,
      icon: tempPath, // caminho local
    };

    // (opcional) remove depois de um tempo
    setTimeout(() => fs.existsSync(tempPath) && fs.unlinkSync(tempPath), 60000);
  }

  const notify = new Notification(notificationOptions);
  notify.on("click", () => {
    console.log("Notificação clicada!", mainWindow);
    mainWindow.show();
  });

  notify.on("action", (event, index) => {
    if (index === 0) {
      console.log('Usuário clicou em "Ver histórico"');
    }
  });

  notify.show();
}

if (process.env.NODE_ENV !== "development") {
  const autoLauncher = new AutoLaunch({
    name: "TSI Gym Agente",
    path: app.getPath("exe"),
  });

  autoLauncher.isEnabled().then((enabled) => {
    if (!enabled) autoLauncher.enable();
  });
}

// --- EVITA MÚLTIPLAS INSTÂNCIAS ---
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit(); // já existe uma instância, encerra essa nova
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // se o usuário tentar abrir novamente, traz a janela existente para frente
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // app.whenReady().then(createWindow);

  app.whenReady().then(async () => {
    createWindow();
    createTray();

    const portBusy = await isPortInUse(PORT);
    if (portBusy) {
      logger.info(
        `⚠️ Servidor já está rodando na porta ${PORT}, não será iniciado novamente.`
      );
    } else {
      logger.info(`🚀 Iniciando servidor local na porta ${PORT}...`);
      const appServer = startServer();

      // Exemplo: rota para emitir notificações
      appServer.post("/api/notify", (req, res) => {
        const { title, message, picture } = req.body;
        if (!title || !message) {
          return res
            .status(400)
            .json({ error: "Campos title e message são obrigatórios" });
        }

        showNotification({ title, body: message, base64Image: picture });
        return res.json({ success: true });
      });

      // Exemplo: rota simulando liberação de catraca
      appServer.post("/api/catraca/liberada", (req, res) => {
        const { user } = req.body;
        showNotification({
          title: "Catraca liberada",
          body: `Acesso autorizado para ${user || "usuário desconhecido"}`,
        });
        res.json({ status: "ok" });
      });
    }

    // Mostra a janela na primeira execução
    mainWindow.show();

    // ✅ Exemplo: mostrar notificação ao iniciar
    showNotification({
      title: "Aplicativo iniciado",
      body: "O Agente foi inicializado com sucesso.",
    });
  });

  app.on("activate", () => {
    // No macOS, reabre a janela se o app estiver no dock
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on("window-all-closed", () => {
    // não encerra no Windows nem no macOS, continua em segundo plano
    if (process.platform !== "darwin") {
      // app.quit(); // comente isso para manter em background
    }
  });

  app.on("before-quit", () => {
    app.isQuiting = true;
  });

  // app.on("window-all-closed", (event) => {
  //   // if (process.platform !== "darwin") app.quit();
  //   // impede que o Electron finalize quando todas janelas fecharem
  //   event.preventDefault();
  // });

  // app.on("activate", () => {
  //   if (!mainWindow) {
  //     createWindow();
  //   }
  // });
}

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

async function resizeLogo(input, outputPath, maxWidth = 384) {
  // 58mm → use 384px
  // 80mm → use 512px
  const MAX_WIDTH = maxWidth || 384; // Largura máxima da impressora (pode testar 512 também)
  // const image = await Jimp.read(input);

  let image;

  // Detecta se o input é base64 ou um caminho de arquivo
  if (typeof input === "string" && input.startsWith("data:image")) {
    // Base64 → converte para buffer
    const base64Data = input.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    image = await Jimp.read(buffer);
  } else {
    // Caminho normal
    image = await Jimp.read(input);
  }

  // Redimensiona proporcionalmente para caber na largura da impressora
  image.resize({ w: MAX_WIDTH, mode: ResizeStrategy.BEZIER });
  // Converte para preto e branco (impressora térmica imprime apenas 1 bit)
  image.greyscale().contrast(1).brightness(0.1);
  // Salva a nova imagem pronta para impressão
  await image.write(outputPath);

  console.log(`✅ Logo redimensionada e salva em: ${outputPath}`);
}

const getPrinter = async (setup) => {
  const platform = os.platform(); // retorna "win32", "linux", "darwin", etc.

  // Define interface da impressora conforme o sistema operacional
  let printerInterface;

  if (setup?.connectionType === "network") {
    printerInterface = `tcp://${setup.ipAddress}:${setup.port}`;
  } else {
    if (platform === "win32") {
      if (setup?.connectionType === "usb") {
        // No Windows, use o nome da impressora registrada no sistema
        printerInterface = `printer:${setup.name}`;
      }
    } else if (platform === "linux") {
      // No Linux, use o caminho USB ou nome CUPS
      printerInterface = "dummy";
    } else {
      printerInterface = "printer:Generic";
    }
  }

  const printer = new ThermalPrinter({
    type: setup?.type || PrinterTypes.EPSON,
    interface: printerInterface,
    // driver: platform === "win32" ? require("printer") : undefined, // opcional

    // type: PrinterTypes.EPSON,
    // interface: "tcp://192.168.18.34:9100",
    // interface: "printer:IDPRINT",
    characterSet: "PC860_PORTUGUESE",
    breakLine: BreakLine.WORD,
    // interface: "dummy", // não definimos aqui
  });

  const originalLogoPath =
    setup?.company?.logo || path.join(__dirname, "logo.png");
  const resizeLogoPath = path.join(app.getPath("temp"), "logo-printer.png");
  await resizeLogo(originalLogoPath, resizeLogoPath, 192);

  printer.alignCenter();
  await printer.printImage(resizeLogoPath);

  printer.setTypeFontA();
  printer.setTextNormal();

  printer.println(
    setup?.company?.fantasyName ||
      setup?.company?.companyName ||
      setup?.company?.name ||
      "TSI Tech"
  );

  if (setup?.company?.address?.street)
    printer.println(
      [
        setup?.company?.address?.street,
        setup?.company?.address?.number || "S/N",
      ].join(", ")
    );
  if (setup?.company?.address?.city && setup?.company?.address?.state)
    printer.println(
      [setup?.company?.address?.city, setup?.company?.address?.state].join(
        " / "
      )
    );
  if (setup?.company?.cnpj)
    printer.println("CNPJ: " + formatCNPJ(setup?.company?.cnpj));
  printer.drawLine();
  printer.newLine();
  return printer;
};

const print = async (setup, printer) => {
  if (setup?.autoCut) {
    if (setup?.partialCut) printer.partialCut(); // cortar o papel parcialmente
    else printer.cut();
  }

  const platform = os.platform(); // retorna "win32", "linux", "darwin", etc.

  if (setup?.connectionType === "network" || platform === "win32") {
    logger.info("✅ Impressão enviada com sucesso!");
    return await printer.execute();
  } else {
    const buffer = printer.getBuffer();
    // salva o buffer temporariamente
    const tempFile = path.join(app.getPath("temp"), "print_job.bin");
    fs.writeFileSync(tempFile, buffer);

    // envia para a impressora configurada no CUPS apenas
    const printerName = setup?.name || "IDPRINT"; // nome exato retornado por `lpstat -p`

    return new Promise((resolve, reject) =>
      exec(`lp -d ${printerName} -o raw ${tempFile}`, (err, stdout, stderr) => {
        if (err) {
          logger.error("Erro ao imprimir:", err);
          reject(err);
        } else {
          logger.info("Impressão enviada com sucesso!");
          resolve(true);
        }
      })
    );
  }
};

const printerCashReceipt = async (setup, payload) => {
  try {
    const printer = await getPrinter(setup);
    printer.bold(true);
    printer.alignLeft();
    printer.print("Relatório do Caixa: ");
    printer.bold(false);
    printer.print(payload?.cashier?.name);
    printer.newLine();

    printer.print("PERÍODO DE ");
    printer.bold(true);
    printer.print(payload?.openedAt);
    printer.bold(false);
    printer.print(" ATÉ ");
    printer.bold(true);
    printer.print(payload?.closedAt);
    printer.bold(false);

    printer.newLine();
    printer.newLine();
    printer.alignRight();

    printer.print("Fundo de Caixa: ");
    printer.bold(true);
    printer.print(payload?.initialAmount);
    printer.bold(false);
    printer.newLine();
    printer.print("Receitas: ");
    printer.bold(true);
    printer.print(payload?.cashIn);
    printer.bold(false);
    printer.newLine();
    printer.print("Despesas: ");
    printer.bold(true);
    printer.print(`-${payload?.cashOut}`);
    printer.bold(false);
    printer.newLine();

    // if (!payload?.isClosedAt)
    printer.println("-------------");

    printer.print("Saldo: ");
    printer.bold(true);
    printer.print(payload?.total);
    printer.bold(false);

    // if (payload?.isFinalAmount) {
    //   printer.newLine();
    //   printer.println("-------------");
    //   printer.print("Valor Final: ");
    //   printer.bold(true);
    //   printer.print(payload?.finalAmount);
    //   printer.bold(false);
    //   printer.newLine();
    //   printer.print("Diferença: ");
    //   printer.bold(true);
    //   printer.print(payload?.difference);
    //   printer.bold(false);
    // }

    printer.newLine();
    printer.newLine();
    printer.alignCenter();
    printer.println("________________________________");
    printer.println("Assinatura");
    printer.newLine();
    printer.println(payload?.signAt);
    await print(setup, printer);
  } catch (err) {
    console.log("Erro ao imprimir:", err);
  }
};

const printerCashResumeMovement = async (setup, payload) => {
  try {
    const printer = await getPrinter(setup);

    printer.tableCustom([
      { text: "Data", align: "LEFT", width: 0.25, bold: true },
      { text: "Descrição", align: "LEFT", width: 0.5, bold: true },
      { text: "Valor", align: "RIGHT", width: 0.25, bold: true },
    ]);

    payload?.items?.forEach((item) => {
      printer.tableCustom([
        { text: item?.description, align: "LEFT", width: 0.5, bold: false },
        { text: item?.dueDate, align: "CENTER", width: 0.25, bold: false },
        { text: item?.price, align: "RIGHT", width: 0.25, bold: false },
      ]);
    });

    printer.newLine();
    printer.newLine();
    printer.alignCenter();

    printer.println("________________________________");
    printer.println("Assinatura");
    printer.newLine();

    printer.println(payload?.signAt);
    await print(setup, printer);
  } catch (err) {
    console.error("Erro ao imprimir:", err);
  }
};

const printerCashMovement = async (setup, payload) => {
  try {
    const printer = await getPrinter(setup);
    printer.bold(true);
    printer.println("Recibo");
    printer.bold(false);
    printer.print(payload?.id);
    printer.newLine();
    printer.newLine();

    printer.alignLeft();

    printer.bold(true);
    printer.println("Tipo do Movimento:");
    printer.bold(false);
    printer.print(`${payload?.type} de `);
    printer.bold(true);
    printer.print(payload?.value);
    printer.bold(false);
    printer.newLine();
    printer.newLine();

    printer.bold(true);
    printer.println("Motivo:");
    printer.bold(false);
    printer.println(payload?.reason);
    printer.newLine();

    printer.bold(true);
    printer.print("Data: ");
    printer.bold(false);
    printer.print(payload?.createdAt);

    printer.newLine();
    printer.newLine();
    printer.alignCenter();

    printer.println("________________________________");
    printer.println("Assinatura");
    printer.newLine();

    printer.println(payload?.signAt);
    await print(setup, printer);
  } catch (err) {
    console.error("Erro ao imprimir:", err);
  }
};

const printerPayment = async (setup, payload, via = 1) => {
  try {
    const printer = await getPrinter(setup);
    printer.bold(true);
    if (payload?.isRefunded) printer.println("Recibo (ESTORNADO):");
    else printer.println("Recibo:");

    printer.bold(false);
    printer.print(payload?.id);
    printer.newLine();
    printer.newLine();

    printer.alignLeft();

    printer.print("Recebemos de ");
    printer.bold(true);
    printer.print(payload?.studentName);
    printer.bold(false);
    printer.print(` de CPF ${payload?.cpf}`);
    printer.newLine();
    printer.print("O valor de ");
    printer.bold(true);
    printer.print(payload?.totalPaid);
    printer.bold(false);
    printer.println(" referente as descrições listadas abaixo:");
    printer.newLine();

    printer.tableCustom([
      { text: "Descrição", align: "LEFT", width: 0.5, bold: true },
      { text: "Vencimento", align: "CENTER", width: 0.25, bold: true },
      { text: "Valor", align: "RIGHT", width: 0.25, bold: true },
    ]);

    payload?.items?.forEach((item) => {
      printer.tableCustom([
        { text: item?.description, align: "LEFT", width: 0.5, bold: false },
        { text: item?.dueDate, align: "CENTER", width: 0.25, bold: false },
        { text: item?.price, align: "RIGHT", width: 0.25, bold: false },
      ]);
    });

    printer.newLine();
    printer.println(`Data: ${payload?.paymentDate}`);
    printer.drawLine();
    printer.tableCustom([
      { text: "Forma de Pagamento", align: "LEFT", width: 0.75, bold: true },
      { text: "Valor", align: "RIGHT", width: 0.25, bold: true },
    ]);

    payload?.paymentMethods?.forEach((item) => {
      printer.tableCustom([
        {
          text: item.refunded
            ? [item.method, "(ESTORNADO)"].join(" ")
            : item.method,
          align: "LEFT",
          width: 0.75,
          bold: false,
        },
        {
          text: item.price,
          align: "RIGHT",
          width: 0.25,
          bold: false,
        },
      ]);
    });
    printer.drawLine();
    printer.tableCustom([
      { text: "DESCONTO", align: "LEFT", width: 0.5, bold: false },
      { text: payload?.discount, align: "RIGHT", width: 0.5, bold: false },
    ]);
    printer.tableCustom([
      { text: "TOTAL A PAGAR", align: "LEFT", width: 0.5, bold: false },
      { text: payload?.totalPrice, align: "RIGHT", width: 0.5, bold: false },
    ]);
    printer.tableCustom([
      { text: "VALOR PAGO", align: "LEFT", width: 0.5, bold: false },
      { text: payload?.totalPaid, align: "RIGHT", width: 0.5, bold: false },
    ]);

    if (payload?.isTotalRefunded)
      printer.tableCustom([
        { text: "TROCO", align: "LEFT", width: 0.5, bold: false },
        {
          text: payload?.totalRefunded,
          align: "RIGHT",
          width: 0.5,
          bold: false,
        },
      ]);

    printer.newLine();
    printer.newLine();
    printer.alignCenter();
    printer.println("________________________________");
    printer.println(`Assinatura (${via}º via)`);
    printer.newLine();
    printer.print(payload?.signAt);
    await print(setup, printer);
  } catch (err) {
    console.error("Erro ao imprimir:", err);
  }
};

const printerTest = async (setup, payload) => {
  try {
    const printer = await getPrinter(setup);
    printer.bold(true);
    printer.println("Texto de teste:");
    printer.bold(false);
    printer.println(payload.text);
    return await print(setup, printer);
  } catch (err) {
    console.error("Erro ao imprimir:", err);
    throw err;
  }
};

// Exemplo: ouvindo chamada do Renderer
ipcMain.on("printer:print", async (_, setup, type, payload) => {
  console.log("Payload recebido para impressão:", { type, payload });

  return new Promise(async (resolve, reject) => {
    try {
      if (type === "test") return await printerTest(setup, payload);
      if (type === "cashMovement")
        return await printerCashMovement(setup, payload);
      if (type === "cashReceipt")
        return await printerCashReceipt(setup, payload);
      if (type === "payment") {
        // const current = payload?.via || 1;
        // for (let via = 1; via <= current; via++) {
        //   await printerPayment(setup, payload, via);
        // }
        return await printerPayment(setup, payload, payload?.via);
      }
      if (type === "cashResumeMovement")
        return await printerCashResumeMovement(setup, payload);
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
});
